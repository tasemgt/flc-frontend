import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import FormWrapper from '../../../components/shared/FormWrapper'
import { useSubmitForm, useFormMeta } from '../../../api/consumerForms.api'
import { Spinner } from '../../../components/shared'

export default function LegalAssessmentForm() {
  const qc = useQueryClient()
  const mutation = useSubmitForm('legal')
  const { data: metaData, isLoading: metaLoading } = useFormMeta()
  const [answers, setAnswers] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const questions = metaData?.data?.legalQuestions || []

  const handleSubmit = async (e, consumer) => {
    setError(''); setSuccess('')
    const fd = new FormData(e.target)
    const payload = Object.fromEntries(fd.entries())
    payload.responses = JSON.stringify(
      questions.map((q, i) => ({
        question: q.question,
        subQuestion: q.subQuestion,
        answer: answers[i] || 'yes',
      }))
    )
    try {
      await mutation.mutateAsync(payload)
      qc.invalidateQueries({ queryKey: ['consumer-forms'] })
      setSuccess('Legal Assessment Form submitted successfully.')
      setAnswers({})
      e.target.reset()
    } catch (err) {
      setError(err?.response?.data?.message || 'Submission failed')
    }
  }

  return (
    <FormWrapper
      title="Annual Assessment of Legal Status"
      formType="legal"
      onSubmit={handleSubmit}
      isSubmitting={mutation.isPending}
      error={error}
      success={success}
    >
      <div className="section-header" style={{ marginTop: 24 }}>Assessment Details</div>
      <div className="row">
        <div className="col-3">
          <div className="form-group">
            <label className="form-label">Date of Birth *</label>
            <input name="dob" type="date" required style={{ width: '100%', padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #d2d2d2', fontSize: 14, outline: 'none' }} />
          </div>
        </div>
        <div className="col-3">
          <div className="form-group">
            <label className="form-label">Evaluator *</label>
            <input name="evaluator" type="text" className="form-control" required />
          </div>
        </div>
        <div className="col-3">
          <div className="form-group">
            <label className="form-label">Minor / Adult *</label>
            <select name="minorOrAdult" className="form-control-box" required>
              <option value="Minor">Minor</option>
              <option value="Adult">Adult</option>
            </select>
          </div>
        </div>
        <div className="col-3">
          <div className="form-group">
            <label className="form-label">Current Status *</label>
            <select name="currentStatus" className="form-control-box" required>
              <option value="Minor">Minor</option>
              <option value="Minor in conservatorship">Minor in conservatorship</option>
              <option value="Adult with a guardian">Adult with a guardian</option>
              <option value="Adult without a guardian">Adult without a guardian</option>
            </select>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-4">
          <div className="form-group">
            <label className="form-label">Recommendation *</label>
            <select name="recommendation" className="form-control-box" required>
              <option value="Guardian not indicated">Guardian not indicated</option>
              <option value="Guardian indicated">Guardian indicated</option>
              <option value="Guardianship not applicable">Guardianship not applicable</option>
            </select>
          </div>
        </div>
        <div className="col-4">
          <div className="form-group">
            <label className="form-label">Type of Guardianship Recommended *</label>
            <select name="guardianshipType" className="form-control-box" required>
              <option value="Person">Person</option>
              <option value="Estate">Estate</option>
              <option value="Not Applicable">Not Applicable</option>
              <option value="Person and Estate">Person and Estate</option>
            </select>
          </div>
        </div>
      </div>

      <div className="section-header" style={{ marginTop: 24 }}>Select the appropriate response</div>
      {metaLoading ? <Spinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {questions.map((q, i) => (
            <div key={i} style={{ background: '#f9f9f9', borderRadius: 6, padding: '12px 14px' }}>
              <div style={{ fontSize: 12, color: '#aaa', marginBottom: 4 }}>{q.question}</div>
              {q.subQuestion && (
                <div style={{ fontSize: 13, fontWeight: 500, color: '#3c4858', marginBottom: 8 }}>{q.subQuestion}</div>
              )}
              <div style={{ display: 'flex', gap: 16 }}>
                {['yes', 'no'].map((val) => (
                  <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                    <input
                      type="radio"
                      name={`legal-${i}`}
                      value={val}
                      checked={(answers[i] || 'yes') === val}
                      onChange={() => setAnswers((prev) => ({ ...prev, [i]: val }))}
                    />
                    {val.charAt(0).toUpperCase() + val.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="form-group" style={{ marginTop: 24 }}>
        <label className="form-label">Action to be Taken *</label>
        <textarea name="actionToBeTaken" className="form-control-box" rows={4} style={{ resize: 'vertical' }} required />
      </div>
    </FormWrapper>
  )
}