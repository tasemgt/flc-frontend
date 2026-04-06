import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useNotifications, useUnreadCount,
  useMarkRead, useMarkAllRead, useDeleteNotification,
} from '../../api/notifications.api'
import { formatDateTime } from '../../utils/dateFormat'

const TYPE_ICONS = {
  appointment_booked: 'event',
  appointment_updated: 'event_note',
  employment_approved: 'work',
  employment_submitted: 'work_outline',
  agency_approved: 'foundation',
  form_submitted: 'description',
  password_changed: 'lock',
  general: 'notifications',
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef()
  const navigate = useNavigate()
  const { data: countData } = useUnreadCount()
  const { data: notifData } = useNotifications()
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()
  const deleteNotif = useDeleteNotification()

  const count = countData?.count || 0
  const notifications = notifData?.data || []

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const handleClick = (notif) => {
    if (!notif.read) markRead.mutate(notif._id)
    if (notif.link) navigate(notif.link)
    setOpen(false)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className="navbar-dropdown-btn"
        onClick={() => setOpen((o) => !o)}
        style={{ position: 'relative' }}
      >
        <span className="material-icons" style={{ fontSize: 22 }}>notifications</span>
        {count > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 2,
            background: '#e53935', color: '#fff',
            borderRadius: '50%', width: 18, height: 18,
            fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          width: 360, maxHeight: 480, background: '#fff',
          borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,.15)',
          zIndex: 500, display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 500, color: '#3c4858', fontSize: 14 }}>
              Notifications {count > 0 && <span style={{ color: '#e53935' }}>({count})</span>}
            </span>
            {count > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                style={{ fontSize: 12, color: '#9c27b0', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#aaa', fontSize: 13 }}>
                <span className="material-icons" style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>notifications_none</span>
                No notifications
              </div>
            ) : notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleClick(n)}
                style={{
                  display: 'flex', gap: 12, padding: '12px 16px',
                  borderBottom: '1px solid #f5f5f5', cursor: 'pointer',
                  background: n.read ? '#fff' : '#f3f0ff',
                  transition: 'background .15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f9f9f9'}
                onMouseLeave={(e) => e.currentTarget.style.background = n.read ? '#fff' : '#f3f0ff'}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: n.read ? '#f5f5f5' : '#222f3e',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span className="material-icons" style={{ fontSize: 18, color: n.read ? '#aaa' : '#fff' }}>
                    {TYPE_ICONS[n.type] || 'notifications'}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: n.read ? 400 : 500, color: '#3c4858', marginBottom: 2 }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#777', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {n.message.split('\n')[0]}
                  </div>
                  <div style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>
                    {formatDateTime(n.createdAt)}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNotif.mutate(n._id) }}
                  className="btn-icon"
                  style={{ color: '#ccc', flexShrink: 0, alignSelf: 'center' }}
                >
                  <span className="material-icons" style={{ fontSize: 16 }}>close</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}