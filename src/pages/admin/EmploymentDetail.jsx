import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useEmployment, useApproveEmployment, useDeleteEmployment } from '../../api/employment.api'
import { StatusBadge, Spinner, Alert } from '../../components/shared'
import useAuthStore from '../../store/authStore'
import axiosClient from '../../api/axiosClient'

function Field({ label, value }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color: '#3c4858' }}>{value || '—'}</div>
    </div>
  )
}

function DocRow({ label, value }) {
  const [loading, setLoading] = useState(false)
  const s3Key = value?.file || (typeof value === 'string' ? value : null)

  const handleView = async () => {
    if (!s3Key) return
    setLoading(true)
    try {
      const { data } = await axiosClient.get(`/employment/signed-url?key=${encodeURIComponent(s3Key)}`)
      window.open(data.url, '_blank', 'noopener,noreferrer')
    } catch {
      alert('Could not load document. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!s3Key) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
      <span className="material-icons" style={{ fontSize: 18, color: '#ccc' }}>insert_drive_file</span>
      <span style={{ flex: 1, fontSize: 13, color: '#aaa' }}>{label}</span>
      <span style={{ fontSize: 12, color: '#ccc' }}>Not uploaded</span>
    </div>
  )

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
      <span className="material-icons" style={{ fontSize: 18, color: '#43a047' }}>check_circle</span>
      <span style={{ flex: 1, fontSize: 13, color: '#3c4858' }}>{label}</span>
      {value?.expiry && <span style={{ fontSize: 12, color: '#999' }}>Expires: {value.expiry}</span>}
      <button
        onClick={handleView}
        disabled={loading}
        className="btn btn-info btn-sm btn-round"
        style={{ padding: '4px 12px', fontSize: 12 }}
      >
        <span className="material-icons" style={{ fontSize: 14 }}>
          {loading ? 'hourglass_empty' : 'visibility'}
        </span>
        {loading ? 'Loading…' : 'View'}
      </button>
    </div>
  )
}

export default function EmploymentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const { data, isLoading, error } = useEmployment(id)
  const approveMutation = useApproveEmployment()
  const deleteMutation = useDeleteEmployment()
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const [showApprove, setShowApprove] = useState(false)
  const [selectedRole, setSelectedRole] = useState('caregiver')

  const emp = data?.data

  const basePath = user?.role === 'admin' ? '/admin' : '/director'

  const handleApprove = async () => {
    setActionError(''); setActionSuccess('')
    try {
      await approveMutation.mutateAsync({ id, role: selectedRole })
      qc.invalidateQueries({ queryKey: ['employment', id] })
      qc.invalidateQueries({ queryKey: ['employments'] })
      setShowApprove(false)
      setActionSuccess(`Application approved. ${emp.firstName} has been created as a ${selectedRole} and credentials emailed.`)
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Approval failed')
      setShowApprove(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this application? This cannot be undone.')) return
    try {
      await deleteMutation.mutateAsync(id)
      navigate(`${basePath}/employments`)
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Delete failed')
    }
  }

  if (isLoading) return <Spinner />
  if (error || !emp) return <Alert type="error" message="Application not found." />

  return (
    <div>
      <Alert type="error" message={actionError} />
      {actionSuccess && <Alert type="success" message={actionSuccess} />}

      {/* Approve modal */}
      {showApprove && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 28, maxWidth: 420, width: '100%', margin: '0 20px' }}>
            <h4 style={{ margin: '0 0 8px', color: '#3c4858', fontWeight: 400 }}>Approve Application</h4>
            <p style={{ color: '#555', fontSize: 14, margin: '0 0 20px' }}>
              Approving <strong>{emp.firstName} {emp.lastName}</strong>. A staff account will be created and credentials emailed to <strong>{emp.email}</strong>.
            </p>
            <div className="form-group">
              <label className="form-label">Assign Role *</label>
              <select className="form-control-box" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                <option value="caregiver">Direct Care Giver</option>
                <option value="nurse">Nurse</option>
              </select>
            </div>
            <div style={{ fontSize: 13, color: '#1565c0', background: '#e3f2fd', padding: '10px 14px', borderRadius: 4, marginBottom: 20 }}>
              <span className="material-icons" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 6 }}>info</span>
              Login credentials will be emailed automatically. This action cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-success btn-round" onClick={handleApprove} disabled={approveMutation.isPending}>
                {approveMutation.isPending ? 'Approving…' : 'Confirm & Approve'}
              </button>
              <button className="btn btn-light btn-round" onClick={() => setShowApprove(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header-primary" style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h4 className="card-title-white">Employment Application</h4>
            <p className="card-subtitle-white">{emp.firstName} {emp.lastName} — #{emp.applicationId}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {!emp.approved && (
              <button className="btn btn-success btn-sm btn-round" onClick={() => setShowApprove(true)}>
                <span className="material-icons" style={{ fontSize: 16 }}>check_circle</span>
                Approve
              </button>
            )}
            <button className="btn btn-danger btn-sm btn-round" onClick={handleDelete} disabled={deleteMutation.isPending}>
              <span className="material-icons" style={{ fontSize: 16 }}>delete</span>
              Delete
            </button>
            <button className="btn btn-light btn-sm btn-round" onClick={() => navigate(`${basePath}/employments`)}>
              ← Back
            </button>
          </div>
        </div>

        <div className="card-body">
          <div style={{ marginBottom: 20 }}>
            <StatusBadge value={emp.approved ? 'Approved' : 'Pending'} />
            {emp.approved && <span style={{ marginLeft: 8, fontSize: 13, color: '#999' }}>Staff account created</span>}
          </div>

          {/* Personal Info */}
          <div className="section-header">Personal Information</div>
          <div className="row">
            <div className="col-4"><Field label="First Name" value={emp.firstName} /></div>
            <div className="col-4"><Field label="Last Name" value={emp.lastName} /></div>
            <div className="col-4"><Field label="Application ID" value={`#${emp.applicationId}`} /></div>
            <div className="col-4"><Field label="Email" value={emp.email} /></div>
            <div className="col-4"><Field label="Phone" value={`${emp.country || ''} ${emp.phone || ''}`} /></div>
            <div className="col-4"><Field label="SSN" value={emp.ssn ? `***-**-${String(emp.ssn).slice(-4)}` : '—'} /></div>
            <div className="col-6"><Field label="Address" value={emp.address} /></div>
            <div className="col-6"><Field label="High School" value={emp.highSchool} /></div>
            <div className="col-6"><Field label="Agency" value={emp.agency?.name} /></div>
            <div className="col-6"><Field label="Agency Location" value={emp.agency?.location} /></div>
          </div>

          {/* References */}
          <div className="section-header" style={{ marginTop: 8 }}>References</div>
          {emp.references?.length > 0 ? (
            <div className="row">
              {emp.references.map((ref, i) => (
                <div key={i} className="col-6">
                  <div style={{ background: '#f9f9f9', borderRadius: 6, padding: '12px 16px', marginBottom: 12 }}>
                    <div style={{ fontWeight: 500, fontSize: 14, color: '#3c4858', marginBottom: 4 }}>Reference {i + 1}</div>
                    <div style={{ fontSize: 13, color: '#555', fontWeight: 500 }}>{ref.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <span className="material-icons" style={{ fontSize: 14, color: '#aaa' }}>mail</span>
                      <span style={{ fontSize: 13, color: '#777' }}>{ref.email || ref.phone || '—'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#aaa', fontSize: 14 }}>No references provided.</p>
          )}

          {/* Documents */}
          <div className="section-header" style={{ marginTop: 8 }}>Uploaded Documents</div>
          <div style={{ maxWidth: 600 }}>
            <DocRow label="Government ID" value={emp.idCard} />
            <DocRow label="Social Security Card" value={emp.ssCard} />
            <DocRow label="High School Certificate" value={emp.highSchoolCert} />
            <DocRow label="Auto Insurance" value={emp.autoInsurance} />
          </div>

          {/* Timeline */}
          <div className="section-header" style={{ marginTop: 24 }}>Timeline</div>
          <div className="row">
            <div className="col-4"><Field label="Applied On" value={emp.createdAt ? new Date(emp.createdAt).toLocaleString() : '—'} /></div>
            <div className="col-4"><Field label="Last Updated" value={emp.updatedAt ? new Date(emp.updatedAt).toLocaleString() : '—'} /></div>
          </div>
        </div>
      </div>
    </div>
  )
}