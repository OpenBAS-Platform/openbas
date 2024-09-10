import React, { CSSProperties, FunctionComponent, useContext, useMemo, useState } from 'react';
import { Checkbox, Chip, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Connection } from '@xyflow/react';
import { splitDuration } from '../../../../utils/Time';
import ItemTags from '../../../../components/ItemTags';
import InjectIcon from './InjectIcon';
import InjectPopover from './InjectPopover';
import InjectorContract from './InjectorContract';
import ItemBoolean from '../../../../components/ItemBoolean';
import PlatformIcon from '../../../../components/PlatformIcon';
import { isNotEmptyField } from '../../../../utils/utils';
import { useFormatter } from '../../../../components/i18n';
import type { FilterGroup, Inject, Variable } from '../../../../utils/api-types';
import type { InjectorContractConvertedContent, InjectOutputType, InjectStore } from '../../../../actions/injects/Inject';
import { InjectContext, PermissionsContext } from '../Context';
import PaginationComponentV2 from '../../../../components/common/queryable/pagination/PaginationComponentV2';
import { buildSearchPagination } from '../../../../components/common/queryable/QueryableUtils';
import SortHeadersComponentV2 from '../../../../components/common/queryable/sort/SortHeadersComponentV2';
import InjectsListButtons from './InjectsListButtons';
import ChainedTimeline from '../../../../components/ChainedTimeline';
import { initSorting } from '../../../../components/common/queryable/Page';
import UpdateInject from './UpdateInject';
import ButtonCreate from '../../../../components/common/ButtonCreate';
import CreateInject from './CreateInject';
import type { TeamStore } from '../../../../actions/teams/Team';
import type { ArticleStore } from '../../../../actions/channels/Article';
import { buildEmptyFilter } from '../../../../components/common/queryable/filter/FilterUtils';
import { useQueryableWithLocalStorage } from '../../../../components/common/queryable/useQueryableWithLocalStorage';

