import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import axiosClient from '../../api/axiosClient'
import { Spinner } from '../../components/shared'
import { formatDate } from '../../utils/dateFormat'
import useAuthStore from '../../store/authStore'

const STATUS_COLORS = { pending: 'warning', ongoing: 'info', completed: 'success', cancelled: 'danger' }

function useStaffStats() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['staff-dashboard-stats'],
    queryFn: async () => {
      const [appointments, forms, consumers] = await Promise.allSettled([
        axiosClient.get(`/appointments?staff=${user._id}&limit=10`).then((r) => r.data),
        axiosClient.get(`/consumer-forms?limit=5`).then((r) => r.data),
        axiosClient.get('/consumers?limit=1').then((r) => r.data),
      ])
      const allAppts = appointments.status === 'fulfilled' ? (appointments.value.data || []) : []
      return {
        upcomingAppointments: allAppts.filter((a) => ['pending', 'ongoing'].includes(a.status)),
        completedAppointments: allAppts.filter((a) => a.status === 'completed').length,
        totalAppointments: appointments.status === 'fulfilled' ? (appointments.value.total ?? 0) : '—',
        recentForms: forms.status === 'fulfilled' ? (forms.value.data || []) : [],
        totalForms: forms.status === 'fulfilled' ? (forms.value.total ?? 0) : '—',
        totalConsumers: consumers.status === 'fulfilled' ? (consumers.value.total ?? 0) : '—',
      }
    },
  })
}

export default function StaffDashboard() {
  const { user } = useAuthStore()
  const { data: stats, isLoading } = useStaffStats()

  return (
    <div>
      {/* Welcome banner */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header-primary" style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '20px 24px' }}>
          <h4 className="card-title-white">Welcome back, {user?.firstName}!</h4>
          <p className="card-subtitle-white">{user?.role === 'nurse' ? 'Nurse' : 'Direct Care Giver'} · {user?.agency?.name}</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="row">
        {[
          { color: 'primary', icon: 'event', label: 'Total Appointments', value: stats?.totalAppointments, link: '/staff/appointments' },
          { color: 'success', icon: 'check_circle', label: 'Completed', value: stats?.completedAppointments, link: '/staff/appointments' },
          { color: 'info', icon: 'description', label: 'Forms Filed', value: stats?.totalForms, link: '/staff/forms/consumer' },
          { color: 'warning', icon: 'people', label: 'Consumers', value: stats?.totalConsumers, link: '/staff/consumers' },
        ].map((item) => (
          <div key={item.label} className="col-3">
            <div className="card card-stats-wrap">
              <div style={{ padding: '0 15px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <div className={`card-icon card-header-${item.color}`} style={{ margin: '-20px 0 0 15px' }}>
                    <span className="material-icons">{item.icon}</span>
                  </div>
                  <div style={{ textAlign: 'right', padding: '10px 10px 0' }}>
                    <p className="card-category">{item.label}</p>
                    <h3 className="card-title-lg">{isLoading ? <span style={{ fontSize: 16, color: '#ccc' }}>…</span> : (item.value ?? 0)}</h3>
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <span className="material-icons">{item.icon}</span>
                <Link to={item.link}>View</Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row" style={{ marginTop: 24 }}>
        {/* My upcoming appointments */}
        <div className="col-7">
          <div className="card">
            <div className="card-header-primary" style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 className="card-title-white" style={{ fontSize: 15 }}>My Upcoming Appointments</h4>
              <Link to="/staff/appointments" style={{ fontSize: 12, color: 'rgba(255,255,255,.8)' }}>View all →</Link>
            </div>
            <div className="card-body" style={{ padding: '8px 0' }}>
              {isLoading ? <Spinner /> : (stats?.upcomingAppointments || []).length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center' }}>
                  <span className="material-icons" style={{ fontSize: 48, color: '#eee', display: 'block', marginBottom: 8 }}>event_available</span>
                  <p style={{ color: '#aaa', fontSize: 13, margin: 0 }}>No upcoming appointments assigned to you.</p>
                </div>
              ) : (stats?.upcomingAppointments || []).map((a) => (
                <div key={a._id} style={{ padding: '12px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ background: '#e8edf2', borderRadius: 6, padding: '6px 12px', textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 10, color: '#222f3e', fontWeight: 600, textTransform: 'uppercase' }}>
                      {a.dateOfAppointment ? new Date(a.dateOfAppointment).toLocaleDateString('en-US', { month: 'short' }) : '—'}
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#222f3e', lineHeight: 1.1 }}>
                      {a.dateOfAppointment ? new Date(a.dateOfAppointment).getDate() : '—'}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#3c4858' }}>
                      {a.consumer?.firstName} {a.consumer?.lastName}
                    </div>
                    <div style={{ fontSize: 12, color: '#777', margin: '2px 0' }}>{a.reason}</div>
                    <div style={{ fontSize: 11, color: '#aaa' }}>
                      {a.time} · LC: {a.consumer?.lcNumber}
                    </div>
                  </div>
                  <span className={`badge badge-${STATUS_COLORS[a.status] || 'default'}`}>{a.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="col-5">
          {/* Quick actions */}
          <div className="card">
            <div className="card-header-success" style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '14px 20px' }}>
              <h4 className="card-title-white" style={{ fontSize: 15 }}>Quick Actions</h4>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link to="/staff/appointments" className="btn btn-primary" style={{ justifyContent: 'flex-start' }}>
                  <span className="material-icons">event</span> My Appointments
                </Link>
                <Link to="/staff/consumers" className="btn btn-info" style={{ justifyContent: 'flex-start' }}>
                  <span className="material-icons">people</span> View Consumers
                </Link>
                <Link to="/staff/forms/consumer" className="btn btn-warning" style={{ justifyContent: 'flex-start', color: '#fff' }}>
                  <span className="material-icons">description</span> File a Form
                </Link>
              </div>
            </div>
          </div>

          {/* Recent forms */}
          <div className="card">
            <div className="card-header-info" style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '14px 20px' }}>
              <h4 className="card-title-white" style={{ fontSize: 15 }}>Recent Forms Filed</h4>
            </div>
            <div className="card-body" style={{ padding: '8px 0' }}>
              {isLoading ? <Spinner /> : (stats?.recentForms || []).length === 0 ? (
                <p style={{ color: '#aaa', fontSize: 13, padding: '16px 20px', margin: 0 }}>No forms filed yet.</p>
              ) : (stats?.recentForms || []).map((f) => (
                <div key={f._id} style={{ padding: '10px 20px', borderBottom: '1px solid #f5f5f5' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#3c4858' }}>{f.formName}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                    <span style={{ fontSize: 11, color: '#aaa' }}>{f.consumer?.firstName} {f.consumer?.lastName}</span>
                    <span style={{ fontSize: 11, color: '#aaa' }}>{formatDate(f.createdAt)}</span>
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
