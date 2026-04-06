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

const STATUS_COLORS = { pending: 'warning', ongoing: 'info', completed: 'success', cancelled: 'danger' }

function useDirectorStats() {
  return useQuery({
    queryKey: ['director-dashboard-stats'],
    queryFn: async () => {
      const [consumers, employments, appointments, forms] = await Promise.allSettled([
        axiosClient.get('/consumers?limit=5').then((r) => r.data),
        axiosClient.get('/employment?limit=5').then((r) => r.data),
        axiosClient.get('/appointments?limit=5').then((r) => r.data),
        axiosClient.get('/consumer-forms?limit=5').then((r) => r.data),
      ])
      return {
        totalConsumers: consumers.status === 'fulfilled' ? (consumers.value.total ?? 0) : '—',
        activeConsumers: consumers.status === 'fulfilled' ? (consumers.value.data || []).filter((c) => c.isActive !== false).length : '—',
        totalEmployments: employments.status === 'fulfilled' ? (employments.value.total ?? 0) : '—',
        pendingEmployments: employments.status === 'fulfilled' ? (employments.value.data || []).filter((e) => !e.approved).length : '—',
        totalAppointments: appointments.status === 'fulfilled' ? (appointments.value.total ?? 0) : '—',
        upcomingAppointments: appointments.status === 'fulfilled'
          ? (appointments.value.data || []).filter((a) => ['pending', 'ongoing'].includes(a.status))
          : [],
        recentForms: forms.status === 'fulfilled' ? (forms.value.data || []) : [],
        totalForms: forms.status === 'fulfilled' ? (forms.value.total ?? 0) : '—',
      }
    },
  })
}

