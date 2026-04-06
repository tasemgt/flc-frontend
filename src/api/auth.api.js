import { useMutation } from '@tanstack/react-query'
import axiosClient from './axiosClient'

export const useLogin = () =>
  useMutation({
    mutationFn: (credentials) =>
      axiosClient.post('/auth/login', credentials).then((r) => r.data),
  })

export const useForgotPassword = () =>
  useMutation({
    mutationFn: (data) =>
      axiosClient.post('/auth/forgot-password', data).then((r) => r.data),
  })

export const useResetPassword = (token) =>
  useMutation({
    mutationFn: (data) =>
      axiosClient.patch(`/auth/reset-password/${token}`, data).then((r) => r.data),
  })

export const useChangePassword = () =>
  useMutation({
    mutationFn: (data) =>
      axiosClient.patch('/auth/change-password', data).then((r) => r.data),
  })
