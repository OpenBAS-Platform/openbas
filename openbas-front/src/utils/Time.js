import moment from 'moment-timezone';

export const ONE_MINUTE = 60 * 1000;
export const FIVE_SECONDS = 5000;
export const ONE_SECOND = 1000;

export const utcDate = date => (date ? moment(date).utc() : moment().utc());
export const now = () => utcDate().toISOString();

const minTwoDigits = n => (n < 10 ? '0' : '') + n;

export const splitDuration = (duration = 0) => {
  let delta = duration;
  const days = Math.floor(delta / 86400);
  delta -= days * 86400;
  const hours = Math.floor(delta / 3600) % 24;
  delta -= hours * 3600;
  const minutes = Math.floor(delta / 60) % 60;
  delta -= minutes * 60;
  const seconds = delta % 60;
  return {
    days: minTwoDigits(days),
    hours: minTwoDigits(hours),
    minutes: minTwoDigits(minutes),
    seconds: minTwoDigits(seconds),
  };
};

export const yearFormat = date => utcDate(date).format('YYYY');
export const monthFormat = date => utcDate(date).format('YYYY-MM');
export const dayFormat = date => utcDate(date).format('YYYY-MM-DD');
export const timeFormat = date => utcDate(date).format('YYYY-MM-DD HH:mm');

export const minutesInFuture = minutes => moment().utc().add(minutes, 'minutes');
export const minutesAgo = minutes => moment().utc().subtract(minutes, 'minutes');
export const hoursAgo = hours => moment().utc().subtract(hours, 'hours');
export const daysAgo = days => moment().utc().subtract(days, 'days');

export const getMonday = (d) => {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
};

export const progression = (nowEntry, startDate, endDate) => (now > endDate
  ? 100
  : Math.round(((nowEntry - startDate) / (endDate - startDate)) * 100));

export const groupBy = (elements, field, duration) => {
  const formatted = elements.map((elem) => {
    return { date: moment(elem[field]).startOf(duration).format('YYYY-MM-DD'), count: 1 };
  });
  const dates = formatted.map(elem => elem.date);
  const uniqueDates = dates.filter((date, index) => dates.indexOf(date) === index);
  return uniqueDates.map((date) => {
    const count = formatted.filter(elem => elem.date === date).reduce(c => c + 1, 0);
    return { date: duration === 'week' ? dayFormat(getMonday(new Date(date))) : monthFormat(date), value: count };
  });
};

export const getNextWeek = () => {
  const date = utcDate();
  if (date.weekday() < 4) date.add(1, 'week').day(4);
  else date.add(2, 'week').day(4);
  return date;
};

export const fillTimeSeries = (startDate, endDate, interval, data) => {
  let startDateParsed = moment.parseZone(startDate);
  let endDateParsed = moment.parseZone(endDate ?? now());
  let dateFormat;
  switch (interval) {
    case 'year':
      dateFormat = 'YYYY';
      break;
    case 'quarter':
    case 'month':
      dateFormat = 'YYYY-MM';
      break;
      /* v8 ignore next */
    case 'week':
      dateFormat = 'YYYY-MM-DD';
      startDateParsed = moment.parseZone(getMonday(new Date(startDateParsed.format(dateFormat))).toISOString());
      endDateParsed = moment.parseZone(getMonday(new Date(endDateParsed.format(dateFormat))).toISOString());
      break;
    case 'hour':
      dateFormat = 'YYYY-MM-DD HH:mm:ss';
      break;
    default:
      dateFormat = 'YYYY-MM-DD';
  }
  const startFormatDate = new Date(endDateParsed.format(dateFormat));
  const endFormatDate = new Date(startDateParsed.format(dateFormat));
  const elementsOfInterval = moment(startFormatDate).diff(moment(endFormatDate), `${interval}s`);
  const newData = [];
  for (let i = 0; i <= elementsOfInterval; i += 1) {
    const workDate = moment(startDateParsed).add(i, `${interval}s`);
    // Looking for the value
    let dataValue = 0;
    for (let j = 0; j < data.length; j += 1) {
      if (data[j].date === workDate.format(dateFormat)) {
        dataValue = data[j].value;
      }
    }
    const intervalDate = moment(workDate).startOf(interval).utc().toISOString();
    newData[i] = {
      date: intervalDate,
      value: dataValue,
    };
  }
  return newData;
};
