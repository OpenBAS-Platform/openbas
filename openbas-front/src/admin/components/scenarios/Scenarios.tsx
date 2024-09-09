import { makeStyles } from '@mui/styles';
import { Card, CardActionArea, CardContent, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { MovieFilterOutlined } from '@mui/icons-material';
import React, { CSSProperties, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useFormatter } from '../../../components/i18n';
import { useHelper } from '../../../store';
import type { TagHelper, UserHelper } from '../../../actions/helper';
import { fetchScenarioStatistic, searchScenarios } from '../../../actions/scenarios/scenario-actions';
import type { ScenarioStore } from '../../../actions/scenarios/Scenario';
import ScenarioCreation from './ScenarioCreation';
import Breadcrumbs from '../../../components/Breadcrumbs';
import ItemTags from '../../../components/ItemTags';
import ItemSeverity from '../../../components/ItemSeverity';
import PlatformIcon from '../../../components/PlatformIcon';
import ItemCategory from '../../../components/ItemCategory';
import ImportUploaderScenario from './ImportUploaderScenario';
import ScenarioStatus from './scenario/ScenarioStatus';
import useDataLoader from '../../../utils/hooks/useDataLoader';
import { fetchTags } from '../../../actions/Tag';
import { useAppDispatch } from '../../../utils/hooks';
import useQueryable from '../../../components/common/queryable/useQueryable';
import { buildSearchPagination } from '../../../components/common/queryable/QueryableUtils';
import ScenarioPopover from './scenario/ScenarioPopover';
import SortHeadersComponentV2 from '../../../components/common/queryable/sort/SortHeadersComponentV2';
import PaginationComponentV2 from '../../../components/common/queryable/pagination/PaginationComponentV2';
import type { Theme } from '../../../components/Theme';
import type { FilterGroup, ScenarioStatistic } from '../../../utils/api-types';
import { scenarioCategories } from './ScenarioForm';
import { buildEmptyFilter } from '../../../components/common/queryable/filter/FilterUtils';
import { initSorting } from '../../../components/common/queryable/Page';

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    overflow: 'hidden',
    width: 250,
    height: 100,
    marginRight: 20,
  },
  cardSelected: {
    border: `1px solid ${theme.palette.secondary.main}`,
  },
  area: {
    width: '100%',
    height: '100%',
  },
  itemHead: {
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  item: {
    height: 50,
  },
  bodyItems: {
    display: 'flex',
  },
  bodyItem: {
    height: 20,
    fontSize: 13,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: 10,
  },
}));

const inlineStyles: Record<string, CSSProperties> = {
  scenario_name: {
    width: '25%',
  },
  scenario_severity: {
    width: '8%',
  },
  scenario_category: {
    width: '12%',
  },
  scenario_recurrence: {
    width: '12%',
  },
  scenario_platforms: {
    width: '10%',
    cursor: 'default',
  },
  scenario_tags: {
    width: '18%',
    cursor: 'default',
  },
  scenario_updated_at: {
    width: '10%',
  },
};

