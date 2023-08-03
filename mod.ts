import { IPv4 } from './IPv4.ts'
import { IPv6 } from './IPv6.ts'

export const isValid = (input: string) =>
  IPv6.isValid(input) || IPv4.isValid(input)

export const parse = (input: string) => {
  if (IPv6.isValid(input)) {
    return IPv6.parse(input)
  } else if (IPv4.isValid(input)) {
    return IPv4.parse(input)
  } else {
    throw new Error('ipaddr: the address has neither IPv6 nor IPv4 format')
  }
}

export { IPv4, IPv6 }
