import { useQuery, useMutation } from '@tanstack/react-query'
import axiosClient from './axiosClient'

export const useFormMeta = () =>
  useQuery({
    queryKey: ['form-meta'],
    queryFn: () => axiosClient.get('/consumer-forms/meta').then((r) => r.data),
    staleTime: Infinity,
  })

export const useForms = (params = {}) =>
  useQuery({
    queryKey: ['consumer-forms', params],
    queryFn: () => axiosClient.get('/consumer-forms', { params }).then((r) => r.data),
    enabled: Object.keys(params).length > 0 || true,
  })

export const useForm = (id) =>
  useQuery({
    queryKey: ['consumer-form', id],
    queryFn: () => axiosClient.get(`/consumer-forms/${id}`).then((r) => r.data),
    enabled: !!id,
  })

export const useSubmitForm = (formType) =>
  useMutation({
    mutationFn: (data) =>
      axiosClient.post(`/consumer-forms/${formType}`, data).then((r) => r.data),
  })

export const useDeleteForm = () =>
  useMutation({
    mutationFn: (id) =>
      axiosClient.delete(`/consumer-forms/${id}`).then((r) => r.data),
  })