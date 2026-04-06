import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axiosClient from '../../api/axiosClient'
import { StatusBadge, Spinner, Alert } from '../../components/shared'
import { formatDateTime } from '../../utils/dateFormat'

function Field({ label, value }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: '#3c4858' }}>{value || '—'}</div>
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
      <span className="material-icons" style={{ fontSize: 18, color: '#222f3e', flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 13, color: '#aaa', width: 130, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 14, color: '#3c4858' }}>{value}</span>
    </div>
  )
}

const roleColors = { nurse: 'success', caregiver: 'warning' }

export default function StaffDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery({
    queryKey: ['staff', id],
    queryFn: () => axiosClient.get(`/users/${id}`).then((r) => r.data),
    enabled: !!id,
  })

  const { data: empData } = useQuery({
    queryKey: ['staff-employment', id],
    queryFn: () =>
      axiosClient.get('/employment', { params: { limit: 500 } }).then((r) => {
        const staff = data?.data
        return (r.data.data || []).find((e) => e.email === staff?.email) || null
      }),
    enabled: !!data?.data,
  })

  const staff = data?.data
  if (isLoading) return <Spinner />
  if (error || !staff) return <Alert type="error" message="Staff member not found." />

  const initials = `${staff.firstName?.[0] ?? ''}${staff.lastName?.[0] ?? ''}`.toUpperCase()
  const roleColor = roleColors[staff.role] || 'default'
  const roleLabel = staff.role === 'caregiver' ? 'Direct Care Giver' : 'Nurse'

  return (
    <div>
      <div className="row">
        {/* Left column — profile card */}
        <div className="col-4">
          <div className="card">
            <div
              className={`card-header-${roleColor === 'success' ? 'success' : 'warning'}`}
              style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '28px 20px 48px', textAlign: 'center' }}
            />
            <div style={{ textAlign: 'center', marginTop: -36, position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'linear-gradient(60deg,#2d3e50,#222f3e)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 28, fontWeight: 500,
                border: '3px solid #fff',
                boxShadow: '0 4px 10px rgba(0,0,0,.15)',
              }}>
                {initials}
              </div>
            </div>
            <div className="card-body" style={{ textAlign: 'center', paddingTop: 12 }}>
              <h4 style={{ margin: '0 0 4px', fontWeight: 500, color: '#3c4858', fontSize: 18 }}>
                {staff.firstName} {staff.lastName}
              </h4>
              <div style={{ fontSize: 13, color: '#999', marginBottom: 12 }}>{staff.email}</div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                <span className={`badge badge-${roleColor}`}>{roleLabel}</span>
                <StatusBadge value={staff.active !== false ? 'Active' : 'Inactive'} />
              </div>

              <div style={{ marginTop: 24, textAlign: 'left' }}>
                <InfoRow icon="phone" label="Phone" value={staff.phone} />
                <InfoRow icon="home" label="Address" value={staff.address} />
                <InfoRow icon="foundation" label="Agency" value={staff.agency?.name} />
                <InfoRow icon="location_on" label="Location" value={staff.agency?.location} />
                <InfoRow icon="calendar_today" label="Joined"
                  value={staff.createdAt ? formatDateTime(staff.createdAt) : null} />
              </div>

              <button
                className="btn btn-light btn-round btn-block"
                style={{ marginTop: 20 }}
                onClick={() => navigate('/director/staff')}
              >
                ← Back to Staff
              </button>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="col-8">
          {/* Account details */}
          <div className="card">
            <div className="card-header-primary" style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '16px 20px' }}>
              <h4 className="card-title-white">Account Details</h4>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-4"><Field label="First Name" value={staff.firstName} /></div>
                <div className="col-4"><Field label="Last Name" value={staff.lastName} /></div>
                <div className="col-4"><Field label="Role" value={roleLabel} /></div>
                <div className="col-6"><Field label="Email" value={staff.email} /></div>
                <div className="col-6"><Field label="Phone" value={staff.phone} /></div>
                <div className="col-6"><Field label="Address" value={staff.address} /></div>
                <div className="col-6">
                  <Field label="SSN" value={staff.ssn ? `***-**-${String(staff.ssn).slice(-4)}` : null} />
                </div>
                {staff.bio && (
                  <div className="col-12"><Field label="Bio" value={staff.bio} /></div>
                )}
              </div>
            </div>
          </div>

          {/* Employment application summary */}
          {empData && (
            <div className="card">
              <div className="card-header-info" style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h4 className="card-title-white">Employment Application</h4>
                <span style={{ background: 'rgba(255,255,255,.2)', color: '#fff', borderRadius: 12, padding: '2px 10px', fontSize: 12 }}>
                  #{empData.applicationId}
                </span>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-6"><Field label="High School" value={empData.highSchool} /></div>
                  <div className="col-6">
                    <Field label="Applied On"
                      value={empData.createdAt ? formatDateTime(empData.createdAt) : null} />
                  </div>
                </div>

                {empData.references?.length > 0 && (
                  <>
                    <div className="section-header">References</div>
                    <div className="row">
                      {empData.references.map((ref, i) => (
                        <div key={i} className="col-6">
                          <div style={{ background: '#f9f9f9', borderRadius: 6, padding: '12px 16px' }}>
                            <div style={{ fontWeight: 500, fontSize: 13, color: '#3c4858', marginBottom: 6 }}>
                              Reference {i + 1}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                              <span className="material-icons" style={{ fontSize: 14, color: '#aaa' }}>person</span>
                              <span style={{ fontSize: 13, color: '#555' }}>{ref.name}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span className="material-icons" style={{ fontSize: 14, color: '#aaa' }}>mail</span>
                              <span style={{ fontSize: 13, color: '#777' }}>{ref.email || ref.phone || '—'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="section-header" style={{ marginTop: 16 }}>Documents</div>
                {[
                  { label: 'Government ID', value: empData.idCard, expiry: empData.idCard?.expiry },
                  { label: 'Social Security Card', value: empData.ssCard },
                  { label: 'High School Certificate', value: empData.highSchoolCert },
                  { label: 'Auto Insurance', value: empData.autoInsurance },
                ].map((doc) => {
                  const uploaded = doc.value?.file || (typeof doc.value === 'string' && doc.value)
                  return (
                    <div key={doc.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                      <span className="material-icons" style={{ fontSize: 16, color: uploaded ? '#43a047' : '#ccc' }}>
                        {uploaded ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span style={{ flex: 1, fontSize: 13, color: uploaded ? '#3c4858' : '#aaa' }}>{doc.label}</span>
                      {doc.expiry && (
                        <span style={{ fontSize: 12, color: '#999' }}>Expires: {doc.expiry}</span>
                      )}
                      <span className={`badge ${uploaded ? 'badge-success' : 'badge-default'}`}>
                        {uploaded ? 'Uploaded' : 'Not uploaded'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="card">
            <div className="card-header-warning" style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '16px 20px' }}>
              <h4 className="card-title-white">Timeline</h4>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-6">
                  <Field label="Account Created"
                    value={staff.createdAt ? formatDateTime(staff.createdAt) : '—'} />
                </div>
                <div className="col-6">
                  <Field label="Last Updated"
                    value={staff.updatedAt ? formatDateTime(staff.updatedAt) : '—'} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}