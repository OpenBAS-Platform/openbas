/*
Copyright (c) 2021-2024 Filigran SAS

This file is part of the OpenBAS Enterprise Edition ("EE") and is
licensed under the OpenBAS Enterprise Edition License (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

https://github.com/OpenBAS-Platform/openbas/blob/master/LICENSE

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*/

import { Alert, Button, TextField } from '@mui/material';
import { useState } from 'react';
import { makeStyles } from 'tss-react/mui';

import { updatePlatformEnterpriseEditionParameters } from '../../../../actions/Application';
import Dialog from '../../../../components/common/Dialog';
import { useFormatter } from '../../../../components/i18n';
import type { SettingsEnterpriseEditionUpdateInput } from '../../../../utils/api-types';
import { useAppDispatch } from '../../../../utils/hooks';
import { isEmptyField } from '../../../../utils/utils';
import EEChip from './EEChip';

const useStyles = makeStyles()(theme => ({
  eeDialogContainer: {
    display: 'grid',
    gap: theme.spacing(2),
  },
}));

interface EnterpriseEditionAgreementProps {
  open: boolean;
  onClose: () => void;
  featureDetectedInfo?: string;
}

const EnterpriseEditionAgreementDialog = ({ open, onClose, featureDetectedInfo }: EnterpriseEditionAgreementProps) => {
  const { t } = useFormatter();
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const [enterpriseLicense, setEnterpriseLicense] = useState('');

  const updateEnterpriseEdition = (data: SettingsEnterpriseEditionUpdateInput) => {
    dispatch(updatePlatformEnterpriseEditionParameters(data));
    onClose();
  };
  const enableEnterpriseEdition = () => updateEnterpriseEdition({ platform_enterprise_license: enterpriseLicense });
  return (
    <Dialog
      open={open}
      handleClose={onClose}
      title={t('OpenBAS Enterprise Edition (EE) license agreement')}
      action={(
        <>
          <Button onClick={onClose}>{t('Cancel')}</Button>
          <Button
            color="secondary"
            onClick={enableEnterpriseEdition}
            disabled={isEmptyField((enterpriseLicense))}
          >
            {t('Enable')}
          </Button>
        </>
      )}
    >
      <div className={classes.eeDialogContainer}>
        {!isEmptyField(featureDetectedInfo) && (
          <Alert icon={<EEChip clickable={false} />} severity="success">
            {`${t('Enterprise Edition feature detected :')} `}
            {featureDetectedInfo}
          </Alert>
        )}
        <div>
          {t('OpenBAS Enterprise Edition requires a license key to be enabled. Filigran provides a free-to-use license for development and research purposes as well as for charity organizations.')}
          <ul>
            <li>
              {`${t('To obtain a license, please')} `}
              <a
                href="https://filigran.io/contact/"
                target="_blank"
                rel="noreferrer"
              >
                {t('reach out to the Filigran team')}
              </a>
            </li>
            <li>
              {`${t('You just need to try? Get right now')} `}
              <a
                href="https://filigran.io/enterprise-editions-trial/"
                target="_blank"
                rel="noreferrer"
              >
                {t('your trial license online')}
              </a>
            </li>
          </ul>
        </div>
        <div>
          {t('Paste your Filigran OpenBAS Enterprise Edition license')}
          <TextField
            onChange={event => setEnterpriseLicense(event.target.value)}
            multiline={true}
            fullWidth={true}
            minRows={5}
            variant="outlined"
          />
        </div>
        <div>
          {t('By enabling the OpenBAS Enterprise Edition, you (and your organization) agrees')}
          &nbsp;
          <a
            href="https://github.com/OpenBAS-Platform/openbas/blob/master/LICENSE"
            target="_blank"
            rel="noreferrer"
          >
            {t('OpenBAS EE license terms and conditions of usage')}
          </a>
          .
        </div>
      </div>
    </Dialog>
  );
};

export default EnterpriseEditionAgreementDialog;
