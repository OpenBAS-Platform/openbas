import { ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { FunctionComponent, ReactElement } from 'react';

import type { Theme } from '../../../../../../components/Theme';
import type { InjectExpectationsStore } from '../../../../common/injects/expectations/Expectation';
import ResultChip from './ResultChip';

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
}));

interface Props {
  expectation: InjectExpectationsStore;
  info?: string;
  title: string;
  icon: ReactElement;
  onClick?: () => void;
  gap?: number;
}

const ExpectationLine: FunctionComponent<Props> = ({
  expectation,
  info,
  title,
  icon,
  onClick,
  gap,
}) => {
  // Standard hooks
  const classes = useStyles();

  return (
    <>
      <ListItem
        key={expectation.inject_expectation_id}
        divider
        sx={{ pl: gap ?? 8 }}
        classes={{ root: classes.item }}
        /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
        // @ts-ignore
        button={!!onClick}
        onClick={onClick}
      >
        <ListItemIcon>
          {icon}
        </ListItemIcon>
        <ListItemText
          primary={(
            <div className={classes.container}>
              <div className={classes.details}>
                <div style={{ width: gap ? 135 : 200 }}>
                  {' '}
                  {info}
                  {' '}
                </div>
                {title}
              </div>
              <div className={classes.chip}>
                <ResultChip expectation={expectation} />
              </div>
            </div>
          )}
        />
      </ListItem>
    </>
  );
};

export default ExpectationLine;
