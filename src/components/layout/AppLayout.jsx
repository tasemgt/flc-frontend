import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopNavbar from './TopNavbar'
import useAuthStore from '../../store/authStore'
import { useMyLogoUrl } from '../../api/agencies.api'

const routeTitles = {
  '/admin/dashboard': 'Dashboard',
  '/admin/users': 'All Users',
  '/admin/users/add': 'Register Staff User',
  '/admin/users/add-director': 'Add Program Director',
  '/admin/agency-applications': 'Agency Enrollment Applications',
  '/admin/employments': 'Employment Applications',
  '/admin/profile': 'Profile',
  '/admin/settings': 'Settings',
  '/director/dashboard': 'Dashboard',
  '/director/consumers': 'Consumers',
  '/director/consumers/add': 'Add Consumer',
  '/director/employments': 'Employment Applications',
  '/director/appointments': 'Appointments',
  '/director/profile': 'Profile',
  '/staff/dashboard': 'Dashboard',
  '/staff/consumers': 'Consumers',
  '/staff/appointments': 'Appointments',
  '/staff/profile': 'Profile',
  '/director/staff': 'My Staff',
  '/director/forms/consumer': 'Basic Consumer Forms',
  '/director/forms/consumer/dental': 'Dental Examination Form',
  '/director/forms/consumer/environmental': 'Environmental Safety Checklist',
  '/director/forms/consumer/hot-water': 'Hot Water Assessment',
  '/director/forms/consumer/fire-evac': 'Fire Evacuation Assessment',
  '/director/forms/consumer/fire-emergency': 'Fire / Emergency Drill',
  '/director/forms/consumer/poison': 'Toxic Poison Assessment',
  '/director/forms/consumer/legal': 'Annual Assessment of Legal Status',
  '/staff/forms/consumer': 'Basic Consumer Forms',
  '/staff/forms/consumer/dental': 'Dental Examination Form',
  '/staff/forms/consumer/environmental': 'Environmental Safety Checklist',
  '/staff/forms/consumer/hot-water': 'Hot Water Assessment',
  '/staff/forms/consumer/fire-evac': 'Fire Evacuation Assessment',
  '/staff/forms/consumer/fire-emergency': 'Fire / Emergency Drill',
  '/staff/forms/consumer/poison': 'Toxic Poison Assessment',
  '/staff/forms/consumer/legal': 'Annual Assessment of Legal Status',
  '/director/forms/consumer/supported-home': 'Supported Home Living Delivery',
  '/director/forms/consumer/supported-employment': 'Supported Employment Delivery',
  '/director/forms/consumer/respite': 'Respite Service Delivery Log',
  '/director/forms/consumer/rss-sl': 'RSS and SL Service Delivery Log',
  '/director/forms/consumer/day-habilitation': 'Day Habilitation Service Delivery',
  '/director/forms/consumer/prn-medication': 'PRN Medication List',
  '/director/forms/consumer/consent-medical': 'Consent for Release of Medical Information',
  '/staff/forms/consumer/supported-home': 'Supported Home Living Delivery',
  '/staff/forms/consumer/supported-employment': 'Supported Employment Delivery',
  '/staff/forms/consumer/respite': 'Respite Service Delivery Log',
  '/staff/forms/consumer/rss-sl': 'RSS and SL Service Delivery Log',
  '/staff/forms/consumer/day-habilitation': 'Day Habilitation Service Delivery',
  '/staff/forms/consumer/prn-medication': 'PRN Medication List',
  '/staff/forms/consumer/consent-medical': 'Consent for Release of Medical Information',
}

export default function AppLayout() {
  const { pathname } = useLocation()
  const { user, setAgencyLogoUrl } = useAuthStore()
  const hasAgency = ['director', 'nurse', 'caregiver'].includes(user?.role)
  const { data: logoData } = useMyLogoUrl(hasAgency)

  useEffect(() => {
    if (logoData?.logoUrl !== undefined) {
      setAgencyLogoUrl(logoData.logoUrl)
    }
  }, [logoData])
  // Match static routes first, then fall back to dynamic patterns
  let title = routeTitles[pathname]
  if (!title) {
    if (pathname.match(/\/admin\/agency-applications\/.+/)) title = 'Agency Application Detail'
    else if (pathname.match(/\/admin\/employments\/.+/)) title = 'Employment Application Detail'
    else if (pathname.match(/\/admin\/users\/.+/)) title = 'User Detail'
    else if (pathname.match(/\/director\/employments\/.+/)) title = 'Employment Application Detail'
    else if (pathname.match(/\/director\/consumers\/.+/)) title = 'Consumer Detail'
    else title = 'Dashboard'
  }
  else if (pathname.match(/\/(director|staff)\/forms\/view\/.+/)) title = 'Form Detail'

  return (
    <div className="wrapper">
      <Sidebar />
      <div className="main-panel">
        <TopNavbar title={title} />
        <div className="content">
          <Outlet />
        </div>
        <footer className="bottom-bar">
          <div>
            <a href="#">Contact Us</a>
            <a href="#">About Us</a>
          </div>
          <span>© {new Date().getFullYear()} Healthcare System</span>
        </footer>
      </div>
    </div>
  )
}
