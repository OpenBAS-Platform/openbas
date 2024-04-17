import React, { FunctionComponent, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AtomicTestingOutput, Tag } from '../../../../utils/api-types';
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

  // Edition
  const [edition, setEdition] = useState(false);
  const handleEdit = () => setEdition(true);

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

  // Button Popover
  const entries: ButtonPopoverEntry[] = [
    { label: 'Update', action: handleEdit },
    { label: 'Delete', action: handleDelete },
  ];

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
          onUpdateInject={updateAtomicTesting}
          uriVariable={''}
          allUsersNumber={0}
          usersNumber={0}
          teamsUsers={[]}
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
