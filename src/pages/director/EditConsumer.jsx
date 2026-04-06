import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useConsumer, useConsumerServices } from '../../api/consumers.api'
import { Spinner, Alert } from '../../components/shared'
import useAuthStore from '../../store/authStore'
import axiosClient from '../../api/axiosClient'

const DOC_FIELDS = [
  { key: 'directedPlan', label: 'Person Directed Plan', hasExpiry: true },
  { key: 'ipc', label: 'Individual Plan of Care (IPC)', hasExpiry: true },
  { key: 'icap', label: 'Inventory for Client and Agency Planning (ICAP)', hasExpiry: true },
  { key: 'idrc', label: 'Intellectual Disability and Related Condition (IDRC)', hasExpiry: true },
  { key: 'consumerRights', label: 'Consumer Rights / Choice of Services and Delivery', hasExpiry: true },
  { key: 'transferPaper', label: 'Transfer Paper', hasExpiry: false },
]

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

function DocUploadRow({ label, hasExpiry, existing, onFileChange, onExpiryChange, newFileName, expiry }) {
  const inputRef = useRef()
  const hasExisting = !!existing?.filename

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f5f5f5', flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontSize: 12, color: '#aaa', marginBottom: 6 }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {hasExisting && !newFileName && (
            <span style={{ fontSize: 12, color: '#43a047', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="material-icons" style={{ fontSize: 14 }}>check_circle</span>
              {existing.filename.split('/').pop()}
            </span>
          )}
          <label
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', border: '1px dashed #ccc', borderRadius: 4, cursor: 'pointer', fontSize: 12, color: '#777' }}
            onClick={() => inputRef.current?.click()}
          >
            <span className="material-icons" style={{ fontSize: 14 }}>upload_file</span>
            {newFileName || (hasExisting ? 'Replace file…' : 'Choose PDF…')}
          </label>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            style={{ display: 'none' }}
            onChange={onFileChange}
          />
        </div>
      </div>
      {hasExpiry && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#aaa', whiteSpace: 'nowrap' }}>Expiry:</span>
          <input
            type="date"
            value={expiry || existing?.expiry || ''}
            onChange={onExpiryChange}
            className="form-control-box"
            style={{ maxWidth: 150, padding: '5px 8px', fontSize: 12 }}
          />
        </div>
      )}
    </div>
  )
}

const roleBadgeColor = { director: 'primary', nurse: 'success', caregiver: 'warning' }

