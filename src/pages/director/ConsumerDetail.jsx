import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useConsumer } from '../../api/consumers.api'
import { Spinner, Alert } from '../../components/shared'
import useAuthStore from '../../store/authStore'
import axiosClient from '../../api/axiosClient'
import { formatDateTime } from '../../utils/dateFormat'

function Field({ label, value }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color: '#3c4858' }}>{value || '—'}</div>
    </div>
  )
}

function formatChange(change) {
  if (!change.includes('"service"') && !change.includes('T00:00:00.000Z')) {
    return change
  }
  if (change.startsWith('dob:')) {
    return change.replace(/(\d{4}-\d{2}-\d{2})T00:00:00\.000Z/g, '$1')
  }
  if (change.startsWith('consumerServices:')) {
    try {
      const match = change.match(/\[.*\]/)
      if (!match) return 'consumerServices: updated'
      const services = JSON.parse(match[0])
      const checked = services.filter((s) => s.checked).map((s) => s.service)
      if (checked.length === 0) return 'consumerServices: all services unchecked'
      return `consumerServices: ${checked.join(', ')}`
    } catch {
      return 'consumerServices: updated'
    }
  }
  return change
}

const DOCS = [
  { key: 'directedPlan', label: 'Person Directed Plan' },
  { key: 'ipc', label: 'Individual Plan of Care (IPC)' },
  { key: 'transferPaper', label: 'Transfer Paper' },
  { key: 'icap', label: 'Inventory for Client and Agency Planning (ICAP)' },
  { key: 'idrc', label: 'Intellectual Disability and Related Condition (IDRC)' },
  { key: 'consumerRights', label: 'Consumer Rights / Choice of Services and Delivery' },
]

