import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  useSubmitNursingDelivery, useSubmitNursingChecklist,
  useSubmitRnDelegation, useSubmitTasksScreening,
  useSubmitExclusionHhcc, useSubmitComprehensiveAssessment,
  useNurseMeta,
} from '../../../api/nurseForms.api'
import { Alert, Spinner } from '../../../components/shared'
import useAuthStore from '../../../store/authStore'

const CHECKLIST_DATA = [
  { title: 'Requirements for All Providers', items: [{ title: 'Written plan and schedule to complete comprehensive nursing assessments developed.', kids: [] }, { title: 'Policy and procedure in place that indicates that RN makes delegation decisions.', kids: [] }, { title: 'LVN supervised by RN if oral, topical or metered dose inhalers are excluded from delegation.', kids: [] }, { title: 'LVN has RN clinical supervision.', kids: [] }, { title: 'RN or LVN has trained and evaluated competency of staff on performing nursing tasks.', kids: [] }, { title: 'Comprehensive assessment/nursing service plans (NSPs) that have been completed by RN:', kids: ['1. Supports person directed plan (PDP) outcome.', '2. Defines nursing services.', '3. Makes delegation decisions.', '4. Identifies monitoring requirements.', '5. Includes justification of nursing units on IPC.', '6. Instructs unlicensed person when to contact RN.', '7. Delegated task(s) has plan for supervision.'] }, { title: 'RN called prior to giving chemical restraints.', kids: [] }] },
  { title: 'Requirements for LVNs Participating in SB 1857 On-Call Pilot', items: [{ title: 'On-call data entered into the CARE System.', kids: [] }, { title: 'LVN has been determined competent by the RN clinical supervisor.', kids: [] }, { title: 'Have trained direct support providers on communication protocol.', kids: [] }, { title: 'Have strictly adhered to the Operational and Communication Protocols.', kids: [] }, { title: 'Completed a CPR course for health professionals.', kids: [] }, { title: 'Completed a First Aid course.', kids: [] }] },
]

