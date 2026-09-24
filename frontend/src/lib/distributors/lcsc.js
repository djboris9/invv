// LCSC QR code parser.
// LCSC QR format: {pbn:PICK...,on:SO...,pc:C312270,qty:1,pm:LM358DR}
// Key: pc = LCSC part number (the primary key)

export function parseLcsc(raw) {
  if (!raw || !raw.startsWith('{') || !raw.endsWith('}')) {
    return null
  }
  const inner = raw.slice(1, -1)
  const pairs = inner.split(',')
  const fields = {}
  for (const pair of pairs) {
    const idx = pair.indexOf(':')
    if (idx === -1) continue
    fields[pair.slice(0, idx)] = pair.slice(idx + 1)
  }
  if (!fields.pc) return null
  return {
    code: fields.pc,
    quantity: fields.qty ? parseInt(fields.qty, 10) || null : null,
    manufacturerPart: fields.pm || null,
    orderNumber: fields.on || null,
  }
}
