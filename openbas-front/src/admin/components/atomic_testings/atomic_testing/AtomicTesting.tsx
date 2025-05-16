import { Divider, Grid, List, Paper, Tab, Tabs, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Fragment, type SyntheticEvent, useContext, useEffect, useMemo, useState } from 'react';
import { makeStyles } from 'tss-react/mui';

import { searchTargets } from '../../../../actions/injects/inject-action';
import Empty from '../../../../components/Empty';
import { useFormatter } from '../../../../components/i18n';
import Loader from '../../../../components/Loader';
import { type InjectTarget, type InjectTargetWithResult, type SearchPaginationInput } from '../../../../utils/api-types';
import useSearchAnFilter from '../../../../utils/SortingFiltering';
import { InjectResultOverviewOutputContext, type InjectResultOverviewOutputContextType } from '../InjectResultOverviewOutputContext';
import PaginatedTargetTab from './PaginatedTargetTab';
import TargetListItem from './TargetListItem';
import TargetResultsDetail from './TargetResultsDetail';

const useStyles = makeStyles()({
  chip: {
    fontSize: 12,
    height: 25,
    margin: '0 7px 7px 0',
    textTransform: 'uppercase',
    borderRadius: 4,
    width: 180,
  },
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
});

const AtomicTesting = () => {
  // Standard hooks
  const { classes } = useStyles();
  const theme = useTheme();
  const { t } = useFormatter();
  const [selectedTargetLegacy, setSelectedTargetLegacy] = useState<InjectTargetWithResult & { mergedExpectations: boolean }>();
  const [currentParentTarget, setCurrentParentTarget] = useState<InjectTargetWithResult>();
  const [upperParentTarget, setUpperParentTarget] = useState<InjectTargetWithResult>();
  const filtering = useSearchAnFilter('', 'name', ['name']);
  const [activeTab, setActiveTab] = useState(0);

  // Fetching data
  const { injectResultOverviewOutput } = useContext<InjectResultOverviewOutputContextType>(InjectResultOverviewOutputContext);

  const sortedTargets: InjectTargetWithResult[] = filtering.filterAndSort(injectResultOverviewOutput?.inject_targets ?? []);

  const [hasAssetsGroup, setHasAssetsGroup] = useState(false);
  const [hasAssetsGroupChecked, setHasAssetsGroupChecked] = useState(false);
  const [hasEndpoints, setHasEndpoints] = useState(false);
  const [hasEndpointsChecked, setHasEndpointsChecked] = useState(false);
  const [reloadContentCount, setReloadContentCount] = useState(0);
  const [hasTeams, setHasTeams] = useState(false);
  const [hasTeamsChecked, setHasTeamsChecked] = useState(false);
  const [hasPlayers, setHasPlayers] = useState(false);
  const [hasPlayersChecked, setHasPlayersChecked] = useState(false);

  const tabConfig: {
    key: number;
    label: string;
    type: string;
    entityPrefix: string;
  }[] = useMemo(() => {
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
    if (hasTeams) {
      tabs.push({
        key: index++,
        label: t('Teams'),
        type: 'TEAMS',
        entityPrefix: 'team_target',
      });
    }
    if (hasEndpoints) {
      tabs.push({
        key: index++,
        label: t('Endpoints'),
        type: 'ASSETS',
        entityPrefix: 'endpoint_target',
      });
    }
    if (hasPlayers) {
      tabs.push({
        key: index++,
        label: t('Players'),
        type: 'PLAYERS',
        entityPrefix: 'player_target',
      });
    }

    tabs.push({
      key: index++,
      label: t('All targets'),
      type: 'ALL_TARGETS',
      entityPrefix: '',
    });

    return tabs;
  }, [hasAssetsGroup, hasTeams, hasEndpoints, hasPlayers]);

  const injectId = injectResultOverviewOutput?.inject_id || '';

  useEffect(() => {
    if (!injectResultOverviewOutput) return;

    const searchPaginationInput1Result: SearchPaginationInput = {
      filterGroup: {
        mode: 'and',
        filters: [],
      },
      size: 1,
      page: 0,
    };

    searchTargets(injectId, 'ASSETS_GROUPS', searchPaginationInput1Result)
      .then((response) => {
        if (response.data.content.length > 0) {
          setHasAssetsGroup(true);
        } else { setHasAssetsGroup(false); }
      })
      .finally(() => {
        setHasAssetsGroupChecked(true);
      });

    searchTargets(injectId, 'ASSETS', searchPaginationInput1Result)
      .then((response) => {
        if (response.data.content.length > 0) {
          setHasEndpoints(true);
        } else { setHasEndpoints(false); }
      })
      .finally(() => {
        setHasEndpointsChecked(true);
      });

    searchTargets(injectId, 'TEAMS', searchPaginationInput1Result)
      .then((response) => {
        if (response.data.content.length > 0) {
          setHasTeams(true);
        } else { setHasTeams(false); }
      })
      .finally(() => {
        setHasTeamsChecked(true);
      });

    searchTargets(injectId, 'PLAYERS', searchPaginationInput1Result)
      .then((response) => {
        if (response.data.content.length > 0) {
          setHasPlayers(true);
        } else { setHasPlayers(false); }
      })
      .finally(() => {
        setHasPlayersChecked(true);
      });

    setReloadContentCount(reloadContentCount + 1);
    setActiveTab(0);
  }, [injectResultOverviewOutput]);

  // Handles

  const handleTargetClick = (target: InjectTargetWithResult, currentParent?: InjectTargetWithResult, upperParentTarget?: InjectTargetWithResult) => {
    setSelectedTargetLegacy({
      ...target,
      mergedExpectations: false,
    });
    setCurrentParentTarget(currentParent);
    setUpperParentTarget(upperParentTarget);
  };

  const handleNewTargetClick = (target: InjectTarget) => {
    setSelectedTargetLegacy({
      id: target.target_id,
      name: target.target_name,
      targetType: target.target_type,
      // @ts-expect-error target_subtype is always within the allowed values
      platformType: target.target_subtype,
      mergedExpectations: true,
    });

    setCurrentParentTarget(undefined);
    setUpperParentTarget(undefined);
  };

  const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setReloadContentCount(reloadContentCount + 1);

    if (tabConfig[newValue].type == 'ALL_TARGETS') {
      handleTargetClick(sortedTargets[0]);
    }
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
          <List disablePadding style={{ marginLeft: theme.spacing(2) }}>
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

  const drawTabs = () => {
    const tab = tabConfig.find(value => value.key == activeTab);
    if (!tab) {
      return (<div />);
    }
    const isAllTargets = tab.type === 'ALL_TARGETS';
    return (
      <>
        {!isAllTargets && injectResultOverviewOutput && (
          <PaginatedTargetTab
            key={activeTab}
            handleSelectTarget={handleNewTargetClick}
            entityPrefix={tab.entityPrefix}
            inject_id={injectResultOverviewOutput.inject_id}
            target_type={tab.type}
            reloadContentCount={reloadContentCount}
          />
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
      </>
    );
  };

  if (!injectResultOverviewOutput) {
    return <Loader variant="inElement" />;
  }

  return (
    <Grid container spacing={3} style={{ marginBottom: theme.spacing(3) }}>
      <Grid size={6}>
        <Typography variant="h4" gutterBottom style={{ float: 'left' }} sx={{ mb: theme.spacing(1) }}>
          {t('Targets')}
        </Typography>
        <div className="clearfix" />
        <Paper classes={{ root: classes.paper }} variant="outlined">
          {hasAssetsGroupChecked && hasTeamsChecked && hasEndpointsChecked && hasPlayersChecked && (
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
              {drawTabs()}
            </>
          )}
        </Paper>
      </Grid>
      <Grid size={6}>
        <Typography variant="h4" gutterBottom sx={{ mb: theme.spacing(1) }}>
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
      </Grid>
    </Grid>
  );
};

export default AtomicTesting;
