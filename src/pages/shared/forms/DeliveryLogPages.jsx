import { useEffect, useState } from 'react'
import DeliveryLogForm from '../../../components/shared/DeliveryLogForm'
import { useFormMeta } from '../../../api/consumerForms.api'
import { Spinner } from '../../../components/shared'

function DeliveryPage({ title, formType, activityKey }) {
  const { data, isLoading } = useFormMeta()
  const sections = data?.data?.[activityKey] || []
  if (isLoading) return <Spinner />
  return <DeliveryLogForm title={title} formType={formType} activitySections={sections} />
}

export function RespiteServicePage() {
  return <DeliveryPage title="Respite Service Delivery Log" formType="respite" activityKey="respiteActivities" />
}

export function RssSlServicePage() {
  return <DeliveryPage title="RSS and SL Service Delivery Log" formType="rss-sl" activityKey="rssActivities" />
}

export function SupportedHomeLivingPage() {
  return <DeliveryPage title="Supported Home Living CFC-PASS Service Delivery" formType="supported-home" activityKey="supportedHomeActivities" />
}

export function SupportedEmploymentPage() {
  return <DeliveryPage title="Supported Employment/EA Service Delivery" formType="supported-employment" activityKey="supportedEmploymentActivities" />
}

export function DayHabilitationPage() {
  return <DeliveryPage title="Day Habilitation Service Delivery" formType="day-habilitation" activityKey="dayHabActivities" />
}