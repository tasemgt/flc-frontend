import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import axiosClient from '../../api/axiosClient'
import { Spinner } from '../../components/shared'
import { formatDate } from '../../utils/dateFormat'

function StatCard({ color, icon, category, value, footerIcon, footerText, footerLink, loading }) {
  return (
    <div className="card card-stats-wrap">
      <div style={{ padding: '0 15px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div className={`card-icon card-header-${color}`} style={{ margin: '-20px 0 0 15px' }}>
            <span className="material-icons">{icon}</span>
          </div>
          <div style={{ textAlign: 'right', padding: '10px 10px 0' }}>
            <p className="card-category">{category}</p>
            <h3 className="card-title-lg">{loading ? <span style={{ fontSize: 16, color: '#ccc' }}>…</span> : (value ?? 0)}</h3>
          </div>
        </div>
      </div>
      <div className="card-footer">
        <span className="material-icons">{footerIcon}</span>
        {footerLink ? <Link to={footerLink}>{footerText}</Link> : <span>{footerText}</span>}
      </div>
    </div>
  )
}

function useDashboardStats() {
  return useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const [users, agencies, employments] = await Promise.allSettled([
        axiosClient.get('/users?limit=5').then((r) => r.data),
        axiosClient.get('/agencies?limit=5').then((r) => r.data),
        axiosClient.get('/employment?limit=5').then((r) => r.data),
      ])
      return {
        totalUsers: users.status === 'fulfilled' ? (users.value.total ?? 0) : '—',
        totalAgencies: agencies.status === 'fulfilled' ? (agencies.value.total ?? 0) : '—',
        totalEmployments: employments.status === 'fulfilled' ? (employments.value.total ?? 0) : '—',
        pendingAgencies: agencies.status === 'fulfilled' ? (agencies.value.data || []).filter((a) => !a.approved).length : '—',
        pendingEmployments: employments.status === 'fulfilled' ? (employments.value.data || []).filter((e) => !e.approved).length : '—',
        recentAgencies: agencies.status === 'fulfilled' ? (agencies.value.data || []).slice(0, 5) : [],
        recentEmployments: employments.status === 'fulfilled' ? (employments.value.data || []).slice(0, 5) : [],
        recentUsers: users.status === 'fulfilled' ? (users.value.data || []).slice(0, 5) : [],
      }
    },
  })
}

