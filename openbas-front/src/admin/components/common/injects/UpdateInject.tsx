import React, { useEffect, useRef, useState } from 'react';
import { Tab, Tabs } from '@mui/material';
import Drawer from '../../../../components/common/Drawer';
import { useFormatter } from '../../../../components/i18n';
import type { Inject } from '../../../../utils/api-types';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import { useAppDispatch } from '../../../../utils/hooks';
import UpdateInjectDetails from './UpdateInjectDetails';
import type { TeamStore } from '../../../../actions/teams/Team';
import { fetchInject } from '../../../../actions/Inject';
import { useHelper } from '../../../../store';
import type { InjectHelper } from '../../../../actions/injects/inject-helper';
import UpdateInjectLogicalChains from './UpdateInjectLogicalChains';

interface Props {
  open: boolean;
  handleClose: () => void;
  onUpdateInject: (data: Inject) => Promise<void>;
  injectId: string;
  isAtomic?: boolean;
  teamsFromExerciseOrScenario: TeamStore[];
  injects: Inject[];
}

const UpdateInject: React.FC<Props> = ({ open, handleClose, onUpdateInject, injectId, isAtomic = false, teamsFromExerciseOrScenario, injects, ...props }) => {
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const drawerRef = useRef(null);
  const [availableTabs] = useState<string[]>(['Inject details', 'Logical chains']);
  const [activeTab, setActiveTab] = useState<null | string>(availableTabs[0]);
  // Fetching data
  const { inject } = useHelper((helper: InjectHelper) => ({
    inject: helper.getInject(injectId),
  }));

  useDataLoader(() => {
    dispatch(fetchInject(injectId));
  });

  // Selection
  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

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
      PaperProps={{
        ref: drawerRef,
      }}
      disableEnforceFocus
    >
      <>
        <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
          {availableTabs.map((tab) => {
            return (
              <Tab key={tab} label={tab} value={tab}/>
            );
          })}
        </Tabs>
        {activeTab === 'Inject details' && (
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
        {activeTab === 'Logical chains' && (
          <UpdateInjectLogicalChains
            injectId={injectId}
            inject={inject}
            handleClose={handleClose}
            onUpdateInject={onUpdateInject}
            injects={injects}
            {...props}
          />
        )}
      </>
    </Drawer>
  );
};

export default UpdateInject;
