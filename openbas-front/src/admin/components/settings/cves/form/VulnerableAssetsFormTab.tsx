import TextFieldController from '../../../../../components/fields/TextFieldController';
import { useFormatter } from '../../../../../components/i18n';

const VulnerableAssetsFormTab = () => {
  const { t } = useFormatter();

  return (
    <>
      <TextFieldController name="payload_name" label={t('Name')} required />
    </>
  );
};

export default VulnerableAssetsFormTab;
