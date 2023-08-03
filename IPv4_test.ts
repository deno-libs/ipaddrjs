import { it, describe, run, expect } from './dev_deps.ts'
import { IPv4 } from './IPv4.ts'

describe('IPv4', () => {
  it('can construct IPv4 from octets', () => {
    expect(() => new IPv4([192, 168, 1, 2])).not.toThrow()
  })
  it('refuses to construct invalid IPv4', () => {
    expect(() => new IPv4([300, 1, 2, 3])).toThrow()

    expect(() => new IPv4([8, 8, 8])).toThrow()
  })
  it('converts IPv4 to string correctly', () => {
    const addr = new IPv4([192, 168, 1, 1])
    expect(addr.toString()).toEqual('192.168.1.1')
    expect(addr.toNormalizedString()).toEqual('192.168.1.1')
  })
})

run()
