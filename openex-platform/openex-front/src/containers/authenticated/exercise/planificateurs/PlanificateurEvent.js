import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import * as R from 'ramda';
import { FlatButton } from '../../../../components/Button';
import { Dialog } from '../../../../components/Dialog';
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

const PlanificateurEvent = ({
  planificateursEvent,
  eventId,
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

  const handleCheck = (planificateurUserId, eventId) => (event, isChecked) => {
    handleCheckPlanificateur(planificateurUserId, eventId, isChecked);
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
          <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
            <TableRow>
              <TableHeaderColumn>
                <T>FirstName</T>
              </TableHeaderColumn>
              <TableHeaderColumn>
                <T>LastName</T>
              </TableHeaderColumn>
              <TableHeaderColumn>
                <T>Email</T>
              </TableHeaderColumn>
              <TableHeaderColumn>
                <T>Planner</T>
              </TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            {R.values(planificateursEvent).map((planificateur) => (
                <TableRow key={planificateur.user_id}>
                  <TableRowColumn>
                    {planificateur.user_firstname}
                  </TableRowColumn>
                  <TableRowColumn>{planificateur.user_lastname}</TableRowColumn>
                  <TableRowColumn>{planificateur.user_email}</TableRowColumn>
                  <TableRowColumn>
                    <Checkbox
                      defaultChecked={planificateur.is_planificateur_event}
                      onCheck={handleCheck(planificateur.user_id, eventId)}
                    />
                  </TableRowColumn>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </form>
    </Dialog>
  );
};

export default PlanificateurEvent;
