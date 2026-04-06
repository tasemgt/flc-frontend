import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useConsumers, useDeleteConsumer, useUpdateConsumer } from '../../api/consumers.api'

import DataTable from '../../components/shared/DataTable'
import { Spinner, Alert, StatusBadge } from '../../components/shared'
import useAuthStore from '../../store/authStore'
import { formatDate, formatDateTime } from '../../utils/dateFormat'

export default function AllConsumers() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const { data, isLoading, error } = useConsumers({ limit: 500 })
  const deleteMutation = useDeleteConsumer()
  const updateMutation = useUpdateConsumer()
  const [actionError, setActionError] = useState('')

  const consumers = data?.data || []
  const isDirector = user?.role === 'director'
  const basePath = isDirector ? '/director' : '/staff'


  const handleReactivate = async (id) => {
    if (!window.confirm('Reactivate this consumer?')) return
    setActionError('')
    try {
      await updateMutation.mutateAsync({ id, data: { isActive: true } })
      qc.invalidateQueries({ queryKey: ['consumers'] })
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Failed to reactivate')
    }
  }

  const handleDeactivate = async (id) => {
    const reason = window.prompt('Reason for deactivation (optional):')
    if (reason === null) return
    setActionError('')
    try {
      await deleteMutation.mutateAsync({ id, reason })
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
      accessor: (row) => row.dob ? formatDate(row.dob) : '—',
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
    {
      key: 'lastUpdatedBy',
      label: 'Last Updated By',
      sortable: false,
      render: (row) => {
        if (!row.lastUpdatedBy?.name) return <span style={{ color: '#ccc', fontSize: 12 }}>—</span>
        return (
          <div>
            <div style={{ fontSize: 13, color: '#3c4858', fontWeight: 500 }}>{row.lastUpdatedBy.name}</div>
            <div style={{ fontSize: 11, color: '#aaa' }}>
              {row.lastUpdatedBy.role} &middot;{' '}
              {row.lastUpdatedBy.at ? formatDateTime(row.lastUpdatedBy.at) : ''}
            </div>
          </div>
        )
      },
    },
  ]

  if (isLoading) return <Spinner />

  return (
    <div>
      <Alert type="error" message={actionError} />
      <div className="card">
        <div
          className="card-header-primary"
          style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}
        >
          <div>
            <h4 className="card-title-white">All Consumers</h4>
            <p className="card-subtitle-white">Registered consumers under your agency</p>
          </div>
          {isDirector && (
            <button
              className="btn btn-light btn-sm btn-round"
              onClick={() => navigate('/director/consumers/add')}
            >
              <span className="material-icons" style={{ fontSize: 16 }}>person_add</span>
              Add Consumer
            </button>
          )}
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
                  onClick={() => navigate(`${basePath}/consumers/${row._id}`)}
                >
                  <span className="material-icons" style={{ fontSize: 20 }}>person</span>
                </button>
                {row.isActive !== false && (
                  <button
                    className="btn-icon"
                    style={{ color: '#fb8c00' }}
                    title="Edit"
                    onClick={() => navigate(`${basePath}/consumers/${row._id}/edit`)}
                  >
                    <span className="material-icons" style={{ fontSize: 20 }}>edit</span>
                  </button>
                )}
                {isDirector && row.isActive !== false && (
                  <button
                    className="btn-icon text-danger"
                    title="Deactivate"
                    onClick={() => handleDeactivate(row._id)}
                    disabled={deleteMutation.isPending}
                  >
                    <span className="material-icons" style={{ fontSize: 20 }}>person_off</span>
                  </button>
                )}
                {isDirector && row.isActive === false && (
                  <button
                    className="btn-icon"
                    style={{ color: '#43a047' }}
                    title="Reactivate"
                    onClick={() => handleReactivate(row._id)}
                    disabled={updateMutation.isPending}
                  >
                    <span className="material-icons" style={{ fontSize: 20 }}>person_add</span>
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