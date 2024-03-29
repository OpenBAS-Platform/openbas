import React from 'react';
import { Shield, TrackChanges, SensorOccupied, Help, HorizontalRule } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
  inline: {
    display: 'flex',
    flexDirection: 'row',
    padding: 0,
  },
}));

interface Expectation {
  type: string;
  result: string;
}

interface Props {
  expectations: Expectation[];
}

const AtomicTestingResult: React.FC<Props> = ({ expectations }) => {
  const classes = useStyles();
  let color = null;
  if (expectations.length === 0) {
    return <HorizontalRule />;
  }
  return (
    <div className={classes.inline}>
      {expectations.map((expectation, index) => {
        if (expectation.result === 'SUCCESS') {
          color = '#4caf50';
        } else if (expectation.result === 'ERROR') {
          color = '#d51304';
        } else {
          color = '#ff9800';
        }
        if (expectation.type === 'PREVENTION') {
          return (
            <span key={index}>
              <Shield style={{ color }} />
            </span>
          );
        }
        if (expectation.type === 'DETECTION') {
          return (
            <span key={index}>
              <TrackChanges style={{ color }} />
            </span>
          );
        }
        if (expectation.type === 'ARTICLE' || expectation.type === 'CHALLENGE' || expectation.type === 'MANUAL') {
          return (
            <span key={index}>
              <SensorOccupied style={{ color }} />
            </span>
          );
        }
        return (
          <span key={index}>
            <Help style={{ color: '#d9d9d9' }} />
          </span>
        );
      })}
    </div>
  );

  /* return (
    <div>
      <List className={classes.inline}>
        <ListItem>
          if(st){

        }
          <ListItemText primary="foo1" secondary="bar1" />
        </ListItem>
        <ListItem>
          <ListItemText primary="foo2" secondary="bar2" />
        </ListItem>
      </List>
    </div>
  ); */

  /* expectations.forEach((expectation) => {
    if (expectation.result === 'SUCCESS') {
      color = '#4caf50';
    } else if (expectation.result === 'ERROR') {
      color = '#f44336';
    } else {
      color = '#ff9800';
    }
  }); */

  /* if (result === 'SUCCESS') {
    color = '#4caf50';
  } else if (result === 'ERROR') {
    color = '#f44336';
  } else {
    color = '#ff9800';
  } */

  /* switch (stringObjectMap.k) {
    case 'PREVENTION':
      return (
        <Shield style={{ color }} />
      );
    case 'DETECTION':
      return (
        <TrackChanges style={{ color }} />
      );
    case 'ARTICLE' || 'CHALLENGE' || 'MANUAL':
      return (
        <SensorOccupied style={{ color }} />
      );
    default:
      return <HelpOutlined style={{ color }} />;
  } */
};

export default AtomicTestingResult;
