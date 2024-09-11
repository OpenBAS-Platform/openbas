import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as R from 'ramda';
import { useFormatter } from '../../../components/i18n';
import { useHelper } from '../../../store';
import Breadcrumbs from '../../../components/Breadcrumbs';
import type { UserHelper } from '../../../actions/helper';
import type { FilterGroup, Inject, InjectResultDTO } from '../../../utils/api-types';
import { createAtomicTesting, searchAtomicTestings } from '../../../actions/atomic_testings/atomic-testing-actions';
import CreateInject from '../common/injects/CreateInject';
import InjectDtoList from './InjectDtoList';
import { buildEmptyFilter } from '../../../components/common/queryable/filter/FilterUtils';
import { useQueryableWithLocalStorage } from '../../../components/common/queryable/useQueryableWithLocalStorage';
import { buildSearchPagination } from '../../../components/common/queryable/QueryableUtils';
import { initSorting } from '../../../components/common/queryable/Page';
import ButtonCreate from '../../../components/common/ButtonCreate';

// eslint-disable-next-line consistent-return
const AtomicTestings = () => {
  // Standard hooks
  const { t } = useFormatter();
  const navigate = useNavigate();
  const [openCreateDrawer, setOpenCreateDrawer] = useState(false);

  const { userAdmin } = useHelper((helper: UserHelper) => ({
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
      R.assoc('inject_injector_contract', data.inject_injector_contract),
      R.assoc('inject_description', data.inject_description),
      R.assoc('inject_documents', data.inject_documents),
      R.assoc('inject_teams', data.inject_teams),
    )(data);
    await createAtomicTesting(toCreate).then((result: { data: InjectResultDTO }) => {
      navigate(`/admin/atomic_testings/${result.data.inject_id}`);
    });
  };

  const availableFilterNames = [
    'inject_kill_chain_phases',
    'inject_tags',
    'inject_title',
    'inject_type',
    'inject_updated_at',
  ];

  const quickFilter: FilterGroup = {
    mode: 'and',
    filters: [
      buildEmptyFilter('inject_kill_chain_phases', 'contains'),
      buildEmptyFilter('inject_tags', 'contains'),
    ],
  };
  const { queryableHelpers, searchPaginationInput } = useQueryableWithLocalStorage('atomic-testing', buildSearchPagination({
    sorts: initSorting('inject_updated_at', 'DESC'),
    filterGroup: quickFilter,
  }));

  return (
    <>
      <Breadcrumbs variant="list" elements={[{ label: t('Atomic testings'), current: true }]} />
      <InjectDtoList
        fetchInjects={searchAtomicTestings}
        goTo={(injectId) => `/admin/atomic_testings/${injectId}`}
        queryableHelpers={queryableHelpers}
        searchPaginationInput={searchPaginationInput}
        availableFilterNames={availableFilterNames}
      />
      {userAdmin && (<>
        <ButtonCreate onClick={() => setOpenCreateDrawer(true)} />
        <CreateInject
          title={t('Create a new atomic test')}
          onCreateInject={onCreateAtomicTesting}
          isAtomic
          open={openCreateDrawer}
          handleClose={() => setOpenCreateDrawer(false)}
        />
      </>)
      }
    </>
  );
};

export default AtomicTestings;
