import { Add, DeleteOutlined } from '@mui/icons-material';
import { Button, IconButton, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useFieldArray, useFormContext } from 'react-hook-form';

import DateTimeFieldController from '../../../../../components/fields/DateTimeFieldController';
import SelectFieldController from '../../../../../components/fields/SelectFieldController';
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

  const vulnerabilityStatus = [
    {
      value: 'Analyzed',
      label: t('Analyzed'),
    }, {
      value: 'Deferred',
      label: t('Deferred'),
    }, {
      value: 'Modified',
      label: t('Modified'),
    },
  ];

  return (
    <>
      <TextFieldController name="cve_id" label={t('CVE ID')} required />
      <TextFieldController name="cve_cvss" label={t('CVSS')} required type="number" />

      <TextFieldController variant="standard" name="cve_description" label={t('Description')} multiline rows={5} />

      {/* QUICK INFO */}
      <Typography variant="h5" marginTop={theme.spacing(3)}>{t('Quick Info')}</Typography>
      <DateTimeFieldController name="cve_published" label={t('NVD Published Date')} />
      <TextFieldController name="cve_source_identifier" label={t('Source')} />
      <SelectFieldController name="cve_vuln_status" label={t('Vulnerability status')} items={vulnerabilityStatus} />

      {/* CISA */}
      <Typography variant="h5" marginTop={theme.spacing(3)}>{t('CISA\'s Known Exploited Vulnerabilities Catalog')}</Typography>
      <TextFieldController name="cve_cisa_vulnerability_name" label={t('Vulnerability Name')} />
      <TextFieldController name="cve_cisa_required_action" label={t('Required Action')} />
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: theme.spacing(2),
      }}
      >
        <DateTimeFieldController name="cve_cisa_exploit_add" label={t('Date Added')} />
        <DateTimeFieldController name="cve_cisa_action_due" label={t('Due Date')} />
      </div>

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
          <TextFieldController name={`cve_cwes.${cwesIndex}.cwe_source` as const} label={t('Source')} />
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
          cwesAppend({
            cwe_id: '',
            cwe_source: '',
          });
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
          <TextFieldController name={`cve_reference_urls.${referencesIndex}` as const} label={t('Url')} />
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
          referencesAppend('');
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
