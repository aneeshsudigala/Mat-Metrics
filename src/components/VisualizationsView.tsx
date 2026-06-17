import { useMemo } from 'react'
import { type WrestlingRecord } from '../data/wrestlingData'
import { useWrestlingData } from '../data/WrestlingDataContext'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Cell,
} from 'recharts'

interface TooltipPayloadEntry {
  dataKey: string | number
  name: string
  value: number | string
  color: string
}

interface ChartTooltipProps {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: string | number
}

// Points system: 1st=8, 2nd=7, ... 8th=1
const pts = (p: number) => Math.max(0, 9 - p)

// ── Derived dataset hooks ──────────────────────────────────────────────────────

function useTopStatesByPlacers(data: WrestlingRecord[], n = 15) {
  return useMemo(() => {
    const counts: Record<string, number> = {}
    data.forEach(d => { counts[d.state] = (counts[d.state] || 0) + 1 })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([state, count]) => ({ state, count }))
  }, [data, n])
}

function useTopStatesByChampions(data: WrestlingRecord[], n = 12) {
  return useMemo(() => {
    const counts: Record<string, number> = {}
    data.filter(d => d.placement === 1)
      .forEach(d => { counts[d.state] = (counts[d.state] || 0) + 1 })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([state, count]) => ({ state, count }))
  }, [data, n])
}

interface StatePointRow {
  year: number
  [state: string]: number
}

function useStatePointsByYear(data: WrestlingRecord[], years: number[], topN = 5): [StatePointRow[], string[]] {
  return useMemo(() => {
    const totals: Record<string, number> = {}
    data.forEach(d => { totals[d.state] = (totals[d.state] || 0) + pts(d.placement) })
    const topStates = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, topN).map(([s]) => s)

    const chartData: StatePointRow[] = years.map(year => {
      const row: StatePointRow = { year }
      const yearData = data.filter(d => d.year === year)
      topStates.forEach(state => {
        row[state] = yearData.filter(d => d.state === state).reduce((s, d) => s + pts(d.placement), 0)
      })
      return row
    })
    return [chartData, topStates]
  }, [data, years, topN])
}

interface RepeatAthlete {
  name: string
  appearances: number
  state: string
  entries: WrestlingRecord[]
  hasChampionship: boolean
}

function useRepeatAthletes(data: WrestlingRecord[]): RepeatAthlete[] {
  return useMemo(() => {
    const map: Record<string, WrestlingRecord[]> = {}
    data.forEach(d => {
      if (!map[d.name]) map[d.name] = []
      map[d.name].push(d)
    })
    return Object.entries(map)
      .filter(([, rows]) => rows.length >= 2)
      .map(([name, rows]) => ({
        name,
        appearances: rows.length,
        state: rows[0].state,
        entries: rows.sort((a, b) => a.year - b.year || a.weightClass - b.weightClass),
        hasChampionship: rows.some(r => r.placement === 1),
      }))
      .sort((a, b) => b.appearances - a.appearances || a.name.localeCompare(b.name))
  }, [data])
}

function useWeightClassStats(data: WrestlingRecord[]) {
  return useMemo(() => {
    const wcs = [...new Set(data.map(d => d.weightClass))].sort((a, b) => a - b)
    return wcs.map(wc => {
      const d = data.filter(x => x.weightClass === wc)
      const stateCounts: Record<string, number> = {}
      d.forEach(x => { stateCounts[x.state] = (stateCounts[x.state] || 0) + 1 })
      const topState = Object.entries(stateCounts).sort((a, b) => b[1] - a[1])[0]
      return { wc: `${wc}`, appearances: d.length, topState: topState ? topState[0] : '—' }
    })
  }, [data])
}

