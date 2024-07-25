import React, { useEffect, useRef, useState } from 'react';
import Drawer from '../../../../components/common/Drawer';
import { useFormatter } from '../../../../components/i18n';
import type { Inject, InjectResultDTO } from '../../../../utils/api-types';
import UpdateInjectDetails from './UpdateInjectDetails';
import type { TeamStore } from '../../../../actions/teams/Team';

interface Props {
  open: boolean;
  handleClose: () => void;
  onUpdateInject: (data: Inject) => Promise<void>;
  inject: InjectResultDTO;
  injectId: string;
  isAtomic?: boolean;
  teamsFromExerciseOrScenario: TeamStore[];
}

const UpdateInject: React.FC<Props> = ({
  open,
  handleClose,
  onUpdateInject,
  inject,
  injectId,
  isAtomic = false,
  teamsFromExerciseOrScenario,
  ...props }) => {
  const { t } = useFormatter();
  const drawerRef = useRef(null);

  const [injectorContract, setInjectorContract] = useState(null);
  useEffect(() => {
    if (inject?.inject_injector_contract?.injector_contract_content) {
      setInjectorContract(JSON.parse(inject.inject_injector_contract?.injector_contract_content));
    }
  }, [inject]);
  return (
    <Drawer
      open={open}
      handleClose={handleClose}
      title={t('Update the inject')}
      variant="half"
      PaperProps={{
        ref: drawerRef,
      }}
      disableEnforceFocus={true}
    >
      {inject && injectorContract && (
        <UpdateInjectDetails
          drawerRef={drawerRef}
          contractContent={injectorContract}
          injectId={injectId}
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
