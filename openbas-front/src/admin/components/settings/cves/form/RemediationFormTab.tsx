import TextFieldController from '../../../../../components/fields/TextFieldController';
import { useFormatter } from '../../../../../components/i18n';
import type { FindingOutput } from '../../../../../utils/api-types';

interface Props { finding: FindingOutput }

const RemediationFormTab = ({ finding }: Props) => {
  const { t } = useFormatter();

  return (
    <>
      <TextFieldController variant="standard" name="cve_remediation" label={t('Vulnerability Remediation')} multiline rows={30} />
    </>
  );
};
export default RemediationFormTab;
