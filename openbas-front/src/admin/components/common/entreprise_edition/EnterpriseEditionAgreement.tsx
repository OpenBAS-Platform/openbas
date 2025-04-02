import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormGroup,
  TextField,
} from '@mui/material';
import { type FunctionComponent, useState } from 'react';

import { updatePlatformEnterpriseEditionParameters } from '../../../../actions/Application';
import { useFormatter } from '../../../../components/i18n';
import { type SettingsEnterpriseEditionUpdateInput } from '../../../../utils/api-types';
import { useAppDispatch } from '../../../../utils/hooks';
import { isEmptyField } from '../../../../utils/utils';

interface EnterpriseEditionAgreementProps {
  open: boolean;
  onClose: () => void;
}

const EnterpriseEditionAgreement: FunctionComponent<
  EnterpriseEditionAgreementProps
> = ({ open, onClose }) => {
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const [enterpriseLicense, setEnterpriseLicense] = useState('');
  const updateEnterpriseEdition = (data: SettingsEnterpriseEditionUpdateInput) => {
    dispatch(updatePlatformEnterpriseEditionParameters(data));
    onClose();
  };
  const enableEnterpriseEdition = () => updateEnterpriseEdition({ platform_enterprise_license: enterpriseLicense });
  return (
    <Dialog
      PaperProps={{ elevation: 1 }}
      open={open}
      onClose={onClose}
      fullWidth={true}
      maxWidth="md"
    >
      <DialogTitle>
        {t('OpenBAS Enterprise Edition (EE) license agreement')}
      </DialogTitle>
      <DialogContent>
        <Alert severity="info" style={{ marginTop: 15 }}>
          {t('OpenCTI Enterprise Edition requires a license key to be enabled. Filigran provides a free-to-use license for development and research purposes as well as for charity organizations.')}
          <br />
          <br />
          {t('To obtain a license, please')}
          {' '}
          <a href="https://filigran.io/contact/" target="_blank" rel="noreferrer">{t('reach out to the Filigran team')}</a>
          .
          <br />
          {t('You just need to try?')}
          {/* eslint-disable-next-line i18next/no-literal-string */}
          {' '}
          Get right now
          {' '}
          <a href="https://filigran.io/enterprise-editions-trial/" target="_blank" rel="noreferrer">{t('your trial license online')}</a>
          .
        </Alert>
        <FormGroup style={{ marginTop: 15 }}>
          <TextField
            onChange={event => setEnterpriseLicense(event.target.value)}
            multiline={true}
            fullWidth={true}
            minRows={10}
            placeholder={t('Paste your Filigran OpenBAS Enterprise Edition license')}
            variant="outlined"
          />
        </FormGroup>
        <div style={{ marginTop: 15 }}>
          {t('By enabling the OpenBAS Enterprise Edition, you (and your organization) agrees to the OpenBAS Enterprise Edition (EE) ')}
          <a href="https://github.com/OpenBAS-Platform/openbas/blob/master/LICENSE" target="_blank" rel="noreferrer">{t('license terms and conditions of usage')}</a>
          .
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('Cancel')}</Button>
        <Button
          color="secondary"
          onClick={enableEnterpriseEdition}
          disabled={isEmptyField((enterpriseLicense))}
        >
          {t('Enable')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnterpriseEditionAgreement;
