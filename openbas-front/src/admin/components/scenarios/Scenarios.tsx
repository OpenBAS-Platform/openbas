import { makeStyles } from '@mui/styles';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { MovieFilterOutlined } from '@mui/icons-material';
import React, { CSSProperties, useMemo, useState } from 'react';
import { useFormatter } from '../../../components/i18n';
import { useHelper } from '../../../store';
import type { TagHelper, UserHelper } from '../../../actions/helper';
import { searchScenarios } from '../../../actions/scenarios/scenario-actions';
import type { ScenarioStore } from '../../../actions/scenarios/Scenario';
import ScenarioCreation from './ScenarioCreation';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { initSorting } from '../../../components/common/queryable/Page';
import PaginationComponent from '../../../components/common/pagination/PaginationComponent';
import SortHeadersComponent from '../../../components/common/pagination/SortHeadersComponent';
import type { FilterGroup } from '../../../utils/api-types';
import type { FilterGroup, ScenarioStatistic, SearchPaginationInput } from '../../../utils/api-types';
import ItemTags from '../../../components/ItemTags';
import ItemSeverity from '../../../components/ItemSeverity';
import PlatformIcon from '../../../components/PlatformIcon';
import ItemCategory from '../../../components/ItemCategory';
import type { Theme } from '../../../components/Theme';
import ImportUploaderScenario from './ImportUploaderScenario';
import { buildEmptyFilter } from '../../../components/common/queryable/filter/FilterUtils';
import ScenarioStatus from './scenario/ScenarioStatus';
import useDataLoader from '../../../utils/hooks/useDataLoader';
import { fetchTags } from '../../../actions/Tag';
import { useAppDispatch } from '../../../utils/hooks';
import { buildSearchPagination } from '../../../components/common/queryable/useQueryable';
import ScenarioPopover from './scenario/ScenarioPopover';
import { fetchStatistics } from '../../../actions/Application';
import ScenariosCard, { CATEGORY_FILTER_KEY } from './ScenariosCard';
import useFiltersState from '../../../components/common/queryable/filter/useFiltersState';

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
    paddingLeft: 10,
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  item: {
    paddingLeft: 10,
    height: 50,
  },
  bodyItems: {
    display: 'flex',
    alignItems: 'center',
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
      isSortable: true,
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
  const scenarioFilter: FilterGroup = {
    mode: 'and',
    filters: [buildEmptyFilter(CATEGORY_FILTER_KEY, 'eq')],
  };
  const [searchPaginationInput, setSearchPaginationInput] = useState<SearchPaginationInput>(buildSearchPagination({
    sorts: initSorting('scenario_updated_at', 'DESC'),
    filterGroup: scenarioFilter,
  }));
  const [filterGroup, helpers] = useFiltersState(searchPaginationInput.filterGroup, (f: FilterGroup) => setSearchPaginationInput({
    ...searchPaginationInput,
    filterGroup: f,
  }));

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
      <ScenariosCard helpers={filterHelpers} searchPaginationInput={searchPaginationInput} />
      <PaginationComponent
        fetch={searchScenarios}
        searchPaginationInput={searchPaginationInput}
        setContent={setScenarios}
        exportProps={exportProps}
      >
        <ImportUploaderScenario />
      </PaginationComponent>
      <List>
        <ListItem
          classes={{ root: classes.itemHead }}
          divider={false}
          style={{ paddingTop: 0 }}
        >
          <ListItemIcon />
          <ListItemText
            primary={
              <SortHeadersComponent
                headers={headers}
                inlineStylesHeaders={inlineStyles}
                searchPaginationInput={searchPaginationInput}
                setSearchPaginationInput={setSearchPaginationInput}
                defaultSortAsc
              />
            }
          />
        </ListItem>
        {scenarios.map((scenario: ScenarioStore) => {
          return (
            <ListItem
              key={scenario.scenario_id}
              classes={{ root: classes.item }}
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
                classes={{ root: classes.item }}
                divider
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
