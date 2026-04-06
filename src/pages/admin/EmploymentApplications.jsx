import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useEmployments, useApproveEmployment, useDeleteEmployment } from '../../api/employment.api'
import DataTable from '../../components/shared/DataTable'
import { StatusBadge, Spinner, Alert } from '../../components/shared'
import useAuthStore from '../../store/authStore'

export default function EmploymentApplications() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data, isLoading, error } = useEmployments({ limit: 500 })
  const approveMutation = useApproveEmployment()
  const deleteMutation = useDeleteEmployment()
  const [actionError, setActionError] = useState('')
  const [approveModal, setApproveModal] = useState(null)
  const [selectedRole, setSelectedRole] = useState('caregiver')

  const apps = data?.data || []

  const handleApprove = async () => {
    if (!approveModal) return
    setActionError('')
    try {
      await approveMutation.mutateAsync({ id: approveModal._id, role: selectedRole })
      qc.invalidateQueries({ queryKey: ['employments'] })
      setApproveModal(null)
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Approval failed')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application?')) return
    setActionError('')
    try {
      await deleteMutation.mutateAsync(id)
      qc.invalidateQueries({ queryKey: ['employments'] })
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Delete failed')
    }
  }

  const columns = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'highSchool',
      label: 'High School',
      accessor: (row) => row.highSchool || row.high_school || '—',
    },
    { key: 'address', label: 'Address' },
    {
      key: 'approved',
      label: 'Status',
      render: (row) => <StatusBadge value={row.approved ? 'Approved' : 'Pending'} />,
    },
  ]

  const basePath = user?.role === 'admin' ? '/admin' : '/director'

  if (isLoading) return <Spinner />

  return (
    <div>
      <Alert type="error" message={actionError} />

      {/* Approve modal */}
      {approveModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 28, maxWidth: 400, width: '100%', margin: '0 20px' }}>
            <h4 style={{ margin: '0 0 12px', color: '#3c4858', fontWeight: 400 }}>Approve Application</h4>
            <p style={{ color: '#555', fontSize: 14, margin: '0 0 16px' }}>
              Approving <strong>{approveModal.firstName} {approveModal.lastName}</strong>. Select a role:
            </p>
            <div className="form-group">
              <label className="form-label">Assign Role *</label>
              <select className="form-control-box" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                <option value="caregiver">Direct Care Giver</option>
                <option value="nurse">Nurse</option>
              </select>
            </div>
            <div style={{ fontSize: 13, color: '#1565c0', background: '#e3f2fd', padding: '10px 14px', borderRadius: 4, marginBottom: 20 }}>
              <span className="material-icons" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 6 }}>info</span>
              Login credentials will be emailed to the applicant.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-success btn-round" onClick={handleApprove} disabled={approveMutation.isPending}>
                {approveMutation.isPending ? 'Approving…' : 'Confirm Approval'}
              </button>
              <button className="btn btn-light btn-round" onClick={() => setApproveModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header-primary" style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '16px 20px' }}>
          <h4 className="card-title-white">All Employment Applications</h4>
          <p className="card-subtitle-white">Lists all submitted job application forms</p>
        </div>
        <div className="card-body">
          {error && <Alert type="error" message="Failed to load applications." />}
          <DataTable
            columns={columns}
            data={apps}
            actions={(row) => (
              <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                <button className="btn-icon text-info" title="View" onClick={() => navigate(`${basePath}/employments/${row._id}`)}>
                  <span className="material-icons" style={{ fontSize: 20 }}>description</span>
                </button>
                {!row.approved && user?.role === 'director' && (
                  <button
                    className="btn-icon"
                    style={{ color: '#43a047' }}
                    title="Approve"
                    onClick={() => { setApproveModal(row); setSelectedRole('caregiver') }}
                  >
                    <span className="material-icons" style={{ fontSize: 20 }}>check_circle</span>
                  </button>
                )}
                <button className="btn-icon text-danger" title="Delete" onClick={() => handleDelete(row._id)} disabled={deleteMutation.isPending}>
                  <span className="material-icons" style={{ fontSize: 20 }}>close</span>
                </button>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  )
}
