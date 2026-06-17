import Papa from 'papaparse'

export interface WrestlingRecord {
  name: string
  highSchool: string
  town: string
  state: string
  weightClass: number
  placement: number
  year: number
}

interface RawRow {
  name: string
  'high school': string
  town: string
  state: string
  'weight class': string
  placement: string
  year: string
}

function parseCsv(raw: string): WrestlingRecord[] {
  const { data } = Papa.parse<RawRow>(raw, { header: true, skipEmptyLines: true })
  return data.map(row => ({
    name:        row['name'],
    highSchool:  row['high school'],
    town:        row['town'],
    state:       row['state'],
    weightClass: Number(row['weight class']),
    placement:   Number(row['placement']),
    year:        Number(row['year']),
  }))
}

export async function fetchWrestlingData(): Promise<WrestlingRecord[]> {
  const res = await fetch('/ncaa_data.csv')
  if (!res.ok) throw new Error(`Failed to fetch data (HTTP ${res.status})`)
  const raw = await res.text()
  return parseCsv(raw)
}
