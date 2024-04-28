import { makeStyles } from '@mui/styles';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemSecondaryAction, ListItemText } from '@mui/material';
import { KeyboardArrowRight, MovieFilterOutlined } from '@mui/icons-material';
import React, { CSSProperties, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormatter } from '../../../components/i18n';
import useSearchAnFilter from '../../../utils/SortingFiltering';
import { useHelper } from '../../../store';
import type { TagsHelper, UsersHelper } from '../../../actions/helper';
import { searchScenarios } from '../../../actions/scenarios/scenario-actions';
import type { ScenarioStore } from '../../../actions/scenarios/Scenario';
import ScenarioCreation from './ScenarioCreation';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { initSorting } from '../../../components/common/pagination/Page';
import PaginationComponent from '../../../components/common/pagination/PaginationComponent';
import SortHeadersComponent from '../../../components/common/pagination/SortHeadersComponent';
import type { SearchPaginationInput } from '../../../utils/api-types';
import ItemTags from '../../../components/ItemTags';

const useStyles = makeStyles(() => ({
  itemHead: {
    paddingLeft: 10,
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  item: {
    paddingLeft: 10,
    height: 80,
  },
  bodyItem: {
    height: 80,
    fontSize: 13,
    float: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: 10,

  },
  goIcon: {
    position: 'absolute',
    right: -10,
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
  scenario_main_focus: {
    width: '12%',
  },
  scenario_platforms: {
    width: '12%',
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
  const classes = useStyles();
  const { t, nsdt } = useFormatter();
  // Filter and sort hook
  const filtering = useSearchAnFilter('scenario', 'name', ['name']);
  // Fetching data
  const { userAdmin } = useHelper((helper: TagsHelper & UsersHelper) => ({
    userAdmin: helper.getMe()?.user_admin ?? false,
  }));

  // Headers
  const headers = [
    { field: 'scenario_name', label: 'Name', isSortable: true },
    { field: 'scenario_severity', label: 'Severity', isSortable: true },
    { field: 'scenario_category', label: 'Category', isSortable: true },
    { field: 'scenario_main_focus', label: 'Main focus', isSortable: true },
    { field: 'scenario_platforms', label: 'Platforms', isSortable: true },
    { field: 'scenario_tags', label: 'Tags', isSortable: true },
    { field: 'scenario_updated_at', label: 'Updated', isSortable: true },
  ];

  const [scenarios, setScenarios] = useState([]);
  const [searchPaginationInput, setSearchPaginationInput] = useState<SearchPaginationInput>({
    sorts: initSorting('scenario_name'),
  });

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
  const sortedScenarios: ScenarioStore[] = filtering.filterAndSort(scenarios);
  return (
    <>
      <Breadcrumbs variant="list" elements={[{ label: t('Scenarios'), current: true }]} />
      <PaginationComponent
        fetch={searchScenarios}
        searchPaginationInput={searchPaginationInput}
        setContent={setScenarios}
        exportProps={exportProps}
      />
      <List>
        <ListItem
          classes={{ root: classes.itemHead }}
          divider={false}
          style={{ paddingTop: 0 }}
        >
          <ListItemIcon>
            <span
              style={{
                padding: '0 8px 0 8px',
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              &nbsp;
            </span>
          </ListItemIcon>
          <ListItemText
            primary={
              <SortHeadersComponent
                headers={headers}
                inlineStylesHeaders={inlineStyles}
                searchPaginationInput={searchPaginationInput}
                setSearchPaginationInput={setSearchPaginationInput}
              />
              }
          />
          <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
        </ListItem>
        {sortedScenarios.map((scenario) => (
          <ListItemButton
            key={scenario.scenario_id}
            classes={{ root: classes.item }}
            divider
            component={Link}
            to={`/admin/scenarios/${scenario.scenario_id}`}
          >
            <ListItemIcon>
              <MovieFilterOutlined color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={
                <div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.scenario_name}
                  >
                    {scenario.scenario_name}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.scenario_severity}
                  >

                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.scenario_category}
                  >

                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.scenario_main_focus}
                  >

                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.scenario_platforms}
                  >

                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.scenario_tags}
                  >
                    <ItemTags variant="list" tags={scenario.scenario_tags} />
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.scenario_updated_at}
                  >
                    {nsdt(scenario.scenario_updated_at)}
                  </div>
                </div>
                }
            />
            <ListItemIcon classes={{ root: classes.goIcon }}>
              <KeyboardArrowRight />
            </ListItemIcon>
          </ListItemButton>
        ))}
      </List>
      {userAdmin && <ScenarioCreation />}
    </>
  );
};

export default Scenarios;
