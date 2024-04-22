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
import { AtomicTestingResultContext, PermissionsContext } from '../../components/Context';
import Drawer from '../../../../components/common/Drawer';
import InjectDefinition from '../../components/injects/InjectDefinition';
import useDataLoader from '../../../../utils/ServerSideEvent';
import type { AtomicTestingHelper } from '../../../../actions/atomictestings/atomic-testing-helper';
import { tagOptions } from '../../../../utils/Option';

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
  const { permissions } = useContext(PermissionsContext);
  // Fetching data
  const { inject } = useHelper((helper: AtomicTestingHelper) => ({
    inject: helper.getInject(atomic.atomic_id),
  }));
  useDataLoader(() => {
    dispatch(fetchAtomicTestingForUpdate(atomic.atomic_id));
  });
  // Context
  const { onLaunchAtomicTesting } = useContext(AtomicTestingResultContext);
  // Edition
  const [edition, setEdition] = useState(false);
  const handleEdit = () => setEdition(true);
  const onUpdateAtomicTesting = async (id: string, data: Inject) => {
    const toUpdate = R.pipe(
      R.assoc('inject_tags', !R.isEmpty(data.inject_tags) ? R.pluck('id', data.inject_tags) : []),
      R.pick([
        'inject_tags',
        'inject_title',
        'inject_type',
        'inject_contract',
        'inject_description',
        'inject_content',
        'inject_all_teams',
        'inject_documents',
        'inject_assets',
        'inject_asset_groups',
        'inject_teams',
      ]),
    )(data);
    await dispatch(updateAtomicTesting(id, toUpdate)).then(() => {
      onLaunchAtomicTesting();
    });
  };

  // Deletion
  const [deletion, setDeletion] = useState(false);
  const handleDelete = () => setDeletion(true);
  const submitDelete = () => {
    dispatch(deleteAtomicTesting(atomic.atomic_id));
    setDeletion(false);
    navigate('/admin/atomic_testings');
  };
  // Button Popover
  const entries: ButtonPopoverEntry[] = [
    { label: 'Update', action: handleEdit },
    { label: 'Delete', action: handleDelete },
  ];
  const { tagsMap, teams }: {
    tagsMap: Record<string, Tag>,
    teams: TeamStore[],
  } = useHelper((helper: InjectHelper & TagsHelper & TeamsHelper) => ({
    tagsMap: helper.getTagsMap(),
    teams: helper.getTeams(),
  }));

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
          inject={{
            ...inject, inject_tags: tagOptions(inject?.inject_tags, tagsMap),
          }
          }
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
