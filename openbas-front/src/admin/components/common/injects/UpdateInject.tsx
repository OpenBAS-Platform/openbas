import { Tab, Tabs } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type SyntheticEvent, useEffect, useRef, useState } from 'react';

import { fetchInject } from '../../../../actions/Inject';
import { type InjectorContractConverted } from '../../../../actions/injector_contracts/InjectorContract';
import { type InjectOutputType } from '../../../../actions/injects/Inject';
import { type InjectHelper } from '../../../../actions/injects/inject-helper';
import Drawer from '../../../../components/common/Drawer';
import { useFormatter } from '../../../../components/i18n';
import PlatformIcon from '../../../../components/PlatformIcon';
import { useHelper } from '../../../../store';
import { type AttackPattern, type Inject, type InjectInput, type InjectorContractOutput, type KillChainPhase } from '../../../../utils/api-types';
import { useAppDispatch } from '../../../../utils/hooks';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import { isNotEmptyField } from '../../../../utils/utils';
import InjectDetailsForm from './form/InjectDetailsForm';
import InjectIcon from './InjectIcon';
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

const UpdateInject: React.FC<Props> = ({ open, handleClose, onUpdateInject, massUpdateInject, injectId, isAtomic = false, injects, ...props }) => {
  const { t } = useFormatter();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const drawerRef = useRef(null);
  const [availableTabs] = useState<string[]>(['Inject details', 'Logical chains']);
  const [activeTab, setActiveTab] = useState<null | string>(availableTabs[0]);
  const [isInjectLoading, setIsInjectLoading] = useState(true);
  // Fetching data
  const { inject } = useHelper((helper: InjectHelper) => ({ inject: helper.getInject(injectId) }));

  useDataLoader(() => {
    setIsInjectLoading(true);
    dispatch(fetchInject(injectId)).then(() => setIsInjectLoading(false));
  });

  // Selection
  const handleTabChange = (_: SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const [injectorContractContent, setInjectorContractContent] = useState<InjectorContractConverted['convertedContent']>();
  useEffect(() => {
    if (inject?.inject_injector_contract?.convertedContent) {
      setInjectorContractContent(inject.inject_injector_contract?.convertedContent);
    }
  }, [inject]);

  const contractPayload = inject?.inject_injector_contract?.injector_contract_payload;
  const injectorContract = inject?.inject_injector_contract;
  const cardTitle = inject?.inject_attack_patterns?.length !== 0 ? `${inject?.inject_kill_chain_phases?.map((value: KillChainPhase) => value.phase_name)?.join(', ')} /${inject?.inject_attack_patterns?.map((value: AttackPattern) => value.attack_pattern_external_id)?.join(', ')}` : t('TTP Unknown');

  return (
    <Drawer
      open={open}
      handleClose={handleClose}
      title={t('Update the inject')}
      PaperProps={{ ref: drawerRef }}
      disableEnforceFocus
    >
      <>
        {!isAtomic && (
          <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth" sx={{ marginBottom: theme.spacing(2) }}>
            {availableTabs.map((tab) => {
              return (
                <Tab key={tab} label={tab} value={tab} />
              );
            })}
          </Tabs>
        )}
        {!isInjectLoading && (isAtomic || activeTab === 'Inject details') && (
          <InjectDetailsForm
            injectorContractLabel={inject?.inject_title}
            injectContractIcon={
              injectorContractContent ? (
                <InjectIcon
                  type={contractPayload ? (contractPayload.payload_collector_type ?? contractPayload.payload_type) : injectorContract?.injector_contract_injector_type}
                  isPayload={isNotEmptyField(contractPayload?.payload_collector_type ?? contractPayload?.payload_type)}
                />
              ) : undefined
            }
            injectHeaderAction={(
              <div style={{
                display: 'flex',
                alignItems: 'center',
              }}
              >
                {inject?.inject_injector_contract?.injector_contract_platforms?.map(
                  (platform: InjectorContractOutput['injector_contract_platforms']) => (
                    <PlatformIcon
                      key={String(platform)}
                      width={20}
                      platform={String(platform)}
                      marginRight={theme.spacing(2)}
                    />
                  ),
                )}
              </div>
            )}
            injectHeaderTitle={injectorContract?.injector_contract_needs_executor === true ? cardTitle : inject.inject_injector_contract?.injector_contract_injector_type_name}
            disabled={!injectorContractContent}
            isAtomic={isAtomic}
            defaultInject={inject}
            drawerRef={drawerRef}
            handleClose={handleClose}
            injectorContractContent={injectorContractContent}
            onSubmitInject={(data: InjectInput) => onUpdateInject(data as Inject)}
            openDetail
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
