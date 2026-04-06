import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosClient from '../../api/axiosClient'
import { Alert, Spinner } from './index'
import useAuthStore from '../../store/authStore'

export default function FormWrapper({ title, formType, onSubmit, children, isSubmitting, error, success }) {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [lcInput, setLcInput] = useState('')
  const [consumer, setConsumer] = useState(null)
  const [lookupError, setLookupError] = useState('')
  const [looking, setLooking] = useState(false)

  const basePath = user?.role === 'director' ? '/director' : '/staff'

  const handleLookup = async () => {
    if (!lcInput.trim()) return setLookupError('Please enter an LC Number')
    setLookupError(''); setConsumer(null)
    setLooking(true)
    try {
      const { data } = await axiosClient.get('/consumers', { params: { limit: 500 } })
      const found = (data.data || []).find(
        (c) => c.lcNumber?.toLowerCase() === lcInput.trim().toLowerCase()
      )
      if (!found) return setLookupError(`No consumer found with LC Number: ${lcInput}`)
      setConsumer(found)
    } catch {
      setLookupError('Lookup failed. Please try again.')
    } finally {
      setLooking(false)
    }
  }

  return (
    <div>
      <div className="card">
        <div
          className="card-header-primary"
          style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}
        >
          <div>
            <h4 className="card-title-white">{title}</h4>
            <p className="card-subtitle-white">Please fill in all required fields</p>
          </div>
          <button type="button" className="btn btn-light btn-sm btn-round" onClick={() => navigate(`${basePath}/forms/consumer`)}>
            ← Back to Forms
          </button>
        </div>

        <div className="card-body">
          <Alert type="error" message={error} />
          {success && <Alert type="success" message={success} />}

          {/* Consumer lookup */}
          <div className="section-header">Consumer</div>
          {!consumer ? (
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', maxWidth: 480, marginBottom: 24 }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Enter LC Number *</label>
                <input
                  type="text"
                  className="form-control"
                  value={lcInput}
                  onChange={(e) => setLcInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                  placeholder="e.g. LC-001"
                />
              </div>
              <button type="button" className="btn btn-primary btn-round" onClick={handleLookup} disabled={looking}>
                {looking ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : (
                  <span className="material-icons" style={{ fontSize: 18 }}>search</span>
                )}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: '#e8f5e9', borderRadius: 6, marginBottom: 24 }}>
              <span className="material-icons" style={{ color: '#43a047', fontSize: 20 }}>person</span>
              <div>
                <div style={{ fontWeight: 500, color: '#3c4858', fontSize: 14 }}>{consumer.firstName} {consumer.lastName}</div>
                <div style={{ fontSize: 12, color: '#999' }}>LC: {consumer.lcNumber}</div>
              </div>
              <button
                type="button"
                className="btn-icon"
                style={{ marginLeft: 'auto', color: '#aaa' }}
                onClick={() => { setConsumer(null); setLcInput('') }}
                title="Change consumer"
              >
                <span className="material-icons" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>
          )}

          {lookupError && <Alert type="error" message={lookupError} />}

          {consumer && (
            <form onSubmit={(e) => {
              e.preventDefault()
              onSubmit(e, consumer)
            }}>
              {/* Hidden consumer fields */}
              <input type="hidden" name="consumerId" value={consumer._id} />
              <input type="hidden" name="lcNumber" value={consumer.lcNumber} />

              {/* Common header fields */}
              <div className="section-header">Appointment Details</div>
              <div className="row">
                <div className="col-4">
                  <div className="form-group">
                    <label className="form-label">Date of Appointment *</label>
                    <input
                      name="dateOfAppointment"
                      type="date"
                      required
                      style={{ width: '100%', padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #d2d2d2', fontSize: 14, outline: 'none' }}
                    />
                  </div>
                </div>
                <div className="col-4">
                  <div className="form-group">
                    <label className="form-label">Signatory Name *</label>
                    <input
                      name="signatoryName"
                      type="text"
                      className="form-control"
                      defaultValue={`${user?.firstName} ${user?.lastName}`}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Form-specific fields */}
              {children}

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button type="submit" className="btn btn-primary btn-round" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting…' : 'Submit Form'}
                </button>
                <button type="button" className="btn btn-light btn-round" onClick={() => navigate(`${basePath}/forms/consumer`)}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}