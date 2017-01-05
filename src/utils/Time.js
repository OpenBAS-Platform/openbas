import moment from 'moment-timezone'
import countdown from 'countdown'

const dayDateFormat = 'YYYY-MM-DD'
const timeDateFormat = 'HH:mm'
const openexDateFormat = 'YYYY-MM-DD HH:mm'

export const ONE_MINUTE = 60 * 1000
export const FIVE_SECONDS = 5000
export const ONE_SECOND = 1000

export const dayFormat = (data) => {
  return data ? moment(data).format(dayDateFormat) : "-"
}

export const timeFormat = (data) => {
  return data ? moment(data).format(timeDateFormat) : "-"
}

export const dateFormat = (data, specificFormat) => {
  return data ? moment(data).format(specificFormat ? specificFormat : openexDateFormat) : "-"
}

export const dateToISO = (date) => {
  var momentDate = moment(date, openexDateFormat, true)
  return momentDate.isValid() ? momentDate.format() : 'invalid-date'
}

export const parse = (date) => {
    return moment(date)
}

export const now = () => {
    return moment()
}

export const dateFromNow = (dateString) => {
  return dateString ? countdown(moment(dateString).toDate()).toString() : "-"
}

export const logDate = () => {
  return moment().format('HH:mm:ss.SSS')
}