function DocRow({ label, doc, sn }) {
  const [loading, setLoading] = useState(false)
  const s3Key = doc?.filename

  const handleView = async () => {
    if (!s3Key) return
    setLoading(true)
    try {
      const { data } = await axiosClient.get(`/consumers/signed-url?key=${encodeURIComponent(s3Key)}`)
      window.open(data.url, '_blank', 'noopener,noreferrer')
    } catch {
      alert('Could not load document.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <tr>
      <td style={{ padding: '10px 12px', color: '#999', fontSize: 13 }}>{sn}.</td>
      <td style={{ padding: '10px 12px', fontSize: 13, color: '#3c4858' }}>{label}</td>
      <td style={{ padding: '10px 12px', fontSize: 13, color: s3Key ? '#43a047' : '#ccc' }}>
        {s3Key ? s3Key.split('/').pop() : 'N/A'}
      </td>
      <td style={{ padding: '10px 12px', fontSize: 13, color: '#555' }}>
        {doc?.expiry && doc.expiry !== 'undefined' ? doc.expiry : 'N/A'}
      </td>
      <td style={{ padding: '10px 12px' }}>
        {s3Key && (
          <button className="btn-icon text-info" onClick={handleView} disabled={loading} title="View document">
            <span className="material-icons" style={{ fontSize: 20 }}>
              {loading ? 'hourglass_empty' : 'description'}
            </span>
          </button>
        )}
      </td>
    </tr>
  )
}

const roleBadgeColor = { director: 'primary', nurse: 'success', caregiver: 'warning' }

export default function ConsumerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const { data, isLoading, error } = useConsumer(id)
  const [deactivating, setDeactivating] = useState(false)
  const [actionError, setActionError] = useState('')

  const consumer = data?.data
  const isDirector = user?.role === 'director'
  const basePath = isDirector ? '/director' : '/staff'

  const deactivate = async (reason) => {
    setDeactivating(true)
    setActionError('')
    try {
      await axiosClient.delete(`/consumers/${id}`, { data: { reason } })
      qc.invalidateQueries({ queryKey: ['consumer', id] })
      qc.invalidateQueries({ queryKey: ['consumers'] })
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Deactivation failed')
    } finally {
      setDeactivating(false)
    }
  }

  if (isLoading) return <Spinner />
  if (error || !consumer) return <Alert type="error" message="Consumer not found." />

  const activeServices = consumer.consumerServices?.filter((s) => s.checked) || []

  return (
    <div>
      <Alert type="error" message={actionError} />
      <div className="card">
        <div
          className="card-header-primary"
          style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}
        >
          <div>
            <h4 className="card-title-white">{consumer.firstName} {consumer.lastName}</h4>
            <p className="card-subtitle-white">Agency: {consumer.agency?.name}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-light btn-sm btn-round" onClick={() => navigate(`${basePath}/consumers/${id}/edit`)}>
              <span className="material-icons" style={{ fontSize: 16 }}>edit</span>
              Edit
            </button>
            {isDirector && consumer.isActive !== false && (
              <button
                className="btn btn-danger btn-sm btn-round"
                disabled={deactivating}
                onClick={() => {
                  const reason = window.prompt('Reason for deactivation (optional):')
                  if (reason === null) return
                  deactivate(reason)
                }}
              >
                <span className="material-icons" style={{ fontSize: 16 }}>person_off</span>
                {deactivating ? 'Deactivating…' : 'Deactivate'}
              </button>
            )}
            <button className="btn btn-light btn-sm btn-round" onClick={() => navigate(`${basePath}/consumers`)}>
              ← Back
            </button>
          </div>
        </div>

        <div className="card-body">
          {/* Info cards */}
          <div className="row" style={{ marginBottom: 20 }}>
            {[
              { label: 'Local Care Number', value: <span style={{ fontSize: 20, fontWeight: 600, color: '#222f3e' }}>{consumer.lcNumber}</span> },
              { label: 'Phone Number', value: consumer.phone },
              { label: 'Date of Birth', value: consumer.dob ? formatDateTime(consumer.dob) : '—' },
              {
                label: 'Behavior Plan',
                value: (
                  <span className={`badge ${consumer.behaviorPlan === 'yes' ? 'badge-warning' : 'badge-default'}`}>
                    {consumer.behaviorPlan === 'yes' ? 'Yes' : 'No'}
                  </span>
                ),
              },
            ].map((item) => (
              <div key={item.label} className="col-3">
                <div style={{ background: '#f9f9f9', borderRadius: 6, padding: '12px 16px' }}>
                  <div style={{ fontSize: 11, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.5px' }}>{item.label}</div>
                  <div style={{ marginTop: 6 }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          <Field label="Address" value={consumer.address} />

          <div className="row">
            {/* Services */}
            <div className="col-6">
              <div className="section-header">Services Provided</div>
              {activeServices.length > 0 ? (
                <ol style={{ paddingLeft: 20, margin: 0 }}>
                  {activeServices.map((s, i) => (
                    <li key={i} style={{ fontSize: 14, color: '#555', padding: '4px 0' }}>{s.service}</li>
                  ))}
                </ol>
              ) : (
                <p style={{ color: '#aaa', fontSize: 14 }}>No services selected.</p>
              )}
            </div>

            {/* Documents */}
            <div className="col-6">
              <div className="section-header">Eligibility and Enrollment Documents</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #eee' }}>
                      {['S/N', 'Document', 'File', 'Expiry', ''].map((h) => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#222f3e', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.5px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DOCS.map((doc, i) => (
                      <DocRow key={doc.key} sn={i + 1} label={doc.label} doc={consumer[doc.key]} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Audit trail */}
          {(consumer.lastUpdatedBy?.name || consumer.deactivatedBy?.name || consumer.updateHistory?.length > 0) && (
            <div style={{ marginTop: 28 }}>
              <div className="section-header">Audit Trail</div>

              {consumer.lastUpdatedBy?.name && (
                <div style={{ background: '#f9f9f9', borderRadius: 6, padding: '12px 16px', marginBottom: 8, fontSize: 13, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span className="material-icons" style={{ fontSize: 16, color: '#aaa' }}>edit</span>
                  <span style={{ color: '#aaa' }}>Last updated by</span>
                  <strong style={{ color: '#3c4858' }}>{consumer.lastUpdatedBy.name}</strong>
                  <span className={`badge badge-${roleBadgeColor[consumer.lastUpdatedBy.role] || 'default'}`}>
                    {consumer.lastUpdatedBy.role}
                  </span>
                  <span style={{ color: '#999', fontSize: 12 }}>
                    {consumer.lastUpdatedBy.at ? new Date(consumer.lastUpdatedBy.at).toLocaleString() : ''}
                  </span>
                </div>
              )}

              {consumer.deactivatedBy?.name && (
                <div style={{ background: '#fff3e0', borderRadius: 6, padding: '12px 16px', marginBottom: 8, fontSize: 13, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span className="material-icons" style={{ fontSize: 16, color: '#e65100' }}>person_off</span>
                  <span style={{ color: '#aaa' }}>Deactivated by</span>
                  <strong style={{ color: '#3c4858' }}>{consumer.deactivatedBy.name}</strong>
                  <span className={`badge badge-${roleBadgeColor[consumer.deactivatedBy.role] || 'default'}`}>
                    {consumer.deactivatedBy.role}
                  </span>
                  <span style={{ color: '#999', fontSize: 12 }}>
                    {consumer.deactivatedBy.at ? new Date(consumer.deactivatedBy.at).toLocaleString() : ''}
                  </span>
                  {consumer.deactivatedBy.reason && (
                    <span style={{ color: '#777', fontStyle: 'italic' }}>— "{consumer.deactivatedBy.reason}"</span>
                  )}
                </div>
              )}

              {consumer.updateHistory?.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>
                    Change History
                  </div>
                  <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                    {[...consumer.updateHistory].reverse().map((entry, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
                        <span className="material-icons" style={{ fontSize: 16, color: '#aaa', marginTop: 2, flexShrink: 0 }}>history</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                            <strong style={{ fontSize: 13, color: '#3c4858' }}>{entry.name}</strong>
                            <span className={`badge badge-${roleBadgeColor[entry.role] || 'default'}`} style={{ fontSize: 10 }}>
                              {entry.role}
                            </span>
                            <span style={{ color: '#999', fontSize: 12 }}>
                              {entry.at ? new Date(entry.at).toLocaleString() : ''}
                            </span>
                          </div>
                          {entry.changes?.map((change, j) => (
                            <div
                              key={j}
                              style={{ fontSize: 12, color: '#777', fontFamily: 'monospace', background: '#f5f5f5', padding: '3px 8px', borderRadius: 3, marginBottom: 3 }}
                            >
                              {formatChange(change)}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}