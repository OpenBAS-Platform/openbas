import { useEffect, useState } from 'react';
import { splitDuration } from '../utils/Time';

const Countdown = ({ date, paused }) => {
  let dateInSeconds = date;
  if (typeof date === 'number') {
    dateInSeconds = Math.round(date / 1000);
  } else if (date instanceof Date) {
    dateInSeconds = Math.round(date.getTime() / 1000);
  } else if (typeof date === 'string') {
    dateInSeconds = Math.round(Date.parse(date) / 1000);
  }
  const [duration, setDuration] = useState(
    splitDuration(
      dateInSeconds > Math.round(Date.now() / 1000)
        ? dateInSeconds - Math.round(Date.now() / 1000)
        : 0,
    ),
  );
  const tick = () => {
    if (paused) {
      return;
    }
    const currentDate = Math.round(Date.now() / 1000);
    setDuration(
      splitDuration(
        dateInSeconds > currentDate ? dateInSeconds - currentDate : 0,
      ),
    );
  };
  useEffect(() => {
    const timerID = setInterval(() => tick(), 1000);
    return () => clearInterval(timerID);
  });
  return (
    <span>
      {duration.days}:{duration.hours}:{duration.minutes}:{duration.seconds}
    </span>
  );
};

export default Countdown;
