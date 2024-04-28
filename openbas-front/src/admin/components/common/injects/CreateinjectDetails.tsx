import React, { FunctionComponent, useContext } from 'react';
import { Button } from '@mui/material';
import InjectDefinition from './InjectDefinition';
import { PermissionsContext } from '../../components/Context';
import type { Inject, Tag } from '../../../../utils/api-types';
import { useHelper } from '../../../../store';
import type { InjectHelper } from '../../../../actions/injects/inject-helper';
import type { TagsHelper } from '../../../../actions/helper';
import { useAppDispatch } from '../../../../utils/hooks';
import { fetchTeams } from '../../../../actions/teams/team-actions';
import useDataLoader from '../../../../utils/ServerSideEvent';
import type { TeamStore } from '../../../../actions/teams/Team';
import type { TeamsHelper } from '../../../../actions/teams/team-helper';
import { fetchTags } from '../../../../actions/Tag';
import { useFormatter } from '../../../../components/i18n';

interface Props {
  contractId: string
  // as we don't know the type of the content of a contract we need to put any here
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contractContent: any
  handleClose: () => void
  handleBack: () => void
  handleReset: () => void
  onCreateInject: (data: Inject) => Promise<void>
  isAtomic?: boolean
}

const CreateInjectDetails: FunctionComponent<Props> = ({
  contractId,
  contractContent,
  handleClose,
  handleBack,
  onCreateInject,
  isAtomic = false,
  ...props
}) => {
  const { permissions } = useContext(PermissionsContext);
  const dispatch = useAppDispatch();
  const { t } = useFormatter();

  const { tagsMap, teams }: {
    tagsMap: Record<string, Tag>,
    teams: TeamStore[],
  } = useHelper((helper: InjectHelper & TagsHelper & TeamsHelper) => ({
    tagsMap: helper.getTagsMap(),
    teams: helper.getTeams(),
  }));

  useDataLoader(() => {
    dispatch(fetchTeams());
    dispatch(fetchTags());
  });

  const getFooter = (submitting: boolean) => (
    <>
      <div style={{ float: 'left', margin: '20px 0 20px 0' }}>
        <Button
          color="inherit"
          sx={{ mr: 1 }}
          onClick={handleBack}
        >
          Back
        </Button>
      </div>

      <div style={{ float: 'right', margin: '20px 0 20px 0' }}>
        <Button
          variant="contained"
          color="secondary"
          type="submit"
          disabled={submitting || permissions.readOnly}
        >
          {t('Create')}
        </Button>
      </div>
    </>
  );

  return (
    <InjectDefinition
      inject={{
        inject_injector_contract: contractId,
        inject_type: contractContent.config.type,
        inject_teams: [],
        inject_assets: [],
        inject_asset_groups: [],
        inject_documents: [],
        inject_tags: [],
        inject_depends_duration_days: 0,
        inject_depends_duration_hours: 0,
        inject_depends_duration_minutes: 0,
        inject_depends_duration_seconds: 0,
      }}
      injectorContracts={[contractContent]}
      handleClose={handleClose}
      tagsMap={tagsMap}
      permissions={permissions}
      teamsFromExerciseOrScenario={teams}
      articlesFromExerciseOrScenario={[]}
      variablesFromExerciseOrScenario={[]}
      onCreateInject={onCreateInject}
      uriVariable={''}
      allUsersNumber={0}
      usersNumber={0}
      teamsUsers={[]}
      getFooter={getFooter}
      isAtomic={isAtomic}
      {...props}
    />
  );
};

export default CreateInjectDetails;
