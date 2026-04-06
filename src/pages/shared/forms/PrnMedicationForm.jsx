import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import FormWrapper from '../../../components/shared/FormWrapper'
import { useSubmitForm } from '../../../api/consumerForms.api'

const PRN_MEDS = [
  'TYLENOL or generic equivalent (Acetaminophen) – 325mg 2 tablets every 4 hours for discomfort or temperature elevation.',
  'IMODIUM or generic equivalent (Loperamide) – 2 teaspoons every 30 minutes for diarrhea. Not to exceed 6 doses in a 24 hour period.',
  'ROBITUSSIN DM or generic equivalent (Guaifenesin) – 2 teaspoons every 4 hours for cough. Not to exceed 12 teaspoons in a 24 hour period.',
  'BENADRYL or generic equivalent (Diphenhydramine) – 25mg 1 capsule/tablet every 4 hours for allergies or itching.',
  'MAALOX or generic equivalent (Aluminum/Magnesium) – 2 tablespoons every 4 hours for stomach upset.',
]

export default function PrnMedicationForm() {
  const qc = useQueryClient()
  const mutation = useSubmitForm('prn-medication')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e, consumer) => {
    setError(''); setSuccess('')
    const fd = new FormData(e.target)
    const payload = Object.fromEntries(fd.entries())
    try {
      await mutation.mutateAsync(payload)
      qc.invalidateQueries({ queryKey: ['consumer-forms'] })
      setSuccess('PRN Medication List submitted successfully.')
      e.target.reset()
    } catch (err) {
      setError(err?.response?.data?.message || 'Submission failed')
    }
  }

  return (
    <FormWrapper
      title="PRN Medication List"
      formType="prn-medication"
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
        <div className="col-5">
          <div className="form-group">
            <label className="form-label">Allergies (comma separated) *</label>
            <input name="allergies" type="text" className="form-control" required />
          </div>
        </div>
        <div className="col-4">
          <div className="form-group">
            <label className="form-label">Physician Name *</label>
            <input name="physicianName" type="text" className="form-control" required />
          </div>
        </div>
      </div>

      <div className="section-header" style={{ marginTop: 24 }}>Standard PRN Medications</div>
      <div style={{ background: '#f9f9f9', borderRadius: 6, padding: '16px 20px', marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: '#555', marginBottom: 12 }}>
          The following medications may be used for this consumer for one (1) year as needed:
        </p>
        <ol style={{ paddingLeft: 20, margin: 0 }}>
          {PRN_MEDS.map((med, i) => (
            <li key={i} style={{ fontSize: 13, color: '#555', padding: '4px 0', lineHeight: 1.5 }}>{med}</li>
          ))}
        </ol>
      </div>

      <div className="form-group">
        <label className="form-label">Additional PRN Medications / Notes *</label>
        <textarea name="additionalPrnMeds" className="form-control-box" rows={4} style={{ resize: 'vertical' }} required />
      </div>
    </FormWrapper>
  )
}