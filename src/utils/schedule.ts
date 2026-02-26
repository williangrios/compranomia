// src/utils/schedule.ts

interface TimePeriod {
  openTime: string
  closeTime: string
}

interface ScheduleDay {
  dayOfWeek: number
  isOpen: boolean
  periods: TimePeriod[]
  cutoffTime?: string | null
}

export function getTodaySchedule(days: ScheduleDay[]): ScheduleDay | null {
  const today = new Date().getDay()
  return days.find((d) => d.dayOfWeek === today) || null
}

export function formatSchedule(day: ScheduleDay | null): string {
  if (!day || !day.isOpen || day.periods.length === 0) {
    return 'Fechado hoje'
  }

  return day.periods.map((p) => `${p.openTime} - ${p.closeTime}`).join(', ')
}
