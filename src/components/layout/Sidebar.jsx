import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import axiosClient from '../../api/axiosClient'

const Logo = () => (
  <NavLink to="/" className="sidebar-logo">
    <span className="material-icons" style={{ color: '#fff', fontSize: 28 }}>self_improvement</span>
    <span className="sidebar-logo-text">FREELOTCARE</span>
  </NavLink>
)

function NavCollapse({ icon, label, children }) {
  const [open, setOpen] = useState(false)
  return (
    <li>
      <button className="nav-item-link" onClick={() => setOpen((o) => !o)}>
        <span className="material-icons">{icon}</span>
        <span style={{ flex: 1 }}>{label}</span>
        <span className={`material-icons nav-collapse-icon${open ? ' open' : ''}`}>keyboard_arrow_down</span>
      </button>
      {open && <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>{children}</ul>}
    </li>
  )
}

function SubLink({ to, label }) {
  return (
    <li>
      <NavLink to={to} className={({ isActive }) => `nav-sub-item${isActive ? ' active' : ''}`}>
        {label}
      </NavLink>
    </li>
  )
}

function NavItem({ to, icon, label }) {
  return (
    <li>
      <NavLink to={to} className={({ isActive }) => `nav-item-link${isActive ? ' active' : ''}`}>
        <span className="material-icons">{icon}</span>
        <span>{label}</span>
      </NavLink>
    </li>
  )
}

// ── Role-specific nav trees ──────────────────────────────────────────────────
function AdminNav() {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      <NavItem to="/admin/dashboard" icon="dashboard" label="Dashboard" />
      <NavCollapse icon="people" label="Manage All Users">
        <SubLink to="/admin/users" label="All Users" />
        <SubLink to="/admin/users/add" label="Register Staff" />
        <SubLink to="/admin/users/add-director" label="Add Program Director" />
      </NavCollapse>
      <NavCollapse icon="foundation" label="Agency Applications">
        <SubLink to="/admin/agency-applications" label="All Applications" />
      </NavCollapse>
      <NavItem to="/admin/profile" icon="person" label="Profile" />
      <NavItem to="/admin/settings" icon="settings" label="Settings" />
    </ul>
  )
}

function DirectorNav() {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      <NavItem to="/director/dashboard" icon="dashboard" label="Dashboard" />
      <NavCollapse icon="people" label="Consumers">
        <SubLink to="/director/consumers" label="All Consumers" />
        <SubLink to="/director/consumers/add" label="Add Consumer" />
      </NavCollapse>
      <NavItem to="/director/staff" icon="badge" label="My Staff" />
      <NavItem to="/director/employments" icon="work" label="Employments" />
      <NavItem to="/director/appointments" icon="event" label="Appointments" />
      <NavCollapse icon="description" label="Consumer Forms">
        {/* <SubLink to="/director/forms/consumer" label="Basic Forms" /> */}
        <SubLink to="/director/forms/consumer" label="All Consumer Forms" />
        {/* <SubLink to="/director/forms/consumer/delivery-logs" label="Delivery Logs" />
        <SubLink to="/director/forms/consumer/medication" label="Medication & Consent" /> */}
      </NavCollapse>
      <NavCollapse icon="local_hospital" label="Nurse Forms">
        <SubLink to="/director/forms/nurse" label="All Nurse Forms" />
      </NavCollapse>
      <NavCollapse icon="admin_panel_settings" label="Director Forms">
        <SubLink to="/director/forms/director" label="All Director Forms" />
      </NavCollapse>
      <NavItem to="/director/profile" icon="person" label="Profile" />
    </ul>
  )
}

function StaffNav() {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      <NavItem to="/staff/dashboard" icon="dashboard" label="Dashboard" />
      <NavItem to="/staff/consumers" icon="people" label="Consumers" />
      <NavCollapse icon="description" label="Consumer Forms">
        <SubLink to="/staff/forms/consumer" label="All Consumer Forms" />
        {/* <SubLink to="/staff/forms/delivery-logs" label="Delivery Logs" /> */}
      </NavCollapse>
      <NavItem to="/staff/appointments" icon="event" label="Appointments" />
      <NavItem to="/staff/profile" icon="person" label="Profile" />
    </ul>
  )
}

// ── Sidebar ──────────────────────────────────────────────────────────────────
export default function Sidebar() {
  const { user } = useAuthStore()
  if (!user) return null

  console.log('Authenticated User:', user)

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()

  return (
    <div className="sidebar">
      <Logo />
      <div className="sidebar-user">
        <div className="sidebar-user-avatar">{initials}</div>
        <div>
          <div className="sidebar-user-name">
            {user.firstName} {user.lastName?.[0]}.
          </div>
          <div className="sidebar-user-role">{user.role} @ 
            {user.agency?.name && (
              <span style={{textTransform: 'capitalize'}}>{user.agency?.name}</span>
            )}
          </div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {user.role === 'admin' && <AdminNav />}
        {user.role === 'director' && <DirectorNav />}
        {(user.role === 'nurse' || user.role === 'caregiver') && <StaffNav />}
      </nav>
    </div>
  )
}
