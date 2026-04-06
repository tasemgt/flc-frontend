import { useMutation, useQuery } from '@tanstack/react-query'
import axiosClient from './axiosClient'

export const useConsumers = (params = {}) =>
  useQuery({
    queryKey: ['consumers', params],
    queryFn: () => axiosClient.get('/consumers', { params }).then((r) => r.data),
  })

export const useConsumer = (id) =>
  useQuery({
    queryKey: ['consumer', id],
    queryFn: () => axiosClient.get(`/consumers/${id}`).then((r) => r.data),
    enabled: !!id,
  })

export const useCreateConsumer = () =>
  useMutation({
    mutationFn: (formData) =>
      axiosClient.post('/consumers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then((r) => r.data),
  })

export const useUpdateConsumer = () =>
  useMutation({
    mutationFn: ({ id, data }) =>
      axiosClient.patch(`/consumers/${id}`, data).then((r) => r.data),
  })

export const useUpdateConsumerMultipart = () =>
  useMutation({
    mutationFn: ({ id, formData }) =>
      axiosClient.patch(`/consumers/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then((r) => r.data),
  })

export const useDeleteConsumer = () =>
  useMutation({
    mutationFn: ({ id, reason }) =>
      axiosClient.delete(`/consumers/${id}`, { data: { reason } }).then((r) => r.data),
  })

export const useConsumerServices = () =>
  useQuery({
    queryKey: ['consumer-services'],
    queryFn: () => axiosClient.get('/meta/consumer-services').then((r) => r.data),
    staleTime: Infinity,
  })