interface RangeList<T> {
  [name: string]: [T, number] | [T, number][]
}

interface IP {
  prefixLengthFromSubnetMask(): number | null
  // toByteArray(): number[]
  toNormalizedString(): string
  toString(): string
}
export type { RangeList, IP }
