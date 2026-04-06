import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  useDirectorMeta, useSubmitSatisfactionForm, useUpsertCriticalIncident,
  useUpsertExclusionSchedule, useUpsertDebarVendor,
  useSubmitDentalSummarySheet, useSubmitMinorAdaptiveSummary,
  useSubmitNoticeAdvisory,
} from '../../../api/directorForms.api'
import { Alert } from '../../../components/shared'
import useAuthStore from '../../../store/authStore'
import axiosClient from '../../../api/axiosClient'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const QUARTERS = ['1st Qtr (JAN-MAR)','2nd Qtr (APR-JUN)','3rd Qtr (JUL-SEP)','4th Qtr (OCT-DEC)']
const SATISFACTION_ITEMS = [
  'Are you satisfied with the services provided?','Are your needs being met?','Do staff treat you with respect?',
  'Are you given choices about your daily activities?','Do you feel safe in your home?','Are your rights respected?',
  'Do you have privacy when needed?','Are your meals nutritious and prepared to your liking?',
  'Are staff on time and reliable?','Would you recommend our services to others?',
]

function FormShell({ title, children, onSubmit, saving, error, success }) {
  return (
    <div>
      <div className="card">
        <div className="card-header-primary" style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div><h4 className="card-title-white">{title}</h4><p className="card-subtitle-white">Please fill in all required fields</p></div>
          <button type="button" className="btn btn-light btn-sm btn-round" onClick={() => window.history.back()}>← Back</button>
        </div>
        <div className="card-body">
          <Alert type="error" message={error} />
          {success && <Alert type="success" message={success} />}
          <form onSubmit={onSubmit}>
            {children}
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button type="submit" className="btn btn-primary btn-round" disabled={saving}>{saving ? 'Submitting…' : 'Submit Form'}</button>
              <button type="button" className="btn btn-light btn-round" onClick={() => window.history.back()}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── 1. Consumer Satisfaction ─────────────────────────────────────────────────
export function ConsumerSatisfactionForm() {
  const qc = useQueryClient()
  const mutation = useSubmitSatisfactionForm()
  const [responses, setResponses] = useState({})
  const [lcInput, setLcInput] = useState('')
  const [consumer, setConsumer] = useState(null)
  const [looking, setLooking] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleLookup = async () => {
    setLooking(true)
    try {
      const { data } = await axiosClient.get('/consumers', { params: { limit: 500 } })
      const found = (data.data || []).find((c) => c.lcNumber?.toLowerCase() === lcInput.trim().toLowerCase())
      if (!found) setError('Consumer not found')
      else { setConsumer(found); setError('') }
    } catch { setError('Lookup failed') }
    finally { setLooking(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!consumer) return setError('Please look up a consumer first')
    setError(''); setSuccess('')
    const fd = new FormData(e.target)
    const sections = SATISFACTION_ITEMS.map((item) => ({
      item, response: responses[item] || '', comment: responses[`comment__${item}`] || '',
    }))
    try {
      await mutation.mutateAsync({
        lcNumber: consumer.lcNumber,
        personInterviewed: fd.get('personInterviewed'),
        quarterlyPeriod: fd.get('quarterlyPeriod'),
        dateOfInterview: fd.get('dateOfInterview'),
        responses: JSON.stringify(sections),
        clientSignature: fd.get('clientSignature'),
        clientSignatureDate: fd.get('clientSignatureDate'),
        programManagerSignature: fd.get('programManagerSignature'),
        programManagerSignatureDate: fd.get('programManagerSignatureDate'),
      })
      qc.invalidateQueries({ queryKey: ['satisfaction-forms'] })
      setSuccess('Consumer Satisfaction Review submitted successfully.')
      setConsumer(null); setLcInput(''); setResponses({}); e.target.reset()
    } catch (err) { setError(err?.response?.data?.message || 'Submission failed') }
  }

  return (
    <FormShell title="Consumer Satisfaction Quarterly Review" onSubmit={handleSubmit} saving={mutation.isPending} error={error} success={success}>
      <div className="section-header">Consumer</div>
      {!consumer ? (
        <div style={{ display: 'flex', gap: 10, maxWidth: 400, marginBottom: 16 }}>
          <input type="text" className="form-control" style={{ flex: 1 }} placeholder="Enter LC Number"
            value={lcInput} onChange={(e) => setLcInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLookup()} />
          <button type="button" className="btn btn-primary btn-round btn-sm" onClick={handleLookup} disabled={looking}>{looking ? '…' : 'Find'}</button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#e8f5e9', borderRadius: 6, marginBottom: 16 }}>
          <span className="material-icons" style={{ color: '#43a047' }}>person</span>
          <div style={{ flex: 1 }}><div style={{ fontWeight: 500, fontSize: 14 }}>{consumer.firstName} {consumer.lastName}</div><div style={{ fontSize: 12, color: '#999' }}>LC: {consumer.lcNumber}</div></div>
          <button type="button" className="btn-icon" style={{ color: '#aaa' }} onClick={() => setConsumer(null)}><span className="material-icons" style={{ fontSize: 18 }}>close</span></button>
        </div>
      )}
      <div className="row">
        <div className="col-4"><div className="form-group"><label className="form-label">Person Interviewed *</label><input name="personInterviewed" type="text" className="form-control" required /></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Quarterly Period *</label><select name="quarterlyPeriod" className="form-control-box" required>{QUARTERS.map((q) => <option key={q} value={q}>{q}</option>)}</select></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Date of Interview *</label><input name="dateOfInterview" type="date" required style={{ width: '100%', padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #d2d2d2', fontSize: 14, outline: 'none' }} /></div></div>
      </div>
      <div className="section-header" style={{ marginTop: 16 }}>Satisfaction Survey</div>
      {SATISFACTION_ITEMS.map((item) => (
        <div key={item} style={{ padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
          <div style={{ fontSize: 13, color: '#555', marginBottom: 8 }}>{item}</div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            {['Yes', 'No', 'N/A'].map((val) => (
              <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 13 }}>
                <input type="radio" checked={responses[item] === val} onChange={() => setResponses((p) => ({ ...p, [item]: val }))} /> {val}
              </label>
            ))}
            <input type="text" placeholder="Comment" value={responses[`comment__${item}`] || ''} onChange={(e) => setResponses((p) => ({ ...p, [`comment__${item}`]: e.target.value }))}
              style={{ flex: 1, padding: '4px 8px', border: '1px solid #ddd', borderRadius: 3, fontSize: 12, outline: 'none', minWidth: 160 }} />
          </div>
        </div>
      ))}
      <div className="section-header" style={{ marginTop: 16 }}>Signatures</div>
      <div className="row">
        <div className="col-3"><div className="form-group"><label className="form-label">Client/LAR Signature *</label><input name="clientSignature" type="text" className="form-control" required /></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Date *</label><input name="clientSignatureDate" type="date" required style={{ width: '100%', padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #d2d2d2', fontSize: 14, outline: 'none' }} /></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Program Manager Signature *</label><input name="programManagerSignature" type="text" className="form-control" required /></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Date *</label><input name="programManagerSignatureDate" type="date" required style={{ width: '100%', padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #d2d2d2', fontSize: 14, outline: 'none' }} /></div></div>
      </div>
    </FormShell>
  )
}

// ── 2. Critical Incident ─────────────────────────────────────────────────────
export function CriticalIncidentForm() {
  const qc = useQueryClient()
  const mutation = useUpsertCriticalIncident()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const year = new Date().getFullYear().toString()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    const fd = new FormData(e.target)
    try {
      await mutation.mutateAsync({ year, month: fd.get('month'), dateOfCompletion: fd.get('dateOfCompletion'), date: fd.get('date'), signature: fd.get('signature') })
      qc.invalidateQueries({ queryKey: ['critical-incidents'] })
      setSuccess('Critical Incident entry saved.')
      e.target.reset()
    } catch (err) { setError(err?.response?.data?.message || 'Submission failed') }
  }

  return (
    <FormShell title="Critical Incident Report Schedule" onSubmit={handleSubmit} saving={mutation.isPending} error={error} success={success}>
      <div style={{ background: '#f9f9f9', borderRadius: 6, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#555' }}>
        Year: <strong>{year}</strong>
      </div>
      <div className="row">
        <div className="col-3"><div className="form-group"><label className="form-label">Month *</label><select name="month" className="form-control-box" required>{MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}</select></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Date of Completion in CARE *</label><input name="dateOfCompletion" type="date" required style={{ width: '100%', padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #d2d2d2', fontSize: 14, outline: 'none' }} /></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Date *</label><input name="date" type="date" required style={{ width: '100%', padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #d2d2d2', fontSize: 14, outline: 'none' }} /></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Signature *</label><input name="signature" type="text" className="form-control" required /></div></div>
      </div>
    </FormShell>
  )
}

// ── 3. Exclusion Schedule ────────────────────────────────────────────────────
export function ExclusionScheduleForm() {
  const qc = useQueryClient()
  const mutation = useUpsertExclusionSchedule()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const year = new Date().getFullYear().toString()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    const fd = new FormData(e.target)
    try {
      await mutation.mutateAsync({ year, month: fd.get('month'), date: fd.get('date'), signature: fd.get('signature') })
      qc.invalidateQueries({ queryKey: ['exclusion-schedules'] })
      setSuccess('Exclusion Schedule entry saved.')
      e.target.reset()
    } catch (err) { setError(err?.response?.data?.message || 'Submission failed') }
  }

  return (
    <FormShell title="Exclusion Information / Schedules" onSubmit={handleSubmit} saving={mutation.isPending} error={error} success={success}>
      <div style={{ background: '#f9f9f9', borderRadius: 6, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#555' }}>Year: <strong>{year}</strong></div>
      <div className="row">
        <div className="col-3"><div className="form-group"><label className="form-label">Month *</label><select name="month" className="form-control-box" required>{MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}</select></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Date *</label><input name="date" type="date" required style={{ width: '100%', padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #d2d2d2', fontSize: 14, outline: 'none' }} /></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Signature *</label><input name="signature" type="text" className="form-control" required /></div></div>
      </div>
    </FormShell>
  )
}

// ── 4. Debar Vendor ──────────────────────────────────────────────────────────
export function DebarVendorForm() {
  const qc = useQueryClient()
  const mutation = useUpsertDebarVendor()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const year = new Date().getFullYear().toString()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    const fd = new FormData(e.target)
    try {
      await mutation.mutateAsync({ year, quarter: fd.get('quarter'), date: fd.get('date'), signature: fd.get('signature') })
      qc.invalidateQueries({ queryKey: ['debar-vendors'] })
      setSuccess('Debar Vendor entry saved.')
      e.target.reset()
    } catch (err) { setError(err?.response?.data?.message || 'Submission failed') }
  }

  return (
    <FormShell title="Debar Vendor List / Schedules" onSubmit={handleSubmit} saving={mutation.isPending} error={error} success={success}>
      <div style={{ background: '#f9f9f9', borderRadius: 6, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#555' }}>Year: <strong>{year}</strong></div>
      <div className="row">
        <div className="col-4"><div className="form-group"><label className="form-label">Quarter *</label><select name="quarter" className="form-control-box" required>{QUARTERS.map((q) => <option key={q} value={q}>{q}</option>)}</select></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Date *</label><input name="date" type="date" required style={{ width: '100%', padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #d2d2d2', fontSize: 14, outline: 'none' }} /></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Signature *</label><input name="signature" type="text" className="form-control" required /></div></div>
      </div>
    </FormShell>
  )
}

// ── 5 & 6. Summary Sheets (shared structure) ─────────────────────────────────
function SummarySheetForm({ title, mutationHook, queryKey }) {
  const qc = useQueryClient()
  const mutation = mutationHook()
  const { user } = useAuthStore()
  const [sections, setSections] = useState([{ name: '', clientCareId: '', serviceDate: '', serviceCode: '', dollarsSpent: '', requisitionFee: '' }])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const updateSection = (i, field, val) => setSections((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r))
  const addSection = () => setSections((prev) => [...prev, { name: '', clientCareId: '', serviceDate: '', serviceCode: '', dollarsSpent: '', requisitionFee: '' }])
  const removeSection = (i) => setSections((prev) => prev.filter((_, idx) => idx !== i))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    const fd = new FormData(e.target)
    try {
      await mutation.mutateAsync({
        componentCode: fd.get('componentCode'), contractNumber: fd.get('contractNumber'),
        contactPerson: fd.get('contactPerson'), areaCode: fd.get('areaCode'),
        telephoneNumber: fd.get('telephoneNumber'), serviceMonth: fd.get('serviceMonth'),
        serviceYear: fd.get('serviceYear'), sections: JSON.stringify(sections),
        signature: fd.get('signature'), date: fd.get('date'),
      })
      qc.invalidateQueries({ queryKey: [queryKey] })
      setSuccess(`${title} submitted successfully.`)
      setSections([{ name: '', clientCareId: '', serviceDate: '', serviceCode: '', dollarsSpent: '', requisitionFee: '' }])
      e.target.reset()
    } catch (err) { setError(err?.response?.data?.message || 'Submission failed') }
  }

  const inputStyle = { width: '100%', padding: '4px 6px', border: '1px solid #ddd', borderRadius: 3, fontSize: 12, outline: 'none' }

  return (
    <FormShell title={title} onSubmit={handleSubmit} saving={mutation.isPending} error={error} success={success}>
      <div className="row">
        <div className="col-3"><div className="form-group"><label className="form-label">Component Code *</label><input name="componentCode" type="text" className="form-control" required /></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Contract Number *</label><input name="contractNumber" type="text" className="form-control" required /></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Contact Person *</label><input name="contactPerson" type="text" className="form-control" required /></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Area Code *</label><input name="areaCode" type="text" className="form-control" required /></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Telephone Number *</label><input name="telephoneNumber" type="text" className="form-control" required /></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Service Month *</label><select name="serviceMonth" className="form-control-box" required>{MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}</select></div></div>
        <div className="col-2"><div className="form-group"><label className="form-label">Year *</label><input name="serviceYear" type="text" className="form-control" defaultValue={new Date().getFullYear()} required /></div></div>
      </div>
      <div className="section-header" style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Consumer Entries
        <button type="button" className="btn btn-primary btn-sm btn-round" onClick={addSection}>+ Add Row</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead><tr style={{ borderBottom: '1px solid #eee' }}>{['Name', 'Client Care ID', 'Service Date', 'Service Code', '$ Spent', 'Requisition Fee', ''].map((h) => <th key={h} style={{ padding: '6px 8px', textAlign: 'left', color: '#aaa' }}>{h}</th>)}</tr></thead>
          <tbody>
            {sections.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f9f9f9' }}>
                <td style={{ padding: '4px 6px' }}><input type="text" value={row.name} onChange={(e) => updateSection(i, 'name', e.target.value)} style={inputStyle} /></td>
                <td style={{ padding: '4px 6px' }}><input type="text" value={row.clientCareId} onChange={(e) => updateSection(i, 'clientCareId', e.target.value)} style={inputStyle} /></td>
                <td style={{ padding: '4px 6px' }}><input type="date" value={row.serviceDate} onChange={(e) => updateSection(i, 'serviceDate', e.target.value)} style={inputStyle} /></td>
                <td style={{ padding: '4px 6px' }}><input type="text" value={row.serviceCode} onChange={(e) => updateSection(i, 'serviceCode', e.target.value)} style={inputStyle} /></td>
                <td style={{ padding: '4px 6px' }}><input type="text" value={row.dollarsSpent} onChange={(e) => updateSection(i, 'dollarsSpent', e.target.value)} style={inputStyle} /></td>
                <td style={{ padding: '4px 6px' }}><input type="text" value={row.requisitionFee} onChange={(e) => updateSection(i, 'requisitionFee', e.target.value)} style={inputStyle} /></td>
                <td style={{ padding: '4px 6px' }}>{sections.length > 1 && <button type="button" className="btn-icon text-danger" onClick={() => removeSection(i)}><span className="material-icons" style={{ fontSize: 16 }}>close</span></button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="row" style={{ marginTop: 16 }}>
        <div className="col-4"><div className="form-group"><label className="form-label">Signature *</label><input name="signature" type="text" className="form-control" required /></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Date *</label><input name="date" type="date" required style={{ width: '100%', padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #d2d2d2', fontSize: 14, outline: 'none' }} /></div></div>
      </div>
    </FormShell>
  )
}

export function DentalSummarySheetForm() {
  return <SummarySheetForm title="Dental Summary Sheet" mutationHook={useSubmitDentalSummarySheet} queryKey="dental-summary-sheets" />
}

export function MinorAdaptiveSummaryForm() {
  return <SummarySheetForm title="Minor Home Modification / Adaptive Aids Summary" mutationHook={useSubmitMinorAdaptiveSummary} queryKey="minor-adaptive-summaries" />
}

// ── 7. Notice for Advisory Committee ────────────────────────────────────────
export function NoticeAdvisoryCommitteeForm() {
  const qc = useQueryClient()
  const mutation = useSubmitNoticeAdvisory()
  const { user } = useAuthStore()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    const fd = new FormData(e.target)
    try {
      await mutation.mutateAsync(Object.fromEntries(fd.entries()))
      qc.invalidateQueries({ queryKey: ['notice-advisory-forms'] })
      setSuccess('Notice for Advisory Committee submitted successfully.')
      e.target.reset()
    } catch (err) { setError(err?.response?.data?.message || 'Submission failed') }
  }

  return (
    <FormShell title="Notice for Advisory Committee Meeting" onSubmit={handleSubmit} saving={mutation.isPending} error={error} success={success}>
      <div style={{ background: '#f9f9f9', borderRadius: 6, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#555' }}>
        From: <strong>{user?.firstName} {user?.lastName}</strong> — Program Director
      </div>
      <div className="row">
        <div className="col-3"><div className="form-group"><label className="form-label">Notice Date *</label><input name="date" type="date" required style={{ width: '100%', padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #d2d2d2', fontSize: 14, outline: 'none' }} /></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Date of Meeting *</label><input name="dateOfMeeting" type="date" required style={{ width: '100%', padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #d2d2d2', fontSize: 14, outline: 'none' }} /></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Time of Meeting *</label><input name="timeOfMeeting" type="time" required style={{ width: '100%', padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #d2d2d2', fontSize: 14, outline: 'none' }} /></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Venue *</label><input name="venue" type="text" className="form-control" required /></div></div>
      </div>
      <div style={{ background: '#f9f9f9', borderRadius: 6, padding: '16px 20px', marginBottom: 16, fontSize: 13, color: '#555', lineHeight: 1.8 }}>
        <strong>Agenda:</strong>
        <ol style={{ paddingLeft: 20, marginTop: 8 }}>
          <li>Evaluating and addressing the satisfaction of individuals or LARs with the program provider's services.</li>
          <li>Soliciting, addressing, and reviewing complaints from individuals or LARs about the operations of the program provider.</li>
          <li>Reviewing all allegations of abuse, neglect, and exploitation alleged to have been committed by a service provider.</li>
          <li>Reviewing the reasons for terminating HCS or CFC Program services to individuals.</li>
        </ol>
      </div>
      <div className="form-group">
        <label className="form-label">Copy To</label>
        <input name="copy" type="text" className="form-control" placeholder="Names / roles to copy" />
      </div>
    </FormShell>
  )
}