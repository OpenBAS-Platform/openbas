import React, { FunctionComponent, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AtomicTestingOutput, InjectorContract, Tag } from '../../../../utils/api-types';
import { useFormatter } from '../../../../components/i18n';
import { useAppDispatch } from '../../../../utils/hooks';
import ButtonPopover, { ButtonPopoverEntry } from '../../../../components/common/ButtonPopover';
import DialogDelete from '../../../../components/common/DialogDelete';
import { deleteAtomicTesting, updateAtomicTesting } from '../../../../actions/atomictestings/atomic-testing-actions';
import InjectDefinition from '../../components/injects/InjectDefinition';
import type { TeamStore } from '../../../../actions/teams/Team';
import { useHelper } from '../../../../store';
import type { InjectHelper } from '../../../../actions/injects/inject-helper';
import type { TagsHelper } from '../../../../actions/helper';
import type { TeamsHelper } from '../../../../actions/teams/team-helper';
import { PermissionsContext } from '../../components/Context';
import FullPageDrawer from '../../../../components/common/FullPageDrawer';

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

  // Edition
  const [edition, setEdition] = useState(false);

  const handleEdit = () => {
    setEdition(true);
  };

  // Deletion
  const [deletion, setDeletion] = useState(false);

  const handleDelete = () => {
    setDeletion(true);
  };
  const submitDelete = () => {
    dispatch(deleteAtomicTesting(atomic.atomic_id));
    setDeletion(false);
    navigate('/admin/atomic_testings');
  };

  const { permissions } = useContext(PermissionsContext);
  const { injectTypesMap, tagsMap, teams }: {
    injectTypesMap: Record<string, InjectorContract>,
    tagsMap: Record<string, Tag>,
    teams: TeamStore[],
  } = useHelper((helper: InjectHelper & TagsHelper & TeamsHelper) => ({
    injectTypesMap: helper.getInjectTypesMap(),
    tagsMap: helper.getTagsMap(),
    teams: helper.getTeams(),
  }));
  const injectTypes = Object.values(injectTypesMap);

  // Button Popover
  const entries: ButtonPopoverEntry[] = [
    { label: 'Update', action: handleEdit },
    { label: 'Delete', action: handleDelete },
  ];

  return (
    <>
      <ButtonPopover entries={entries} />
      <FullPageDrawer
        open={edition}
        handleClose={() => setEdition(false)}
        title={t('Update the atomic testing')}
      >
        {/* <InjectDefinition
          injectId={atomic.atomic_id}
          inject={{
            inject_contract: atomic.atomic_contract,
            inject_type: atomic.atomic_type,
            inject_teams: [],
            inject_assets: [],
            inject_asset_groups: [],
            inject_documents: [],
            inject_tags: [],
          }}
          injectTypes={injectTypes}
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
          teamsUsers={{}}
          atomicTestingCreation={false}
          atomicTestingUpdate={true}
        /> */}
      </FullPageDrawer>
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
