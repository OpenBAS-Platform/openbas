import { Chip } from '@mui/material';
import moment from 'moment-timezone';
import { type FunctionComponent } from 'react';
import { makeStyles } from 'tss-react/mui';

import { useFormatter } from '../../../../components/i18n';
import countdown from '../../../../utils/hooks/countDown';
import { splitDuration } from '../../../../utils/Time';

const useStyles = makeStyles()(() => ({
  score: {
    fontSize: '0.75rem',
    height: '20px',
    padding: '0 4px',
  },
}));

interface Props {
  expirationTime: number;
  startDate: string;
}

const ExpirationChip: FunctionComponent<Props> = ({ expirationTime, startDate }) => {
  const { classes } = useStyles();
  const { t } = useFormatter();

  let expiration: number;
  const remainingSeconds = moment.utc().seconds() - moment.utc(startDate).seconds();
  if (remainingSeconds <= 0) {
    expiration = 0;
  } else {
    expiration = countdown(expirationTime - remainingSeconds, 60, 60);
  }
  const splitExpirationTime = splitDuration(expiration);

  return (
    <>
      {
        expiration === 0 ? (
          <Chip
            classes={{ root: classes.score }}
            label={t('Expired')}
          />
        ) : (
          <Chip
            classes={{ root: classes.score }}
            label={`${t('EXPIRES in')} ${splitExpirationTime.hours}
                                    ${t('h')} ${splitExpirationTime.minutes}
                                    ${t('m')}`}
          />
        )
      }
    </>
  );
};

export default ExpirationChip;
