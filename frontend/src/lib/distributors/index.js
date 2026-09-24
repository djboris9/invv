// Distributor QR/barcode parsers.
// Each distributor exports a function: parse(raw: string) => { code, quantity, manufacturerPart, orderNumber } or null.

import { parseLcsc } from './lcsc'

const parsers = {
  lcsc: parseLcsc,
}

export function parseCode(raw, distributor) {
  const fn = parsers[distributor] || parsers.lcsc
  return fn(raw)
}

export function detectDistributor(raw) {
  if (raw && raw.startsWith('{') && raw.includes(':') && raw.endsWith('}')) {
    return 'lcsc'
  }
  return null
}
