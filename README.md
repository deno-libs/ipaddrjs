# ipaddrjs

[![GitHub Workflow Status][gh-actions-img]][github-actions]
[![Codecov][codecov-badge]][codecov] [![][docs-badge]][docs]

Deno port of [ipaddr.js](https://github.com/whitequark/ipaddr.js) library. Used by [proxy_addr](https://github.com/deno-libs/proxy_addr).

## Example

```ts
import { isValid } from 'https://deno.land/x/ipaddr.js/mod.ts'

isValid('127.0.0.1') // true
```

## Implementation Status

### IP

- [x] `prefixLengthFromSubnetMask`
- [x] `toString`
- [x] `toNormalizedString`
- [ ] `toByteArray`

### IPv4

- [ ] `broadcastAddressFromCIDR`
- [ ] `isIPv4`
- [ ] `isValidFourPartDecimal`
- [x] `isValid`
- [ ] `networkAddressFromCIDR`
- [x] `parse`
- [ ] `parseCIDR`
- [ ] `subnetMaskFromPrefixLength`
- [x] `match`
- [ ] `range`
- [ ] `subnetMatch`
- [ ] `toIPv4MappedAddress`

### IPv6

- [ ] `broadcastAddressFromCIDR`
- [ ] `isIPv6`
- [x] `isValid`
- [ ] `networkAddressFromCIDR`
- [x] `parse`
- [ ] `parseCIDR`
- [ ] `subnetMaskFromPrefixLength`
- [x] `isIPv4MappedAddress`
- [x] `match`
- [x] `range`
- [ ] `subnetMatch`
- [x] `toIPv4Address`
- [x] `toRFC5952String`

[gh-actions-img]: https://img.shields.io/github/actions/workflow/status/deno-libs/ipaddr.js/main.yml?branch=master&style=for-the-badge&logo=github
[codecov]: https://codecov.io/gh/deno-libs/ipaddr.js
[github-actions]: https://github.com/deno-libs/ipaddr.js/actions
[codecov-badge]: https://img.shields.io/coverallsCoverage/github/deno-libs/ipaddr.js?style=for-the-badge
[docs-badge]: https://img.shields.io/github/v/release/deno-libs/ipaddr.js?color=yellow&label=Docs&logo=deno&style=for-the-badge
[docs]: https://doc.deno.land/https/deno.land/x/ipaddr.js/mod.ts
