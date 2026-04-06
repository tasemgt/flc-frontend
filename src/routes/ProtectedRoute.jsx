import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

const roleDashboard = {
  admin: '/admin/dashboard',
  director: '/director/dashboard',
  nurse: '/staff/dashboard',
  caregiver: '/staff/dashboard',
}

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={roleDashboard[user.role] || '/login'} replace />
  }

  return children
}
