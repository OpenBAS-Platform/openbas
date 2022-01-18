import React, { useEffect, useState } from 'react';
import { splitDuration } from '../utils/Time';

const Countdown = ({ date }) => {
  let dateInSeconds = date;
  if (typeof date === 'number') {
    dateInSeconds = Math.round(date / 1000);
  } else if (date instanceof Date) {
    dateInSeconds = Math.round(date.getTime() / 1000);
  } else if (typeof date === 'string') {
    dateInSeconds = Math.round(Date.parse(date) / 1000);
  }
  const [currentDate, setCurrentDate] = useState(Math.round(Date.now() / 1000));
  useEffect(() => {
    setInterval(() => setCurrentDate(Math.round(Date.now() / 1000)), 1000);
  }, []);
  const duration = splitDuration(
    dateInSeconds > currentDate ? dateInSeconds - currentDate : 0,
  );
  return (
    <span>
      {duration.days}:{duration.hours}:{duration.minutes}:{duration.seconds}
    </span>
  );
};

export default Countdown;
