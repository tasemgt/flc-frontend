import { useQuery, useMutation } from '@tanstack/react-query'
import axiosClient from './axiosClient'

const base = '/nurse-forms'

export const useNurseMeta = () =>
  useQuery({ queryKey: ['nurse-meta'], queryFn: () => axiosClient.get(`${base}/meta`).then(r => r.data), staleTime: Infinity })

export const useNursingDeliveries = () =>
  useQuery({ queryKey: ['nursing-deliveries'], queryFn: () => axiosClient.get(`${base}/nursing-delivery`).then(r => r.data) })

export const useSubmitNursingDelivery = () =>
  useMutation({ mutationFn: (data) => axiosClient.post(`${base}/nursing-delivery`, data).then(r => r.data) })

export const useNursingChecklists = () =>
  useQuery({ queryKey: ['nursing-checklists'], queryFn: () => axiosClient.get(`${base}/nursing-checklist`).then(r => r.data) })

export const useSubmitNursingChecklist = () =>
  useMutation({ mutationFn: (data) => axiosClient.post(`${base}/nursing-checklist`, data).then(r => r.data) })

export const useRnDelegations = () =>
  useQuery({ queryKey: ['rn-delegations'], queryFn: () => axiosClient.get(`${base}/rn-delegation`).then(r => r.data) })

export const useSubmitRnDelegation = () =>
  useMutation({ mutationFn: (data) => axiosClient.post(`${base}/rn-delegation`, data).then(r => r.data) })

export const useTasksScreenings = () =>
  useQuery({ queryKey: ['tasks-screenings'], queryFn: () => axiosClient.get(`${base}/tasks-screening`).then(r => r.data) })

export const useSubmitTasksScreening = () =>
  useMutation({ mutationFn: (data) => axiosClient.post(`${base}/tasks-screening`, data).then(r => r.data) })

export const useExclusionHhcc = () =>
  useQuery({ queryKey: ['exclusion-hhcc'], queryFn: () => axiosClient.get(`${base}/exclusion-hhcc`).then(r => r.data) })

export const useSubmitExclusionHhcc = () =>
  useMutation({ mutationFn: (data) => axiosClient.post(`${base}/exclusion-hhcc`, data).then(r => r.data) })

export const useComprehensiveAssessments = () =>
  useQuery({ queryKey: ['comprehensive-assessments'], queryFn: () => axiosClient.get(`${base}/comprehensive-assessment`).then(r => r.data) })

export const useSubmitComprehensiveAssessment = () =>
  useMutation({ mutationFn: (data) => axiosClient.post(`${base}/comprehensive-assessment`, data).then(r => r.data) })