// ── Custom tooltip ─────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-card-2)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--text)',
    }}>
      <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--blue-light)' }}>{label}</div>
      {payload.map((p: TooltipPayloadEntry) => (
        <div key={String(p.dataKey)} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  )
}

const LINE_COLORS = ['#4B9CD3', '#e3b341', '#c9753e', '#7bc47f', '#c792e9']

// ── Sub-component ──────────────────────────────────────────────────────────────
function TopStatePlacementChart({ data }: { data: WrestlingRecord[] }) {
  const chartData = useMemo(() => {
    const totals: Record<string, number> = {}
    data.forEach(d => { totals[d.state] = (totals[d.state] || 0) + 1 })
    const top5 = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([s]) => s)
    return top5.map(state => {
      const row: Record<string, string | number> = { state }
      for (let p = 1; p <= 8; p++) {
        row[`p${p}`] = data.filter(d => d.state === state && d.placement === p).length
      }
      return row
    })
  }, [data])

  const barColors  = ['#e3b341','#9ca3af','#c9753e','#4B9CD3','#6aad6a','#7b7bca','#ca7b7b','#7bbcca']
  const placeLabels = ['1st','2nd','3rd','4th','5th','6th','7th','8th']

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="state" tick={{ fill: 'var(--muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--blue-glow)' }} />
        <Legend wrapperStyle={{ fontSize: 11, color: 'var(--muted)', paddingTop: 8 }} />
        {[1,2,3,4,5,6,7,8].map((p, i) => (
          <Bar key={p} dataKey={`p${p}`} name={placeLabels[i]} stackId="a" fill={barColors[i]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function VisualizationsView() {
  const { data: wrestlingData } = useWrestlingData()

  const YEARS = useMemo(() => [...new Set(wrestlingData.map(d => d.year))].sort(), [wrestlingData])

  const topByPlacers                      = useTopStatesByPlacers(wrestlingData, 15)
  const topByChampions                    = useTopStatesByChampions(wrestlingData, 12)
  const [statePointsByYear, topStates]    = useStatePointsByYear(wrestlingData, YEARS, 5)
  const repeatAthletes                    = useRepeatAthletes(wrestlingData)
  const weightStats                       = useWeightClassStats(wrestlingData)

  const totalChampions  = useMemo(() => wrestlingData.filter(d => d.placement === 1).length, [wrestlingData])
  const topState        = topByPlacers[0]
  const mostChampState  = topByChampions[0]
  const repeatCount     = repeatAthletes.length

  return (
    <div>
      <div className="page-header">
        <h1>Visualizations</h1>
        <p>Pre-built charts and insights across all {YEARS.length} tournaments</p>
      </div>

      <div className="stats-row">
        <div className="stat-card"><div className="stat-value">{totalChampions}</div><div className="stat-label">Total Champions</div></div>
        <div className="stat-card"><div className="stat-value">{topState?.state}</div><div className="stat-label">Most Placers</div></div>
        <div className="stat-card"><div className="stat-value">{topState?.count}</div><div className="stat-label">{topState?.state} Placers</div></div>
        <div className="stat-card"><div className="stat-value">{mostChampState?.state}</div><div className="stat-label">Most Champions</div></div>
        <div className="stat-card"><div className="stat-value">{mostChampState?.count}</div><div className="stat-label">{mostChampState?.state} Titles</div></div>
        <div className="stat-card"><div className="stat-value">{repeatCount}</div><div className="stat-label">Repeat Placers</div></div>
      </div>

      <div className="viz-grid">

        {/* 1 — Top States by Total Placers */}
        <div className="viz-card">
          <h3>Top 15 States — Total Placers</h3>
          <p>Combined top-8 finishers across all years and weight classes</p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={topByPlacers} layout="vertical" margin={{ left: 10, right: 20, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'var(--muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis dataKey="state" type="category" tick={{ fill: 'var(--text)', fontSize: 12 }} tickLine={false} axisLine={false} width={90} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--blue-glow)' }} />
              <Bar dataKey="count" name="Placers" radius={[0, 4, 4, 0]}>
                {topByPlacers.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? '#4B9CD3' : i < 3 ? '#2d6fa0' : '#1a3650'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 2 — Champion Leaders by State */}
        <div className="viz-card">
          <h3>Champion Leaders by State</h3>
          <p>Number of individual national titles earned per state (all years)</p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={topByChampions} layout="vertical" margin={{ left: 10, right: 20, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'var(--muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis dataKey="state" type="category" tick={{ fill: 'var(--text)', fontSize: 12 }} tickLine={false} axisLine={false} width={90} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--blue-glow)' }} />
              <Bar dataKey="count" name="Championships" radius={[0, 4, 4, 0]}>
                {topByChampions.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? '#e3b341' : i < 3 ? '#a07a20' : '#5a4210'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 3 — State Points Per Year */}
        <div className="viz-card wide">
          <h3>State Points Over Time — Top 5 States</h3>
          <p>Annual scoring (8 pts for 1st, 7 for 2nd … 1 for 8th) for the five most dominant states across the study period</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={statePointsByYear} margin={{ left: 0, right: 20, top: 5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="year" tick={{ fill: 'var(--muted)', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: 'var(--muted)', paddingTop: 8 }} />
              {topStates.map((state, i) => (
                <Line
                  key={state}
                  type="monotone"
                  dataKey={state}
                  stroke={LINE_COLORS[i]}
                  strokeWidth={2}
                  dot={{ r: 4, fill: LINE_COLORS[i], strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 4 — Weight Class Appearances */}
        <div className="viz-card">
          <h3>Weight Class Coverage</h3>
          <p>How many data points exist per weight class and the state that produced the most placers in each</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weightStats} margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="wc" tick={{ fill: 'var(--muted)', fontSize: 11 }} tickLine={false} axisLine={false} label={{ value: 'lbs', position: 'insideRight', offset: 10, fill: 'var(--dim)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--blue-glow)' }} />
              <Bar dataKey="appearances" name="Appearances" fill="var(--blue-dim)" radius={[4, 4, 0, 0]}>
                {weightStats.map((_, i) => (
                  <Cell key={i} fill={['#4B9CD3','#3a85b8','#2d6fa0','#1f5a87','#1a3650'][i % 5]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {weightStats.map(w => (
              <span key={w.wc} style={{ fontSize: 10, color: 'var(--muted)', background: 'var(--bg-card-2)', borderRadius: 4, padding: '2px 6px' }}>
                <strong style={{ color: 'var(--blue-light)' }}>{w.wc}</strong> → {w.topState}
              </span>
            ))}
          </div>
        </div>

        {/* 5 — Placement Distribution for Top 5 States */}
        <div className="viz-card">
          <h3>Placement Distribution — Top 5 States</h3>
          <p>How 1st-through-8th placements are distributed among the five most prolific states</p>
          <TopStatePlacementChart data={wrestlingData} />
        </div>

        {/* 6 — Repeat Placers Table */}
        <div className="viz-card wide">
          <h3>Multi-Year Placers</h3>
          <p>{repeatAthletes.length} athletes placed at multiple championships across the study period</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ cursor: 'default' }}>Athlete</th>
                  <th style={{ cursor: 'default' }}>State</th>
                  <th style={{ cursor: 'default' }}>Appearances</th>
                  <th style={{ cursor: 'default' }}>Results</th>
                </tr>
              </thead>
              <tbody>
                {repeatAthletes.map(a => (
                  <tr key={a.name}>
                    <td style={{ fontWeight: 600 }}>{a.name}</td>
                    <td style={{ color: 'var(--muted)' }}>{a.state}</td>
                    <td>
                      <span className="wc-chip">{a.appearances}×</span>
                    </td>
                    <td>
                      {a.entries.map((e, i) => (
                        <span key={i} className={`tag${e.placement === 1 ? ' gold' : ''}`}>
                          {e.year} · {e.weightClass} lbs · #{e.placement}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