const useStyles = makeStyles(() => ({
  disabled: {
    opacity: 0.38,
    pointerEvents: 'none',
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

  itemHead: {
    textTransform: 'uppercase',
  },
  item: {
    height: 50,
  },
  bodyItems: {
    display: 'flex',
  },
  bodyItem: {
    height: 20,
    fontSize: 13,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: 10,
  },
}));

const inlineStyles: Record<string, CSSProperties> = {
  inject_type: {
    width: '15%',
  },
  inject_title: {
    width: '25%',
  },
  inject_depends_duration: {
    width: '18%',
  },
  inject_platforms: {
    width: '10%',
  },
  inject_enabled: {
    width: '12%',
  },
  inject_tags: {
    width: '20%',
  },
};

interface Props {
  selectAll: boolean
  handleToggleSelectAll: () => void
  onToggleEntity: (entity: { inject_id: string }, _?: React.SyntheticEvent, forceRemove?: { inject_id: string }[]) => void,
  onToggleShiftEntity: (currentIndex: number, currentEntity: { inject_id: string }, event: React.SyntheticEvent | null) => void,
  selectedElements: Record<string, { inject_id: string }>,
  deSelectedElements: Record<string, { inject_id: string }>,

  exerciseOrScenarioId: string

  setViewMode?: (mode: string) => void
  onConnectInjects: (connection: Connection) => void

  teams: TeamStore[]
  articles: ArticleStore[]
  variables: Variable[]
  uriVariable: string
  allUsersNumber?: number
  usersNumber?: number
  teamsUsers: never
}

const Injects: FunctionComponent<Props> = ({
  selectAll,
  handleToggleSelectAll,
  onToggleEntity,
  onToggleShiftEntity,
  selectedElements,
  deSelectedElements,
  exerciseOrScenarioId,
  setViewMode,
  onConnectInjects,
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
  const injectContext = useContext(InjectContext);
  const { permissions } = useContext(PermissionsContext);

  // Headers
  const headers = useMemo(() => [
    {
      field: 'inject_type',
      label: 'Type',
      isSortable: false,
      value: (_: InjectOutputType, injectContract: InjectorContractConvertedContent) => {
        const injectorContractName = tPick(injectContract?.label);
        return injectContract ? (
          <InjectorContract
            variant="list"
            config={injectContract?.config}
            label={injectorContractName}
          />
        ) : <InjectorContract variant="list" label={t('Deleted')} deleted />;
      }
      ,
    },
    {
      field: 'inject_title',
      label: 'Title',
      isSortable: true,
      value: (inject: InjectOutputType, _: InjectorContractConvertedContent) => <>{inject.inject_title}</>,
    },
    {
      field: 'inject_depends_duration',
      label: 'Trigger',
      isSortable: true,
      value: (inject: InjectOutputType, _: InjectorContractConvertedContent) => {
        const duration = splitDuration(
          inject.inject_depends_duration || 0,
        );
        return <Chip
          classes={{ root: classes.duration }}
          label={`${duration.days}
                          ${t('d')}, ${duration.hours}
                          ${t('h')}, ${duration.minutes}
                          ${t('m')}`}
               />;
      },
    },
    {
      field: 'inject_platforms',
      label: 'Platform(s)',
      isSortable: false,
      value: (inject: InjectOutputType, _: InjectorContractConvertedContent) => <>{
        inject.inject_injector_contract?.injector_contract_platforms?.map(
          (platform) => <PlatformIcon
            key={platform}
            width={20}
            platform={platform}
            marginRight={10}
                        />,
        )}</>,
    },
    {
      field: 'inject_enabled',
      label: 'Status',
      isSortable: false,
      value: (inject: InjectOutputType, _: InjectorContractConvertedContent) => {
        let injectStatus = inject.inject_enabled
          ? t('Enabled')
          : t('Disabled');
        if (!inject.inject_ready) {
          injectStatus = t('Missing content');
        }
        return <ItemBoolean
          status={inject.inject_ready
            ? inject.inject_enabled : false}
          label={injectStatus}
          variant="inList"
          tooltip={injectStatus}
               />;
      },
    },
    {
      field: 'inject_tags',
      label: 'Tags',
      isSortable: false,
      value: (inject: InjectOutputType, _: InjectorContractConvertedContent) => <ItemTags variant="list" tags={inject.inject_tags} />,
    },
  ], []);

  // Injects
  const [injects, setInjects] = useState<InjectOutputType[]>([]);
  const [selectedInjectId, setSelectedInjectId] = useState<string | null>(null);

  const onCreateInject = async (data: Inject) => {
    await injectContext.onAddInject(data).then((result: { result: string, entities: { injects: Record<string, InjectStore> } }) => {
      if (result.entities) {
        const created = result.entities.injects[result.result];
        setInjects([created as InjectOutputType, ...injects]);
      }
    });
  };
  const onUpdateInject = async (data: Inject) => {
    if (selectedInjectId) {
      await injectContext.onUpdateInject(selectedInjectId, data).then((result: { result: string, entities: { injects: Record<string, InjectStore> } }) => {
        if (result.entities) {
          const updated = result.entities.injects[result.result];
          setInjects(injects.map((i) => (i.inject_id !== updated.inject_id ? i as InjectOutputType : (updated as InjectOutputType))));
        }
      });
    }
  };

  const [openCreateDrawer, setOpenCreateDrawer] = useState(false);
  const [presetCreationValues, setPresetCreationValues] = useState<{
    inject_depends_duration_days?: number,
    inject_depends_duration_hours?: number,
    inject_depends_duration_minutes?: number,
  }>();

  const openCreateInjectDrawer = (data: {
    inject_depends_duration_days?: number,
    inject_depends_duration_hours?: number,
    inject_depends_duration_minutes?: number,
  }) => {
    setOpenCreateDrawer(true);
    setPresetCreationValues(data);
  };

  // Timeline
  const [showTimeline, setShowTimeline] = useState<boolean>(
    () => {
      const storedValue = localStorage.getItem(`${exerciseOrScenarioId}_show_injects_timeline`);
      return storedValue === null ? true : storedValue === 'true';
    },
  );
  const handleShowTimeline = () => {
    setShowTimeline(!showTimeline);
    localStorage.setItem(`${exerciseOrScenarioId}_show_injects_timeline`, String(!showTimeline));
  };

  // Filters
  const availableFilterNames = [
    'inject_platforms',
    'inject_kill_chain_phases',
    'inject_injector_contract',
    'inject_type',
    'inject_title',
  ];

  const quickFilter: FilterGroup = {
    mode: 'and',
    filters: [
      buildEmptyFilter('inject_platforms', 'contains'),
      buildEmptyFilter('inject_kill_chain_phases', 'contains'),
      buildEmptyFilter('inject_injector_contract', 'contains'),
    ],
  };

  const { queryableHelpers, searchPaginationInput } = useQueryableWithLocalStorage(`${exerciseOrScenarioId}-injects`, buildSearchPagination({
    sorts: initSorting('inject_depends_duration', 'ASC'),
    filterGroup: quickFilter,
    size: 100,
  }));

  return (
    <>
      <PaginationComponentV2
        fetch={(input) => injectContext.searchInjects(input)}
        searchPaginationInput={searchPaginationInput}
        setContent={setInjects}
        entityPrefix="inject"
        availableFilterNames={availableFilterNames}
        queryableHelpers={queryableHelpers}
        disablePagination
        topBarButtons={
          <InjectsListButtons injects={injects} setViewMode={setViewMode} showTimeline={showTimeline} handleShowTimeline={handleShowTimeline} />
        }
      />
      {showTimeline && (
        <div style={{ marginBottom: 50 }}>
          <div>
            <ChainedTimeline
              injects={injects}
              onConnectInjects={onConnectInjects}
              exerciseOrScenarioId={exerciseOrScenarioId}
              openCreateInjectDrawer={openCreateInjectDrawer}
              onSelectedInject={(inject) => {
                const injectContract = inject?.inject_injector_contract.convertedContent;
                const isContractExposed = injectContract?.config.expose;
                if (injectContract && isContractExposed) {
                  setSelectedInjectId(inject?.inject_id);
                }
              }}
            />
            <div className="clearfix" />
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
              onChange={handleToggleSelectAll}
              disabled={typeof handleToggleSelectAll !== 'function'}
            />
          </ListItemIcon>
          <ListItemIcon />
          <ListItemText
            primary={
              <SortHeadersComponentV2
                headers={headers}
                inlineStylesHeaders={inlineStyles}
                sortHelpers={queryableHelpers.sortHelpers}
              />
            }
          />
          <ListItemSecondaryAction />
        </ListItem>
        {injects.map((inject: InjectOutputType, index) => {
          const injectContract = inject.inject_injector_contract?.convertedContent;
          const isContractExposed = injectContract?.config.expose;
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
                    <div className={classes.bodyItems}>
                      {headers.map((header) => (
                        <div
                          key={header.field}
                          className={classes.bodyItem}
                          style={inlineStyles[header.field]}
                        >
                          {header.value(inject, injectContract)}
                        </div>
                      ))}
                    </div>
                  </div>
                }
              />
              <ListItemSecondaryAction>
                <InjectPopover
                  inject={inject}
                  exerciseOrScenarioId={exerciseOrScenarioId}
                  canBeTested
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
              // @ts-expect-error typing
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
            // @ts-expect-error typing
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
    </>
  );
};

export default Injects;