export default function EditConsumer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const { data, isLoading } = useConsumer(id)
  const { data: servicesData } = useConsumerServices()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  const [selectedServices, setSelectedServices] = useState([])
  const [files, setFiles] = useState({})
  const [fileNames, setFileNames] = useState({})
  const [expiries, setExpiries] = useState({})

  const consumer = data?.data
  const services = servicesData?.data || []
  const isDirector = user?.role === 'director'
  const basePath = isDirector ? '/director' : '/staff'

  const canEdit = (field) => {
    if (isDirector) return true
    return ['phone', 'address', 'behaviorPlan'].includes(field)
  }

  useEffect(() => {
    if (consumer) {
      setSelectedServices(
        consumer.consumerServices?.filter((s) => s.checked).map((s) => s.service) || []
      )
    }
  }, [consumer])

  const toggleService = (service) => {
    if (!isDirector) return
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    )
  }

  const handleFileChange = (key, e) => {
    const file = e.target.files[0]
    if (!file) return
    setFiles((prev) => ({ ...prev, [key]: file }))
    setFileNames((prev) => ({ ...prev, [key]: file.name }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    setSaving(true)

    const fd = new FormData(e.target)

    if (isDirector) {
      fd.append('services', JSON.stringify(selectedServices))
      DOC_FIELDS.forEach(({ key }) => {
        if (files[key]) fd.append(key, files[key])
        if (expiries[key]) fd.append(`${key}_expiry`, expiries[key])
      })
    }

    try {
      await axiosClient.patch(`/consumers/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      qc.invalidateQueries({ queryKey: ['consumer', id] })
      qc.invalidateQueries({ queryKey: ['consumers'] })
      setSuccess('Consumer updated successfully.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err?.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) return <Spinner />
  if (!consumer) return <Alert type="error" message="Consumer not found." />

  return (
    <div>
      <div className="card">
        <div
          className="card-header-primary"
          style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}
        >
          <div>
            <h4 className="card-title-white">Edit Consumer</h4>
            <p className="card-subtitle-white">{consumer.firstName} {consumer.lastName}</p>
          </div>
          <button type="button" className="btn btn-light btn-sm btn-round" onClick={() => navigate(`${basePath}/consumers/${id}`)}>
            ← Back
          </button>
        </div>

        <div className="card-body">
          <Alert type="error" message={error} />
          {success && <Alert type="success" message={success} />}

          {!isDirector && (
            <div style={{ background: '#e3f2fd', borderRadius: 4, padding: '10px 14px', fontSize: 13, color: '#1565c0', marginBottom: 20 }}>
              <span className="material-icons" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 6 }}>info</span>
              As {user?.role}, you can update phone number, address and behavior plan only.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="section-header">Personal Information</div>
            <div className="row">
              <div className="col-4">
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input name="firstName" type="text" className="form-control" defaultValue={consumer.firstName} disabled={!canEdit('firstName')} required />
                </div>
              </div>
              <div className="col-4">
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input name="lastName" type="text" className="form-control" defaultValue={consumer.lastName} disabled={!canEdit('lastName')} required />
                </div>
              </div>
              <div className="col-4">
                <div className="form-group">
                  <label className="form-label">Local Case Number</label>
                  <input type="text" className="form-control" defaultValue={consumer.lcNumber} disabled style={{ color: '#aaa' }} />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-4">
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input name="phone" type="text" className="form-control" defaultValue={consumer.phone} disabled={!canEdit('phone')} required />
                </div>
              </div>
              <div className="col-4">
                <div className="form-group">
                  <label className="form-label">Date of Birth *</label>
                  <input
                    name="dob"
                    type="date"
                    defaultValue={consumer.dob ? consumer.dob.split('T')[0] : ''}
                    disabled={!canEdit('dob')}
                    required
                    style={{ width: '100%', padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #d2d2d2', fontSize: 14, outline: 'none' }}
                  />
                </div>
              </div>
              <div className="col-4">
                <div className="form-group">
                  <label className="form-label">Behavior Plan *</label>
                  <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
                    {['yes', 'no'].map((val) => (
                      <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: canEdit('behaviorPlan') ? 'pointer' : 'not-allowed', fontSize: 14, color: '#555' }}>
                        <input
                          type="radio"
                          name="behaviorPlan"
                          value={val}
                          defaultChecked={consumer.behaviorPlan === val}
                          disabled={!canEdit('behaviorPlan')}
                        />
                        {val.charAt(0).toUpperCase() + val.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-12">
                <div className="form-group">
                  <label className="form-label">Address *</label>
                  <input name="address" type="text" className="form-control" defaultValue={consumer.address} disabled={!canEdit('address')} required />
                </div>
              </div>
            </div>

            {/* Documents — director only */}
            {isDirector && (
              <>
                <div className="section-header" style={{ marginTop: 24 }}>Eligibility and Enrollment Documents</div>
                <div style={{ maxWidth: 700 }}>
                  {DOC_FIELDS.map(({ key, label, hasExpiry }) => (
                    <DocUploadRow
                      key={key}
                      label={label}
                      hasExpiry={hasExpiry}
                      existing={consumer[key]}
                      newFileName={fileNames[key]}
                      expiry={expiries[key]}
                      onFileChange={(e) => handleFileChange(key, e)}
                      onExpiryChange={(e) => setExpiries((prev) => ({ ...prev, [key]: e.target.value }))}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Services — director only */}
            {isDirector && services.length > 0 && (
              <>
                <div className="section-header" style={{ marginTop: 28 }}>Services to be Provided</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px 16px', marginBottom: 24 }}>
                  {services.map((service) => (
                    <label key={service} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#555', padding: '6px 0' }}>
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service)}
                        onChange={() => toggleService(service)}
                        style={{ accentColor: '#222f3e', width: 15, height: 15 }}
                      />
                      {service}
                    </label>
                  ))}
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button type="submit" className="btn btn-primary btn-round" disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button type="button" className="btn btn-light btn-round" onClick={() => navigate(`${basePath}/consumers/${id}`)}>
                Cancel
              </button>
            </div>
          </form>

          {/* Change history */}
          {consumer.updateHistory?.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <div className="section-header">Change History</div>
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
      </div>
    </div>
  )
}