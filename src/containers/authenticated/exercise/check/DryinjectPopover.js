import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {i18nRegister} from '../../../../utils/Messages'
import * as Constants from '../../../../constants/ComponentTypes'
import {T} from '../../../../components/I18n'
import {MenuItemButton} from '../../../../components/menu/MenuItem'
import {Icon} from '../../../../components/Icon'
import {Popover} from '../../../../components/Popover'
import {Menu} from '../../../../components/Menu'
import {Dialog} from '../../../../components/Dialog'
import {FlatButton, IconButton} from '../../../../components/Button'
import Theme from '../../../../components/Theme'
import {dryinjectDone} from '../../../../actions/Dryinject'

const style = {
  position: 'absolute',
  top: '9px',
  right: 0,
}

i18nRegister({
  fr: {
    'Mark as done': 'Marquer comme fait',
    'Done': 'Fait',
    'Do you want to mark this inject as done?': 'Souhaitez-vous marquer cette injection comme réalisée ?'
  }
})

class DryinjectPopover extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openDone: false,
      openPopover: false
    }
  }

  handlePopoverOpen(event) {
    event.stopPropagation()
    this.setState({openPopover: true, anchorEl: event.currentTarget})
  }

  handlePopoverOpenNo(event) {
    event.stopPropagation()
  }

  handlePopoverClose() {
    this.setState({openPopover: false})
  }

  handleOpenDone() {
    this.setState({openDone: true})
    this.handlePopoverClose()
  }

  handleCloseDone() {
    this.setState({openDone: false})
  }

  submitDone() {
    this.props.dryinjectDone(this.props.dryinject.dryinject_id)
    this.handleCloseDone()
  }

  render() {
    const doneActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseDone.bind(this)}/>,
      <FlatButton label="Done" primary={true} onTouchTap={this.submitDone.bind(this)}/>,
    ]

    return (
      <div style={style}>
        <IconButton onClick={this.props.dryinject.dryinject_type === 'other' ? this.handlePopoverOpen.bind(this) : this.handlePopoverOpenNo.bind(this)}>
          <Icon name={Constants.ICON_NAME_NAVIGATION_MORE_VERT} color={this.props.dryinject.dryinject_type === 'other' ? Theme.palette.textColor : Theme.palette.disabledColor}/>
        </IconButton>
        <Popover open={this.state.openPopover}
                 anchorEl={this.state.anchorEl}
                 onRequestClose={this.handlePopoverClose.bind(this)}>
          <Menu multiple={false}>
            {this.props.dryinject.dryinject_type === 'other' ?
              <MenuItemButton label="Mark as done" onTouchTap={this.handleOpenDone.bind(this)}/> : ''
            }
          </Menu>
        </Popover>
        <Dialog title="Done" modal={false}
                open={this.state.openDone}
                onRequestClose={this.handleCloseDone.bind(this)}
                actions={doneActions}>
          <T>Do you want to mark this inject as done?</T>
        </Dialog>
      </div>
    )
  }
}

DryinjectPopover.propTypes = {
  dryinject: PropTypes.object,
  dryinjectDone: PropTypes.func
}

export default connect(null, {dryinjectDone})(DryinjectPopover)