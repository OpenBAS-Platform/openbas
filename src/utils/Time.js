import moment from 'moment-timezone'
import countdown from 'countdown'

const dayDateFormat = 'YYYY-MM-DD'
const timeDateFormat = 'HH:mm'
const openexDateFormat = 'YYYY-MM-DD HH:mm'

export const ONE_MINUTE = 60 * 1000
export const FIVE_SECONDS = 5000
export const ONE_SECOND = 1000

export const parse = (date) => {
  return moment(date)
}

export const now = () => {
  return moment()
}

export const dayFormat = (data) => {
  return data ? parse(data).format(dayDateFormat) : "-"
}

export const timeDiff = (start, end) => {
  return parse(start).diff(parse(end))
}

export const timeFormat = (data) => {
  return data ? parse(data).format(timeDateFormat) : "-"
}

export const dateFormat = (data, specificFormat) => {
  return data ? parse(data).format(specificFormat ? specificFormat : openexDateFormat) : "-"
}

export const dateToISO = (date) => {
  let momentDate = parse(date, openexDateFormat, true)
  return momentDate.isValid() ? momentDate.format() : 'invalid-date'
}

export const dateFromNow = (dateString) => {
  return dateString ? countdown(parse(dateString).toDate()).toString() : "-"
}

export const convertToCountdown = (durationInMillis) => {
  if (durationInMillis === null) return '-'
  let end = now()
  let start = moment(end).subtract(durationInMillis, 'ms')
  return countdown(start.toDate(), end.toDate()).toString()
}

export const logDate = () => {
  return now().format('HH:mm:ss.SSS')
}
