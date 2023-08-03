const ipv4Part = '(0?\\d+|0x[a-f0-9]+)'
const ipv4Regexes = {
  fourOctet: new RegExp(
    `^${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}$`,
    'i'
  ),
  threeOctet: new RegExp(`^${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}$`, 'i'),
  twoOctet: new RegExp(`^${ipv4Part}\\.${ipv4Part}$`, 'i'),
  longValue: new RegExp(`^${ipv4Part}$`, 'i'),
}

// Regular Expression for checking Octal numbers
const octalRegex = new RegExp(`^0[0-7]+$`, 'i')
const hexRegex = new RegExp(`^0x[a-f0-9]+$`, 'i')

const zoneIndex = '%[0-9a-z]{1,}'

// IPv6-matching regular expressions.
// For IPv6, the task is simpler: it is enough to match the colon-delimited
// hexadecimal IPv6 and a transitional variant with dotted-decimal IPv4 at
// the end.
const ipv6Part = '(?:[0-9a-f]+::?)+'
const ipv6Regexes = {
  zoneIndex: new RegExp(zoneIndex, 'i'),
  native: new RegExp(
    `^(::)?(${ipv6Part})?([0-9a-f]+)?(::)?(${zoneIndex})?$`,
    'i'
  ),
  deprecatedTransitional: new RegExp(
    `^(?:::)(${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}(${zoneIndex})?)$`,
    'i'
  ),
  transitional: new RegExp(
    `^((?:${ipv6Part})|(?:::)(?:${ipv6Part})?)${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}(${zoneIndex})?$`,
    'i'
  ),
}

export {
  ipv4Part,
  ipv4Regexes,
  ipv6Part,
  ipv6Regexes,
  zoneIndex,
  octalRegex,
  hexRegex,
}
