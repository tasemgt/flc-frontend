import { useNavigate } from 'react-router-dom'

const DIRECTOR_FORMS = [
  { key: 'satisfaction', label: 'Consumer Satisfaction Quarterly Review', icon: 'sentiment_satisfied_alt', color: '#43a047' },
  { key: 'critical-incident', label: 'Critical Incident Report Schedule', icon: 'warning', color: '#e53935' },
  { key: 'exclusion-schedule', label: 'Exclusion Information / Schedules', icon: 'event_busy', color: '#f57c00' },
  { key: 'debar-vendor', label: 'Debar Vendor List / Schedules', icon: 'remove_circle', color: '#8e24aa' },
  { key: 'dental-summary', label: 'Dental Summary Sheet', icon: 'medical_services', color: '#00897b' },
  { key: 'minor-adaptive', label: 'Minor Home Modification / Adaptive Aids Summary', icon: 'home_repair_service', color: '#1e88e5' },
  { key: 'notice-advisory', label: 'Notice for Advisory Committee Meeting', icon: 'campaign', color: '#222f3e' },
]

export default function DirectorFormsList() {
  const navigate = useNavigate()
  return (
    <div>
      <div className="card">
        <div className="card-header-primary" style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '16px 20px' }}>
          <h4 className="card-title-white">Director Forms</h4>
          <p className="card-subtitle-white">Select a form to fill out</p>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {DIRECTOR_FORMS.map((form) => (
              <button
                key={form.key}
                onClick={() => navigate(`/director/forms/director/${form.key}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: '#fff', border: '1px solid #eee', borderRadius: 8, cursor: 'pointer', textAlign: 'left', transition: 'box-shadow .15s, border-color .15s', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}
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
      </div>
    </div>
  )
}