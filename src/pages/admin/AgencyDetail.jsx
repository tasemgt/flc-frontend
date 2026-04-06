import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAgency, useApproveAgency, useDeleteAgency } from '../../api/agencies.api'
import { useConfirmDirector } from '../../api/users.api'
import { StatusBadge, Spinner, Alert } from '../../components/shared'
import { useState } from 'react'

function Field({ label, value }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color: '#3c4858', fontWeight: 400 }}>{value || '—'}</div>
    </div>
  )
}

export default function AgencyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data, isLoading, error } = useAgency(id)
  const approveMutation = useApproveAgency()
  const deleteMutation = useDeleteAgency()
  const confirmMutation = useConfirmDirector()
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')

  const agency = data?.data
  console.log('Agency Detail:', agency)

  const handleApprove = async () => {
    if (!window.confirm('Approve this agency and create a pending Director account?')) return
    setActionError(''); setActionSuccess('')
    try {
      await approveMutation.mutateAsync(id)
      qc.invalidateQueries({ queryKey: ['agency', id] })
      qc.invalidateQueries({ queryKey: ['agencies'] })
      setActionSuccess('Agency approved. Director account created (unconfirmed).')
    } catch (err) { setActionError(err?.response?.data?.message || 'Approval failed') }
  }

  const handleConfirmDirector = async () => {
    if (!window.confirm('Confirm the director account? This will set a password and send login credentials.')) return
    setActionError(''); setActionSuccess('')
    try {
      await confirmMutation.mutateAsync(agency.agencyId)
      qc.invalidateQueries({ queryKey: ['agency', id] })
      setActionSuccess('Director confirmed and credentials emailed.')
    } catch (err) { setActionError(err?.response?.data?.message || 'Confirmation failed') }
  }

  const handleDelete = async () => {
    if (!window.confirm('Permanently delete this agency application?')) return
    try {
      await deleteMutation.mutateAsync(id)
      navigate('/admin/agency-applications')
    } catch (err) { setActionError(err?.response?.data?.message || 'Delete failed') }
  }

  if (isLoading) return <Spinner />
  if (error || !agency) return <Alert type="error" message="Agency not found." />

  return (
    <div>
      <Alert type="error" message={actionError} />
      {actionSuccess && <Alert type="success" message={actionSuccess} />}

      <div className="card">
        <div className="card-header-primary" style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h4 className="card-title-white">Agency Application Details</h4>
            <p className="card-subtitle-white">{agency.name}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {!agency.approved && (
              <button className="btn btn-success btn-sm btn-round" onClick={handleApprove} disabled={approveMutation.isPending}>
                <span className="material-icons" style={{ fontSize: 16 }}>check_circle</span>
                {approveMutation.isPending ? 'Approving…' : 'Approve Agency'}
              </button>
            )}
            {agency.approved && !agency.directorConfirmed && (
              <button className="btn btn-info btn-sm btn-round" onClick={handleConfirmDirector} disabled={confirmMutation.isPending}>
                <span className="material-icons" style={{ fontSize: 16 }}>person_add</span>
                {confirmMutation.isPending ? 'Confirming…' : 'Confirm Director'}
              </button>
            )}
            <button className="btn btn-danger btn-sm btn-round" onClick={handleDelete} disabled={deleteMutation.isPending}>
              <span className="material-icons" style={{ fontSize: 16 }}>delete</span>
              Delete
            </button>
            <button className="btn btn-light btn-sm btn-round" onClick={() => navigate(-1)}>
              ← Back
            </button>
          </div>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            <StatusBadge value={agency.approved ? 'Approved' : 'Pending'} />
            {agency.directorConfirmed && <StatusBadge value="Director Confirmed" />}
          </div>

          <div className="section-header">Agency Information</div>
          <div className="row">
            <div className="col-4"><Field label="Agency Name" value={agency.name} /></div>
            <div className="col-4"><Field label="Location" value={agency.location} /></div>
            <div className="col-4"><Field label="Application ID" value={agency.agencyId} /></div>
            <div className="col-12"><Field label="Description" value={agency.description} /></div>
          </div>

          <div className="section-header">Program Director</div>
          {agency.applicant ? (
            <div className="row">
              <div className="col-3"><Field label="Title" value={agency.applicant.title} /></div>
              <div className="col-3"><Field label="First Name" value={agency.applicant.firstName} /></div>
              <div className="col-3"><Field label="Last Name" value={agency.applicant.lastName} /></div>
              <div className="col-3"><Field label="Email" value={agency.applicant.email} /></div>
              <div className="col-3"><Field label="Phone" value={`${agency.applicant.country || ''} ${agency.applicant.phone || ''}`} /></div>
              <div className="col-3"><Field label="SSN" value={agency.applicant.ssn ? '***-**-' + String(agency.applicant.ssn).slice(-4) : '—'} /></div>
              <div className="col-12"><Field label="Bio" value={agency.applicant.bio} /></div>
            </div>
          ) : (
            <p style={{ color: '#aaa', fontSize: 14 }}>No director information available.</p>
          )}

          <div className="section-header">Application Timeline</div>
          <div className="row">
            <div className="col-4"><Field label="Applied On" value={agency.createdAt ? new Date(agency.createdAt).toLocaleString() : '—'} /></div>
            <div className="col-4"><Field label="Approved On" value={agency.approvedAt ? new Date(agency.approvedAt).toLocaleString() : '—'} /></div>
          </div>
        </div>
      </div>
    </div>
  )
}
