import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { Grid, List, ListItemButton, ListItemText, Paper } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useAppDispatch } from '../../../../utils/hooks';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import type { AtomicTestingOutput, InjectTargetWithResult } from '../../../../utils/api-types';
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
  resultDetail: {
    padding: 30,
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

  const [selectedTarget, setSelectedTarget] = useState<InjectTargetWithResult>();

  const filtering = useSearchAnFilter('', 'name', ['name']);

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
      setSelectedTarget(atomic.atomic_targets[0]);
    }
  }, [atomic]);

  const sortedTargets: InjectTargetWithResult[] = filtering.filterAndSort(atomic.atomic_targets);

  // handles
  const handleTargetClick = (target: InjectTargetWithResult) => {
    setSelectedTarget(target);
  };

  return (
    <>
      <Grid container spacing={2} classes={{ root: classes.container }}>
        <Grid item xs={12}>
          <ResponsePie expectations={atomic.atomic_expectation_results}/>
        </Grid>
      </Grid>
      <Grid container spacing={2} classes={{ root: classes.container }}>
        <Grid item xs={5} style={{ paddingBottom: 24 }}>
          <div style={{ padding: 10 }}>
            <SearchFilter
              fullWidth
              small
              onChange={filtering.handleSearch}
              keyword={filtering.keyword}
              placeholder={'Search by target name'}
            />
          </div>
          {sortedTargets.length > 0 ? (
            <List style={{ paddingTop: 10 }}>
              {sortedTargets.map((target) => <Paper elevation={3} style={{ marginBottom: 10 }} key={target?.id}>
                <ListItemButton
                  key={target?.id}
                  onClick={() => handleTargetClick(target)}
                >
                  <ListItemText
                    primary={
                      <div>
                        <div className={classes.bodyTarget} style={{ width: '30%' }}>
                          {`${target?.name}`}
                          <span style={{ color: 'gray', marginLeft: 10 }}>
                            [{t(target?.targetType?.toLowerCase())}]
                          </span>
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
              </Paper>)}
            </List>
          ) : (
            <Empty message={t('No targets available')}/>
          )}
        </Grid>
        <Grid item xs={7} style={{ paddingBottom: 24 }}>
          <Paper variant="outlined" classes={{ root: classes.resultDetail }}>
            {selectedTarget && <TargetResultsDetail target={selectedTarget} injectId={atomicId}
              lastExecutionStartDate={atomic.atomic_last_execution_start_date || ''}
              lastExecutionEndDate={atomic.atomic_last_execution_end_date || ''}
                               />}
            {!selectedTarget && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: 300,
                height: 350,
              }}
              >
                {!selectedTarget && (
                <Empty message={t('No target data available')}/>
                )}
              </div>
            )}
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default AtomicTesting;
