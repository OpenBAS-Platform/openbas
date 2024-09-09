import { makeStyles } from '@mui/styles';
import React, { CSSProperties, FunctionComponent, useEffect, useState } from 'react';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import type { InjectTestStatus, SearchPaginationInput } from '../../../utils/api-types';
import { useFormatter } from '../../../components/i18n';
import ItemStatus from '../../../components/ItemStatus';
import { Page } from '../../../components/common/queryable/Page';
import SortHeadersComponent from '../../../components/common/pagination/SortHeadersComponent';
import InjectIcon from '../common/injects/InjectIcon';
import { isNotEmptyField } from '../../../utils/utils';
import Empty from '../../../components/Empty';
import InjectTestDetail from './InjectTestDetail';
import PaginationComponent from '../../../components/common/pagination/PaginationComponent';
import { buildSearchPagination } from '../../../components/common/queryable/QueryableUtils';
import InjectTestPopover from './InjectTestPopover';
import InjectTestReplayAll from './InjectTestReplayAll';

const useStyles = makeStyles(() => ({
  bodyItems: {
    display: 'flex',
    alignItems: 'center',
  },
  bodyItem: {
    height: 20,
    fontSize: 13,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: 10,
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
}));

const inlineStyles: Record<string, CSSProperties> = {
  inject_title: {
    width: '40%',
    cursor: 'default',
  },
  tracking_sent_date: {
    width: '40%',
  },
  status_name: {
    width: '20%',
  },
};

interface Props {
  searchInjectTests: (exerciseOrScenarioId: string, input: SearchPaginationInput) => Promise<{ data: Page<InjectTestStatus> }>;
  searchInjectTest: (testId: string) => Promise<{ data: InjectTestStatus }>;
  exerciseOrScenarioId: string;
  statusId: string | undefined;
}

const InjectTestList: FunctionComponent<Props> = ({
  searchInjectTests,
  searchInjectTest,
  exerciseOrScenarioId,
  statusId,
}) => {
  // Standard hooks
  const classes = useStyles();
  const { t, fldt } = useFormatter();

  const [selectedTest, setSelectedTest] = useState<InjectTestStatus | null>(null);

  // Fetching test
  useEffect(() => {
    if (statusId !== null && statusId !== undefined) {
      searchInjectTest(statusId).then((result: { data: InjectTestStatus }) => {
        setSelectedTest(result.data);
      });
    }
  }, [statusId]);

  // Headers
  const headers = [
    {
      field: 'inject_title',
      label: 'Inject title',
      isSortable: true,
      value: (test: InjectTestStatus) => test.inject_title,
    },
    {
      field: 'tracking_sent_date',
      label: 'Test execution time',
      isSortable: true,
      value: (test: InjectTestStatus) => fldt(test.tracking_sent_date),
    },
    {
      field: 'status_name',
      label: 'Test status',
      isSortable: true,
      value: (test: InjectTestStatus) => {
        return (<ItemStatus isInject={true} status={test.status_name} label={t(test.status_name)} variant="inList" />);
      },
    },
  ];

  // Filter and sort hook
  const [tests, setTests] = useState<InjectTestStatus[] | null>([]);
  const [searchPaginationInput, setSearchPaginationInput] = useState<SearchPaginationInput>(buildSearchPagination({}));

  return (
    <>
      <PaginationComponent
        fetch={(input) => searchInjectTests(exerciseOrScenarioId, input)}
        searchPaginationInput={searchPaginationInput}
        setContent={setTests}
      >
        <InjectTestReplayAll injectIds={tests?.map((test: InjectTestStatus) => test.inject_id!)} onTest={(result) => setTests(result)} />
      </PaginationComponent>
      <List style={{ marginTop: 40 }}>
        <ListItem
          classes={{ root: classes.itemHead }}
          divider={false}
          style={{ paddingTop: 0 }}
          secondaryAction={<>&nbsp;</>}
        >
          <ListItemIcon />
          <ListItemText
            primary={
              <SortHeadersComponent
                headers={headers}
                inlineStylesHeaders={inlineStyles}
                searchPaginationInput={searchPaginationInput}
                setSearchPaginationInput={setSearchPaginationInput}
                defaultSortAsc
              />
            }
          />
        </ListItem>
        {tests?.map((test) => {
          return (
            <ListItem
              key={test.status_id}
              classes={{ root: classes.item }}
              divider
              secondaryAction={
                <InjectTestPopover
                  injectTestStatus={test}
                  onTest={(result) => setTests(tests?.map((existing) => (existing.status_id !== result.status_id ? existing : result)))}
                  onDelete={(result) => setTests(tests.filter((existing) => (existing.status_id !== result)))}
                />
              }
              disablePadding
            >
              <ListItemButton
                classes={{ root: classes.item }}
                onClick={() => setSelectedTest(test)}
                selected={test.status_id === selectedTest?.status_id}
              >
                <ListItemIcon>
                  <InjectIcon
                    isPayload={isNotEmptyField(test.injector_contract?.injector_contract_payload)}
                    type={
                      test.injector_contract?.injector_contract_payload
                        ? test.injector_contract?.injector_contract_payload.payload_collector_type
                        || test.injector_contract?.injector_contract_payload.payload_type
                        : test.inject_type
                    }
                    variant="list"
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <div className={classes.bodyItems}>
                      {headers.map((header) => (
                        <div
                          key={header.field}
                          className={classes.bodyItem}
                          style={inlineStyles[header.field]}
                        >
                          {header.value(test)}
                        </div>
                      ))}
                    </div>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
        {!tests ? (<Empty message={t('No data available')} />) : null}
      </List>
      {
        selectedTest !== null
        && <InjectTestDetail open handleClose={() => setSelectedTest(null)} test={selectedTest} />
      }
    </>
  );
};

export default InjectTestList;
