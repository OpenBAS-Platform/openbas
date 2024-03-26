import React, { CSSProperties, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { CSVLink } from 'react-csv';
import { Chip, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemSecondaryAction, ListItemText, Tooltip } from '@mui/material';
import { FileDownloadOutlined, MovieFilterOutlined } from '@mui/icons-material';
import R from 'ramda';
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
import { splitDuration } from '../../../utils/Time';
import InjectType from '../components/injects/InjectType';
import ItemBoolean from '../../../components/ItemBoolean';

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
  downloadButton: {
    marginRight: 15,
  },
  bodyItem: {
    height: '100%',
    fontSize: 13,
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

// eslint-disable-next-line consistent-return
const AtomicTestings = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { t, tPick } = useFormatter();
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
      value: (atomicTesting: InjectStore) => <ItemTags variant="list" tags={atomicTesting.inject_tags} />,
    },
  ];
  const sortedAtomicTestings: InjectStore[] = filtering.filterAndSort(injects);
  // Fetching data
  if (injects && !R.isEmpty(injectTypesMap)) {
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
            // @ts-expect-error will be corrected
            const injectContract = injectTypesMap[atomicTesting.inject_contract];
            const injectTypeName = tPick(injectContract?.label);
            const isDisabled = disabledTypes.includes(atomicTesting.inject_type)
              || !types.includes(atomicTesting.inject_type);
            const isNoTeam = injectTypesWithNoTeams.includes(
              atomicTesting.inject_type,
            );
            let injectStatus = atomicTesting.inject_enabled
              ? t('Enabled')
              : t('Disabled');
            if (atomicTesting.inject_content === null) {
              injectStatus = t('To fill');
            }
            return (
              <ListItem
                key={atomicTesting.inject_id}
                classes={{ root: classes.item }}
                divider={true}
                button={true}
                disabled={
                  !injectContract || isDisabled || !atomicTesting.inject_enabled
                }
                onClick={() => setSelectedAtomicTesting(atomicTesting.inject_id)}
              >
                <ListItemIcon style={{ paddingTop: 5 }}>
                  <InjectIcon
                    tooltip={t(atomicTesting.inject_type)}
                    // @ts-expect-error will be corrected
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
                      <div
                        className={classes.bodyItem}
                        style={inlineStyles.inject_type}
                      >
                        <InjectType
                          variant="list"
                          config={injectContract?.config}
                          label={injectTypeName}
                        />
                      </div>
                      <div
                        className={classes.bodyItem}
                        style={inlineStyles.inject_title}
                      >
                        {atomicTesting.inject_title}
                      </div>
                      <div
                        className={classes.bodyItem}
                        style={inlineStyles.inject_users_number}
                      >
                        {isNoTeam ? t('N/A') : atomicTesting.inject_users_number}
                      </div>
                      <div
                        className={classes.bodyItem}
                        style={inlineStyles.inject_enabled}
                      >
                        <ItemBoolean
                          status={
                            atomicTesting.inject_content === null
                              ? false
                              : atomicTesting.inject_enabled
                          }
                          label={injectStatus}
                          variant="inList"
                        />
                      </div>
                      <div
                        className={classes.bodyItem}
                        style={inlineStyles.inject_tags}
                      >
                        <ItemTags variant="list" tags={atomicTesting.inject_tags} />
                      </div>
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <InjectPopover
                    inject={atomicTesting}
                    injectTypesMap={injectTypesMap}
                    tagsMap={tagsMap}
                    setSelectedInject={setSelectedAtomicTesting}
                    isDisabled={!injectContract || isDisabled}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      </>
    );
  }
};

export default AtomicTestings;
