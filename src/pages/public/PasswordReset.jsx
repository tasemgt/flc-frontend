import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useForgotPassword, useResetPassword } from '../../api/auth.api'

function PublicPageWrap({ children }) {
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
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        {children}
      </div>
      <footer className="intro-footer">
        <div><a href="#">Contact Us</a><a href="#">About Us</a></div>
        <span>© {new Date().getFullYear()} Healthcare System</span>
      </footer>
    </div>
  )
}

export function ForgotPassword() {
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const mutation = useForgotPassword()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.target)
    try {
      await mutation.mutateAsync({ email: fd.get('email') })
      setSuccess(true)
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong.')
    }
  }

  return (
    <PublicPageWrap>
      <div className="card-login" style={{ width: '100%' }}>
        <div className="card-header-primary" style={{ margin: 0, borderRadius: 0, padding: 20, textAlign: 'center' }}>
          <h4 style={{ margin: 0, fontSize: 18, fontWeight: 400, textTransform: 'uppercase', letterSpacing: 1, color: '#fff' }}>
            Reset Your Password
          </h4>
        </div>
        <div className="card-body">
          {success ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <span className="material-icons" style={{ fontSize: 48, color: '#43a047' }}>mark_email_read</span>
              <p style={{ color: '#555', marginTop: 12 }}>
                If that email exists, a reset link has been sent. Please check your inbox.
              </p>
              <Link to="/login" className="btn btn-primary btn-round btn-sm" style={{ marginTop: 8 }}>Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p style={{ color: '#999', fontSize: 13, marginBottom: 20 }}>
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <div className="form-group">
                <div className="input-group">
                  <span className="material-icons input-group-icon">mail</span>
                  <input name="email" type="email" className="form-control" placeholder="Email Address" required />
                </div>
              </div>
              {error && <div className="alert alert-error"><span className="material-icons" style={{ fontSize: 16 }}>error_outline</span>{error}</div>}
              <button type="submit" className="btn btn-primary btn-block btn-round" disabled={mutation.isPending} style={{ marginTop: 8 }}>
                {mutation.isPending ? 'Sending…' : 'Send Reset Link'}
              </button>
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Link to="/login" style={{ fontSize: 13, color: '#9c27b0' }}>← Back to Login</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </PublicPageWrap>
  )
}

export function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)
  const mutation = useResetPassword(token)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.target)
    const password = fd.get('password')
    const confirmPassword = fd.get('confirmPassword')
    if (password !== confirmPassword) return setError('Passwords do not match')
    if (password.length < 8) return setError('Password must be at least 8 characters')
    try {
      await mutation.mutateAsync({ password, confirmPassword })
      navigate('/login', { state: { message: 'Password reset successful. Please log in.' } })
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid or expired reset link.')
    }
  }

  return (
    <PublicPageWrap>
      <div className="card-login" style={{ width: '100%' }}>
        <div className="card-header-primary" style={{ margin: 0, borderRadius: 0, padding: 20, textAlign: 'center' }}>
          <h4 style={{ margin: 0, fontSize: 18, fontWeight: 400, textTransform: 'uppercase', letterSpacing: 1, color: '#fff' }}>
            Set New Password
          </h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="input-group">
                <span className="material-icons input-group-icon">lock</span>
                <input name="password" type={showPw ? 'text' : 'password'} className="form-control" placeholder="New Password" required minLength={8} />
                <button type="button" onClick={() => setShowPw(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}>
                  <span className="material-icons" style={{ fontSize: 18 }}>{showPw ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 16 }}>
              <div className="input-group">
                <span className="material-icons input-group-icon">lock_outline</span>
                <input name="confirmPassword" type={showPw ? 'text' : 'password'} className="form-control" placeholder="Confirm Password" required />
              </div>
            </div>
            {error && <div className="alert alert-error"><span className="material-icons" style={{ fontSize: 16 }}>error_outline</span>{error}</div>}
            <button type="submit" className="btn btn-primary btn-block btn-round" disabled={mutation.isPending} style={{ marginTop: 8 }}>
              {mutation.isPending ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </PublicPageWrap>
  )
}
