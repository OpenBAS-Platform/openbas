import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { DialogActions, ListSubheader, Theme } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import React, { FunctionComponent } from 'react';
import { makeStyles } from '@mui/styles';
import { Link } from 'react-router-dom';
import Transition from '../../../../components/common/Transition';
import { useFormatter } from '../../../../components/i18n';
import { Contract, User, Variable } from '../../../../utils/api-types';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchVariables, VariablesHelper } from '../../../../actions/Variable';
import { useHelper } from '../../../../store';
import { useAppDispatch } from '../../../../utils/hooks';
import { UsersHelper } from '../../../../actions/helper';

interface VariableChildItemProps {
  hasChildren?: boolean
  variableKey: string
  variableValue: string | undefined
}

const VariableChildItem: FunctionComponent<VariableChildItemProps> = ({
  hasChildren = false,
  variableKey,
  variableValue,
}) => {
  const { t } = useFormatter();

  if (!variableValue) {
    return <></>;
  }

  return (
    <ListItem divider={true} dense={true}>
      <ListItemText
        primary={hasChildren ? variableKey : `\${${variableKey}}`}
        secondary={t(variableValue)}
      />
    </ListItem>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    marginRight: theme.spacing(2),
    padding: '0 5px 0 5px',
    minHeight: 20,
    minWidth: 20,
    textTransform: 'none',
  },
  containerFlex: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}));

interface AvailableVariablesDialogProps {
  open: boolean
  handleClose: () => void
  exerciseId: string
  injectType: Contract
}

const AvailableVariablesDialog: FunctionComponent<AvailableVariablesDialogProps> = ({
  open,
  handleClose,
  exerciseId,
  injectType,
}) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const dispatch = useAppDispatch();

  const { variables, me }: { variables: [Variable], me: User } = useHelper((helper: VariablesHelper & UsersHelper) => {
    return ({
      variables: helper.getExerciseVariables(exerciseId),
      me: helper.getMe(),
    });
  });
  useDataLoader(() => {
    dispatch(fetchVariables(exerciseId));
  });

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
        <List subheader={
          <ListSubheader component="div">
            {t('Built in variables')}
          </ListSubheader>
        }>
          {injectType.variables.map((variable) => (
            <div key={variable.key}>
              <VariableChildItem
                hasChildren={variable.children && variable.children.length > 0}
                variableKey={variable.key}
                variableValue={variable.label}
              />
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
        <List subheader={
          <ListSubheader component="div" classes={{ root: classes.containerFlex }}>
            {t('User variables')}
            {/* TODO: validate when migrate to new react router version */}
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <Button component={Link}
                    to={`/admin/exercises/${exerciseId}/definition/variables`}
                    variant="text"
                    size="small"
                    color="primary"
                    classes={{ root: classes.button }}
            >
              {me.user_is_observer ? t('View Variables') : t('Manage Variables')}
            </Button>
          </ListSubheader>
        }>
          {variables.map((variable) => (
            <div key={variable.variable_key}>
              <VariableChildItem
                variableKey={variable.variable_key}
                variableValue={variable.variable_value}
              />
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
  );
};

export default AvailableVariablesDialog;
