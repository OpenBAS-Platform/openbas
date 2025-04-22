import { Divider, GridLegacy, List, Paper, Tab, Tabs, Typography } from '@mui/material';
import { Fragment, type SyntheticEvent, useContext, useEffect, useMemo, useState } from 'react';
import { makeStyles } from 'tss-react/mui';

import { searchTargets } from '../../../../actions/injects/inject-action';
import PaginationComponentV2 from '../../../../components/common/queryable/pagination/PaginationComponentV2';
import { buildSearchPagination } from '../../../../components/common/queryable/QueryableUtils';
import { useQueryable } from '../../../../components/common/queryable/useQueryableWithLocalStorage';
import Empty from '../../../../components/Empty';
import { useFormatter } from '../../../../components/i18n';
import Loader from '../../../../components/Loader';
import SearchFilter from '../../../../components/SearchFilter';
import { type InjectTarget, type InjectTargetWithResult } from '../../../../utils/api-types';
import useSearchAnFilter from '../../../../utils/SortingFiltering';
import ResponsePie from '../../common/injects/ResponsePie';
import { InjectResultOverviewOutputContext, type InjectResultOverviewOutputContextType } from '../InjectResultOverviewOutputContext';
import AtomicTestingInformation from './AtomicTestingInformation';
import NewTargetListItem from './NewTargetListItem';
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
  tabs: { marginLeft: 'auto' },
}));

