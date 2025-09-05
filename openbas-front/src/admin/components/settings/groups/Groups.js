import { CheckCircleOutlined, GroupsOutlined } from '@mui/icons-material';
import { List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Tooltip } from '@mui/material';
import * as R from 'ramda';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles } from 'tss-react/mui';

import { fetchExercises } from '../../../../actions/Exercise';
import { searchGroups } from '../../../../actions/Group';
import { fetchOrganizations } from '../../../../actions/Organization';
import { fetchScenarios } from '../../../../actions/scenarios/scenario-actions';
import { fetchUsers } from '../../../../actions/User';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import PaginationComponent from '../../../../components/common/pagination/PaginationComponent';
import SortHeadersComponent from '../../../../components/common/pagination/SortHeadersComponent';
import { initSorting } from '../../../../components/common/queryable/Page';
import { useFormatter } from '../../../../components/i18n';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import { Can } from '../../../../utils/permissions/PermissionsProvider.js';
import { ACTIONS, SUBJECTS } from '../../../../utils/permissions/types.js';
import SecurityMenu from '../SecurityMenu';
import CreateGroup from './CreateGroup';
import GroupPopover from './GroupPopover';
import {
  defaultGrantAtomicTestingObserver, defaultGrantAtomicTestingPlanner,
  defaultGrantPayloadObserver, defaultGrantPayloadPlanner,
  defaultGrantScenarioObserver,
  defaultGrantScenarioPlanner,
  defaultGrantSimulationObserver,
  defaultGrantSimulationPlanner,
  isDefaultGrantPresent,
} from './GroupUtils.js';

const useStyles = makeStyles()(() => ({
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
    fontSize: 13,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: 10,
  },
}));

const inlineStyles = {
  group_name: { width: '15%' },
  group_default_user_assign: { width: '15%' },
  group_default_grants: {
    width: '15%',
    cursor: 'default',
  },
  group_users_number: {
    width: '10%',
    cursor: 'default',
  },
};

