import { useState, useMemo } from 'react'
import { type WrestlingRecord } from '../data/wrestlingData'
import { useWrestlingData } from '../data/WrestlingDataContext'

function PlacementBadge({ p }: { p: number }) {
  if (p === 1) return <span className="badge badge-1">🥇</span>
  if (p === 2) return <span className="badge badge-2">🥈</span>
  if (p === 3) return <span className="badge badge-3">🥉</span>
  return <span className="badge badge-other">{p}</span>
}

export default function YearView() {
  const { data: wrestlingData } = useWrestlingData()

  const YEARS = useMemo(() => [...new Set(wrestlingData.map(d => d.year))].sort(), [wrestlingData])

  const [year, setYear] = useState<number | undefined>(undefined)
  const activeYear = year ?? YEARS[0]

  const weightClasses = useMemo(() => {
    const wcs = [...new Set(wrestlingData.filter(d => d.year === activeYear).map(d => d.weightClass))].sort((a, b) => a - b)
    return wcs
  }, [wrestlingData, activeYear])

  const byWeight = useMemo(() => {
    const result: Record<number, WrestlingRecord[]> = {}
    for (const wc of weightClasses) {
      result[wc] = wrestlingData
        .filter(d => d.year === activeYear && d.weightClass === wc)
        .sort((a, b) => a.placement - b.placement)
    }
    return result
  }, [wrestlingData, activeYear, weightClasses])

  const yearData = useMemo(() => wrestlingData.filter(d => d.year === activeYear), [wrestlingData, activeYear])

  const topState = useMemo(() => {
    const counts: Record<string, number> = {}
    yearData.forEach(d => { counts[d.state] = (counts[d.state] || 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  }, [yearData])

  const champStates = useMemo(() => {
    return [...new Set(yearData.filter(d => d.placement === 1).map(d => d.state))]
  }, [yearData])

  if (YEARS.length === 0) return null

  return (
    <div>
      <div className="page-header">
        <h1>Results by Year</h1>
        <p>Select a tournament year to view all weight class results and placements</p>
      </div>

      <div className="year-tabs">
        {YEARS.map(y => (
          <button
            key={y}
            className={`year-tab${activeYear === y ? ' active' : ''}`}
            onClick={() => setYear(y)}
          >
            {y}
          </button>
        ))}
      </div>

      {/* Year summary bar */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24,
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 10, padding: '16px 20px',
        alignItems: 'center',
      }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
            {activeYear} NCAA D1 Wrestling Championships
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            {weightClasses.length} weight classes · {yearData.length} placers
          </div>
        </div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 600 }}>Top State</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--blue)', marginTop: 2 }}>
              {topState ? `${topState[0]} (${topState[1]})` : '—'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 600 }}>Champion States</div>
            <div style={{ fontSize: 13, color: 'var(--text)', marginTop: 2 }}>
              {champStates.join(', ')}
            </div>
          </div>
        </div>
      </div>

      <div className="weight-grid">
        {weightClasses.map(wc => {
          const placers = byWeight[wc] || []
          return (
            <div key={wc} className="weight-card">
              <div className="weight-card-header">
                <h3>{wc} lbs</h3>
                <span>{placers.length} placers</span>
              </div>
              <div>
                {placers.map(p => (
                  <div key={p.placement} className="placer-row">
                    <PlacementBadge p={p.placement} />
                    <div className="placer-info">
                      <div className="placer-name">{p.name}</div>
                      <div className="placer-school">{p.highSchool}</div>
                    </div>
                    <div className="placer-state">{p.state}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
