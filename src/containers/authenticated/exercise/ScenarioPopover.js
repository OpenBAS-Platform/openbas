import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import * as R from 'ramda'
import {timeDiff} from '../../../utils/Time'
import {i18nRegister} from '../../../utils/Messages'
import * as Constants from '../../../constants/ComponentTypes'
import {Dialog} from '../../../components/Dialog'
import {Popover} from '../../../components/Popover'
import {Menu} from '../../../components/Menu'
import {IconButton, FlatButton} from '../../../components/Button'
import {Icon} from '../../../components/Icon'
import {MenuItemLink} from "../../../components/menu/MenuItem"
import {downloadExportInjects, shiftAllInjects} from '../../../actions/Inject'
import ShiftForm from './ShiftForm'

const style = {
  float: 'left',
  marginTop: '-14px'
}

i18nRegister({
  fr: {
    'Export injects to XLS': 'Export des injections en XLS',
    'Shift': 'Décaler',
    'Shift all injects': 'Décaler toutes les injections'
  }
})

class ScenarioPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {openPopover: false, openShift: false}
  }

  handlePopoverOpen(event) {
    event.stopPropagation()
    this.setState({openPopover: true, anchorEl: event.currentTarget})
  }

  handlePopoverClose() {
    this.setState({openPopover: false})
  }

  handleDownloadInjects() {
    this.props.downloadExportInjects(this.props.exerciseId)
    this.handlePopoverClose()
  }

  handleOpenShift() {
    this.setState({openShift: true})
    this.handlePopoverClose()
  }

  handleCloseShift() {
    this.setState({openShift: false})
  }

  onSubmitShift(data) {
    let firstInjectDate = R.pipe(
      R.values,
      R.sort((a, b) => timeDiff(a.inject_date, b.inject_date)),
      R.head,
      R.prop('inject_date')
    )(this.props.injects)
    data.old_date = firstInjectDate
    return this.props.shiftAllInjects(this.props.exerciseId, data)
  }

  submitFormShift() {
    this.refs.shiftForm.submit()
  }

  render() {
    const shiftActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseShift.bind(this)}/>,
      <FlatButton label="Shift" primary={true} onTouchTap={this.submitFormShift.bind(this)}/>,
    ]

    return (
      <div style={style}>
        <IconButton onClick={this.handlePopoverOpen.bind(this)}>
          <Icon name={Constants.ICON_NAME_NAVIGATION_MORE_VERT}/>
        </IconButton>
        <Popover open={this.state.openPopover} anchorEl={this.state.anchorEl}
                 onRequestClose={this.handlePopoverClose.bind(this)}>
          <Menu multiple={false}>
            <MenuItemLink label="Export injects to XLS" onTouchTap={this.handleDownloadInjects.bind(this)}/>
            <MenuItemLink label="Shift all injects" onTouchTap={this.handleOpenShift.bind(this)}/>
          </Menu>
        </Popover>
        <Dialog
          title="Shift all injects"
          modal={false}
          open={this.state.openShift}
          onRequestClose={this.handleCloseShift.bind(this)}
          actions={shiftActions}>
          <ShiftForm ref="shiftForm" onSubmitSuccess={this.handleCloseShift.bind(this)} onSubmit={this.onSubmitShift.bind(this)}/>
        </Dialog>
      </div>
    )
  }
}

ScenarioPopover.propTypes = {
  exerciseId: PropTypes.string,
  downloadExportInjects: PropTypes.func,
  shiftAllInjects: PropTypes.func,
  injects: PropTypes.object
}

export default connect(null, {downloadExportInjects, shiftAllInjects})(ScenarioPopover)
