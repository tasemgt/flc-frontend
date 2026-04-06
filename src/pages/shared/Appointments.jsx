import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  useAppointments, useCreateAppointment,
  useUpdateAppointment, useDeleteAppointment,
} from '../../api/appointments.api'
import DataTable from '../../components/shared/DataTable'
import { Spinner, Alert, StatusBadge } from '../../components/shared'
import useAuthStore from '../../store/authStore'
import axiosClient from '../../api/axiosClient'
import { formatDate, formatDateTime } from '../../utils/dateFormat'

const STATUS_OPTIONS = ['pending', 'ongoing', 'completed', 'cancelled']
const STATUS_COLORS = { pending: 'warning', ongoing: 'info', completed: 'success', cancelled: 'danger' }

// ── Appointment Detail Modal ─────────────────────────────────────────────────
function DetailModal({ appt, onClose, onTreat, onEdit, isDirector, treating }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 8, width: '100%', maxWidth: 480 }}>
        <div className="card-header-primary" style={{ margin: 0, borderRadius: '8px 8px 0 0', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h4 className="card-title-white">Appointment Details</h4>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <span className="material-icons">close</span>
          </button>
        </div>
        <div style={{ padding: 24 }}>
          {/* Status */}
          <div style={{ marginBottom: 20 }}>
            <span className={`badge badge-${STATUS_COLORS[appt.status] || 'default'}`} style={{ fontSize: 13, padding: '4px 14px' }}>
              {appt.status}
            </span>
          </div>

          {/* Consumer */}
          <div style={{ background: '#f9f9f9', borderRadius: 6, padding: '12px 16px', marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>Consumer</div>
            <div style={{ fontWeight: 500, color: '#3c4858' }}>{appt.consumer?.firstName} {appt.consumer?.lastName}</div>
            <div style={{ fontSize: 12, color: '#999' }}>LC: {appt.consumer?.lcNumber} · {appt.consumer?.phone}</div>
          </div>

          {/* Details grid */}
          {[
            { label: 'Date', value: formatDate(appt.dateOfAppointment) },
            { label: 'Time', value: appt.time },
            { label: 'Assigned Staff', value: appt.staff ? `${appt.staff.firstName} ${appt.staff.lastName} (${appt.staff.role})` : '—' },
            { label: 'Reason', value: appt.reason },
            { label: 'Notes', value: appt.notes || '—' },
            { label: 'Booked On', value: formatDateTime(appt.createdAt) },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ fontSize: 12, color: '#aaa', width: 110, flexShrink: 0 }}>{label}</span>
              <span style={{ fontSize: 13, color: '#3c4858' }}>{value}</span>
            </div>
          ))}

          {appt.treatedAt && (
            <div style={{ marginTop: 12, background: '#e8f5e9', borderRadius: 4, padding: '8px 12px', fontSize: 12, color: '#2e7d32' }}>
              <span className="material-icons" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>check_circle</span>
              Treated on {formatDateTime(appt.treatedAt)} <em>by</em> <span style={{ fontWeight: 'bold' }}>{appt.treatedBy?.firstName} {appt.treatedBy?.lastName}</span> ({appt.treatedBy?.role})
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            {['pending', 'ongoing'].includes(appt.status) && (
              <button
                className="btn btn-success btn-round btn-sm"
                onClick={onTreat}
                disabled={treating}
              >
                <span className="material-icons" style={{ fontSize: 16 }}>check_circle</span>
                {treating ? 'Marking…' : 'Mark as Treated'}
              </button>
            )}
            {isDirector && (
              <button className="btn btn-primary btn-round btn-sm" onClick={onEdit}>
                <span className="material-icons" style={{ fontSize: 16 }}>edit</span>
                Edit
              </button>
            )}
            <button className="btn btn-light btn-round btn-sm" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Book/Edit Modal (unchanged from before) ──────────────────────────────────
function AppointmentModal({ appt, onClose, onSaved }) {
  const { user } = useAuthStore()
  const createMutation = useCreateAppointment()
  const updateMutation = useUpdateAppointment()
  const [error, setError] = useState('')
  const [lcInput, setLcInput] = useState(appt?.consumer?.lcNumber || '')
  const [consumer, setConsumer] = useState(appt?.consumer || null)
  const [looking, setLooking] = useState(false)
  const [staff, setStaff] = useState([])
  const isEdit = !!appt?._id

  useState(() => {
    axiosClient.get('/users/my-staff').then((r) => setStaff(r.data.data || [])).catch(() => {})
  }, [])

  const handleLookup = async () => {
    if (!lcInput.trim()) return
    setLooking(true)
    try {
      const { data } = await axiosClient.get('/consumers', { params: { limit: 500 } })
      const found = (data.data || []).find((c) => c.lcNumber?.toLowerCase() === lcInput.trim().toLowerCase())
      if (!found) setError('Consumer not found')
      else { setConsumer(found); setError('') }
    } catch { setError('Lookup failed') }
    finally { setLooking(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.target)
    const payload = Object.fromEntries(fd.entries())
    if (!isEdit && !consumer) return setError('Please look up a consumer first')
    if (!isEdit) payload.consumerId = consumer._id
    try {
      if (isEdit) await updateMutation.mutateAsync({ id: appt._id, data: payload })
      else await createMutation.mutateAsync(payload)
      onSaved()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save')
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 8, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="card-header-primary" style={{ margin: 0, borderRadius: '8px 8px 0 0', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h4 className="card-title-white">{isEdit ? 'Edit Appointment' : 'Book Appointment'}</h4>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <span className="material-icons">close</span>
          </button>
        </div>
        <div style={{ padding: 24 }}>
          <Alert type="error" message={error} />
          {!isEdit && (
            <>
              <div className="section-header">Consumer</div>
              {!consumer ? (
                <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                  <input type="text" className="form-control" style={{ flex: 1 }} placeholder="Enter LC Number"
                    value={lcInput} onChange={(e) => setLcInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLookup()} />
                  <button type="button" className="btn btn-primary btn-round btn-sm" onClick={handleLookup} disabled={looking}>
                    {looking ? '…' : 'Find'}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#e8f5e9', borderRadius: 6, marginBottom: 16 }}>
                  <span className="material-icons" style={{ color: '#43a047' }}>person</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{consumer.firstName} {consumer.lastName}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>LC: {consumer.lcNumber}</div>
                  </div>
                  <button type="button" className="btn-icon" style={{ color: '#aaa' }} onClick={() => setConsumer(null)}>
                    <span className="material-icons" style={{ fontSize: 18 }}>close</span>
                  </button>
                </div>
              )}
            </>
          )}

          {(isEdit || consumer) && (
            <form onSubmit={handleSubmit}>
              <div className="section-header">Details</div>
              <div className="row">
                <div className="col-6">
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input name="dateOfAppointment" type="date" required defaultValue={appt?.dateOfAppointment?.split('T')[0]}
                      style={{ width: '100%', padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #d2d2d2', fontSize: 14, outline: 'none' }} />
                  </div>
                </div>
                <div className="col-6">
                  <div className="form-group">
                    <label className="form-label">Time *</label>
                    <input name="time" type="time" required defaultValue={appt?.time}
                      style={{ width: '100%', padding: '8px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #d2d2d2', fontSize: 14, outline: 'none' }} />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Assign Staff *</label>
                <select name="staffId" className="form-control-box" required defaultValue={appt?.staff?._id || ''}>
                  <option value="">— Select Staff —</option>
                  {staff.map((s) => <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.role})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Reason *</label>
                <textarea name="reason" className="form-control-box" rows={3} required defaultValue={appt?.reason} style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea name="notes" className="form-control-box" rows={2} defaultValue={appt?.notes || ''} style={{ resize: 'vertical' }} />
              </div>
              {isEdit && (
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select name="status" className="form-control-box" defaultValue={appt?.status}>
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="submit" className="btn btn-primary btn-round" disabled={createMutation.isPending || updateMutation.isPending || appt?.status === 'completed'}>
                  {createMutation.isPending || updateMutation.isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Book Appointment'}
                </button>
                <button type="button" className="btn btn-light btn-round" onClick={onClose}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function Appointments() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editAppt, setEditAppt] = useState(null)
  const [detailAppt, setDetailAppt] = useState(null)
  const [treating, setTreating] = useState(false)
  const [actionError, setActionError] = useState('')

  const { data, isLoading, error } = useAppointments(statusFilter ? { status: statusFilter } : {})
  const deleteMutation = useDeleteAppointment()
  const isDirector = user?.role === 'director'
  const appointments = data?.data || []

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return
    setActionError('')
    try {
      await deleteMutation.mutateAsync(id)
      qc.invalidateQueries({ queryKey: ['appointments'] })
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Failed to cancel')
    }
  }

  const handleTreat = async (appt) => {
    if (!window.confirm('Mark this appointment as treated/completed?')) return
    setTreating(true)
    setActionError('')
    try {
      await axiosClient.patch(`/appointments/${appt._id}/treat`)
      qc.invalidateQueries({ queryKey: ['appointments'] })
      setDetailAppt(null)
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Failed to mark as treated')
    } finally {
      setTreating(false)
    }
  }

  const handleSaved = () => {
    setShowModal(false)
    setEditAppt(null)
    qc.invalidateQueries({ queryKey: ['appointments'] })
  }

  const columns = [
    {
      key: 'consumer', label: 'Consumer',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 500, color: '#3c4858', fontSize: 13 }}>{row.consumer?.firstName} {row.consumer?.lastName}</div>
          <div style={{ fontSize: 11, color: '#aaa' }}>{row.consumer?.lcNumber}</div>
        </div>
      ),
    },
    {
      key: 'dateOfAppointment', label: 'Date & Time',
      render: (row) => (
        <div>
          <div style={{ fontSize: 13, color: '#3c4858' }}>{formatDate(row.dateOfAppointment)}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{row.time}</div>
        </div>
      ),
    },
    { key: 'reason', label: 'Reason', accessor: (row) => row.reason },
    {
      key: 'staff', label: 'Assigned Staff',
      render: (row) => row.staff ? (
        <div>
          <div style={{ fontSize: 13 }}>{row.staff.firstName} {row.staff.lastName}</div>
          <div style={{ fontSize: 11, color: '#aaa' }}>{row.staff.role}</div>
        </div>
      ) : '—',
    },
    {
      key: 'status', label: 'Status',
      render: (row) => <span className={`badge badge-${STATUS_COLORS[row.status] || 'default'}`}>{row.status}</span>,
    },
  ]

  if (isLoading) return <Spinner />

  return (
    <div>
      {detailAppt && (
        <DetailModal
          appt={detailAppt}
          isDirector={isDirector}
          treating={treating}
          onClose={() => setDetailAppt(null)}
          onTreat={() => handleTreat(detailAppt)}
          onEdit={() => { setEditAppt(detailAppt); setDetailAppt(null) }}
        />
      )}

      {(showModal || editAppt) && (
        <AppointmentModal
          appt={editAppt}
          onClose={() => { setShowModal(false); setEditAppt(null) }}
          onSaved={handleSaved}
        />
      )}

      <Alert type="error" message={actionError} />

      <div className="card">
        <div className="card-header-primary" style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h4 className="card-title-white">Appointments</h4>
            <p className="card-subtitle-white">{data?.total || 0} total</p>
          </div>
          {isDirector && (
            <button className="btn btn-light btn-sm btn-round" onClick={() => setShowModal(true)}>
              <span className="material-icons" style={{ fontSize: 16 }}>add</span>
              Book Appointment
            </button>
          )}
        </div>
        <div className="card-body">
          {error && <Alert type="error" message="Failed to load appointments." />}

          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {['', ...STATUS_OPTIONS].map((s) => (
              <button key={s || 'all'} onClick={() => setStatusFilter(s)}
                className={`btn btn-sm btn-round ${statusFilter === s ? 'btn-primary' : 'btn-light'}`}>
                {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
              </button>
            ))}
          </div>

          <DataTable
            columns={columns}
            data={appointments}
            actions={(row) => (
              <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                {/* View details — everyone */}
                <button className="btn-icon text-info" title="View Details" onClick={() => setDetailAppt(row)}>
                  <span className="material-icons" style={{ fontSize: 20 }}>info</span>
                </button>
                {/* Treat — director always, staff only their own pending/ongoing */}
                {(isDirector || (row.staff?._id === user?._id && ['pending', 'ongoing'].includes(row.status))) &&
                  row.status !== 'completed' && row.status !== 'cancelled' && (
                    <button className="btn-icon" style={{ color: '#43a047' }} title="Mark as Treated" onClick={() => handleTreat(row)}>
                      <span className="material-icons" style={{ fontSize: 20 }}>check_circle</span>
                    </button>
                  )
                }
                {/* Edit + Cancel — director only */}
                {isDirector && (
                  <>
                    <button className="btn-icon" style={{ color: '#fb8c00' }} title="Edit" onClick={() => setEditAppt(row)}>
                      <span className="material-icons" style={{ fontSize: 20 }}>edit</span>
                    </button>
                    <button className="btn-icon text-danger" title="Cancel" onClick={() => handleDelete(row._id)} disabled={deleteMutation.isPending}>
                      <span className="material-icons" style={{ fontSize: 20 }}>close</span>
                    </button>
                  </>
                )}
              </div>
            )}
          />
        </div>
      </div>
    </div>
  )
}