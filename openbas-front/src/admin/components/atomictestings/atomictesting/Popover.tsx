import React, { FunctionComponent, useContext, useState } from 'react';
import * as R from 'ramda';
import { useNavigate } from 'react-router-dom';
import type { AtomicTestingOutput, Inject, Tag } from '../../../../utils/api-types';
import { useFormatter } from '../../../../components/i18n';
import { useAppDispatch } from '../../../../utils/hooks';
import ButtonPopover, { ButtonPopoverEntry } from '../../../../components/common/ButtonPopover';
import DialogDelete from '../../../../components/common/DialogDelete';
import { deleteAtomicTesting, fetchAtomicTestingForUpdate, updateAtomicTesting } from '../../../../actions/atomictestings/atomic-testing-actions';
import type { TeamStore } from '../../../../actions/teams/Team';
import { useHelper } from '../../../../store';
import type { InjectHelper } from '../../../../actions/injects/inject-helper';
import type { TagsHelper } from '../../../../actions/helper';
import type { TeamsHelper } from '../../../../actions/teams/team-helper';
import { PermissionsContext } from '../../components/Context';
import Drawer from '../../../../components/common/Drawer';
import InjectDefinition from '../../components/injects/InjectDefinition';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { tagOptions } from '../../../../utils/Option';
import type { AtomicTestingHelper } from '../../../../actions/atomictestings/atomic-testing-helper';

interface Props {
  atomic: AtomicTestingOutput;
}

const AtomicPopover: FunctionComponent<Props> = ({
  atomic,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Fetching data
  const { inject } = useHelper((helper: AtomicTestingHelper) => ({
    inject: helper.getInject(atomic.atomic_id),
  }));
  useDataLoader(() => {
    dispatch(fetchAtomicTestingForUpdate(atomic.atomic_id));
  });

  // Deletion
  const [deletion, setDeletion] = useState(false);

  const handleDelete = () => setDeletion(true);
  const submitDelete = () => {
    dispatch(deleteAtomicTesting(atomic.atomic_id));
    setDeletion(false);
    navigate('/admin/atomic_testings');
  };

  const { permissions } = useContext(PermissionsContext);
  const { tagsMap, teams }: {
    tagsMap: Record<string, Tag>,
    teams: TeamStore[],
  } = useHelper((helper: InjectHelper & TagsHelper & TeamsHelper) => ({
    tagsMap: helper.getTagsMap(),
    teams: helper.getTeams(),
  }));
  // inject.inject_tags = tagOptions(inject.inject_tags, tagsMap);

  // Button Popover
  const entries: ButtonPopoverEntry[] = [
    { label: 'Delete', action: handleDelete },
  ];

  /*
   R.pipe(
      R.assoc('inject_tags', R.pluck('id', data.inject_tags)),
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
   */

  const onUpdateAtomicTesting = async (id: string, data: Inject) => {
    const toUpdate = R.pipe(
      R.assoc('inject_tags', !R.isEmpty(data.inject_tags) ? R.pluck('id', data.inject_tags) : []),
      R.assoc('inject_teams', !R.isEmpty(data.inject_teams) ? R.pluck('id', data.inject_teams) : []),
      R.assoc('inject_assets', !R.isEmpty(data.inject_assets) ? R.pluck('id', data.inject_assets) : []),
      R.assoc('inject_asset_groups', !R.isEmpty(data.inject_asset_groups) ? R.pluck('id', data.inject_asset_groups) : []),
      R.pick([
        'inject_title',
        'inject_type',
        'inject_contract',
        'inject_description',
        'inject_content',
        'inject_all_teams',
      ]),
    )(data);

    await dispatch(updateAtomicTesting(id, toUpdate));
  };

  return (
    <>
      <ButtonPopover entries={entries} />
      <Drawer
        open={edition}
        handleClose={() => setEdition(false)}
        title={t('Update the atomic testing')}
        variant={'full'}
      >
        <InjectDefinition
          inject={inject}
          injectTypes={[JSON.parse(atomic.atomic_injector_contract.injector_contract_content)]}
          handleClose={() => setEdition(false)}
          tagsMap={tagsMap}
          permissions={permissions}
          teamsFromExerciseOrScenario={teams}
          articlesFromExerciseOrScenario={[]}
          variablesFromExerciseOrScenario={[]}
          onUpdateInject={onUpdateAtomicTesting}
          uriVariable={''}
          allUsersNumber={0}
          usersNumber={0}
          teamsUsers={[]}
          atomicTestingUpdate={true}
        />
      </Drawer>
      <DialogDelete
        open={deletion}
        handleClose={() => setDeletion(false)}
        handleSubmit={submitDelete}
        text={t('Do you want to delete this atomic testing ?')}
      />
    </>
  );
};

export default AtomicPopover;
