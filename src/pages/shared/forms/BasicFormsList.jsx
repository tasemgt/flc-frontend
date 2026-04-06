import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../../store/authStore'

const FORM_GROUPS = [
  {
    label: 'Assessment Forms',
    forms: [
      { key: 'dental', label: 'Dental Examination Form', icon: 'medical_services', color: '#00acc1' },
      { key: 'environmental', label: 'Environmental Safety Checklist', icon: 'home', color: '#43a047' },
      { key: 'hot-water', label: 'Hot Water Assessment', icon: 'water_drop', color: '#1e88e5' },
      { key: 'fire-evac', label: 'Fire Evacuation Assessment', icon: 'local_fire_department', color: '#e53935' },
      { key: 'fire-emergency', label: 'Fire / Emergency Drill', icon: 'emergency', color: '#fb8c00' },
      { key: 'poison', label: 'Toxic Poison Assessment', icon: 'warning', color: '#8e24aa' },
      { key: 'legal', label: 'Annual Assessment of Legal Status', icon: 'gavel', color: '#222f3e' },
    ],
  },
  {
    label: 'Service Delivery Logs',
    forms: [
      { key: 'supported-home', label: 'Supported Home Living CFC-PASS Service Delivery', icon: 'house', color: '#00897b' },
      { key: 'supported-employment', label: 'Supported Employment/EA Service Delivery', icon: 'work', color: '#3949ab' },
      { key: 'respite', label: 'Respite Service Delivery Log', icon: 'spa', color: '#e91e63' },
      { key: 'rss-sl', label: 'RSS and SL Service Delivery Log', icon: 'night_shelter', color: '#f57c00' },
      { key: 'day-habilitation', label: 'Day Habilitation Service Delivery', icon: 'wb_sunny', color: '#f9a825' },
    ],
  },
  {
    label: 'Medication & Consent',
    forms: [
      { key: 'prn-medication', label: 'PRN Medication List', icon: 'medication', color: '#c62828' },
      { key: 'consent-medical', label: 'Consent for Release of Medical Information', icon: 'assignment', color: '#455a64' },
    ],
  },
]

export default function BasicFormsList() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const basePath = user?.role === 'director' ? '/director' : '/staff'

  return (
    <div>
      <div className="card">
        <div className="card-header-primary" style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '16px 20px' }}>
          <h4 className="card-title-white">Consumer Forms</h4>
          {/* <h4 className="card-title-white">Basic Consumer Forms</h4> */}
          <p className="card-subtitle-white">Select a form to fill out for a consumer</p>
        </div>
        <div className="card-body">
          {FORM_GROUPS.map((group) => (
            <div key={group.label} style={{ marginBottom: 28 }}>
              <div className="section-header">{group.label}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {group.forms.map((form) => (
                  <button
                    key={form.key}
                    onClick={() => navigate(`${basePath}/forms/consumer/${form.key}`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                      background: '#fff', border: '1px solid #eee', borderRadius: 8,
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'box-shadow .15s, border-color .15s',
                      boxShadow: '0 1px 4px rgba(0,0,0,.06)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.12)'; e.currentTarget.style.borderColor = form.color }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,.06)'; e.currentTarget.style.borderColor = '#eee' }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: form.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span className="material-icons" style={{ color: form.color, fontSize: 20 }}>{form.icon}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#3c4858', lineHeight: 1.4 }}>{form.label}</div>
                    </div>
                    <span className="material-icons" style={{ color: '#ddd', fontSize: 18, flexShrink: 0 }}>chevron_right</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}