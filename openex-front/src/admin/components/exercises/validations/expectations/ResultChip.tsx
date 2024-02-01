import { Chip } from '@mui/material';
import React, { FunctionComponent } from 'react';
import { makeStyles } from '@mui/styles';
import colorStyles from '../../../../../components/Color';
import { useFormatter } from '../../../../../components/i18n';
import type { InjectExpectationsStore } from '../../injects/expectations/Expectation';

const useStyles = makeStyles(() => ({
  chipInList: {
    height: 20,
    borderRadius: '0',
    textTransform: 'uppercase',
    width: 200,
  },
  points: {
    height: 20,
    backgroundColor: 'rgba(236, 64, 122, 0.08)',
    border: '1px solid #ec407a',
    color: '#ec407a',
  },
}));

interface Props {
  expectation: InjectExpectationsStore;
}

const ResultChip: FunctionComponent<Props> = ({
  expectation,
}) => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();

  const result = expectation.inject_expectation_result !== null;

  const isFail = () => {
    return result
      && (expectation.inject_expectation_type === 'TECHNICAL'
        && expectation.inject_expectation_expected_score !== expectation.inject_expectation_score);
  };

  const label = () => {
    if (result) {
      if (isFail()) {
        if (expectation.inject_expectation_type === 'TECHNICAL') {
          return `${t('Not blocked')} (${expectation.inject_expectation_score})`;
        }
        return `${t('Failed')} (${expectation.inject_expectation_score})`;
      }
      if (expectation.inject_expectation_type === 'TECHNICAL') {
        return `${t('Blocked')} (${expectation.inject_expectation_score})`;
      }
      return `${t('Validated')} (${expectation.inject_expectation_score})`;
    }

    if (expectation.inject_expectation_type === 'ARTICLE') {
      return t('Pending reading');
    }
    if (expectation.inject_expectation_type === 'CHALLENGE') {
      return t('Pending submission');
    }
    if (expectation.inject_expectation_type === 'TECHNICAL') {
      return t('Pending');
    }

    return null;
  };

  const color = () => {
    if (isFail()) {
      return colorStyles.orange;
    }
    return result
      ? colorStyles.green
      : colorStyles.grey;
  };

  return (
    <>
      <Chip
        classes={{ root: classes.points }}
        label={expectation.inject_expectation_expected_score}
      />
      <Chip
        classes={{ root: classes.chipInList }}
        style={color()}
        label={label()}
      />
    </>
  );
};

export default ResultChip;
