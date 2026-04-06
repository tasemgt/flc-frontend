import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import axiosClient from '../../api/axiosClient'
import DataTable from '../../components/shared/DataTable'
import { Spinner, Alert, StatusBadge } from '../../components/shared'

const roleColors = { nurse: 'success', caregiver: 'warning' }

export default function MyStaff() {
  const navigate = useNavigate()
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-staff'],
    queryFn: () => axiosClient.get('/users/my-staff').then((r) => r.data),
  })

  const staff = data?.data || []

  const columns = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'role',
      label: 'Role',
      render: (row) => (
        <span className={`badge badge-${roleColors[row.role] || 'default'}`}>
          {row.role}
        </span>
      ),
    },
    {
      key: 'active',
      label: 'Status',
      render: (row) => <StatusBadge value={row.active !== false ? 'Active' : 'Inactive'} />,
    },
  ]

  if (isLoading) return <Spinner />

  return (
    <div>
      {error && <Alert type="error" message="Failed to load staff." />}
      <div className="card">
        <div className="card-header-primary" style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '16px 20px' }}>
          <h4 className="card-title-white">My Staff</h4>
          <p className="card-subtitle-white">All nurses and caregivers under your organisation</p>
        </div>
        <div className="card-body">
          <DataTable
            columns={columns}
            data={staff}
            actions={(row) => (
              <button
                className="btn-icon text-info"
                title="View"
                onClick={() => navigate(`/director/staff/${row._id}`)}
              >
                <span className="material-icons" style={{ fontSize: 20 }}>description</span>
              </button>
            )}
          />
        </div>
      </div>
    </div>
  )
}