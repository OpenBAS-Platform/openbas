import React, {PropTypes, Component} from 'react'
import {connect} from 'react-redux'
import R from 'ramda'
import {i18nRegister} from '../../../../utils/Messages'
import Theme from '../../../../components/Theme'
import {T} from '../../../../components/I18n'
import * as Constants from '../../../../constants/ComponentTypes'
import {Popover} from '../../../../components/Popover'
import {Menu} from '../../../../components/Menu'
import {Dialog} from '../../../../components/Dialog'
import {IconButton, FlatButton} from '../../../../components/Button'
import {Icon} from '../../../../components/Icon'
import {MenuItemButton} from "../../../../components/menu/MenuItem"
import {updateInject} from '../../../../actions/Inject'

const style = {
  position: 'absolute',
  top: '8px',
  right: 0,
}

i18nRegister({
  fr: {
    'Enable': 'Activer',
    'Disable': 'Désactiver',
    'Do you want to disable this inject?': 'Souhaitez-vous désactiver cet inject ?',
    'Do you want to enable this inject?': 'Souhaitez-vous activer cet inject ?'
  }
})

class InjectPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDisable: false,
      openEnable: false
    }
  }

  handlePopoverOpen(event) {
    event.preventDefault()
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
    this.props.updateInject(this.props.exerciseId, this.props.eventId, this.props.incidentId, this.props.inject.inject_id, {'inject_enabled': false}, false)
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
    this.props.updateInject(this.props.exerciseId, this.props.eventId, this.props.incidentId, this.props.inject.inject_id, {'inject_enabled': true}, false)
    this.handleCloseEnable()
  }

  switchColor(disabled) {
    if (disabled) {
      return Theme.palette.disabledColor
    } else {
      return Theme.palette.textColor
    }
  }

  render() {
    let inject_enabled = R.propOr(true, 'inject_enabled', this.props.inject)
    let exercise_canceled = R.propOr(false, 'exercise_canceled', this.props.exercise)

    const disableActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseDisable.bind(this)}/>,
      <FlatButton label="Disable" primary={true} onTouchTap={this.submitDisable.bind(this)}/>,
    ]
    const enableActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseEnable.bind(this)}/>,
      <FlatButton label="Enable" primary={true} onTouchTap={this.submitEnable.bind(this)}/>,
    ]

    return (
      <div style={style}>
        <IconButton onClick={this.handlePopoverOpen.bind(this)}>
          <Icon name={Constants.ICON_NAME_NAVIGATION_MORE_VERT} color={this.switchColor(!inject_enabled || exercise_canceled)}/>
        </IconButton>
        <Popover open={this.state.openPopover}
                 anchorEl={this.state.anchorEl}
                 onRequestClose={this.handlePopoverClose.bind(this)}>
          <Menu multiple={false}>
            {inject_enabled ?
              <MenuItemButton label="Disable" onTouchTap={this.handleOpenDisable.bind(this)}/> :
              <MenuItemButton label="Enable" onTouchTap={this.handleOpenEnable.bind(this)}/>}
          </Menu>
        </Popover>
        <Dialog title="Confirmation" modal={false}
                open={this.state.openDisable}
                onRequestClose={this.handleCloseDisable.bind(this)}
                actions={disableActions}>
          <T>Do you want to disable this inject?</T>
        </Dialog>
        <Dialog title="Confirmation" modal={false}
                open={this.state.openEnable}
                onRequestClose={this.handleCloseEnable.bind(this)}
                actions={enableActions}>
          <T>Do you want to enable this inject?</T>
        </Dialog>
      </div>
    )
  }
}

InjectPopover.propTypes = {
  exerciseId: PropTypes.string,
  exercise: PropTypes.object,
  eventId: PropTypes.string,
  incidentId: PropTypes.string,
  inject: PropTypes.object,
  updateInject: PropTypes.func,
}

export default connect(null, {updateInject})(InjectPopover)