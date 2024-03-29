import React, { CSSProperties, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { CSVLink } from 'react-csv';
import { IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemSecondaryAction, ListItemText, Tooltip } from '@mui/material';
import { FileDownloadOutlined } from '@mui/icons-material';
import { useAppDispatch } from '../../../utils/hooks';
import { useFormatter } from '../../../components/i18n';
import useSearchAnFilter from '../../../utils/SortingFiltering';
import { useHelper } from '../../../store';
import useDataLoader from '../../../utils/ServerSideEvent';
import type { InjectHelper } from '../../../actions/injects/inject-helper';
import type { InjectStore } from '../../../actions/injects/Inject';
import { fetchInjectTypes } from '../../../actions/Inject';
import Breadcrumbs from '../../../components/Breadcrumbs';
import SearchFilter from '../../../components/SearchFilter';
import TagsFilter from '../../../components/TagsFilter';
import { exportData } from '../../../utils/Environment';
import InjectPopover from '../components/injects/InjectPopover';
import type { TagsHelper } from '../../../actions/helper';
import InjectIcon from '../components/injects/InjectIcon';
import InjectType from '../components/injects/InjectType';
import type { Contract, Inject, Tag } from '../../../utils/api-types';
import { AtomicTestingContext, AtomicTestingContextType } from '../components/Context';
import { fetchAtomicTesting, fetchAtomicTestings } from '../../../actions/atomictestings/atomic-testing-actions';
import AtomicTestingResult from '../components/atomictesting/AtomicTestingResult';

const useStyles = makeStyles(() => ({
  parameters: {
    marginTop: -10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bodyItem: {
    height: 20,
    fontSize: 13,
    float: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: 10,
  },
  filters: {
    display: 'flex',
    gap: '10px',
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
  downloadButton: {
    marginRight: 15,
  },
}));

const inlineStylesHeaders: Record<string, CSSProperties> = {
  iconSort: {
    position: 'absolute',
    margin: '0 0 0 5px',
    padding: 0,
    top: '0px',
  },
  inject_title: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  inject_type: {
    float: 'left',
    width: '25%',
    fontSize: 12,
    fontWeight: '700',
  },
  inject_updated_at: {
    float: 'left',
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
  inject_players: {
    float: 'left',
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
  inject_status: {
    float: 'left',
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },

};

const inlineStyles: Record<string, CSSProperties> = {
  inject_title: {
    width: '15%',
  },
  inject_type: {
    width: '25%',
  },
  inject_updated_at: {
    width: '20%',
  },
  inject_players: {
    width: '20%',
  },
  inject_status: {
    width: '20%',
  },
};

// eslint-disable-next-line consistent-return
const AtomicTestings = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { t, fldt, tPick } = useFormatter();
  const [selectedAtomicTesting, setSelectedAtomicTesting] = useState<string | undefined>(undefined);

  // Filter and sort hook
  const filtering = useSearchAnFilter('inject', 'title', ['title']);

  // Fetching data
  const { injects, tagsMap, injectTypesMap, injectTypesWithNoTeams }: {
    injects: Inject[],
    tagsMap: Record<string, Tag>,
    injectTypesMap: Record<string, Contract>,
    injectTypesWithNoTeams: (string | undefined)[]
  } = useHelper((helper: InjectHelper & TagsHelper) => ({
    injects: helper.getAtomicTestings(),
    tagsMap: helper.getTagsMap(),
    injectTypesMap: helper.getInjectTypesMap(),
    injectTypesWithNoTeams: helper.getInjectTypesWithNoTeams(),
  }));

  const injectTypes = Object.values(injectTypesMap);
  const disabledTypes = injectTypes;
  const types = injectTypes.map((type) => type.config.type);

  useDataLoader(() => {
    dispatch(fetchAtomicTestings());
    dispatch(fetchInjectTypes());
  });

  // Headers
  const fields = [
    {
      name: 'inject_title',
      label: 'Title',
      isSortable: true,
      value: (atomicTesting: InjectStore) => atomicTesting.inject_title,
    },
    {
      name: 'inject_type',
      label: 'Type',
      isSortable: true,
      value: (atomicTesting: InjectStore) => {
        const injectContract = injectTypesMap[atomicTesting.inject_contract];
        const injectTypeName = tPick(injectContract?.label);
        return (
          <InjectType
            variant="list"
            config={injectContract?.config}
            label={injectTypeName}
          />
        );
      },
    },
    {
      name: 'inject_updated_at',
      label: 'Date',
      isSortable: true,
      value: (atomicTesting: InjectStore) => fldt(atomicTesting.inject_status?.status_date || atomicTesting.inject_updated_at),
    },
    {
      name: 'inject_players',
      label: 'Teams',
      isSortable: true,
      value: (atomicTesting: InjectStore) => atomicTesting.inject_users_number,
    },
    {
      name: 'inject_result',
      label: 'Result',
      isSortable: true,
      value: (atomicTesting: InjectStore) => {
        const mockExpectations: { type: string, result: string }[] = [
          { type: 'PREVENTION', result: 'SUCCESS' },
          { type: 'DETECTION', result: 'ERROR' },
          { type: 'ARTICLE', result: 'PARTIAL' },
        ];
        return (
          <AtomicTestingResult expectations={mockExpectations} />
        );
      },
    },
  ];
  const sortedAtomicTestings: InjectStore[] = filtering.filterAndSort(injects);

  // Context
  const context: AtomicTestingContextType = {
    onUpdateStatusInject(injectId: Inject['inject_id']): void {
      return dispatch(fetchAtomicTesting(injectId));
    },
  };

  return (
    <>
      <Breadcrumbs variant="list" elements={[{ label: t('Atomic Testings'), current: true }]} />
      <div className={classes.parameters}>
        <div className={classes.filters}>
          <SearchFilter
            small
            onChange={filtering.handleSearch}
            keyword={filtering.keyword}
          />
          <TagsFilter
            onAddTag={filtering.handleAddTag}
            onRemoveTag={filtering.handleRemoveTag}
            currentTags={filtering.tags}
          />
        </div>
        <div className={classes.downloadButton}>
          {sortedAtomicTestings.length > 0 ? (
            <CSVLink
              data={exportData(
                'atomic-testing',
                fields.map((field) => field.name),
                sortedAtomicTestings,
              )}
              filename={'AtomicTestings.csv'}
            >
              <Tooltip title={t('Export this list')}>
                <IconButton size="large">
                  <FileDownloadOutlined color="primary" />
                </IconButton>
              </Tooltip>
            </CSVLink>
          ) : (
            <IconButton size="large" disabled>
              <FileDownloadOutlined />
            </IconButton>
          )}
        </div>
      </div>
      <AtomicTestingContext.Provider value={context}>
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
                  {fields.map((header) => (
                    <div key={header.name}>
                      {
                        filtering.buildHeader(
                          header.name,
                          header.label,
                          header.isSortable,
                          inlineStylesHeaders,
                        )
                      }
                    </div>
                  ))
                  }
                </>
              }
            />
          </ListItem>
          {sortedAtomicTestings.map((atomicTesting) => {
            return (
              <ListItemButton
                key={atomicTesting.inject_id}
                classes={{ root: classes.item }}
                divider
                onClick={() => setSelectedAtomicTesting(atomicTesting.inject_id)}
              >
                <ListItemIcon>
                  <InjectIcon
                    tooltip={t(atomicTesting.inject_type)}
                    type={atomicTesting.inject_type}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <>
                      {fields.map((field) => (
                        <div
                          key={field.name}
                          className={classes.bodyItem}
                          style={inlineStyles[field.name]}
                        >
                          {field.value(atomicTesting)}
                        </div>
                      ))}
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <InjectPopover
                    inject={atomicTesting}
                    tagsMap={tagsMap}
                    injectTypesMap={injectTypesMap}
                    setSelectedInject={setSelectedAtomicTesting}
                    isDisabled={true} // How is it calculated ?
                    isAtomicTesting={true}
                  />
                </ListItemSecondaryAction>
              </ListItemButton>
            );
          })}
        </List>
      </AtomicTestingContext.Provider>
    </>
  );
};

export default AtomicTestings;
