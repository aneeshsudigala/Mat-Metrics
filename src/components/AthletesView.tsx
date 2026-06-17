import { useState, useMemo } from 'react'
import { type WrestlingRecord } from '../data/wrestlingData'
import { useWrestlingData } from '../data/WrestlingDataContext'

const PAGE_SIZE = 25

interface Col {
  key: keyof WrestlingRecord
  label: string
}

const COLS: Col[] = [
  { key: 'name',        label: 'Athlete' },
  { key: 'placement',   label: 'Place' },
  { key: 'weightClass', label: 'Weight' },
  { key: 'year',        label: 'Year' },
  { key: 'state',       label: 'State' },
  { key: 'highSchool',  label: 'High School' },
  { key: 'town',        label: 'Town' },
]

function PlacementBadge({ p }: { p: number }) {
  const cls = p <= 3 ? `badge badge-${p}` : 'badge badge-other'
  const medals: Partial<Record<number, string>> = { 1: '🥇', 2: '🥈', 3: '🥉' }
  return <span className={cls}>{medals[p] ?? p}</span>
}

export default function AthletesView() {
  const { data: wrestlingData } = useWrestlingData()

  const ALL_YEARS   = useMemo(() => [...new Set(wrestlingData.map(d => d.year))].sort(), [wrestlingData])
  const ALL_WEIGHTS = useMemo(() => [...new Set(wrestlingData.map(d => d.weightClass))].sort((a, b) => a - b), [wrestlingData])
  const ALL_STATES  = useMemo(() => [...new Set(wrestlingData.map(d => d.state))].sort(), [wrestlingData])

  const [search, setSearch]           = useState('')
  const [yearFilter, setYearFilter]   = useState('')
  const [wcFilter, setWcFilter]       = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [placeFilter, setPlaceFilter] = useState('')
  const [sortKey, setSortKey]         = useState<keyof WrestlingRecord>('year')
  const [sortDir, setSortDir]         = useState<'asc' | 'desc'>('asc')
  const [page, setPage]               = useState(1)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return wrestlingData.filter(d => {
      if (q && !d.name.toLowerCase().includes(q) && !d.highSchool.toLowerCase().includes(q)) return false
      if (yearFilter  && d.year        !== +yearFilter)  return false
      if (wcFilter    && d.weightClass !== +wcFilter)    return false
      if (stateFilter && d.state       !== stateFilter)  return false
      if (placeFilter === '1'  && d.placement !== 1)     return false
      if (placeFilter === '3'  && d.placement > 3)       return false
      if (placeFilter === 'all') { /* no-op */ }
      return true
    })
  }, [wrestlingData, search, yearFilter, wcFilter, stateFilter, placeFilter])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av: string | number = a[sortKey]
      let bv: string | number = b[sortKey]
      if (typeof av === 'string') av = av.toLowerCase()
      if (typeof bv === 'string') bv = bv.toLowerCase()
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [filtered, sortKey, sortDir])

  const totalPages  = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageRows    = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function handleSort(key: keyof WrestlingRecord) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  function resetFilters() {
    setSearch(''); setYearFilter(''); setWcFilter('')
    setStateFilter(''); setPlaceFilter('')
    setSortKey('year'); setSortDir('asc'); setPage(1)
  }

  const sortArrow = (key: keyof WrestlingRecord) => {
    if (sortKey !== key) return ' ↕'
    return sortDir === 'asc' ? ' ↑' : ' ↓'
  }

  const pageBtns = useMemo(() => {
    const btns: number[] = []
    const start = Math.max(1, currentPage - 3)
    const end   = Math.min(totalPages, currentPage + 3)
    for (let i = start; i <= end; i++) btns.push(i)
    return btns
  }, [currentPage, totalPages])

  return (
    <div>
      <div className="page-header">
        <h1>All Athletes</h1>
        <p>Browse, search, and filter all {wrestlingData.length} placers from the NCAA D1 Wrestling Championships (2017 – 2023, excl. 2019)</p>
      </div>

      <div className="stats-row">
        <div className="stat-card"><div className="stat-value">{wrestlingData.length}</div><div className="stat-label">Total Placers</div></div>
        <div className="stat-card"><div className="stat-value">{ALL_YEARS.length}</div><div className="stat-label">Tournaments</div></div>
        <div className="stat-card"><div className="stat-value">{ALL_WEIGHTS.length}</div><div className="stat-label">Weight Classes</div></div>
        <div className="stat-card"><div className="stat-value">{ALL_STATES.length}</div><div className="stat-label">States Represented</div></div>
        <div className="stat-card"><div className="stat-value">{wrestlingData.filter(d => d.placement === 1).length}</div><div className="stat-label">Champions</div></div>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Search</label>
          <input
            className="filter-input"
            type="text"
            placeholder="Name Or High School ..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        <div className="filter-group">
          <label>Year</label>
          <select className="filter-select" value={yearFilter} onChange={e => { setYearFilter(e.target.value); setPage(1) }}>
            <option value="">All Years</option>
            {ALL_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>Weight</label>
          <select className="filter-select" value={wcFilter} onChange={e => { setWcFilter(e.target.value); setPage(1) }}>
            <option value="">All Weights</option>
            {ALL_WEIGHTS.map(w => <option key={w} value={w}>{w} lbs</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>State</label>
          <select className="filter-select" value={stateFilter} onChange={e => { setStateFilter(e.target.value); setPage(1) }}>
            <option value="">All States</option>
            {ALL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>Placement</label>
          <select className="filter-select" value={placeFilter} onChange={e => { setPlaceFilter(e.target.value); setPage(1) }}>
            <option value="">All Places</option>
            <option value="1">Champion (1st)</option>
            <option value="3">Podium (Top 3)</option>
          </select>
        </div>

        <button className="filter-reset" onClick={resetFilters}>Reset</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {COLS.map(col => (
                <th
                  key={col.key}
                  className={sortKey === col.key ? 'sort-active' : ''}
                  onClick={() => handleSort(col.key)}
                >
                  {col.label}{sortArrow(col.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={COLS.length} style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                  No athletes match your filters.
                </td>
              </tr>
            ) : pageRows.map((d, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{d.name}</td>
                <td><PlacementBadge p={d.placement} /></td>
                <td><span className="wc-chip">{d.weightClass}</span></td>
                <td>{d.year}</td>
                <td>{d.state}</td>
                <td style={{ color: 'var(--muted)' }}>{d.highSchool}</td>
                <td style={{ color: 'var(--dim)' }}>{d.town}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span className="pagination-info">
          {sorted.length === 0
            ? 'No results'
            : `Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, sorted.length)} of ${sorted.length}`}
        </span>
        <div className="pagination-controls">
          <button className="page-btn" disabled={currentPage === 1} onClick={() => setPage(1)}>«</button>
          <button className="page-btn" disabled={currentPage === 1} onClick={() => setPage(p => p - 1)}>‹</button>
          {pageBtns.map(n => (
            <button key={n} className={`page-btn${n === currentPage ? ' active' : ''}`} onClick={() => setPage(n)}>{n}</button>
          ))}
          <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
          <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setPage(totalPages)}>»</button>
        </div>
      </div>
    </div>
  )
}
