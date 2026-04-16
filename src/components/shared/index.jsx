import { useRef, useState } from 'react'

// ── StatusBadge ──────────────────────────────────────────────────────────────
export function StatusBadge({ value }) {
  const v = String(value).toLowerCase()
  let cls = 'badge-default'
  let label = value

  if (v === 'true' || v === 'approved' || v === 'completed') { cls = 'badge-success'; label = v === 'true' ? 'Approved' : value }
  else if (v === 'false' || v === 'pending') { cls = 'badge-warning'; label = v === 'false' ? 'Pending' : 'Pending' }
  else if (v === 'cancelled' || v === 'rejected') { cls = 'badge-danger'; label = value }
  else if (v === 'ongoing') { cls = 'badge-info'; label = 'Ongoing' }

  return <span className={`badge ${cls}`}>{String(label).charAt(0).toUpperCase() + String(label).slice(1)}</span>
}

// ── PageHeader ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, color = 'primary', children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div className="card">
        <div className={`card-header-${color}`} style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h4 className="card-title-white">{title}</h4>
              {subtitle && <p className="card-subtitle-white">{subtitle}</p>}
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── File size limits ─────────────────────────────────────────────────────────
const IMAGE_MIMETYPES = ['image/jpeg', 'image/jpg', 'image/png']
const MAX_IMAGE_MB = 2
const MAX_DOC_MB = 5

function getFileSizeLimit(mimetype) {
  return IMAGE_MIMETYPES.includes(mimetype) ? MAX_IMAGE_MB : MAX_DOC_MB
}

// ── FileUpload ────────────────────────────────────────────────────────────────
export function FileUpload({ label, name, accept = 'application/pdf', required, showExpiry, onChange, expiryName, expiryValue, onExpiryChange }) {
  const inputRef = useRef()
  const expiryRef = useRef()
  const [sizeError, setSizeError] = useState('')

  return (
    <div className="file-upload-wrap">
      <div className="form-label">{label}{required && ' *'}</div>
      <label className="file-upload-label" onClick={() => inputRef.current?.click()}>
        <span className="material-icons">upload_file</span>
        <span id={`${name}-label`}>Choose file…</span>
      </label>
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files[0]
          const el = document.getElementById(`${name}-label`)
          setSizeError('')
          if (file) {
            const limitMB = getFileSizeLimit(file.type)
            if (file.size > limitMB * 1024 * 1024) {
              setSizeError(`File too large — max ${limitMB} MB for this file type.`)
              e.target.value = ''
              if (el) el.textContent = 'Choose file…'
              return
            }
            if (el) el.textContent = file.name
          } else {
            if (el) el.textContent = 'Choose file…'
          }
          onChange && onChange(e)
        }}
      />
      <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
        PDF, Word (.doc, .docx), JPG, PNG &nbsp;·&nbsp; Documents max {MAX_DOC_MB} MB &nbsp;·&nbsp; Images max {MAX_IMAGE_MB} MB
      </div>
      {sizeError && (
        <div style={{ fontSize: 11, color: '#e53935', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span className="material-icons" style={{ fontSize: 13 }}>error_outline</span>
          {sizeError}
        </div>
      )}
      {showExpiry && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <span style={{ fontSize: 12, color: '#aaa' }}>Expiry date:</span>
          <input
            ref={expiryRef}
            type="date"
            name={expiryName}
            value={expiryValue || ''}
            onChange={onExpiryChange}
            className="form-control-box"
            style={{ maxWidth: 160, padding: '6px 10px', fontSize: 13 }}
          />
        </div>
      )}
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner() {
  return <div className="loading-center"><div className="spinner" /></div>
}

// ── Alert ─────────────────────────────────────────────────────────────────────
export function Alert({ type = 'error', message }) {
  if (!message) return null
  return (
    <div className={`alert alert-${type === 'error' ? 'error' : 'success-msg'}`}>
      <span className="material-icons" style={{ fontSize: 18, flexShrink: 0 }}>
        {type === 'error' ? 'error_outline' : 'check_circle_outline'}
      </span>
      {message}
    </div>
  )
}
