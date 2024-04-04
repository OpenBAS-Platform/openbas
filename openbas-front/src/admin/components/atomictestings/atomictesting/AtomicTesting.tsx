import { Link, useParams } from 'react-router-dom';
import React from 'react';
import { Grid, List, ListItem, ListItemText, Paper } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useAppDispatch } from '../../../../utils/hooks';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import type { AtomicTestingOutput } from '../../../../utils/api-types';
import type { AtomicTestingHelper } from '../../../../actions/atomictestings/atomic-testing-helper';
import { fetchAtomicTesting } from '../../../../actions/atomictestings/atomic-testing-actions';
import ResponsePie from '../../components/atomictestings/ResponsePie';
import Empty from '../../../../components/Empty';
import { useFormatter } from '../../../../components/i18n';
import AtomicTestingResult from '../../components/atomictestings/AtomicTestingResult';

const useStyles = makeStyles(() => ({
  paper: {
    padding: 50,
    height: '100%',
  },
  container: {
    marginBottom: '20px',
  },
  bodyTarget: {
    float: 'left',
    height: 25,
    fontSize: 13,
    lineHeight: '25px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    verticalAlign: 'middle',
    textOverflow: 'ellipsis',
  },
}));

const AtomicTesting = () => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();
  const dispatch = useAppDispatch();

  const { atomicId } = useParams() as { atomicId: AtomicTestingOutput['atomic_id'] };

  // Fetching data
  const { atomic }: {
    atomic: AtomicTestingOutput,
  } = useHelper((helper: AtomicTestingHelper) => ({
    atomic: helper.getAtomicTesting(atomicId),
  }));

  useDataLoader(() => {
    dispatch(fetchAtomicTesting(atomicId));
  });

  const allTargets = atomic.atomic_targets.flatMap((target) => target.targets);

  return (
    <>
      <Grid container spacing={2} classes={{ root: classes.container }}>
        <Grid item xs={12}>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <ResponsePie expectations={atomic.atomic_expectation_results}/>
          </Paper>
        </Grid>
      </Grid>
      <Grid container spacing={2} classes={{ root: classes.container }}>
        <Grid item xs={4} style={{ paddingBottom: 24 }}>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            {allTargets.length > 0 ? (
              <List style={{ paddingTop: 0 }}>
                {allTargets.map((target) => (
                  <ListItem
                    key={target?.id}
                    dense={true}
                    button={true}
                    divider={true}
                    component={Link}
                  >
                    <ListItemText
                      primary={
                          <div>
                            <div className={classes.bodyTarget} style={{ width: '30%' }}>
                              {target?.name}
                            </div>
                            <div style={{ float: 'right' }}>
                              <AtomicTestingResult expectations={target?.expectationResults}/>
                            </div>
                          </div>
                              }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Empty message={t('No targets in this atomic testing.')}/>
            )}
          </Paper>
        </Grid>
        <Grid item xs={8} style={{ paddingBottom: 24 }}>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default AtomicTesting;
