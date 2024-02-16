import React from 'react';
import { useDispatch } from 'react-redux';
import { List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { RouteOutlined } from '@mui/icons-material';
import { fetchKillChainPhases } from '../../../../actions/KillChainPhase';
import SearchFilter from '../../../../components/SearchFilter';
import CreateKillChainPhase from './CreateKillChainPhase';
import useSearchAnFilter from '../../../../utils/SortingFiltering';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { useHelper } from '../../../../store';
import KillChainPhasePopover from './KillChainPhasePopover';
import TaxonomiesMenu from '../TaxonomiesMenu';
import { useFormatter } from '../../../../components/i18n';

const useStyles = makeStyles(() => ({
  container: {
    margin: 0,
    padding: '0 200px 50px 0',
  },
  parameters: {
    float: 'left',
    marginTop: -10,
  },
  list: {
    marginTop: 10,
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
    height: '100%',
    fontSize: 13,
  },
}));

const headerStyles = {
  iconSort: {
    position: 'absolute',
    margin: '0 0 0 5px',
    padding: 0,
    top: '0px',
  },
  phase_kill_chain_name: {
    float: 'left',
    width: '25%',
    fontSize: 12,
    fontWeight: '700',
  },
  phase_name: {
    float: 'left',
    width: '30%',
    fontSize: 12,
    fontWeight: '700',
  },
  phase_order: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  phase_created_at: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
};

const inlineStyles = {
  phase_kill_chain_name: {
    float: 'left',
    width: '25%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  phase_name: {
    float: 'left',
    width: '30%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  phase_order: {
    float: 'left',
    width: '15%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  phase_created_at: {
    float: 'left',
    width: '15%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

const KillChainPhases = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { nsdt } = useFormatter();
  const searchColumns = [
    'kill_chain_name',
    'name',
  ];
  const filtering = useSearchAnFilter('phase', 'order', searchColumns);
  const { killChainPhases } = useHelper((helper) => ({
    killChainPhases: helper.getKillChainPhases(),
  }));
  useDataLoader(() => {
    dispatch(fetchKillChainPhases());
  });
  return (
    <div className={classes.container}>
      <TaxonomiesMenu />
      <div className={classes.parameters}>
        <div style={{ float: 'left', marginRight: 10 }}>
          <SearchFilter
            variant="small"
            onChange={filtering.handleSearch}
            keyword={filtering.keyword}
          />
        </div>
      </div>
      <div className="clearfix" />
      <List classes={{ root: classes.list }}>
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
                {filtering.buildHeader(
                  'phase_kill_chain_name',
                  'Kill chain',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'phase_name',
                  'Name',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'phase_order',
                  'Order',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'phase_created_at',
                  'Created',
                  true,
                  headerStyles,
                )}
              </div>
            }
          />
          <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
        </ListItem>
        {filtering.filterAndSort(killChainPhases ?? []).map((killChainPhase) => (
          <ListItem
            key={killChainPhase.killChainPhase_id}
            classes={{ root: classes.item }}
            divider={true}
          >
            <ListItemIcon>
              <RouteOutlined color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={
                <div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.phase_kill_chain_name}
                  >
                    {killChainPhase.phase_kill_chain_name}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.phase_name}
                  >
                    {killChainPhase.phase_name}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.phase_order}
                  >
                    {killChainPhase.phase_order}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.phase_created_at}
                  >
                    {nsdt(killChainPhase.phase_created_at)}
                  </div>
                </div>
              }
            />
            <ListItemSecondaryAction>
              <KillChainPhasePopover killChainPhase={killChainPhase} />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <CreateKillChainPhase />
    </div>
  );
};

export default KillChainPhases;
