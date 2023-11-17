import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { Alert, DialogActions, ListItemButton, Tab } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import React, { FunctionComponent, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { Link } from 'react-router-dom';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { CopyAllOutlined } from '@mui/icons-material';
import Transition from '../../../../components/common/Transition';
import { useFormatter } from '../../../../components/i18n';
import { Contract, User, Variable } from '../../../../utils/api-types';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchVariables, VariablesHelper } from '../../../../actions/Variable';
import { useHelper } from '../../../../store';
import { useAppDispatch } from '../../../../utils/hooks';
import { UsersHelper } from '../../../../actions/helper';
import { copyToClipboard } from '../../../../utils/CopyToClipboard';

interface VariableChildItemProps {
  hasChildren?: boolean
  builtin?: boolean,
  variableKey: string
  variableValue: string | undefined
}

const VariableChildItem: FunctionComponent<VariableChildItemProps> = ({
  hasChildren = false,
  builtin = false,
  variableKey,
  variableValue,
}) => {
  const { t } = useFormatter();

  if (!variableValue) {
    return <></>;
  }

  const formattedVariableKey = `\${${variableKey}}`;

  if (hasChildren) {
    return (
      <ListItem divider={true} dense={true}>
        <ListItemText
          primary={variableKey}
          secondary={builtin ? t(variableValue) : variableValue}
        />
      </ListItem>
    );
  }
  return (
    <ListItemButton divider={true} dense={true} disabled={hasChildren} onClick={() => copyToClipboard(formattedVariableKey)}>
      <ListItemText
        primary={formattedVariableKey}
        secondary={builtin ? t(variableValue) : variableValue}
      />
      <CopyAllOutlined />
    </ListItemButton>
  );
};

const useStyles = makeStyles(() => ({
  button: {
    textTransform: 'none',
    height: 18,
  },
  containerFlex: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  dialogPaper: {
    minHeight: '90vh',
    maxHeight: '90vh',
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
  const [tab, setTab] = useState('1');

  const handleChange = (event: React.SyntheticEvent, newTab: string) => {
    setTab(newTab);
  };

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
      classes={{ paper: classes.dialogPaper }}
    >
      <TabContext value={tab}>
        <TabList onChange={handleChange} style={{ marginLeft: 24, marginTop: 24 }}>
          <Tab sx={{ textTransform: 'none' }} label={t('Builtin variables')} value="1" />
          <Tab sx={{ textTransform: 'none' }} label={t('Custom variables')} value="2" />
        </TabList>
        <DialogContent>
          <TabPanel value="1" style={{ maxHeight: '100%', overflow: 'auto', padding: 0 }}>
            <List>
              {injectType.variables.map((variable) => {
                return (
                  <div key={variable.key}>
                    <VariableChildItem
                      builtin
                      hasChildren={variable.children && variable.children.length > 0}
                      variableKey={variable.key}
                      variableValue={variable.label}
                    />
                    {variable.children && variable.children.length > 0 && (
                      <List component="div" disablePadding>
                        {variable.children.map((variableChild) => {
                          const variableChildKey = `\${${variableChild.key}}`;
                          return (
                            <ListItemButton
                              key={variableChild.key}
                              divider={true}
                              dense={true}
                              sx={{ pl: 4 }}
                              onClick={() => copyToClipboard(variableChildKey)}
                            >
                              <ListItemText
                                primary={variableChildKey}
                                secondary={t(variableChild.label)}
                              />
                              <CopyAllOutlined />
                            </ListItemButton>
                          );
                        })}
                      </List>
                    )}
                  </div>
                );
              })}
            </List>
          </TabPanel>
          <TabPanel value="2" style={{ maxHeight: '100%', overflow: 'auto', padding: 0 }}>
            <Alert severity="info">
              {t('Please follow this link to')}
              {/* TODO: validate when migrate to new react router version */}
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              <Button component={Link}
                      to={`/admin/exercises/${exerciseId}/definition/variables`}
                      color="primary"
                      variant="text"
                      size="small"
                      className={classes.button}
              >
                {me.user_is_planner ? t('manage custom variables') : t('view custom variables')}
              </Button>
            </Alert>
            <List>
              {variables.map((variable) => (
                <div key={variable.variable_key}>
                  <VariableChildItem
                    variableKey={variable.variable_key}
                    variableValue={variable.variable_value}
                  />
                </div>
              ))}
            </List>
          </TabPanel>
        </DialogContent>
      </TabContext>

      <DialogActions>
        <Button onClick={handleClose}>
          {t('Close')}
        </Button>
      </DialogActions>
    </Dialog>

  );
};

export default AvailableVariablesDialog;
