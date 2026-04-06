import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../../store/authStore'

const NURSE_FORMS = [
  { key: 'nursing-delivery', label: 'Nursing Services Delivery Log', icon: 'assignment', color: '#00897b', roles: ['director', 'nurse'] },
  { key: 'nursing-checklist', label: 'Nursing Services Checklist', icon: 'checklist', color: '#3949ab', roles: ['director'] },
  { key: 'rn-delegation', label: 'RN Delegation Checklist', icon: 'fact_check', color: '#1e88e5', roles: ['director', 'nurse'] },
  { key: 'tasks-screening', label: 'Nursing Tasks Screening Tool', icon: 'biotech', color: '#8e24aa', roles: ['director', 'nurse'] },
  { key: 'comprehensive-assessment', label: 'Comprehensive Nursing Assessment', icon: 'monitor_heart', color: '#e53935', roles: ['director', 'nurse'] },
  { key: 'exclusion-hhcc', label: 'Exclusion of HH/CC Provider (BON)', icon: 'gavel', color: '#222f3e', roles: ['director', 'nurse', 'caregiver'] },
]

export default function NurseFormsList() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const basePath = user?.role === 'director' ? '/director' : '/staff'

  const available = NURSE_FORMS.filter((f) => f.roles.includes(user?.role))

  return (
    <div>
      <div className="card">
        <div className="card-header-primary" style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '16px 20px' }}>
          <h4 className="card-title-white">Nurse Forms</h4>
          <p className="card-subtitle-white">Select a form to fill out</p>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {available.map((form) => (
              <button
                key={form.key}
                onClick={() => navigate(`${basePath}/forms/nurse/${form.key}`)}
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