import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {T} from '../../../../../components/I18n'
import {i18nRegister} from '../../../../../utils/Messages'
import {redirectToAudiences, redirectToComcheck} from '../../../../../actions/Application'
import * as Constants from '../../../../../constants/ComponentTypes'
import R from 'ramda'
import {Popover} from '../../../../../components/Popover'
import {Menu} from '../../../../../components/Menu'
import {Dialog} from '../../../../../components/Dialog'
import {IconButton, FlatButton} from '../../../../../components/Button'
import {Icon} from '../../../../../components/Icon'
import {MenuItemLink, MenuItemButton} from "../../../../../components/menu/MenuItem"
import {addComcheck} from '../../../../../actions/Comcheck'
import {updateAudience, selectAudience, downloadExportAudience, deleteAudience} from '../../../../../actions/Audience'
import AudienceForm from './AudienceForm'
import ComcheckForm from '../../check/ComcheckForm'
import {injectIntl} from 'react-intl'

const style = {
  margin: '8px -30px 0 0'
}

i18nRegister({
  fr: {
    'Update the audience': 'Modifier l\'audience',
    'Do you want to delete this audience?': 'Souhaitez-vous supprimer cette audience ?',
    'Launch a comcheck': 'Lancer un test de communication',
    'Communication check': 'Test de communication',
    'Hello': 'Bonjour',
    'This is a communication check before the beginning of the exercise. Please click on the following link in order to confirm you successfully received this message:': 'Ceci est un test de communication avant le début de l\'exercice. Merci de cliquer sur le lien ci-dessous afin de confirmer que vous avez bien reçu ce message :',
    'Best regards': 'Cordialement',
    'The exercise control Team': 'La direction de l\'animation',
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
      openDelete: false,
      openEdit: false,
      openComcheck: false,
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

  handleOpenComcheck() {
    this.setState({openComcheck: true})
    this.handlePopoverClose()
  }

  handleCloseComcheck() {
    this.setState({openComcheck: false})
  }

  onSubmitComcheck(data) {
    return this.props.addComcheck(this.props.exerciseId, data).then((payload) => {
      this.props.redirectToComcheck(this.props.exerciseId, payload.result)
    })
  }

  submitFormComcheck() {
    this.refs.comcheckForm.submit()
  }

  handleOpenEdit() {
    this.setState({openEdit: true})
    this.handlePopoverClose()
  }

  handleCloseEdit() {
    this.setState({openEdit: false})
  }

  onSubmitEdit(data) {
    return this.props.updateAudience(this.props.exerciseId, this.props.audience.audience_id, data)
  }

  submitFormEdit() {
    this.refs.audienceForm.submit()
  }

  handleOpenDelete() {
    this.setState({openDelete: true})
    this.handlePopoverClose()
  }

  handleCloseDelete() {
    this.setState({openDelete: false})
  }

  submitDelete() {
    this.props.deleteAudience(this.props.exerciseId, this.props.audience.audience_id).then(() => this.props.redirectToAudiences(this.props.exerciseId))
    this.handleCloseDelete()
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

  t(id) {
    return this.props.intl.formatMessage({id})
  }

  handleDownloadAudience() {
    this.props.downloadExportAudience(this.props.exerciseId, this.props.audience.audience_id)
    this.handlePopoverClose()
  }

  render() {
    let audience_enabled = R.propOr(true, 'audience_enabled', this.props.audience)

    const initialComcheckValues = {
      comcheck_audience: R.propOr(0, 'audience_id', this.props.audience),
      comcheck_subject: this.t("Communication check"),
      comcheck_message: this.t("Hello") + ',<br /><br />' + this.t("This is a communication check before the beginning of the exercise. Please click on the following link in order to confirm you successfully received this message:"),
      comcheck_footer: this.t("Best regards") + ',<br />' + this.t("The exercise control Team")
    }

    const comcheckActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseComcheck.bind(this)}/>,
      <FlatButton label="Launch" primary={true} onTouchTap={this.submitFormComcheck.bind(this)}/>,
    ]
    const editActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseEdit.bind(this)}/>,
      <FlatButton label="Update" primary={true} onTouchTap={this.submitFormEdit.bind(this)}/>,
    ]
    const deleteActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseDelete.bind(this)}/>,
      <FlatButton label="Delete" primary={true} onTouchTap={this.submitDelete.bind(this)}/>,
    ]
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
          <Icon color="#ffffff" name={Constants.ICON_NAME_NAVIGATION_MORE_VERT}/>
        </IconButton>
        <Popover open={this.state.openPopover} anchorEl={this.state.anchorEl}
                 onRequestClose={this.handlePopoverClose.bind(this)}>
          <Menu multiple={false}>
            <MenuItemLink label="Launch a comcheck" onTouchTap={this.handleOpenComcheck.bind(this)}/>
            <MenuItemLink label="Edit" onTouchTap={this.handleOpenEdit.bind(this)}/>
            {audience_enabled ?
              <MenuItemButton label="Disable" onTouchTap={this.handleOpenDisable.bind(this)}/> :
              <MenuItemButton label="Enable" onTouchTap={this.handleOpenEnable.bind(this)}/>}
            <MenuItemLink label="Export to XLS" onTouchTap={this.handleDownloadAudience.bind(this)}/>
            <MenuItemButton label="Delete" onTouchTap={this.handleOpenDelete.bind(this)}/>
          </Menu>
        </Popover>
        <Dialog title="Confirmation" modal={false}
                open={this.state.openDelete}
                onRequestClose={this.handleCloseDelete.bind(this)}
                actions={deleteActions}>
          <T>Do you want to delete this audience?</T>
        </Dialog>
        <Dialog title="Update the audience" modal={false}
                open={this.state.openEdit}
                onRequestClose={this.handleCloseEdit.bind(this)}
                actions={editActions}>
          <AudienceForm ref="audienceForm" initialValues={R.pick(['audience_name'], this.props.audience)}
                        onSubmit={this.onSubmitEdit.bind(this)} onSubmitSuccess={this.handleCloseEdit.bind(this)}/>
        </Dialog>
        <Dialog title="Launch a comcheck" modal={false}
                open={this.state.openComcheck}
                autoScrollBodyContent={true}
                onRequestClose={this.handleCloseComcheck.bind(this)}
                actions={comcheckActions}>
          <ComcheckForm ref="comcheckForm"
                        audiences={this.props.audiences}
                        initialValues={initialComcheckValues}
                        onSubmit={this.onSubmitComcheck.bind(this)}
                        onSubmitSuccess={this.handleCloseComcheck.bind(this)}/>
        </Dialog>
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
  deleteAudience: PropTypes.func,
  updateAudience: PropTypes.func,
  selectAudience: PropTypes.func,
  downloadExportAudience: PropTypes.func,
  redirectToAudiences: PropTypes.func,
  redirectToComcheck: PropTypes.func,
  addComcheck: PropTypes.func,
  audience: PropTypes.object,
  audiences: PropTypes.array,
  children: PropTypes.node,
  intl: PropTypes.object
}

export default connect(null, {updateAudience, selectAudience, downloadExportAudience, deleteAudience, addComcheck, redirectToAudiences, redirectToComcheck})(injectIntl(AudiencePopover))