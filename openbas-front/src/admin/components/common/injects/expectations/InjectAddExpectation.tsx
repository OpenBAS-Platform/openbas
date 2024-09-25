import React, { FunctionComponent, useContext, useState } from 'react';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { ControlPointOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import type { Theme } from '../../../../../components/Theme';
import { useFormatter } from '../../../../../components/i18n';
import Dialog from '../../../../../components/common/Dialog';
import ExpectationFormCreate from './ExpectationFormCreate';
import type { ExpectationInput, ExpectationInputForm } from './Expectation';
import { PermissionsContext } from '../../Context';

const useStyles = makeStyles((theme: Theme) => ({
  item: {
    paddingLeft: 10,
    height: 50,
  },
  text: {
    fontSize: theme.typography.h2.fontSize,
    color: theme.palette.primary.main,
    fontWeight: theme.typography.h2.fontWeight,
  },
}));

interface InjectAddExpectationProps {
  predefinedExpectations: ExpectationInput[];
  handleAddExpectation: (data: ExpectationInput) => void;
}

const InjectAddExpectation: FunctionComponent<InjectAddExpectationProps> = ({
  predefinedExpectations,
  handleAddExpectation,
}) => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();
  const { permissions } = useContext(PermissionsContext);

  // Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const handleOpen = () => setOpenDialog(true);
  const handleClose = () => setOpenDialog(false);

  // Form
  const onSubmit = (data: ExpectationInputForm) => {
    const values: ExpectationInput = {
      expectation_type: data.expectation_type,
      expectation_name: data.expectation_name,
      expectation_description: data.expectation_description,
      expectation_score: data.expectation_score,
      expectation_expectation_group: data.expectation_expectation_group,
      expectation_expiration_time: data.expiration_time_days * 3600 * 24
        + data.expiration_time_hours * 3600
        + data.expiration_time_minutes * 60,
    };
    handleAddExpectation(values);
    handleClose();
  };

  return (
    <>
      <ListItemButton
        classes={{ root: classes.item }}
        divider={true}
        onClick={handleOpen}
        color="primary"
        disabled={permissions.readOnly}
      >
        <ListItemIcon color="primary">
          <ControlPointOutlined color="primary" />
        </ListItemIcon>
        <ListItemText
          primary={t('Add expectations')}
          classes={{ primary: classes.text }}
        />
      </ListItemButton>
      <Dialog
        open={openDialog}
        handleClose={handleClose}
        title={t('Add expectation in this inject')}
      >
        <ExpectationFormCreate
          predefinedExpectations={predefinedExpectations}
          onSubmit={onSubmit}
          handleClose={handleClose}
        />
      </Dialog>
    </>
  );
};

export default InjectAddExpectation;
