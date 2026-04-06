import { useQuery, useMutation } from '@tanstack/react-query'
import axiosClient from './axiosClient'

export const useAppointments = (params = {}) =>
  useQuery({
    queryKey: ['appointments', params],
    queryFn: () => axiosClient.get('/appointments', { params }).then((r) => r.data),
  })

export const useAppointment = (id) =>
  useQuery({
    queryKey: ['appointment', id],
    queryFn: () => axiosClient.get(`/appointments/${id}`).then((r) => r.data),
    enabled: !!id,
  })

export const useCreateAppointment = () =>
  useMutation({
    mutationFn: (data) => axiosClient.post('/appointments', data).then((r) => r.data),
  })

export const useUpdateAppointment = () =>
  useMutation({
    mutationFn: ({ id, data }) => axiosClient.patch(`/appointments/${id}`, data).then((r) => r.data),
  })

export const useDeleteAppointment = () =>
  useMutation({
    mutationFn: (id) => axiosClient.delete(`/appointments/${id}`).then((r) => r.data),
  })