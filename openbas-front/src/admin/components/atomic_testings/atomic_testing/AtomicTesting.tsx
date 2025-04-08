import { Divider, Grid, List, Paper, Typography } from '@mui/material';
import { Fragment, useContext, useEffect, useState } from 'react';
import { makeStyles } from 'tss-react/mui';

import Empty from '../../../../components/Empty';
import { useFormatter } from '../../../../components/i18n';
import Loader from '../../../../components/Loader';
import SearchFilter from '../../../../components/SearchFilter';
import { type InjectTargetWithResult } from '../../../../utils/api-types';
import useSearchAnFilter from '../../../../utils/SortingFiltering';
import ResponsePie from '../../common/injects/ResponsePie';
import { InjectResultOverviewOutputContext, type InjectResultOverviewOutputContextType } from '../InjectResultOverviewOutputContext';
import AtomicTestingInformation from './AtomicTestingInformation';
import TargetListItem from './TargetListItem';
import TargetResultsDetail from './TargetResultsDetail';

const useStyles = makeStyles()(() => ({
  chip: {
    fontSize: 12,
    height: 25,
    margin: '0 7px 7px 0',
    textTransform: 'uppercase',
    borderRadius: 4,
    width: 180,
  },
  gridContainer: { marginBottom: 20 },
  paper: {
    height: '100%',
    minHeight: '100%',
    padding: 15,
    borderRadius: 4,
  },
  dividerL: {
    position: 'absolute',
    backgroundColor: 'rgba(105, 103, 103, 0.45)',
    width: '2px',
    bottom: '0',
    height: '99%',
    left: '-10px',
  },
}));

const AtomicTesting = () => {
  // Standard hooks
  const { classes } = useStyles();
  const { t } = useFormatter();
  const [selectedTarget, setSelectedTarget] = useState<InjectTargetWithResult>();
  const [currentParentTarget, setCurrentParentTarget] = useState<InjectTargetWithResult>();
  const [upperParentTarget, setUpperParentTarget] = useState<InjectTargetWithResult>();
  const filtering = useSearchAnFilter('', 'name', ['name']);

  // Fetching data
  const { injectResultOverviewOutput } = useContext<InjectResultOverviewOutputContextType>(InjectResultOverviewOutputContext);
  useEffect(() => {
    setSelectedTarget(selectedTarget || currentParentTarget || injectResultOverviewOutput?.inject_targets ? injectResultOverviewOutput?.inject_targets[0] : undefined);
  }, [injectResultOverviewOutput]);

  const sortedTargets: InjectTargetWithResult[] = filtering.filterAndSort(injectResultOverviewOutput?.inject_targets ?? []);

  // Handles

  const handleTargetClick = (target: InjectTargetWithResult, currentParent?: InjectTargetWithResult, upperParentTarget?: InjectTargetWithResult) => {
    setSelectedTarget(target);
    setCurrentParentTarget(currentParent);
    setUpperParentTarget(upperParentTarget);
  };

  const renderTargetItem = (target: InjectTargetWithResult, parent: InjectTargetWithResult | undefined, upperParent: InjectTargetWithResult | undefined) => {
    return (
      <>
        <TargetListItem
          onClick={() => handleTargetClick(target, parent, upperParent)}
          target={target}
          selected={selectedTarget?.id === target.id && currentParentTarget?.id === parent?.id && upperParentTarget?.id === upperParent?.id}
        />
        {target?.children && target.children.length > 0 && (
          <List disablePadding style={{ marginLeft: 15 }}>
            {target.children.map(child => (
              <Fragment key={child?.id}>
                {renderTargetItem(child, target, parent)}
              </Fragment>
            ))}
            <Divider className={classes.dividerL} />
          </List>
        )}
      </>
    );
  };

  if (!injectResultOverviewOutput) {
    return <Loader variant="inElement" />;
  }

  return (
    <Grid
      container
      spacing={3}
      classes={{ container: classes.gridContainer }}
    >
      <Grid item xs={6} style={{ paddingTop: 10 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 1 }}>
          {t('Information')}
        </Typography>
        <AtomicTestingInformation injectResultOverviewOutput={injectResultOverviewOutput} />
      </Grid>
      <Grid item xs={6} style={{ paddingTop: 10 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 1 }}>
          {t('Results')}
        </Typography>
        <Paper
          classes={{ root: classes.paper }}
          variant="outlined"
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ResponsePie expectationResultsByTypes={injectResultOverviewOutput.inject_expectation_results} />
        </Paper>
      </Grid>
      <Grid item xs={6} style={{ marginTop: 30 }}>
        <Typography variant="h4" gutterBottom style={{ float: 'left' }} sx={{ mb: 1 }}>
          {t('Targets')}
        </Typography>
        <div style={{
          float: 'right',
          marginTop: -15,
        }}
        >
          <SearchFilter
            onChange={filtering.handleSearch}
            keyword={filtering.keyword}
            placeholder={t('Search by target name')}
            variant="thin"
          />
        </div>
        <div className="clearfix" />
        <Paper classes={{ root: classes.paper }} variant="outlined">
          {sortedTargets.length > 0 ? (
            <List>
              {sortedTargets.map(target => (
                <div key={target?.id}>
                  {renderTargetItem(target, undefined, undefined)}
                </div>
              ))}
            </List>
          ) : (
            <Empty message={t('No target configured.')} />
          )}
        </Paper>
      </Grid>
      <Grid item xs={6} style={{ marginTop: 29 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 1 }}>
          {t('Results by target')}
        </Typography>
        <Paper classes={{ root: classes.paper }} variant="outlined">
          {selectedTarget && !!injectResultOverviewOutput.inject_type && (
            <TargetResultsDetail
              inject={injectResultOverviewOutput}
              upperParentTargetId={upperParentTarget?.id}
              parentTargetId={currentParentTarget?.id}
              target={selectedTarget}
              lastExecutionStartDate={injectResultOverviewOutput.inject_status?.tracking_sent_date || ''}
              lastExecutionEndDate={injectResultOverviewOutput.inject_status?.tracking_end_date || ''}
            />
          )}
          {!selectedTarget && (
            <Empty message={t('No target data available.')} />
          )}
        </Paper>
      </Grid>
    </Grid>
  )
  ;
};

export default AtomicTesting;
