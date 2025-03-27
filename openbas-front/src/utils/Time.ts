import moment, { type MomentInput } from 'moment-timezone';

export const ONE_MINUTE = 60 * 1000;
export const FIVE_SECONDS = 5000;
export const ONE_SECOND = 1000;

export const utcDate = (date?: MomentInput) => (date ? moment(date).utc() : moment().utc());
export const now = () => utcDate().toISOString();

const minTwoDigits = (n: number): string => (n < 10 ? '0' : '') + n;

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

export const minutesInFuture = (minutes: number) => moment().utc().add(minutes, 'minutes');
export const minutesAgo = (minutes: number) => moment().utc().subtract(minutes, 'minutes');
export const hoursAgo = (hours: number) => moment().utc().subtract(hours, 'hours');
export const daysAgo = (days: number) => moment().utc().subtract(days, 'days');
