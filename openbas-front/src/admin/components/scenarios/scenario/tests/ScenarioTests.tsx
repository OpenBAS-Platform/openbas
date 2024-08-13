import { makeStyles } from '@mui/styles';
import React, { CSSProperties, FunctionComponent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import type { ScenarioStore } from '../../../../../actions/scenarios/Scenario';
import { useFormatter } from '../../../../../components/i18n';
import ItemStatus from '../../../../../components/ItemStatus';
import type { InjectTestStatus, SearchPaginationInput } from '../../../../../utils/api-types';
import { initSorting } from '../../../../../components/common/pagination/Page';
import { searchScenarioInjectTests } from '../../../../../actions/inject_test/inject-test-actions';
import SortHeadersComponent from '../../../../../components/common/pagination/SortHeadersComponent';
import InjectIcon from '../../../common/injects/InjectIcon';
import { isNotEmptyField } from '../../../../../utils/utils';
import Empty from '../../../../../components/Empty';
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

const ScenarioTests: FunctionComponent = () => {
  // Standard hooks
  const classes = useStyles();
  const { t, fldt } = useFormatter();

  const { scenarioId } = useParams() as { scenarioId: ScenarioStore['scenario_id'] };
  const [selectedTest, setSelectedTest] = useState<InjectTestStatus | null>(null);

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
  const [scenarioTests, setScenarioTests] = useState<InjectTestStatus[] | null>([]);
  const [searchPaginationInput, setSearchPaginationInput] = useState<SearchPaginationInput>({
    sorts: initSorting('inject_title'),
  });

  useEffect(() => {
    searchScenarioInjectTests(scenarioId).then((result: { data: InjectTestStatus[] }) => {
      setScenarioTests(result.data);
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
        {scenarioTests?.map((scenarioTest) => {
          return (
            <ListItem
              key={scenarioTest.status_id}
              classes={{ root: classes.item }}
              divider
            >
              <ListItemButton
                classes={{ root: classes.item }}
                onClick={() => setSelectedTest(scenarioTest)}
              >
                <ListItemIcon>
                  <InjectIcon
                    isPayload={isNotEmptyField(scenarioTest.injector_contract?.injector_contract_payload)}
                    type={
                      scenarioTest.injector_contract?.injector_contract_payload
                        ? scenarioTest.injector_contract?.injector_contract_payload.payload_collector_type
                        || scenarioTest.injector_contract?.injector_contract_payload.payload_type
                        : scenarioTest.inject_type
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
                          {header.value(scenarioTest)}
                        </div>
                      ))}
                    </div>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
        {!scenarioTests ? (<Empty message={t('No data available')} />) : null}
      </List>
      {
        selectedTest !== null
        && <InjectTestDetail open handleClose={() => setSelectedTest(null)} statusId={selectedTest.status_id} />
      }
    </>
  );
};

export default ScenarioTests;
