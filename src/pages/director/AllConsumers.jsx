import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useConsumers, useDeleteConsumer } from '../../api/consumers.api'
import DataTable from '../../components/shared/DataTable'
import { Spinner, Alert, StatusBadge } from '../../components/shared'
import { formatDateTime } from '../../utils/dateFormat'

export default function AllConsumers() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data, isLoading, error } = useConsumers({ limit: 500 })
  const deleteMutation = useDeleteConsumer()
  const [actionError, setActionError] = useState('')

  const consumers = data?.data || []

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this consumer?')) return
    setActionError('')
    try {
      await deleteMutation.mutateAsync(id)
      qc.invalidateQueries({ queryKey: ['consumers'] })
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Failed to deactivate')
    }
  }

  const columns = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    {
      key: 'lcNumber',
      label: 'LC Number',
      render: (row) => (
        <span style={{ fontWeight: 600, color: '#222f3e', fontSize: 15 }}>{row.lcNumber}</span>
      ),
    },
    {
      key: 'dob',
      label: 'Date of Birth',
      accessor: (row) => row.dob ? formatDateTime(row.dob) : '—',
    },
    { key: 'phone', label: 'Phone' },
    {
      key: 'behaviorPlan',
      label: 'Behavior Plan',
      render: (row) => (
        <span className={`badge ${row.behaviorPlan === 'yes' ? 'badge-warning' : 'badge-default'}`}>
          {row.behaviorPlan === 'yes' ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row) => <StatusBadge value={row.isActive !== false ? 'Active' : 'Inactive'} />,
    },
  ]

  if (isLoading) return <Spinner />

  return (
    <div>
      <Alert type="error" message={actionError} />
      <div className="card">
        <div className="card-header-primary" style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h4 className="card-title-white">All Consumers</h4>
            <p className="card-subtitle-white">Registered consumers under your agency</p>
          </div>
          <button className="btn btn-light btn-sm btn-round" onClick={() => navigate('/director/consumers/add')}>
            <span className="material-icons" style={{ fontSize: 16 }}>person_add</span>
            Add Consumer
          </button>
        </div>
        <div className="card-body">
          {error && <Alert type="error" message="Failed to load consumers." />}
          <DataTable
            columns={columns}
            data={consumers}
            actions={(row) => (
              <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                <button
                  className="btn-icon text-info"
                  title="View"
                  onClick={() => navigate(`/director/consumers/${row._id}`)}
                >
                  <span className="material-icons" style={{ fontSize: 20 }}>person</span>
                </button>
                {row.isActive !== false && (
                  <button
                    className="btn-icon text-danger"
                    title="Deactivate"
                    onClick={() => handleDeactivate(row._id)}
                    disabled={deleteMutation.isPending}
                  >
                    <span className="material-icons" style={{ fontSize: 20 }}>close</span>
                  </button>
                )}
              </div>
            )}
          />
        </div>
      </div>
    </div>
  )
}