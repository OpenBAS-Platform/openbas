import React, { CSSProperties } from 'react';
import { makeStyles } from '@mui/styles';
import { CSVLink } from 'react-csv';
import { IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';
import { FileDownloadOutlined } from '@mui/icons-material';
import { useAppDispatch } from '../../../utils/hooks';
import { useFormatter } from '../../../components/i18n';
import useSearchAnFilter from '../../../utils/SortingFiltering';
import { useHelper } from '../../../store';
import useDataLoader from '../../../utils/ServerSideEvent';
import type { InjectHelper } from '../../../actions/injects/inject-helper';
import { fetchInjectTypes } from '../../../actions/Inject';
import Breadcrumbs from '../../../components/Breadcrumbs';
import SearchFilter from '../../../components/SearchFilter';
import { exportData } from '../../../utils/Environment';
import type { UsersHelper } from '../../../actions/helper';
import InjectIcon from '../components/injects/InjectIcon';
import InjectType from '../components/injects/InjectType';
import type { AtomicTestingOutput, Contract } from '../../../utils/api-types';
import { fetchAtomicTestings } from '../../../actions/atomictestings/atomic-testing-actions';
import AtomicTestingCreation from './AtomicTestingCreation';
import AtomicTestingResult from '../components/atomictestings/AtomicTestingResult';
import TargetChip from '../components/atomictestings/TargetChip';
import type { AtomicTestingHelper } from '../../../actions/atomictestings/atomic-testing-helper';
import Empty from '../../../components/Empty';

const useStyles = makeStyles(() => ({
  parameters: {
    marginTop: -10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bodyItem: {
    height: 30,
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
    marginBottom: 10,
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
  atomic_title: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  atomic_type: {
    float: 'left',
    width: '25%',
    fontSize: 12,
    fontWeight: '700',
  },
  atomic_last_execution_date: {
    float: 'left',
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
  atomic_targets: {
    float: 'left',
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
  atomic_expectations: {
    float: 'left',
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },

};

const inlineStyles: Record<string, CSSProperties> = {
  atomic_title: {
    width: '15%',
  },
  atomic_type: {
    width: '25%',
  },
  atomic_last_execution_date: {
    width: '20%',
  },
  atomic_targets: {
    width: '20%',
  },
  atomic_expectations: {
    width: '20%',
  },
};

// eslint-disable-next-line consistent-return
const AtomicTestings = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { t, fldt, tPick } = useFormatter();

  // Filter and sort hook
  const filtering = useSearchAnFilter('atomic', 'title', ['title']);

  // Fetching data
  const { atomics, injectTypesMap }: {
    atomics: AtomicTestingOutput[],
    injectTypesMap: Record<string, Contract>,
  } = useHelper((helper: InjectHelper & AtomicTestingHelper) => ({
    atomics: helper.getAtomicTestings(),
    injectTypesMap: helper.getInjectTypesMap(),
  }));

  const { userAdmin } = useHelper((helper: UsersHelper) => ({
    userAdmin: helper.getMe()?.user_admin ?? false,
  }));

  useDataLoader(() => {
    dispatch(fetchAtomicTestings());
    dispatch(fetchInjectTypes());
  });

  // Headers
  const fields = [
    {
      name: 'atomic_title',
      label: 'Title',
      isSortable: true,
      value: (atomicTesting: AtomicTestingOutput) => atomicTesting.atomic_title,
    },
    {
      name: 'atomic_type',
      label: 'Type',
      isSortable: true,
      value: (atomicTesting: AtomicTestingOutput) => {
        const injectContract = injectTypesMap[atomicTesting.atomic_contract];
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
      name: 'atomic_last_execution_date',
      label: 'Date',
      isSortable: true,
      value: (atomicTesting: AtomicTestingOutput) => fldt(atomicTesting.atomic_last_execution_date),
    },
    {
      name: 'atomic_targets',
      label: 'Target',
      isSortable: true,
      value: (atomicTesting: AtomicTestingOutput) => {
        return (<TargetChip targets={atomicTesting.atomic_targets} />);
      },
    },
    {
      name: 'atomic_expectations',
      label: 'Global score',
      isSortable: true,
      value: (atomicTesting: AtomicTestingOutput) => {
        return (
          <AtomicTestingResult expectations={atomicTesting.atomic_expectation_results} />
        );
      },
    },
  ];
  const sortedAtomicTestings: AtomicTestingOutput[] = filtering.filterAndSort(atomics);

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
          return (
            <ListItemButton
              key={atomicTesting.atomic_id}
              classes={{ root: classes.item }}
              divider
              component={Link}
              to={`/admin/atomic_testings/${atomicTesting.atomic_id}`}
            >
              <ListItemIcon>
                <InjectIcon
                  tooltip={t(atomicTesting.atomic_type)}
                  type={atomicTesting.atomic_type}
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
            </ListItemButton>
          );
        })}
        {!sortedAtomicTestings ? (
          <Empty message={t('No data available')}/>
        ) : null}
      </List>
      {userAdmin && <AtomicTestingCreation />}
    </>
  );
};

export default AtomicTestings;
