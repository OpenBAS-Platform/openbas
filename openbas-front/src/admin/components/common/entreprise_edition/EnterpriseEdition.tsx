/*
Copyright (c) 2021-2024 Filigran SAS

This file is part of the OpenBAS Enterprise Edition ("EE") and is
licensed under the OpenCTI Enterprise Edition License (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

https://github.com/OpenBAS-Platform/openbas/blob/master/LICENSE

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*/

import { Alert, AlertTitle } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import { useFormatter } from '../../../../components/i18n';
import EnterpriseEditionButton from './EnterpriseEditionButton';

// Deprecated - https://mui.com/system/styles/basics/
// Do not use it for new code.
const useStyles = makeStyles()(theme => ({
  alert: {
    width: '100%',
    marginBottom: 20,
    borderColor: theme.palette.ee.main,
    color: theme.palette.text?.primary,
  },
}));

const EnterpriseEdition = ({ message }: {
  message?: string;
  feature?: string;
}) => {
  const { classes } = useStyles();
  const { t } = useFormatter();
  return (
    <>
      <Alert
        icon={false}
        classes={{ root: classes.alert }}
        severity="warning"
        variant="outlined"
        style={{ position: 'relative' }}
      >
        <AlertTitle style={{
          marginBottom: 0,
          fontWeight: 400,
        }}
        >
          {t(message ?? 'You need to activate OpenBAS enterprise edition to use this feature.')}
          <EnterpriseEditionButton />
        </AlertTitle>
      </Alert>
    </>
  );
};

export default EnterpriseEdition;
