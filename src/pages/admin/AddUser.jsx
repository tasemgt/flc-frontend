import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import axiosClient from '../../api/axiosClient'
import { useCreateUser } from '../../api/users.api'
import { Alert, Spinner } from '../../components/shared'

export default function AddUser() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const createMutation = useCreateUser()
  const [searchId, setSearchId] = useState('')
  const [searching, setSearching] = useState(false)
  const [application, setApplication] = useState(null)
  const [searchError, setSearchError] = useState('')
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSearch = async () => {
    if (!searchId.trim()) return setSearchError('Please enter an Application ID')
    setSearchError(''); setApplication(null)
    setSearching(true)
    try {
      // Search employment applications by applicationId field
      const { data } = await axiosClient.get(`/employment?applicationId=${searchId.trim()}&limit=1`)
      const apps = data?.data || []
      if (apps.length === 0) return setSearchError(`No application found with ID: ${searchId}`)
      setApplication(apps[0])
    } catch (err) {
      setSearchError(err?.response?.data?.message || 'Search failed')
    } finally {
      setSearching(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(''); setSuccess('')
    const fd = new FormData(e.target)
    const payload = Object.fromEntries(fd.entries())
    try {
      await createMutation.mutateAsync(payload)
      qc.invalidateQueries({ queryKey: ['users'] })
      setSuccess(`User created successfully. Login credentials have been emailed to ${payload.email}.`)
      setApplication(null)
      setSearchId('')
      e.target.reset()
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to create user')
    }
  }

  return (
    <div>
      <div className="card">
        <div className="card-header-primary" style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h4 className="card-title-white">Register a User (Direct Care Staff)</h4>
            <p className="card-subtitle-white">Search by Job Application ID to pre-fill details</p>
          </div>
          <button className="btn btn-light btn-sm btn-round" onClick={() => navigate('/admin/users')}>
            ← All Users
          </button>
        </div>

        <div className="card-body">
          <Alert type="error" message={formError} />
          {success && <Alert type="success" message={success} />}

          {/* Application ID search */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 28, maxWidth: 500 }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Enter Job Application ID</label>
              <input
                type="text"
                className="form-control"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g. 1001"
              />
            </div>
            <button
              type="button"
              className="btn btn-warning btn-round"
              onClick={handleSearch}
              disabled={searching}
              style={{ flexShrink: 0 }}
            >
              {searching ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <span className="material-icons" style={{ fontSize: 18 }}>search</span>}
            </button>
          </div>

          {searchError && <Alert type="error" message={searchError} />}

          {application && (
            <div style={{ background: '#f0f4ff', border: '1px solid #c5cae9', borderRadius: 6, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#3949ab' }}>
              <span className="material-icons" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 6 }}>check_circle</span>
              Application #{application.applicationId} found — fields pre-filled from {application.firstName} {application.lastName}'s application.
            </div>
          )}

          {/* Registration form */}
          <form onSubmit={handleSubmit}>
            {/* Hidden fields */}
            {application && (
              <>
                <input type="hidden" name="applicationId" value={application._id} />
                <input type="hidden" name="agencyId" value={application.agency?._id || ''} />
              </>
            )}

            <div className="row">
              <div className="col-4">
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input name="firstName" type="text" className="form-control" defaultValue={application?.firstName || ''} key={application?._id + 'fn'} required />
                </div>
              </div>
              <div className="col-4">
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input name="lastName" type="text" className="form-control" defaultValue={application?.lastName || ''} key={application?._id + 'ln'} required />
                </div>
              </div>
              <div className="col-4">
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input name="email" type="email" className="form-control" defaultValue={application?.email || ''} key={application?._id + 'em'} required />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-12">
                <div className="form-group">
                  <label className="form-label">Home Address</label>
                  <input name="address" type="text" className="form-control" defaultValue={application?.address || ''} key={application?._id + 'addr'} />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-2">
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <select name="country" className="form-control-box" defaultValue={application?.country || '+1'}>
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
                  <input name="phone" type="text" className="form-control" defaultValue={application?.phone || ''} key={application?._id + 'ph'} required />
                </div>
              </div>
              <div className="col-4">
                <div className="form-group">
                  <label className="form-label">Social Security Number *</label>
                  <input name="ssn" type="text" className="form-control" defaultValue={application?.ssn || ''} key={application?._id + 'ssn'} required />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-12">
                <div className="form-group">
                  <label className="form-label">Brief Info about Staff</label>
                  <textarea name="bio" className="form-control-box" rows={4} style={{ resize: 'vertical' }} />
                </div>
              </div>
            </div>

            <div className="form-group" style={{ maxWidth: 280 }}>
              <label className="form-label">User Role *</label>
              <select name="role" className="form-control-box" required>
                <option value="">— Select Role —</option>
                <option value="nurse">Nurse</option>
                <option value="caregiver">Direct Care Giver</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button type="submit" className="btn btn-primary btn-round" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Registering…' : 'Register User'}
              </button>
              <button type="button" className="btn btn-light btn-round" onClick={() => navigate('/admin/users')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
