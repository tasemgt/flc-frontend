import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useUsers, useDeleteUser } from '../../api/users.api'
import DataTable from '../../components/shared/DataTable'
import { StatusBadge, Spinner, Alert } from '../../components/shared'
import { useState } from 'react'
import { formatDateTime } from '../../utils/dateFormat'

const roleColors = { admin: 'info', director: 'primary', nurse: 'success', caregiver: 'warning' }

function RoleBadge({ role }) {
  const color = roleColors[role] || 'default'
  return <span className={`badge badge-${color}`}>{role}</span>
}

export default function AllUsers() {
  const { data, isLoading, error } = useUsers({ limit: 500 })
  const deleteMutation = useDeleteUser()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [actionError, setActionError] = useState('')

  const users = data?.data || []

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this user?')) return
    setActionError('')
    try {
      await deleteMutation.mutateAsync(id)
      qc.invalidateQueries({ queryKey: ['users'] })
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Delete failed')
    }
  }

  const columns = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (row) => <RoleBadge role={row.role} /> },
    {
      key: 'active',
      label: 'Status',
      render: (row) => {
        if (row.role === 'director' && !row.confirmed) {
          return <StatusBadge value="Pending" />
        }
        return <StatusBadge value={row.active !== false ? 'Active' : 'Inactive'} />
      },
    },
    {
      key: 'createdAt',
      label: 'Joined',
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
            <h4 className="card-title-white">All Users</h4>
            <p className="card-subtitle-white">Manage all system users</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm btn-round" onClick={() => navigate('/admin/users/add')}>
              <span className="material-icons" style={{ fontSize: 16 }}>how_to_reg</span>
              Register Staff
            </button>
            <button className="btn btn-light btn-sm btn-round" onClick={() => navigate('/admin/users/add-director')}>
              <span className="material-icons" style={{ fontSize: 16 }}>person_add</span>
              Add Director
            </button>
          </div>
        </div>
        <div className="card-body">
          {error && <Alert type="error" message="Failed to load users." />}
          <DataTable
            columns={columns}
            data={users}
            actions={(row) => (
              <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                <button className="btn-icon text-info" title="View" onClick={() => navigate(`/admin/users/${row._id}`)}>
                  <span className="material-icons" style={{ fontSize: 20 }}>description</span>
                </button>
                <button
                  className="btn-icon text-danger"
                  title="Deactivate"
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
