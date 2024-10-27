import { Button } from '@mui/material';
import { useState } from 'react';
import { makeStyles } from '@mui/styles';
import { RocketLaunchOutlined } from '@mui/icons-material';
import classNames from 'classnames';
import EnterpriseEditionAgreement from './EnterpriseEditionAgreement';
import { useFormatter } from '../../../../components/i18n';
import { useHelper } from '../../../../store';
import type { UserHelper } from '../../../../actions/helper';

// Deprecated - https://mui.com/system/styles/basics/
// Do not use it for new code.
const useStyles = makeStyles({
  button: {
    marginLeft: 20,
  },
  inLine: {
    float: 'right',
    marginTop: -12,
  },
});

const EnterpriseEditionButton = ({ inLine = false }: { inLine?: boolean; }) => {
  const { t } = useFormatter();
  const classes = useStyles();
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
          root: classNames({
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
