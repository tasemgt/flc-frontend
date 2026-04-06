import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import FormWrapper from '../../../components/shared/FormWrapper'
import { useSubmitForm } from '../../../api/consumerForms.api'

export default function DentalForm() {
  const qc = useQueryClient()
  const mutation = useSubmitForm('dental')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e, consumer) => {
    setError(''); setSuccess('')
    const fd = new FormData(e.target)
    const payload = Object.fromEntries(fd.entries())
    try {
      await mutation.mutateAsync(payload)
      qc.invalidateQueries({ queryKey: ['consumer-forms'] })
      setSuccess('Dental Examination Form submitted successfully.')
      e.target.reset()
    } catch (err) {
      setError(err?.response?.data?.message || 'Submission failed')
    }
  }

  return (
    <FormWrapper
      title="Dental Examination Form"
      formType="dental"
      onSubmit={handleSubmit}
      isSubmitting={mutation.isPending}
      error={error}
      success={success}
    >
      <div className="section-header" style={{ marginTop: 24 }}>Examination Details</div>
      <div className="row">
        <div className="col-4">
          <div className="form-group">
            <label className="form-label">Examiner Name *</label>
            <input name="examinerName" type="text" className="form-control" required />
          </div>
        </div>
      </div>
      <div className="form-group" style={{ marginTop: 8 }}>
        <label className="form-label">Diagnosis and Treatment Notes</label>
        <textarea name="diagnosis" className="form-control-box" rows={4} style={{ resize: 'vertical' }} />
      </div>
      <div className="form-group" style={{ marginTop: 16 }}>
        <label className="form-label">Medication(s) Prescribed / Recommendations</label>
        <textarea name="prescription" className="form-control-box" rows={4} style={{ resize: 'vertical' }} />
      </div>
    </FormWrapper>
  )
}