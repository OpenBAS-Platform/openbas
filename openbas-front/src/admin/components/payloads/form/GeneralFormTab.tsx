import AttackPatternFieldController from '../../../../components/fields/AttackPatternFieldController';
import TagFieldController from '../../../../components/fields/TagFieldController';
import TextFieldController from '../../../../components/fields/TextFieldController';
import { useFormatter } from '../../../../components/i18n';

const GeneralFormTab = () => {
  const { t } = useFormatter();

  return (
    <>
      <TextFieldController name="payload_name" label={t('Name')} required />
      <TextFieldController name="payload_description" label={t('Description')} multiline={true} rows={3} />
      <AttackPatternFieldController name="payload_attack_patterns" label={t('Attack patterns')} />
      <TagFieldController name="payload_tags" label={t('Tags')} />
    </>
  );
};

export default GeneralFormTab;