function MiniTable({ title, color, rows, emptyMsg }) {
  return (
    <div className="card">
      <div className={`card-header-${color}`} style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '14px 20px' }}>
        <h4 className="card-title-white" style={{ fontSize: 15 }}>{title}</h4>
      </div>
      <div className="card-body" style={{ padding: '8px 0' }}>
        {rows.length === 0 ? (
          <p style={{ color: '#aaa', fontSize: 13, padding: '16px 20px', margin: 0 }}>{emptyMsg}</p>
        ) : rows.map((row, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: '1px solid #f5f5f5' }}>
            {row}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useDashboardStats()

  return (
    <div>
      {/* Stat cards */}
      <div className="row">
        <div className="col-3">
          <StatCard loading={isLoading} color="primary" icon="people" category="Total Users"
            value={stats?.totalUsers} footerIcon="people" footerText="View Users" footerLink="/admin/users" />
        </div>
        <div className="col-3">
          <StatCard loading={isLoading} color="info" icon="foundation" category="Total Agencies"
            value={stats?.totalAgencies} footerIcon="foundation" footerText="View Applications" footerLink="/admin/agency-applications" />
        </div>
        <div className="col-3">
          <StatCard loading={isLoading} color="warning" icon="hourglass_empty" category="Pending Agencies"
            value={stats?.pendingAgencies} footerIcon="pending" footerText="Needs Review" footerLink="/admin/agency-applications" />
        </div>
        <div className="col-3">
          <StatCard loading={isLoading} color="success" icon="work" category="Total Employment Apps"
            value={stats?.totalEmployments} footerIcon="work" footerText="View Applications" footerLink="/admin/employments" />
        </div>
      </div>

      <div className="row" style={{ marginTop: 24 }}>
        {/* Quick Actions */}
        <div className="col-4">
          <div className="card">
            <div className="card-header-primary" style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '14px 20px' }}>
              <h4 className="card-title-white" style={{ fontSize: 15 }}>Quick Actions</h4>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link to="/admin/agency-applications" className="btn btn-primary" style={{ justifyContent: 'flex-start' }}>
                  <span className="material-icons">foundation</span>
                  Agency Applications
                  {!isLoading && stats?.pendingAgencies > 0 && (
                    <span style={{ marginLeft: 'auto', background: '#fff', color: '#222f3e', borderRadius: 12, padding: '1px 8px', fontSize: 11, fontWeight: 600 }}>
                      {stats.pendingAgencies} pending
                    </span>
                  )}
                </Link>
                <Link to="/admin/employments" className="btn btn-info" style={{ justifyContent: 'flex-start' }}>
                  <span className="material-icons">work</span>
                  Employment Applications
                  {!isLoading && stats?.pendingEmployments > 0 && (
                    <span style={{ marginLeft: 'auto', background: '#fff', color: '#006064', borderRadius: 12, padding: '1px 8px', fontSize: 11, fontWeight: 600 }}>
                      {stats.pendingEmployments} pending
                    </span>
                  )}
                </Link>
                <Link to="/admin/users/add-director" className="btn btn-success" style={{ justifyContent: 'flex-start' }}>
                  <span className="material-icons">person_add</span>
                  Add Program Director
                </Link>
                <Link to="/admin/users/add" className="btn btn-warning" style={{ justifyContent: 'flex-start', color: '#fff' }}>
                  <span className="material-icons">how_to_reg</span>
                  Register Staff User
                </Link>
                <Link to="/admin/users" className="btn btn-light" style={{ justifyContent: 'flex-start' }}>
                  <span className="material-icons">manage_accounts</span>
                  Manage All Users
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Agency Applications */}
        <div className="col-4">
          {isLoading ? <Spinner /> : (
            <MiniTable
              title="Recent Agency Applications"
              color="info"
              emptyMsg="No agency applications yet."
              rows={(stats?.recentAgencies || []).map((a) => (
                <>
                  <span className="material-icons" style={{ fontSize: 18, color: a.approved ? '#43a047' : '#fb8c00', flexShrink: 0 }}>
                    {a.approved ? 'check_circle' : 'hourglass_empty'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <Link to={`/admin/agency-applications/${a._id}`} style={{ fontSize: 13, fontWeight: 500, color: '#3c4858', textDecoration: 'none' }}>{a.name}</Link>
                    <div style={{ fontSize: 11, color: '#aaa' }}>{a.location}</div>
                  </div>
                  <span style={{ fontSize: 11, color: '#aaa' }}>{formatDate(a.createdAt)}</span>
                </>
              ))}
            />
          )}
        </div>

        {/* Recent Employment Applications */}
        <div className="col-4">
          {isLoading ? <Spinner /> : (
            <MiniTable
              title="Recent Employment Applications"
              color="warning"
              emptyMsg="No employment applications yet."
              rows={(stats?.recentEmployments || []).map((e) => (
                <>
                  <span className="material-icons" style={{ fontSize: 18, color: e.approved ? '#43a047' : '#fb8c00', flexShrink: 0 }}>
                    {e.approved ? 'check_circle' : 'hourglass_empty'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <Link to={`/admin/employments/${e._id}`} style={{ fontSize: 13, fontWeight: 500, color: '#3c4858', textDecoration: 'none' }}>
                      {e.firstName} {e.lastName}
                    </Link>
                    <div style={{ fontSize: 11, color: '#aaa' }}>{e.agency?.name || '—'}</div>
                  </div>
                  <span style={{ fontSize: 11, color: '#aaa' }}>{formatDate(e.createdAt)}</span>
                </>
              ))}
            />
          )}
        </div>
      </div>

      {/* Recent Users */}
      <div className="row" style={{ marginTop: 0 }}>
        <div className="col-12">
          {isLoading ? null : (
            <div className="card">
              <div className="card-header-success" style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 className="card-title-white" style={{ fontSize: 15 }}>Recently Joined Users</h4>
                <Link to="/admin/users" style={{ fontSize: 12, color: 'rgba(255,255,255,.8)' }}>View all →</Link>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #eee' }}>
                      {['Name', 'Email', 'Role', 'Joined'].map((h) => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#222f3e', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.5px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.recentUsers || []).length === 0 ? (
                      <tr><td colSpan={4} style={{ padding: 20, color: '#aaa', textAlign: 'center' }}>No users yet.</td></tr>
                    ) : (stats?.recentUsers || []).map((u) => (
                      <tr key={u._id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                        <td style={{ padding: '10px 16px', fontWeight: 500, color: '#3c4858' }}>
                          <Link to={`/admin/users/${u._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            {u.firstName} {u.lastName}
                          </Link>
                        </td>
                        <td style={{ padding: '10px 16px', color: '#777' }}>{u.email}</td>
                        <td style={{ padding: '10px 16px' }}>
                          <span className={`badge badge-${u.role === 'director' ? 'primary' : u.role === 'nurse' ? 'success' : u.role === 'caregiver' ? 'warning' : 'info'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '10px 16px', color: '#aaa', fontSize: 12 }}>{formatDate(u.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}