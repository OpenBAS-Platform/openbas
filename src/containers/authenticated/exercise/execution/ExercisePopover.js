import React, {PropTypes, Component} from 'react'
import {connect} from 'react-redux'
import R from 'ramda'
import {T} from '../../../../components/I18n'
import {i18nRegister} from '../../../../utils/Messages'
import * as Constants from '../../../../constants/ComponentTypes'
import {Popover} from '../../../../components/Popover'
import {Menu} from '../../../../components/Menu'
import {Dialog} from '../../../../components/Dialog'
import {IconButton, FlatButton} from '../../../../components/Button'
import {Icon} from '../../../../components/Icon'
import {MenuItemButton, MenuItemLink} from "../../../../components/menu/MenuItem"
import {updateExercise} from '../../../../actions/Exercise'
import {addDryrun} from '../../../../actions/Dryrun'
import {redirectToDryrun} from '../../../../actions/Application'
import DryrunForm from '../check/DryrunForm'

const style = {
  float: 'left',
  marginTop: '-14px'
}

i18nRegister({
  fr: {
    'Do you want to disable this exercise?': 'Souhaitez-vous désactiver cet exercice ?',
    'Do you want to enable this exercise?': 'Souhaitez-vous activer cet exercice ?',
    'Disable': 'Désactiver',
    'Enable': 'Activer',
    'Launch a dryrun': 'Lancer une simulation'
  }
})

class ExercisePopover extends Component {
  constructor(props) {
    super(props)
    this.state = {openDisable: false, openEnable: false, openDryrun: false, openPopover: false}
  }

  handlePopoverOpen(event) {
    event.stopPropagation()
    this.setState({openPopover: true, anchorEl: event.currentTarget})
  }

  handlePopoverClose() {
    this.setState({openPopover: false})
  }

  handleOpenDisable() {
    this.setState({openDisable: true})
    this.handlePopoverClose()
  }

  handleCloseDisable() {
    this.setState({openDisable: false})
  }

  submitDisable() {
    this.props.updateExercise(this.props.exerciseId, {'exercise_canceled': true})
    this.handleCloseDisable()
  }

  handleOpenEnable() {
    this.setState({openEnable: true})
    this.handlePopoverClose()
  }

  handleCloseEnable() {
    this.setState({openEnable: false})
  }

  submitEnable() {
    this.props.updateExercise(this.props.exerciseId, {'exercise_canceled': false})
    this.handleCloseEnable()
  }

  handleOpenDryrun() {
    this.setState({openDryrun: true})
    this.handlePopoverClose()
  }

  handleCloseDryrun() {
    this.setState({openDryrun: false})
  }

  onSubmitDryrun(data) {
    return this.props.addDryrun(this.props.exerciseId, data).then((payload) => {
      this.props.redirectToDryrun(this.props.exerciseId, payload.result)
    })
  }

  submitFormDryrun() {
    this.refs.dryrunForm.submit()
  }

  render() {
    let exercise_disabled = R.propOr(false, 'exercise_canceled', this.props.exercise)

    const disableActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseDisable.bind(this)}/>,
      <FlatButton label="Disable" primary={true} onTouchTap={this.submitDisable.bind(this)}/>,
    ]
    const enableActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseEnable.bind(this)}/>,
      <FlatButton label="Enable" primary={true} onTouchTap={this.submitEnable.bind(this)}/>,
    ]
    const dryrunActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseDryrun.bind(this)}/>,
      <FlatButton label="Launch" primary={true} onTouchTap={this.submitFormDryrun.bind(this)}/>,
    ]

    return (
      <div style={style}>
        <IconButton onClick={this.handlePopoverOpen.bind(this)}>
          <Icon name={Constants.ICON_NAME_NAVIGATION_MORE_VERT}/>
        </IconButton>
        <Popover open={this.state.openPopover} anchorEl={this.state.anchorEl}
                 onRequestClose={this.handlePopoverClose.bind(this)}>
          <Menu multiple={false}>
              <MenuItemLink label="Launch a dryrun" onTouchTap={this.handleOpenDryrun.bind(this)}/>
            {exercise_disabled ?
              <MenuItemButton label="Enable" onTouchTap={this.handleOpenEnable.bind(this)}/> :
              <MenuItemButton label="Disable" onTouchTap={this.handleOpenDisable.bind(this)}/>}
          </Menu>
        </Popover>
        <Dialog title="Confirmation" modal={false}
                open={this.state.openDisable}
                onRequestClose={this.handleCloseDisable.bind(this)}
                actions={disableActions}>
          <T>Do you want to disable this exercise?</T>
        </Dialog>
        <Dialog title="Confirmation" modal={false}
                open={this.state.openEnable}
                onRequestClose={this.handleCloseEnable.bind(this)}
                actions={enableActions}>
          <T>Do you want to enable this exercise?</T>
        </Dialog>
        <Dialog
          title="Launch a dryrun"
          modal={false}
          open={this.state.openDryrun}
          onRequestClose={this.handleCloseDryrun.bind(this)}
          actions={dryrunActions}>
          <DryrunForm ref="dryrunForm" onSubmit={this.onSubmitDryrun.bind(this)}/>
        </Dialog>
      </div>
    )
  }
}

ExercisePopover.propTypes = {
  exerciseId: PropTypes.string,
  updateExercise: PropTypes.func,
  exercise: PropTypes.object,
  addDryrun: PropTypes.func,
  redirectToDryrun: PropTypes.func
}

export default connect(null, {updateExercise, addDryrun, redirectToDryrun})(ExercisePopover)