import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'
import FormWrapper from '../../../components/shared/FormWrapper'
import { useSubmitForm, useFormMeta } from '../../../api/consumerForms.api'
import { Spinner } from '../../../components/shared'

const RESPONSE_OPTIONS = ['Physical assistance', 'Verbal prompting', 'Independently']

export default function HotWaterFireEvacForm() {
  const location = useLocation()
  const isHotWater = location.pathname.includes('hot-water')
  const formType = isHotWater ? 'hot-water' : 'fire-evac'
  const title = isHotWater ? 'Hot Water Assessment' : 'Fire Evacuation Assessment'

  const qc = useQueryClient()
  const mutation = useSubmitForm(formType)
  const { data: metaData, isLoading: metaLoading } = useFormMeta()
  const [responses, setResponses] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const questions = isHotWater
    ? (metaData?.data?.hotWaterQuestions || [])
    : (metaData?.data?.fireEvacQuestions || [])

  const handleSubmit = async (e, consumer) => {
    setError(''); setSuccess('')
    const fd = new FormData(e.target)
    const payload = Object.fromEntries(fd.entries())
    payload.responses = JSON.stringify(
      questions.map((q, i) => ({ question: q, answer: responses[i] || RESPONSE_OPTIONS[0] }))
    )
    try {
      await mutation.mutateAsync(payload)
      qc.invalidateQueries({ queryKey: ['consumer-forms'] })
      setSuccess(`${title} submitted successfully.`)
      setResponses({})
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
        <div className="col-6">
          <div className="form-group">
            <label className="form-label">Address *</label>
            <input name="address" type="text" className="form-control" required />
          </div>
        </div>
        <div className="col-3">
          <div className="form-group">
            <label className="form-label">Residential Type *</label>
            <input name="residentialType" type="text" className="form-control" required />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-4">
          <div className="form-group">
            <label className="form-label">Strengths</label>
            <input name="strengths" type="text" className="form-control" />
          </div>
        </div>
        <div className="col-4">
          <div className="form-group">
            <label className="form-label">Needs</label>
            <input name="needs" type="text" className="form-control" />
          </div>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Recommendations</label>
        <textarea name="recommendations" className="form-control-box" rows={3} style={{ resize: 'vertical' }} />
      </div>

      <div className="section-header" style={{ marginTop: 24 }}>Select the appropriate response</div>
      {metaLoading ? <Spinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {questions.map((question, i) => (
            <div key={i} style={{ background: '#f9f9f9', borderRadius: 6, padding: '12px 14px' }}>
              <div style={{ fontSize: 13, color: '#555', marginBottom: 10 }}>{i + 1}. {question}</div>
              <select
                value={responses[i] || RESPONSE_OPTIONS[0]}
                onChange={(e) => setResponses((prev) => ({ ...prev, [i]: e.target.value }))}
                className="form-control-box"
                style={{ fontSize: 12, padding: '6px 8px' }}
              >
                {RESPONSE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </FormWrapper>
  )
}