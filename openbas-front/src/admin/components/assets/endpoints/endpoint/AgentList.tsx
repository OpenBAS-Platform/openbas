import { DevicesOtherOutlined } from '@mui/icons-material';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { makeStyles } from '@mui/styles';
import * as React from 'react';
import { CSSProperties } from 'react';

import { fetchExecutors } from '../../../../../actions/Executor';
import type { ExecutorHelper } from '../../../../../actions/executors/executor-helper';
import { useFormatter } from '../../../../../components/i18n';
import { useHelper } from '../../../../../store';
import type { AgentOutput } from '../../../../../utils/api-types';
import { useAppDispatch } from '../../../../../utils/hooks';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import AssetStatus from '../../AssetStatus';
import AgentPrivilege from '../AgentPrivilege';
import AgentPopover from './AgentPopover';

const useStyles = makeStyles(() => ({
  itemHead: {
    paddingLeft: 10,
    textTransform: 'uppercase',
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

const inlineStyles: Record<string, CSSProperties> = {
  agent_executed_by_user: {
    width: '30%',
  },
  agent_executor: {
    width: '15%',
    display: 'flex',
    alignItems: 'center',
    cursor: 'default',
  },
  agent_privilege: {
    width: '15%',
  },
  agent_deployment_mode: {
    width: '15%',
  },
  agent_active: {
    width: '20%',
  },
};

interface Props {
  agents: AgentOutput[];
}

const AgentList: React.FC<Props> = ({ agents }) => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { t } = useFormatter();
  // Fetching data
  const { executorsMap } = useHelper((helper: ExecutorHelper) => ({
    executorsMap: helper.getExecutorsMap(),
  }));
  useDataLoader(() => {
    dispatch(fetchExecutors());
  });

  // Headers
  const headers = [
    { field: 'agent_executed_by_user', label: 'Agent Name' },
    { field: 'agent_executor', label: 'Executor' },
    { field: 'agent_privilege', label: 'Privilege' },
    { field: 'agent_deployment_mode', label: 'Deployment' },
    { field: 'agent_active', label: 'Status' },
  ];

  return (
    <List>
      <ListItem
        classes={{ root: classes.itemHead }}
        style={{ paddingTop: 0 }}
      >
        <ListItemIcon />
        <ListItemText
          primary={(
            <div>
              <div className={classes.bodyItems}>
                {headers.map(header => (
                  <div
                    key={header.field}
                    className={classes.bodyItem}
                    style={inlineStyles[header.field]}
                  >
                    {header.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        />
      </ListItem>
      <ListItem
        classes={{ root: classes.itemHead }}
        style={{ paddingTop: 0 }}
      >
      </ListItem>
      {agents.map((agent: AgentOutput) => {
        const executor = agent.agent_executor?.executor_id ? executorsMap[agent.agent_executor?.executor_id] : undefined;
        return (
          <ListItem
            key={agent.agent_id}
            classes={{ root: classes.item }}
            divider
            secondaryAction={(
              <AgentPopover
                agent={agent}
                actions={['Delete']}
                inList
              />
            )}
            disablePadding
          >
            <ListItemIcon>
              <DevicesOtherOutlined color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={(
                <div className={classes.bodyItems}>
                  <div className={classes.bodyItem} style={inlineStyles.agent_executed_by_user}>
                    {agent.agent_executed_by_user}
                  </div>
                  <div className={classes.bodyItem} style={inlineStyles.agent_executor}>
                    {executor && (
                      <img
                        src={`/api/images/executors/${executor.executor_type}`}
                        alt={executor.executor_type}
                        style={{ width: 25, height: 25, borderRadius: 4, marginRight: 10 }}
                      />
                    )}
                    {executor?.executor_name ?? t('Unknown')}
                  </div>
                  <div className={classes.bodyItem} style={inlineStyles.agent_privilege}>
                    <AgentPrivilege variant="list" privilege={agent.agent_privilege ?? 'admin'} />
                  </div>
                  <div className={classes.bodyItem} style={inlineStyles.agent_deployment_mode}>
                    {agent.agent_deployment_mode}
                  </div>
                  <div className={classes.bodyItem} style={inlineStyles.agent_active}>
                    <AssetStatus variant="list" status={agent.agent_active ? 'Active' : 'Inactive'} />
                  </div>
                </div>
              )}
            />
          </ListItem>
        );
      })}
    </List>
  );
};

export default AgentList;
