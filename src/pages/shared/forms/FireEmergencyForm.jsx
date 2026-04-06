import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import FormWrapper from '../../../components/shared/FormWrapper'
import { useSubmitForm } from '../../../api/consumerForms.api'

export default function FireEmergencyForm() {
  const qc = useQueryClient()
  const mutation = useSubmitForm('fire-emergency')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e, consumer) => {
    setError(''); setSuccess('')
    const fd = new FormData(e.target)
    const payload = Object.fromEntries(fd.entries())
    try {
      await mutation.mutateAsync(payload)
      qc.invalidateQueries({ queryKey: ['consumer-forms'] })
      setSuccess('Fire / Emergency Drill form submitted successfully.')
      e.target.reset()
    } catch (err) {
      setError(err?.response?.data?.message || 'Submission failed')
    }
  }

  return (
    <FormWrapper
      title="Fire / Emergency Drill"
      formType="fire-emergency"
      onSubmit={handleSubmit}
      isSubmitting={mutation.isPending}
      error={error}
      success={success}
    >
      <div className="section-header" style={{ marginTop: 24 }}>Drill Details</div>
      <div className="row">
        <div className="col-3">
          <div className="form-group">
            <label className="form-label">Drill Official *</label>
            <input name="drillOfficial" type="text" className="form-control" required />
          </div>
        </div>
        <div className="col-3">
          <div className="form-group">
            <label className="form-label">Total Persons Evacuated *</label>
            <input name="personsEvacuated" type="text" className="form-control" required />
          </div>
        </div>
        <div className="col-3">
          <div className="form-group">
            <label className="form-label">Location of Simulated Fire *</label>
            <input name="fireLocation" type="text" className="form-control" required />
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
        <div className="col-6">
          <div className="form-group">
            <label className="form-label">Address *</label>
            <input name="address" type="text" className="form-control" required />
          </div>
        </div>
        <div className="col-3">
          <div className="form-group">
            <label className="form-label">Begin Time *</label>
            <input name="beginTime" type="time" className="form-control-box" style={{ padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #d2d2d2', fontSize: 14, width: '100%', outline: 'none' }} required />
          </div>
        </div>
        <div className="col-3">
          <div className="form-group">
            <label className="form-label">End Time *</label>
            <input name="endTime" type="time" className="form-control-box" style={{ padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #d2d2d2', fontSize: 14, width: '100%', outline: 'none' }} required />
          </div>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Required Follow Up Action</label>
        <input name="followUpAction" type="text" className="form-control" />
      </div>
    </FormWrapper>
  )
}