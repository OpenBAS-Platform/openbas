import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'
import {updateExercise, deleteExercise, exportExercise, exportInjectEml} from '../../../../actions/Exercise'
import {shiftAllInjects} from '../../../../actions/Inject'
import {fetchGroups} from '../../../../actions/Group'
import {redirectToHome} from '../../../../actions/Application'
import {Paper} from '../../../../components/Paper'
import {Button, FlatButton} from '../../../../components/Button'
import {Image} from '../../../../components/Image'
import {Checkbox} from '../../../../components/Checkbox'
import {T} from '../../../../components/I18n'
import {i18nRegister} from '../../../../utils/Messages'
import {Dialog} from '../../../../components/Dialog'
import * as Constants from '../../../../constants/ComponentTypes'
import * as R from 'ramda'
import TemplateForm from './TemplateForm'
import ExerciseForm from '../ExerciseForm'
import FileGallery from '../../FileGallery'
import {dateFormat, dateToISO} from '../../../../utils/Time'
import {addFile, getImportFileSheetsName} from '../../../../actions/File'

const styles = {
  PaperContent: {
    padding: '20px'
  },
  image: {
    width: '90%'
  },
  divWarning: {
    border: '2px #FFBF00 solid',
    padding: '10px',
    borderRadius: '5px',
    marginTop: '10px',
    marginBottom: '10px',
    fontWeight: '400',
    backgroundColor: '#F5DA81',
    textAlign: 'center'
  }
}

