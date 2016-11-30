import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {updateExercise, deleteExercise} from '../../../../actions/Exercise'
import {fetchExerciseStatuses} from '../../../../actions/Exercise'
import {redirectToHome} from '../../../../actions/Application'
import {Paper} from '../../../../components/Paper'
import {Button, FlatButton} from '../../../../components/Button'
import {T} from '../../../../components/I18n'
import {i18nRegister} from '../../../../utils/Messages'
import {Dialog} from '../../../../components/Dialog'
import * as Constants from '../../../../constants/ComponentTypes'
import R from 'ramda'
import ExerciseForm from '../ExerciseForm'
import StatusForm from './StatusForm'
import FileGallery from '../../FileGallery'
import moment from 'moment'

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
    'State': 'Etat',
    'Status': 'Choisir un état',
    'Subtitle': 'Sous titre'
  }
})

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDelete: false,
      openGallery: false
    }
  }

  componentDidMount() {
    this.props.fetchExerciseStatuses();
  }

  onUpdate(data) {
    this.props.updateExercise(this.props.id, data)
  }

  submitInformation() {
    this.refs.informationForm.submit()
  }

  submitStatus() {
    this.refs.statusForm.submit()
  }

  handleOpenDelete() {
    this.setState({
      openDelete: true
    })
  }

  handleCloseDelete() {
    this.setState({
      openDelete: false
    })
  }

  handleOpenGallery() {
    this.setState({
      openGallery: true
    })
  }

  handleCloseGallery() {
    this.setState({
      openGallery: false
    })
  }

  submitDelete() {
    return this.props.deleteExercise(this.props.id).then(() => this.props.redirectToHome())
  }

  handleImageSelection(file) {
    let data = {"exercise_image": file.get('file_id')}
    this.props.updateExercise(this.props.id, data)
    this.handleCloseGallery()
  }

  dateFormat(data) {
    return moment(data).format('YYYY-MM-DD HH:mm:ss')
  }

  render() {
    const deleteActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseDelete.bind(this)}/>,
      <FlatButton label="Delete" primary={true} onTouchTap={this.submitDelete.bind(this)}/>,
    ]

    const {exercise} = this.props
    var initPipe = R.pipe(
      R.assoc('exercise_start_date', this.dateFormat(R.path(['exercise', 'exercise_start_date'], this.props))),
      R.assoc('exercise_end_date', this.dateFormat(R.path(['exercise', 'exercise_end_date'], this.props))),
      R.pick(['exercise_name', 'exercise_description', 'exercise_subtitle', 'exercise_start_date', 'exercise_end_date'])
    )
    const informationValues = exercise !== undefined ? initPipe(exercise) : undefined
    const initialStatus = exercise !== undefined ? {exercise_status: exercise.exercise_status} : undefined
    const image = exercise !== undefined ? exercise.exercise_image.file_url : undefined

    return (
      <div>
        <Paper type={Constants.PAPER_TYPE_SETTINGS} zDepth={2}>
          <div style={styles.PaperContent}>
            <h2>Information</h2>
            <ExerciseForm ref="informationForm" onSubmit={this.onUpdate.bind(this)} initialValues={informationValues}/>
            <br />
            <Button type="submit" label="Update" onClick={this.submitInformation.bind(this)}/>
          </div>
        </Paper>
        <Paper type={Constants.PAPER_TYPE_SETTINGS} zDepth={2}>
          <div style={styles.PaperContent}>
            <h2><T>State</T></h2>
            <StatusForm ref="statusForm" onSubmit={this.onUpdate.bind(this)}
                        status={this.props.exercise_statuses} initialValues={initialStatus}/>
            <Button type="submit" label="Update" onClick={this.submitStatus.bind(this)}/>
          </div>
        </Paper>
        <Paper type={Constants.PAPER_TYPE_SETTINGS} zDepth={2}>
          <div style={styles.PaperContent}>
            <h2>Image</h2>
            <br />
            <img src={image} alt="Exercise logo" style={styles.image}/>
            <br /><br />
            <Button label='Change the image' onClick={this.handleOpenGallery.bind(this)}/>
            <Dialog modal={false} open={this.state.openGallery} onRequestClose={this.handleCloseGallery.bind(this)}>
              <FileGallery imageSelector={this.handleImageSelection.bind(this)}/>
            </Dialog>
          </div>
        </Paper>
        <Paper type={Constants.PAPER_TYPE_SETTINGS} zDepth={2}>
          <div style={styles.PaperContent}>
            <h2><T>Delete</T></h2>
            <p>Deleting an exercise will result in deleting all the content of the exercise, including objectives,
              events, incidents, injects and audience groups. We do not recommend
              you do this.</p>
            <Button label="Delete" onClick={this.handleOpenDelete.bind(this)}/>
            <Dialog title="Confirmation" modal={false} open={this.state.openDelete}
                    onRequestClose={this.handleCloseDelete.bind(this)}
                    actions={deleteActions}>
              Do you confirm the deletion of this exercise?
            </Dialog>
          </div>
        </Paper>
      </div>
    );
  }
}

Index.propTypes = {
  id: PropTypes.string,
  exercise: PropTypes.object,
  exercise_statuses: PropTypes.object,
  params: PropTypes.object,
  updateExercise: PropTypes.func,
  redirectToHome: PropTypes.func,
  deleteExercise: PropTypes.func,
  fetchExerciseStatuses: PropTypes.func
}

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  return {
    id: exerciseId,
    exercise: R.prop(exerciseId, state.referential.entities.exercises),
    exercise_statuses: state.referential.entities.exercise_statuses
  }
}

export default connect(select, {updateExercise, redirectToHome, deleteExercise, fetchExerciseStatuses})(Index)