function FormShell({ title, children, onSubmit, saving, error, success, backPath }) {
  return (
    <div>
      <div className="card">
        <div className="card-header-primary" style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h4 className="card-title-white">{title}</h4>
            <p className="card-subtitle-white">Please fill in all required fields</p>
          </div>
          <button type="button" className="btn btn-light btn-sm btn-round" onClick={() => window.history.back()}>← Back</button>
        </div>
        <div className="card-body">
          <Alert type="error" message={error} />
          {success && <Alert type="success" message={success} />}
          <form onSubmit={onSubmit}>
            {children}
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button type="submit" className="btn btn-primary btn-round" disabled={saving}>
                {saving ? 'Submitting…' : 'Submit Form'}
              </button>
              <button type="button" className="btn btn-light btn-round" onClick={() => window.history.back()}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── 1. Nursing Service Delivery ──────────────────────────────────────────────
export function NursingServiceDeliveryForm() {
  const qc = useQueryClient()
  const mutation = useSubmitNursingDelivery()
  const { data: metaData } = useNurseMeta()
  const { user } = useAuthStore()
  const [checked, setChecked] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const descriptions = metaData?.data?.nursingDescriptions || []

  const toggle = (i) => setChecked((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    const fd = new FormData(e.target)
    const payload = Object.fromEntries(fd.entries())
    payload.checkedDescriptions = JSON.stringify(checked)
    payload.checkedComponents = JSON.stringify([])
    try {
      await mutation.mutateAsync(payload)
      qc.invalidateQueries({ queryKey: ['nursing-deliveries'] })
      setSuccess('Nursing Services Delivery Log submitted successfully.')
      setChecked([]); e.target.reset()
    } catch (err) { setError(err?.response?.data?.message || 'Submission failed') }
  }

  return (
    <FormShell title="Nursing Services Delivery Log" onSubmit={handleSubmit} saving={mutation.isPending} error={error} success={success}>
      <div className="row">
        <div className="col-4"><div className="form-group"><label className="form-label">Individual Name *</label><input name="individualName" type="text" className="form-control" required /></div></div>
        <div className="col-4"><div className="form-group"><label className="form-label">Location *</label><input name="location" type="text" className="form-control" required /></div></div>
        <div className="col-4"><div className="form-group"><label className="form-label">Local Case Number *</label><input name="lcNumber" type="text" className="form-control" required /></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Service Date *</label><input name="serviceDate" type="date" required style={{ width: '100%', padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #d2d2d2', fontSize: 14, outline: 'none' }} /></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Begin Time *</label><input name="beginTime" type="time" required style={{ width: '100%', padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #d2d2d2', fontSize: 14, outline: 'none' }} /></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">End Time *</label><input name="endTime" type="time" required style={{ width: '100%', padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #d2d2d2', fontSize: 14, outline: 'none' }} /></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Units of Service *</label><input name="unitsOfService" type="text" className="form-control" required /></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Nurse Name *</label><input name="nurseName" type="text" className="form-control" defaultValue={`${user?.firstName} ${user?.lastName}`} required /></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Nurse Signature *</label><input name="nurseSignature" type="text" className="form-control" required /></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Title *</label><input name="title" type="text" className="form-control" required /></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Staff ID *</label><input name="staffID" type="text" className="form-control" required /></div></div>
      </div>
      <div className="section-header" style={{ marginTop: 16 }}>Services Performed — check all that apply</div>
      {descriptions.map((desc, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '6px 0', borderBottom: '1px solid #f9f9f9' }}>
          <input type="checkbox" checked={checked.includes(i)} onChange={() => toggle(i)} style={{ marginTop: 3, accentColor: '#222f3e' }} />
          <span style={{ fontSize: 13, color: '#555' }}>{desc}</span>
        </div>
      ))}
    </FormShell>
  )
}

// ── 2. Nursing Service Checklist ─────────────────────────────────────────────
export function NursingServiceChecklistForm() {
  const qc = useQueryClient()
  const mutation = useSubmitNursingChecklist()
  const [checked, setChecked] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const toggle = (key) => setChecked((prev) => ({ ...prev, [key]: !prev[key] }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    const fd = new FormData(e.target)
    try {
      await mutation.mutateAsync({ date: fd.get('date'), checkedItems: JSON.stringify(checked) })
      qc.invalidateQueries({ queryKey: ['nursing-checklists'] })
      setSuccess('Nursing Services Checklist submitted successfully.')
      setChecked({}); e.target.reset()
    } catch (err) { setError(err?.response?.data?.message || 'Submission failed') }
  }

  return (
    <FormShell title="Nursing Services Checklist" onSubmit={handleSubmit} saving={mutation.isPending} error={error} success={success}>
      <div className="row">
        <div className="col-3"><div className="form-group"><label className="form-label">Date *</label><input name="date" type="date" required style={{ width: '100%', padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #d2d2d2', fontSize: 14, outline: 'none' }} /></div></div>
      </div>
      {CHECKLIST_DATA.map((section) => (
        <div key={section.title} style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 500, color: '#3c4858', fontSize: 14, marginBottom: 10, padding: '6px 12px', background: '#f5f5f5', borderRadius: 4 }}>{section.title}</div>
          {section.items.map((item) => (
            <div key={item.title}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '6px 0', borderBottom: '1px solid #f9f9f9' }}>
                <input type="checkbox" checked={!!checked[item.title]} onChange={() => toggle(item.title)} style={{ marginTop: 3, accentColor: '#222f3e' }} />
                <span style={{ fontSize: 13, color: '#555' }}>{item.title}</span>
              </div>
              {item.kids.map((kid) => (
                <div key={kid} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '4px 0 4px 24px', borderBottom: '1px solid #f9f9f9' }}>
                  <input type="checkbox" checked={!!checked[kid]} onChange={() => toggle(kid)} style={{ marginTop: 3, accentColor: '#222f3e' }} />
                  <span style={{ fontSize: 12, color: '#777' }}>{kid}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </FormShell>
  )
}

// ── 3. RN Delegation Checklist ───────────────────────────────────────────────
export function RnDelegationChecklistForm() {
  const qc = useQueryClient()
  const mutation = useSubmitRnDelegation()
  const [responses, setResponses] = useState({})
  const [issues, setIssues] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Simplified RN delegation sections
  const RN_SECTIONS = [
    { title: 'Human Resources Code, Chapter 161', items: ['161.93 (a)(1)(A-C) — Unlicensed personnel may administer medications without RN delegation only when medication is oral, topical, or metered dose inhaler.', '161.093 (a)(2) — Medication is administered for a stable or predictable condition.', '161.093 (a)(3) — Individual was assessed initially by RN through face-to-face.', '161.094 (a)(1) — Administration of medications by UP is reviewed at least annually.', '161.094 (a)(2) — Provider has policies to ensure determination is made by an RN.'] },
    { title: 'Exempting Foster/Companion Care from BON Definition', items: ['(1) RN comprehensive assessment completed prior to exemption.', '(2) FC/CC meets BON definition of Client\'s Responsible Adult (CRA).', '(3) Has guardian approved to allow FC/CC to act as the CRA.', '(4) Evidence FC/CC can safely assume responsibility for individual\'s health care.', '(5) Comprehensive assessment reviewed annually.', '(6) Current nursing service plan required.'] },
    { title: 'Board of Nursing Chapter 225', items: ['(1) The individual is in an independent living environment.', '(2) The individual is willing and able to participate in decisions.', '(3) The task is for a stable and predictable condition.', 'Did the RN determine the task is for a stable and predictable condition?', 'Is there documentation that the RN verified experience and competency of UPs?', 'Did the RN document the level of supervision required?'] },
  ]

  const setResponse = (sectionTitle, item, value) => setResponses((prev) => ({ ...prev, [`${sectionTitle}__${item}`]: value }))
  const setIssue = (key, value) => setIssues((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    const fd = new FormData(e.target)
    const sections = RN_SECTIONS.map((section) => ({
      title: section.title,
      items: section.items.map((item) => ({
        item,
        response: responses[`${section.title}__${item}`] || 'n/a',
        issues: issues[`${section.title}__${item}`] || '',
      })),
    }))
    try {
      await mutation.mutateAsync({
        providerName: fd.get('providerName'),
        reviewerIndividual: fd.get('reviewerIndividual'),
        contractComponentCode: fd.get('contractComponentCode'),
        date: fd.get('date'),
        sections: JSON.stringify(sections),
      })
      qc.invalidateQueries({ queryKey: ['rn-delegations'] })
      setSuccess('RN Delegation Checklist submitted successfully.')
      setResponses({}); setIssues({}); e.target.reset()
    } catch (err) { setError(err?.response?.data?.message || 'Submission failed') }
  }

  return (
    <FormShell title="RN Delegation Checklist" onSubmit={handleSubmit} saving={mutation.isPending} error={error} success={success}>
      <div className="row">
        <div className="col-3"><div className="form-group"><label className="form-label">Provider Name *</label><input name="providerName" type="text" className="form-control" required /></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Reviewer / Individual *</label><input name="reviewerIndividual" type="text" className="form-control" required /></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Contract / Component Code *</label><input name="contractComponentCode" type="text" className="form-control" required /></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Date *</label><input name="date" type="date" required style={{ width: '100%', padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #d2d2d2', fontSize: 14, outline: 'none' }} /></div></div>
      </div>
      {RN_SECTIONS.map((section) => (
        <div key={section.title} style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 500, color: '#3c4858', fontSize: 14, marginBottom: 10, padding: '6px 12px', background: '#f5f5f5', borderRadius: 4 }}>{section.title}</div>
          {section.items.map((item) => {
            const key = `${section.title}__${item}`
            return (
              <div key={item} style={{ padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
                <div style={{ fontSize: 12, color: '#555', marginBottom: 8 }}>{item}</div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  {['yes', 'no', 'n/a'].map((val) => (
                    <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 13 }}>
                      <input type="radio" name={key} value={val} checked={responses[key] === val} onChange={() => setResponse(section.title, item, val)} />
                      {val.toUpperCase()}
                    </label>
                  ))}
                  <input
                    type="text"
                    placeholder="Issues / comments"
                    value={issues[key] || ''}
                    onChange={(e) => setIssue(key, e.target.value)}
                    style={{ flex: 1, padding: '4px 8px', border: '1px solid #ddd', borderRadius: 3, fontSize: 12, outline: 'none' }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </FormShell>
  )
}

// ── 4. Nursing Tasks Screening ───────────────────────────────────────────────
export function NursingTasksScreeningForm() {
  const qc = useQueryClient()
  const mutation = useSubmitTasksScreening()
  const { data: metaData } = useNurseMeta()
  const [physicianDelegation, setPhysicianDelegation] = useState('no')
  const [checkedRoutes, setCheckedRoutes] = useState([])
  const [answers, setAnswers] = useState({})
  const [selectedReview, setSelectedReview] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const routes = metaData?.data?.medicationRoutes || []
  const sections = metaData?.data?.tasksSections || []

  const toggleRoute = (route) => setCheckedRoutes((prev) => prev.includes(route) ? prev.filter((r) => r !== route) : [...prev, route])
  const setAnswer = (question, val) => setAnswers((prev) => ({ ...prev, [question]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    const fd = new FormData(e.target)
    try {
      await mutation.mutateAsync({
        programParticipant: fd.get('programParticipant'),
        date: fd.get('date'),
        physicianDelegation,
        checkedRoutes: JSON.stringify(checkedRoutes),
        sectionAnswers: JSON.stringify(answers),
        selectedReview,
        programProviderSignature: fd.get('programProviderSignature'),
        programProviderDate: fd.get('programProviderDate'),
      })
      qc.invalidateQueries({ queryKey: ['tasks-screenings'] })
      setSuccess('Nursing Tasks Screening Tool submitted successfully.')
      setPhysicianDelegation('no'); setCheckedRoutes([]); setAnswers({}); setSelectedReview(0)
      e.target.reset()
    } catch (err) { setError(err?.response?.data?.message || 'Submission failed') }
  }

  return (
    <FormShell title="Nursing Tasks Screening Tool" onSubmit={handleSubmit} saving={mutation.isPending} error={error} success={success}>
      <div className="row">
        <div className="col-4"><div className="form-group"><label className="form-label">Program Participant *</label><input name="programParticipant" type="text" className="form-control" required /></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Date *</label><input name="date" type="date" required style={{ width: '100%', padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #d2d2d2', fontSize: 14, outline: 'none' }} /></div></div>
      </div>
      <div className="section-header">A. Physician Delegation</div>
      <div style={{ fontSize: 13, color: '#555', marginBottom: 8 }}>Has a physician delegated all medical acts that will be completed by unlicensed staff?</div>
      <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
        {['yes', 'no'].map((val) => (
          <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
            <input type="radio" value={val} checked={physicianDelegation === val} onChange={() => setPhysicianDelegation(val)} /> {val.charAt(0).toUpperCase() + val.slice(1)}
          </label>
        ))}
      </div>
      <div className="section-header">B. Medication Administration Routes — check all that apply</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8, marginBottom: 16 }}>
        {routes.map((route) => (
          <label key={route} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, padding: '6px 0' }}>
            <input type="checkbox" checked={checkedRoutes.includes(route)} onChange={() => toggleRoute(route)} style={{ accentColor: '#222f3e' }} /> {route}
          </label>
        ))}
      </div>
      {sections.map((section) => (
        <div key={section.title} style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 500, color: '#3c4858', fontSize: 14, marginBottom: 10, padding: '6px 12px', background: '#f5f5f5', borderRadius: 4 }}>{section.title}</div>
          {section.items.map((question) => (
            <div key={question} style={{ padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
              <div style={{ fontSize: 12, color: '#555', marginBottom: 8 }}>{question}</div>
              <div style={{ display: 'flex', gap: 20 }}>
                {['yes', 'no'].map((val) => (
                  <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                    <input type="radio" checked={answers[question] === val} onChange={() => setAnswer(question, val)} /> {val.charAt(0).toUpperCase() + val.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
      <div className="section-header">Program Provider Review</div>
      {['The individual\'s health and safety CAN be ensured without an RN assessment.', 'The individual\'s health and safety CANNOT be ensured without an RN assessment.'].map((review, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
          <input type="radio" checked={selectedReview === i} onChange={() => setSelectedReview(i)} style={{ marginTop: 3 }} />
          <span style={{ fontSize: 13, color: '#555' }}>{review}</span>
        </div>
      ))}
      <div className="row" style={{ marginTop: 16 }}>
        <div className="col-4"><div className="form-group"><label className="form-label">Program Provider Signature *</label><input name="programProviderSignature" type="text" className="form-control" required /></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Date *</label><input name="programProviderDate" type="date" required style={{ width: '100%', padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #d2d2d2', fontSize: 14, outline: 'none' }} /></div></div>
      </div>
    </FormShell>
  )
}

// ── 5. Exclusion HH/CC ───────────────────────────────────────────────────────
export function ExclusionHhccForm() {
  const qc = useQueryClient()
  const mutation = useSubmitExclusionHhcc()
  const { user } = useAuthStore()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    const fd = new FormData(e.target)
    try {
      await mutation.mutateAsync(Object.fromEntries(fd.entries()))
      qc.invalidateQueries({ queryKey: ['exclusion-hhcc'] })
      setSuccess('Exclusion of HH/CC Provider form submitted successfully.')
      e.target.reset()
    } catch (err) { setError(err?.response?.data?.message || 'Submission failed') }
  }

  return (
    <FormShell title="Exclusion of HH/CC Provider from BON Definition" onSubmit={handleSubmit} saving={mutation.isPending} error={error} success={success}>
      <div className="row">
        <div className="col-4"><div className="form-group"><label className="form-label">Individual Name *</label><input name="individualName" type="text" className="form-control" required /></div></div>
        <div className="col-4"><div className="form-group"><label className="form-label">Name of HH/CC Provider *</label><input name="hhccProviderName" type="text" className="form-control" required /></div></div>
      </div>
      <div style={{ background: '#f9f9f9', borderRadius: 6, padding: '16px 20px', marginBottom: 16, fontSize: 13, color: '#555', lineHeight: 1.8 }}>
        <p style={{ fontWeight: 500, marginBottom: 8 }}>I assert that I have assessed and determined that all four of the following criteria have been met:</p>
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li>The HH/CC provider meets the definition of Client Responsible Adult (CRA).</li>
          <li>The individual and HH/CC maintain a stable and beneficial relationship.</li>
          <li>The HH/CC provider is willing and able to assume responsibility for the individual's health care.</li>
          <li>The HH/CC provider has adequate and appropriate supports available.</li>
        </ul>
      </div>
      <div className="row">
        <div className="col-4"><div className="form-group"><label className="form-label">Nurse Signature *</label><input name="nurseSignature" type="text" className="form-control" required /></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Date *</label><input name="date" type="date" required style={{ width: '100%', padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #d2d2d2', fontSize: 14, outline: 'none' }} /></div></div>
      </div>
    </FormShell>
  )
}

// ── 6. Comprehensive Nursing Assessment ──────────────────────────────────────
export function ComprehensiveNursingAssessmentForm() {
  const qc = useQueryClient()
  const mutation = useSubmitComprehensiveAssessment()
  const { user } = useAuthStore()
  const [healthCareTeam, setHealthCareTeam] = useState([{ practitioner: 'Primary Care', name: '', lastSeen: '', comment: '' }, { practitioner: 'Psychiatrist', name: '', lastSeen: '', comment: '' }, { practitioner: 'Neurologist', name: '', lastSeen: '', comment: '' }, { practitioner: 'Dentist', name: '', lastSeen: '', comment: '' }, { practitioner: 'Optometrist', name: '', lastSeen: '', comment: '' }])
  const [supports, setSupports] = useState([{ role: 'Client Responsible Adult (CRA)', name: '', phone: '' }, { role: 'Guardian', name: '', phone: '' }])
  const [healthHistory, setHealthHistory] = useState([{ category: 'Axis I', diagnosis: '' }, { category: 'Axis II', diagnosis: '' }, { category: 'Axis III', diagnosis: '' }, { category: 'Axis IV', diagnosis: '' }])
  const [medications, setMedications] = useState([{ medication: '', dose: '', freq: '', route: '', purpose: '', sideEffects: '' }])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const updateTeam = (i, field, val) => setHealthCareTeam((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r))
  const updateSupport = (i, field, val) => setSupports((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r))
  const updateHistory = (i, field, val) => setHealthHistory((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r))
  const updateMed = (i, field, val) => setMedications((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r))
  const addMed = () => setMedications((prev) => [...prev, { medication: '', dose: '', freq: '', route: '', purpose: '', sideEffects: '' }])
  const removeMed = (i) => setMedications((prev) => prev.filter((_, idx) => idx !== i))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    const fd = new FormData(e.target)
    try {
      await mutation.mutateAsync({
        individualName: fd.get('individualName'),
        dob: fd.get('dob'),
        assessmentDate: fd.get('assessmentDate'),
        healthCareTeam: JSON.stringify(healthCareTeam),
        supports: JSON.stringify(supports),
        healthHistory: JSON.stringify(healthHistory),
        currentMedications: JSON.stringify(medications),
        systemChecks: JSON.stringify([]),
        rnSignature: fd.get('rnSignature'),
        individualSignature: fd.get('individualSignature'),
        signatureDate: fd.get('signatureDate'),
      })
      qc.invalidateQueries({ queryKey: ['comprehensive-assessments'] })
      setSuccess('Comprehensive Nursing Assessment submitted successfully.')
      e.target.reset()
    } catch (err) { setError(err?.response?.data?.message || 'Submission failed') }
  }

  const inputStyle = { width: '100%', padding: '4px 6px', border: '1px solid #ddd', borderRadius: 3, fontSize: 12, outline: 'none' }

  return (
    <FormShell title="Comprehensive Nursing Assessment" onSubmit={handleSubmit} saving={mutation.isPending} error={error} success={success}>
      <div className="row">
        <div className="col-4"><div className="form-group"><label className="form-label">Individual Name *</label><input name="individualName" type="text" className="form-control" required /></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Date of Birth *</label><input name="dob" type="date" required style={{ width: '100%', padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #d2d2d2', fontSize: 14, outline: 'none' }} /></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Assessment Date *</label><input name="assessmentDate" type="date" required style={{ width: '100%', padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #d2d2d2', fontSize: 14, outline: 'none' }} /></div></div>
      </div>

      <div className="section-header">Health Care Team</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead><tr style={{ borderBottom: '1px solid #eee' }}>{['Practitioner', 'Name', 'Last Seen', 'Comment'].map((h) => <th key={h} style={{ padding: '6px 8px', textAlign: 'left', color: '#aaa' }}>{h}</th>)}</tr></thead>
          <tbody>
            {healthCareTeam.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f9f9f9' }}>
                <td style={{ padding: '4px 8px', color: '#555', fontWeight: 500 }}>{row.practitioner}</td>
                <td style={{ padding: '4px 8px' }}><input type="text" value={row.name} onChange={(e) => updateTeam(i, 'name', e.target.value)} style={inputStyle} /></td>
                <td style={{ padding: '4px 8px' }}><input type="date" value={row.lastSeen} onChange={(e) => updateTeam(i, 'lastSeen', e.target.value)} style={inputStyle} /></td>
                <td style={{ padding: '4px 8px' }}><input type="text" value={row.comment} onChange={(e) => updateTeam(i, 'comment', e.target.value)} style={inputStyle} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-header" style={{ marginTop: 20 }}>Supports</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead><tr style={{ borderBottom: '1px solid #eee' }}>{['Role', 'Name', 'Phone'].map((h) => <th key={h} style={{ padding: '6px 8px', textAlign: 'left', color: '#aaa' }}>{h}</th>)}</tr></thead>
          <tbody>
            {supports.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f9f9f9' }}>
                <td style={{ padding: '4px 8px', color: '#555', fontWeight: 500 }}>{row.role}</td>
                <td style={{ padding: '4px 8px' }}><input type="text" value={row.name} onChange={(e) => updateSupport(i, 'name', e.target.value)} style={inputStyle} /></td>
                <td style={{ padding: '4px 8px' }}><input type="text" value={row.phone} onChange={(e) => updateSupport(i, 'phone', e.target.value)} style={inputStyle} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-header" style={{ marginTop: 20 }}>Health History</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead><tr style={{ borderBottom: '1px solid #eee' }}>{['Category', 'Diagnosis / Notes'].map((h) => <th key={h} style={{ padding: '6px 8px', textAlign: 'left', color: '#aaa' }}>{h}</th>)}</tr></thead>
          <tbody>
            {healthHistory.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f9f9f9' }}>
                <td style={{ padding: '4px 8px', color: '#555', fontWeight: 500, width: 160 }}>{row.category}</td>
                <td style={{ padding: '4px 8px' }}><input type="text" value={row.diagnosis} onChange={(e) => updateHistory(i, 'diagnosis', e.target.value)} style={inputStyle} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-header" style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Current Medications
        <button type="button" className="btn btn-primary btn-sm btn-round" onClick={addMed}>+ Add Row</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead><tr style={{ borderBottom: '1px solid #eee' }}>{['Medication', 'Dose', 'Freq', 'Route', 'Purpose', 'Side Effects', ''].map((h) => <th key={h} style={{ padding: '6px 8px', textAlign: 'left', color: '#aaa' }}>{h}</th>)}</tr></thead>
          <tbody>
            {medications.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f9f9f9' }}>
                {['medication', 'dose', 'freq', 'route', 'purpose', 'sideEffects'].map((field) => (
                  <td key={field} style={{ padding: '4px 6px' }}><input type="text" value={row[field]} onChange={(e) => updateMed(i, field, e.target.value)} style={inputStyle} /></td>
                ))}
                <td style={{ padding: '4px 6px' }}>
                  {medications.length > 1 && <button type="button" className="btn-icon text-danger" onClick={() => removeMed(i)}><span className="material-icons" style={{ fontSize: 16 }}>close</span></button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-header" style={{ marginTop: 20 }}>Signatures</div>
      <div className="row">
        <div className="col-4"><div className="form-group"><label className="form-label">RN Signature *</label><input name="rnSignature" type="text" className="form-control" required /></div></div>
        <div className="col-4"><div className="form-group"><label className="form-label">Individual Signature</label><input name="individualSignature" type="text" className="form-control" /></div></div>
        <div className="col-3"><div className="form-group"><label className="form-label">Date *</label><input name="signatureDate" type="date" required style={{ width: '100%', padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #d2d2d2', fontSize: 14, outline: 'none' }} /></div></div>
      </div>
    </FormShell>
  )
}