import React, { CSSProperties, FunctionComponent, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useFormatter } from '../../../components/i18n';
import InjectIcon from '../common/injects/InjectIcon';
import type { InjectResultDTO, SearchPaginationInput } from '../../../utils/api-types';
import AtomicTestingResult from './atomic_testing/AtomicTestingResult';
import ItemTargets from '../../../components/ItemTargets';
import Empty from '../../../components/Empty';
import { initSorting, type Page } from '../../../components/common/pagination/Page';
import PaginationComponent from '../../../components/common/pagination/PaginationComponent';
import SortHeadersComponent from '../../../components/common/pagination/SortHeadersComponent';
import InjectorContract from '../common/injects/InjectorContract';
import ItemStatus from '../../../components/ItemStatus';
import AtomicTestingPopover from './atomic_testing/AtomicTestingPopover';
import { isNotEmptyField } from '../../../utils/utils';

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
  inject_type: {
    width: '10%',
    cursor: 'default',
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
    cursor: 'default',
  },
  inject_expectations: {
    width: '10%',
    cursor: 'default',
  },
  inject_updated_at: {
    width: '15%',
  },
};

interface Props {
  fetchInjects: (input: SearchPaginationInput) => Promise<{ data: Page<InjectResultDTO> }>;
  goTo: (injectId: string) => string;
}

const InjectList: FunctionComponent<Props> = ({
  fetchInjects,
  goTo,
}) => {
  // Standard hooks
  const classes = useStyles();
  const { t, fldt, tPick, nsdt } = useFormatter();
  const [openDuplicateId, setOpenDuplicateId] = useState<string | null>(null);

  // Filter and sort hook
  const [injects, setInjects] = useState<InjectResultDTO[]>([]);
  const [searchPaginationInput, setSearchPaginationInput] = useState<SearchPaginationInput>({
    sorts: initSorting('inject_updated_at', 'DESC'),
  });

  // Headers
  const headers = [
    {
      field: 'inject_type',
      label: 'Type',
      isSortable: true,
      value: (injectDto: InjectResultDTO) => {
        if (injectDto.inject_injector_contract_labels && tPick(injectDto.inject_injector_contract_labels)) {
          return (
            <InjectorContract variant="list" label={tPick(injectDto.inject_injector_contract_labels)} />
          );
        }
        return <InjectorContract variant="list" label={t('Deleted')} deleted={true} />;
      },
    },
    {
      field: 'inject_title',
      label: 'Title',
      isSortable: true,
      value: (injectDto: InjectResultDTO) => injectDto.inject_title,
    },
    {
      field: 'inject_status.tracking_sent_date',
      label: 'Execution Date',
      isSortable: false,
      value: (injectDto: InjectResultDTO) => fldt(injectDto.inject_status?.tracking_sent_date),
    },
    {
      field: 'inject_status',
      label: 'Status',
      isSortable: true,
      value: (injectDto: InjectResultDTO) => {
        return (<ItemStatus isInject={true} status={injectDto.inject_status?.status_name} label={t(injectDto.inject_status?.status_name)} variant="inList" />);
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
      value: (injectDto: InjectResultDTO) => nsdt(injectDto.inject_updated_at),
    },
  ];

  const handleOpenDuplicate = (injectId: string) => {
    setOpenDuplicateId(injectId);
  };

  const handleCloseDuplicate = () => {
    setOpenDuplicateId(null);
  };

  return (
    <>
      <PaginationComponent
        fetch={fetchInjects}
        searchPaginationInput={searchPaginationInput}
        setContent={setInjects}
      />
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
        {injects.map((injectDto) => {
          return (

            <ListItem
              key={injectDto.inject_id}
              classes={{ root: classes.item }}
              divider
              secondaryAction={
                <AtomicTestingPopover
                  atomic={injectDto}
                  entries={[{ label: 'Duplicate', action: () => handleOpenDuplicate(injectDto.inject_id) }]}
                  openDuplicate={openDuplicateId === injectDto.inject_id}
                  setOpenDuplicate={handleCloseDuplicate}
                  variantButtonPopover={'icon'}
                />
                  }
              disablePadding={true}
            >
              <ListItemButton
                classes={{ root: classes.item }}
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
                          {header.value(injectDto)}
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

export default InjectList;
