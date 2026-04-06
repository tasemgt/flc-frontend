import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import FormWrapper from './FormWrapper'
import { useSubmitForm } from '../../api/consumerForms.api'

function TimeInput({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <span style={{ fontSize: 10, color: '#aaa', whiteSpace: 'nowrap' }}>{label}</span>
      <input
        type="time"
        value={value || ''}
        onChange={onChange}
        style={{ width: 80, padding: '3px 4px', fontSize: 11, border: '1px solid #ddd', borderRadius: 3, outline: 'none', textAlign: 'center' }}
      />
    </div>
  )
}

export default function DeliveryLogForm({ title, formType, activitySections }) {
  const qc = useQueryClient()
  const mutation = useSubmitForm(formType)
  const [times, setTimes] = useState({})
  const [comment, setComment] = useState({ staffInitials: '', commentText: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const setTime = (sectionTitle, item, period, inOut, value) => {
    const key = `${sectionTitle}__${item}`
    setTimes((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [`${period}${inOut}`]: value,
      },
    }))
  }

  const handleSubmit = async (e, consumer) => {
    setError(''); setSuccess('')
    const fd = new FormData(e.target)
    const payload = Object.fromEntries(fd.entries())
    payload.times = JSON.stringify(times)
    payload.comment = JSON.stringify({
      ...comment,
      commentDate: new Date().toISOString(),
    })
    try {
      await mutation.mutateAsync(payload)
      qc.invalidateQueries({ queryKey: ['consumer-forms'] })
      setSuccess(`${title} submitted successfully.`)
      setTimes({})
      setComment({ staffInitials: '', commentText: '' })
      e.target.reset()
    } catch (err) {
      setError(err?.response?.data?.message || 'Submission failed')
    }
  }

  return (
    <FormWrapper
      title={title}
      formType={formType}
      onSubmit={handleSubmit}
      isSubmitting={mutation.isPending}
      error={error}
      success={success}
    >
      <div className="row" style={{ marginTop: 16 }}>
        <div className="col-4">
          <div className="form-group">
            <label className="form-label">Place of Service *</label>
            <input name="placeOfService" type="text" className="form-control" required />
          </div>
        </div>
      </div>

      <div className="section-header" style={{ marginTop: 24, textAlign: 'center' }}>
        Check all areas in which you provided assistance
      </div>

      {activitySections.map((section) => (
        <div key={section.title} style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 500, color: '#3c4858', fontSize: 14, marginBottom: 10, padding: '6px 12px', background: '#f5f5f5', borderRadius: 4 }}>
            {section.title}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <th style={{ padding: '6px 12px', textAlign: 'left', color: '#aaa', fontSize: 11, fontWeight: 500, width: 180 }}>Activity</th>
                  {['Morning', 'Afternoon', 'Evening'].map((period) => (
                    <th key={period} colSpan={2} style={{ padding: '6px 12px', textAlign: 'center', color: '#aaa', fontSize: 11, fontWeight: 500 }}>
                      {period}
                    </th>
                  ))}
                </tr>
                <tr style={{ borderBottom: '2px solid #eee' }}>
                  <th />
                  {['Morning', 'Afternoon', 'Evening'].map((period) => (
                    <>
                      <th key={`${period}-in`} style={{ padding: '4px 8px', textAlign: 'center', color: '#ccc', fontSize: 10 }}>In</th>
                      <th key={`${period}-out`} style={{ padding: '4px 8px', textAlign: 'center', color: '#ccc', fontSize: 10 }}>Out</th>
                    </>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.items.map((item) => {
                  const key = `${section.title}__${item}`
                  const t = times[key] || {}
                  return (
                    <tr key={item} style={{ borderBottom: '1px solid #f9f9f9' }}>
                      <td style={{ padding: '8px 12px', color: '#555', fontSize: 13 }}>{item}</td>
                      {['morning', 'afternoon', 'evening'].map((period) => (
                        <>
                          <td key={`${period}-in`} style={{ padding: '4px 6px', textAlign: 'center' }}>
                            <TimeInput
                              label=""
                              value={t[`${period}In`]}
                              onChange={(e) => setTime(section.title, item, period, 'In', e.target.value)}
                            />
                          </td>
                          <td key={`${period}-out`} style={{ padding: '4px 6px', textAlign: 'center' }}>
                            <TimeInput
                              label=""
                              value={t[`${period}Out`]}
                              onChange={(e) => setTime(section.title, item, period, 'Out', e.target.value)}
                            />
                          </td>
                        </>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Comment section */}
      <div className="section-header" style={{ marginTop: 24 }}>Comment</div>
      <div className="row">
        <div className="col-3">
          <div className="form-group">
            <label className="form-label">Staff Initials</label>
            <input
              type="text"
              className="form-control"
              value={comment.staffInitials}
              onChange={(e) => setComment((prev) => ({ ...prev, staffInitials: e.target.value }))}
            />
          </div>
        </div>
        <div className="col-9">
          <div className="form-group">
            <label className="form-label">Comment</label>
            <textarea
              className="form-control-box"
              rows={3}
              style={{ resize: 'vertical' }}
              value={comment.commentText}
              onChange={(e) => setComment((prev) => ({ ...prev, commentText: e.target.value }))}
            />
          </div>
        </div>
      </div>
    </FormWrapper>
  )
}