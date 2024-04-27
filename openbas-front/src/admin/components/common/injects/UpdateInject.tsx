import React, { useContext } from 'react';
import { Button } from '@mui/material';
import Drawer from '../../../../components/common/Drawer';
import InjectDefinition from './InjectDefinition';
import { tagOptions } from '../../../../utils/Option';
import { useFormatter } from '../../../../components/i18n';
import { PermissionsContext } from '../../components/Context';
import type { Inject, InjectorContract, Tag } from '../../../../utils/api-types';
import type { TeamStore } from '../../../../actions/teams/Team';
import { useHelper } from '../../../../store';
import type { InjectHelper } from '../../../../actions/injects/inject-helper';
import type { TagsHelper } from '../../../../actions/helper';
import type { TeamsHelper } from '../../../../actions/teams/team-helper';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { useAppDispatch } from '../../../../utils/hooks';
import { fetchTags } from '../../../../actions/Tag';
import { fetchTeams } from '../../../../actions/teams/team-actions';
import { splitDuration } from '../../../../utils/Time';
import type { InjectStore } from '../../../../actions/injects/Inject';

interface Props {
  open: boolean
  handleClose: () => void
  onUpdateInject: (data: Inject) => Promise<void>
  injectorContract: InjectorContract
  inject: InjectStore
  isAtomic: boolean
}

const UpdateInject: React.FC<Props> = ({ open, handleClose, onUpdateInject, injectorContract, inject, isAtomic = false, ...props }) => {
  const { t } = useFormatter();
  const dispatch = useAppDispatch();

  const { permissions } = useContext(PermissionsContext);

  useDataLoader(() => {
    dispatch(fetchTags());
    dispatch(fetchTeams());
  });

  const { tagsMap, teams }: {
    tagsMap: Record<string, Tag>,
    teams: TeamStore[],
  } = useHelper((helper: InjectHelper & TagsHelper & TeamsHelper) => ({
    tagsMap: helper.getTagsMap(),
    teams: helper.getTeams(),
  }));

  const getFooter = (submitting: boolean) => (
    <>
      <div style={{ float: 'right', margin: '20px 0 20px 0' }}>
        <Button
          variant="contained"
          color="secondary"
          type="submit"
          disabled={submitting}
        >
          {t('Update')}
        </Button>
      </div>
    </>
  );

  const inject_tags = tagOptions(inject?.inject_tags, tagsMap);
  const duration = splitDuration(inject?.inject_depends_duration || 0);
  const inject_depends_duration_days = duration.days;
  const inject_depends_duration_hours = duration.hours;
  const inject_depends_duration_minutes = duration.minutes;

  return (
    <Drawer
      open={open}
      handleClose={handleClose}
      title={t('Update the atomic testing')}
      variant={'full'}
    >
      <InjectDefinition
        inject={{
          ...inject,
          inject_tags,
          inject_depends_duration_days,
          inject_depends_duration_hours,
          inject_depends_duration_minutes,
        }}
        injectorContracts={[injectorContract]}
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
        getFooter={getFooter}
        isAtomic={isAtomic}
        {...props}
      />
    </Drawer>
  );
};

export default UpdateInject;
