import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { DialogActions } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import React, { FunctionComponent } from 'react';
import Transition from '../../../../components/common/Transition';
import { useFormatter } from '../../../../components/i18n';
import { Contract } from '../../../../utils/api-types';

interface AvailableVariablesDialogProps {
  open: boolean
  handleClose: () => void
  injectType: Contract
}

const AvailableVariablesDialog: FunctionComponent<AvailableVariablesDialogProps> = ({
  open,
  handleClose,
  injectType,
}) => {
  const { t } = useFormatter();

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      fullWidth={true}
      maxWidth="md"
      PaperProps={{ elevation: 1 }}
      TransitionComponent={Transition}
    >
      <DialogTitle>{t('Available variables')}</DialogTitle>
      <DialogContent>
        <List>
          {injectType.variables.map((variable) => (
            <div key={variable.key}>
              <ListItem divider={true} dense={true}>
                <ListItemText
                  primary={
                    variable.children && variable.children.length > 0
                      ? variable.key
                      : `\${${variable.key}}`
                  }
                  secondary={t(variable.label)}
                />
              </ListItem>
              {variable.children && variable.children.length > 0 && (
                <List component="div" disablePadding>
                  {variable.children.map((variableChild) => (
                    <ListItem
                      key={variableChild.key}
                      divider={true}
                      dense={true}
                      sx={{ pl: 4 }}
                    >
                      <ListItemText
                        primary={`\${${variableChild.key}}`}
                        secondary={t(variableChild.label)}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </div>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          {t('Close')}
        </Button>
      </DialogActions>
    </Dialog>
  )
};

export default AvailableVariablesDialog;
