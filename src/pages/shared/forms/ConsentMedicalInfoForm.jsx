import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import FormWrapper from '../../../components/shared/FormWrapper'
import { useSubmitForm } from '../../../api/consumerForms.api'

export default function ConsentMedicalInfoForm() {
  const qc = useQueryClient()
  const mutation = useSubmitForm('consent-medical')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e, consumer) => {
    setError(''); setSuccess('')
    const fd = new FormData(e.target)
    const payload = Object.fromEntries(fd.entries())
    try {
      await mutation.mutateAsync(payload)
      qc.invalidateQueries({ queryKey: ['consumer-forms'] })
      setSuccess('Consent for Release of Medical Information submitted successfully.')
      e.target.reset()
    } catch (err) {
      setError(err?.response?.data?.message || 'Submission failed')
    }
  }

  return (
    <FormWrapper
      title="Consent for Release of Medical Information"
      formType="consent-medical"
      onSubmit={handleSubmit}
      isSubmitting={mutation.isPending}
      error={error}
      success={success}
    >
      <div className="row" style={{ marginTop: 16 }}>
        <div className="col-3">
          <div className="form-group">
            <label className="form-label">Date of Birth *</label>
            <input name="dob" type="date" required style={{ width: '100%', padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #d2d2d2', fontSize: 14, outline: 'none' }} />
          </div>
        </div>
        <div className="col-3">
          <div className="form-group">
            <label className="form-label">Social Security Number *</label>
            <input name="ssn" type="text" className="form-control" required />
          </div>
        </div>
        <div className="col-4">
          <div className="form-group">
            <label className="form-label">Authorized Party *</label>
            <input name="authorizedParty" type="text" className="form-control" required />
          </div>
        </div>
      </div>

      <div className="row" style={{ marginTop: 8 }}>
        <div className="col-6">
          <div className="form-group">
            <label className="form-label">Medical information is required for the following purpose(s) *</label>
            <textarea name="purpose" className="form-control-box" rows={5} style={{ resize: 'vertical' }} required />
          </div>
        </div>
        <div className="col-6">
          <div className="form-group">
            <label className="form-label">Limited to *</label>
            <textarea name="limited" className="form-control-box" rows={5} style={{ resize: 'vertical' }} required />
          </div>
        </div>
      </div>
    </FormWrapper>
  )
}