import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as R from 'ramda';
import { useFormatter } from '../../../components/i18n';
import { useHelper } from '../../../store';
import Breadcrumbs from '../../../components/Breadcrumbs';
import type { UsersHelper } from '../../../actions/helper';
import type { Inject, InjectResultDTO } from '../../../utils/api-types';
import { createAtomicTesting, searchAtomicTestings } from '../../../actions/atomic_testings/atomic-testing-actions';
import CreateInject from '../common/injects/CreateInject';
import InjectList from './InjectList';

// eslint-disable-next-line consistent-return
const AtomicTestings = () => {
  // Standard hooks
  const { t } = useFormatter();
  const navigate = useNavigate();

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
      R.assoc('inject_injector_contract', data.inject_injector_contract),
      R.assoc('inject_description', data.inject_description),
      R.assoc('inject_documents', data.inject_documents),
      R.assoc('inject_teams', data.inject_teams),
      R.assoc('inject_type', data.inject_type),
    )(data);
    await createAtomicTesting(toCreate).then((result: { data: InjectResultDTO }) => {
      navigate(`/admin/atomic_testings/${result.data.inject_id}`);
    });
  };

  return (
    <>
      <Breadcrumbs variant="list" elements={[{ label: t('Atomic testings'), current: true }]} />
      <InjectList
        fetchInjects={searchAtomicTestings}
        goTo={(injectId) => `/admin/atomic_testings/${injectId}`}
      />
      {userAdmin && <CreateInject title={t('Create a new atomic test')} onCreateInject={onCreateAtomicTesting} isAtomic />}
    </>
  );
};

export default AtomicTestings;
