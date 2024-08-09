import React, { useContext, useState } from 'react';
import { makeStyles } from '@mui/styles';
import {
  Checkbox,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material';
import { BarChartOutlined, MoreVert, ReorderOutlined } from '@mui/icons-material';
import { splitDuration } from '../../../../utils/Time';
import ItemTags from '../../../../components/ItemTags';
import SearchFilter from '../../../../components/SearchFilter';
import TagsFilter from '../filters/TagsFilter';
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
import PlatformIcon from '../../../../components/PlatformIcon';
import ChainedTimeline from '../../../../components/ChainedTimeline';
import { isNotEmptyField } from '../../../../utils/utils';
import ImportUploaderInjectFromXls from './ImportUploaderInjectFromXls';
import useExportToXLS from '../../../../utils/hooks/useExportToXLS';
import ButtonCreate from '../../../../components/common/ButtonCreate';

const useStyles = makeStyles(() => ({
  container: {
    margin: '-12px 0 50px 0',
  },
  disabled: {
    opacity: 0.38,
    pointerEvents: 'none',
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
    fontSize: 13,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: 10,
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
    top: 9,
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
    width: '18%',
    fontSize: 12,
    fontWeight: '700',
  },
  inject_platforms: {
    float: 'left',
    width: '10%',
    fontSize: 12,
    fontWeight: '700',
  },
  inject_enabled: {
    float: 'left',
    width: '12%',
    fontSize: 12,
    fontWeight: '700',
  },
  inject_tags: {
    float: 'left',
    width: '20%',
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
    width: '18%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  inject_platforms: {
    float: 'left',
    width: '10%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'flex',
    alignItems: 'center',
  },
  inject_enabled: {
    float: 'left',
    width: '12%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  inject_tags: {
    float: 'left',
    width: '20%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

const Injects = (props) => {
  const {
    exerciseOrScenarioId,
    injects,
    teams,
    articles,
    variables,
    uriVariable,
    allUsersNumber,
    usersNumber,
    teamsUsers,
    setViewMode,
    onToggleEntity,
    selectedElements,
    deSelectedElements,
    selectAll,
    onToggleShiftEntity,
    handleToggleSelectAll,
    onConnectInjects,
  } = props;
  // Standard hooks
  const classes = useStyles();
  const { t, tPick } = useFormatter();
  const [selectedInjectId, setSelectedInjectId] = useState(null);
  const [openCreateDrawer, setOpenCreateDrawer] = useState(false);
  const [presetCreationValues, setPresetCreationValues] = useState();
  const [showTimeline, setShowTimeline] = useState(
    () => {
      const storedValue = localStorage.getItem(`${exerciseOrScenarioId}_show_injects_timeline`);
      return storedValue === null ? true : storedValue === 'true';
    },
  );
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
  } = useHelper((helper) => {
    return {
      tagsMap: helper.getTagsMap(),
    };
  });
  const onCreateInject = async (data) => {
    await injectContext.onAddInject(data);
  };
  const onUpdateInject = async (data) => {
    await injectContext.onUpdateInject(selectedInjectId, data);
  };

  const sortedInjects = filtering.filterAndSort(injects);

  const isAtLeastOneValidInject = sortedInjects.some((inject) => inject.inject_injector_contract?.injector_contract_content_parsed !== null);

  // Menu
  const [anchorEl, setAnchorEl] = useState(null);

  const exportInjects = exportData(
    'inject',
    [
      'inject_type',
      'inject_title',
      'inject_description',
      'inject_depends_duration',
      'inject_enabled',
      'inject_tags',
      'inject_content',
    ],
    sortedInjects,
    tagsMap,
  );

  const exportInjectsToXLS = useExportToXLS({ data: exportInjects, fileName: `${t('Injects')}` });

  const handleShowTimeline = () => {
    setShowTimeline(!showTimeline);
    localStorage.setItem(`${exerciseOrScenarioId}_show_injects_timeline`, !showTimeline);
    setAnchorEl(null);
  };

  // Rendering
  if (injects) {
    return (
      <div className={classes.container}>
        <div style={{ marginBottom: setViewMode ? 8 : 0 }}>
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
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
          >
            {sortedInjects.length > 0 && (
              <div style={{ marginRight: 10 }}>
                <IconButton
                  value="popover"
                  size="large"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    setAnchorEl(ev.currentTarget);
                  }}
                >
                  <MoreVert fontSize="small" color="primary" />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                >
                  <MenuItem onClick={exportInjectsToXLS}>
                    {`${t('Export injects')}`}
                  </MenuItem>
                  {isAtLeastOneValidInject && (<MenuItem onClick={handleShowTimeline}>
                    {showTimeline ? t('Hide timeline') : t('Show timeline')}
                  </MenuItem>)}
                </Menu>
              </div>
            )}
            <ToggleButtonGroup
              size="small"
              exclusive
              style={{ float: 'right' }}
              aria-label="Change view mode"
            >
              {injectContext.onImportInjectFromXls
                && <ImportUploaderInjectFromXls />}
              {setViewMode
                && <Tooltip title={t('List view')}>
                  <ToggleButton
                    value='list'
                    selected
                    aria-label="List view mode"
                  >
                    <ReorderOutlined fontSize="small" color='inherit' />
                  </ToggleButton>
                </Tooltip>
              }
              {setViewMode
                && <Tooltip title={t('Distribution view')}>
                  <ToggleButton
                    value='distribution'
                    onClick={() => setViewMode('distribution')}
                    aria-label="Distribution view mode"
                  >
                    <BarChartOutlined fontSize="small" color='primary' />
                  </ToggleButton>
                </Tooltip>
              }
            </ToggleButtonGroup>
          </div>
          <div className="clearfix" />
        </div>
        {showTimeline && isAtLeastOneValidInject && (
          <div style={{ marginBottom: 50 }}>
            <div>
              <ChainedTimeline
                injects={sortedInjects}
                onConnectInjects={onConnectInjects}
                exerciseOrScenarioId={exerciseOrScenarioId}
                openCreateInjectDrawer={(data) => {
                  setOpenCreateDrawer(true);
                  setPresetCreationValues(data);
                }}
                onSelectedInject={(inject) => {
                  const injectContract = inject.inject_injector_contract.convertedContent;
                  const isContractExposed = injectContract?.config.expose;
                  if (injectContract && isContractExposed) {
                    setSelectedInjectId(inject.inject_id);
                  }
                }}
              />
              <div className="clearfix"/>
            </div>
          </div>
        )}
        <List>
          <ListItem
            classes={{ root: classes.itemHead }}
            divider={false}
            style={{ paddingTop: 0 }}
          >
            <ListItemIcon style={{ minWidth: 40 }}>
              <Checkbox
                edge="start"
                checked={selectAll}
                disableRipple
                onChange={
                  typeof handleToggleSelectAll === 'function'
                  && handleToggleSelectAll.bind(this)
                }
                disabled={typeof handleToggleSelectAll !== 'function'}
              />
            </ListItemIcon>
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
                    'inject_platforms',
                    'Platform(s)',
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
          {sortedInjects.map((inject, index) => {
            const injectContract = inject.inject_injector_contract.convertedContent;
            const injectorContractName = tPick(injectContract?.label);
            const duration = splitDuration(
              inject.inject_depends_duration || 0,
            );
            const isContractExposed = injectContract?.config.expose;
            let injectStatus = inject.inject_enabled
              ? t('Enabled')
              : t('Disabled');
            if (!inject.inject_ready) {
              injectStatus = t('Missing content');
            }
            return (
              <ListItem
                key={inject.inject_id}
                classes={{ root: classes.item }}
                divider
                button
                onClick={() => {
                  if (injectContract && isContractExposed) {
                    setSelectedInjectId(inject.inject_id);
                  }
                }}
              >
                <ListItemIcon
                  classes={{ root: classes.itemIcon }}
                  style={{ minWidth: 40 }}
                  onClick={(event) => (event.shiftKey
                    ? onToggleShiftEntity(index, inject, event)
                    : onToggleEntity(inject, event))
                  }
                >
                  <Checkbox
                    edge="start"
                    checked={
                      (selectAll && !(inject.inject_id
                        in (deSelectedElements || {})))
                      || inject.inject_id in (selectedElements || {})
                    }
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemIcon style={{ paddingTop: 5 }}>
                  <InjectIcon
                    isPayload={isNotEmptyField(inject.inject_injector_contract.injector_contract_payload)}
                    type={
                      inject.inject_injector_contract.injector_contract_payload
                        ? inject.inject_injector_contract.injector_contract_payload?.payload_collector_type
                        || inject.inject_injector_contract.injector_contract_payload?.payload_type
                        : inject.inject_type
                    }
                    disabled={!injectContract || !isContractExposed || !inject.inject_enabled}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <div className={(!injectContract || !isContractExposed
                      || !inject.inject_enabled) ? classes.disabled : ''}
                    >
                      <div
                        className={classes.bodyItem}
                        style={inlineStyles.inject_type}
                      >
                        {injectContract ? (
                          <InjectorContract
                            variant="list"
                            config={injectContract?.config}
                            label={injectorContractName}
                          />
                        ) : <InjectorContract variant="list" label={t('Deleted')} deleted />
                        }
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
                        style={inlineStyles.inject_platforms}
                      >
                        {inject.inject_injector_contract?.injector_contract_platforms?.map(
                          (platform) => <PlatformIcon key={platform}
                            width={20}
                            platform={platform}
                            marginRight={10}
                                        />,
                        )}
                      </div>
                      <div
                        className={classes.bodyItem}
                        style={inlineStyles.inject_enabled}
                      >
                        <ItemBoolean
                          status={inject.inject_ready
                            ? inject.inject_enabled : false}
                          label={injectStatus}
                          variant="inList"
                          tooltip={injectStatus}
                        />
                      </div>
                      <div
                        className={classes.bodyItem}
                        style={inlineStyles.inject_tags}
                      >
                        <ItemTags variant="list"
                          tags={inject.inject_tags}
                        />
                      </div>
                    </div>
                  }
                />
                <ListItemSecondaryAction>
                  <InjectPopover
                    inject={inject}
                    canBeTested
                    tagsMap={tagsMap}
                    setSelectedInjectId={setSelectedInjectId}
                    isDisabled={!injectContract || !isContractExposed}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
        {permissions.canWrite && (
          <>
            {selectedInjectId !== null
              && <UpdateInject
                open
                handleClose={() => setSelectedInjectId(null)}
                onUpdateInject={onUpdateInject}
                injectId={selectedInjectId}
                teamsFromExerciseOrScenario={teams}
                articlesFromExerciseOrScenario={articles}
                variablesFromExerciseOrScenario={variables}
                uriVariable={uriVariable}
                allUsersNumber={allUsersNumber}
                usersNumber={usersNumber}
                teamsUsers={teamsUsers}
                 />
            }
            <ButtonCreate onClick={() => {
              setOpenCreateDrawer(true);
              setPresetCreationValues(undefined);
            }}
            />
            <CreateInject
              title={t('Create a new inject')}
              open={openCreateDrawer}
              handleClose={() => setOpenCreateDrawer(false)}
              onCreateInject={onCreateInject}
              presetValues={presetCreationValues}
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