const Scenarios = () => {
  // Standard hooks
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const { t, nsdt } = useFormatter();

  // Fetching data
  const { userAdmin } = useHelper((helper: TagHelper & UserHelper) => ({
    userAdmin: helper.getMe()?.user_admin ?? false,
  }));
  useDataLoader(() => {
    dispatch(fetchTags());
  });

  // Headers
  const headers = useMemo(() => [
    {
      field: 'scenario_name',
      label: 'Name',
      isSortable: true,
      value: (scenario: ScenarioStore) => scenario.scenario_name,
    },
    {
      field: 'scenario_severity',
      label: 'Severity',
      isSortable: true,
      value: (scenario: ScenarioStore) => <ItemSeverity
        label={t(scenario.scenario_severity ?? 'Unknown')}
        severity={scenario.scenario_severity ?? 'Unknown'}
        variant="inList"
                                          />,
    },
    {
      field: 'scenario_category',
      label: 'Category',
      isSortable: true,
      value: (scenario: ScenarioStore) => <ItemCategory
        category={scenario.scenario_category ?? 'Unknown'}
        label={t(scenario.scenario_category ?? 'Unknown')}
        size="medium"
                                          />,
    },
    {
      field: 'scenario_recurrence',
      label: 'Status',
      isSortable: false,
      value: (scenario: ScenarioStore) => <ScenarioStatus scenario={scenario} variant="list" />,
    },
    {
      field: 'scenario_platforms',
      label: 'Platforms',
      isSortable: false,
      value: (scenario: ScenarioStore) => {
        const platforms = scenario.scenario_platforms ?? [];
        if (platforms.length === 0) {
          return <PlatformIcon platform={t('No inject in this scenario')} tooltip={true} width={25} />;
        }
        return platforms.map(
          (platform: string) => <PlatformIcon key={platform} platform={platform} tooltip={true} width={20} marginRight={10} />,
        );
      },
    },
    {
      field: 'scenario_tags',
      label: 'Tags',
      isSortable: false,
      value: (scenario: ScenarioStore) => <ItemTags tags={scenario.scenario_tags} variant="list" />,
    },
    {
      field: 'scenario_updated_at',
      label: 'Updated',
      isSortable: true,
      value: (scenario: ScenarioStore) => nsdt(scenario.scenario_updated_at),
    },
  ], []);

  const [scenarios, setScenarios] = useState<ScenarioStore[]>([]);

  // Category filter
  const CATEGORY_FILTER_KEY = 'scenario_category';
  const scenarioFilter: FilterGroup = {
    mode: 'and',
    filters: [buildEmptyFilter(CATEGORY_FILTER_KEY, 'eq')],
  };
  const { queryableHelpers, searchPaginationInput } = useQueryable('scenarios', buildSearchPagination({
    sorts: initSorting('scenario_updated_at', 'DESC'),
    filterGroup: scenarioFilter,
  }));

  const handleOnClickCategory = (category?: string) => {
    if (!category) {
      // Clear filter
      queryableHelpers.filterHelpers.handleAddMultipleValueFilter(
        CATEGORY_FILTER_KEY,
        [],
      );
    } else {
      queryableHelpers.filterHelpers.handleAddSingleValueFilter(
        CATEGORY_FILTER_KEY,
        category,
      );
    }
  };
  const getCategoryValue = () => searchPaginationInput.filterGroup?.filters?.find((f) => f.key === CATEGORY_FILTER_KEY)?.values;
  const hasCategory = (category: string) => getCategoryValue()?.includes(category);
  const noCategory = () => getCategoryValue()?.length === 0;

  // Statistic
  const [statistic, setStatistic] = useState<ScenarioStatistic>();
  const fetchStatistics = () => {
    fetchScenarioStatistic().then((result: { data: ScenarioStatistic }) => setStatistic(result.data));
  };
  useEffect(() => {
    fetchStatistics();
  }, []);

  const categoryCard = (category: string, count: number) => (
    <Card
      key={category}
      classes={{ root: classes.card }} variant="outlined"
      onClick={() => handleOnClickCategory(category)}
      className={classNames({ [classes.cardSelected]: hasCategory(category) })}
    >
      <CardActionArea classes={{ root: classes.area }}>
        <CardContent>
          <div style={{ marginBottom: 10 }}>
            <ItemCategory category={category} size="small" />
          </div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>
            {t(scenarioCategories.get(category) ?? category)}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, fontWeight: 500 }}>
            {count} {t('scenarios')}
          </div>
        </CardContent>
      </CardActionArea>
    </Card>
  );

  // Export
  const exportProps = {
    exportType: 'scenario',
    exportKeys: [
      'scenario_name',
      'scenario_severity',
      'scenario_category',
      'scenario_main_focus',
      'scenario_platforms',
      'scenario_tags',
      'scenario_updated_at',
    ],
    exportData: scenarios,
    exportFileName: `${t('Scenarios')}.csv`,
  };

  return (
    <>
      <Breadcrumbs variant="list" elements={[{ label: t('Scenarios'), current: true }]} />
      <div style={{ display: 'flex', marginBottom: 30 }}>
        <Card
          key="all"
          classes={{ root: classes.card }} variant="outlined"
          onClick={() => handleOnClickCategory()}
          className={classNames({ [classes.cardSelected]: noCategory() })}
        >
          <CardActionArea classes={{ root: classes.area }}>
            <CardContent>
              <div style={{ marginBottom: 10 }}>
                <ItemCategory category="all" size="small" />
              </div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>
                {t('All categories')}
              </div>
              <div style={{ marginTop: 10, fontSize: 12, fontWeight: 500 }}>
                {statistic?.scenarios_global_count ?? '-'} {t('scenarios')}
              </div>
            </CardContent>
          </CardActionArea>
        </Card>
        {Object.entries(statistic?.scenarios_attack_scenario_count ?? {}).map(([key, value]) => (
          categoryCard(key, value)
        ))}
      </div>
      <PaginationComponentV2
        fetch={searchScenarios}
        searchPaginationInput={searchPaginationInput}
        setContent={setScenarios}
        entityPrefix="scenario"
        availableFilterNames={['scenario_category', 'scenario_kill_chain_phases', 'scenario_tags', 'scenario_name']}
        queryableHelpers={queryableHelpers}
        exportProps={exportProps}
      >
        <ImportUploaderScenario />
      </PaginationComponentV2>
      <List>
        <ListItem
          classes={{ root: classes.itemHead }}
          divider={false}
          style={{ paddingTop: 0 }}
          secondaryAction={<>&nbsp;</>}
        >
          <ListItemIcon />
          <ListItemText
            primary={
              <SortHeadersComponentV2
                headers={headers}
                inlineStylesHeaders={inlineStyles}
                sortHelpers={queryableHelpers.sortHelpers}
              />
            }
          />
        </ListItem>
        {scenarios.map((scenario: ScenarioStore) => {
          return (
            <ListItem
              key={scenario.scenario_id}
              classes={{ root: classes.item }}
              divider
              secondaryAction={
                <ScenarioPopover
                  scenario={scenario}
                  actions={['Duplicate', 'Export', 'Delete']}
                  onDelete={(result) => setScenarios(scenarios.filter((e) => (e.scenario_id !== result)))}
                  inList
                />
              }
              disablePadding
            >
              <ListItemButton
                href={`/admin/scenarios/${scenario.scenario_id}`}
              >
                <ListItemIcon>
                  <MovieFilterOutlined color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <div className={classes.bodyItems}>
                      {headers.map((header) => (
                        <div
                          key={header.field}
                          className={classes.bodyItem}
                          style={inlineStyles[header.field]}
                        >
                          {header.value(scenario)}
                        </div>
                      ))}
                    </div>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      {userAdmin && <ScenarioCreation
        onCreate={(result: ScenarioStore) => {
          setScenarios([result, ...scenarios]);
          fetchStatistics();
        }}
                    />
      }
    </>
  );
};

export default Scenarios;
