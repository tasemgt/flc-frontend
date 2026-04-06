import { useQuery, useMutation } from '@tanstack/react-query'
import axiosClient from './axiosClient'

const base = '/director-forms'

export const useDirectorMeta = () =>
  useQuery({ queryKey: ['director-meta'], queryFn: () => axiosClient.get(`${base}/meta`).then(r => r.data), staleTime: Infinity })

export const useSatisfactionForms = () =>
  useQuery({ queryKey: ['satisfaction-forms'], queryFn: () => axiosClient.get(`${base}/satisfaction`).then(r => r.data) })

export const useSubmitSatisfactionForm = () =>
  useMutation({ mutationFn: (data) => axiosClient.post(`${base}/satisfaction`, data).then(r => r.data) })

export const useCriticalIncidents = () =>
  useQuery({ queryKey: ['critical-incidents'], queryFn: () => axiosClient.get(`${base}/critical-incident`).then(r => r.data) })

export const useUpsertCriticalIncident = () =>
  useMutation({ mutationFn: (data) => axiosClient.post(`${base}/critical-incident`, data).then(r => r.data) })

export const useExclusionSchedules = () =>
  useQuery({ queryKey: ['exclusion-schedules'], queryFn: () => axiosClient.get(`${base}/exclusion-schedule`).then(r => r.data) })

export const useUpsertExclusionSchedule = () =>
  useMutation({ mutationFn: (data) => axiosClient.post(`${base}/exclusion-schedule`, data).then(r => r.data) })

export const useDebarVendors = () =>
  useQuery({ queryKey: ['debar-vendors'], queryFn: () => axiosClient.get(`${base}/debar-vendor`).then(r => r.data) })

export const useUpsertDebarVendor = () =>
  useMutation({ mutationFn: (data) => axiosClient.post(`${base}/debar-vendor`, data).then(r => r.data) })

export const useDentalSummarySheets = () =>
  useQuery({ queryKey: ['dental-summary-sheets'], queryFn: () => axiosClient.get(`${base}/dental-summary`).then(r => r.data) })

export const useSubmitDentalSummarySheet = () =>
  useMutation({ mutationFn: (data) => axiosClient.post(`${base}/dental-summary`, data).then(r => r.data) })

export const useMinorAdaptiveSummaries = () =>
  useQuery({ queryKey: ['minor-adaptive-summaries'], queryFn: () => axiosClient.get(`${base}/minor-adaptive`).then(r => r.data) })

export const useSubmitMinorAdaptiveSummary = () =>
  useMutation({ mutationFn: (data) => axiosClient.post(`${base}/minor-adaptive`, data).then(r => r.data) })

export const useNoticeAdvisoryForms = () =>
  useQuery({ queryKey: ['notice-advisory-forms'], queryFn: () => axiosClient.get(`${base}/notice-advisory`).then(r => r.data) })

export const useSubmitNoticeAdvisory = () =>
  useMutation({ mutationFn: (data) => axiosClient.post(`${base}/notice-advisory`, data).then(r => r.data) })