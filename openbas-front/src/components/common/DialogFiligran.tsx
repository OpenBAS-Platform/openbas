import { Button, Dialog as DialogMUI, DialogActions, DialogContent, DialogContentText } from '@mui/material';
import { type FunctionComponent } from 'react';

import { useFormatter } from '../i18n';
import Transition from './Transition';

interface Props {
  open: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
  text: string;
  actionButtonLabel: string;
}

const DialogFiligran: FunctionComponent<Props> = ({
  open = false,
  handleClose,
  handleSubmit,
  text,
  actionButtonLabel,
}) => {
  const { t } = useFormatter();

  return (
    <DialogMUI
      open={open}
      onClose={handleClose}
      PaperProps={{ elevation: 1 }}
      TransitionComponent={Transition}
    >
      <DialogContent>
        <DialogContentText>
          {text}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('Cancel')}</Button>
        <Button color="secondary" onClick={handleSubmit}>
          {actionButtonLabel}
        </Button>
      </DialogActions>
    </DialogMUI>
  );
};

export default DialogFiligran;
