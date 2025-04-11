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

import { RocketLaunchOutlined } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useState } from 'react';
import { makeStyles } from 'tss-react/mui';

import { type UserHelper } from '../../../../actions/helper';
import { useFormatter } from '../../../../components/i18n';
import { useHelper } from '../../../../store';
import EnterpriseEditionAgreement from './EnterpriseEditionAgreement';

// Deprecated - https://mui.com/system/styles/basics/
// Do not use it for new code.
const useStyles = makeStyles()({
  button: { marginLeft: 20 },
  inLine: {
    float: 'right',
    marginTop: -12,
  },
});

const EnterpriseEditionButton = ({ inLine = false }: { inLine?: boolean }) => {
  const { t } = useFormatter();
  const { classes, cx } = useStyles();
  const [openEnterpriseEditionConsent, setOpenEnterpriseEditionConsent] = useState(false);
  const userAdmin = useHelper((helper: UserHelper) => {
    const me = helper.getMe();
    return me?.user_admin ?? false;
  });
  return (
    <>
      <EnterpriseEditionAgreement
        open={openEnterpriseEditionConsent}
        onClose={() => setOpenEnterpriseEditionConsent(false)}
      />
      <Button
        size="small"
        variant="outlined"
        color="ee"
        onClick={() => setOpenEnterpriseEditionConsent(true)}
        startIcon={<RocketLaunchOutlined />}
        classes={{
          root: cx({
            [classes.button]: true,
            [classes.inLine]: inLine,
          }),
        }}
        disabled={!userAdmin}
      >
        {t('Enable Enterprise Edition')}
      </Button>
    </>
  );
};

export default EnterpriseEditionButton;
