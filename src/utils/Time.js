import moment from 'moment-timezone'

const openexDateFormat = 'YYYY-MM-DD HH:mm'

export const dateFormat = (data) => {
  return moment(data).format(openexDateFormat)
}

export const dateToISO = (date) => {
  var momentDate = moment(date, openexDateFormat, true)
  return momentDate.isValid() ? momentDate.format() : 'invalid-date'
}

export const logDate = () => {
  return moment().format('HH:mm:ss.SSS')
}