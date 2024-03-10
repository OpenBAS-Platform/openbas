import { makeStyles } from '@mui/styles';
import { CSVLink } from 'react-csv';
import { IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemSecondaryAction, ListItemText, Tooltip } from '@mui/material';
import { ChevronRightOutlined, FileDownloadOutlined, MovieFilterOutlined } from '@mui/icons-material';
import React, { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../../../utils/hooks';
import { useFormatter } from '../../../components/i18n';
import useSearchAnFilter from '../../../utils/SortingFiltering';
import { useHelper } from '../../../store';
import type { TagsHelper, UsersHelper } from '../../../actions/helper';
import useDataLoader from '../../../utils/ServerSideEvent';
import type { ScenariosHelper } from '../../../actions/scenarios/scenario-helper';
import { fetchScenarios } from '../../../actions/scenarios/scenario-actions';
import type { ScenarioStore } from '../../../actions/scenarios/Scenario';
import SearchFilter from '../../../components/SearchFilter';
import TagsFilter from '../../../components/TagsFilter';
import { exportData } from '../../../utils/Environment';
import ItemTags from '../../../components/ItemTags';
import ScenarioCreation from './ScenarioCreation';
import Breadcrumbs from '../../../components/Breadcrumbs';

const useStyles = makeStyles(() => ({
  parameters: {
    marginTop: -10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filters: {
    display: 'flex',
    gap: '10px',
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
  bodyItem: {
    height: 20,
    fontSize: 13,
    float: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  downloadButton: {
    marginRight: 15,
  },
}));

const inlineStylesHeaders: Record<string, CSSProperties> = {
  iconSort: {
    position: 'absolute',
    margin: '0 0 0 5px',
    padding: 0,
    top: '0px',
  },
  scenario_name: {
    float: 'left',
    width: '25%',
    fontSize: 12,
    fontWeight: '700',
  },
  scenario_subtitle: {
    float: 'left',
    width: '25%',
    fontSize: 12,
    fontWeight: '700',
  },
  scenario_description: {
    float: 'left',
    width: '25%',
    fontSize: 12,
    fontWeight: '700',
  },
  scenario_tags: {
    float: 'left',
    width: '25%',
    fontSize: 12,
    fontWeight: '700',
  },
};

const inlineStyles: Record<string, CSSProperties> = {
  scenario_name: {
    width: '25%',
  },
  scenario_subtitle: {
    width: '25%',
  },
  scenario_description: {
    width: '25%',
  },
  scenario_tags: {
    width: '25%',
  },
};

const Scenarios = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { t } = useFormatter();
  // Filter and sort hook
  const filtering = useSearchAnFilter('scenario', 'name', ['name']);
  // Fetching data
  const { scenarios, tagsMap, userAdmin } = useHelper((helper: ScenariosHelper & TagsHelper & UsersHelper) => ({
    scenarios: helper.getScenarios(),
    tagsMap: helper.getTagsMap(),
    userAdmin: helper.getMe()?.user_admin ?? false,
  }));
  useDataLoader(() => {
    dispatch(fetchScenarios());
  });

  // Headers
  const fields = [
    { name: 'scenario_name', label: 'Name', isSortable: true, value: (scenario: ScenarioStore) => scenario.scenario_name },
    { name: 'scenario_subtitle', label: 'Subtitle', isSortable: true, value: (scenario: ScenarioStore) => scenario.scenario_subtitle },
    { name: 'scenario_description', label: 'Description', isSortable: true, value: (scenario: ScenarioStore) => scenario.scenario_description },
    { name: 'scenario_tags', label: 'Tags', isSortable: true, value: (scenario: ScenarioStore) => <ItemTags variant="list" tags={scenario.scenario_tags} /> },
  ];
  const sortedScenarios: ScenarioStore[] = filtering.filterAndSort(scenarios);
  return (
    <>
      <Breadcrumbs variant="list" elements={[{ label: t('Scenarios'), current: true }]} />
      <div className={classes.parameters}>
        <div className={classes.filters}>
          <SearchFilter
            small
            onChange={filtering.handleSearch}
            keyword={filtering.keyword}
          />
          <TagsFilter
            onAddTag={filtering.handleAddTag}
            onRemoveTag={filtering.handleRemoveTag}
            currentTags={filtering.tags}
          />
        </div>
        <div className={classes.downloadButton}>
          {sortedScenarios.length > 0 ? (
            <CSVLink
              data={exportData(
                'scenario',
                fields.map((field) => field.name),
                sortedScenarios,
                tagsMap,
              )}
              filename={'Scenarios.csv'}
            >
              <Tooltip title={t('Export this list')}>
                <IconButton size="large">
                  <FileDownloadOutlined color="primary" />
                </IconButton>
              </Tooltip>
            </CSVLink>
          ) : (
            <IconButton size="large" disabled>
              <FileDownloadOutlined />
            </IconButton>
          )}
        </div>
      </div>
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
              <div>
                {fields.map((header) => (
                  <div key={header.name}>
                    {
                      filtering.buildHeader(
                        header.name,
                        header.label,
                        header.isSortable,
                        inlineStylesHeaders,
                      )
                    }
                  </div>
                ))
                }
              </div>
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
                  {fields.map((field) => (
                    <div
                      key={field.name}
                      className={classes.bodyItem}
                      style={inlineStyles[field.name]}
                    >
                      {field.value(scenario)}
                    </div>
                  ))}
                </div>
              }
            />
            <ListItemSecondaryAction>
              <ChevronRightOutlined />
            </ListItemSecondaryAction>
          </ListItemButton>
        ))}
      </List>
      {userAdmin && <ScenarioCreation />}
    </>
  );
};

export default Scenarios;
