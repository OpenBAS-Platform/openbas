import React, { useState } from 'react';
import { List, ListItem, ListItemIcon, ListItemSecondaryAction, Chip, ListItemText } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { RouteOutlined } from '@mui/icons-material';
import { searchKillChainPhases } from '../../../../actions/KillChainPhase';
import CreateKillChainPhase from './CreateKillChainPhase';
import KillChainPhasePopover from './KillChainPhasePopover';
import TaxonomiesMenu from '../TaxonomiesMenu';
import { useFormatter } from '../../../../components/i18n';
import PaginationComponent from '../../../../components/common/pagination/PaginationComponent';
import SortHeadersComponent from '../../../../components/common/pagination/SortHeadersComponent';
import { initSorting } from '../../../../components/common/queryable/Page';
import Breadcrumbs from '../../../../components/Breadcrumbs';

const useStyles = makeStyles(() => ({
  container: {
    margin: 0,
    padding: '0 200px 50px 0',
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
    fontSize: 13,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: 10,
  },
  chipInList: {
    fontSize: 12,
    height: 20,
    float: 'left',
    textTransform: 'uppercase',
    borderRadius: 4,
    width: 120,
  },
}));

const inlineStyles = {
  phase_kill_chain_name: {
    width: '20%',
  },
  phase_name: {
    width: '35%',
  },
  phase_order: {
    width: '15%',
  },
  phase_created_at: {
    width: '15%',
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
  const [searchPaginationInput, setSearchPaginationInput] = useState({
    sorts: initSorting('phase_order'),
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
      <Breadcrumbs variant="list" elements={[{ label: t('Settings') }, { label: t('Taxonomies') }, { label: t('Kill chain phases'), current: true }]} />
      <TaxonomiesMenu />
      <PaginationComponent
        fetch={searchKillChainPhases}
        searchPaginationInput={searchPaginationInput}
        setContent={setKillChainPhases}
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
                <div className={classes.bodyItems}>
                  <div className={classes.bodyItem} style={inlineStyles.phase_kill_chain_name}>
                    <Chip
                      variant="outlined"
                      classes={{ root: classes.chipInList }}
                      color="primary"
                      label={killChainPhase.phase_kill_chain_name}
                    />
                  </div>
                  <div className={classes.bodyItem} style={inlineStyles.phase_name}>
                    {killChainPhase.phase_name}
                  </div>
                  <div className={classes.bodyItem} style={inlineStyles.phase_order}>
                    {killChainPhase.phase_order}
                  </div>
                  <div className={classes.bodyItem} style={inlineStyles.phase_created_at}>
                    {nsdt(killChainPhase.phase_created_at)}
                  </div>
                </div>
              }
            />
            <ListItemSecondaryAction>
              <KillChainPhasePopover
                killChainPhase={killChainPhase}
                onUpdate={(result) => setKillChainPhases(killChainPhases.map((k) => (k.phase_id !== result.phase_id ? k : result)))}
                onDelete={(result) => setKillChainPhases(killChainPhases.filter((k) => (k.phase_id !== result)))}
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <CreateKillChainPhase
        onCreate={(result) => setKillChainPhases([result, ...killChainPhases])}
      />
    </div>
  );
};

export default KillChainPhases;