const AtomicTesting = () => {
  // Standard hooks
  const { classes } = useStyles();
  const { t } = useFormatter();
  const [selectedTargetLegacy, setSelectedTargetLegacy] = useState<InjectTargetWithResult>();
  const [selectedTarget, setSelectedTarget] = useState<InjectTarget>();
  const [targets, setTargets] = useState<InjectTarget[]>();
  const [currentParentTarget, setCurrentParentTarget] = useState<InjectTargetWithResult>();
  const [upperParentTarget, setUpperParentTarget] = useState<InjectTargetWithResult>();
  const filtering = useSearchAnFilter('', 'name', ['name']);
  const [activeTab, setActiveTab] = useState(0);

  // Fetching data
  const { injectResultOverviewOutput } = useContext<InjectResultOverviewOutputContextType>(InjectResultOverviewOutputContext);

  const sortedTargets: InjectTargetWithResult[] = filtering.filterAndSort(injectResultOverviewOutput?.inject_targets ?? []);

  const [hasAssetsGroup, setHasAssetsGroup] = useState(false);
  const [hasAssetsGroupChecked, setHasAssetsGroupChecked] = useState(false);

  const tabConfig = useMemo(() => {
    let index = 0;
    const tabs = [];

    if (hasAssetsGroup) {
      tabs.push({
        key: index++,
        label: t('Asset groups'),
        type: 'ASSETS_GROUPS',
        entityPrefix: 'asset_group_target',
      });
    }

    tabs.push({
      key: index++,
      label: t('All targets'),
      type: 'ALL_TARGETS',
    });

    return tabs;
  }, [hasAssetsGroup, t]);

  const { queryableHelpers, searchPaginationInput } = useQueryable(buildSearchPagination({
    filterGroup: {
      mode: 'and',
      filters: [],
    },
  }));

  const injectId = injectResultOverviewOutput?.inject_id || '';

  useEffect(() => {
    if (!injectResultOverviewOutput) return;

    setSelectedTargetLegacy(
      selectedTargetLegacy
      || currentParentTarget
      || injectResultOverviewOutput?.inject_targets?.[0],
    );

    const searchPaginationInput1Result = {
      ...searchPaginationInput,
      size: 1,
    };

    searchTargets(injectId, 'ASSETS_GROUPS', searchPaginationInput1Result)
      .then((response) => {
        if (response.data.content.length > 0) {
          setHasAssetsGroup(true);
        }
      })
      .finally(() => {
        setHasAssetsGroupChecked(true);
      });
  }, [injectResultOverviewOutput]);

  useEffect(() => {
    if (!hasAssetsGroupChecked || !injectResultOverviewOutput || tabConfig[0].type == 'ALL_TARGETS') return;

    searchTargets(injectId, tabConfig[0].type, searchPaginationInput)
      .then((response) => {
        setTargets(response.data);
        setSelectedTarget(response.data);
      });
  }, [hasAssetsGroupChecked, injectResultOverviewOutput]);

  // Handles

  const handleTargetClick = (target: InjectTargetWithResult, currentParent?: InjectTargetWithResult, upperParentTarget?: InjectTargetWithResult) => {
    setSelectedTargetLegacy(target);
    setCurrentParentTarget(currentParent);
    setUpperParentTarget(upperParentTarget);
  };

  const handleNewTargetClick = (target: InjectTarget) => {
    // TODO: handle the platform type for Endpoint targets
    setSelectedTargetLegacy({
      id: target.target_id,
      name: target.target_name,
      targetType: target.target_type,
      platformType: undefined,
    });
  };

  const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const renderTargetItem = (target: InjectTargetWithResult, parent: InjectTargetWithResult | undefined, upperParent: InjectTargetWithResult | undefined) => {
    return (
      <>
        <TargetListItem
          onClick={() => handleTargetClick(target, parent, upperParent)}
          target={target}
          selected={selectedTargetLegacy?.id === target.id && currentParentTarget?.id === parent?.id && upperParentTarget?.id === upperParent?.id}
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
    <GridLegacy
      container
      spacing={3}
      classes={{ container: classes.gridContainer }}
    >
      <GridLegacy item xs={6} style={{ paddingTop: 10 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 1 }}>
          {t('Information')}
        </Typography>
        <AtomicTestingInformation injectResultOverviewOutput={injectResultOverviewOutput} />
      </GridLegacy>
      <GridLegacy item xs={6} style={{ paddingTop: 10 }}>
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
      </GridLegacy>
      <GridLegacy item xs={6} style={{ marginTop: 30 }}>
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
          {hasAssetsGroupChecked && (
            <>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                className={classes.tabs}
              >
                {tabConfig
                  .map(tab => (
                    <Tab key={`tab-${tab.key}`} label={tab.label} />
                  ))}
              </Tabs>
              {tabConfig
                .map((tab) => {
                  const isAllTargets = tab.type === 'ALL_TARGETS';
                  return (
                    <div key={`tab-${tab.key}`} hidden={activeTab !== tab.key}>
                      {!isAllTargets && (
                        <>
                          <PaginationComponentV2
                            fetch={input => searchTargets(injectResultOverviewOutput?.inject_id, tab.type, input)}
                            searchPaginationInput={searchPaginationInput}
                            setContent={setTargets}
                            entityPrefix={tab.entityPrefix}
                            queryableHelpers={queryableHelpers}
                            topPagination={true}
                          />
                          {targets && targets.length > 0 ? (
                            <List>
                              {targets.map(target => (
                                <NewTargetListItem
                                  onClick={() => handleNewTargetClick(target)}
                                  target={target}
                                  selected={selectedTarget?.target_id === target.target_id}
                                  key={target?.target_id}
                                />
                              ))}
                            </List>
                          ) : (
                            <Empty message={t('No target configured.')} />
                          )}
                        </>
                      )}

                      {isAllTargets && (
                        <>
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
                        </>
                      )}
                    </div>
                  );
                })}
            </>
          )}
        </Paper>
      </GridLegacy>
      <GridLegacy item xs={6} style={{ marginTop: 29 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 1 }}>
          {t('Results by target')}
        </Typography>
        <Paper classes={{ root: classes.paper }} variant="outlined">
          {selectedTargetLegacy && !!injectResultOverviewOutput.inject_type && (
            <TargetResultsDetail
              inject={injectResultOverviewOutput}
              upperParentTargetId={upperParentTarget?.id}
              parentTargetId={currentParentTarget?.id}
              target={selectedTargetLegacy}
              lastExecutionStartDate={injectResultOverviewOutput.inject_status?.tracking_sent_date || ''}
              lastExecutionEndDate={injectResultOverviewOutput.inject_status?.tracking_end_date || ''}
            />
          )}
          {!selectedTargetLegacy && (
            <Empty message={t('No target data available.')} />
          )}
        </Paper>
      </GridLegacy>
    </GridLegacy>
  )
  ;
};

export default AtomicTesting;
