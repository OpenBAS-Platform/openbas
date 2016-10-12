import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {updateExercise, deleteExercise} from '../../../../actions/Exercise'
import {upload} from '../../../../actions/File'
import {Paper} from '../../../../components/Paper'
import {Button, FlatButton} from '../../../../components/Button'
import {Dialog} from '../../../../components/Dialog'
import {MenuItemLink} from '../../../../components/menu/MenuItem'
import * as Constants from '../../../../constants/ComponentTypes'
import ExerciseForm from '../ExerciseForm'
import StatusForm from './StatusForm'
import FileGallery from '../../FileGallery'
import moment from 'moment'

const styles = {
  PaperContent: {
    padding: '20px'
  }
}

const statusesNames = {
  SCHEDULED: 'Scheduled',
  RUNNING: 'Running',
  FINISHED: 'Finished'
}

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDelete: false,
      openGallery: false
    }
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
    this.props.deleteExercise(this.props.id)
    this.handleCloseDelete()
  }

  handleFileChange() {
    var data = new FormData();
    data.append('file', this.refs.fileUpload.files[0])
    this.props.upload(data)
  }

  openFileDialog() {
    this.refs.fileUpload.click()
  }

  render() {
    const deleteActions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleCloseDelete.bind(this)}
      />,
      <FlatButton
        label="Delete"
        primary={true}
        onTouchTap={this.submitDelete.bind(this)}
      />,
    ];

    let initialInformation = undefined
    let initialStatus = undefined
    let image = undefined

    if (this.props.exercise) {
      initialInformation = {
        exercise_name: this.props.exercise.get('exercise_name'),
        exercise_subtitle: this.props.exercise.get('exercise_subtitle'),
        exercise_description: this.props.exercise.get('exercise_description'),
        exercise_start_date: moment(this.props.exercise.get('exercise_start_date')).format('YYYY-MM-DD HH:mm:ss'),
        exercise_end_date: moment(this.props.exercise.get('exercise_end_date')).format('YYYY-MM-DD HH:mm:ss')
      }
      initialStatus = {
        exercise_status: this.props.exercise.get('exercise_status').get('status_id')
      }
      image = this.props.exercise.get('exercise_image').get('file_url')
    }

    return (
      <div>
        <Paper type={Constants.PAPER_TYPE_SETTINGS} zDepth={2}>
          <div style={styles.PaperContent}>
            <h2>Information</h2>
            <ExerciseForm
              ref="informationForm"
              onSubmit={this.onUpdate.bind(this)}
              initialValues={initialInformation }
            />
            <br />
            <Button type="submit" label="Update" onClick={this.submitInformation.bind(this)}/>
          </div>
        </Paper>
        <Paper type={Constants.PAPER_TYPE_SETTINGS} zDepth={2}>
          <div style={styles.PaperContent}>
            <h2>State</h2>
            <StatusForm
              ref="statusForm"
              onSubmit={this.onUpdate.bind(this)}
              items={this.props.exercise_statuses.toList().map(status => {
                return (
                  <MenuItemLink key={status.get('status_id')} value={status.get('status_id')}
                                label={statusesNames[status.get('status_name')]}/>
                )
              })}
              initialValues={initialStatus}
            />
            <Button type="submit" label="Update" onClick={this.submitStatus.bind(this)}/>
          </div>
        </Paper>
        <Paper type={Constants.PAPER_TYPE_SETTINGS} zDepth={2}>
          <div style={styles.PaperContent}>
            <h2>Image</h2>
            <br />
            <img src={image} alt="Exercise logo"/>
            <br /><br />
            <Button
              label='Change the image'
              onClick={this.handleOpenGallery.bind(this)}
            />
            <Dialog
              modal={false}
              open={this.state.openGallery}
              onRequestClose={this.handleCloseGallery.bind(this)}
            >
              <FileGallery />
            </Dialog>
          </div>
        </Paper>
        <Paper type={Constants.PAPER_TYPE_SETTINGS} zDepth={2}>
          <div style={styles.PaperContent}>
            <h2>Delete</h2>
            <p>Deleting an exercise will result in deleting all the content of the exercise, including objectives,
              events, incidents, injects and audience groups. We do not recommend
              you do this.</p>
            <Button label="Delete" onClick={this.handleOpenDelete.bind(this)}/>
            <Dialog
              title="Confirmation"
              modal={false}
              open={this.state.openDelete}
              onRequestClose={this.handleCloseDelete.bind(this)}
              actions={deleteActions}
            >
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
  deleteExercise: PropTypes.func,
  upload: PropTypes.func
}

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  return {
    loading: state.application.getIn(['ui', 'loading']),
    id: exerciseId,
    exercise: state.application.getIn(['entities', 'exercises', exerciseId]),
    exercise_statuses: state.application.getIn(['entities', 'exercise_statuses'])
  }
}

export default connect(select, {updateExercise, deleteExercise, upload})(Index)
