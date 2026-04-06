import { useMutation, useQuery } from '@tanstack/react-query'
import axiosClient from './axiosClient'

export const useUsers = (params = {}) =>
  useQuery({
    queryKey: ['users', params],
    queryFn: () => axiosClient.get('/users', { params }).then((r) => r.data),
  })

export const useMe = () =>
  useQuery({
    queryKey: ['me'],
    queryFn: () => axiosClient.get('/users/me').then((r) => r.data),
  })

export const useCreateUser = () =>
  useMutation({
    mutationFn: (data) =>
      axiosClient.post('/users', data).then((r) => r.data),
  })

export const useConfirmDirector = () =>
  useMutation({
    mutationFn: (agencyId) =>
      axiosClient.patch(`/users/confirm-director/${agencyId}`).then((r) => r.data),
  })

export const useUpdateMe = () =>
  useMutation({
    mutationFn: (data) =>
      axiosClient.patch('/users/me', data).then((r) => r.data),
  })

export const useDeleteUser = () =>
  useMutation({
    mutationFn: (id) =>
      axiosClient.delete(`/users/${id}`).then((r) => r.data),
  })
