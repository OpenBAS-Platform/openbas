import { Add, DeleteOutlined } from '@mui/icons-material';
import { Button, IconButton, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useFieldArray, useFormContext } from 'react-hook-form';

import TextFieldController from '../../../../../components/fields/TextFieldController';
import { useFormatter } from '../../../../../components/i18n';

const GeneralFormTab = () => {
  const { t } = useFormatter();
  const theme = useTheme();
  const { control } = useFormContext();

  const { fields: cwesFields, append: cwesAppend, remove: cwesRemove } = useFieldArray({
    control,
    name: 'cve_cwes',
  });
  const { fields: referencesFields, append: referencesAppend, remove: referencesRemove } = useFieldArray({
    control,
    name: 'cve_reference_urls',
  });

  return (
    <>
      <TextFieldController name="cve_id" label={t('CVE ID')} required />
      <TextFieldController name="cve_cvss" label={t('CVSS')} required type="number" />

      <TextFieldController variant="standard" name="cve_description" label={t('Description')} multiline rows={5} />

      {/* QUICK INFO */}
      <Typography variant="h5" marginTop={theme.spacing(3)}>{t('Quick Info')}</Typography>
      <TextFieldController name="cve_published" label={t('NVD Published Date')} />
      <TextFieldController name="cve_source_identifier" label={t('Source')} />
      <TextFieldController name="cve_vuln_status" label={t('Vulnerability status')} />

      {/* CISA */}
      <Typography variant="h5" marginTop={theme.spacing(3)}>{t('CISA\'s Known Exploited Vulnerabilities Catalog')}</Typography>
      <TextFieldController name="cve_cisa_vulnerability_name" label={t('Vulnerability Name')} />
      <TextFieldController name="cve_cisa_exploit_add" label={t('Date Added')} />
      <TextFieldController name="cve_cisa_action_due" label={t('Due Date')} />
      <TextFieldController name="cve_cisa_required_action" label={t('Required Action')} />

      {/* CWES */}
      <Typography variant="h5" marginTop={theme.spacing(3)}>{t('Weakness Enumeration')}</Typography>
      {cwesFields.map((cwesField, cwesIndex) => (
        <div
          style={{
            display: 'flex',
            gap: theme.spacing(1),
          }}
          key={cwesField.id}
        >
          <TextFieldController name={`cve_cwes.${cwesIndex}.cwe_id` as const} label={t('CWE')} />
          <IconButton
            onClick={() => cwesRemove(cwesIndex)}
            size="small"
            color="primary"
          >
            <DeleteOutlined />
          </IconButton>
        </div>
      ))}
      <Button
        variant="outlined"
        onClick={() => {
          cwesAppend({ cve_cwes: '' });
        }}
        style={{
          width: '100%',
          height: theme.spacing(4),
        }}
      >
        <Add fontSize="small" />
        {t('New CWE')}
      </Button>

      {/* REFERENCES */}
      <Typography variant="h5" marginTop={theme.spacing(3)}>{t('References to Advisories, Solutions, and Tools')}</Typography>
      {referencesFields.map((referencesField, referencesIndex) => (
        <div
          style={{
            display: 'flex',
            gap: theme.spacing(1),
          }}
          key={referencesField.id}
        >
          <TextFieldController name={`cve_references.${referencesIndex}.cve_reference_url` as const} label={t('Url')} />
          <IconButton
            onClick={() => referencesRemove(referencesIndex)}
            size="small"
            color="primary"
          >
            <DeleteOutlined />
          </IconButton>
        </div>
      ))}
      <Button
        variant="outlined"
        onClick={() => {
          referencesAppend({ cve_reference_url: '' });
        }}
        style={{
          width: '100%',
          height: theme.spacing(4),
        }}
      >
        <Add fontSize="small" />
        {t('New Reference')}
      </Button>
    </>
  );
};

export default GeneralFormTab;
