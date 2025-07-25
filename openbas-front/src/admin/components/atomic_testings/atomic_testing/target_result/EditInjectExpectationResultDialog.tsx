import FiligranDialog from '../../../../../components/common/dialog/FiligranDialog';
import type { InjectExpectationResult } from '../../../../../utils/api-types';
import { type InjectExpectationsStore } from '../../../common/injects/expectations/Expectation';
import { isManualExpectation } from '../../../common/injects/expectations/ExpectationUtils';
import DetectionPreventionExpectationsValidationForm
  from '../../../simulations/simulation/validation/expectations/DetectionPreventionExpectationsValidationForm';
import ManualExpectationsValidationForm
  from '../../../simulations/simulation/validation/expectations/ManualExpectationsValidationForm';

interface Props {
  open: boolean;
  injectExpectation: InjectExpectationsStore | null;
  sourceIds: string[];
  resultToEdit?: InjectExpectationResult | null;
  onClose: () => void;
  onUpdate: () => void;
}
const EditInjectExpectationResultDialog = ({ open, injectExpectation, sourceIds, resultToEdit, onClose, onUpdate }: Props) => {
  return (
    <FiligranDialog
      open={open}
      handleClose={onClose}
    >
      {injectExpectation && (
        <>
          {isManualExpectation(injectExpectation.inject_expectation_type)
            && <ManualExpectationsValidationForm expectation={injectExpectation} onUpdate={onUpdate} />}
          {['DETECTION', 'PREVENTION'].includes(injectExpectation.inject_expectation_type)
            && (
              <DetectionPreventionExpectationsValidationForm
                expectation={injectExpectation}
                sourceIds={resultToEdit ? undefined : sourceIds}
                onUpdate={onUpdate}
                result={resultToEdit ?? undefined}
              />
            )}
        </>
      )}
    </FiligranDialog>
  );
};

export default EditInjectExpectationResultDialog;
