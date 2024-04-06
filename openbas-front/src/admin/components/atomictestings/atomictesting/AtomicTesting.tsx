import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { Grid, List, ListItemButton, ListItemText, Paper } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useAppDispatch } from '../../../../utils/hooks';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import type { AtomicTestingOutput, TargetResult } from '../../../../utils/api-types';
import type { AtomicTestingHelper } from '../../../../actions/atomictestings/atomic-testing-helper';
import { fetchAtomicTesting } from '../../../../actions/atomictestings/atomic-testing-actions';
import ResponsePie from '../../components/atomictestings/ResponsePie';
import Empty from '../../../../components/Empty';
import { useFormatter } from '../../../../components/i18n';
import AtomicTestingResult from '../../components/atomictestings/AtomicTestingResult';
import TargetResultsDetail from '../../components/atomictestings/TargetResultsDetail';
import SearchFilter from '../../../../components/SearchFilter';
import useSearchAnFilter from '../../../../utils/SortingFiltering';

const useStyles = makeStyles(() => ({
  paper: {
    padding: 50,
    height: '100%',
  },
  container: {
    padding: '20px',
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

  const [allTargets, setAllTargets] = useState<TargetResult[]>([]);
  const [sortedTargets, setSortedTargets] = useState<TargetResult[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string>('');

  const filtering = useSearchAnFilter('target', 'name');

  // Fetching data
  const { atomic }: {
    atomic: AtomicTestingOutput,
  } = useHelper((helper: AtomicTestingHelper) => ({
    atomic: helper.getAtomicTesting(atomicId),
  }));
  useDataLoader(() => {
    dispatch(fetchAtomicTesting(atomicId));
  });

  // Effects
  useEffect(() => {
    if (atomic && atomic.atomic_targets) {
      setAllTargets(atomic.atomic_targets.flatMap((target) => target.targetResults) || []);
      setSortedTargets(allTargets.concat(allTargets));
      setSelectedTarget(sortedTargets[0]?.id);
    }
  }, [atomic]);

  return (
    <>
      <Grid container spacing={2} classes={{ root: classes.container }}>
        <Grid item xs={12}>
          <ResponsePie expectations={atomic.atomic_expectation_results}/>
        </Grid>
      </Grid>
      <Grid container spacing={2} classes={{ root: classes.container }}>
        <Grid item xs={4} style={{ paddingBottom: 24 }}>
          <div style={{ padding: 10 }}>
            <SearchFilter
              small
              fullWidth
              onChange={filtering.handleSearch}
              keyword={filtering.keyword}
              placeholder={'Search by target name'}
            />
          </div>
          {sortedTargets.length > 0 ? (
            <List style={{ paddingTop: 10 }}>
              {sortedTargets.map((target) => (
                <ListItemButton
                  key={target?.id}
                  dense={true}
                  divider={true}
                  onClick={() => setSelectedTarget(target.id || '')}
                >
                  <ListItemText
                    primary={
                      <div>
                          <div className={classes.bodyTarget} style={{ width: '30%' }}>
                            {target?.name}
                          </div>
                          <div style={{ float: 'right' }}>
                            <AtomicTestingResult
                              expectations={target?.expectationResultsByTypes}
                            />
                          </div>
                        </div>
                            }
                  />
                </ListItemButton>
              ))}
            </List>
          ) : (
            <Empty message={t('No targets in this atomic testing.')}/>
          )}
        </Grid>
        <Grid item xs={8} style={{ paddingBottom: 24 }}>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <TargetResultsDetail targetId={selectedTarget}/>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default AtomicTesting;
