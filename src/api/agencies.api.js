import { useMutation, useQuery } from '@tanstack/react-query'
import axiosClient from './axiosClient'

export const useApplyAgency = () =>
  useMutation({
    mutationFn: (data) =>
      axiosClient.post('/agencies/apply', data).then((r) => r.data),
  })

export const useAgencies = (params = {}) =>
  useQuery({
    queryKey: ['agencies', params],
    queryFn: () =>
      axiosClient.get('/agencies', { params }).then((r) => r.data),
  })

export const useAgency = (id) =>
  useQuery({
    queryKey: ['agency', id],
    queryFn: () => axiosClient.get(`/agencies/${id}`).then((r) => r.data),
    enabled: !!id,
  })

export const useApproveAgency = () =>
  useMutation({
    mutationFn: (id) =>
      axiosClient.patch(`/agencies/${id}/approve`).then((r) => r.data),
  })

export const useDeleteAgency = () =>
  useMutation({
    mutationFn: (id) =>
      axiosClient.delete(`/agencies/${id}`).then((r) => r.data),
  })
