import React, { FunctionComponent, ReactElement } from 'react';
import { Chip, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { makeStyles } from '@mui/styles';
import colorStyles from '../../../../components/Color';
import { useFormatter } from '../../../../components/i18n';
import type { InjectExpectationsStore } from '../injects/expectations/Expectation';
import type { Theme } from '../../../../components/Theme';

const useStyles = makeStyles((theme: Theme) => ({
  item: {
    height: 40,
  },
  container: {
    display: 'flex',
    placeContent: 'space-between',
    fontSize: theme.typography.h3.fontSize,
  },
  chip: {
    display: 'flex',
    gap: theme.spacing(2),
  },
  details: {
    display: 'flex',
  },
  info: {
    width: '200px',
  },
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
  info?: string;
  title: string;
  icon: ReactElement;
  onClick?: () => void;
}

const ExpectationLine: FunctionComponent<Props> = ({
  expectation,
  info,
  title,
  icon,
  onClick,
}) => {
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
      <ListItem
        key={expectation.injectexpectation_id}
        divider
        sx={{ pl: 8 }}
        classes={{ root: classes.item }}
        button={!!onClick}
        onClick={onClick}
      >
        <ListItemIcon>
          {icon}
        </ListItemIcon>
        <ListItemText
          primary={
            <div className={classes.container}>
              <div className={classes.details}>
                <div className={classes.info}> {info} </div>
                {title}
              </div>
              <div className={classes.chip}>
                <Chip
                  classes={{ root: classes.points }}
                  label={expectation.inject_expectation_expected_score}
                />
                <Chip
                  classes={{ root: classes.chipInList }}
                  style={color()}
                  label={label()}
                />
              </div>
            </div>
          }
        />
      </ListItem>
    </>
  );
};

export default ExpectationLine;
