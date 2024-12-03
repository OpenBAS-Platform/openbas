import { Tab, Tabs } from '@mui/material';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

import { fetchInject } from '../../../../actions/Inject';
import type { InjectOutputType } from '../../../../actions/injects/Inject';
import type { InjectHelper } from '../../../../actions/injects/inject-helper';
import Drawer from '../../../../components/common/Drawer';
import { useFormatter } from '../../../../components/i18n';
import { useHelper } from '../../../../store';
import type { Inject } from '../../../../utils/api-types';
import { useAppDispatch } from '../../../../utils/hooks';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import UpdateInjectDetails from './UpdateInjectDetails';
import UpdateInjectLogicalChains from './UpdateInjectLogicalChains';

interface Props {
  open: boolean;
  handleClose: () => void;
  onUpdateInject: (data: Inject) => Promise<void>;
  massUpdateInject?: (data: Inject[]) => Promise<void>;
  injectId: string;
  isAtomic?: boolean;
  injects?: InjectOutputType[];
}

function getInjectorContractWithEmptyPredefinedExpectations(injectorContractContent: string) {
  const injectorContract = JSON.parse(injectorContractContent);
  const { fields } = injectorContract;
  const fieldsOnlyExpectations = fields.filter(
    (f: { key: string }) => f.key === 'expectations',
  );
  if (fieldsOnlyExpectations.length === 0 || (fieldsOnlyExpectations.length > 0 && !Object.prototype.hasOwnProperty.call(fieldsOnlyExpectations[0], 'predefinedExpectations'))) {
    return injectorContract;
  }
  const fieldsWithoutExpectations = fields.filter(
    (f: { key: string }) => f.key !== 'expectations',
  );
  const fieldsWithEmptyPredefinedExpectations = [
    ...fieldsWithoutExpectations,
    {
      ...fieldsOnlyExpectations[0],
      predefinedExpectations: [],
    },
  ];
  return { ...injectorContract, fields: fieldsWithEmptyPredefinedExpectations };
}

const UpdateInject: React.FC<Props> = ({ open, handleClose, onUpdateInject, massUpdateInject, injectId, isAtomic = false, injects, ...props }) => {
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const drawerRef = useRef(null);
  const [availableTabs] = useState<string[]>(['Inject details', 'Logical chains']);
  const [activeTab, setActiveTab] = useState<null | string>(availableTabs[0]);
  const [isInjectLoading, setIsInjectLoading] = useState(true);
  // Fetching data
  const { inject } = useHelper((helper: InjectHelper) => ({
    inject: helper.getInject(injectId),
  }));

  useDataLoader(() => {
    setIsInjectLoading(true);
    dispatch(fetchInject(injectId)).finally(() => setIsInjectLoading(false));
  });

  // Selection
  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const [injectorContract, setInjectorContract] = useState(null);
  useEffect(() => {
    if (inject?.inject_injector_contract?.injector_contract_content) {
      setInjectorContract(getInjectorContractWithEmptyPredefinedExpectations(inject.inject_injector_contract?.injector_contract_content));
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
        {!isAtomic && (
          <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
            {availableTabs.map((tab) => {
              return (
                <Tab key={tab} label={tab} value={tab} />
              );
            })}
          </Tabs>
        )}
        {!isInjectLoading && (isAtomic || activeTab === 'Inject details') && (
          <UpdateInjectDetails
            drawerRef={drawerRef}
            contractContent={injectorContract}
            injectId={injectId}
            inject={inject}
            handleClose={handleClose}
            onUpdateInject={onUpdateInject}
            isAtomic={isAtomic}
            {...props}
          />
        )}
        {(!isInjectLoading && !isAtomic && activeTab === 'Logical chains') && (
          <UpdateInjectLogicalChains
            inject={inject}
            handleClose={handleClose}
            onUpdateInject={massUpdateInject}
            injects={injects}
            {...props}
          />
        )}
      </>
    </Drawer>
  );
};

export default UpdateInject;
