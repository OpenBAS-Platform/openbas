import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Tab, Tabs } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type FormEvent, type SyntheticEvent, useEffect, useState } from 'react';
import { FormProvider, type SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { useFormatter } from '../../../../components/i18n';
import { type CveCreateInput } from '../../../../utils/api-types';
import useEnterpriseEdition from '../../../../utils/hooks/useEnterpriseEdition';
import { zodImplement } from '../../../../utils/Zod';
import EEChip from '../../common/entreprise_edition/EEChip';
import GeneralFormTab from './form/GeneralFormTab';
import RemediationFormTab from './form/RemediationFormTab';

interface Props {
  onSubmit: SubmitHandler<CveCreateInput>;
  handleClose: () => void;
  editing?: boolean;
  initialValues?: Partial<CveCreateInput>;
}

const CveForm = ({
  onSubmit,
  handleClose,
  editing,
  initialValues = {
    cve_id: '',
    cve_cvss: undefined,
    cve_description: '',
    cve_source_identifier: '',
    cve_published: '',
    cve_vuln_status: undefined,
    cve_cisa_action_due: '',
    cve_cisa_exploit_add: '',
    cve_cisa_required_action: '',
    cve_cisa_vulnerability_name: '',
    cve_cwes: [],
    cve_reference_urls: [],
  },
}: Props) => {
  // Standard hooks
  const { t } = useFormatter();
  const theme = useTheme();
  const tabs = ['General', 'Remediation'];
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const handleActiveTabChange = (_: SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const {
    isValidated: isValidatedEnterpriseEdition,
    openDialog: openEnterpriseEditionDialog,
    setEEFeatureDetectedInfo,
  } = useEnterpriseEdition();

  useEffect(() => {
    if (activeTab === 'Remediation' && !isValidatedEnterpriseEdition) {
      setActiveTab('General');
      setEEFeatureDetectedInfo(t('Remediation'));
      openEnterpriseEditionDialog();
    }
  }, [activeTab, isValidatedEnterpriseEdition]);

  const cwesObject = z.object({
    cwe_id: z.string().min(1, { message: t('CWE ID is required') }),
    cwe_source: z.string().optional(),
  });

  const schema = zodImplement<CveCreateInput>().with({
    cve_id: z.string().min(1, { message: t('Should not be empty') }),
    cve_cvss: z.coerce.number().min(0).max(10),
    cve_description: z.string().optional(),
    cve_source_identifier: z.string().optional(),
    cve_published: z.string().optional(),
    cve_vuln_status: z.enum(['ANALYZED', 'DEFERRED', 'MODIFIED']).optional(),
    cve_cisa_action_due: z.string().optional(),
    cve_cisa_exploit_add: z.string().optional(),
    cve_cisa_required_action: z.string().optional(),
    cve_cisa_vulnerability_name: z.string().optional(),
    cve_cwes: z.array(cwesObject).optional(),
    cve_reference_urls: z.array(z.string().url({ message: t('Invalid URL') })).optional(),
    cve_remediation: z.string().optional(),
  });

  const methods = useForm<CveCreateInput>({
    mode: 'onTouched',
    resolver: zodResolver(schema),
    defaultValues: {
      ...initialValues,
      cve_published: initialValues?.cve_published ?? undefined,
      cve_vuln_status: initialValues?.cve_vuln_status ?? undefined,
      cve_cisa_action_due: initialValues?.cve_cisa_action_due ?? undefined,
      cve_cisa_exploit_add: initialValues?.cve_cisa_exploit_add ?? undefined,
      cve_cwes: initialValues.cve_cwes ?? [],
      cve_reference_urls: initialValues.cve_reference_urls ?? [],
      cve_remediation: initialValues.cve_remediation ?? '',
    },
  });

  const {
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = methods;

  const handleSubmitWithoutPropagation = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const isValid = await methods.trigger();
    if (isValid) {
      handleSubmit(onSubmit)(e);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        id="cveForm"
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%',
          gap: theme.spacing(2),
        }}
        onSubmit={handleSubmitWithoutPropagation}
      >

        <Tabs
          value={activeTab}
          onChange={handleActiveTabChange}
          aria-label="tabs for cve form"
        >
          {tabs.map(tab => (
            <Tab
              key={tab}
              label={
                tab === 'Remediation' ? (
                  <Box display="flex" alignItems="center">
                    {tab}
                    {!isValidatedEnterpriseEdition && (
                      <EEChip
                        style={{ marginLeft: theme.spacing(1) }}
                        clickable
                        featureDetectedInfo={t('Remediation')}
                      />
                    )}
                  </Box>
                ) : (
                  tab
                )
              }
              value={tab}
            />
          ))}
        </Tabs>
        {activeTab === 'General' && (
          <GeneralFormTab editing={editing} />
        )}
        {activeTab === 'Remediation' && isValidatedEnterpriseEdition && (
          <RemediationFormTab />
        )}

        <div style={{
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'row-reverse',
          gap: theme.spacing(1),
        }}
        >
          <Button
            variant="contained"
            color="secondary"
            type="submit"
            disabled={!isDirty || isSubmitting}
          >
            {editing ? t('Update') : t('Create')}
          </Button>
          <Button
            variant="contained"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            {t('Cancel')}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
export default CveForm;
