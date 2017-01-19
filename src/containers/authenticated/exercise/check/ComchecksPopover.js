import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import {i18nRegister} from '../../../../utils/Messages'
import * as Constants from '../../../../constants/ComponentTypes'
import {Popover} from '../../../../components/Popover'
import {Menu} from '../../../../components/Menu'
import {Dialog} from '../../../../components/Dialog'
import {IconButton, FlatButton} from '../../../../components/Button'
import {Icon} from '../../../../components/Icon'
import {MenuItemLink} from "../../../../components/menu/MenuItem"
import {addComcheck} from '../../../../actions/Comcheck'
import {redirectToComcheck} from '../../../../actions/Application'
import ComcheckForm from './ComcheckForm'
import {injectIntl} from 'react-intl'

const style = {
  float: 'left',
  marginTop: '-14px'
}

i18nRegister({
  fr: {
    'Launch a comcheck': 'Lancer un test de communication'
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
    return this.props.addComcheck(this.props.exerciseId, data).then((payload) => {
      this.props.redirectToComcheck(this.props.exerciseId, payload.result)
    })
  }

  submitFormLaunch() {
    this.refs.comcheckForm.submit()
  }

  t(id) {
    return this.props.intl.formatMessage({id})
  }

  render() {
    const initialComcheckValues = {
      comcheck_subject: this.t("Communication check"),
      comcheck_message: this.t("Hello") + ',<br /><br />' + this.t("This is a communication check before the beginning of the exercise. Please click on the following link in order to confirm you successfully received this message:"),
      comcheck_footer: this.t("Best regards") + ',<br />' + this.t("The exercise control Team")
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
          autoScrollBodyContent={true}
          actions={launchActions}>
          <ComcheckForm initialValues={initialComcheckValues} ref="comcheckForm" audiences={this.props.audiences}
                        onSubmit={this.onSubmitLaunch.bind(this)}/>
        </Dialog>
      </div>
    )
  }
}

DryrunsPopover.propTypes = {
  exerciseId: PropTypes.string,
  audiences: PropTypes.array,
  addComcheck: PropTypes.func,
  redirectToComcheck: PropTypes.func,
  intl: PropTypes.object
}

export default connect(null, {addComcheck, redirectToComcheck})(injectIntl(DryrunsPopover))