i18nRegister({
  fr: {
    'Start date': 'Date de début',
    'End date': 'Date de fin',
    'Subtitle': 'Sous-titre',
    'Change the image': 'Changer l\'image',
    'Messages template': 'Modèle des messages',
    'Do you want to delete this exercise?': 'Souhaitez-vous supprimer cet exercice ?',
    'Deleting an exercise will result in deleting all its content, including objectives, events, incidents, injects and audience. We do not recommend you do this.': 'Supprimer un exercice conduit à la suppression de son contenu, incluant ses objectifs, événéments, incidents, injects et audiences. Nous vous déconseillons de faire cela.',
    'You changed the start date of the exercise, do you want to reschedule all injects relatively to the difference with the original start date?': 'Vous avez changé la date du début de l\'exercice, souhaitez-vous replanifier toutes les injections relativement à l\'écart avec la date de début originale ?',
    'Reschedule': 'Replanifier',
    'No': 'Non',
    'Export data of current exercise' : 'Exporter les données de l\'exercice courant',
    'Item' : 'Element',
    'Export audiences data': 'Exporter les données concernant les audiences',
    'Objective': 'Objectifs',
    'Export objectives data': 'Exporter les données concernant les objectifs',
    'Events': 'Evenements',
    'Export events data': 'Exporter les données concernant les événements',
    'Export incidents data': 'Exporter les données concernant les incidents',
    'Inject': 'Injections',
    'Export injects data': 'Exporter les données concernant les injections',
    'Export an exercise': 'Exporter un exercice',
    'Full export for an excercise.': 'Exporter un exercice complet.',
    'Note: You can import a previously exported exercise on "create exercise" form.': 'Note : Vous pouvez importer un exercice préalablement exporté à partir du formulaire de création d\'un nouvel exercice.',
    'Import data to an exercise.': 'Importer un exercice complet.',
    'search': 'Parcourir',
    'Export': 'Exporter',
    'Please, chose data to export': 'Veuillez sélectionner les données à exporter :',
    'Please, chose data to import': 'Veuillez sélectionner les données à importer :',
    'Export of Exercise': 'Export de l\'exercice'
  }
})

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
        openDelete: false,
        openGallery: false,
        openConfirmMailExpediteur: false,
        openExport: false,
        openImport: false,
        initialStartDate: '',
        initialEmailExpediteur: '',
        newStartDate: '',
        newData: '',
        exerciseNameExist: false,
        file: {'file_id': '0'},
        typesToExport: {
          'exercise': '1',
          'audience': '1',
          'objective': '1',
          'scenarios': '1',
          'incidents': '1',
          'injects': '1'
        }
      }
  }
  componentDidMount() {
    this.props.fetchGroups()
  }

  onUpdate(data) {
    let newData = R.pipe( //Need to convert date to ISO format with timezone
      R.assoc('exercise_start_date', dateToISO(data.exercise_start_date)),
      R.assoc('exercise_end_date', dateToISO(data.exercise_end_date)),
      R.assoc('exercise_mail_expediteur', data.exercise_mail_expediteur)
    )(data)

    if (newData.exercise_mail_expediteur !== this.props.initialEmailExpediteur) {
      this.setState({newData: newData})
      this.setState({openConfirmMailExpediteur: true})
    } else {
        return this.props.updateExercise(this.props.id, newData)
    }
  }

  submitInformation() {
    this.refs.informationForm.submit()
  }

  submitExportEml() {
    return this.props.exportInjectEml(this.props.id)
  }

  submitTemplate() {
    this.refs.templateForm.submit()
  }

  handleOpenDelete() {
    this.setState({openDelete: true})
  }

  handleOpenExport() {
    this.setState({openExport: true})
  }

  handleCloseDelete() {
    this.setState({openDelete: false})
  }

  handleCloseExport() {
    this.setState({openExport: false})
  }


  handleExportCheck(type, event, isChecked) {
    let typesToExport = this.state.typesToExport
    if (isChecked) {
      typesToExport[type] = '1'
    } else {
      typesToExport[type] = '0'
    }
    this.setState({typesToExport: typesToExport})
  }


  handleOpenGallery() {
    this.setState({openGallery: true})
  }

  handleCloseGallery() {
    this.setState({openGallery: false})
  }

  submitDelete() {
    return this.props.deleteExercise(this.props.id).then(() => this.props.redirectToHome())
  }

  submitExport() {
    let dataToExport = this.state.typesToExport
    if ((dataToExport['audience'] === '1') && (dataToExport['exercise'] === '0')) {
        alert("Il est impossible d'exporter les audiences sans exporter l'exercice")
    } else if ((dataToExport['objective'] === '1') && (dataToExport['exercise'] === '0')) {
        alert("Il est impossible d'exporter les objectifs sans exporter l'exercice")
    } else if ((dataToExport['scenarios'] === '1') && (dataToExport['exercise'] === '0')) {
        alert("Il est impossible d'exporter les scénarios sans exporter l'exercice")
    } else if ((dataToExport['incidents'] === '1') && (dataToExport['scenarios'] === 0 || dataToExport['exercise'] === '0')) {
        alert("Il est impossible d'exporter les incidents sans exporter l'exercice et les scénarios")
    } else if ((dataToExport['injects'] === '1') && (dataToExport['incidents'] === 0 || dataToExport['scenarios'] === 0 || dataToExport['exercise'] === '0')) {
        alert("Il est impossible d'exporter les incidents sans exporter l'exercice, les scénarios et les incidents")
    } else {
      this.setState({openExport: false})
      return this.props.exportExercise(this.props.id, dataToExport);
    }
  }


  handleImageSelection(file) {
    let data = {"exercise_image": file.file_id}
    this.props.updateExercise(this.props.id, data)
    this.handleCloseGallery()
  }

  handleCloseConfirmMailExpediteur() {
   this.setState({openConfirmMailExpediteur: false})
  }

  submitConfirmEmail(data) {
    let newData = this.state.newData
    this.props.updateExercise(this.props.id, newData)
    this.handleCloseConfirmMailExpediteur()
  }

  render() {
    let exercise_is_deletable = R.propOr(true, 'user_can_delete', this.props.exercise)

    const deleteActions = [
      <FlatButton key="cancel" label="Cancel" primary={true} onClick={this.handleCloseDelete.bind(this)}/>,
      exercise_is_deletable ? <FlatButton key="delete" label="Delete" primary={true} onClick={this.submitDelete.bind(this)}/>: ""
    ]

    const exportActions = [
      <FlatButton key="cancel" label="Cancel" primary={true} onClick={this.handleCloseExport.bind(this)}/>,
      <FlatButton key="export" label="Export" primary={true} onClick={this.submitExport.bind(this)}/>,
    ]

    const confirmEmailActions = [
      <FlatButton key="no" label="No" primary={true} onClick={this.handleCloseConfirmMailExpediteur.bind(this)}/>,
      <FlatButton key="yes" label="Yes" primary={true} onClick={this.submitConfirmEmail.bind(this)}/>
    ]

    const {exercise} = this.props
    let splittedStartDate = R.split(' ', dateFormat(R.path(['exercise', 'exercise_start_date'], this.props)))
    let splittedEndDate = R.split(' ', dateFormat(R.path(['exercise', 'exercise_end_date'], this.props)))
    let initPipe = R.pipe(
      R.assoc('exercise_start_date_only', splittedStartDate[0]),
      R.assoc('exercise_start_time', splittedStartDate[1]),
      R.assoc('exercise_end_date_only', splittedEndDate[0]),
      R.assoc('exercise_end_time', splittedStartDate[1]),
      R.assoc('exercise_animation_group', R.path(['exercise', 'exercise_animation_group', 'group_id'], this.props)),
      R.pick([
        'exercise_name',
        'exercise_description',
        'exercise_subtitle',
        'exercise_start_date_only',
        'exercise_start_time',
        'exercise_end_date_only',
        'exercise_end_time',
        'exercise_message_header',
        'exercise_message_footer',
        'exercise_mail_expediteur',
        'exercise_animation_group'])
    )

    const informationValues = exercise !== undefined ? initPipe(exercise) : undefined
    const image_id = R.pathOr(null, ['exercise_image', 'file_id'], exercise)
    return (
      <div>

        {this.props.userCanUpdate ?
        <Paper type={Constants.PAPER_TYPE_SETTINGS} zDepth={2}>
          <div style={styles.PaperContent}>
            <h2>Information</h2>
            <ExerciseForm
              ref="informationForm"
              onSubmit={this.onUpdate.bind(this)}
              initialValues={informationValues}
              hideDates={true}
            />
            <br />
            <Button type="submit" label="Update" onClick={this.submitInformation.bind(this)}/>
          </div>
          <Dialog
            title="Confirmer le changement de mail expéditeur"
            modal={false}
            open={this.state.openConfirmMailExpediteur}
            onRequestClose={this.handleCloseConfirmMailExpediteur.bind(this)}
            actions={confirmEmailActions}
          >
            <T>Confirmez vous le changement de mail expédieur ?</T>
          </Dialog>
        </Paper>
        : ""
        }

        {this.props.userCanUpdate ?
        <Paper type={Constants.PAPER_TYPE_SETTINGS} zDepth={2}>
          <div style={styles.PaperContent}>
            <h2><T>Messages template</T></h2>
            <TemplateForm ref="templateForm" onSubmit={this.onUpdate.bind(this)} initialValues={informationValues}
                          groups={this.props.groups}/>
            <br />
            <Button type="submit" label="Update" onClick={this.submitTemplate.bind(this)}/>
          </div>
        </Paper>
        : ""
        }

        <Paper type={Constants.PAPER_TYPE_SETTINGS} zDepth={2}>
          <div style={styles.PaperContent}>
            <h2>Image</h2>
            <br />
            {image_id ? <Image image_id={image_id} alt="Exercise logo" style={styles.image}/> : ""}
            <br /><br />
            {this.props.userCanUpdate ?
              <div>
                <Button
                  label='Change the image'
                  onClick={this.handleOpenGallery.bind(this)}
                />
                <Dialog
                  modal={false}
                  open={this.state.openGallery}
                  onRequestClose={this.handleCloseGallery.bind(this)}
                >
                  <FileGallery fileSelector={this.handleImageSelection.bind(this)}/>
                </Dialog>
              </div>
              : ""
            }
          </div>
        </Paper>

        {this.props.userCanUpdate ?
        <Paper type={Constants.PAPER_TYPE_SETTINGS} zDepth={2}>
          <div style={styles.PaperContent}>
            <h2><T>Delete</T></h2>
            <p><T>Deleting an exercise will result in deleting all its content, including objectives, events, incidents,
              injects and audience. We do not recommend you do this.</T></p>
            {exercise_is_deletable ? <Button label="Delete" onClick={this.handleOpenDelete.bind(this)}/> : ""}
            <Dialog
              title="Confirmation"
              modal={false}
              open={this.state.openDelete}
              onRequestClose={this.handleCloseDelete.bind(this)}
              actions={deleteActions}
            >
              <T>Do you want to delete this exercise?</T>
            </Dialog>
          </div>
        </Paper>
        : ""
        }

        <Paper type={Constants.PAPER_TYPE_SETTINGS} zDepth={2}>
          <div style={styles.PaperContent}>
             <h2><T>Export an exercise</T></h2>
              <p><T>Full export for an excercise.</T></p>
              <p><T>Note: You can import a previously exported exercise on "create exercise" form.</T></p>
              <Button label="Export" onClick={this.handleOpenExport.bind(this)}/>
            <Dialog title="Export of Exercise" modal={true} open={this.state.openExport}
                    onRequestClose={this.handleCloseExport.bind(this)}
                    actions={exportActions}>
              <T>Please, chose data to export</T>
              <Table selectable={true} style={{marginTop: '5px'}}>
                <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
                  <TableRow>
                    <TableHeaderColumn width='30'><T>Export</T></TableHeaderColumn>
                    <TableHeaderColumn width='130'><T>Item</T></TableHeaderColumn>
                    <TableHeaderColumn><T>Description</T></TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody displayRowCheckbox={false}>
                  <TableRow key="tab-exercise">
                    <TableRowColumn width='30'>
                      <Checkbox defaultChecked={true} name="chk-export-exercise" onCheck={this.handleExportCheck.bind(this, 'exercise')}/>
                    </TableRowColumn>
                    <TableRowColumn width='130'><T>Exercise</T></TableRowColumn>
                    <TableRowColumn><T>Export data of current exercise</T></TableRowColumn>
                  </TableRow>
                  <TableRow key="tab-audiences">
                    <TableRowColumn width='30'>
                      <Checkbox defaultChecked={true} name="chk-export-audiences" onCheck={this.handleExportCheck.bind(this, 'audience')}/>
                    </TableRowColumn>
                    <TableRowColumn width='130'><T>Audiences</T></TableRowColumn>
                    <TableRowColumn><T>Export audiences data</T></TableRowColumn>
                  </TableRow>
                  <TableRow key="tab-objective">
                    <TableRowColumn width='30'>
                      <Checkbox defaultChecked={true} name="chk-export-objective" onCheck={this.handleExportCheck.bind(this, 'objective')}/>
                    </TableRowColumn>
                    <TableRowColumn width='130'><T>Objective</T></TableRowColumn>
                    <TableRowColumn><T>Export objectives data</T></TableRowColumn>
                  </TableRow>
                  <TableRow key="tab-scenarios">
                    <TableRowColumn width='30'>
                      <Checkbox defaultChecked={true} name="chk-export-scenarios" onCheck={this.handleExportCheck.bind(this, 'scenarios')}/>
                    </TableRowColumn>
                    <TableRowColumn width='130'><T>Events</T></TableRowColumn>
                    <TableRowColumn><T>Export events data</T></TableRowColumn>
                  </TableRow>
                  <TableRow key="tab-incidents">
                    <TableRowColumn width='30'>
                      <Checkbox defaultChecked={true} name="chk-export-incidents" onCheck={this.handleExportCheck.bind(this, 'incidents')}/>
                    </TableRowColumn>
                    <TableRowColumn width='130'><T>Incidents</T></TableRowColumn>
                    <TableRowColumn><T>Export incidents data</T></TableRowColumn>
                  </TableRow>
                  <TableRow key="tab-injects">
                    <TableRowColumn width='30'>
                      <Checkbox defaultChecked={true} name="chk-export-injects" onCheck={this.handleExportCheck.bind(this, 'injects')}/>
                    </TableRowColumn>
                    <TableRowColumn width='130'><T>Injects</T></TableRowColumn>
                    <TableRowColumn><T>Export injects data</T></TableRowColumn>
                  </TableRow>
                </TableBody>
              </Table>
            </Dialog>
          </div>
        </Paper>

        <Paper type={Constants.PAPER_TYPE_SETTINGS} zDepth={2}>
          <div style={styles.PaperContent}>
            <h2><T>Export des Emails</T></h2>
            <p><T>Exporter de tous les injects de l'exercice au format EML dans une archive.</T></p>
            <Button label='Exporter' onClick={this.submitExportEml.bind(this)}/>
          </div>
        </Paper>

      </div>
    )
  }
}

