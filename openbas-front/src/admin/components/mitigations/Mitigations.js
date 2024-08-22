import React, { useState } from 'react';
import { List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useDispatch } from 'react-redux';
import { DynamicFormOutlined } from '@mui/icons-material';
import { searchMitigations } from '../../../actions/Mitigation';
import CreateMitigation from './CreateMitigation';
import MitigationPopover from './MitigationPopover';
import PaginationComponent from '../../../components/common/pagination/PaginationComponent';
import SortHeadersComponent from '../../../components/common/pagination/SortHeadersComponent';
import { initSorting } from '../../../components/common/queryable/Page';
import { useFormatter } from '../../../components/i18n';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { useHelper } from '../../../store';
import useDataLoader from '../../../utils/hooks/useDataLoader';
import { fetchAttackPatterns } from '../../../actions/AttackPattern';
import { fetchKillChainPhases } from '../../../actions/KillChainPhase';

const useStyles = makeStyles(() => ({
  container: {
    margin: 0,
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
  mitigation_external_id: {
    width: '15%',
  },
  mitigation_name: {
    width: '30%',
  },
  mitigation_description: {
    width: '30%',
  },
  mitigation_created_at: {
    width: '12%',
  },
  mitigation_updated_at: {
    width: '12%',
  },
};

const inlineStyles = {
  mitigation_external_id: {
    float: 'left',
    width: '15%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  mitigation_name: {
    float: 'left',
    width: '30%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  mitigation_description: {
    float: 'left',
    width: '30%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  mitigation_created_at: {
    float: 'left',
    width: '12%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  mitigation_updated_at: {
    float: 'left',
    width: '12%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

const Mitigations = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t, nsdt } = useFormatter();
  const { attackPatternsMap, killChainPhasesMap } = useHelper((helper) => ({
    attackPatternsMap: helper.getAttackPatternsMap(),
    killChainPhasesMap: helper.getKillChainPhasesMap(),
  }));
  useDataLoader(() => {
    dispatch(fetchAttackPatterns());
    dispatch(fetchKillChainPhases());
  });

  // Headers
  const headers = [
    { field: 'mitigation_external_id', label: 'External ID', isSortable: true },
    { field: 'mitigation_name', label: 'Name', isSortable: true },
    { field: 'mitigation_description', label: 'Description', isSortable: true },
    { field: 'mitigation_created_at', label: 'Created', isSortable: true },
    { field: 'mitigation_updated_at', label: 'Updated', isSortable: true },
  ];

  const [mitigations, setMitigations] = useState([]);
  const [searchPaginationInput, setSearchPaginationInput] = useState({
    sorts: initSorting('mitigation_external_id'),
  });

  // Export
  const exportProps = {
    exportType: 'mitigations',
    exportKeys: [
      'mitigation_external_id',
      'mitigation_name',
      'mitigation_description',
      'mitigation_created_at',
      'mitigation_updated_at',
    ],
    exportData: mitigations,
    exportFileName: `${t('Mitigations')}.csv`,
  };

  return (
    <div className={classes.container}>
      <Breadcrumbs variant="list" elements={[{ label: t('Mitigations'), current: true }]} />
      <PaginationComponent
        fetch={searchMitigations}
        searchPaginationInput={searchPaginationInput}
        setContent={setMitigations}
        exportProps={exportProps}
      />
      <div className="clearfix" />
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
                inlineStylesHeaders={headerStyles}
                searchPaginationInput={searchPaginationInput}
                setSearchPaginationInput={setSearchPaginationInput}
              />
            }
          />
          <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
        </ListItem>
        {mitigations.map((mitigation) => (
          <ListItem
            key={mitigation.mitigation_id}
            classes={{ root: classes.item }}
            divider={true}
          >
            <ListItemIcon>
              <DynamicFormOutlined color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={
                <div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.mitigation_external_id}
                  >
                    {mitigation.mitigation_external_id}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.mitigation_name}
                  >
                    {mitigation.mitigation_name}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.mitigation_description}
                  >
                    {mitigation.mitigation_description}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.mitigation_created_at}
                  >
                    {nsdt(mitigation.mitigation_created_at)}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.mitigation_updated_at}
                  >
                    {nsdt(mitigation.mitigation_updated_at)}
                  </div>
                </div>
              }
            />
            <ListItemSecondaryAction>
              <MitigationPopover
                mitigation={mitigation}
                attackPatternsMap={attackPatternsMap}
                killChainPhasesMap={killChainPhasesMap}
                onUpdate={(result) => setMitigations(mitigations.map((a) => (a.mitigation_id !== result.mitigation_id ? a : result)))}
                onDelete={(result) => setMitigations(mitigations.filter((a) => (a.mitigation_id !== result)))}
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <CreateMitigation
        onCreate={(result) => setMitigations([result, ...mitigations])}
      />
    </div>
  );
};

export default Mitigations;
