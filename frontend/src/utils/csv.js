export function parseCsvToItems(text) {
  const rows = parseCsv(text)
  if (rows.length < 2) throw new Error('CSV must include a header row and at least one data row.')

  const headers = rows[0].map((h) => h.trim())
  const inputIdx = headers.findIndex((h) => h === 'input')
  const idealIdx = headers.findIndex((h) => h === 'ideal_output')

  if (inputIdx === -1 || idealIdx === -1) {
    throw new Error("CSV headers must include 'input' and 'ideal_output'.")
  }

  const items = rows
    .slice(1)
    .map((r) => ({ input: (r[inputIdx] || '').trim(), ideal_output: (r[idealIdx] || '').trim() }))
    .filter((r) => r.input || r.ideal_output)

  if (items.length === 0) throw new Error('CSV has no usable rows.')
  return items
}

function parseCsv(text) {
  const lines = text.replace(/\r/g, '\n').split('\n').filter((line) => line.trim().length > 0)
  return lines.map(parseCsvLine)
}

function parseCsvLine(line) {
  const out = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]
    const next = line[i + 1]

    if (ch === '"') {
      if (inQuotes && next === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(current)
      current = ''
    } else {
      current += ch
    }
  }

  out.push(current)
  return out
}