export default function DirectorDashboard() {
  const { data: stats, isLoading } = useDirectorStats()

  return (
    <div>
      {/* Stat cards */}
      <div className="row">
        <div className="col-3">
          <StatCard loading={isLoading} color="primary" icon="people" category="Total Consumers"
            value={stats?.totalConsumers} footerIcon="people" footerText="View Consumers" footerLink="/director/consumers" />
        </div>
        <div className="col-3">
          <StatCard loading={isLoading} color="success" icon="description" category="Total Forms Filed"
            value={stats?.totalForms} footerIcon="date_range" footerText="View Forms" footerLink="/director/forms/consumer" />
        </div>
        <div className="col-3">
          <StatCard loading={isLoading} color="info" icon="event" category="Total Appointments"
            value={stats?.totalAppointments} footerIcon="event" footerText="View Appointments" footerLink="/director/appointments" />
        </div>
        <div className="col-3">
          <StatCard loading={isLoading} color="warning" icon="work" category="Employment Applications"
            value={stats?.totalEmployments} footerIcon="work" footerText="View Applications" footerLink="/director/employments" />
        </div>
      </div>

      <div className="row" style={{ marginTop: 24 }}>
        {/* Quick Actions */}
        <div className="col-3">
          <div className="card">
            <div className="card-header-primary" style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '14px 20px' }}>
              <h4 className="card-title-white" style={{ fontSize: 15 }}>Quick Actions</h4>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link to="/director/consumers/add" className="btn btn-primary" style={{ justifyContent: 'flex-start' }}>
                  <span className="material-icons">person_add</span> Add Consumer
                </Link>
                <Link to="/director/appointments" className="btn btn-info" style={{ justifyContent: 'flex-start' }}>
                  <span className="material-icons">event</span> Book Appointment
                </Link>
                <Link to="/director/employments" className="btn btn-warning" style={{ justifyContent: 'flex-start', color: '#fff' }}>
                  <span className="material-icons">work</span>
                  Review Employments
                  {!isLoading && stats?.pendingEmployments > 0 && (
                    <span style={{ marginLeft: 'auto', background: '#fff', color: '#e65100', borderRadius: 12, padding: '1px 8px', fontSize: 11, fontWeight: 600 }}>
                      {stats.pendingEmployments}
                    </span>
                  )}
                </Link>
                <Link to="/director/staff" className="btn btn-success" style={{ justifyContent: 'flex-start' }}>
                  <span className="material-icons">badge</span> My Staff
                </Link>
                <Link to="/director/forms/consumer" className="btn btn-light" style={{ justifyContent: 'flex-start' }}>
                  <span className="material-icons">description</span> Consumer Forms
                </Link>
              </div>
            </div>
          </div>

          {/* Consumer breakdown */}
          <div className="card" style={{ marginTop: 0 }}>
            <div className="card-header-success" style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '14px 20px' }}>
              <h4 className="card-title-white" style={{ fontSize: 15 }}>Consumer Status</h4>
            </div>
            <div className="card-body">
              {[
                { label: 'Active Consumers', value: stats?.activeConsumers, icon: 'check_circle', color: '#43a047' },
                { label: 'Total Consumers', value: stats?.totalConsumers, icon: 'people', color: '#222f3e' },
                { label: 'Total Forms Filed', value: stats?.totalForms, icon: 'description', color: '#00acc1' },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <span className="material-icons" style={{ fontSize: 18, color: item.color }}>{item.icon}</span>
                  <span style={{ flex: 1, fontSize: 13, color: '#555' }}>{item.label}</span>
                  <span style={{ fontWeight: 600, color: '#3c4858' }}>{isLoading ? '…' : item.value ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming appointments */}
        <div className="col-5">
          <div className="card">
            <div className="card-header-info" style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 className="card-title-white" style={{ fontSize: 15 }}>Upcoming Appointments</h4>
              <Link to="/director/appointments" style={{ fontSize: 12, color: 'rgba(255,255,255,.8)' }}>View all →</Link>
            </div>
            <div className="card-body" style={{ padding: '8px 0' }}>
              {isLoading ? <Spinner /> : (stats?.upcomingAppointments || []).length === 0 ? (
                <p style={{ color: '#aaa', fontSize: 13, padding: '16px 20px', margin: 0 }}>No upcoming appointments.</p>
              ) : (stats?.upcomingAppointments || []).map((a) => (
                <div key={a._id} style={{ padding: '10px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ background: '#e3f2fd', borderRadius: 6, padding: '6px 10px', textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: '#1565c0', fontWeight: 500 }}>
                      {a.dateOfAppointment ? new Date(a.dateOfAppointment).toLocaleDateString('en-US', { month: 'short' }) : '—'}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#1565c0', lineHeight: 1 }}>
                      {a.dateOfAppointment ? new Date(a.dateOfAppointment).getDate() : '—'}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#3c4858' }}>
                      {a.consumer?.firstName} {a.consumer?.lastName}
                    </div>
                    <div style={{ fontSize: 12, color: '#777' }}>{a.reason}</div>
                    <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
                      {a.time} · {a.staff?.firstName} {a.staff?.lastName}
                    </div>
                  </div>
                  <span className={`badge badge-${STATUS_COLORS[a.status] || 'default'}`} style={{ fontSize: 10 }}>{a.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent forms filed */}
        <div className="col-4">
          <div className="card">
            <div className="card-header-warning" style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 className="card-title-white" style={{ fontSize: 15 }}>Recent Forms Filed</h4>
              <Link to="/director/forms/consumer" style={{ fontSize: 12, color: 'rgba(255,255,255,.8)' }}>View all →</Link>
            </div>
            <div className="card-body" style={{ padding: '8px 0' }}>
              {isLoading ? <Spinner /> : (stats?.recentForms || []).length === 0 ? (
                <p style={{ color: '#aaa', fontSize: 13, padding: '16px 20px', margin: 0 }}>No forms filed yet.</p>
              ) : (stats?.recentForms || []).map((f) => (
                <div key={f._id} style={{ padding: '10px 20px', borderBottom: '1px solid #f5f5f5' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#3c4858' }}>{f.formName}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                    <span style={{ fontSize: 11, color: '#aaa' }}>
                      {f.consumer?.firstName} {f.consumer?.lastName} · LC: {f.lcNumber}
                    </span>
                    <span style={{ fontSize: 11, color: '#aaa' }}>{formatDate(f.createdAt)}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                    Filed by: {f.staff?.firstName} {f.staff?.lastName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}