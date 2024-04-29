import { Link } from 'react-router-dom';
import { Button, ListItemText, Menu, MenuItem, Typography } from '@mui/material';
import React, { FunctionComponent, useState } from 'react';
import { makeStyles } from '@mui/styles';
import type { AttackPattern } from '../../../../utils/api-types';
import type { ExerciseInjectExpectationResultsByTypeStore, InjectExpectationResultsByTypeStore } from '../../../../actions/exercises/Exercise';
import type { Theme } from '../../../../components/Theme';
import { useHelper } from '../../../../store';
import type { InjectHelper } from '../../../../actions/injects/inject-helper';
import AtomicTestingResult from '../../atomic_testings/atomic_testing/AtomicTestingResult';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    whiteSpace: 'nowrap',
    width: '100%',
    textTransform: 'capitalize',
    color: theme.palette.chip.main,
    backgroundColor: '#212734',
  },
  buttonText: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    margin: 4,
  },
}));

interface AttackPatternBoxProps {
  goToLink?: string;
  attackPattern: AttackPattern;
  injectResult: ExerciseInjectExpectationResultsByTypeStore | undefined;
}

const AttackPatternBox: FunctionComponent<AttackPatternBoxProps> = ({
  goToLink,
  attackPattern,
  injectResult,
}) => {
  // Standard hooks
  const classes = useStyles();

  // Fetching data
  const { injectsMap } = useHelper((helper: InjectHelper) => ({
    injectsMap: helper.getInjectsMap(),
  }));

  const [open, setOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const results: InjectExpectationResultsByTypeStore[] = injectResult?.inject_expectation_results ?? [];

  if (results.length === 1) {
    const content = () => (
      <div className={classes.buttonText}>
        <Typography variant="caption">
          {attackPattern.attack_pattern_name}
        </Typography>
        <AtomicTestingResult expectations={injectResult?.inject_expectation_results?.[0].results ?? []} />
      </div>
    );

    if (goToLink) {
      return (
        <Button
          key={attackPattern.attack_pattern_id}
          className={classes.button}
          component={Link}
          to={goToLink ?? ''}
        >
          {content()}
        </Button>
      );
    }

    return (
      <div
        key={attackPattern.attack_pattern_id}
        style={{ padding: '6px 8px' }}
        className={classes.button}
      >
        {content()}
      </div>
    );
  }

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation();
    setOpen(true);
    setAnchorEl(event.currentTarget);
  };
  return (
    <>
      <Button
        className={classes.button}
        onClick={(event) => handleOpen(event)}
      >
        <div className={classes.buttonText}>
          <Typography variant="caption">
            {attackPattern.attack_pattern_name}
          </Typography>
        </div>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {results?.map((result, idx) => {
          const inject = injectsMap[result.inject ?? ''];

          const content = () => (
            <>
              <ListItemText primary={inject.inject_title} />
              <AtomicTestingResult expectations={result.results ?? []} />
            </>
          );

          if (goToLink) {
            return (
              <MenuItem
                key={`inject-result-${idx}`}
                component={Link}
                to={goToLink ?? ''}
                style={{ display: 'flex', gap: 8 }}
              >
                {content()}
              </MenuItem>
            );
          }

          return (
            <MenuItem
              key={`inject-result-${idx}`}
              style={{ display: 'flex', gap: 8 }}
            >
              {content()}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export default AttackPatternBox;
