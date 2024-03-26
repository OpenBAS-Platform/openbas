import React, { CSSProperties, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { CSVLink } from 'react-csv';
import { IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemSecondaryAction, ListItemText, Tooltip } from '@mui/material';
import { FileDownloadOutlined, MovieFilterOutlined } from '@mui/icons-material';
import * as R from 'ramda';
import { useAppDispatch } from '../../../utils/hooks';
import { useFormatter } from '../../../components/i18n';
import useSearchAnFilter from '../../../utils/SortingFiltering';
import { useHelper } from '../../../store';
import useDataLoader from '../../../utils/ServerSideEvent';
import type { InjectHelper } from '../../../actions/injects/inject-helper';
import type { InjectStore } from '../../../actions/injects/Inject';
import { fetchAtomicTestings } from '../../../actions/Inject';
import Breadcrumbs from '../../../components/Breadcrumbs';
import SearchFilter from '../../../components/SearchFilter';
import TagsFilter from '../../../components/TagsFilter';
import { exportData } from '../../../utils/Environment';
import ItemTags from '../../../components/ItemTags';
import InjectPopover from '../components/injects/InjectPopover';
import type { TagsHelper } from '../../../actions/helper';
import InjectIcon from '../components/injects/InjectIcon';
import InjectType from '../components/injects/InjectType';
import ItemBoolean from '../../../components/ItemBoolean';

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
  inject_date: {
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
    width: '10%',
    fontSize: 12,
    fontWeight: '700',
  },
  inject_tags: {
    float: 'left',
    width: '10%',
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
  inject_date: {
    width: '20%',
  },
  inject_players: {
    width: '20%',
  },
  inject_status: {
    width: '10%',
  },
  inject_tags: {
    width: '10%',
  },
};

// eslint-disable-next-line consistent-return
const AtomicTestings = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { t, tPick, fldt } = useFormatter();
  const [selectedAtomicTesting, setSelectedAtomicTesting] = useState<string | undefined>(undefined);
  // Filter and sort hook
  const filtering = useSearchAnFilter('injects', 'title', ['title']);
  const { injects, tagsMap } = useHelper((helper: InjectHelper & TagsHelper) => ({
    injects: helper.getAtomicTestings(),
    tagsMap: helper.getTagsMap(),
  }));
  const { injectTypesMap, injectTypesWithNoTeams } = useHelper((helper: any) => {
    return {
      injectTypesMap: helper.getInjectTypesMap(),
      injectTypesWithNoTeams: helper.getInjectTypesWithNoTeams(),
    };
  });
  const injectTypes = Object.values(injectTypesMap);
  const disabledTypes = injectTypes;
  const types = injectTypes.map((type: any) => type.config.type);

  useDataLoader(() => {
    dispatch(fetchAtomicTestings());
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
      value: (atomicTesting: InjectStore) => atomicTesting.inject_type, // check chip
    },
    {
      name: 'inject_date',
      label: 'Date',
      isSortable: true,
      value: (atomicTesting: InjectStore) => fldt(atomicTesting.inject_date),
    },
    {
      name: 'inject_players',
      label: 'Teams',
      isSortable: true,
      value: (atomicTesting: InjectStore) => atomicTesting.inject_users_number,
    },
    {
      name: 'inject_status',
      label: 'Status',
      isSortable: true,
      value: (atomicTesting: InjectStore) => atomicTesting.inject_enabled,
    },
    {
      name: 'inject_tag',
      label: 'Tag',
      isSortable: true,
      value: (atomicTesting: InjectStore) => <ItemTags variant="list" tags={atomicTesting.inject_tags} />,
    },
  ];
  const sortedAtomicTestings: InjectStore[] = filtering.filterAndSort(injects);
  // Fetching data
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
          const injectContract = injectTypesMap[atomicTesting.inject_contract];
          const isDisabled = disabledTypes.includes(atomicTesting.inject_type)
            || !types.includes(atomicTesting.inject_type);
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
                  config={injectContract?.config}
                  type={atomicTesting.inject_type}
                  disabled={
                    !injectContract || isDisabled || !atomicTesting.inject_enabled
                  }
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
                  setSelectedInject={setSelectedAtomicTesting}
                  isDisabled={false}
                />
              </ListItemSecondaryAction>

            </ListItemButton>
          );
        })}
      </List>
    </>
  );
};

export default AtomicTestings;
