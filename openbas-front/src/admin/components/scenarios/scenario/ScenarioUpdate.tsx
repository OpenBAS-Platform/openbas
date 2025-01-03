import { FunctionComponent } from 'react';

import { updateScenario } from '../../../../actions/scenarios/scenario-actions';
import Drawer from '../../../../components/common/Drawer';
import { useFormatter } from '../../../../components/i18n';
import type { Scenario, ScenarioInput } from '../../../../utils/api-types';
import { useAppDispatch } from '../../../../utils/hooks';
import useScenarioPermissions from '../../../../utils/Scenario';
import ScenarioForm from '../ScenarioForm';

interface Props {
  scenario: Scenario;
  open: boolean;
  handleClose: () => void;
}

const ScenarioUpdate: FunctionComponent<Props> = ({
  scenario,
  open,
  handleClose,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const permissions = useScenarioPermissions(scenario.scenario_id);

  // Scenario form
  const initialValues = (({
    scenario_name,
    scenario_subtitle,
    scenario_description,
    scenario_category,
    scenario_main_focus,
    scenario_severity,
    scenario_tags,
    scenario_external_reference,
    scenario_external_url,
    scenario_message_header,
    scenario_message_footer,
    scenario_mail_from,
    scenario_mails_reply_to,
  }) => ({
    scenario_name,
    scenario_subtitle: scenario_subtitle ?? '',
    scenario_category: scenario_category ?? 'attack-scenario',
    scenario_main_focus: scenario_main_focus ?? 'incident-response',
    scenario_severity: scenario_severity ?? 'high',
    scenario_description: scenario_description ?? '',
    scenario_tags: scenario_tags ?? [],
    scenario_external_reference: scenario_external_reference ?? '',
    scenario_external_url: scenario_external_url ?? '',
    scenario_message_header: scenario_message_header ?? '',
    scenario_message_footer: scenario_message_footer ?? '',
    scenario_mail_from: scenario_mail_from ?? '',
    scenario_mails_reply_to: scenario_mails_reply_to ?? [],
  }))(scenario);
  const submitEdit = (data: ScenarioInput) => {
    dispatch(updateScenario(scenario.scenario_id, data));
    handleClose();
  };

  return (
    <Drawer
      open={open}
      handleClose={handleClose}
      title={t('Update the scenario')}
    >
      <ScenarioForm
        initialValues={initialValues}
        editing
        disabled={permissions.readOnly}
        onSubmit={submitEdit}
        handleClose={handleClose}
      />
    </Drawer>
  );
};

export default ScenarioUpdate;
