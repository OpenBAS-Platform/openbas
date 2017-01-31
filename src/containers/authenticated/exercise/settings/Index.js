import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {updateExercise, deleteExercise} from '../../../../actions/Exercise'
import {shiftAllInjects} from '../../../../actions/Inject'
import {fetchGroups} from '../../../../actions/Group'
import {redirectToHome} from '../../../../actions/Application'
import {Paper} from '../../../../components/Paper'
import {Button, FlatButton} from '../../../../components/Button'
import {T} from '../../../../components/I18n'
import {i18nRegister} from '../../../../utils/Messages'
import {Dialog} from '../../../../components/Dialog'
import * as Constants from '../../../../constants/ComponentTypes'
import R from 'ramda'
import TemplateForm from './TemplateForm'
import ExerciseForm from '../ExerciseForm'
import FileGallery from '../../FileGallery'
import {dateFormat, dateToISO} from '../../../../utils/Time'

const styles = {
  PaperContent: {
    padding: '20px'
  },
  image: {
    width: '90%'
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
    'No': 'Non'
  }
})

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {openDelete: false, openGallery: false, openShift: false, initialStartDate: '', newStartDate: ''}
  }

  componentDidMount() {
    this.props.fetchGroups()
  }

  onUpdate(data) {
    let newData = R.pipe( //Need to convert date to ISO format with timezone
      R.assoc('exercise_start_date', dateToISO(data.exercise_start_date)),
      R.assoc('exercise_end_date', dateToISO(data.exercise_end_date))
    )(data)

    if (newData.exercise_start_date !== this.props.initialStartDate) {
      this.setState({
        openShift: true,
        initialStartDate: this.props.initialStartDate,
        newStartDate: newData.exercise_start_date
      })
    }

    return this.props.updateExercise(this.props.id, newData)
  }

  submitInformation() {
    this.refs.informationForm.submit()
  }

  submitTemplate() {
    this.refs.templateForm.submit()
  }

  handleOpenDelete() {
    this.setState({openDelete: true})
  }

  handleCloseDelete() {
    this.setState({openDelete: false})
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

  handleImageSelection(file) {
    let data = {"exercise_image": file.file_id}
    this.props.updateExercise(this.props.id, data)
    this.handleCloseGallery()
  }

  handleCloseShift() {
    this.setState({openShift: false})
  }

  submitShift() {
    let data = {
      old_date: this.state.initialStartDate,
      new_date: this.state.newStartDate
    }
    this.props.shiftAllInjects(this.props.id, data)
    this.handleCloseShift()
  }

  render() {
    const deleteActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseDelete.bind(this)}/>,
      <FlatButton label="Delete" primary={true} onTouchTap={this.submitDelete.bind(this)}/>,
    ]
    const shiftActions = [
      <FlatButton label="No" primary={true} onTouchTap={this.handleCloseShift.bind(this)}/>,
      <FlatButton label="Reschedule" primary={true} onTouchTap={this.submitShift.bind(this)}/>,
    ]

    const {exercise} = this.props
    let initPipe = R.pipe(
      R.assoc('exercise_start_date', dateFormat(R.path(['exercise', 'exercise_start_date'], this.props))),
      R.assoc('exercise_end_date', dateFormat(R.path(['exercise', 'exercise_end_date'], this.props))),
      R.assoc('exercise_animation_group', R.path(['exercise', 'exercise_animation_group', 'group_id'], this.props)),
      R.pick([
        'exercise_name',
        'exercise_description',
        'exercise_subtitle',
        'exercise_start_date',
        'exercise_end_date',
        'exercise_message_header',
        'exercise_message_footer',
        'exercise_animation_group'])
    )

    const informationValues = exercise !== undefined ? initPipe(exercise) : undefined
    const image = R.pathOr(null, ['exercise_image', 'file_url'], exercise)

    return (
      <div>
        <Paper type={Constants.PAPER_TYPE_SETTINGS} zDepth={2}>
          <div style={styles.PaperContent}>
            <h2>Information</h2>
            <ExerciseForm ref="informationForm" onSubmit={this.onUpdate.bind(this)} initialValues={informationValues}/>
            <br />
            <Button type="submit" label="Update" onClick={this.submitInformation.bind(this)}/>
          </div>
          <Dialog title="Shift injects" modal={false} open={this.state.openShift}
                  onRequestClose={this.handleCloseShift.bind(this)}
                  actions={shiftActions}>
            <T>You changed the start date of the exercise, do you want to reschedule all injects relatively to the
              difference with the original start date?</T>
          </Dialog>
        </Paper>
        <Paper type={Constants.PAPER_TYPE_SETTINGS} zDepth={2}>
          <div style={styles.PaperContent}>
            <h2><T>Messages template</T></h2>
            <TemplateForm ref="templateForm" onSubmit={this.onUpdate.bind(this)} initialValues={informationValues}
                          groups={this.props.groups}/>
            <br />
            <Button type="submit" label="Update" onClick={this.submitTemplate.bind(this)}/>
          </div>
        </Paper>
        <Paper type={Constants.PAPER_TYPE_SETTINGS} zDepth={2}>
          <div style={styles.PaperContent}>
            <h2>Image</h2>
            <br />
            {image ? <img src={image} alt="Exercise logo" style={styles.image}/> : ""}
            <br /><br />
            <Button label='Change the image' onClick={this.handleOpenGallery.bind(this)}/>
            <Dialog modal={false} open={this.state.openGallery} onRequestClose={this.handleCloseGallery.bind(this)}>
              <FileGallery fileSelector={this.handleImageSelection.bind(this)}/>
            </Dialog>
          </div>
        </Paper>
        <Paper type={Constants.PAPER_TYPE_SETTINGS} zDepth={2}>
          <div style={styles.PaperContent}>
            <h2><T>Delete</T></h2>
            <p><T>Deleting an exercise will result in deleting all its content, including objectives, events, incidents,
              injects and audience. We do not recommend you do this.</T></p>
            <Button label="Delete" onClick={this.handleOpenDelete.bind(this)}/>
            <Dialog title="Confirmation" modal={false} open={this.state.openDelete}
                    onRequestClose={this.handleCloseDelete.bind(this)}
                    actions={deleteActions}>
              <T>Do you want to delete this exercise?</T>
            </Dialog>
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
  params: PropTypes.object,
  updateExercise: PropTypes.func,
  redirectToHome: PropTypes.func,
  deleteExercise: PropTypes.func,
  shiftAllInjects: PropTypes.func,
  fetchGroups: PropTypes.func,
  groups: PropTypes.array
}

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  let exercise = R.prop(exerciseId, state.referential.entities.exercises)
  return {
    id: exerciseId,
    exercise: exercise,
    groups: R.values(state.referential.entities.groups),
    initialStartDate: dateToISO(R.propOr('1970-01-01 08:00:00', 'exercise_start_date', exercise))
  }
}

export default connect(select, {updateExercise, redirectToHome, deleteExercise, fetchGroups, shiftAllInjects})(Index)
