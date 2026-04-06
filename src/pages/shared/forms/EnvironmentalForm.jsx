import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import FormWrapper from '../../../components/shared/FormWrapper'
import { useSubmitForm, useFormMeta } from '../../../api/consumerForms.api'
import { Spinner } from '../../../components/shared'

export default function EnvironmentalForm() {
  const qc = useQueryClient()
  const mutation = useSubmitForm('environmental')
  const { data: metaData, isLoading: metaLoading } = useFormMeta()
  const [answers, setAnswers] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const sections = metaData?.data?.environmentalChecklist || []

  const setAnswer = (sectionIdx, questionIdx, value) => {
    setAnswers((prev) => ({ ...prev, [`${sectionIdx}-${questionIdx}`]: value }))
  }

  const handleSubmit = async (e, consumer) => {
    setError(''); setSuccess('')
    const fd = new FormData(e.target)
    const payload = Object.fromEntries(fd.entries())

    // Build checklist from section/question structure
    const checklist = []
    sections.forEach((section, si) => {
      section.questions.forEach((question, qi) => {
        checklist.push({
          sectionTitle: section.title,
          question,
          answer: answers[`${si}-${qi}`] || 'yes',
        })
      })
    })
    payload.checklist = JSON.stringify(checklist)

    try {
      await mutation.mutateAsync(payload)
      qc.invalidateQueries({ queryKey: ['consumer-forms'] })
      setSuccess('Environmental Safety Checklist submitted successfully.')
      setAnswers({})
      e.target.reset()
    } catch (err) {
      setError(err?.response?.data?.message || 'Submission failed')
    }
  }

  return (
    <FormWrapper
      title="Environmental Safety Checklist"
      formType="environmental"
      onSubmit={handleSubmit}
      isSubmitting={mutation.isPending}
      error={error}
      success={success}
    >
      <div className="row" style={{ marginTop: 16 }}>
        <div className="col-4">
          <div className="form-group">
            <label className="form-label">Site Inspector Name *</label>
            <input name="inspectorName" type="text" className="form-control" required />
          </div>
        </div>
        <div className="col-4">
          <div className="form-group">
            <label className="form-label">Site Inspected *</label>
            <input name="siteInspected" type="text" className="form-control" required />
          </div>
        </div>
        <div className="col-4">
          <div className="form-group">
            <label className="form-label">Title of Inspection *</label>
            <input name="titleOfInspection" type="text" className="form-control" required />
          </div>
        </div>
      </div>

      <div className="section-header" style={{ marginTop: 24, textAlign: 'center' }}>Detailed Areas Inspected</div>

      {metaLoading ? <Spinner /> : sections.map((section, si) => (
        <div key={si} style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 500, color: '#3c4858', fontSize: 15, marginBottom: 12, paddingBottom: 6, borderBottom: '2px solid #eee' }}>
            {section.title}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {section.questions.map((question, qi) => (
              <div key={qi} style={{ background: '#f9f9f9', borderRadius: 6, padding: '12px 14px' }}>
                <div style={{ fontSize: 13, color: '#555', marginBottom: 10 }}>{question}</div>
                <div style={{ display: 'flex', gap: 16 }}>
                  {['yes', 'no'].map((val) => (
                    <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                      <input
                        type="radio"
                        name={`check-${si}-${qi}`}
                        value={val}
                        checked={(answers[`${si}-${qi}`] || 'yes') === val}
                        onChange={() => setAnswer(si, qi, val)}
                      />
                      {val.charAt(0).toUpperCase() + val.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </FormWrapper>
  )
}