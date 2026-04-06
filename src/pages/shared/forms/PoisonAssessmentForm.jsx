import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import FormWrapper from '../../../components/shared/FormWrapper'
import { useSubmitForm, useFormMeta } from '../../../api/consumerForms.api'
import { Spinner } from '../../../components/shared'

export default function PoisonAssessmentForm() {
  const qc = useQueryClient()
  const mutation = useSubmitForm('poison')
  const { data: metaData, isLoading: metaLoading } = useFormMeta()
  const [answers, setAnswers] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const questions = metaData?.data?.poisonQuestions || []

  const handleSubmit = async (e, consumer) => {
    setError(''); setSuccess('')
    const fd = new FormData(e.target)
    const payload = Object.fromEntries(fd.entries())
    payload.responses = JSON.stringify(
      questions.map((q, i) => ({ question: q, answer: answers[i] || 'yes' }))
    )
    try {
      await mutation.mutateAsync(payload)
      qc.invalidateQueries({ queryKey: ['consumer-forms'] })
      setSuccess('Toxic Poison Assessment submitted successfully.')
      setAnswers({})
      e.target.reset()
    } catch (err) {
      setError(err?.response?.data?.message || 'Submission failed')
    }
  }

  return (
    <FormWrapper
      title="Toxic Poison Assessment"
      formType="poison"
      onSubmit={handleSubmit}
      isSubmitting={mutation.isPending}
      error={error}
      success={success}
    >
      <div className="row" style={{ marginTop: 16 }}>
        <div className="col-6">
          <div className="form-group">
            <label className="form-label">Address *</label>
            <input name="address" type="text" className="form-control" required />
          </div>
        </div>
      </div>

      <div className="section-header" style={{ marginTop: 24 }}>Select the appropriate response</div>
      {metaLoading ? <Spinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {questions.map((question, i) => (
            <div key={i} style={{ background: '#f9f9f9', borderRadius: 6, padding: '12px 14px' }}>
              <div style={{ fontSize: 13, color: '#555', marginBottom: 10 }}>{question}</div>
              <div style={{ display: 'flex', gap: 16 }}>
                {['yes', 'no'].map((val) => (
                  <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                    <input
                      type="radio"
                      name={`poison-${i}`}
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
    </FormWrapper>
  )
}