import React from 'react';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
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

  const handleCheck = (planificateurUserId, audienceId) => (
    event,
    isChecked,
  ) => {
    handleCheckPlanificateur(planificateurUserId, audienceId, isChecked);
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
            {R.values(planificateursAudience).map((planificateur) => (
                <TableRow key={planificateur.user_id}>
                  <TableRowColumn>
                    {planificateur.user_firstname}
                  </TableRowColumn>
                  <TableRowColumn>{planificateur.user_lastname}</TableRowColumn>
                  <TableRowColumn>{planificateur.user_email}</TableRowColumn>
                  <TableRowColumn>
                    <Checkbox
                      defaultChecked={planificateur.is_planificateur_audience}
                      onCheck={handleCheck(planificateur.user_id, audienceId)}
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

export default PlanificateurAudience;
