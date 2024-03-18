import React, { useState } from 'react';
import { List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { RouteOutlined } from '@mui/icons-material';
import { searchKillChainPhases } from '../../../../actions/KillChainPhase';
import CreateKillChainPhase from './CreateKillChainPhase';
import KillChainPhasePopover from './KillChainPhasePopover';
import TaxonomiesMenu from '../TaxonomiesMenu';
import { useFormatter } from '../../../../components/i18n';
import PaginationComponent from '../../../../components/common/pagination/PaginationComponent';
import SortHeadersComponent from '../../../../components/common/pagination/SortHeadersComponent';
import { initSorting } from '../../../../components/common/pagination/PaginationField';

const useStyles = makeStyles(() => ({
  container: {
    margin: 0,
    padding: '0 200px 50px 0',
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
  // Standard hooks
  const classes = useStyles();
  const { t, nsdt } = useFormatter();

  // Headers
  const headers = [
    { field: 'phase_kill_chain_name', label: 'Kill chain', isSortable: true },
    { field: 'phase_name', label: 'Name', isSortable: true },
    { field: 'phase_order', label: 'Order', isSortable: true },
    { field: 'phase_created_at', label: 'Created', isSortable: true },
  ];

  const [killChainPhases, setKillChainPhases] = useState([]);
  const [paginationField, setPaginationField] = useState({
    sorts: initSorting('phase_kill_chain_name'),
  });

  // Export
  const exportProps = {
    exportType: 'kill_chain_phase',
    exportKeys: [
      'phase_kill_chain_name',
      'phase_name',
      'phase_order',
      'phase_created_at',
    ],
    exportData: killChainPhases,
    exportFileName: `${t('KillChainPhases')}.csv`,
  };

  return (
    <div className={classes.container}>
      <TaxonomiesMenu />
      <PaginationComponent
        fetch={searchKillChainPhases}
        paginationField={paginationField}
        setContent={setKillChainPhases}
        exportProps={exportProps}
      />
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
              <SortHeadersComponent
                headers={headers}
                inlineStylesHeaders={headerStyles}
                paginationField={paginationField}
                setPaginationField={setPaginationField}
              />
            }
          />
          <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
        </ListItem>
        {killChainPhases.map((killChainPhase) => (
          <ListItem
            key={killChainPhase.phase_id}
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
