import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import {i18nRegister} from '../../../../utils/Messages'
import {T} from '../../../../components/I18n'
import * as Constants from '../../../../constants/ComponentTypes'
import {Popover} from '../../../../components/Popover';
import {Menu} from '../../../../components/Menu'
import {Dialog} from '../../../../components/Dialog'
import {IconButton, FlatButton} from '../../../../components/Button'
import {Icon} from '../../../../components/Icon'
import {MenuItemLink} from "../../../../components/menu/MenuItem"
import {addComcheck} from '../../../../actions/Comcheck'
import ComcheckForm from './ComcheckForm'

const style = {
  float: 'left',
  marginTop: '-16px'
}

i18nRegister({
  fr: {
    'Launch a comcheck': 'Lancer un comcheck'
  }
})

class DryrunsPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openLaunch: false,
      openPopover: false
    }
  }

  handlePopoverOpen(event) {
    event.preventDefault()
    this.setState({
      openPopover: true,
      anchorEl: event.currentTarget,
    })
  }

  handlePopoverClose() {
    this.setState({openPopover: false})
  }

  handleOpenLaunch() {
    this.setState({openLaunch: true})
    this.handlePopoverClose()
  }

  handleCloseLaunch() {
    this.setState({openLaunch: false})
  }

  onSubmitLaunch(data) {
    return this.props.addComcheck(this.props.exerciseId, data)
  }

  submitFormLaunch() {
    this.refs.comcheckForm.submit()
  }

  render() {
    const initialComcheckValues = {
      comcheck_subject: <T>Communication check</T>,
      comcheck_message: <T>Hello</T> + ',<br /><br />' +
      <T>This is a communication check before the beginning of the exercise. Please
        click on the following link in order to confirm you successfully received this message:</T>,
      comcheck_footer: <T>Best regards</T> + ',<br />' + <T>The exercise control Team</T>
    }

    const launchActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseLaunch.bind(this)}/>,
      <FlatButton label="Launch" primary={true} onTouchTap={this.submitFormLaunch.bind(this)}/>,
    ]

    return (
      <div style={style}>
        <IconButton onClick={this.handlePopoverOpen.bind(this)}>
          <Icon name={Constants.ICON_NAME_NAVIGATION_MORE_VERT}/>
        </IconButton>
        <Popover open={this.state.openPopover} anchorEl={this.state.anchorEl}
                 onRequestClose={this.handlePopoverClose.bind(this)}>
          <Menu multiple={false}>
            <MenuItemLink label="Launch a comcheck" onTouchTap={this.handleOpenLaunch.bind(this)}/>
          </Menu>
        </Popover>
        <Dialog
          title="Launch a comcheck"
          modal={false}
          open={this.state.openLaunch}
          onRequestClose={this.handleCloseLaunch.bind(this)}
          actions={launchActions}
        >
          <ComcheckForm initialValues={initialComcheckValues} ref="comcheckForm" audiences={this.props.audiences}
                        onSubmit={this.onSubmitLaunch.bind(this)} onSubmitSuccess={this.handleCloseLaunch.bind(this)}/>
        </Dialog>
      </div>
    )
  }
}

DryrunsPopover.propTypes = {
  exerciseId: PropTypes.string,
  audiences: PropTypes.array,
  addComcheck: PropTypes.func,
}

export default connect(null, {addComcheck})(DryrunsPopover)
