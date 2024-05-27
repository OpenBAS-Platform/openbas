import React, { CSSProperties, FunctionComponent, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import { KeyboardArrowRight } from '@mui/icons-material';
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
  goIcon: {
    position: 'absolute',
    right: -10,
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
  'inject_status.status_name': {
    width: '15%',
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
    width: '10%',
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
  const { t, fldt, tPick } = useFormatter();

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
        return (<InjectorContract variant="list" label={tPick(injectDto.inject_injector_contract.injector_contract_labels)} />);
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
      isSortable: true,
      value: (injectDto: InjectResultDTO) => fldt(injectDto.inject_status?.tracking_sent_date),
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
      field: 'inject_status.status_name',
      label: 'Status',
      isSortable: true,
      value: (injectDto: InjectResultDTO) => {
        return (<ItemStatus isInject={true} status={injectDto.inject_status?.status_name} label={t(injectDto.inject_status?.status_name)} variant="inList" />);
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
      value: (injectDto: InjectResultDTO) => fldt(injectDto.inject_updated_at),
    },
  ];

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
            <ListItemButton
              key={injectDto.inject_id}
              classes={{ root: classes.item }}
              divider
              component={Link}
              to={goTo(injectDto.inject_id)}
            >
              <ListItemIcon>
                <InjectIcon
                  tooltip={t(injectDto.inject_type)}
                  type={injectDto.inject_type}
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
              <ListItemIcon classes={{ root: classes.goIcon }}>
                <KeyboardArrowRight />
              </ListItemIcon>
            </ListItemButton>
          );
        })}
        {!injects ? (<Empty message={t('No data available')} />) : null}
      </List>
    </>
  );
};

export default InjectList;
