import React, { useRef } from 'react';
import Drawer from '../../../../components/common/Drawer';
import { useFormatter } from '../../../../components/i18n';
import type { Inject, InjectorContract } from '../../../../utils/api-types';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { useAppDispatch } from '../../../../utils/hooks';
import { fetchTags } from '../../../../actions/Tag';
import { fetchTeams } from '../../../../actions/teams/team-actions';
import type { InjectStore } from '../../../../actions/injects/Inject';
import UpdateInjectDetails from './UpdateInjectDetails';
import type { TeamStore } from '../../../../actions/teams/Team';

interface Props {
  open: boolean
  handleClose: () => void
  onUpdateInject: (data: Inject) => Promise<void>
  injectorContract: InjectorContract
  inject: InjectStore
  isAtomic: boolean
  teamsFromExerciseOrScenario: TeamStore[]
}

const UpdateInject: React.FC<Props> = ({ open, handleClose, onUpdateInject, injectorContract, inject, isAtomic = false, teamsFromExerciseOrScenario, ...props }) => {
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const drawerRef = useRef(null);
  useDataLoader(() => {
    dispatch(fetchTags());
    dispatch(fetchTeams());
  });
  return (
    <Drawer
      open={open}
      handleClose={handleClose}
      title={t('Update the inject')}
      variant='half'
      PaperProps={{
        ref: drawerRef,
      }}
    >
      {inject && injectorContract && (
        <UpdateInjectDetails
          drawerRef={drawerRef}
          contractContent={injectorContract}
          inject={inject}
          handleClose={handleClose}
          onUpdateInject={onUpdateInject}
          isAtomic={isAtomic}
          teamsFromExerciseOrScenario={teamsFromExerciseOrScenario}
          {...props}
        />
      )}
    </Drawer>
  );
};

export default UpdateInject;
