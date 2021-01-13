import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import * as R from 'ramda';
import Dialog from '@material-ui/core/Dialog';
import { FlatButton } from '../../../../components/Button';
import { T } from '../../../../components/I18n';
import { Checkbox } from '../../../../components/Checkbox';
import { i18nRegister } from '../../../../utils/Messages';

i18nRegister({
  fr: {
    FirstName: 'Prénom',
    LastName: 'Nom',
    Email: 'Adresse mail',
    Planner: 'Planificateur',
    'Please Choose Planners': 'Sélection des planificateurs',
    Cancel: 'Annuler',
    Submit: 'Valider',
  },
});

const PlanificateurAudience = ({
  planificateursAudience,
  audienceId,
  handleCheckPlanificateur,
  openPlanificateur,
  handleClosePlanificateur,
  submitFormPlanificateur,
}) => {
  const planificateurActions = [
    <FlatButton
      key="cancel"
      label="Cancel"
      primary={true}
      onClick={handleClosePlanificateur}
    />,
    <FlatButton
      key="submit"
      label="Submit"
      primary={true}
      onClick={submitFormPlanificateur}
    />,
  ];

  const handleCheck = (planificateurUserId, checkedAudienceId) => (
    event,
    isChecked,
  ) => {
    handleCheckPlanificateur(planificateurUserId, checkedAudienceId, isChecked);
  };

  return (
    <Dialog
      title="Please Choose Planners"
      modal={false}
      open={openPlanificateur}
      autoScrollBodyContent={true}
      onRequestClose={handleClosePlanificateur}
      actions={planificateurActions}
    >
      <form onSubmit={submitFormPlanificateur}>
        <Table selectable={false} style={{ marginTop: '5px' }}>
          <TableHead adjustForCheckbox={false} displaySelectAll={false}>
            <TableRow>
              <TableCell>
                <T>FirstName</T>
              </TableCell>
              <TableCell>
                <T>LastName</T>
              </TableCell>
              <TableCell>
                <T>Email</T>
              </TableCell>
              <TableCell>
                <T>Planner</T>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody displayRowCheckbox={false}>
            {R.values(planificateursAudience).map((planificateur) => (
              <TableRow key={planificateur.user_id}>
                <TableCell>{planificateur.user_firstname}</TableCell>
                <TableCell>{planificateur.user_lastname}</TableCell>
                <TableCell>{planificateur.user_email}</TableCell>
                <TableCell>
                  <Checkbox
                    defaultChecked={planificateur.is_planificateur_audience}
                    onCheck={handleCheck(planificateur.user_id, audienceId)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </form>
    </Dialog>
  );
};

export default PlanificateurAudience;
