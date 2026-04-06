import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAgencies, useApproveAgency } from '../../api/agencies.api'
import { useConfirmDirector } from '../../api/users.api'
import { Alert, Spinner } from '../../components/shared'

export default function AddProgramDirector() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: agenciesData, isLoading: agenciesLoading } = useAgencies({ approved: true, limit: 500 })
  const confirmMutation = useConfirmDirector()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedAgency, setSelectedAgency] = useState(null)

  const agencies = (agenciesData?.data || []).filter((a) => a.approved && !a.directorConfirmed)

  const handleAgencyChange = (e) => {
    const agency = agencies.find((a) => a._id === e.target.value)
    setSelectedAgency(agency || null)
    setError(''); setSuccess('')
  }

  const handleConfirm = async (e) => {
    e.preventDefault()
    if (!selectedAgency) return setError('Please select an agency')
    setError(''); setSuccess('')
    try {
      await confirmMutation.mutateAsync(selectedAgency.agencyId)
      qc.invalidateQueries({ queryKey: ['agencies'] })
      setSuccess(`Director confirmed and credentials emailed to ${selectedAgency.applicant?.email}`)
      setSelectedAgency(null)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to confirm director')
    }
  }

  return (
    <div>
      <div className="card">
        <div className="card-header-primary" style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '16px 20px' }}>
          <h4 className="card-title-white">Add Program Director</h4>
          <p className="card-subtitle-white">Confirm a director account for an approved agency</p>
        </div>
        <div className="card-body">
          <Alert type="error" message={error} />
          {success && <Alert type="success" message={success} />}

          {agenciesLoading ? <Spinner /> : (
            <form onSubmit={handleConfirm}>
              <div style={{ maxWidth: 600 }}>
                <div className="form-group">
                  <label className="form-label">Select Approved Agency *</label>
                  {agencies.length === 0 ? (
                    <p style={{ color: '#999', fontSize: 14, marginTop: 8 }}>
                      No agencies awaiting director confirmation.
                    </p>
                  ) : (
                    <select
                      className="form-control-box"
                      onChange={handleAgencyChange}
                      value={selectedAgency?._id || ''}
                    >
                      <option value="">— Select an agency —</option>
                      {agencies.map((a) => (
                        <option key={a._id} value={a._id}>{a.name} ({a.agencyId})</option>
                      ))}
                    </select>
                  )}
                </div>

                {selectedAgency && (
                  <div style={{ background: '#f9f9f9', borderRadius: 6, padding: 20, marginTop: 16 }}>
                    <div style={{ fontSize: 13, color: '#9c27b0', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 16 }}>
                      Director Details to be Confirmed
                    </div>
                    <div className="row">
                      {[
                        ['Name', `${selectedAgency.applicant?.title || ''} ${selectedAgency.applicant?.firstName || ''} ${selectedAgency.applicant?.lastName || ''}`],
                        ['Email', selectedAgency.applicant?.email],
                        ['Phone', `${selectedAgency.applicant?.country || ''} ${selectedAgency.applicant?.phone || ''}`],
                        ['Agency', selectedAgency.name],
                        ['Location', selectedAgency.location],
                        ['Agency ID', selectedAgency.agencyId],
                      ].map(([label, value]) => (
                        <div key={label} className="col-6" style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</div>
                          <div style={{ fontSize: 14, color: '#3c4858', marginTop: 2 }}>{value || '—'}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 8, padding: '10px 14px', background: '#e3f2fd', borderRadius: 4, fontSize: 13, color: '#1565c0' }}>
                      <span className="material-icons" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 6 }}>info</span>
                      A secure password will be generated and emailed to the director.
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                  {agencies.length > 0 && (
                    <button
                      type="submit"
                      className="btn btn-primary btn-round"
                      disabled={!selectedAgency || confirmMutation.isPending}
                    >
                      <span className="material-icons" style={{ fontSize: 18 }}>person_add</span>
                      {confirmMutation.isPending ? 'Confirming…' : 'Confirm Director & Send Credentials'}
                    </button>
                  )}
                  <button type="button" className="btn btn-light btn-round" onClick={() => navigate(-1)}>
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
