import React, { CSSProperties, FunctionComponent, useMemo, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useFormatter } from '../../../components/i18n';
import InjectIcon from '../common/injects/InjectIcon';
import type { InjectResultDTO, SearchPaginationInput } from '../../../utils/api-types';
import Empty from '../../../components/Empty';
import { type Page } from '../../../components/common/queryable/Page';
import InjectorContract from '../common/injects/InjectorContract';
import AtomicTestingPopover from './atomic_testing/AtomicTestingPopover';
import { isNotEmptyField } from '../../../utils/utils';
import { QueryableHelpers } from '../../../components/common/queryable/QueryableHelpers';
import PaginationComponentV2 from '../../../components/common/queryable/pagination/PaginationComponentV2';
import SortHeadersComponentV2 from '../../../components/common/queryable/sort/SortHeadersComponentV2';
import { Header } from '../../../components/common/SortHeadersList';
import ItemStatus from '../../../components/ItemStatus';
import AtomicTestingResult from './atomic_testing/AtomicTestingResult';
import ItemTargets from '../../../components/ItemTargets';

const useStyles = makeStyles(() => ({
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
    width: '10%',
  },
  inject_title: {
    width: '20%',
  },
  'inject_status.tracking_sent_date': {
    width: '15%',
  },
  inject_status: {
    width: '10%',
  },
  inject_targets: {
    width: '20%',
  },
  inject_expectations: {
    width: '10%',
  },
  inject_updated_at: {
    width: '15%',
  },
};

interface Props {
  fetchInjects: (input: SearchPaginationInput) => Promise<{ data: Page<InjectResultDTO> }>;
  goTo: (injectId: string) => string;
  queryableHelpers: QueryableHelpers;
  searchPaginationInput: SearchPaginationInput;
  availableFilterNames?: string[];
}

const InjectDtoList: FunctionComponent<Props> = ({
  fetchInjects,
  goTo,
  queryableHelpers,
  searchPaginationInput,
  availableFilterNames = [],
}) => {
  // Standard hooks
  const classes = useStyles();
  const { t, fldt, tPick, nsdt } = useFormatter();

  // Filter and sort hook
  const [injects, setInjects] = useState<InjectResultDTO[]>([]);

  // Headers
  const headers: Header[] = useMemo(() => [
    {
      field: 'inject_type',
      label: 'Type',
      isSortable: false,
      value: (injectDto: InjectResultDTO) => {
        if (injectDto.inject_injector_contract) {
          return (
            <InjectorContract variant="list" label={tPick(injectDto.inject_injector_contract?.injector_contract_labels)} />
          );
        }
        return <InjectorContract variant="list" label={t('Deleted')} deleted={true} />;
      },
    },
    {
      field: 'inject_title',
      label: 'Title',
      isSortable: true,
      value: (injectDto: InjectResultDTO) => {
        return <>{injectDto.inject_title}</>;
      },
    },
    {
      field: 'inject_status.tracking_sent_date',
      label: 'Execution Date',
      isSortable: false,
      value: (injectDto: InjectResultDTO) => {
        return <>{fldt(injectDto.inject_status?.tracking_sent_date)}</>;
      },
    },
    {
      field: 'inject_status',
      label: 'Status',
      isSortable: false,
      value: (injectDto: InjectResultDTO) => {
        return (<ItemStatus isInject status={injectDto.inject_status?.status_name} label={t(injectDto.inject_status?.status_name)} variant="inList" />);
      },
    },
    {
      field: 'inject_targets',
      label: 'Target',
      isSortable: false,
      value: (injectDto: InjectResultDTO) => {
        return (<ItemTargets targets={injectDto.inject_targets} />);
      },
    },
    {
      field: 'inject_expectations',
      label: 'Global score',
      isSortable: false,
      value: (injectDto: InjectResultDTO) => {
        return (
          <AtomicTestingResult expectations={injectDto.inject_expectation_results} />
        );
      },
    },
    {
      field: 'inject_updated_at',
      label: 'Updated',
      isSortable: true,
      value: (injectDto: InjectResultDTO) => {
        return <>{nsdt(injectDto.inject_updated_at)}</>;
      },
    },
  ], []);

  return (
    <>
      <PaginationComponentV2
        fetch={fetchInjects}
        searchPaginationInput={searchPaginationInput}
        setContent={setInjects}
        entityPrefix="inject"
        availableFilterNames={availableFilterNames}
        queryableHelpers={queryableHelpers}
      />
      <List>
        <ListItem
          classes={{ root: classes.itemHead }}
          divider={false}
          style={{ paddingTop: 0 }}
          secondaryAction={<>&nbsp;</>}
        >
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
        </ListItem>
        {injects.map((injectDto) => {
          return (
            <ListItem
              key={injectDto.inject_id}
              classes={{ root: classes.item }}
              divider
              secondaryAction={
                <AtomicTestingPopover
                  atomic={injectDto}
                  actions={['Duplicate', 'Delete']}
                  onDelete={(result) => setInjects(injects.filter((e) => (e.inject_id !== result)))}
                  inList
                />
              }
              disablePadding
            >
              <ListItemButton
                href={goTo(injectDto.inject_id)}
              >
                <ListItemIcon>
                  <InjectIcon
                    isPayload={isNotEmptyField(injectDto.inject_injector_contract?.injector_contract_payload)}
                    type={
                      injectDto.inject_injector_contract?.injector_contract_payload
                        ? injectDto.inject_injector_contract.injector_contract_payload.payload_collector_type
                        || injectDto.inject_injector_contract.injector_contract_payload.payload_type
                        : injectDto.inject_type
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
                          {header.value?.(injectDto)}
                        </div>
                      ))}
                    </div>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
        {!injects ? (<Empty message={t('No data available')} />) : null}
      </List>
    </>
  );
};

export default InjectDtoList;
