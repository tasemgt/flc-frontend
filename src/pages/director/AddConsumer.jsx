import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useCreateConsumer, useConsumerServices } from '../../api/consumers.api'
import { Alert, Spinner } from '../../components/shared'

const DOC_FIELDS = [
  { key: 'directedPlan', label: 'Person Directed Plan', hasExpiry: true },
  { key: 'ipc', label: 'Individual Plan of Care (IPC)', hasExpiry: true },
  { key: 'icap', label: 'Inventory for Client and Agency Planning (ICAP)', hasExpiry: true },
  { key: 'idrc', label: 'Intellectual Disability and Related Condition (IDRC)', hasExpiry: true },
  { key: 'consumerRights', label: 'Consumer Rights / Choice of Services and Delivery', hasExpiry: true },
  { key: 'transferPaper', label: 'Transfer Paper', hasExpiry: false },
]

const IMAGE_MIMETYPES = ['image/jpeg', 'image/jpg', 'image/png']
const MAX_IMAGE_MB = 2
const MAX_DOC_MB = 5

function DocUploadRow({ label, hasExpiry, onFileChange, onExpiryChange, fileName, expiry }) {
  const inputRef = useRef()
  const [sizeError, setSizeError] = useState('')

  const handleChange = (e) => {
    const file = e.target.files[0]
    setSizeError('')
    if (file) {
      const limitMB = IMAGE_MIMETYPES.includes(file.type) ? MAX_IMAGE_MB : MAX_DOC_MB
      if (file.size > limitMB * 1024 * 1024) {
        setSizeError(`File too large — max ${limitMB} MB for this file type.`)
        e.target.value = ''
        return
      }
    }
    onFileChange(e)
  }

  return (
    <div style={{ padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 12, color: '#aaa', marginBottom: 6 }}>{label}</div>
          <label
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: '1px dashed #ccc', borderRadius: 4, cursor: 'pointer', fontSize: 13, color: '#777' }}
            onClick={() => inputRef.current?.click()}
          >
            <span className="material-icons" style={{ fontSize: 16 }}>upload_file</span>
            {fileName || 'Choose file…'}
          </label>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/jpg,image/png"
            style={{ display: 'none' }}
            onChange={handleChange}
          />
          <div style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>
            PDF, Word (.doc, .docx), JPG, PNG &nbsp;·&nbsp; Documents max {MAX_DOC_MB} MB &nbsp;·&nbsp; Images max {MAX_IMAGE_MB} MB
          </div>
          {sizeError && (
            <div style={{ fontSize: 11, color: '#e53935', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="material-icons" style={{ fontSize: 13 }}>error_outline</span>
              {sizeError}
            </div>
          )}
        </div>
        {hasExpiry && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#aaa', whiteSpace: 'nowrap' }}>Expiry date:</span>
            <input
              type="date"
              value={expiry || ''}
              onChange={onExpiryChange}
              className="form-control-box"
              style={{ maxWidth: 160, padding: '6px 10px', fontSize: 13 }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default function AddConsumer() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const createMutation = useCreateConsumer()
  const { data: servicesData, isLoading: servicesLoading } = useConsumerServices()
  const [error, setError] = useState('')
  const [selectedServices, setSelectedServices] = useState([])
  const [files, setFiles] = useState({})
  const [fileNames, setFileNames] = useState({})
  const [expiries, setExpiries] = useState({})

  const services = servicesData?.data || []

  const toggleService = (service) => {
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
    setError('')
    const fd = new FormData(e.target)
    fd.append('services', JSON.stringify(selectedServices))

    DOC_FIELDS.forEach(({ key }) => {
      if (files[key]) fd.append(key, files[key])
      if (expiries[key]) fd.append(`${key}_expiry`, expiries[key])
    })

    try {
      await createMutation.mutateAsync(fd)
      qc.invalidateQueries({ queryKey: ['consumers'] })
      navigate('/director/consumers')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to register consumer')
    }
  }

  return (
    <div>
      <div className="card">
        <div className="card-header-primary" style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h4 className="card-title-white">Register a Consumer</h4>
            <p className="card-subtitle-white">Please fill in all required fields</p>
          </div>
          <button className="btn btn-light btn-sm btn-round" type="button" onClick={() => navigate('/director/consumers')}>
            All Consumers
          </button>
        </div>
        <div className="card-body">
          <Alert type="error" message={error} />
          <form onSubmit={handleSubmit}>
            {/* Personal Info */}
            <div className="row">
              <div className="col-4">
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input name="firstName" type="text" className="form-control" required />
                </div>
              </div>
              <div className="col-4">
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input name="lastName" type="text" className="form-control" required />
                </div>
              </div>
              <div className="col-4">
                <div className="form-group">
                  <label className="form-label">Local Case Number *</label>
                  <input name="lcNumber" type="text" className="form-control" required />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-2">
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <select name="country" className="form-control-box">
                    <option value="+1">US (+1)</option>
                    <option value="+1">Canada (+1)</option>
                    <option value="+44">UK (+44)</option>
                    <option value="+234">Nigeria (+234)</option>
                  </select>
                </div>
              </div>
              <div className="col-4">
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input name="phone" type="text" className="form-control" required />
                </div>
              </div>
              <div className="col-3">
                <div className="form-group">
                  <label className="form-label">Date of Birth *</label>
                  <input name="dob" type="date" className="form-control-box" style={{ padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #d2d2d2', borderRadius: 0, width: '100%', fontSize: 14 }} required />
                </div>
              </div>
              <div className="col-3">
                <div className="form-group">
                  <label className="form-label">Behavior Plan *</label>
                  <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14, color: '#555' }}>
                      <input type="radio" name="behaviorPlan" value="yes" required /> Yes
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14, color: '#555' }}>
                      <input type="radio" name="behaviorPlan" value="no" defaultChecked /> No
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-12">
                <div className="form-group">
                  <label className="form-label">Address *</label>
                  <input name="address" type="text" className="form-control" required />
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="section-header" style={{ marginTop: 24 }}>Eligibility and Enrollment Documents</div>
            <div style={{ maxWidth: 700 }}>
              {DOC_FIELDS.map(({ key, label, hasExpiry }) => (
                <DocUploadRow
                  key={key}
                  docKey={key}
                  label={label}
                  hasExpiry={hasExpiry}
                  fileName={fileNames[key]}
                  expiry={expiries[key]}
                  onFileChange={(e) => handleFileChange(key, e)}
                  onExpiryChange={(e) => setExpiries((prev) => ({ ...prev, [key]: e.target.value }))}
                />
              ))}
            </div>

            {/* Services */}
            <div className="section-header" style={{ marginTop: 28 }}>
              Services to be Provided
              <span style={{ fontSize: 12, fontWeight: 400, textTransform: 'none', color: '#999', marginLeft: 8 }}>
                Select based on IPC and PDP
              </span>
            </div>
            {servicesLoading ? <Spinner /> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px 16px', marginBottom: 24 }}>
                {services.map((service) => (
                  <label
                    key={service}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#555', padding: '6px 0' }}
                  >
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
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button type="submit" className="btn btn-primary btn-round" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Registering…' : 'Register Consumer'}
              </button>
              <button type="button" className="btn btn-light btn-round" onClick={() => navigate('/director/consumers')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}