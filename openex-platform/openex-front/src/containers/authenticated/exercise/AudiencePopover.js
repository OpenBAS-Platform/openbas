import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import * as R from 'ramda'
import {T} from '../../../components/I18n'
import {i18nRegister} from '../../../utils/Messages'
import * as Constants from '../../../constants/ComponentTypes'
import {Popover} from '../../../components/Popover'
import {Menu} from '../../../components/Menu'
import {Dialog} from '../../../components/Dialog'
import {IconButton, FlatButton} from '../../../components/Button'
import {Icon} from '../../../components/Icon'
import {MenuItemButton} from '../../../components/menu/MenuItem'
import {updateAudience} from '../../../actions/Audience'

const style = {
  position: 'absolute',
  top: '7px',
  right: 0,
}

i18nRegister({
  fr: {
    'Do you want to disable this audience?': 'Souhaitez-vous désactiver cette audience ?',
    'Do you want to enable this audience?': 'Souhaitez-vous activer cette audience ?',
    'Disable': 'Désactiver',
    'Enable': 'Activer'
  }
})

class AudiencePopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openEnable: false,
      openDisable: false,
      openPopover: false
    }
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
    this.props.updateAudience(this.props.exerciseId, this.props.audience.audience_id, {'audience_enabled': false})
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
    this.props.updateAudience(this.props.exerciseId, this.props.audience.audience_id, {'audience_enabled': true})
    this.handleCloseEnable()
  }

  render() {
    let audience_enabled = R.propOr(true, 'audience_enabled', this.props.audience)
    let audience_is_updatable= R.propOr(true, 'user_can_update', this.props.audience)

    const disableActions = [
      <FlatButton label="Cancel" primary={true} onClick={this.handleCloseDisable.bind(this)}/>,
      audience_is_updatable ? <FlatButton label="Disable" primary={true} onClick={this.submitDisable.bind(this)}/>: ""
    ]
    const enableActions = [
      <FlatButton label="Cancel" primary={true} onClick={this.handleCloseEnable.bind(this)}/>,
      audience_is_updatable ? <FlatButton label="Enable" primary={true} onClick={this.submitEnable.bind(this)}/>: ""
    ]

    return (
      <div style={style}>
        <IconButton onClick={this.handlePopoverOpen.bind(this)} type={Constants.BUTTON_TYPE_MAINLIST2}>
          <Icon name={Constants.ICON_NAME_NAVIGATION_MORE_VERT}/>
        </IconButton>
        <Popover open={this.state.openPopover} anchorEl={this.state.anchorEl}
                 onRequestClose={this.handlePopoverClose.bind(this)}>
         {audience_is_updatable ?
            <Menu multiple={false}>
              {audience_is_updatable ?
                audience_enabled ?
                    <MenuItemButton label="Disable" onClick={this.handleOpenDisable.bind(this)}/> :
                    <MenuItemButton label="Enable" onClick={this.handleOpenEnable.bind(this)}/>
              : ""}
            </Menu>
          : ""}
        </Popover>
        <Dialog title="Confirmation" modal={false}
                open={this.state.openDisable}
                onRequestClose={this.handleCloseDisable.bind(this)}
                actions={disableActions}>
          <T>Do you want to disable this audience?</T>
        </Dialog>
        <Dialog title="Confirmation" modal={false}
                open={this.state.openEnable}
                onRequestClose={this.handleCloseEnable.bind(this)}
                actions={enableActions}>
          <T>Do you want to enable this audience?</T>
        </Dialog>
      </div>
    )
  }
}

AudiencePopover.propTypes = {
  exerciseId: PropTypes.string,
  audience: PropTypes.object,
  updateAudience: PropTypes.func
}

export default connect(null, {updateAudience})(AudiencePopover)
