import moment, { type MomentInput } from 'moment-timezone';

export const FIVE_SECONDS = 5000;

export const utcDate = (date?: MomentInput) => (date ? moment(date).utc() : moment().utc());

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
