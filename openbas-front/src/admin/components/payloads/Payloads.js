import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Chip, Grid, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Typography } from '@mui/material';
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
import { fetchCollectors } from '../../../actions/Collector';
import Drawer from '../../../components/common/Drawer';

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
  const [selectedPayload, setSelectedPayload] = useState(null);
  const { t, nsdt } = useFormatter();
  const { documentsMap, tagsMap, attackPatternsMap, killChainPhasesMap, collectorsMap } = useHelper((helper) => ({
    documentsMap: helper.getDocumentsMap(),
    attackPatternsMap: helper.getAttackPatternsMap(),
    killChainPhasesMap: helper.getKillChainPhasesMap(),
    tagsMap: helper.getTagsMap(),
    collectorsMap: helper.getCollectorsMap(),
  }));
  useDataLoader(() => {
    dispatch(fetchDocuments());
    dispatch(fetchTags());
    dispatch(fetchAttackPatterns());
    dispatch(fetchKillChainPhases());
    dispatch(fetchCollectors());
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
        {payloads.map((payload) => {
          const collector = payload.payload_collector ? collectorsMap[payload.payload_collector] : null;
          return (
            <ListItem
              key={payload.payload_id}
              classes={{ root: classes.item }}
              divider={true}
              button={true}
              onClick={() => setSelectedPayload(payload)}
            >
              <ListItemIcon>
                {collector ? (
                  <img
                    src={`/api/images/collectors/${collector.collector_type}`}
                    alt={collector.collector_type}
                    style={{
                      padding: 0,
                      cursor: 'pointer',
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                    }}
                  />
                ) : (
                  <PayloadIcon payloadType={payload.payload_type} />
                )}
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
                  disabled={collector !== null}
                />
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </List>
      <CreatePayload
        onCreate={(result) => setPayloads([result, ...payloads])}
      />
      <Drawer
        open={selectedPayload !== null}
        handleClose={() => setSelectedPayload(null)}
        title={t('Selected payload')}
      >
        <Grid container spacing={3}>
          <Grid item xs={6} style={{ paddingTop: 10 }}>
            <Typography
              variant="h3"
              gutterBottom
              style={{ marginTop: 20 }}
            >
              {t('Name')}
            </Typography>
            {selectedPayload?.payload_name}
            <Typography
              variant="h3"
              gutterBottom
              style={{ marginTop: 20 }}
            >
              {t('Platforms')}
            </Typography>
            {(selectedPayload?.payload_platforms ?? []).length === 0 ? (
              <PlatformIcon platform={t('No inject in this scenario')} tooltip width={25} />
            ) : selectedPayload?.payload_platforms?.map(
              (platform) => <PlatformIcon key={platform} platform={platform} tooltip width={25} marginRight={10} />,
            )}
            <Typography
              variant="h3"
              gutterBottom
              style={{ marginTop: 20 }}
            >
              {t('Description')}
            </Typography>
            {selectedPayload?.payload_description}
          </Grid>
          <Grid item xs={6} style={{ paddingTop: 10 }}>
            <Typography
              variant="h3"
              gutterBottom
              style={{ marginTop: 20 }}
            >
              {t('Content')}
            </Typography>
            <pre>{selectedPayload?.command_content ?? selectedPayload?.dns_resolution_hostname ?? selectedPayload?.file_drop_file ?? selectedPayload?.executable_file}</pre>
            <Typography
              variant="h3"
              gutterBottom
              style={{ marginTop: 20 }}
            >
              {t('Cleanup command')}
            </Typography>
            <pre>{selectedPayload?.payload_cleanup_command}</pre>
          </Grid>
        </Grid>
      </Drawer>
    </>
  );
};

export default Payloads;
