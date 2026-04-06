import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from './axiosClient'

export const useNotifications = () =>
  useQuery({
    queryKey: ['notifications'],
    queryFn: () => axiosClient.get('/notifications').then((r) => r.data),
    refetchInterval: 60000, // poll every minute
  })

export const useUnreadCount = () =>
  useQuery({
    queryKey: ['notifications-unread'],
    queryFn: () => axiosClient.get('/notifications/unread-count').then((r) => r.data),
    refetchInterval: 30000,
  })

export const useMarkRead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => axiosClient.patch(`/notifications/${id}/read`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notifications-unread'] })
    },
  })
}

export const useMarkAllRead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => axiosClient.patch('/notifications/mark-all-read').then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notifications-unread'] })
    },
  })
}

export const useDeleteNotification = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => axiosClient.delete(`/notifications/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}