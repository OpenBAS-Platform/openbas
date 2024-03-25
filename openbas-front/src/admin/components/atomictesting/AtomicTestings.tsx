import React, { CSSProperties } from 'react';
import { makeStyles } from '@mui/styles';
import { CSVLink } from 'react-csv';
import { IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { FileDownloadOutlined, MovieFilterOutlined } from '@mui/icons-material';
import { useAppDispatch } from '../../../utils/hooks';
import { useFormatter } from '../../../components/i18n';
import useSearchAnFilter from '../../../utils/SortingFiltering';
import { useHelper } from '../../../store';
import useDataLoader from '../../../utils/ServerSideEvent';
import type { InjectHelper } from '../../../actions/injects/inject-helper';
import type { InjectStore } from '../../../actions/injects/Inject';
import type { Inject } from '../../../utils/api-types';
import { fetchAtomicInjects } from '../../../actions/Inject';
import Breadcrumbs from '../../../components/Breadcrumbs';
import SearchFilter from '../../../components/SearchFilter';
import TagsFilter from '../../../components/TagsFilter';
import { exportData } from '../../../utils/Environment';
import ItemTags from '../../../components/ItemTags';

const useStyles = makeStyles(() => ({
  parameters: {
    marginTop: -10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  bodyItem: {
    height: 20,
    fontSize: 13,
    float: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: 10,
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
    width: '10%',
    fontSize: 12,
    fontWeight: '700',
  },
  inject_assets: {
    float: 'left',
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
  inject_players: {
    float: 'left',
    width: '10%',
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
    width: '10%',
  },
  inject_assets: {
    width: '20%',
  },
  inject_players: {
    width: '10%',
  },
  inject_status: {
    width: '10%',
  },
  inject_tags: {
    width: '10%',
  },
};

const AtomicTestings: React.FC = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { t } = useFormatter();
  // Filter and sort hook
  const filtering = useSearchAnFilter('injects', 'title', ['title']);
  const { injects }: { injects: Inject } = useHelper((helper: InjectHelper) => ({
    injects: helper.getAtomicInjects(),
  }));

  useDataLoader(() => {
    dispatch(fetchAtomicInjects());
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
      value: (atomicTesting: InjectStore) => atomicTesting.inject_type,
    },
    {
      name: 'inject_date',
      label: 'Date',
      isSortable: true,
      value: (atomicTesting: InjectStore) => atomicTesting.inject_date,
    },
    {
      name: 'inject_players',
      label: 'Teams',
      isSortable: true,
      value: (atomicTesting: InjectStore) => atomicTesting.inject_all_teams,
    },
    {
      name: 'inject_tag',
      label: 'Tag',
      isSortable: true,
      value: (atomicTesting: InjectStore) => <ItemTags variant="list" tags={atomicTesting.inject_tags}/>,
    },
  ];
  const sortedAtomicTestings: InjectStore[] = filtering.filterAndSort(injects);
  // Fetching data
  return (
    <>
      <Breadcrumbs variant="list" elements={[{ label: t('Atomic Testings'), current: true }]}/>
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
              filename={'Scenarios.csv'}
            >
              <Tooltip title={t('Export this list')}>
                <IconButton size="large">
                  <FileDownloadOutlined color="primary"/>
                </IconButton>
              </Tooltip>
            </CSVLink>
          ) : (
            <IconButton size="large" disabled>
              <FileDownloadOutlined/>
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
        {sortedAtomicTestings.map((atomicTesting) => (
          <ListItemButton
            key={atomicTesting.inject_id}
            classes={{ root: classes.item }}
            divider
          >
            <ListItemIcon>
              <MovieFilterOutlined color="primary"/>
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
          </ListItemButton>
        ))}
      </List>
    </>
  );
};

export default AtomicTestings;
