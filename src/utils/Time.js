import moment from 'moment-timezone'

export const dateFormat = (data) => {
  return moment(data).format('YYYY-MM-DD HH:mm')
}

export const dateToISO = (date) => {
  return moment(date).format()
}