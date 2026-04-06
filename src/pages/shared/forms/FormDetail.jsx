import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from '../../../api/consumerForms.api'
import { Spinner, Alert } from '../../../components/shared'
import useAuthStore from '../../../store/authStore'
import { formatDate, formatDateTime } from '../../../utils/dateFormat'

function Field({ label, value }) {
  if (!value && value !== 0) return null
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: '#3c4858' }}>{value}</div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        fontSize: 13, fontWeight: 500, color: '#222f3e',
        textTransform: 'uppercase', letterSpacing: '.5px',
        marginBottom: 12, paddingBottom: 6,
        borderBottom: '2px solid #eee',
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function YesNoGrid({ items }) {
  if (!items?.length) return <p style={{ color: '#aaa', fontSize: 13 }}>No responses recorded.</p>
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
      {items.map((item, i) => (
        <div key={i} style={{ background: '#f9f9f9', borderRadius: 6, padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span
            className="material-icons"
            style={{ fontSize: 18, flexShrink: 0, marginTop: 1, color: item.answer === 'yes' ? '#43a047' : '#e53935' }}
          >
            {item.answer === 'yes' ? 'check_circle' : 'cancel'}
          </span>
          <div>
            {item.subQuestion && (
              <div style={{ fontSize: 11, color: '#aaa', marginBottom: 2 }}>{item.question}</div>
            )}
            <div style={{ fontSize: 13, color: '#555' }}>{item.subQuestion || item.question}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ResponseGrid({ items, optionType = 'select' }) {
  if (!items?.length) return null
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
      {items.map((item, i) => (
        <div key={i} style={{ background: '#f9f9f9', borderRadius: 6, padding: '10px 14px' }}>
          <div style={{ fontSize: 12, color: '#777', marginBottom: 4 }}>{i + 1}. {item.question}</div>
          <span className={`badge ${item.answer === 'yes' || item.answer === 'Independently' ? 'badge-success' : item.answer === 'no' ? 'badge-danger' : 'badge-info'}`}>
            {item.answer || '—'}
          </span>
        </div>
      ))}
    </div>
  )
}

function ChecklistView({ checklist }) {
  if (!checklist?.length) return null
  // Group by sectionTitle
  const grouped = checklist.reduce((acc, item) => {
    const key = item.sectionTitle || 'General'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  return (
    <div>
      {Object.entries(grouped).map(([section, items]) => (
        <div key={section} style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 500, color: '#3c4858', fontSize: 14, marginBottom: 8, padding: '6px 12px', background: '#f5f5f5', borderRadius: 4 }}>
            {section}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 }}>
            {items.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', background: '#f9f9f9', borderRadius: 4 }}>
                <span className="material-icons" style={{ fontSize: 16, color: item.answer === 'yes' ? '#43a047' : '#e53935', flexShrink: 0, marginTop: 1 }}>
                  {item.answer === 'yes' ? 'check_circle' : 'cancel'}
                </span>
                <span style={{ fontSize: 12, color: '#555' }}>{item.question}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function DeliveryLogView({ sections, comment }) {
  if (!sections?.length) return null
  return (
    <div>
      {sections.map((section, si) => (
        <div key={si} style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 500, color: '#3c4858', fontSize: 14, marginBottom: 8, padding: '6px 12px', background: '#f5f5f5', borderRadius: 4 }}>
            {section.sectionTitle}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <th style={{ padding: '6px 10px', textAlign: 'left', color: '#aaa', fontWeight: 500, width: 180 }}>Activity</th>
                  {['Morning In', 'Morning Out', 'Afternoon In', 'Afternoon Out', 'Evening In', 'Evening Out'].map((h) => (
                    <th key={h} style={{ padding: '6px 8px', textAlign: 'center', color: '#aaa', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.activities?.map((act, ai) => {
                  const hasAnyTime = act.morningIn || act.morningOut || act.afternoonIn || act.afternoonOut || act.eveningIn || act.eveningOut
                  if (!hasAnyTime) return null
                  return (
                    <tr key={ai} style={{ borderBottom: '1px solid #f9f9f9' }}>
                      <td style={{ padding: '8px 10px', color: '#555' }}>{act.activityName}</td>
                      {[act.morningIn, act.morningOut, act.afternoonIn, act.afternoonOut, act.eveningIn, act.eveningOut].map((t, ti) => (
                        <td key={ti} style={{ padding: '8px', textAlign: 'center', color: t ? '#3c4858' : '#ddd' }}>
                          {t || '—'}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      {comment?.commentText && (
        <div style={{ background: '#f9f9f9', borderRadius: 6, padding: '12px 16px', marginTop: 8 }}>
          <div style={{ fontSize: 11, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Comment</div>
          {comment.staffInitials && <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>Initials: {comment.staffInitials}</div>}
          <div style={{ fontSize: 14, color: '#555' }}>{comment.commentText}</div>
        </div>
      )}
    </div>
  )
}

const DELIVERY_LOG_TYPES = ['RespiteServiceForm', 'RssSlServiceForm', 'SupportedHomeLivingForm', 'SupportedEmploymentForm', 'DayHabilitationForm']
const YES_NO_TYPES = ['PoisonAssessmentForm', 'LegalAssessmentForm']
const RESPONSE_TYPES = ['HotWaterForm', 'FireEvacForm']

function FormBody({ form }) {
  const type = form.recordType

  // ── Dental ──────────────────────────────────────────────────────────────────
  if (type === 'DentalForm') return (
    <div>
      <Section title="Examination Details">
        <div className="row">
          <div className="col-4"><Field label="Examiner Name" value={form.examinerName} /></div>
        </div>
      </Section>
      {form.diagnosis && (
        <Section title="Diagnosis and Treatment">
          <p style={{ fontSize: 14, color: '#555', whiteSpace: 'pre-wrap' }}>{form.diagnosis}</p>
        </Section>
      )}
      {form.prescription && (
        <Section title="Medication(s) Prescribed / Recommendations">
          <p style={{ fontSize: 14, color: '#555', whiteSpace: 'pre-wrap' }}>{form.prescription}</p>
        </Section>
      )}
    </div>
  )

  // ── Environmental Checklist ───────────────────────────────────────────────
  if (type === 'EnvironmentalChecklistForm') return (
    <div>
      <Section title="Inspection Details">
        <div className="row">
          <div className="col-4"><Field label="Inspector Name" value={form.inspectorName} /></div>
          <div className="col-4"><Field label="Site Inspected" value={form.siteInspected} /></div>
          <div className="col-4"><Field label="Title of Inspection" value={form.titleOfInspection} /></div>
        </div>
      </Section>
      <Section title="Checklist Results">
        <ChecklistView checklist={form.checklist} />
      </Section>
    </div>
  )

  // ── Hot Water / Fire Evac ────────────────────────────────────────────────
  if (type === 'HotWaterForm' || type === 'FireEvacForm') return (
    <div>
      <Section title="Details">
        <div className="row">
          <div className="col-6"><Field label="Address" value={form.address} /></div>
          <div className="col-3"><Field label="Residential Type" value={form.residentialType} /></div>
        </div>
        <div className="row">
          <div className="col-4"><Field label="Strengths" value={form.strengths} /></div>
          <div className="col-4"><Field label="Needs" value={form.needs} /></div>
        </div>
        {form.recommendations && <Field label="Recommendations" value={form.recommendations} />}
      </Section>
      <Section title="Responses">
        <ResponseGrid items={form.responses} />
      </Section>
    </div>
  )

  // ── Fire Emergency Drill ─────────────────────────────────────────────────
  if (type === 'FireEmergencyForm') return (
    <div>
      <Section title="Drill Details">
        <div className="row">
          <div className="col-3"><Field label="Drill Official" value={form.drillOfficial} /></div>
          <div className="col-3"><Field label="Persons Evacuated" value={form.personsEvacuated} /></div>
          <div className="col-3"><Field label="Fire Location" value={form.fireLocation} /></div>
          <div className="col-3"><Field label="Residential Type" value={form.residentialType} /></div>
          <div className="col-6"><Field label="Address" value={form.address} /></div>
          <div className="col-3"><Field label="Begin Time" value={form.beginTime} /></div>
          <div className="col-3"><Field label="End Time" value={form.endTime} /></div>
        </div>
        {form.followUpAction && <Field label="Follow Up Action" value={form.followUpAction} />}
      </Section>
    </div>
  )

  // ── Poison Assessment ────────────────────────────────────────────────────
  if (type === 'PoisonAssessmentForm') return (
    <div>
      <Section title="Details">
        <Field label="Address" value={form.address} />
      </Section>
      <Section title="Responses">
        <YesNoGrid items={form.responses} />
      </Section>
    </div>
  )

  // ── Legal Assessment ─────────────────────────────────────────────────────
  if (type === 'LegalAssessmentForm') return (
    <div>
      <Section title="Assessment Details">
        <div className="row">
          <div className="col-3"><Field label="Date of Birth" value={form.dob ? formatDate(form.dob) : null} /></div>
          <div className="col-3"><Field label="Evaluator" value={form.evaluator} /></div>
          <div className="col-3"><Field label="Minor / Adult" value={form.minorOrAdult} /></div>
          <div className="col-3"><Field label="Current Status" value={form.currentStatus} /></div>
          <div className="col-4"><Field label="Recommendation" value={form.recommendation} /></div>
          <div className="col-4"><Field label="Guardianship Type" value={form.guardianshipType} /></div>
        </div>
      </Section>
      <Section title="Responses">
        <YesNoGrid items={form.responses} />
      </Section>
      {form.actionToBeTaken && (
        <Section title="Action to be Taken">
          <p style={{ fontSize: 14, color: '#555', whiteSpace: 'pre-wrap' }}>{form.actionToBeTaken}</p>
        </Section>
      )}
    </div>
  )

  // ── Delivery Logs ────────────────────────────────────────────────────────
  if (DELIVERY_LOG_TYPES.includes(type)) return (
    <div>
      <Section title="Service Details">
        <Field label="Place of Service" value={form.placeOfService} />
      </Section>
      <Section title="Activity Log">
        <DeliveryLogView sections={form.sections} comment={form.comment} />
      </Section>
    </div>
  )

  // ── PRN Medication ───────────────────────────────────────────────────────
  if (type === 'PrnMedicationForm') return (
    <div>
      <Section title="Patient Details">
        <div className="row">
          <div className="col-3"><Field label="Date of Birth" value={form.dob ? formatDate(form.dob) : null} /></div>
          <div className="col-4"><Field label="Allergies" value={form.allergies} /></div>
          <div className="col-4"><Field label="Physician Name" value={form.physicianName} /></div>
        </div>
      </Section>
      {form.additionalPrnMeds && (
        <Section title="Additional PRN Medications / Notes">
          <p style={{ fontSize: 14, color: '#555', whiteSpace: 'pre-wrap' }}>{form.additionalPrnMeds}</p>
        </Section>
      )}
    </div>
  )

  // ── Consent for Medical Info ─────────────────────────────────────────────
  if (type === 'ConsentMedicalInfoForm') return (
    <div>
      <Section title="Details">
        <div className="row">
          <div className="col-3"><Field label="Date of Birth" value={form.dob ? formatDate(form.dob) : null} /></div>
          <div className="col-3"><Field label="SSN" value={form.ssn ? `***-**-${String(form.ssn).slice(-4)}` : null} /></div>
          <div className="col-4"><Field label="Authorized Party" value={form.authorizedParty} /></div>
        </div>
      </Section>
      <Section title="Purpose">
        <p style={{ fontSize: 14, color: '#555', whiteSpace: 'pre-wrap' }}>{form.purpose}</p>
      </Section>
      <Section title="Limited To">
        <p style={{ fontSize: 14, color: '#555', whiteSpace: 'pre-wrap' }}>{form.limited}</p>
      </Section>
    </div>
  )

  // ── Fallback ─────────────────────────────────────────────────────────────
  return (
    <div style={{ color: '#aaa', fontSize: 14 }}>
      No detailed view available for form type: {type}
    </div>
  )
}

export default function FormDetail() {
  const { formId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data, isLoading, error } = useForm(formId)
  const form = data?.data

  const basePath = user?.role === 'director' ? '/director' : '/staff'

  if (isLoading) return <Spinner />
  if (error || !form) return <Alert type="error" message="Form not found." />

  const consumerId = form.consumer?._id || form.consumer
  const consumerName = form.consumer?.firstName
    ? `${form.consumer.firstName} ${form.consumer.lastName}`
    : null

  return (
    <div>
      <div className="card">
        <div
          className="card-header-primary"
          style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}
        >
          <div>
            <h4 className="card-title-white">{form.formName}</h4>
            <p className="card-subtitle-white">
              {consumerName && `${consumerName} · `}LC: {form.lcNumber}
            </p>
          </div>
          <button
            className="btn btn-light btn-sm btn-round"
            onClick={() => consumerId
              ? navigate(`${basePath}/consumers/${consumerId}`)
              : navigate(-1)
            }
          >
            ← Back
          </button>
        </div>

        <div className="card-body">
          {/* Header meta */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
            <span className="badge badge-info">{form.recordType}</span>
            <span style={{ fontSize: 13, color: '#555' }}>
              <span className="material-icons" style={{ fontSize: 15, verticalAlign: 'middle', marginRight: 4, color: '#aaa' }}>event</span>
              Appointment: {form.dateOfAppointment ? formatDateTime(form.dateOfAppointment) : '—'}
            </span>
            <span style={{ fontSize: 13, color: '#555' }}>
              <span className="material-icons" style={{ fontSize: 15, verticalAlign: 'middle', marginRight: 4, color: '#aaa' }}>person</span>
              Signatory: {form.signatoryName}
            </span>
            {form.staff && (
              <span style={{ fontSize: 13, color: '#555' }}>
                <span className="material-icons" style={{ fontSize: 15, verticalAlign: 'middle', marginRight: 4, color: '#aaa' }}>badge</span>
                Filed by: {form.staff.firstName} {form.staff.lastName} ({form.staff.role})
              </span>
            )}
            <span style={{ fontSize: 12, color: '#aaa' }}>
              Submitted: {form.createdAt ? formatDateTime(form.createdAt) : '—'}
            </span>
          </div>

          {/* Form-specific body */}
          <FormBody form={form} />
        </div>
      </div>
    </div>
  )
}