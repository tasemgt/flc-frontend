import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApplyAgency } from '../../api/agencies.api'

export default function AgencyApply() {
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState('')
  const mutation = useApplyAgency()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.target)
    const payload = Object.fromEntries(fd.entries())
    try {
      const data = await mutation.mutateAsync(payload)
      setSuccess(data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Submission failed. Please try again.')
    }
  }

  return (
    <div
      className="page-header"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1600&q=80')" }}
    >
      <nav className="intro-nav">
        <Link to="/" className="intro-nav-logo">
          {/* <span className="material-icons">self_improvement</span> */}
          <img style={{width: '2.5rem'}} src="../../imgs/favicon.png" alt="FreeLotCare Logo" />
          FreeLotCare
        </Link>
        <Link to="/login" className="intro-nav-link">
          <span className="material-icons" style={{ fontSize: 18 }}>login</span>
          Login
        </Link>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '0 20px 40px' }}>
        {success ? (
          <div className="card-form" style={{ maxWidth: 500 }}>
            <div className="success-card">
              <div className="success-icon">
                <span className="material-icons">check_circle</span>
              </div>
              <h3>Application Submitted!</h3>
              <p>Your agency application has been received.</p>
              <p>Your Application Number is:</p>
              <div className="app-number">{success.data?.agencyId}</div>
              <p style={{ marginTop: 16 }}>Please save this number. You will receive a confirmation email shortly.</p>
              <Link to="/login" className="btn btn-primary btn-round" style={{ marginTop: 16 }}>Back to Login</Link>
            </div>
          </div>
        ) : (
          <div className="card-form">
            <div className="card-header-primary" style={{ margin: 0, borderRadius: 0, padding: '16px 28px' }}>
              <h4 style={{ margin: 0, fontSize: 18, fontWeight: 400, color: '#fff' }}>Enroll an Agency</h4>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,.75)' }}>For Program Directors — please fill in all required fields</p>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Agency Details */}
                <div className="section-header">Agency Details</div>
                <div className="row">
                  <div className="col-4">
                    <div className="form-group">
                      <label className="form-label">Agency Name *</label>
                      <input name="name" type="text" className="form-control" required />
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="form-group">
                      <label className="form-label">Agency Location *</label>
                      <input name="location" type="text" className="form-control" required />
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="form-group">
                      <label className="form-label">Agency Description *</label>
                      <input name="description" type="text" className="form-control" required />
                    </div>
                  </div>
                </div>

                {/* Director Details */}
                <div className="section-header" style={{ marginTop: 28 }}>Program Director Details</div>
                <div className="row">
                  <div className="col-3">
                    <div className="form-group">
                      <label className="form-label">Title *</label>
                      <input name="title" type="text" className="form-control" placeholder="Mr / Dr / Ms" required />
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="form-group">
                      <label className="form-label">First Name *</label>
                      <input name="firstName" type="text" className="form-control" required />
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="form-group">
                      <label className="form-label">Last Name *</label>
                      <input name="lastName" type="text" className="form-control" required />
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="form-group">
                      <label className="form-label">Email Address *</label>
                      <input name="email" type="email" className="form-control" required />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-3">
                    <div className="form-group">
                      <label className="form-label">Country</label>
                      <select name="country" className="form-control-box">
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
                      <input name="phone" type="text" className="form-control" required />
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="form-group">
                      <label className="form-label">Social Security Number</label>
                      <input name="ssn" type="text" className="form-control" />
                    </div>
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: 8 }}>
                  <label className="form-label">Brief Bio</label>
                  <textarea name="bio" className="form-control-box" rows={4} style={{ resize: 'vertical' }} />
                </div>

                {error && (
                  <div className="alert alert-error">
                    <span className="material-icons" style={{ fontSize: 16 }}>error_outline</span>
                    {error}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                  <button type="submit" className="btn btn-primary btn-round" disabled={mutation.isPending}>
                    {mutation.isPending ? 'Submitting…' : 'Submit Application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <footer className="intro-footer">
        <div><a href="#">Contact Us</a><a href="#">About Us</a></div>
        <span>© {new Date().getFullYear()} Healthcare System</span>
      </footer>
    </div>
  )
}
