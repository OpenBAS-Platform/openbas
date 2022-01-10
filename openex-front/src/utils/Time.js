export const ONE_MINUTE = 60 * 1000;
export const FIVE_SECONDS = 5000;
export const ONE_SECOND = 1000;

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
    days,
    hours,
    minutes,
    seconds,
  };
};
