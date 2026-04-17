import { useState, useRef, useEffect } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import axiosClient from '../../api/axiosClient'
import NotificationBell from '../shared/NotificationBell'

const AGENCY_ROLES = ['director', 'nurse', 'caregiver']

const CONSUMER_FORMS = [
  { label: 'All Consumer Forms', to: '/director/forms/consumer' },
  null,
  { label: 'Dental Examination Form', to: '/director/forms/consumer/dental' },
  { label: 'Environmental Safety Checklist', to: '/director/forms/consumer/environmental' },
  { label: 'Hot Water Assessment', to: '/director/forms/consumer/hot-water' },
  { label: 'Fire Evacuation Assessment', to: '/director/forms/consumer/fire-evac' },
  { label: 'Fire/Emergency Drill', to: '/director/forms/consumer/fire-emergency' },
  { label: 'Toxic Poison Assessment', to: '/director/forms/consumer/poison' },
  { label: 'Annual Assessment of Legal Status', to: '/director/forms/legal' },
  null,
  { label: 'Supported Home Living Delivery', to: '/director/forms/consumer/supported-home' },
  { label: 'Supported Employment Delivery', to: '/director/forms/consumer/supported-employment' },
  { label: 'Respite Service Delivery Log', to: '/director/forms/consumer/respite' },
  { label: 'RSS and SL Service Delivery Log', to: '/director/forms/consumer/rss-sl' },
  { label: 'Day Habilitation Service Delivery', to: '/director/forms/consumer/day-hab' },
  null,
  { label: 'PRN Medication List', to: '/director/forms/consumer/prn-medication' },
  { label: 'Consent for Release of Medical Info', to: '/director/forms/consumer/consent-medical' },
]

const NURSE_FORMS_DIRECTOR = [
  { label: 'Nursing Services Delivery Log', to: '/director/forms/nurse/nursing-delivery' },
  { label: 'Nursing Services Checklist', to: '/director/forms/nurse/nursing-checklist' },
  { label: 'RN Delegation Checklist', to: '/director/forms/nurse/rn-delegation' },
  { label: 'Nursing Tasks Screening Tool', to: '/director/forms/nurse/tasks-screening' },
  { label: 'Comprehensive Nursing Assessment', to: '/director/forms/nurse/comprehensive-assessment' },
  null,
  { label: 'Exclusion of HH/CC Provider', to: '/director/forms/nurse/exclusion-hhcc' },
]

const NURSE_FORMS_STAFF = [
  { label: 'Nursing Services Delivery Log', to: '/staff/forms/nurse/nursing-delivery' },
  { label: 'RN Delegation Checklist', to: '/staff/forms/nurse/rn-delegation' },
  { label: 'Nursing Tasks Screening Tool', to: '/staff/forms/nurse/tasks-screening' },
  { label: 'Comprehensive Nursing Assessment', to: '/staff/forms/nurse/comprehensive-assessment' },
  null,
  { label: 'Exclusion of HH/CC Provider', to: '/staff/forms/nurse/exclusion-hhcc' },
]

const DIRECTOR_FORMS = [
  { label: 'Exclusion Information / Schedules', to: '/director/forms/director/exclusion-schedule' },
  { label: 'Debar Vendor List / Schedules', to: '/director/forms/director/debar-vendor' },
  { label: 'Critical Incident Report Schedule', to: '/director/forms/director/critical-incident' },
  { label: 'Consumer Satisfaction Quarterly Review', to: '/director/forms/director/satisfaction' },
  { label: 'Notice For Advisory Committee Meeting', to: '/director/forms/director/notice-advisory' },
  { label: 'Dental Summary Sheet', to: '/director/forms/director/dental-summary' },
  { label: 'Minor Home Modification/Adaptive Aids Summary Sheet', to: '/director/forms/director/minor-adaptive' },
]

function Dropdown({ label, items }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="navbar-dropdown-wrap" ref={ref}>
      <button className="navbar-dropdown-btn" onClick={() => setOpen((o) => !o)}>
        {label}
        <span className="material-icons" style={{ fontSize: 18 }}>keyboard_arrow_down</span>
      </button>
      {open && (
        <div className="navbar-dropdown-menu">
          {items.map((item, i) =>
            item === null ? (
              <div key={i} className="navbar-dropdown-divider" />
            ) : (
              <NavLink key={item.to} to={item.to} className="navbar-dropdown-item" onClick={() => setOpen(false)}>
                {item.label}
              </NavLink>
            )
          )}
        </div>
      )}
    </div>
  )
}

function ProfileDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef()
  const navigate = useNavigate()
  const { logout, user } = useAuthStore()

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    try { await axiosClient.get('/auth/logout') } catch (_) {}
    logout()
    navigate('/login')
  }

  const profilePath = `/${user?.role === 'admin' ? 'admin' : user?.role === 'director' ? 'director' : 'staff'}/profile`

  return (
    <div className="navbar-dropdown-wrap" ref={ref}>
      <button className="navbar-dropdown-btn" onClick={() => setOpen((o) => !o)}>
        <span className="material-icons" style={{ fontSize: 22 }}>person</span>
      </button>
      {open && (
        <div className="navbar-dropdown-menu" style={{ minWidth: 160 }}>
          <NavLink to={profilePath} className="navbar-dropdown-item" onClick={() => setOpen(false)}>Profile</NavLink>
          <div className="navbar-dropdown-divider" />
          <button className="navbar-dropdown-item" onClick={handleLogout}>Log out</button>
        </div>
      )}
    </div>
  )
}

export default function TopNavbar({ title }) {
  const { user, agencyLogoUrl } = useAuthStore()
  const isDirector = user?.role === 'director'
  const isAdmin = user?.role === 'admin'
  const isNurse = user?.role === 'nurse'
  const showAgency = AGENCY_ROLES.includes(user?.role) && user?.agency?.name

  return (
    <nav className="top-navbar">
      <span className="top-navbar-title">
        {title}
        {showAgency && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#999', marginLeft: 8, textTransform: 'uppercase' }}>
            |
            {agencyLogoUrl ? (
              <img
                src={agencyLogoUrl}
                alt={user.agency.name}
                style={{ height: 45, width: 45, objectFit: 'cover', borderRadius: '50%', verticalAlign: 'middle', flexShrink: 0 }}
              />
            ) : (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 45, height: 45, borderRadius: '50%',
                background: '#222f3e', color: '#fff',
                fontSize: 14, fontWeight: 600, flexShrink: 0, textTransform: 'uppercase',
              }}>
                {user.agency.name.charAt(0)}
              </span>
            )}
            {user.agency.name}
          </span>
        )}
      </span>
      <div className="top-navbar-right">
        {(isDirector || isAdmin) && (
          <Dropdown label="Consumer Forms" items={CONSUMER_FORMS} />
        )}
        {(isDirector || isAdmin || isNurse) && (
          <Dropdown label="Nurse Forms" items={isNurse ? NURSE_FORMS_STAFF : NURSE_FORMS_DIRECTOR} />
        )}
        {isDirector && (
          <Dropdown label="Director Forms" items={DIRECTOR_FORMS} />
        )}
        <NotificationBell />
        <ProfileDropdown />
      </div>
    </nav>
  )
}
