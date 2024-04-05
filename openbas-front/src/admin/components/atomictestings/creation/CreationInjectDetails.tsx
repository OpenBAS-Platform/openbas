import React, { FunctionComponent, useContext, useState } from 'react';
import InjectDefinition from '../../components/injects/InjectDefinition';
import { InjectContext, PermissionsContext } from '../../components/Context';
import type { Tag } from '../../../../utils/api-types';
import { useHelper } from '../../../../store';
import { Contract } from '../../../../utils/api-types';
import type { InjectHelper } from '../../../../actions/injects/inject-helper';
import type { TagsHelper } from '../../../../actions/helper';

interface Props {
  contractId: string;
  injectType: string;
}

const CreationInjectType: FunctionComponent<Props> = ({ contractId, injectType }) => {
  const { permissions } = useContext(PermissionsContext);
  const { onUpdateInject } = useContext(InjectContext);
  const [setSelectedInject] = useState(null);
  const { injectTypesMap, tagsMap }: {
    injectTypesMap: Record<string, Contract>,
    tagsMap: Record<string, Tag>,
  } = useHelper((helper: InjectHelper & TagsHelper) => ({
    injectTypesMap: helper.getInjectTypesMap(),
    tagsMap: helper.getTagsMap(),
  }));
  const injectTypes = Object.values(injectTypesMap);
  return (
    <form id="scenarioForm">
      <InjectDefinition
        inject={{
          inject_contract: contractId,
          inject_type: injectType,
          inject_teams: [],
          inject_assets: [],
          inject_asset_groups: [],
          inject_documents: [],
        }}
        injectTypes={injectTypes}
        handleClose={() => setSelectedInject(null)}
        tagsMap={tagsMap}
        permissions={permissions}
        teamsFromExerciseOrScenario={[]}
        articlesFromExerciseOrScenario={[]}
        variablesFromExerciseOrScenario={[]}
        onUpdateInject={onUpdateInject}
        uriVariable={''}
        allUsersNumber={0}
        usersNumber={0}
        teamsUsers={0}
      />
    </form>
  );
};

export default CreationInjectType;
