import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {T} from '../../../components/I18n'
import * as Constants from '../../../constants/ComponentTypes'
import {i18nRegister} from '../../../utils/Messages'
import {
  addExercise,
  updateExercise,
  deleteExercise,
  exportExercise,
  importExercise,
  exportInjectEml,
  fetchExercise,
  checkIfExerciseNameExist
} from '../../../actions/Exercise'
import {addFile, getImportFileSheetsName} from '../../../actions/File'
import {downloadDocument} from '../../../actions/Document'
import {Dialog, DialogTitleElement} from '../../../components/Dialog'
import {Checkbox} from '../../../components/Checkbox'
import {FlatButton, FloatingActionsButtonCreate} from '../../../components/Button'
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'
import SelectExercise from "./SelectExercise"
import AudienceForm from "./audiences/audience/AudienceForm"
import ExerciseForm from "./ExerciseForm";
import {SimpleTextField} from "../../../components/SimpleTextField";
import {Chip} from "../../../components/Chip";
import {Avatar} from "../../../components/Avatar";
import {List} from "../../../components/List";
import * as R from "ramda";
import {MainSmallListItem} from "../../../components/list/ListItem";
import {addAudience, fetchAudiences, fetchAudience} from "../../../actions/Audience";
import {addSubaudience, updateSubaudience, fetchSubaudiences} from "../../../actions/Subaudience";
import {addInject, fetchInjectTypesExerciseSimple} from "../../../actions/Inject";
import {addEvent} from "../../../actions/Event";
import {addIncident, fetchIncidentTypes} from "../../../actions/Incident";
import InjectForm from "./scenario/event/InjectForm";
import InjectContentForm from "./scenario/event/InjectContentForm";
import {dateToISO} from "../../../utils/Time";
import {Step, StepLabel, Stepper} from "../../../components/Stepper";

i18nRegister({
  fr: {
    'Create a new simple exercise': 'Créer un exercice simple',
    'Create a new standard exercise': 'Créer un exercice standard',
    'Create a new audience': 'Créer une audience',
    '1. Parameters': '1. Paramètres',
    '2. Content': '2. Contenu'
  }
})

const styles = {
  divWarning: {
    'border': '2px #FFBF00 solid',
    'padding': '10px',
    'borderRadius': '5px',
    'marginTop': '10px',
    'marginBottom': '10px',
    'fontWeight': '400',
    'backgroundColor': '#F5DA81',
    'textAlign': 'center'
  },
  'name': {
    float: 'left',
    width: '30%',
    padding: '5px 0 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  'mail': {
    float: 'left',
    width: '40%',
    padding: '5px 0 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  'org': {
    float: 'left',
    width: '25%',
    padding: '5px 0 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  select: {
    textAlign: 'center',
  }
}

