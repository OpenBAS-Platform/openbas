import { type FunctionComponent } from 'react';

import Drawer from '../../../../../components/common/Drawer';
import { useFormatter } from '../../../../../components/i18n';
import NotificationRuleForm from './NotificationRuleForm';

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  scenarioName: string;
}

const ScenarioNotificationRulesDrawer: FunctionComponent<Props> = ({
  open,
  setOpen,
  scenarioName,
}) => {
  const { t } = useFormatter();
  const onSubmit = () => {
  };

  return (
    <Drawer
      open={open}
      handleClose={() => setOpen(false)}
      title={t('Create a notification rule')}
    >
      <NotificationRuleForm onSubmit={onSubmit} handleClose={() => setOpen(false)} scenarioName={scenarioName} />
    </Drawer>
  );
};

export default ScenarioNotificationRulesDrawer;
