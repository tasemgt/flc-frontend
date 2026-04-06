import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useApplyEmployment } from '../../api/employment.api'
// import { useAgencies } from '../../api/agencies.api'
import { FileUpload } from '../../components/shared'
import { useQuery } from '@tanstack/react-query'
import axiosClient from '../../api/axiosClient'

export default function EmploymentApply() {
  const [tab, setTab] = useState(0)
  const [basicData, setBasicData] = useState({})
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState('')
  const [idExpiry, setIdExpiry] = useState('')
  const mutation = useApplyEmployment()
  // const { data: agenciesData } = useAgencies({ approved: true, limit: 100 })
  // Replace useAgencies hook call with a direct public fetch
  const { data: agenciesData } = useQuery({
    queryKey: ['agencies-public'],
    queryFn: () => axiosClient.get('/agencies/public/approved').then((r) => r.data),
  })
  const agencies = agenciesData?.data || []
  const filesRef = useRef({})
  const expiriesRef = useRef({})

  const handleBasicNext = (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    setBasicData(Object.fromEntries(fd.entries()))
    setTab(1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.target)
    const refs = [
      { name: fd.get('ref1_name'), email: fd.get('ref1_email') },
      { name: fd.get('ref2_name'), email: fd.get('ref2_email') },
    ].filter((r) => r.name)

    const formData = new FormData()
    Object.entries(basicData).forEach(([k, v]) => formData.append(k, v))
    formData.append('references', JSON.stringify(refs))

    // Append files
    Object.entries(filesRef.current).forEach(([k, file]) => { if (file) formData.append(k, file) })
    // Append expiry dates
    Object.entries(expiriesRef.current).forEach(([k, v]) => { if (v) formData.append(k, v) })

    try {
      const data = await mutation.mutateAsync(formData)
      setSuccess(data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Submission failed. Please try again.')
    }
  }

  if (success) {
    return (
      <div className="page-header" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1600&q=80')" }}>
        <nav className="intro-nav">
          <Link to="/" className="intro-nav-logo">
          {/* <span className="material-icons">self_improvement</span> */}
          <img style={{width: '2.5rem'}} src="../../imgs/favicon.png" alt="FreeLotCare Logo" />
          FreeLotCare
          </Link>
          <Link to="/login" className="intro-nav-link"><span className="material-icons" style={{ fontSize: 18 }}>login</span>Login</Link>
        </nav>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="card-form" style={{ maxWidth: 480 }}>
            <div className="success-card">
              <div className="success-icon"><span className="material-icons">check_circle</span></div>
              <h3>Application Submitted!</h3>
              <p>Your employment application has been received.</p>
              <p>Application ID:</p>
              <div className="app-number">{success.data?.applicationId}</div>
              <p style={{ marginTop: 16 }}>You will be notified once your application is reviewed.</p>
              <Link to="/login" className="btn btn-primary btn-round" style={{ marginTop: 16 }}>Back to Login</Link>
            </div>
          </div>
        </div>
        <footer className="intro-footer"><div><a href="#">Contact Us</a><a href="#">About Us</a></div><span>© {new Date().getFullYear()} Healthcare System</span></footer>
      </div>
    )
  }

  return (
    <div className="page-header" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1600&q=80')" }}>
      <nav className="intro-nav">
        <Link to="/" className="intro-nav-logo">
          {/* <span className="material-icons">self_improvement</span> */}
          <img style={{width: '2.5rem'}} src="../../imgs/favicon.png" alt="FreeLotCare Logo" />
          FreeLotCare
        </Link>
        <Link to="/login" className="intro-nav-link"><span className="material-icons" style={{ fontSize: 18 }}>login</span>Login</Link>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '0 20px 40px' }}>
        <div className="card-form">
          {/* Tab header */}
          <div className="tab-header">
            <div className="tab-header-title">Employment Form</div>
            <div className="tab-nav">
              <button className={`tab-nav-item${tab === 0 ? ' active' : ''}`} onClick={() => setTab(0)} type="button">
                <span className="material-icons">info</span> Basic Info
              </button>
              <button className={`tab-nav-item${tab === 1 ? ' active' : ''}`} onClick={() => Object.keys(basicData).length && setTab(1)} type="button">
                <span className="material-icons">description</span> References and Documents
              </button>
            </div>
          </div>

          <div className="card-body">
            {/* Tab 1 — Basic Info */}
            {tab === 0 && (
              <form onSubmit={handleBasicNext}>
                <div className="row">
                  <div className="col-4">
                    <div className="form-group">
                      <label className="form-label">First Name *</label>
                      <input name="firstName" defaultValue={basicData.firstName} type="text" className="form-control" required />
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="form-group">
                      <label className="form-label">Last Name *</label>
                      <input name="lastName" defaultValue={basicData.lastName} type="text" className="form-control" required />
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="form-group">
                      <label className="form-label">Social Security Number *</label>
                      <input name="ssn" defaultValue={basicData.ssn} type="text" className="form-control" required />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-2">
                    <div className="form-group">
                      <label className="form-label">Country *</label>
                      <select name="country" defaultValue={basicData.country || '+1'} className="form-control-box" required>
                        <option value="+1">U.S (+1)</option>
                        <option value="+1">Canada (+1)</option>
                        <option value="+44">U.K (+44)</option>
                        <option value="+234">Nigeria (+234)</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="form-group">
                      <label className="form-label">Phone Number *</label>
                      <input name="phone" defaultValue={basicData.phone} type="text" className="form-control" required />
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="form-group">
                      <label className="form-label">High School *</label>
                      <input name="highSchool" defaultValue={basicData.highSchool} type="text" className="form-control" required />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-3">
                    <div className="form-group">
                      <label className="form-label">Agency *</label>
                      <select name="agencyId" defaultValue={basicData.agencyId || ''} className="form-control-box" required>
                        <option value="">Select Agency</option>
                        {agencies.map((a) => (
                          <option key={a._id} value={a.agencyId}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="form-group">
                      <label className="form-label">Email Address *</label>
                      <input name="email" defaultValue={basicData.email} type="email" className="form-control" required />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group">
                      <label className="form-label">Home Address *</label>
                      <input name="address" defaultValue={basicData.address} type="text" className="form-control" required />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                  <button type="submit" className="btn btn-primary btn-round">Next →</button>
                </div>
              </form>
            )}

            {/* Tab 2 — References & Documents */}
            {tab === 1 && (
              <form onSubmit={handleSubmit}>
                <div className="section-header">References</div>
                <div className="row">
                  <div className="col-6">
                    <div className="form-group">
                      <label className="form-label">Reference 1 — Name *</label>
                      <input name="ref1_name" type="text" className="form-control" required />
                    </div>
                  </div>
                  {/* <div className="col-6">
                    <div className="form-group">
                      <label className="form-label">Reference 1 — Phone *</label>
                      <input name="ref1_phone" type="text" className="form-control" required />
                    </div>
                  </div> */}
                  <div className="col-6">
                    <div className="form-group">
                      <label className="form-label">Reference 1 — Email *</label>
                      <input name="ref1_email" type="email" className="form-control" required />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-6">
                    <div className="form-group">
                      <label className="form-label">Reference 2 — Name *</label>
                      <input name="ref2_name" type="text" className="form-control" required />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group">
                      <label className="form-label">Reference 2 — Email *</label>
                      <input name="ref2_email" type="email" className="form-control" required />
                    </div>
                  </div>
                </div>

                <div className="section-header" style={{ marginTop: 24 }}>Documents</div>
                <div className="row">
                  <div className="col-6" style={{ marginBottom: 16 }}>
                    <FileUpload
                      label="Government ID (e.g. Driver's License)"
                      name="idCard"
                      accept="application/pdf,image/*"
                      required
                      showExpiry
                      expiryName="idCard_expiry"
                      expiryValue={idExpiry}
                      onChange={(e) => { filesRef.current.idCard = e.target.files[0] }}
                      onExpiryChange={(e) => {
                        setIdExpiry(e.target.value)
                        expiriesRef.current.idCard_expiry = e.target.value
                      }}
                    />
                  </div>
                  <div className="col-6" style={{ marginBottom: 16 }}>
                    <FileUpload
                      label="Social Security Card"
                      name="ssCard"
                      accept="application/pdf,image/*"
                      required
                      onChange={(e) => { filesRef.current.ssCard = e.target.files[0] }}
                    />
                  </div>
                  <div className="col-6" style={{ marginBottom: 16 }}>
                    <FileUpload
                      label="High School Certificate"
                      name="highSchoolCert"
                      accept="application/pdf,image/*"
                      required
                      onChange={(e) => { filesRef.current.highSchoolCert = e.target.files[0] }}
                    />
                  </div>
                  <div className="col-6" style={{ marginBottom: 16 }}>
                    <FileUpload
                      label="Auto Insurance"
                      name="autoInsurance"
                      accept="application/pdf,image/*"
                      onChange={(e) => { filesRef.current.autoInsurance = e.target.files[0] }}
                    />
                  </div>
                </div>

                {error && (
                  <div className="alert alert-error">
                    <span className="material-icons" style={{ fontSize: 16 }}>error_outline</span>
                    {error}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                  <button type="button" className="btn btn-light btn-round" onClick={() => setTab(0)}>← Back</button>
                  <button type="submit" className="btn btn-primary btn-round" disabled={mutation.isPending}>
                    {mutation.isPending ? 'Submitting…' : 'Submit Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <footer className="intro-footer">
        <div><a href="#">Contact Us</a><a href="#">About Us</a></div>
        <span>© {new Date().getFullYear()} Healthcare System</span>
      </footer>
    </div>
  )
}