class CreateExercise extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openExercise: false,
      openStandardExercise: false,
      openAudience: false,
      openSubaudience: false,
      openAddUsers: false,
      openInject: false,
      searchTerm: '',
      users: [],
      openImport: false,
      openSelect: false,
      exerciseNameExist: false,
      exerciseData: null,
      audienceData: null,
      subaudienceData: null,
      eventData: null,
      incidentData: null,
      usersData: null,
      incidentType: null,
      subaudienceUsersIds: [],
      file: {
        'file_id': '0'
      },
      typesToImport: {
        'exercise': '1',
        'audience': '1',
        'objective': '1',
        'scenarios': '1',
        'incidents': '1',
        'injects': '1'
      },
      dataToImport: {
        'exercise': '0',
        'audience': '0',
        'objective': '0',
        'scenarios': '0',
        'incidents': '0',
        'injects': '0'
      },
      typeExercise: null,
      open: false,
      stepIndex: 0,
      finished: false,
      inject_types: {},
      type: 'openex_manual',
      injectData: null,
      injectAttachments: []
    }
  }

  handleOpenImport(data, exercise_exist) {
    data.map(
      (value) => {
        let dataToImport = this.state.dataToImport
        dataToImport[value] = '1'
        this.setState({
          exerciseNameExist: exercise_exist,
          dataToImport: dataToImport
        })
        return value
      }
    )
    this.setState({openImport: true})
  }

  handleOpen() {
    this.setState({openExercise: true})
  }

  handleSelectStandardExercise() {
    this.setState({openStandardExercise: true})
  }

  handleClose() {
    this.setState({openExercise: false})
  }

  handleCloseStandardExercise() {
    this.handleCloseSelect()
    this.setState({openStandardExercise: false})
  }

  handleCreate() {
    this.handleClose()
    this.handleCloseSelect()
    this.handleOpenAudience()
  }

  onSubmit(data) {
    data.exercise_start_date = this.convertDate(data.exercise_start_date_only + ' ' + data.exercise_start_time);
    data.exercise_end_date = this.convertDate(data.exercise_end_date_only + ' ' + data.exercise_end_time);
    data.exercise_type = 'simple'

    delete data.exercise_start_date_only
    delete data.exercise_start_time
    delete data.exercise_end_date_only
    delete data.exercise_end_time

    this.setState({exerciseData: data})
  }

  onSubmitStandardExercise(data) {
    data.exercise_start_date = this.convertDate(data.exercise_start_date_only + ' ' + data.exercise_start_time);
    data.exercise_end_date = this.convertDate(data.exercise_end_date_only + ' ' + data.exercise_end_time);
    data.exercise_type = 'standard'

    delete data.exercise_start_date_only
    delete data.exercise_start_time
    delete data.exercise_end_date_only
    delete data.exercise_end_time

    return this.props.addExercise(data)
  }

  submitForm() {
    this.refs.exerciseForm.submit()
  }

  handleCloseImport() {
    this.setState({
      dataToImport: {
        'exercise': '0',
        'audience': '0',
        'objective': '0',
        'scenarios': '0',
        'incidents': '0',
        'injects': '0'
      },
      openImport: false,
      exerciseNameExist: false
    })
  }

  handleImportCheck(type, event, isChecked) {
    let typesToImport = this.state.typesToImport
    if (isChecked) {
      typesToImport[type] = '1'
    } else {
      typesToImport[type] = '0'
    }
    this.setState({typesToImport: typesToImport})
  }

  submitImport() {
    let dataToImport = this.state.typesToImport
    let fileData = this.state.file
    if ((dataToImport['audience'] === '1') && (dataToImport['exercise'] === '0')) {
      alert("Il est impossible d'importer les audiences sans importer l'exercice")
    } else if ((dataToImport['objective'] === '1') && (dataToImport['exercise'] === '0')) {
      alert("Il est impossible d'importer les objectifs sans importer l'exercice")
    } else if ((dataToImport['scenarios'] === '1') && (dataToImport['exercise'] === '0')) {
      alert("Il est impossible d'importer les scénarios sans importer l'exercice")
    } else if ((dataToImport['incidents'] === '1') && (dataToImport['scenarios'] === 0 || dataToImport['exercise'] === '0')) {
      alert("Il est impossible d'importer les incidents sans importer l'exercice et les scénarios")
    } else if ((dataToImport['injects'] === '1') && (dataToImport['incidents'] === 0 || dataToImport['scenarios'] === 0 || dataToImport['exercise'] === '0')) {
      alert("Il est impossible d'importer les incidents sans importer l'exercice, les scénarios et les incidents")
    } else {
      this.setState({openImport: false})
      this.props.importExercise(fileData["file_id"], dataToImport).then(result => {
        if (result.result['success'] === true) {
          alert('Import terminé avec succès')
          window.location.reload();
        } else {
          alert(result.result['errorMessage'])
        }
      })
    }
  }

  convertDate(dateToConvert) {
    let regexDateFr = RegExp('^(0[1-9]|[12][0-9]|3[01])[/](0[1-9]|1[012])[/](19|20)\\d\\d[ ]([0-1][0-9]|2[0-3])[:]([0-5][0-9])$')
    let regexDateEn = RegExp('^(19|20)\\d\\d[-](0[1-9]|1[012])[-](0[1-9]|[12][0-9]|3[01])[ ]([0-1][0-9]|2[0-3])[:]([0-5][0-9])$')
    let timeSplitted, dateSplitted, split, newDate;

    if (regexDateFr.test(dateToConvert)) {
      split = dateToConvert.split(' ');
      dateSplitted = split[0].split('/')
      timeSplitted = split[1]
      newDate = dateSplitted[2] + '-' + dateSplitted[1] + '-' + dateSplitted[0] + ' ' + timeSplitted
      return newDate
    } else if (regexDateEn.test(dateToConvert)) {
      return dateToConvert
    }
  }

  openFileDialog() {
    this.refs.fileUpload.click()
  }

  importExercise() {
    this.setState({
      openExercise: false,
      openImport: true
    })
  }

  handleFileChange() {
    let data = new FormData();
    data.append('file', this.refs.fileUpload.files[0])
    this.props.addFile(data).then(file => {
      let fileData = {
        "file_id": file.result
      }
      this.setState({file: fileData})
      this.props.getImportFileSheetsName(file.result).then(fileSheets => {
        this.props.checkIfExerciseNameExist(file.result).then(exerciseExistResult => {
          this.handleOpenImport(fileSheets.result, exerciseExistResult.result.exercise_exist)
        })
      })
    })
  }

  handleOpenAudience() {
    this.setState({openAudience: true})
  }

  handleCloseAudience() {
    this.setState({openAudience: false})
  }

  onSubmitAudience(data) {
    this.setState({audienceData: data})
    let subaudience = {
      "exercise_mail_expediteur": "animation@domaine.fr",
      "subaudience_name": "sous audience"
    }
    this.setState({subaudienceData: subaudience})
    this.handleInitializeEvent()
    this.handleInitializeIncident()
  }

  handleInitializeEvent() {
    let event = {
      "event_title": "événement",
      "event_description": "événement"
    }
    this.setState({eventData: event})
  }

  handleInitializeIncident() {
    this.props.fetchIncidentTypes().then(value => {
      if (value.result.length !== 0) {
        let incident = {
          "incident_title": "incident",
          "incident_type": value.result[0],
          "incident_weight": 3,
          "incident_story": "incident"
        }
        this.setState({incidentData: incident})
      }
    })
  }

  handleCreateAudience() {
    this.handleCloseAudience()
    this.handleOpenAddUsers()
  }

  submitFormAudience() {
    this.refs.audienceForm.submit()
  }

  handleOpenAddUsers() {
    this.setState({openAddUsers: true})
  }

  handleCloseAddUsers() {
    this.setState({
      openAddUsers: false,
      searchTerm: '',
      users: []
    })
  }

  handleSearchUsers(event, value) {
    this.setState({searchTerm: value})
  }

  submitAddUsers() {
    let usersList = R.pipe(
      R.map(u => u.user_id),
      R.concat(this.state.subaudienceUsersIds)
    )(this.state.users)
    this.setState({usersData: usersList})
    this.handleInitializeInject()
    this.handleOpenInject()
    this.handleCloseAddUsers()
  }

  handleInitializeInject() {
    this.props.fetchInjectTypesExerciseSimple().then(value => {
      this.setState({inject_types: value.result})
    })
  }

  addUser(user) {
    if (!this.state.subaudienceUsersIds.includes(user.user_id) && !this.state.users.includes(user)) {
      this.setState({users: R.append(user, this.state.users)})
    }
  }

  removeUser(user) {
    this.setState({users: R.filter(u => u.user_id !== user.user_id, this.state.users)})
  }

  handleOpenSelect() {
    this.setState({openSelect: true})
  }

  handleCloseSelect() {
    this.setState({openSelect: false})
  }

  handleSelectSimpleExercise() {
    this.handleOpen()
  }

  handleOpenInject() {
    this.setState({openInject: true})
  }

  handleCloseInject() {
    this.setState({
      openInject: false,
      stepIndex: 0,
      finished: false,
      type: 'openex_manual',
      injectData: null,
      injectAttachments: []
    })
  }

  onGlobalSubmit(data) {
    data.inject_date = this.convertDateInject(data.inject_date_only + ' ' + data.inject_time);

    delete data.inject_date_only
    delete data.inject_time

    this.setState({injectData: data})
  }

  convertDateInject(dateToConvert) {
    let regexDateFr = RegExp('^(0[1-9]|[12][0-9]|3[01])[/](0[1-9]|1[012])[/](19|20)\\d\\d[ ]([0-1][0-9]|2[0-3])[:]([0-5][0-9])$')
    let regexDateEn = RegExp('^(19|20)\\d\\d[-](0[1-9]|1[012])[-](0[1-9]|[12][0-9]|3[01])[ ]([0-1][0-9]|2[0-3])[:]([0-5][0-9])$')
    let timeSplitted, dateSplitted, split, newDate;

    if (regexDateFr.test(dateToConvert)) {
      split = dateToConvert.split(' ');
      dateSplitted = split[0].split('/')
      timeSplitted = split[1]
      newDate = dateSplitted[2] + '-' + dateSplitted[1] + '-' + dateSplitted[0] + ' ' + timeSplitted
      return newDate
    } else if (regexDateEn.test(dateToConvert)) {
      return dateToConvert
    }
  }

  onContentAttachmentAdd(file) {
    this.setState({injectAttachments: R.append(file, this.state.injectAttachments)})
  }

  onContentAttachmentDelete(name, event) {
    event.stopPropagation()
    this.setState({injectAttachments: R.filter(a => a.document_name !== name, this.state.injectAttachments)})
  }

  onContentSubmit(data) {
    let injectData = this.state.injectData
    data.attachments = this.state.injectAttachments
    injectData.inject_content = JSON.stringify(data)
    this.setState({injectData: injectData})
  }

  onAudiencesChange(data) {
    let injectData = this.state.injectData
    injectData.inject_audiences = data
    this.setState({injectData: injectData})
  }

  onSubaudiencesChange(data) {
    let injectData = this.state.injectData
    injectData.inject_subaudiences = data
    this.setState({injectData: injectData})
  }

  handleNext() {
    if (this.state.stepIndex === 0) {
      this.refs.injectForm.submit()
    } else if (this.state.stepIndex === 1) {
      this.refs.contentForm.getWrappedInstance().submit()
    }
  }

  createInject() {
    //creation d'un exercice et recuperation de son Id
    this.props.addExercise(this.state.exerciseData)
      .then(value => {
        let exerciseId = value.result

        //creation de l'audience correspondante et recuperation de son Id
        this.props.addAudience(exerciseId, this.state.audienceData)
          .then(value => {
            let audienceId = value.result

            //creation de la sous-audience correspondante et recuperation de son Id
            this.props.addSubaudience(exerciseId, audienceId, this.state.subaudienceData)
              .then(value => {
                let subaudienceId = value.result
                this.props.updateSubaudience(exerciseId, audienceId, subaudienceId, {
                  subaudience_users: this.state.usersData
                })

                //creation de l'evenement correspondant et recuperation de son Id
                this.props.addEvent(exerciseId, this.state.eventData)
                  .then(value => {
                    let eventId = value.result

                    //creation de l'incident correspondant et recuperation de son Id
                    this.props.addIncident(exerciseId, eventId, this.state.incidentData)
                      .then(value => {
                        let incidentId = value.result
                        //ajout de l'audience et de la sous-audience
                        this.onAudiencesChange([audienceId])
                        this.onSubaudiencesChange([])
                        //construction de l'inject
                        let data = R.assoc('inject_date', dateToISO(this.state.injectData.inject_date), this.state.injectData)
                        //creation de l'inject
                        this.props.addInject(exerciseId, eventId, incidentId, data)
                        this.handleCloseInject()

                      })
                  })
              })
          })
      })
  }

  onInjectTypeChange(event, index, value) {
    this.setState({type: value})
  }

  selectContent() {
    this.setState({stepIndex: 1})
  }

  downloadAttachment(document_id, document_name) {
    return this.props.downloadDocument(document_id, document_name)
  }

  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <InjectForm
            ref="injectForm"
            onSubmit={this.onGlobalSubmit.bind(this)}
            onSubmitSuccess={this.selectContent.bind(this)}
            onInjectTypeChange={this.onInjectTypeChange.bind(this)}
            initialValues={{inject_type: 'openex_manual'}}
            types={this.state.inject_types}/>
        )
      case 1:
        return (
          <InjectContentForm
            ref="contentForm"
            types={this.state.inject_types}
            type={this.state.type}
            onSubmit={this.onContentSubmit.bind(this)}
            onSubmitSuccess={this.createInject.bind(this)}
            onContentAttachmentAdd={this.onContentAttachmentAdd.bind(this)}
            onContentAttachmentDelete={this.onContentAttachmentDelete.bind(this)}
            downloadAttachment={this.downloadAttachment.bind(this)}
            attachments={this.state.injectAttachments}/>
        )
      default:
        return 'Go away!'
    }
  }

  render() {
    const exerciseSimpleActions = [
      <FlatButton label="Cancel" primary={true} onClick={this.handleClose.bind(this)}/>,
      <FlatButton label="Create" primary={true} onClick={this.submitForm.bind(this)}/>,
    ]

    const exerciseStandardActions = [
      <FlatButton label="Cancel" primary={true} onClick={this.handleCloseStandardExercise.bind(this)}/>,
      <FlatButton label="Create" primary={true} onClick={this.submitForm.bind(this)}/>,
    ]

    const importActions = [
      <FlatButton key="cancel" label="Cancel" primary={true} onClick={this.handleCloseImport.bind(this)}/>,
      <FlatButton key="export" label="Import" primary={true} onClick={this.submitImport.bind(this)}/>,
    ]

    const audienceActions = [
      <FlatButton label="Cancel" primary={true} onClick={this.handleCloseAudience.bind(this)}/>,
      <FlatButton label="Next" primary={true} onClick={this.submitFormAudience.bind(this)}/>,
    ]

    const addUsersActions = [
      <FlatButton key="cancel" label="Cancel" primary={true} onClick={this.handleCloseAddUsers.bind(this)}/>,
      <FlatButton key="add" label="Add these users" primary={true} onClick={this.submitAddUsers.bind(this)}/>,
    ]

    const injectActions = [
      <FlatButton
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseInject.bind(this)}
      />,
      <FlatButton
        key="create"
        label={this.state.stepIndex === 1 ? "Create" : "Next"}
        primary={true}
        onClick={this.handleNext.bind(this)}
      />,
    ]

    let informationValues = {'exercise_mail_expediteur': 'animation@domaine.fr'}

    //region filter users by active keyword
    const keyword = this.state.searchTerm
    let filterByKeyword = n => keyword === '' ||
      n.user_email.toLowerCase().indexOf(keyword.toLowerCase()) !== -1 ||
      n.user_firstname.toLowerCase().indexOf(keyword.toLowerCase()) !== -1 ||
      n.user_lastname.toLowerCase().indexOf(keyword.toLowerCase()) !== -1
    let filteredUsers = R.filter(filterByKeyword, R.values(this.props.users))
    //endregion

    return (
      <div>
        <input type="file" ref="fileUpload" style={{"display": "none"}} onChange={this.handleFileChange.bind(this)}/>
        <FloatingActionsButtonCreate type={Constants.BUTTON_TYPE_FLOATING} onClick={this.handleOpenSelect.bind(this)}/>
        <Dialog title="Sélectionner le type d'exercice" modal={false} open={this.state.openSelect}
                onRequestClose={this.handleCloseSelect.bind(this)}>
          <SelectExercise onSubmit={this.handleCloseSelect.bind(this)} createStandardExercise={this.handleSelectStandardExercise.bind(this)}
                          createSimpleExercise={this.handleSelectSimpleExercise.bind(this)}
                          closeSelect={this.handleCloseSelect.bind(this)}
                          importExercise={this.openFileDialog.bind(this)}/>
        </Dialog>
        <Dialog title="Create a new simple exercise" modal={false} open={this.state.openExercise}
                onRequestClose={this.handleClose.bind(this)} actions={exerciseSimpleActions}>
          <ExerciseForm ref="exerciseForm" onSubmit={this.onSubmit.bind(this)}
                        onSubmitSuccess={this.handleCreate.bind(this)} initialValues={informationValues}/>
        </Dialog>
        <Dialog title="Create a new standard exercise" modal={false} open={this.state.openStandardExercise}
                onRequestClose={this.handleCloseStandardExercise.bind(this)} actions={exerciseStandardActions}>
          <ExerciseForm ref="exerciseForm" onSubmit={this.onSubmitStandardExercise.bind(this)}
                        onSubmitSuccess={this.handleCloseStandardExercise.bind(this)}
                        initialValues={informationValues}/>
        </Dialog>
        <Dialog title="Importer un exercice" modal={true} open={this.state.openImport}
                onRequestClose={this.handleCloseImport.bind(this)}
                actions={importActions}>
          {(this.state.exerciseNameExist === true) ?
            <div style={styles.divWarning}>
              Attention, vous êtes déja le propriétaire d'un exercice portant le même nom.<br/>
              En cas d'import votre exercice sera mis à jour.</div>
            : ""}
          <T>Please, chose data to import</T>
          <Table selectable={true} style={{marginTop: '5px'}}>
            <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
              <TableRow>
                <TableHeaderColumn width='30'><T>Import</T></TableHeaderColumn>
                <TableHeaderColumn width='130'><T>Items</T></TableHeaderColumn>
                <TableHeaderColumn><T>Description</T></TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
              {(this.state.dataToImport['exercise'] === '1') ?
                <TableRow key="tab-exercise">
                  <TableRowColumn width='30'>
                    <Checkbox defaultChecked={true} name="chk-import-exercise"
                              onCheck={this.handleImportCheck.bind(this, 'exercise')}/>
                  </TableRowColumn>
                  <TableRowColumn width='130'>Exercise</TableRowColumn>
                  <TableRowColumn>Import data from exercise sheet</TableRowColumn>
                </TableRow>
                : ""}
              {(this.state.dataToImport['audience'] === '1') ?
                <TableRow key="tab-audiences">
                  <TableRowColumn width='30'>
                    <Checkbox defaultChecked={true} name="chk-import-audience"
                              onCheck={this.handleImportCheck.bind(this, 'audience')}/>
                  </TableRowColumn>
                  <TableRowColumn width='130'>Audiences</TableRowColumn>
                  <TableRowColumn>Import data from audience sheet</TableRowColumn>
                </TableRow>
                : ""}
              {(this.state.dataToImport['objective'] === '1') ?
                <TableRow key="tab-objective">
                  <TableRowColumn width='30'>
                    <Checkbox defaultChecked={true} name="chk-import-objective"
                              onCheck={this.handleImportCheck.bind(this, 'objective')}/>
                  </TableRowColumn>
                  <TableRowColumn width='130'>Objective</TableRowColumn>
                  <TableRowColumn>Import data from objective sheet</TableRowColumn>
                </TableRow>
                : ""}
              {(this.state.dataToImport['scenarios'] === '1') ?
                <TableRow key="tab-scenarios">
                  <TableRowColumn width='30'>
                    <Checkbox defaultChecked={true} name="chk-import-scenarios"
                              onCheck={this.handleImportCheck.bind(this, 'scenarios')}/>
                  </TableRowColumn>
                  <TableRowColumn width='130'>Events</TableRowColumn>
                  <TableRowColumn>Import data from events sheet</TableRowColumn>
                </TableRow>
                : ""}
              {(this.state.dataToImport['incidents'] === '1') ?
                <TableRow key="tab-incidents">
                  <TableRowColumn width='30'>
                    <Checkbox defaultChecked={true} name="chk-import-incidents"
                              onCheck={this.handleImportCheck.bind(this, 'incidents')}/>
                  </TableRowColumn>
                  <TableRowColumn width='130'>Incidents</TableRowColumn>
                  <TableRowColumn>Import data from incident sheet</TableRowColumn>
                </TableRow>
                : ""}
              {(this.state.dataToImport['injects'] === '1') ?
                <TableRow key="tab-injects">
                  <TableRowColumn width='30'>
                    <Checkbox defaultChecked={true} name="chk-import-injects"
                              onCheck={this.handleImportCheck.bind(this, 'injects')}/>
                  </TableRowColumn>
                  <TableRowColumn width='130'>Injects</TableRowColumn>
                  <TableRowColumn>Import data from injects sheet</TableRowColumn>
                </TableRow>
                : ""}
            </TableBody>
          </Table>
        </Dialog>
        <Dialog title="Create a new audience" modal={false} open={this.state.openAudience}
                onRequestClose={this.handleCloseAudience.bind(this)} actions={audienceActions}>
          <AudienceForm ref="audienceForm" onSubmit={this.onSubmitAudience.bind(this)}
                        onSubmitSuccess={this.handleCreateAudience.bind(this)} initialValues={informationValues}/>
        </Dialog>
        <DialogTitleElement
          title={<SimpleTextField name="keyword" fullWidth={true} type="text" hintText="Search for a user"
                                  onChange={this.handleSearchUsers.bind(this)}
                                  styletype={Constants.FIELD_TYPE_INTITLE}/>}
          modal={false}
          open={this.state.openAddUsers}
          onRequestClose={this.handleCloseAddUsers.bind(this)}
          autoScrollBodyContent={true}
          actions={addUsersActions}>
          <div>
            {this.state.users.map(user => {
              return (
                <Chip
                  key={user.user_id}
                  onRequestDelete={this.removeUser.bind(this, user)}
                  type={Constants.CHIP_TYPE_LIST}>
                  <Avatar src={user.user_gravatar} size={32} type={Constants.AVATAR_TYPE_CHIP}/>
                  {user.user_firstname} {user.user_lastname}
                </Chip>
              )
            })}
            <div className="clearfix"></div>
          </div>
          <div>
            <List>
              {R.take(10, filteredUsers).map(user => {
                let disabled = R.find(u => u.user_id === user.user_id, this.state.users) !== undefined
                  || this.state.subaudienceUsersIds.includes(user.user_id)
                let user_organization = R.propOr({}, user.user_organization, this.props.organizations)
                let organizationName = R.propOr('-', 'organization_name', user_organization)
                return (
                  <MainSmallListItem
                    key={user.user_id}
                    disabled={disabled}
                    onClick={this.addUser.bind(this, user)}
                    primaryText={
                      <div>
                        <div style={styles.name}>{user.user_firstname} {user.user_lastname}</div>
                        <div style={styles.mail}>{user.user_email}</div>
                        <div style={styles.org}>{organizationName}</div>
                        <div className="clearfix"></div>
                      </div>
                    }
                    leftAvatar={<Avatar type={Constants.AVATAR_TYPE_LIST} src={user.user_gravatar}/>}
                  />
                )
              })}
            </List>
          </div>
        </DialogTitleElement>
        <DialogTitleElement
          title={
            <Stepper linear={false} activeStep={this.state.stepIndex}>
              <Step>
                <StepLabel>
                  <T>1. Parameters</T>
                </StepLabel>
              </Step>
              <Step>
                <StepLabel>
                  <T>2. Content</T>
                </StepLabel>
              </Step>
            </Stepper>
          }
          modal={false}
          open={this.state.openInject}
          onRequestClose={this.handleClose.bind(this)}
          autoScrollBodyContent={true}
          actions={injectActions}>
          <div>{this.getStepContent(this.state.stepIndex)}</div>
        </DialogTitleElement>
      </div>
    )
  }
}

