import * as R from 'ramda';
import { type FunctionComponent } from 'react';

import { createNotificationRule } from '../../../../../actions/scenarios/scenario-notification-rules';
import Drawer from '../../../../../components/common/Drawer';
import { useFormatter } from '../../../../../components/i18n';
import { type CreateNotificationRuleInput, type NotificationRuleOutput } from '../../../../../utils/api-types';
import NotificationRuleForm from './NotificationRuleForm';

interface Props {
  open: boolean;
  editing: boolean;
  setOpen: (open: boolean) => void;
  scenarioName: string;
  scenarioId: string;
}

const ScenarioNotificationRulesDrawer: FunctionComponent<Props> = ({
  open,
  editing,
  setOpen,
  scenarioName,
  scenarioId,
}) => {
  const { t } = useFormatter();

  const onSubmit = async (data: CreateNotificationRuleInput) => {
    const toCreate = R.pipe(
      R.assoc('resource_type', data.resource_type),
      R.assoc('trigger', data.trigger),
      R.assoc('type', data.type),
      R.assoc('subject', data.subject),
      R.assoc('resource_id', scenarioId),
    )(data);
    await createNotificationRule(toCreate).then((result: { data: NotificationRuleOutput }) => {
      setOpen(false);
      return result.data;
    });
  };

  return (
    <Drawer
      open={open}
      handleClose={() => setOpen(false)}
      title={t('Create a notification rule')}
    >
      <NotificationRuleForm onSubmit={onSubmit} handleClose={() => setOpen(false)} scenarioName={scenarioName} editing={editing} />
    </Drawer>
  );
};

export default ScenarioNotificationRulesDrawer;