const Groups = () => {
  // Standard hooks
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const { t } = useFormatter();
  useDataLoader(() => {
    dispatch(fetchOrganizations());
    dispatch(fetchUsers());
    dispatch(fetchExercises());
    dispatch(fetchScenarios());
  });

  // Headers
  const headers = [
    {
      field: 'group_name',
      label: 'Name',
      isSortable: true,
    },
    {
      field: 'group_default_user_assign',
      label: 'Auto assign',
      isSortable: true,
    },
    {
      field: 'group_default_grants_scenario_observer',
      label: 'Auto observer on scenarios',
      isSortable: false,
      value: group => isDefaultGrantPresent(group.group_default_grants, defaultGrantScenarioObserver),
    },
    {
      field: 'group_default_grants_scenario_planner',
      label: 'Auto planner on scenarios',
      isSortable: false,
      value: group => isDefaultGrantPresent(group.group_default_grants, defaultGrantScenarioPlanner),
    },
    {
      field: 'group_default_grants_simulation_observer',
      label: 'Auto observer on exercises',
      isSortable: false,
      value: group => isDefaultGrantPresent(group.group_default_grants, defaultGrantSimulationObserver),
    },
    {
      field: 'group_default_grants_simulation_planner',
      label: 'Auto planner on exercises',
      isSortable: false,
      value: group => isDefaultGrantPresent(group.group_default_grants, defaultGrantSimulationPlanner),
    },
    {
      field: 'group_default_grants_payload_observer',
      label: 'Auto observer on payloads',
      isSortable: false,
      value: group => isDefaultGrantPresent(group.group_default_grants, defaultGrantPayloadObserver),
    },
    {
      field: 'group_default_grants_payload_planner',
      label: 'Auto planner on payloads',
      isSortable: false,
      value: group => isDefaultGrantPresent(group.group_default_grants, defaultGrantPayloadPlanner),
    },
    {
      field: 'group_default_grants_atomic_testing_observer',
      label: 'Auto observer on atomic testings',
      isSortable: false,
      value: group => isDefaultGrantPresent(group.group_default_grants, defaultGrantAtomicTestingObserver),
    },
    {
      field: 'group_default_grants_atomic_testing_planner',
      label: 'Auto planner on atomic testings',
      isSortable: false,
      value: group => isDefaultGrantPresent(group.group_default_grants, defaultGrantAtomicTestingPlanner),
    },
    {
      field: 'group_users_number',
      label: 'Users',
      isSortable: false,
    },
  ];

  const [groups, setGroups] = useState([]);
  const [searchPaginationInput, setSearchPaginationInput] = useState({ sorts: initSorting('group_name') });

  // Export
  const exportProps = {
    exportType: 'tags',
    exportKeys: [
      'group_name',
      'group_default_user_assign',
      'group_users_number',
    ],
    exportData: groups,
    exportFileName: `${t('Groups')}.csv`,
  };

  return (
    <div style={{
      display: 'flex',
      overflow: 'scroll',
    }}
    >
      <div style={{ flexGrow: 1 }}>
        <Breadcrumbs
          variant="list"
          elements={[{ label: t('Settings') }, { label: t('Security') }, {
            label: t('Groups'),
            current: true,
          }]}
        />
        <PaginationComponent
          fetch={searchGroups}
          searchPaginationInput={searchPaginationInput}
          setContent={setGroups}
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
              primary={(
                <SortHeadersComponent
                  headers={headers}
                  inlineStylesHeaders={inlineStyles}
                  searchPaginationInput={searchPaginationInput}
                  setSearchPaginationInput={setSearchPaginationInput}
                />
              )}
            />
            <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
          </ListItem>
          {groups.map(group => (
            <ListItem
              key={group.group_id}
              classes={{ root: classes.item }}
              divider={true}
              secondaryAction={(
                <GroupPopover
                  group={group}
                  groupUsersIds={group.group_users}
                  groupRolesIds={group.group_roles}
                  onUpdate={result => setGroups(groups.map(g => (g.group_id !== result.group_id ? g : result)))}
                  onDelete={result => setGroups(groups.filter(g => (g.group_id !== result)))}
                />
              )}
            >
              <ListItemIcon>
                <GroupsOutlined color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={(
                  <div className={classes.bodyItems}>
                    <div className={classes.bodyItem} style={inlineStyles.group_name}>
                      {group.group_name}
                    </div>
                    <div className={classes.bodyItem} style={inlineStyles.group_default_user_assign}>
                      {group.group_default_user_assign ? (
                        <Tooltip
                          title={t(
                            'The new users will automatically be assigned to this group.',
                          )}
                        >
                          <CheckCircleOutlined fontSize="small" />
                        </Tooltip>
                      ) : (
                        '-'
                      )}
                    </div>
                    <div className={classes.bodyItem} style={inlineStyles.group_default_grants}>
                      {R.any(
                        g =>
                          g.grant_resource_type === 'SCENARIO'
                          && g.grant_type === 'OBSERVER',
                        group.group_default_grants || [],
                      ) ? (
                            <Tooltip
                              title={t(
                                'This group will have observer permission on new scenarios.',
                              )}
                            >
                              <CheckCircleOutlined fontSize="small" />
                            </Tooltip>
                          ) : (
                            '-'
                          )}
                    </div>
                    <div className={classes.bodyItem} style={inlineStyles.group_default_grants}>
                      {R.any(
                        g =>
                          g.grant_resource_type === 'SCENARIO'
                          && g.grant_type === 'PLANNER',
                        group.group_default_grants || [],
                      ) ? (
                            <Tooltip
                              title={t(
                                'This group will have planner permission on new scenarios.',
                              )}
                            >
                              <CheckCircleOutlined fontSize="small" />
                            </Tooltip>
                          ) : (
                            '-'
                          )}
                    </div>
                    <div className={classes.bodyItem} style={inlineStyles.group_default_grants}>
                      {R.any(
                        g =>
                          g.grant_resource_type === 'SIMULATION'
                          && g.grant_type === 'OBSERVER',
                        group.group_default_grants || [],
                      ) ? (
                            <Tooltip
                              title={t(
                                'This group will have observer permission on new simulations.',
                              )}
                            >
                              <CheckCircleOutlined fontSize="small" />
                            </Tooltip>
                          ) : (
                            '-'
                          )}
                    </div>
                    <div className={classes.bodyItem} style={inlineStyles.group_default_grants}>
                      {R.any(
                        g =>
                          g.grant_resource_type === 'SIMULATION'
                          && g.grant_type === 'PLANNER',
                        group.group_default_grants || [],
                      ) ? (
                            <Tooltip
                              title={t(
                                'This group will have planner permission on new simulations.',
                              )}
                            >
                              <CheckCircleOutlined fontSize="small" />
                            </Tooltip>
                          ) : (
                            '-'
                          )}
                    </div>
                    <div className={classes.bodyItem} style={inlineStyles.group_default_grants}>
                      {R.any(
                        g =>
                          g.grant_resource_type === 'PAYLOAD'
                          && g.grant_type === 'OBSERVER',
                        group.group_default_grants || [],
                      ) ? (
                            <Tooltip
                              title={t(
                                'This group will have observer permission on new payloads.',
                              )}
                            >
                              <CheckCircleOutlined fontSize="small" />
                            </Tooltip>
                          ) : (
                            '-'
                          )}
                    </div>
                    <div className={classes.bodyItem} style={inlineStyles.group_default_grants}>
                      {R.any(
                        g =>
                          g.grant_resource_type === 'PAYLOAD'
                          && g.grant_type === 'PLANNER',
                        group.group_default_grants || [],
                      ) ? (
                            <Tooltip
                              title={t(
                                'This group will have planner permission on new payloads.',
                              )}
                            >
                              <CheckCircleOutlined fontSize="small" />
                            </Tooltip>
                          ) : (
                            '-'
                          )}
                    </div>
                    <div className={classes.bodyItem} style={inlineStyles.group_default_grants}>
                      {R.any(
                        g =>
                          g.grant_resource_type === 'ATOMIC_TESTING'
                          && g.grant_type === 'OBSERVER',
                        group.group_default_grants || [],
                      ) ? (
                            <Tooltip
                              title={t(
                                'This group will have observer permission on new atomic testings.',
                              )}
                            >
                              <CheckCircleOutlined fontSize="small" />
                            </Tooltip>
                          ) : (
                            '-'
                          )}
                    </div>
                    <div className={classes.bodyItem} style={inlineStyles.group_default_grants}>
                      {R.any(
                        g =>
                          g.grant_resource_type === 'ATOMIC_TESTING'
                          && g.grant_type === 'PLANNER',
                        group.group_default_grants || [],
                      ) ? (
                            <Tooltip
                              title={t(
                                'This group will have planner permission on new atomic testings.',
                              )}
                            >
                              <CheckCircleOutlined fontSize="small" />
                            </Tooltip>
                          ) : (
                            '-'
                          )}
                    </div>
                    <div className={classes.bodyItem} style={inlineStyles.group_users_number}>
                      {group.group_users_number}
                    </div>
                  </div>
                )}
              />

            </ListItem>
          ))}
        </List>
        <Can I={ACTIONS.MANAGE} a={SUBJECTS.PLATFORM_SETTINGS}>
          <CreateGroup
            onCreate={result => setGroups([result, ...groups])}
          />
        </Can>
      </div>
      <SecurityMenu />
    </div>
  );
};

export default Groups;
