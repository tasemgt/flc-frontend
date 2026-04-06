import { useMutation, useQuery } from '@tanstack/react-query'
import axiosClient from './axiosClient'

export const useApplyEmployment = () =>
  useMutation({
    mutationFn: (formData) =>
      axiosClient
        .post('/employment/apply', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data),
  })

export const useEmployments = (params = {}) =>
  useQuery({
    queryKey: ['employments', params],
    queryFn: () =>
      axiosClient.get('/employment', { params }).then((r) => r.data),
  })

export const useEmployment = (id) =>
  useQuery({
    queryKey: ['employment', id],
    queryFn: () => axiosClient.get(`/employment/${id}`).then((r) => r.data),
    enabled: !!id,
  })

export const useApproveEmployment = () =>
  useMutation({
    mutationFn: ({ id, role }) =>
      axiosClient.patch(`/employment/${id}/approve`, { role }).then((r) => r.data),
  })

export const useDeleteEmployment = () =>
  useMutation({
    mutationFn: (id) =>
      axiosClient.delete(`/employment/${id}`).then((r) => r.data),
  })
