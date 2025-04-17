import * as R from 'ramda';
import { type FunctionComponent } from 'react';

import { createNotificationRule, deleteNotificationRule, updateNotificationRule } from '../../../../../actions/scenarios/scenario-notification-rules';
import Drawer from '../../../../../components/common/Drawer';
import { useFormatter } from '../../../../../components/i18n';
import { type CreateNotificationRuleInput, type NotificationRuleOutput, type UpdateNotificationRuleInput } from '../../../../../utils/api-types';
import CreationNotificationRuleForm from './CreationNotificationRuleForm';
import EditionNotificationRuleForm from './EditionNotificationRuleForm';

interface Props {
  open: boolean;
  editing: boolean;
  setOpen: (open: boolean) => void;
  scenarioName: string;
  scenarioId: string;
  notificationRule: NotificationRuleOutput;
  onCreate?: (result: NotificationRuleOutput) => void;
  onUpdate?: (result: NotificationRuleOutput) => void;
  onDelete?: () => void;
}

const ScenarioNotificationRulesDrawer: FunctionComponent<Props> = ({
  open,
  editing,
  setOpen,
  scenarioName,
  scenarioId,
  notificationRule,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  const { t } = useFormatter();

  const creationInitialValues = ({
    resource_id: '',
    resource_type: 'SCENARIO',
    trigger: 'DIFFERENCE',
    type: 'EMAIL',
    subject: { scenarioName }.scenarioName + ' - alert',
  });

  const onSubmitCreation = async (data: CreateNotificationRuleInput) => {
    const toCreate = R.pipe(
      R.assoc('resource_type', data.resource_type),
      R.assoc('trigger', data.trigger),
      R.assoc('type', data.type),
      R.assoc('subject', data.subject),
      R.assoc('resource_id', scenarioId),
    )(data);
    await createNotificationRule(toCreate).then((result: { data: NotificationRuleOutput }) => {
      setOpen(false);
      if (onCreate) {
        onCreate(result.data);
      }
    });
  };

  const editionInitialValues = (({ subject }) => ({ subject: subject ?? '' }))(notificationRule);

  const onSubmitEdition = async (data: UpdateNotificationRuleInput) => {
    await updateNotificationRule(notificationRule.id, data).then((result: { data: NotificationRuleOutput }) => {
      if (result) {
        if (onUpdate) {
          onUpdate(result.data);
        }
        setOpen(false);
      }
      return result.data;
    });
  };

  const onDeleteNotificationRule = () => {
    deleteNotificationRule(notificationRule.id).then(() => {
      setOpen(false);
      if (onDelete) {
        onDelete();
      }
    });
  };

  return (
    <Drawer
      open={open}
      handleClose={() => setOpen(false)}
      title={t('Create a notification rule')}
    >
      {
        editing
          ? (
              <EditionNotificationRuleForm
                onSubmit={onSubmitEdition}
                editionInitialValues={editionInitialValues}
                onDelete={onDeleteNotificationRule}
              />

            )
          : (
              <CreationNotificationRuleForm
                onSubmit={onSubmitCreation}
                handleClose={() => setOpen(false)}
                creationInitialValues={creationInitialValues}
              />
            )
      }

    </Drawer>
  );
};

export default ScenarioNotificationRulesDrawer;
