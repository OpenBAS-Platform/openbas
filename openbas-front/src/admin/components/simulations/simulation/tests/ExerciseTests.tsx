import { makeStyles } from '@mui/styles';
import React, { CSSProperties, FunctionComponent, useEffect, useState } from 'react';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useLocation, useParams } from 'react-router-dom';
import { useFormatter } from '../../../../../components/i18n';
import type { Exercise, InjectTestStatus, SearchPaginationInput } from '../../../../../utils/api-types';
import { initSorting } from '../../../../../components/common/pagination/Page';
import ItemStatus from '../../../../../components/ItemStatus';
import { fetchInjectTestStatus, searchExerciseInjectTests } from '../../../../../actions/inject_test/inject-test-actions';
import SortHeadersComponent from '../../../../../components/common/pagination/SortHeadersComponent';
import Empty from '../../../../../components/Empty';
import InjectIcon from '../../../common/injects/InjectIcon';
import { isNotEmptyField } from '../../../../../utils/utils';
import InjectTestDetail from '../../../injects/InjectTestDetail';

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

const ExerciseTests: FunctionComponent = () => {
  // Standard hooks
  const classes = useStyles();
  const { t, fldt } = useFormatter();

  const { exerciseId } = useParams() as { exerciseId: Exercise['exercise_id'] };
  const [selectedTest, setSelectedTest] = useState<InjectTestStatus | null>(null);
  const location = useLocation();

  // Fetching data
  useEffect(() => {
    if (location !== null && location.state !== null && location.state.statusId !== null && location.state.statusId !== undefined) {
      fetchInjectTestStatus(location.state.statusId).then((result: { data: InjectTestStatus }) => {
        setSelectedTest(result.data);
      });
    }
  }, [location.state]);

  // Headers
  const headers = [
    {
      field: 'inject_title',
      label: 'Inject Title',
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
      label: 'Status',
      isSortable: true,
      value: (test: InjectTestStatus) => {
        return (<ItemStatus isInject={true} status={test.status_name} label={t(test.status_name)} variant="inList" />);
      },
    },
  ];

  // Filter and sort hook
  const [exerciseTests, setExerciseTests] = useState<InjectTestStatus[] | null>([]);
  const [searchPaginationInput, setSearchPaginationInput] = useState<SearchPaginationInput>({
    sorts: initSorting('inject_title'),
  });

  useEffect(() => {
    searchExerciseInjectTests(exerciseId).then((result: { data: InjectTestStatus[] }) => {
      setExerciseTests(result.data);
    });
  }, []);

  return (
    <>
      <List>
        <ListItem
          classes={{ root: classes.itemHead }}
          divider={false}
          style={{ paddingTop: 0 }}
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
        {exerciseTests?.map((exerciseTest) => {
          return (
            <ListItem
              key={exerciseTest.status_id}
              classes={{ root: classes.item }}
              divider
            >
              <ListItemButton
                classes={{ root: classes.item }}
                onClick={() => setSelectedTest(exerciseTest)}
              >
                <ListItemIcon>
                  <InjectIcon
                    isPayload={isNotEmptyField(exerciseTest.injector_contract?.injector_contract_payload)}
                    type={
                      exerciseTest.injector_contract?.injector_contract_payload
                        ? exerciseTest.injector_contract?.injector_contract_payload.payload_collector_type
                        || exerciseTest.injector_contract?.injector_contract_payload.payload_type
                        : exerciseTest.inject_type
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
                          {header.value(exerciseTest)}
                        </div>
                      ))}
                    </div>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
        {!exerciseTests ? (<Empty message={t('No data available')} />) : null}
      </List>
      {
        selectedTest !== null
        && <InjectTestDetail open handleClose={() => setSelectedTest(null)} test={selectedTest} />
      }
    </>
  );
};

export default ExerciseTests;
