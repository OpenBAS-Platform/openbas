import moment from 'moment-timezone'

const openexDateFormat = 'YYYY-MM-DD HH:mm'

export const ONE_MINUTE = 60 * 1000

export const FIVE_SECONDS = 5000

export const dateFormat = (data) => {
  return data ? moment(data).format(openexDateFormat) : "-"
}

export const dateToISO = (date) => {
  var momentDate = moment(date, openexDateFormat, true)
  return momentDate.isValid() ? momentDate.format() : 'invalid-date'
}

export const logDate = () => {
  return moment().format('HH:mm:ss.SSS')
}