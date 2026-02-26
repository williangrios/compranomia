// utils/timezone.ts

/**
 * Extrai o offset em horas a partir do timezone string (ex: "GMT-3" → -3)
 */
function parseGmtOffset(timeZone: string): number {
  const match = timeZone.match(/GMT([+-]?\d+)/)
  if (!match) return 0
  return parseInt(match[1], 10)
}

/**
 * Retorna datas de referência (todayStart, weekStart, monthStart)
 * ajustadas ao fuso horário do usuário, em formato ISO (UTC).
 *
 * Uso:
 *   const dates = getDateRanges(user.timeZone) // "GMT-3"
 *   // dates.todayStart → "2026-02-22T03:00:00.000Z" (meia-noite BRT em UTC)
 */
export function getDateRanges(timeZone: string) {
  const offsetHours = parseGmtOffset(timeZone)

  // "Agora" no fuso do usuário
  const nowUTC = new Date()
  const nowLocal = new Date(nowUTC.getTime() + offsetHours * 60 * 60 * 1000)

  const year = nowLocal.getUTCFullYear()
  const month = nowLocal.getUTCMonth()
  const date = nowLocal.getUTCDate()
  const dayOfWeek = nowLocal.getUTCDay()

  // Meia-noite local convertida de volta pra UTC
  const toUTC = (d: Date) =>
    new Date(d.getTime() - offsetHours * 60 * 60 * 1000)

  // Hoje 00:00 local
  const todayStart = toUTC(new Date(Date.UTC(year, month, date)))

  // Segunda-feira da semana atual 00:00 local
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const weekStart = toUTC(new Date(Date.UTC(year, month, date - diffToMonday)))

  // Dia 1 do mês 00:00 local
  const monthStart = toUTC(new Date(Date.UTC(year, month, 1)))

  return {
    todayStart: todayStart.toISOString(),
    weekStart: weekStart.toISOString(),
    monthStart: monthStart.toISOString(),
  }
}
