import { IPv4 } from './IPv4.ts'
import { ipv6Regexes } from './constants.ts'
import { IP, RangeList } from './types.ts'
import { subnetMatch, expandIPv6, matchCIDR } from './utils.ts'

export class IPv6 implements IP {
  parts: number[]
  zoneId?: string

  #SpecialRanges: RangeList<IPv6> = {
    // RFC4291, here and after
    unspecified: [new IPv6([0, 0, 0, 0, 0, 0, 0, 0]), 128],
    linkLocal: [new IPv6([0xfe80, 0, 0, 0, 0, 0, 0, 0]), 10],
    multicast: [new IPv6([0xff00, 0, 0, 0, 0, 0, 0, 0]), 8],
    loopback: [new IPv6([0, 0, 0, 0, 0, 0, 0, 1]), 128],
    uniqueLocal: [new IPv6([0xfc00, 0, 0, 0, 0, 0, 0, 0]), 7],
    ipv4Mapped: [new IPv6([0, 0, 0, 0, 0, 0xffff, 0, 0]), 96],
    // RFC6145
    rfc6145: [new IPv6([0, 0, 0, 0, 0xffff, 0, 0, 0]), 96],
    // RFC6052
    rfc6052: [new IPv6([0x64, 0xff9b, 0, 0, 0, 0, 0, 0]), 96],
    // RFC3056
    '6to4': [new IPv6([0x2002, 0, 0, 0, 0, 0, 0, 0]), 16],
    // RFC6052, RFC6146
    teredo: [new IPv6([0x2001, 0, 0, 0, 0, 0, 0, 0]), 32],
    // RFC4291
    reserved: [[new IPv6([0x2001, 0xdb8, 0, 0, 0, 0, 0, 0]), 32]],
    benchmarking: [new IPv6([0x2001, 0x2, 0, 0, 0, 0, 0, 0]), 48],
    amt: [new IPv6([0x2001, 0x3, 0, 0, 0, 0, 0, 0]), 32],
    as112v6: [new IPv6([0x2001, 0x4, 0x112, 0, 0, 0, 0, 0]), 48],
    deprecated: [new IPv6([0x2001, 0x10, 0, 0, 0, 0, 0, 0]), 28],
    orchid2: [new IPv6([0x2001, 0x20, 0, 0, 0, 0, 0, 0]), 28],
  }

  constructor(parts: number[], zoneId?: string) {
    let i: number, part: number

    if (parts.length === 16) {
      this.parts = []
      for (i = 0; i <= 14; i += 2) {
        this.parts.push((parts[i] << 8) | parts[i + 1])
      }
    } else if (parts.length === 8) this.parts = parts
    else throw new Error('ipaddr: ipv6 part count should be 8 or 16')

    for (i = 0; i < this.parts.length; i++) {
      part = this.parts[i]
      if (!(0 <= part && part <= 0xffff))
        throw new Error('ipaddr: ipv6 part should fit in 16 bits')
    }

    this.zoneId = zoneId
  }
  kind(): 'ipv6' {
    return 'ipv6'
  }
  range() {
    return subnetMatch(this, this.#SpecialRanges)
  }
  isIPv4MappedAddress() {
    return this.range() === 'ipv4Mapped'
  }

  toIPv4Address() {
    if (!this.isIPv4MappedAddress())
      throw new Error(
        'ipaddr: trying to convert a generic ipv6 address to ipv4'
      )

    const ref = this.parts.slice(-2)
    const high = ref[0]
    const low = ref[1]

    return new IPv4([high >> 8, high & 0xff, low >> 8, low & 0xff])
  }
  toIPv4MappedAddress() {
    return IPv6.parse(`::ffff:${this.toString()}`)
  }
  static #parser(input: string): null | { parts: number[]; zoneId?: string } {
    let addr, i, match, octet, octets, zoneId

    if ((match = input.match(ipv6Regexes.deprecatedTransitional)))
      return this.#parser(`::ffff:${match[1]}`)

    if (ipv6Regexes.native.test(input)) return expandIPv6(input, 8)

    if ((match = input.match(ipv6Regexes.transitional))) {
      zoneId = match[6] || ''
      addr = expandIPv6(match[1].slice(0, -1) + zoneId, 6)!
      if (addr.parts) {
        octets = [
          parseInt(match[2]),
          parseInt(match[3]),
          parseInt(match[4]),
          parseInt(match[5]),
        ]
        for (i = 0; i < octets.length; i++) {
          octet = octets[i]
          if (!(0 <= octet && octet <= 255)) {
            return null
          }
        }

        addr.parts.push((octets[0] << 8) | octets[1])
        addr.parts.push((octets[2] << 8) | octets[3])
        return {
          parts: addr.parts,
          zoneId: addr.zoneId,
        }
      }
    }

    return null
  }
  static isValid(input: string) {
    // Since IPv6.isValid is always called first, this shortcut
    // provides a substantial performance gain.
    if (typeof input === 'string' && input.indexOf(':') === -1) return false

    try {
      const addr = this.#parser(input)!
      new this(addr.parts, addr.zoneId)
      return true
    } catch {
      return false
    }
  }
  static parse(input: string) {
    const addr = this.#parser(input)!

    if (addr.parts === null) {
      throw new Error('ipaddr: string is not formatted like an IPv6 Address')
    }

    return new this(addr.parts, addr.zoneId)
  }
  match(other: IPv4 | IPv6 | [IPv4 | IPv6, number], cidrRange?: number) {
    let ref

    if (cidrRange === undefined) {
      ref = other
      other = (ref as [IPv4 | IPv6, number])[0]
      cidrRange = (ref as [IPv4 | IPv6, number])[1]
    }

    if ((other as IPv6).kind() !== 'ipv6')
      throw new Error('ipaddr: cannot match ipv6 address with non-ipv6 one')

    return matchCIDR(this.parts, (other as IPv6).parts, 16, cidrRange)
  }
  prefixLengthFromSubnetMask() {
    let cidr = 0
    // non-zero encountered stop scanning for zeroes
    let stop = false
    // number of zeroes in octet
    const zerotable: Record<number, number> = {
      0: 16,
      32768: 15,
      49152: 14,
      57344: 13,
      61440: 12,
      63488: 11,
      64512: 10,
      65024: 9,
      65280: 8,
      65408: 7,
      65472: 6,
      65504: 5,
      65520: 4,
      65528: 3,
      65532: 2,
      65534: 1,
      65535: 0,
    }
    let part: number, zeros: number

    for (let i = 7; i >= 0; i -= 1) {
      part = this.parts[i]
      if (part in zerotable) {
        zeros = zerotable[part]
        if (stop && zeros !== 0) return null

        if (zeros !== 16) stop = true

        cidr += zeros
      } else return null
    }

    return 128 - cidr
  }
  toNormalizedString(): string {
    const results: string[] = []

    for (let i = 0; i < this.parts.length; i++) {
      results.push(this.parts[i].toString(16))
    }
    const addr = results.join(':')

    let suffix = ''

    if (this.zoneId) suffix = `%${this.zoneId}`

    return addr + suffix
  }
  toRFC5952String() {
    const regex = /((^|:)(0(:|$)){2,})/g
    const string = this.toNormalizedString()
    let bestMatchIndex = 0
    let bestMatchLength = -1
    let match

    while ((match = regex.exec(string))) {
      if (match[0].length > bestMatchLength) {
        bestMatchIndex = match.index
        bestMatchLength = match[0].length
      }
    }

    if (bestMatchLength < 0) {
      return string
    }

    return `${string.substring(0, bestMatchIndex)}::${string.substring(
      bestMatchIndex + bestMatchLength
    )}`
  }
  toString(): string {
    return this.toRFC5952String()
  }
}