CreateExercise.propTypes = {
  addExercise: PropTypes.func,
  fetchExercise: PropTypes.func,
  addAudience: PropTypes.func,
  fetchAudiences: PropTypes.func,
  fetchAudience: PropTypes.func,
  addSubaudience: PropTypes.func,
  fetchSubaudiences: PropTypes.func,
  addEvent: PropTypes.func,
  addIncident: PropTypes.func,
  fetchIncidentTypes: PropTypes.func,
  addInject: PropTypes.func,
  fetchInjectTypesExerciseSimple: PropTypes.func,
  addFile: PropTypes.func,
  getImportFileSheetsName: PropTypes.func,
  updateExercise: PropTypes.func,
  deleteExercise: PropTypes.func,
  exportExercise: PropTypes.func,
  importExercise: PropTypes.func,
  exportInjectEml: PropTypes.func,
  checkIfExerciseNameExist: PropTypes.func,
  organizations: PropTypes.object,
  users: PropTypes.object,
  updateSubaudience: PropTypes.func,
  downloadAttachment: PropTypes.func
}

const select = (state) => {
  return {
    users: state.referential.entities.users,
    organizations: state.referential.entities.organizations
  }
}

export default connect(select, {
  addExercise,
  fetchExercise,
  addAudience,
  fetchAudiences,
  fetchAudience,
  addSubaudience,
  fetchSubaudiences,
  downloadDocument,
  addEvent,
  addIncident,
  fetchIncidentTypes,
  addInject,
  fetchInjectTypesExerciseSimple,
  addFile,
  getImportFileSheetsName,
  updateExercise,
  deleteExercise,
  exportExercise,
  importExercise,
  exportInjectEml,
  checkIfExerciseNameExist,
  updateSubaudience,
})(CreateExercise);
