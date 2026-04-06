import { useState, useMemo } from 'react'

export default function DataTable({ columns, data = [], pageSize = 10, searchable = true, actions }) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(pageSize)
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  const filtered = useMemo(() => {
    if (!search) return data
    const q = search.toLowerCase()
    return data.filter((row) =>
      columns.some((col) => {
        const val = col.accessor ? col.accessor(row) : row[col.key]
        return String(val ?? '').toLowerCase().includes(q)
      })
    )
  }, [data, search, columns])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const col = columns.find((c) => c.key === sortKey)
      const aVal = col?.accessor ? col.accessor(a) : a[sortKey]
      const bVal = col?.accessor ? col.accessor(b) : b[sortKey]
      const cmp = String(aVal ?? '').localeCompare(String(bVal ?? ''))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir, columns])

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage))
  const currentPage = Math.min(page, totalPages)
  const paginated = sorted.slice((currentPage - 1) * perPage, currentPage * perPage)

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const start = sorted.length === 0 ? 0 : (currentPage - 1) * perPage + 1
  const end = Math.min(currentPage * perPage, sorted.length)

  return (
    <div>
      <div className="table-toolbar">
        <div className="table-show">
          Show&nbsp;
          <select value={perPage} onChange={(e) => { setPerPage(+e.target.value); setPage(1) }}>
            {[5, 10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          &nbsp;entries
        </div>
        {searchable && (
          <div className="table-search">
            <span className="material-icons">search</span>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
        )}
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} onClick={() => col.sortable !== false && handleSort(col.key)}>
                  {col.label}
                  {sortKey === col.key && (
                    <span className="material-icons" style={{ fontSize: 14, verticalAlign: 'middle', marginLeft: 4 }}>
                      {sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                    </span>
                  )}
                </th>
              ))}
              {actions && <th className="text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center" style={{ padding: '32px', color: '#aaa' }}>
                  No data found
                </td>
              </tr>
            ) : paginated.map((row, i) => (
              <tr key={row._id || i}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row) : (col.accessor ? col.accessor(row) : row[col.key])}
                  </td>
                ))}
                {actions && <td className="text-right">{actions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination-wrap">
        <span>Showing {start} to {end} of {sorted.length} entries</span>
        <ul className="pagination">
          <li>
            <button className="page-btn" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
              Previous
            </button>
          </li>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
            .reduce((acc, p, idx, arr) => {
              if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
              acc.push(p)
              return acc
            }, [])
            .map((p, i) =>
              p === '...' ? (
                <li key={`ellipsis-${i}`}><span className="page-btn" style={{ cursor: 'default' }}>…</span></li>
              ) : (
                <li key={p}>
                  <button className={`page-btn${p === currentPage ? ' active' : ''}`} onClick={() => setPage(p)}>
                    {p}
                  </button>
                </li>
              )
            )}
          <li>
            <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>
              Next
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}
