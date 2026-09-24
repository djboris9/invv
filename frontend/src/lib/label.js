function esc(s) {
  return (s || '').replace(/[\^~\\]/g, '')
}

export function containerZpl(container) {
  const name = esc(container.name)
  const loc = esc(container.location)
  const id = esc(container.id)

  return [
    '^XA',
    '^CI28',
    '~SD20',
    '^FO5,5^GB829,430,2^FS',
    '^FO5,5^GB829,55,55^FS',
    '^FR^FO18,14^A0N,40,48^FD' + name + '^FS',
    '^FO510,60^GB2,370,2^FS',
    '^FO15,70^A0N,28,28^FDName: ' + name + '^FS',
    '^FO15,105^A0N,24,24^FDLocation: ' + loc + '^FS',
    '^FO15,140^A0N,24,24^FDID: ' + id + '^FS',
    '^FO15,175^GB490,1,1^FS',
    '^FO550,110',
    '^BQN,2,11',
    '^FDMM,Ainvv:' + id + '^FS',
    '^XZ',
  ].join('\n')
}
