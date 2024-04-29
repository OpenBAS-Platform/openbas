import { makeStyles } from '@mui/styles';
import { Card, CardActionArea, CardContent, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, useTheme } from '@mui/material';
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
import ItemSeverity from '../../../components/ItemSeverity';
import PlatformIcon from '../../../components/PlatformIcon';
import ItemCategory from '../../../components/ItemCategory';
import ItemMainFocus from '../../../components/ItemMainFocus';
import type { Theme } from '../../../components/Theme';

const useStyles = makeStyles(() => ({
  card: {
    overflow: 'hidden',
    width: 250,
    height: 100,
    marginRight: 20,
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
    height: 70,
  },
  bodyItem: {
    fontSize: 13,
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
  const theme = useTheme<Theme>();
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
      <div style={{ display: 'flex', marginBottom: 30 }}>
        <Card classes={{ root: classes.card }} variant="outlined" style={{ border: `1px solid ${theme.palette.secondary.main}` }}>
          <CardActionArea classes={{ root: classes.area }}>
            <CardContent>
              <div style={{ marginBottom: 10 }}>
                <ItemCategory category='all' size="small" />
              </div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>
                {t('All categories')}
              </div>
              <div style={{ marginTop: 10, fontSize: 12, fontWeight: 500 }}>
                {scenarios.length} {t('scenarios')}
              </div>
            </CardContent>
          </CardActionArea>
        </Card>
        <Card classes={{ root: classes.card }} variant="outlined">
          <CardActionArea classes={{ root: classes.area }}>
            <CardContent>
              <div style={{ marginBottom: 10 }}>
                <ItemCategory category='attack-scenario' size="small" />
              </div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>
                {t('Attack Scenarios')}
              </div>
              <div style={{ marginTop: 10, fontSize: 12, fontWeight: 500 }}>
                {scenarios.length} {t('attack scenarios')}
              </div>
            </CardContent>
          </CardActionArea>
        </Card>
        <Card classes={{ root: classes.card }} variant="outlined">
          <CardActionArea classes={{ root: classes.area }}>
            <CardContent>
              <div style={{ marginBottom: 10 }}>
                <ItemCategory category='global-crisis' size="small" />
              </div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>
                {t('Global Crisis')}
              </div>
              <div style={{ marginTop: 10, fontSize: 12, fontWeight: 500 }}>
                {scenarios.length} {t('attack scenarios')}
              </div>
            </CardContent>
          </CardActionArea>
        </Card>
        <Card classes={{ root: classes.card }} variant="outlined">
          <CardActionArea classes={{ root: classes.area }}>
            <CardContent>
              <div style={{ marginBottom: 10 }}>
                <ItemCategory category='lateral-movement' size="small" />
              </div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>
                {t('Lateral Movement')}
              </div>
              <div style={{ marginTop: 10, fontSize: 12, fontWeight: 500 }}>
                {scenarios.length} {t('attack scenarios')}
              </div>
            </CardContent>
          </CardActionArea>
        </Card>
      </div>
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
              <MovieFilterOutlined color="primary" fontSize="medium" />
            </ListItemIcon>
            <ListItemText
              primary={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.scenario_name}
                  >
                    <Typography variant="h1" style={{ fontSize: 17 }}>{scenario.scenario_name}</Typography>
                    <Typography variant="body2"><strong>{scenario.scenario_injects_statistics.total_count}</strong> {t('injects in this scenario')}</Typography>
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.scenario_severity}
                  >
                    <ItemSeverity label={t(scenario.scenario_severity ?? 'Unknown')} severity={scenario.scenario_severity ?? 'Unknown'} variant="inList" />
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.scenario_category}
                  >
                    <ItemCategory category={scenario.scenario_category ?? 'Unknown'} label={t(scenario.scenario_category ?? 'Unknown')} size="medium" />
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.scenario_main_focus}
                  >
                    <ItemMainFocus mainFocus={scenario.scenario_main_focus ?? 'Unknown'} label={t(scenario.scenario_main_focus ?? 'Unknown')} size="medium" />
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.scenario_platforms}
                  >
                    {scenario.scenario_platforms?.length === 0 ? (
                      <PlatformIcon platform={t('No inject in this scenario')} tooltip={true} width={25} />
                    ) : scenario.scenario_platforms.map(
                      (platform: string) => <PlatformIcon key={platform} platform={platform} tooltip={true} width={25} marginRight={10} />,
                    )}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.scenario_tags}
                  >
                    <ItemTags variant="largeList" tags={scenario.scenario_tags} />
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
