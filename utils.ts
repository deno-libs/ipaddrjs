import { IPv4 } from './IPv4.ts'
import { IPv6 } from './IPv6.ts'
import { ipv6Regexes, hexRegex, octalRegex } from './constants.ts'
import { RangeList } from './types.ts'

// Expand :: in an IPv6 address or address part consisting of `parts` groups.
function expandIPv6(addr: string, parts: number) {
  // More than one '::' means invalid adddress
  if (addr.indexOf('::') !== addr.lastIndexOf('::')) {
    return null
  }

  let colonCount = 0
  let lastColon = -1
  let zoneId = (addr.match(ipv6Regexes.zoneIndex) || [])[0]
  let replacement, replacementCount

  // Remove zone index and save it for later
  if (zoneId) {
    zoneId = zoneId.substring(1)
    addr = addr.replace(/%.+$/, '')
  }

  // How many parts do we already have?
  while ((lastColon = addr.indexOf(':', lastColon + 1)) >= 0) {
    colonCount++
  }

  // 0::0 is two parts more than ::
  if (addr.substring(0, 2) === '::') {
    colonCount--
  }

  if (addr.substring(-2, 2) === '::') {
    colonCount--
  }

  // The following loop would hang if colonCount > parts
  if (colonCount > parts) {
    return null
  }

  // replacement = ':' + '0:' * (parts - colonCount)
  replacementCount = parts - colonCount
  replacement = ':'
  while (replacementCount--) {
    replacement += '0:'
  }

  // Insert the missing zeroes
  addr = addr.replace('::', replacement)

  // Trim any garbage which may be hanging around if :: was at the edge in
  // the source strin
  if (addr[0] === ':') {
    addr = addr.slice(1)
  }

  if (addr[addr.length - 1] === ':') {
    addr = addr.slice(0, -1)
  }

  return {
    parts: (() => {
      const ref = addr.split(':')
      const results: number[] = []

      for (let i = 0; i < ref.length; i++) {
        results.push(parseInt(ref[i], 16))
      }

      return results
    })(),
    zoneId: zoneId,
  }
}

function parseIntAuto(int: string) {
  // Hexadedimal base 16 (0x#)
  if (hexRegex.test(int)) {
    return parseInt(int, 16)
  }
  // While octal representation is discouraged by ECMAScript 3
  // and forbidden by ECMAScript 5, we silently allow it to
  // work only if the rest of the int has numbers less than 8.
  if (int[0] === '0' && !isNaN(parseInt(int[1], 10))) {
    if (octalRegex.test(int)) {
      return parseInt(int, 8)
    }
    throw new Error(`ipaddr: cannot parse ${int} as octal`)
  }
  // Always include the base 10 radix!
  return parseInt(int, 10)
}

function padPart(part: string, length: number) {
  while (part.length < length) {
    part = `0${part}`
  }

  return part
}

// A generic CIDR (Classless Inter-Domain Routing) RFC1518 range matcher.
function matchCIDR(
  first: number[],
  second: number[],
  partSize: number,
  cidrBits: number
) {
  if (first.length !== second.length) {
    throw new Error(
      'ipaddr: cannot match CIDR for objects with different lengths'
    )
  }

  let part = 0
  let shift

  while (cidrBits > 0) {
    shift = partSize - cidrBits
    if (shift < 0) {
      shift = 0
    }

    if (first[part] >> shift !== second[part] >> shift) {
      return false
    }

    cidrBits -= partSize
    part += 1
  }

  return true
}

const subnetMatch = (
  address: IPv4 | IPv6,
  rangeList: RangeList<IPv4 | IPv6>,
  defaultName?: string
) => {
  let i, rangeName: string, rangeSubnets, subnet: [IPv4 | IPv6]

  if (defaultName === undefined || defaultName === null) {
    defaultName = 'unicast'
  }

  for (rangeName in rangeList) {
    if (Object.prototype.hasOwnProperty.call(rangeList, rangeName)) {
      rangeSubnets = rangeList[rangeName]
      // ECMA5 Array.isArray isn't available everywhere
      if (rangeSubnets[0] && !(rangeSubnets[0] instanceof Array)) {
        rangeSubnets = [rangeSubnets]
      }

      for (i = 0; i < rangeSubnets.length; i++) {
        subnet = rangeSubnets[i] as unknown as [IPv4 | IPv6]
        if (
          address.kind() === subnet[0].kind() &&
          // @ts-ignore typings issue
          address.match.apply(address, subnet)
        ) {
          return rangeName
        }
      }
    }
  }

  return defaultName
}

export { expandIPv6, padPart, matchCIDR, parseIntAuto, subnetMatch }
