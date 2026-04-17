import { useState, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useUpdateMe } from '../../api/users.api'
import { useChangePassword } from '../../api/auth.api'
import { useUpdateAgencySettings } from '../../api/agencies.api'
import useAuthStore from '../../store/authStore'
import { Alert } from '../../components/shared'

const MAX_LOGO_MB = 2
const IMAGE_MIMETYPES = ['image/jpeg', 'image/jpg', 'image/png']

export default function Profile() {
  const { user, updateUser, agencyLogoUrl, setAgencyLogoUrl } = useAuthStore()
  const updateMutation = useUpdateMe()
  const passwordMutation = useChangePassword()
  const agencyMutation = useUpdateAgencySettings()
  const qc = useQueryClient()
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const [agencyError, setAgencyError] = useState('')
  const [agencySuccess, setAgencySuccess] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [logoSizeError, setLogoSizeError] = useState('')
  const logoInputRef = useRef()

  const handleProfile = async (e) => {
    e.preventDefault()
    setProfileError(''); setProfileSuccess('')
    const fd = new FormData(e.target)
    const payload = Object.fromEntries(fd.entries())
    try {
      const data = await updateMutation.mutateAsync(payload)
      updateUser(data.data)
      qc.invalidateQueries({ queryKey: ['me'] })
      setProfileSuccess('Profile updated successfully.')
    } catch (err) {
      setProfileError(err?.response?.data?.message || 'Update failed')
    }
  }

  const handlePassword = async (e) => {
    e.preventDefault()
    setPwError(''); setPwSuccess('')
    const fd = new FormData(e.target)
    const password = fd.get('password')
    const confirmPassword = fd.get('confirmPassword')
    if (password !== confirmPassword) return setPwError('Passwords do not match')
    if (password.length < 8) return setPwError('Password must be at least 8 characters')
    try {
      await passwordMutation.mutateAsync({
        currentPassword: fd.get('currentPassword'),
        newPassword: fd.get('password'),
        confirmPassword: fd.get('confirmPassword'),
      })
      e.target.reset()
      setPwSuccess('Password changed successfully.')
    } catch (err) {
      setPwError(err?.response?.data?.message || 'Password change failed')
    }
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    setLogoSizeError('')
    setLogoFile(null)
    setLogoPreview(null)
    if (!file) return
    if (!IMAGE_MIMETYPES.includes(file.type)) {
      setLogoSizeError('Only JPG and PNG images are accepted for logos.')
      e.target.value = ''
      return
    }
    if (file.size > MAX_LOGO_MB * 1024 * 1024) {
      setLogoSizeError(`Logo image must be under ${MAX_LOGO_MB} MB.`)
      e.target.value = ''
      return
    }
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleAgencySettings = async (e) => {
    e.preventDefault()
    setAgencyError(''); setAgencySuccess('')
    const fd = new FormData(e.target)
    if (logoFile) fd.append('logo', logoFile)
    try {
      const data = await agencyMutation.mutateAsync({ id: user.agency._id, formData: fd })
      // Update agency name in auth store
      updateUser({ agency: { ...user.agency, name: data.data.name, logo: data.data.logo } })
      // Update logo URL in store so navbar reflects immediately
      if (data.logoUrl) setAgencyLogoUrl(data.logoUrl)
      qc.invalidateQueries({ queryKey: ['agency-logo-url'] })
      setLogoFile(null)
      setLogoPreview(null)
      setAgencySuccess('Agency settings updated successfully.')
    } catch (err) {
      setAgencyError(err?.response?.data?.message || 'Update failed')
    }
  }

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase()

  return (
    <div>
      <div className="row">
        {/* Avatar card */}
        <div className="col-4">
          <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(60deg,#ab47bc,#8e24aa)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#fff', fontSize: 32, fontWeight: 500 }}>
              {initials}
            </div>
            <h4 style={{ margin: '0 0 4px', fontWeight: 400, color: '#3c4858' }}>{user?.firstName} {user?.lastName}</h4>
            <p style={{ margin: '0 0 4px', color: '#999', fontSize: 13 }}>{user?.email}</p>
            <span className="badge badge-info" style={{ margin: '8px auto 0' }}>{user?.role}</span>
          </div>
        </div>

        {/* Profile form */}
        <div className="col-8">
          <div className="card">
            <div className="card-header-primary" style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '16px 20px' }}>
              <h4 className="card-title-white">Edit Profile</h4>
            </div>
            <div className="card-body">
              <Alert type="error" message={profileError} />
              {profileSuccess && <Alert type="success" message={profileSuccess} />}
              <form onSubmit={handleProfile}>
                <div className="row">
                  <div className="col-6">
                    <div className="form-group">
                      <label className="form-label">First Name</label>
                      <input name="firstName" defaultValue={user?.firstName} type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group">
                      <label className="form-label">Last Name</label>
                      <input name="lastName" defaultValue={user?.lastName} type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input name="email" defaultValue={user?.email} type="email" className="form-control" />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input name="phone" defaultValue={user?.phone} type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-group">
                      <label className="form-label">Address</label>
                      <input name="address" defaultValue={user?.address} type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-group">
                      <label className="form-label">Bio</label>
                      <textarea name="bio" defaultValue={user?.bio} className="form-control-box" rows={3} style={{ resize: 'vertical' }} />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="submit" className="btn btn-primary btn-round" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Change password */}
          <div className="card">
            <div className="card-header-warning" style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '16px 20px' }}>
              <h4 className="card-title-white">Change Password</h4>
            </div>
            <div className="card-body">
              <Alert type="error" message={pwError} />
              {pwSuccess && <Alert type="success" message={pwSuccess} />}
              <form onSubmit={handlePassword}>
                <div className="row">
                  <div className="col-12">
                    <div className="form-group">
                      <label className="form-label">Current Password *</label>
                      <div className="input-group">
                        <input name="currentPassword" type={showPw ? 'text' : 'password'} className="form-control" required />
                        <button type="button" onClick={() => setShowPw(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}>
                          <span className="material-icons" style={{ fontSize: 18 }}>{showPw ? 'visibility_off' : 'visibility'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group">
                      <label className="form-label">New Password *</label>
                      <input name="password" type={showPw ? 'text' : 'password'} className="form-control" required minLength={8} />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group">
                      <label className="form-label">Confirm Password *</label>
                      <input name="confirmPassword" type={showPw ? 'text' : 'password'} className="form-control" required />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-warning btn-round" disabled={passwordMutation.isPending}>
                    {passwordMutation.isPending ? 'Updating…' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Agency Settings — director only */}
          {user?.role === 'director' && user?.agency && (
            <div className="card">
              <div className="card-header-primary" style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '16px 20px' }}>
                <h4 className="card-title-white">Agency Settings</h4>
                <p className="card-subtitle-white">{user.agency.name}</p>
              </div>
              <div className="card-body">
                <Alert type="error" message={agencyError} />
                {agencySuccess && <Alert type="success" message={agencySuccess} />}
                <form onSubmit={handleAgencySettings}>
                  <div className="row">
                    <div className="col-12">
                      <div className="form-group">
                        <label className="form-label">Agency Name</label>
                        <input
                          name="name"
                          type="text"
                          className="form-control"
                          defaultValue={user.agency.name}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="section-header" style={{ marginTop: 16 }}>Agency Logo</div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginTop: 12, flexWrap: 'wrap' }}>
                    {/* Current / preview */}
                    <div style={{ width: 100, height: 100, borderRadius: 8, border: '1px dashed #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, background: '#fafafa' }}>
                      {logoPreview || agencyLogoUrl ? (
                        <img
                          src={logoPreview || agencyLogoUrl}
                          alt="Agency logo"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <span className="material-icons" style={{ fontSize: 40, color: '#ddd' }}>business</span>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <label
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: '1px dashed #ccc', borderRadius: 4, cursor: 'pointer', fontSize: 13, color: '#555' }}
                        onClick={() => logoInputRef.current?.click()}
                      >
                        <span className="material-icons" style={{ fontSize: 16 }}>upload</span>
                        {logoFile ? logoFile.name : (agencyLogoUrl ? 'Replace logo…' : 'Upload logo…')}
                      </label>
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        style={{ display: 'none' }}
                        onChange={handleLogoChange}
                      />
                      <div style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>
                        JPG or PNG &nbsp;·&nbsp; Max {MAX_LOGO_MB} MB &nbsp;·&nbsp; Displayed in the navbar for all agency staff
                      </div>
                      {logoSizeError && (
                        <div style={{ fontSize: 11, color: '#e53935', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span className="material-icons" style={{ fontSize: 13 }}>error_outline</span>
                          {logoSizeError}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                    <button type="submit" className="btn btn-primary btn-round" disabled={agencyMutation.isPending}>
                      {agencyMutation.isPending ? 'Saving…' : 'Save Agency Settings'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
