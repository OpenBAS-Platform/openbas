import React, { useContext, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { Chip, IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Tooltip } from '@mui/material';
import { CSVLink } from 'react-csv';
import { FileDownloadOutlined } from '@mui/icons-material';
import { splitDuration } from '../../../../utils/Time';
import ItemTags from '../../../../components/ItemTags';
import SearchFilter from '../../../../components/SearchFilter';
import TagsFilter from '../../../../components/TagsFilter';
import InjectIcon from './InjectIcon';
import InjectPopover from './InjectPopover';
import InjectorContract from './InjectorContract';
import useSearchAnFilter from '../../../../utils/SortingFiltering';
import { useFormatter } from '../../../../components/i18n';
import { useHelper } from '../../../../store';
import ItemBoolean from '../../../../components/ItemBoolean';
import { exportData } from '../../../../utils/Environment';
import Loader from '../../../../components/Loader';
import { InjectContext, PermissionsContext } from '../Context';
import CreateInject from './CreateInject';
import UpdateInject from './UpdateInject';

const useStyles = makeStyles(() => ({
  container: {
    margin: '-12px 0 50px 0',
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
  duration: {
    fontSize: 12,
    lineHeight: '12px',
    height: 20,
    float: 'left',
    marginRight: 7,
    borderRadius: 4,
    width: 180,
    backgroundColor: 'rgba(0, 177, 255, 0.08)',
    color: '#00b1ff',
    border: '1px solid #00b1ff',
  },
}));

const headerStyles = {
  iconSort: {
    position: 'absolute',
    margin: '0 0 0 5px',
    padding: 0,
    top: '0px',
  },
  inject_type: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  inject_title: {
    float: 'left',
    width: '25%',
    fontSize: 12,
    fontWeight: '700',
  },
  inject_depends_duration: {
    float: 'left',
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
  inject_users_number: {
    float: 'left',
    width: '10%',
    fontSize: 12,
    fontWeight: '700',
  },
  inject_enabled: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  inject_tags: {
    float: 'left',
    fontSize: 12,
    fontWeight: '700',
  },
};

const inlineStyles = {
  inject_type: {
    float: 'left',
    width: '15%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  inject_title: {
    float: 'left',
    width: '25%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  inject_depends_duration: {
    float: 'left',
    width: '20%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  inject_users_number: {
    float: 'left',
    width: '10%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  inject_enabled: {
    float: 'left',
    width: '15%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  inject_tags: {
    float: 'left',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

const Injects = ({
  injects,
  teams,
  articles,
  variables,
  uriVariable,
  allUsersNumber,
  usersNumber,
  teamsUsers,
}) => {
  // Standard hooks
  const classes = useStyles();
  const { t, tPick } = useFormatter();
  const [selectedInjectId, setSelectedInjectId] = useState(null);
  const { permissions } = useContext(PermissionsContext);
  const injectContext = useContext(InjectContext);

  // Filter and sort hook
  const searchColumns = ['title', 'description', 'content'];
  const filtering = useSearchAnFilter(
    'inject',
    'depends_duration',
    searchColumns,
  );
  // Fetching data
  const {
    tagsMap,
    selectedInject,
  } = useHelper((helper) => {
    return {
      tagsMap: helper.getTagsMap(),
      selectedInject: helper.getInject(selectedInjectId),
    };
  });

  const onCreateInject = async (data) => {
    await injectContext.onAddInject(data);
  };
  const onUpdateInject = async (data) => {
    await injectContext.onUpdateInject(selectedInjectId, data);
  };

  const sortedInjects = filtering.filterAndSort(injects);
  // Rendering
  if (injects) {
    return (
      <div className={classes.container}>
        <>
          <div style={{ float: 'left', marginRight: 10 }}>
            <SearchFilter
              variant="small"
              onChange={filtering.handleSearch}
              keyword={filtering.keyword}
            />
          </div>
          <div style={{ float: 'left', marginRight: 10 }}>
            <TagsFilter
              onAddTag={filtering.handleAddTag}
              onRemoveTag={filtering.handleRemoveTag}
              currentTags={filtering.tags}
            />
          </div>
          <div style={{ float: 'right', margin: '-5px 15px 0 0' }}>
            {sortedInjects.length > 0 ? (
              <CSVLink
                data={exportData(
                  'inject',
                  [
                    'inject_type',
                    'inject_title',
                    'inject_description',
                    'inject_depends_duration',
                    'inject_users_number',
                    'inject_enabled',
                    'inject_tags',
                    'inject_content',
                  ],
                  sortedInjects,
                  tagsMap,
                )}
                filename={`${t('Injects')}.csv`}
              >
                <Tooltip title={t('Export this list')}>
                  <IconButton size="large">
                    <FileDownloadOutlined color="primary" />
                  </IconButton>
                </Tooltip>
              </CSVLink>
            ) : (
              <IconButton size="large" disabled={true}>
                <FileDownloadOutlined />
              </IconButton>
            )}
          </div>
        </>
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
                <>
                  {filtering.buildHeader(
                    'inject_type',
                    'Type',
                    true,
                    headerStyles,
                  )}
                  {filtering.buildHeader(
                    'inject_title',
                    'Title',
                    true,
                    headerStyles,
                  )}
                  {filtering.buildHeader(
                    'inject_depends_duration',
                    'Trigger',
                    true,
                    headerStyles,
                  )}
                  {filtering.buildHeader(
                    'inject_users_number',
                    'Players',
                    true,
                    headerStyles,
                  )}
                  {filtering.buildHeader(
                    'inject_enabled',
                    'Status',
                    true,
                    headerStyles,
                  )}
                  {filtering.buildHeader(
                    'inject_tags',
                    'Tags',
                    true,
                    headerStyles,
                  )}
                </>
              }
            />
            <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
          </ListItem>
          {sortedInjects.map((inject) => {
            const injectContract = inject.inject_injector_contract.injector_contract_content_parsed;
            const injectorContractName = tPick(injectContract?.label);
            const duration = splitDuration(inject.inject_depends_duration || 0);
            const isDisabled = !injectContract?.config.expose;
            const isNoTeam = !(injectContract?.fields.filter((f) => f.key === 'teams').length > 0);
            let injectStatus = inject.inject_enabled
              ? t('Enabled')
              : t('Disabled');
            if (inject.inject_content === null) {
              injectStatus = t('To fill');
            }
            return (
              <ListItem
                key={inject.inject_id}
                classes={{ root: classes.item }}
                divider={true}
                button={true}
                disabled={
                  !injectContract || isDisabled || !inject.inject_enabled
                }
                onClick={() => setSelectedInjectId(inject.inject_id)}
              >
                <ListItemIcon style={{ paddingTop: 5 }}>
                  <InjectIcon
                    tooltip={t(inject.inject_type)}
                    config={injectContract?.config}
                    type={inject.inject_type}
                    disabled={
                      !injectContract || isDisabled || !inject.inject_enabled
                    }
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <>
                      <div
                        className={classes.bodyItem}
                        style={inlineStyles.inject_type}
                      >
                        <InjectorContract
                          variant="list"
                          config={injectContract?.config}
                          label={injectorContractName}
                        />
                      </div>
                      <div
                        className={classes.bodyItem}
                        style={inlineStyles.inject_title}
                      >
                        {inject.inject_title}
                      </div>
                      <div
                        className={classes.bodyItem}
                        style={inlineStyles.inject_depends_duration}
                      >
                        <Chip
                          classes={{ root: classes.duration }}
                          label={`${duration.days}
                            ${t('d')}, ${duration.hours}
                            ${t('h')}, ${duration.minutes}
                            ${t('m')}`}
                        />
                      </div>
                      <div
                        className={classes.bodyItem}
                        style={inlineStyles.inject_users_number}
                      >
                        {isNoTeam ? t('N/A') : inject.inject_users_number}
                      </div>
                      <div
                        className={classes.bodyItem}
                        style={inlineStyles.inject_enabled}
                      >
                        <ItemBoolean
                          status={
                            inject.inject_content === null
                              ? false
                              : inject.inject_enabled
                          }
                          label={injectStatus}
                          variant="inList"
                        />
                      </div>
                      <div
                        className={classes.bodyItem}
                        style={inlineStyles.inject_tags}
                      >
                        <ItemTags variant="list" tags={inject.inject_tags} />
                      </div>
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <InjectPopover
                    inject={inject}
                    tagsMap={tagsMap}
                    setSelectedInjectId={setSelectedInjectId}
                    isDisabled={!injectContract || isDisabled}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
        {permissions.canWrite && (
          <>
            <UpdateInject
              open={selectedInjectId !== null}
              handleClose={() => setSelectedInjectId(null)}
              onUpdateInject={onUpdateInject}
              injectorContract={selectedInject?.inject_injector_contract?.injector_contract_content_parsed}
              inject={selectedInject}
              teamsFromExerciseOrScenario={teams}
              articlesFromExerciseOrScenario={articles}
              variablesFromExerciseOrScenario={variables}
              uriVariable={uriVariable}
              allUsersNumber={allUsersNumber}
              usersNumber={usersNumber}
              teamsUsers={teamsUsers}
            />
            <CreateInject
              title={t('Create a new inject')}
              onCreateInject={onCreateInject}
              teamsFromExerciseOrScenario={teams}
              articlesFromExerciseOrScenario={articles}
              variablesFromExerciseOrScenario={variables}
              uriVariable={uriVariable}
              allUsersNumber={allUsersNumber}
              usersNumber={usersNumber}
              teamsUsers={teamsUsers}
            />
          </>
        )}
      </div>
    );
  }
  return (
    <div className={classes.container}>
      <Loader />
    </div>
  );
};

export default Injects;
