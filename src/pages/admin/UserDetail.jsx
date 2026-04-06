import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axiosClient from '../../api/axiosClient'
import { StatusBadge, Spinner, Alert } from '../../components/shared'

function Field({ label, value }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color: '#3c4858' }}>{value || '—'}</div>
    </div>
  )
}

const roleColors = { admin: 'info', director: 'primary', nurse: 'success', caregiver: 'warning' }

export default function UserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => axiosClient.get(`/users/${id}`).then((r) => r.data),
    enabled: !!id,
  })

  const user = data?.data

  if (isLoading) return <Spinner />
  if (error || !user) return <Alert type="error" message="User not found." />

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()

  return (
    <div>
      <div className="card">
        <div className="card-header-primary" style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h4 className="card-title-white">User Details</h4>
            <p className="card-subtitle-white">{user.firstName} {user.lastName}</p>
          </div>
          <button className="btn btn-light btn-sm btn-round" onClick={() => navigate('/admin/users')}>
            ← Back
          </button>
        </div>

        <div className="card-body">
          <div style={{ display: 'flex', gap: 24, marginBottom: 28, alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(60deg,#2d3e50,#222f3e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 24, fontWeight: 500, flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 400, color: '#3c4858' }}>{user.firstName} {user.lastName}</div>
              <div style={{ fontSize: 13, color: '#999', marginTop: 2 }}>{user.email}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <span className={`badge badge-${roleColors[user.role] || 'default'}`}>{user.role}</span>
                <StatusBadge value={user.active !== false ? 'Active' : 'Inactive'} />
              </div>
            </div>
          </div>

          <div className="section-header">Account Information</div>
          <div className="row">
            <div className="col-4"><Field label="First Name" value={user.firstName} /></div>
            <div className="col-4"><Field label="Last Name" value={user.lastName} /></div>
            <div className="col-4"><Field label="Role" value={user.role} /></div>
            <div className="col-4"><Field label="Email" value={user.email} /></div>
            <div className="col-4"><Field label="Phone" value={user.phone} /></div>
            <div className="col-4"><Field label="SSN" value={user.ssn ? `***-**-${String(user.ssn).slice(-4)}` : '—'} /></div>
            <div className="col-12"><Field label="Address" value={user.address} /></div>
            <div className="col-12"><Field label="Bio" value={user.bio} /></div>
          </div>

          {user.agency && (
            <>
              <div className="section-header" style={{ marginTop: 8 }}>Agency</div>
              <div className="row">
                <div className="col-4"><Field label="Agency Name" value={user.agency?.name} /></div>
                <div className="col-4"><Field label="Location" value={user.agency?.location} /></div>
              </div>
            </>
          )}

          <div className="section-header" style={{ marginTop: 8 }}>Timeline</div>
          <div className="row">
            <div className="col-4"><Field label="Joined" value={user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'} /></div>
            <div className="col-4"><Field label="Last Updated" value={user.updatedAt ? new Date(user.updatedAt).toLocaleString() : '—'} /></div>
          </div>
        </div>
      </div>
    </div>
  )
}
