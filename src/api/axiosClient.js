import axios from 'axios'

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,
})

// Attach token from store on every request
axiosClient.interceptors.request.use((config) => {
  // Lazy-load store to avoid circular imports
  const raw = localStorage.getItem('freelotcare-auth')
  if (raw) {
    try {
      const { state } = JSON.parse(raw)
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`
      }
    } catch (_) {}
  }
  return config
})

// On 401 → clear auth and redirect to login
axiosClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = error.config?.url || ''
    const isAuthAction = url.includes('/auth/login') || url.includes('/auth/change-password')
    if (error.response?.status === 401 && !isAuthAction) {
      localStorage.removeItem('freelotcare-auth')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosClient
