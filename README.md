# ipaddr.js

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