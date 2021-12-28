import moment from 'moment-timezone';

const dayDateFormat = 'YYYY-MM-DD';
const timeDateFormat = 'HH:mm';
const openexDateFormat = 'YYYY-MM-DD HH:mm';

export const ONE_MINUTE = 60 * 1000;
export const FIVE_SECONDS = 5000;
export const ONE_SECOND = 1000;

export const parse = (date) => moment(date);

export const now = () => moment();

export const dayFormat = (data) => (data ? parse(data).format(dayDateFormat) : '-');

export const timeDiff = (start, end) => parse(start).diff(parse(end));

export const timeFormat = (data) => (data ? parse(data).format(timeDateFormat) : '-');

export const dateFormat = (data, specificFormat) => (data ? parse(data).format(specificFormat || openexDateFormat) : '-');

export const dateToISO = (date) => {
  const momentDate = parse(date, openexDateFormat, true);
  return momentDate.isValid() ? momentDate.format() : 'invalid-date';
};

export const logDate = () => now().format('HH:mm:ss.SSS');
