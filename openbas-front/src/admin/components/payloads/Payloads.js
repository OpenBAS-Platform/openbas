import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Chip, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { searchPayloads } from '../../../actions/Payload';
import CreatePayload from './CreatePayload';
import useDataLoader from '../../../utils/hooks/useDataLoader';
import { useHelper } from '../../../store';
import PayloadPopover from './PayloadPopover';
import { fetchKillChainPhases } from '../../../actions/KillChainPhase';
import PaginationComponent from '../../../components/common/pagination/PaginationComponent';
import SortHeadersComponent from '../../../components/common/pagination/SortHeadersComponent';
import { initSorting } from '../../../components/common/pagination/Page';
import { useFormatter } from '../../../components/i18n';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { fetchTags } from '../../../actions/Tag';
import ItemTags from '../../../components/ItemTags';
import { fetchAttackPatterns } from '../../../actions/AttackPattern';
import PlatformIcon from '../../../components/PlatformIcon';
import { fetchDocuments } from '../../../actions/Document';
import PayloadIcon from '../../../components/PayloadIcon';

const useStyles = makeStyles(() => ({
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
    float: 'left',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chipInList: {
    fontSize: 12,
    height: 20,
    float: 'left',
    textTransform: 'uppercase',
    borderRadius: 4,
    width: 150,
  },
}));

const inlineStyles = {
  payload_type: {
    width: '15%',
    cursor: 'default',
  },
  payload_name: {
    width: '20%',
  },
  payload_platforms: {
    width: '10%',
    cursor: 'default',
  },
  payload_description: {
    width: '20%',
  },
  payload_tags: {
    width: '20%',
  },
  payload_created_at: {
    width: '10%',
  },
  payload_updated_at: {
    width: '10%',
  },
};

const Payloads = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t, nsdt } = useFormatter();
  const { documentsMap, tagsMap, attackPatternsMap, killChainPhasesMap } = useHelper((helper) => ({
    documentsMap: helper.getDocumentsMap(),
    attackPatternsMap: helper.getAttackPatternsMap(),
    killChainPhasesMap: helper.getKillChainPhasesMap(),
    tagsMap: helper.getTagsMap(),
  }));
  useDataLoader(() => {
    dispatch(fetchDocuments());
    dispatch(fetchTags());
    dispatch(fetchAttackPatterns());
    dispatch(fetchKillChainPhases());
  });

  // Headers
  const headers = [
    { field: 'payload_type', label: 'Type', isSortable: false },
    { field: 'payload_name', label: 'Name', isSortable: true },
    { field: 'payload_platforms', label: 'Platforms', isSortable: true },
    { field: 'payload_description', label: 'Description', isSortable: true },
    { field: 'payload_tags', label: 'Tags', isSortable: true },
    { field: 'payload_created_at', label: 'Created', isSortable: true },
    { field: 'payload_updated_at', label: 'Updated', isSortable: true },
  ];

  const [payloads, setPayloads] = useState([]);
  const [searchPaginationInput, setSearchPaginationInput] = useState({
    sorts: initSorting('payload_name'),
  });

  // Export
  const exportProps = {
    exportType: 'payloads',
    exportKeys: [
      'payload_type',
      'payload_name',
      'payload_description',
      'payload_created_at',
      'payload_updated_at',
    ],
    exportData: payloads,
    exportFileName: `${t('Payloads')}.csv`,
  };

  return (
    <>
      <Breadcrumbs variant="list" elements={[{ label: t('Components') }, { label: t('Payloads'), current: true }]} />
      <PaginationComponent
        fetch={searchPayloads}
        searchPaginationInput={searchPaginationInput}
        setContent={setPayloads}
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
        {payloads.map((payload) => (
          <ListItem
            key={payload.payload_id}
            classes={{ root: classes.item }}
            divider={true}
          >
            <ListItemIcon>
              <PayloadIcon payloadType={payload.payload_type} />
            </ListItemIcon>
            <ListItemText
              primary={
                <div className={classes.bodyItems}>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.payload_type}
                  >
                    <Chip
                      variant="outlined"
                      classes={{ root: classes.chipInList }}
                      color="primary"
                      label={t(payload.payload_type)}
                    />
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.payload_name}
                  >
                    {payload.payload_name}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.payload_platforms}
                  >
                    {payload.payload_platforms?.map(
                      (platform) => <PlatformIcon key={platform} platform={platform} tooltip={true} width={20} marginRight={10} />,
                    )}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.payload_description}
                  >
                    {payload.payload_description}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.payload_tags}
                  >
                    <ItemTags
                      variant="list"
                      tags={payload.payload_tags}
                    />
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.payload_created_at}
                  >
                    {nsdt(payload.payload_created_at)}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.payload_updated_at}
                  >
                    {nsdt(payload.payload_updated_at)}
                  </div>
                </div>
              }
            />
            <ListItemSecondaryAction>
              <PayloadPopover
                tagsMap={tagsMap}
                documentsMap={documentsMap}
                attackPatternsMap={attackPatternsMap}
                killChainPhasesMap={killChainPhasesMap}
                payload={payload}
                onUpdate={(result) => setPayloads(payloads.map((a) => (a.payload_id !== result.payload_id ? a : result)))}
                onDelete={(result) => setPayloads(payloads.filter((a) => (a.payload_id !== result)))}
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <CreatePayload
        onCreate={(result) => setPayloads([result, ...payloads])}
      />
    </>
  );
};

export default Payloads;
