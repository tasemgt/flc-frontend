import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAgencies, useApproveAgency, useDeleteAgency } from '../../api/agencies.api'
import { formatDateTime } from '../../utils/dateFormat'
import DataTable from '../../components/shared/DataTable'
import { StatusBadge, Spinner, Alert } from '../../components/shared'
import { useState } from 'react'

export default function AgencyApplications() {
  const { data, isLoading, error } = useAgencies({ limit: 500 })
  const approveMutation = useApproveAgency()
  const deleteMutation = useDeleteAgency()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [actionError, setActionError] = useState('')

  const agencies = data?.data || []

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this agency?')) return
    setActionError('')
    try {
      await approveMutation.mutateAsync(id)
      queryClient.invalidateQueries({ queryKey: ['agencies'] })
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Approval failed')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this agency application? This cannot be undone.')) return
    setActionError('')
    try {
      await deleteMutation.mutateAsync(id)
      queryClient.invalidateQueries({ queryKey: ['agencies'] })
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Delete failed')
    }
  }

  const columns = [
    { key: 'name', label: 'Agency Name' },
    { key: 'location', label: 'Location' },
    { key: 'agencyId', label: 'Application ID' },
    {
      key: 'approved',
      label: 'Status',
      render: (row) => <StatusBadge value={row.approved ? 'Approved' : 'Pending'} />,
    },
    {
      key: 'createdAt',
      label: 'Applied On',
      accessor: (row) => row.createdAt ? formatDateTime(row.createdAt) : '—',
    },
  ]

  if (isLoading) return <Spinner />

  return (
    <div>
      <Alert type="error" message={actionError} />

      <div className="card">
        <div className="card-header-primary" style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h4 className="card-title-white">All Agency Enrollment Applications</h4>
            <p className="card-subtitle-white">Lists all submitted agencies for enrollment</p>
          </div>
        </div>
        <div className="card-body">
          {error && <Alert type="error" message="Failed to load agency applications." />}
          <DataTable
            columns={columns}
            data={agencies}
            actions={(row) => (
              <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                <button
                  className="btn-icon text-info"
                  title="View details"
                  onClick={() => navigate(`/admin/agency-applications/${row._id}`)}
                >
                  <span className="material-icons" style={{ fontSize: 20 }}>description</span>
                </button>
                {!row.approved && (
                  <button
                    className="btn-icon"
                    title="Approve"
                    style={{ color: '#43a047' }}
                    onClick={() => handleApprove(row._id)}
                    disabled={approveMutation.isPending}
                  >
                    <span className="material-icons" style={{ fontSize: 20 }}>check_circle</span>
                  </button>
                )}
                <button
                  className="btn-icon text-danger"
                  title="Delete"
                  onClick={() => handleDelete(row._id)}
                  disabled={deleteMutation.isPending}
                >
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
