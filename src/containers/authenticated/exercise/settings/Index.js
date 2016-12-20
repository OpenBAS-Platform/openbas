import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {updateExercise, deleteExercise} from '../../../../actions/Exercise'
import {redirectToHome} from '../../../../actions/Application'
import {Paper} from '../../../../components/Paper'
import {Button, FlatButton} from '../../../../components/Button'
import {T} from '../../../../components/I18n'
import {i18nRegister} from '../../../../utils/Messages'
import {Dialog} from '../../../../components/Dialog'
import * as Constants from '../../../../constants/ComponentTypes'
import R from 'ramda'
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
    'Do you want to delete this exercise?': 'Souhaitez-vous supprimer cet exercice ?',
    'Deleting an exercise will result in deleting all its content, including objectives, events, incidents, injects and audience. We do not recommend you do this.': 'Supprimer un exercice conduit à la suppression de son contenu, incluant ses objectifs, événéments, incidents, injects et audiences. Nous vous déconseillons de faire cela.'
  }
})

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {openDelete: false, openGallery: false}
  }

  onUpdate(data) {
    var tzData = R.pipe( //Need to convert date to ISO format with timezone
      R.assoc('exercise_start_date', dateToISO(data.exercise_start_date)),
      R.assoc('exercise_end_date', dateToISO(data.exercise_end_date))
    )
    return this.props.updateExercise(this.props.id, tzData(data))
  }

  submitInformation() {
    this.refs.informationForm.submit()
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

  render() {
    const deleteActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseDelete.bind(this)}/>,
      <FlatButton label="Delete" primary={true} onTouchTap={this.submitDelete.bind(this)}/>,
    ]

    const {exercise} = this.props
    var initPipe = R.pipe(
      R.assoc('exercise_start_date', dateFormat(R.path(['exercise', 'exercise_start_date'], this.props))),
      R.assoc('exercise_end_date', dateFormat(R.path(['exercise', 'exercise_end_date'], this.props))),
      R.pick(['exercise_name', 'exercise_description', 'exercise_subtitle', 'exercise_start_date', 'exercise_end_date'])
    )
    const informationValues = exercise !== undefined ? initPipe(exercise) : undefined
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
            <p><T>Deleting an exercise will result in deleting all its content, including objectives, events, incidents, injects and audience. We do not recommend you do this.</T></p>
            <Button label="Delete" onClick={this.handleOpenDelete.bind(this)}/>
            <Dialog title="Confirmation" modal={false} open={this.state.openDelete}
                    onRequestClose={this.handleCloseDelete.bind(this)}
                    actions={deleteActions}>
              <T>Do you want to delete this exercise?</T>
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
}

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  return {
    id: exerciseId,
    exercise: R.prop(exerciseId, state.referential.entities.exercises),
  }
}

export default connect(select, {updateExercise, redirectToHome, deleteExercise})(Index)
