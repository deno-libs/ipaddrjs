import { ipv4Regexes } from './constants.ts'
import type { IPv6 } from './IPv6.ts'
import { IP } from './types.ts'
import { matchCIDR, parseIntAuto } from './utils.ts'

export class IPv4 implements IP {
  octets: number[]

  constructor(octets: number[]) {
    if (octets.length !== 4) {
      throw new Error('ipaddr: ipv4 octet count should be 4')
    }

    let i, octet

    for (i = 0; i < octets.length; i++) {
      octet = octets[i]
      if (!(0 <= octet && octet <= 255)) {
        throw new Error('ipaddr: ipv4 octet should fit in 8 bits')
      }
    }

    this.octets = octets
  }
  kind(): 'ipv4' {
    return 'ipv4'
  }
  match(
    other: IPv4 | IPv6 | [IPv4 | IPv6, number],
    cidrRange: number | undefined
  ) {
    let ref: [IPv4 | IPv6, number]
    if (cidrRange === undefined) {
      ref = other as [IPv4 | IPv6, number]
      other = ref[0]
      cidrRange = ref[1]
    }

    if ((other as IPv4 | IPv6).kind() !== 'ipv4') {
      throw new Error('ipaddr: cannot match ipv4 address with non-ipv4 one')
    }

    return matchCIDR(this.octets, (other as IPv4).octets, 8, cidrRange!)
  }
  static #parser(input: string) {
    let match, part, value

    // parseInt recognizes all that octal & hexadecimal weirdness for us
    if ((match = input.match(ipv4Regexes.fourOctet))) {
      return (function () {
        const ref = match.slice(1, 6)
        const results: number[] = []

        for (let i = 0; i < ref.length; i++) {
          part = ref[i]
          results.push(parseIntAuto(part))
        }

        return results
      })()
    } else if ((match = input.match(ipv4Regexes.longValue))) {
      value = parseIntAuto(match[1])
      if (value > 0xffffffff || value < 0) {
        throw new Error('ipaddr: address outside defined range')
      }

      return (function () {
        const results: number[] = []
        let shift: number

        for (shift = 0; shift <= 24; shift += 8) {
          results.push((value >> shift) & 0xff)
        }

        return results
      })().reverse()
    } else if ((match = input.match(ipv4Regexes.twoOctet))) {
      return (function () {
        const ref = match.slice(1, 4)
        const results: number[] = []

        value = parseIntAuto(ref[1])
        if (value > 0xffffff || value < 0) {
          throw new Error('ipaddr: address outside defined range')
        }

        results.push(parseIntAuto(ref[0]))
        results.push((value >> 16) & 0xff)
        results.push((value >> 8) & 0xff)
        results.push(value & 0xff)

        return results
      })()
    } else if ((match = input.match(ipv4Regexes.threeOctet))) {
      return (function () {
        const ref = match.slice(1, 5)
        const results: number[] = []

        value = parseIntAuto(ref[2])
        if (value > 0xffff || value < 0) {
          throw new Error('ipaddr: address outside defined range')
        }

        results.push(parseIntAuto(ref[0]))
        results.push(parseIntAuto(ref[1]))
        results.push((value >> 8) & 0xff)
        results.push(value & 0xff)

        return results
      })()
    } else {
      return null
    }
  }
  static isValid(input: string) {
    try {
      new this(this.#parser(input)!)
      return true
    } catch {
      return false
    }
  }
  static parse(input: string) {
    const parts = this.#parser(input)

    if (parts === null) {
      throw new Error('ipaddr: string is not formatted like an IPv4 Address')
    }

    return new this(parts)
  }
  prefixLengthFromSubnetMask(): number | null {
    let cidr = 0
    // non-zero encountered stop scanning for zeroes
    let stop = false
    // number of zeroes in octet
    const zerotable: Record<number, number> = {
      0: 8,
      128: 7,
      192: 6,
      224: 5,
      240: 4,
      248: 3,
      252: 2,
      254: 1,
      255: 0,
    }
    let i: number, octet: number, zeros: number

    for (i = 3; i >= 0; i -= 1) {
      octet = this.octets[i]
      if (octet in zerotable) {
        zeros = zerotable[octet]
        if (stop && zeros !== 0) {
          return null
        }

        if (zeros !== 8) {
          stop = true
        }

        cidr += zeros
      } else {
        return null
      }
    }

    return 32 - cidr
  }
  toString(): string {
    return this.octets.join('.')
  }
  toNormalizedString(): string {
    return this.toString()
  }
}
