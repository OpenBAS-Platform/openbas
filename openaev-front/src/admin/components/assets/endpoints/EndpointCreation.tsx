import { Step, StepButton, Stepper } from '@mui/material';
import { type FunctionComponent, useState } from 'react';

import { createAiTargetCall } from '../../../../actions/assets/aiTarget-actions';
import { ASSET_TYPE } from '../../../../actions/assets/asset-queries';
import { createEndpointAgentlessCall } from '../../../../actions/assets/endpoint-actions';
import ButtonCreate from '../../../../components/common/ButtonCreate';
import Drawer from '../../../../components/common/Drawer';
import { useFormatter } from '../../../../components/i18n';
import type { AiTargetInput, EndpointInput } from '../../../../utils/api-types';
import { useLiveMutation } from '../../../../utils/query/live';
import AiTargetForm from '../ai_targets/AiTargetForm';
import { type AssetCategory, getCategoryDef } from '../asset-categories';
import AssetCategoryPicker from '../AssetCategoryPicker';
import AssetForm from '../AssetForm';

interface Props { agentless?: boolean }

const EndpointCreation: FunctionComponent<Props> = ({ agentless = true }) => {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<AssetCategory | null>(null);
  const { t } = useFormatter();

  const handleClose = () => {
    setOpen(false);
    setCategory(null);
  };

  const createEndpointMutation = useLiveMutation({
    mutationFn: createEndpointAgentlessCall,
    changes: result => [{
      type: ASSET_TYPE,
      id: result.data.asset_id,
      action: 'create',
    }],
  });
  const createAiTargetMutation = useLiveMutation({
    mutationFn: createAiTargetCall,
    changes: result => [{
      type: ASSET_TYPE,
      id: result.data.asset_id,
      action: 'create',
    }],
  });

  // The drawer stays open on failure: the API layer already told the user why.
  const onSubmit = (data: EndpointInput) => {
    createEndpointMutation.mutate(data, { onSuccess: handleClose });
  };

  const onSubmitAiTarget = (data: AiTargetInput) => {
    createAiTargetMutation.mutate(data, { onSuccess: handleClose });
  };

  const renderStepContent = () => {
    if (!category) {
      return <AssetCategoryPicker onSelect={setCategory} />;
    }
    if (category === 'AI_TARGET') {
      return <AiTargetForm onSubmit={onSubmitAiTarget} handleClose={handleClose} />;
    }
    return (
      <AssetForm
        category={category}
        agentless={agentless}
        onSubmit={onSubmit}
        handleClose={handleClose}
      />
    );
  };

  return (
    <>
      <ButtonCreate onClick={() => setOpen(true)} />
      <Drawer
        open={open}
        handleClose={handleClose}
        title={t('Create a new asset')}
      >
        <>
          {/* Two-step flow: pick a category, then fill the form. The stepper lets
              the user jump back to step 1 to reselect the category (replacing the
              old "Change category" text button). */}
          <Stepper nonLinear activeStep={category ? 1 : 0} sx={{ marginBottom: 3 }}>
            <Step completed={!!category}>
              <StepButton onClick={() => setCategory(null)}>
                {t('Category')}
              </StepButton>
            </Step>
            <Step>
              <StepButton disabled={!category}>
                {category ? t(getCategoryDef(category).label) : t('Details')}
              </StepButton>
            </Step>
          </Stepper>
          {renderStepContent()}
        </>
      </Drawer>
    </>
  );
};

export default EndpointCreation;
