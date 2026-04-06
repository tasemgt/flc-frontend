import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useLogin } from '../../api/auth.api'
import useAuthStore from '../../store/authStore'

const rolePath = { admin: '/admin/dashboard', director: '/director/dashboard', nurse: '/staff/dashboard', caregiver: '/staff/dashboard' }

function ApplyDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef()
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div className="intro-nav-dropdown" ref={ref}>
      <button className="intro-nav-link" onClick={() => setOpen((o) => !o)}>
        <span className="material-icons" style={{ fontSize: 18 }}>description</span>
        Apply Here
        <span className="material-icons" style={{ fontSize: 16 }}>keyboard_arrow_down</span>
      </button>
      {open && (
        <div className="intro-nav-dropdown-menu">
          <Link to="/apply/employment" className="intro-nav-dropdown-item" onClick={() => setOpen(false)}>Direct Care Staff</Link>
          <Link to="/apply/agency" className="intro-nav-dropdown-item" onClick={() => setOpen(false)}>Agency</Link>
        </div>
      )}
    </div>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuthStore()
  const loginMutation = useLogin()
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated) navigate(rolePath[useAuthStore.getState().user?.role] || '/login')
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.target)
    try {
      const data = await loginMutation.mutateAsync({ email: fd.get('email'), password: fd.get('password') })
      login(data.data.user, data.token)
      navigate(rolePath[data.data.user.role] || '/admin/dashboard')
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed. Please try again.')
    }
  }

  return (
    <div
      className="page-header"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1600&q=80')" }}
    >
      {/* Navbar */}
      <nav className="intro-nav">
        <Link to="/" className="intro-nav-logo">
          {/* <span className="material-icons">self_improvement</span> */}
          <img style={{width: '2.5rem'}} src="../../imgs/favicon.png" alt="FreeLotCare Logo" />
          FreeLotCare
        </Link>
        <div className="intro-nav-links">
          <ApplyDropdown />
          <a href="#" className="intro-nav-link">
            <i className="fa fa-twitter" style={{ fontSize: 16 }} />
          </a>
          <a href="#" className="intro-nav-link">
            <i className="fa fa-facebook-square" style={{ fontSize: 16 }} />
          </a>
          <a href="#" className="intro-nav-link">
            <i className="fa fa-instagram" style={{ fontSize: 16 }} />
          </a>
        </div>
      </nav>

      {/* Centered card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '40px 20px' }}>
        <div className="card-login" style={{ width: '100%' }}>
          <div className="card-header-primary" style={{ margin: 0, borderRadius: 0, padding: 20, textAlign: 'center' }}>
            <h4 style={{ margin: 0, fontSize: 18, fontWeight: 400, textTransform: 'uppercase', letterSpacing: 1, color: '#fff' }}>
              Log into your account
            </h4>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <br />
              <div className="form-group">
                <div className="input-group">
                  <span className="material-icons input-group-icon">mail</span>
                  <input name="email" type="email" className="form-control" placeholder="Email Address" required />
                </div>
              </div>
              <br />
              <div className="form-group">
                <div className="input-group">
                  <span className="material-icons input-group-icon">lock_outline</span>
                  <input name="password" type={showPw ? 'text' : 'password'} className="form-control" placeholder="Password" required />
                  <button type="button" onClick={() => setShowPw((v) => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}>
                    <span className="material-icons" style={{ fontSize: 18 }}>{showPw ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
              <div style={{ textAlign: 'right', marginBottom: 8 }}>
                <Link to="/forgot-password" style={{ fontSize: 13, color: '#9c27b0' }}>Forgot password?</Link>
              </div>

              {error && (
                <div className="alert alert-error">
                  <span className="material-icons" style={{ fontSize: 16 }}>error_outline</span>
                  {error}
                </div>
              )}

              <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
                <button
                  type="submit"
                  className="btn btn-primary btn-block btn-round"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? 'Logging in…' : 'Login'}
                </button>
              </div>
            </form>
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
