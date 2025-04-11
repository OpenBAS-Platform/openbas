import { useState } from 'react';
import { makeStyles } from 'tss-react/mui';

import { type UserHelper } from '../../../../actions/helper';
import { useHelper } from '../../../../store';
import useEnterpriseEdition from '../../../../utils/hooks/useEnterpriseEdition';
import EnterpriseEditionAgreementDialog from './EnterpriseEditionAgreementDialog';

const useStyles = makeStyles<{ isClickable: boolean }>()((theme, { isClickable }) => ({
  container: {
    fontSize: 'xx-small',
    height: 14,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 21,
    margin: 'auto',
    borderRadius: theme.borderRadius,
    border: `1px solid ${theme.palette.ee.main}`,
    color: theme.palette.ee.main,
    backgroundColor: theme.palette.ee.background,
    cursor: isClickable ? 'pointer' : 'default',
  },
  containerFloating: {
    float: 'left',
    fontSize: 'xx-small',
    height: 14,
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 21,
    margin: '2px 0 0 6px',
    borderRadius: theme.borderRadius,
    border: `1px solid ${theme.palette.ee.main}`,
    color: theme.palette.ee.main,
    backgroundColor: theme.palette.ee.background,
    cursor: isClickable ? 'pointer' : 'default',
  },
}));

const EEChip = ({ clickable = true, floating = false }: {
  clickable?: boolean;
  floating?: boolean;
}) => {
  const { classes } = useStyles({ isClickable: clickable });
  const isEnterpriseEdition = useEnterpriseEdition();
  const [displayDialog, setDisplayDialog] = useState(false);
  const userAdmin = useHelper((helper: UserHelper) => {
    const me = helper.getMe();
    return me?.user_admin ?? false;
  });
  return (!isEnterpriseEdition && (
    <>
      <div
        className={floating ? classes.containerFloating : classes.container}
        onClick={() => clickable && setDisplayDialog(true)}
      >
        EE
      </div>
      {userAdmin && (
        <EnterpriseEditionAgreementDialog
          open={displayDialog}
          onClose={() => setDisplayDialog(false)}
        />
      )}
    </>
  ));
};

export default EEChip;
