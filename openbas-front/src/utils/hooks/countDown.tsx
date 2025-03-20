import { useEffect, useState } from 'react';

const countdown = (timePeriod: number, interval: number, minusTime: number) => {
  const [remainingTimePeriod, setRemainingTimePeriod] = useState(timePeriod);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRemainingTimePeriod(remainingTimePeriod - minusTime);
    }, interval);
    return () => {
      clearInterval(intervalId);
    };
  }, [timePeriod]);
  return remainingTimePeriod;
};

export default countdown;