Index.propTypes = {
  id: PropTypes.string,
  exercise: PropTypes.object,
  exercise_statuses: PropTypes.object,
  initialStartDate: PropTypes.string,
  initialEmailExpediteur: PropTypes.string,
  params: PropTypes.object,
  updateExercise: PropTypes.func,
  redirectToHome: PropTypes.func,
  deleteExercise: PropTypes.func,
  exportInjectEml: PropTypes.func,
  exportExercise: PropTypes.func,
  shiftAllInjects: PropTypes.func,
  fetchGroups: PropTypes.func,
  groups: PropTypes.array,
  addFile: PropTypes.func,
  userCanUpdate: PropTypes.bool,
  getImportFileSheetsName: PropTypes.func
}

const checkUserCanUpdate = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  let userId = R.path(['logged', 'user'], state.app)
  let isAdmin = R.path([userId, 'user_admin'], state.referential.entities.users)

  let userCanUpdate = isAdmin
  if (!userCanUpdate) {
    let groupValues = R.values(state.referential.entities.groups)
    groupValues.forEach((group) => {
      group.group_grants.forEach((grant) => {
        if (
          grant
          && grant.grant_exercise
          && (grant.grant_exercise.exercise_id === exerciseId)
          && (grant.grant_name === 'PLANNER')
        ) {
          group.group_users.forEach((user) => {
            if (user && (user.user_id === userId)) {
              userCanUpdate = true
            }
          })
        }
      })
    })
  }

  return userCanUpdate
}

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  let exercise = R.prop(exerciseId, state.referential.entities.exercises)

  return {
    id: exerciseId,
    exercise: exercise,
    groups: R.values(state.referential.entities.groups),
    userCanUpdate: checkUserCanUpdate(state, ownProps),
    initialStartDate: dateToISO(R.propOr('1970-01-01 08:00:00', 'exercise_start_date', exercise)),
    initialEmailExpediteur: R.prop('exercise_mail_expediteur', exercise)
  }
}

export default connect(select, {updateExercise, redirectToHome, deleteExercise, exportInjectEml, exportExercise , fetchGroups, shiftAllInjects, addFile, getImportFileSheetsName})(Index)
