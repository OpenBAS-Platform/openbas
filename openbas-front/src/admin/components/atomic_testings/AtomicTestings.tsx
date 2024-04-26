import React, { CSSProperties, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { KeyboardArrowRight } from '@mui/icons-material';
import * as R from 'ramda';
import { useFormatter } from '../../../components/i18n';
import { useHelper } from '../../../store';
import Breadcrumbs from '../../../components/Breadcrumbs';
import type { UsersHelper } from '../../../actions/helper';
import InjectIcon from '../components/injects/InjectIcon';
import type { AtomicTestingOutput, Inject, SearchPaginationInput } from '../../../utils/api-types';
import { createAtomicTesting, searchAtomicTestings } from '../../../actions/atomic_testings/atomic-testing-actions';
import AtomicTestingResult from '../components/atomic_testings/AtomicTestingResult';
import TargetChip from '../components/atomic_testings/TargetChip';
import Empty from '../../../components/Empty';
import StatusChip from '../components/atomic_testings/StatusChip';
import { initSorting } from '../../../components/common/pagination/Page';
import PaginationComponent from '../../../components/common/pagination/PaginationComponent';
import SortHeadersComponent from '../../../components/common/pagination/SortHeadersComponent';
import InjectorContract from '../components/injects/InjectorContract';
import CreateInject from '../components/injects/CreateInject';
import { useAppDispatch } from '../../../utils/hooks';

const useStyles = makeStyles(() => ({
  bodyItem: {
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

const inlineStylesHeaders: Record<string, CSSProperties> = {
  iconSort: {
    position: 'absolute',
    margin: '0 0 0 15px',
    padding: 0,
    top: '0px',
  },
  atomic_title: {
    width: '10%',
    fontSize: 12,
    fontWeight: '700',
  },
  atomic_type: {
    width: '25%',
    fontSize: 12,
    fontWeight: '700',
  },
  atomic_last_start_execution_date: {
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  atomic_targets: {
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
  atomic_status: {
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  atomic_expectations: {
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
};

const inlineStyles: Record<string, CSSProperties> = {
  atomic_title: {
    width: '10%',
  },
  atomic_type: {
    width: '25%',
  },
  atomic_last_start_execution_date: {
    width: '15%',
  },
  atomic_targets: {
    width: '20%',
  },
  atomic_status: {
    width: '15%',
  },
  atomic_expectations: {
    width: '15%',
  },
};

// eslint-disable-next-line consistent-return
const AtomicTestings = () => {
  // Standard hooks
  const classes = useStyles();
  const { t, fldt, tPick } = useFormatter();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Filter and sort hook
  const [atomics, setAtomics] = useState<AtomicTestingOutput[]>([]);
  const [searchPaginationInput, setSearchPaginationInput] = useState<SearchPaginationInput>({
    sorts: initSorting('inject_title'),
  });

  const { userAdmin } = useHelper((helper: UsersHelper) => ({
    userAdmin: helper.getMe()?.user_admin ?? false,
  }));

  const onCreateAtomicTesting = async (data: Inject) => {
    const toCreate = R.pipe(
      R.assoc('inject_tags', data.inject_tags),
      R.assoc('inject_title', data.inject_title),
      R.assoc('inject_all_teams', data.inject_all_teams),
      R.assoc('inject_asset_groups', data.inject_asset_groups),
      R.assoc('inject_assets', data.inject_assets),
      R.assoc('inject_content', data.inject_content),
      R.assoc('inject_contract', data.inject_contract),
      R.assoc('inject_description', data.inject_description),
      R.assoc('inject_documents', data.inject_documents),
      R.assoc('inject_teams', data.inject_teams),
      R.assoc('inject_type', data.inject_type),
    )(data);
    const result = await dispatch(createAtomicTesting(toCreate));
    navigate(`/admin/atomic_testings/${result.result}`);
  };

  // Headers
  const headers = [
    {
      field: 'atomic_title',
      label: 'Title',
      isSortable: true,
      value: (atomicTesting: AtomicTestingOutput) => atomicTesting.atomic_title,
    },
    {
      field: 'atomic_type',
      label: 'Type',
      isSortable: true,
      // TODO add atomic_inject_label in /api/atomic_testings/search backend with label map
      value: (atomicTesting: AtomicTestingOutput) => {
        return (<InjectorContract variant="list" label={tPick(atomicTesting.atomic_injector_contract.injector_contract_labels)} />);
      },
    },
    {
      field: 'atomic_last_start_execution_date',
      label: 'Date',
      isSortable: true,
      value: (atomicTesting: AtomicTestingOutput) => fldt(atomicTesting.atomic_last_execution_start_date),
    },
    {
      field: 'atomic_targets',
      label: 'Target',
      isSortable: true,
      value: (atomicTesting: AtomicTestingOutput) => {
        return (<TargetChip targets={atomicTesting.atomic_targets} />);
      },
    },
    {
      field: 'atomic_status',
      label: 'Inject Execution Status',
      isSortable: true,
      value: (atomicTesting: AtomicTestingOutput) => {
        return (<StatusChip status={atomicTesting.atomic_status} variant={'list'} />);
      },
    },
    {
      field: 'atomic_expectations',
      label: 'Global score',
      isSortable: true,
      value: (atomicTesting: AtomicTestingOutput) => {
        return (
          <AtomicTestingResult expectations={atomicTesting.atomic_expectation_results} />
        );
      },
    },
  ];

  return (
    <>
      <Breadcrumbs variant="list" elements={[{ label: t('Atomic testings'), current: true }]} />
      <PaginationComponent
        fetch={searchAtomicTestings}
        searchPaginationInput={searchPaginationInput}
        setContent={setAtomics}
      />
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
              <SortHeadersComponent
                headers={headers}
                inlineStylesHeaders={inlineStylesHeaders}
                searchPaginationInput={searchPaginationInput}
                setSearchPaginationInput={setSearchPaginationInput}
              />
            }
          />
        </ListItem>
        {atomics.map((atomicTesting) => {
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
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {headers.map((header) => (
                      <div
                        key={header.field}
                        className={classes.bodyItem}
                        style={inlineStyles[header.field]}
                      >
                        {header.value(atomicTesting)}
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
        {!atomics ? (
          <Empty message={t('No data available')} />
        ) : null}
      </List>
      {userAdmin && <CreateInject title={t('Create a new atomic test')} onCreateInject={onCreateAtomicTesting} isAtomic />}
    </>
  );
};

export default AtomicTestings;
