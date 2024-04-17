import React, { FunctionComponent, useContext, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button } from '@mui/material';
import InjectDefinition from '../../components/injects/InjectDefinition';
import { InjectContext, PermissionsContext } from '../../components/Context';
import type { AtomicTestingInput, Tag, InjectorContract } from '../../../../utils/api-types';
import { useHelper } from '../../../../store';
import type { InjectHelper } from '../../../../actions/injects/inject-helper';
import type { TagsHelper } from '../../../../actions/helper';
import { useFormatter } from '../../../../components/i18n';
import { useAppDispatch } from '../../../../utils/hooks';
import { fetchTeams } from '../../../../actions/teams/team-actions';
import { createAtomicTesting } from '../../../../actions/atomictestings/atomic-testing-actions';
import useDataLoader from '../../../../utils/ServerSideEvent';
import type { TeamStore } from '../../../../actions/teams/Team';
import type { TeamsHelper } from '../../../../actions/teams/team-helper';

interface Props {
  contractId: string;
  injectType: string;
  handleClose: () => void;
  handleBack: () => void;
  handleReset: () => void;
}

const CreationInjectDetails: FunctionComponent<Props> = ({
  contractId, injectType, handleClose, handleBack, handleReset,
}) => {
  const { permissions } = useContext(PermissionsContext);
  const dispatch = useAppDispatch();
  const injectDefinitionRef = useRef();
  const { onUpdateInject } = useContext(InjectContext);
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

  const onAddAtomicTesting = async (data) => {
    await dispatch(createAtomicTesting(data));
  };

  useDataLoader(() => {
    dispatch(fetchTeams());
  });

  return (
    <InjectDefinition
      ref={injectDefinitionRef}
      inject={{
        inject_contract: contractId,
        inject_type: injectType,
        inject_teams: [],
        inject_assets: [],
        inject_asset_groups: [],
        inject_documents: [],
        inject_tags: [],
      }}
      injectTypes={injectTypes}
      handleClose={handleClose}
      tagsMap={tagsMap}
      permissions={permissions}
      teamsFromExerciseOrScenario={teams}
      articlesFromExerciseOrScenario={[]}
      variablesFromExerciseOrScenario={[]}
      onUpdateInject={onUpdateInject}
      uriVariable={''}
      allUsersNumber={0}
      usersNumber={0}
      teamsUsers={[]}
      atomicTestingCreation={true}
      onAddAtomicTesting={onAddAtomicTesting}
      handleBack={handleBack}
      handleReset={handleReset}
    />

  );
};

export default CreationInjectDetails;
