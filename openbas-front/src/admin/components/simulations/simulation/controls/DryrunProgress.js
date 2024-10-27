import { LinearProgress, linearProgressClasses } from '@mui/material';
import { styled } from '@mui/styles';
import { useEffect, useState } from 'react';

import { progression } from '../../../../../utils/Time';

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 4,
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 4,
    backgroundColor: theme.palette.primary.main,
  },
}));

const DryrunProgress = ({ start, end }) => {
  // Standard hooks
  const [currentDate, setCurrentDate] = useState(new Date());
  useEffect(() => {
    const intervalId = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(intervalId);
  }, []);
  return (
    <BorderLinearProgress
      value={progression(currentDate, Date.parse(start), Date.parse(end))}
      variant="determinate"
    />
  );
};

export default DryrunProgress;
