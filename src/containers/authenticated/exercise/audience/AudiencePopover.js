import React, {PropTypes, Component} from 'react'
import {connect} from 'react-redux'
import {T} from '../../../../components/I18n'
import {i18nRegister} from '../../../../utils/Messages'
import * as Constants from '../../../../constants/ComponentTypes'
import R from 'ramda'
import {Popover} from '../../../../components/Popover'
import {Menu} from '../../../../components/Menu'
import {Dialog} from '../../../../components/Dialog'
import {IconButton, FlatButton} from '../../../../components/Button'
import {Icon} from '../../../../components/Icon'
import {MenuItemLink, MenuItemButton} from "../../../../components/menu/MenuItem"
import {addComcheck} from '../../../../actions/Comcheck'
import {updateAudience, selectAudience, deleteAudience} from '../../../../actions/Audience'
import AudienceForm from './AudienceForm'
import ComcheckForm from '../check/ComcheckForm'

const style = {
  float: 'left',
  marginTop: '-16px'
}

i18nRegister({
  fr: {
    'Update the audience': 'Modifier l\'audience',
    'Do you want to delete this audience?': 'Souhaitez-vous supprimer cette audience?',
    'Launch a comcheck': 'Lancher un comcheck',
    'Communication check': 'Test de communication',
    'Hello': 'Bonjour',
    'This is a communication check before the beginning of the exercise. Please click on the following link in order to confirm you successfully received this message:': 'Ceci est un test de communication avant le début de l\'exercice. Merci de cliquer sur le lien ci-dessous afin de confirmer que vous avez bien reçu ce message :',
    'Best regards': 'Cordialement',
    'The exercise control Team': 'La direction de l\'animation',
  }
})

class AudiencePopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDelete: false,
      openEdit: false,
      openComcheck: false,
      openPopover: false
    }
  }

  handlePopoverOpen(event) {
    event.preventDefault()
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
    data.comcheck_audience = this.props.audience.audience_id
    return this.props.addComcheck(this.props.exerciseId, data)
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
    this.props.deleteAudience(this.props.exerciseId, this.props.audience.audience_id).then(() => {
      this.props.selectAudience(this.props.exerciseId, undefined)
    })
    this.handleCloseDelete()
  }

  render() {
    const initialComcheckValues = {
      comcheck_subject: <T>Communication check</T>,
      comcheck_message: <T>Hello</T> + ',<br /><br />' + <T>This is a communication check before the beginning of the exercise. Please
        click on the following link in order to confirm you successfully received this message:</T>,
      comcheck_footer: <T>Best regards</T> + ',<br />' + <T>The exercise control Team</T>
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

    return (
      <div style={style}>
        <IconButton onClick={this.handlePopoverOpen.bind(this)}>
          <Icon name={Constants.ICON_NAME_NAVIGATION_MORE_VERT}/>
        </IconButton>
        <Popover open={this.state.openPopover} anchorEl={this.state.anchorEl}
                 onRequestClose={this.handlePopoverClose.bind(this)}>
          <Menu multiple={false}>
            <MenuItemLink label="Launch a comcheck" onTouchTap={this.handleOpenComcheck.bind(this)}/>
            <MenuItemLink label="Edit" onTouchTap={this.handleOpenEdit.bind(this)}/>
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
                onRequestClose={this.handleCloseComcheck.bind(this)}
                actions={comcheckActions}>
          <ComcheckForm ref="comcheckForm"
                        initialValues={initialComcheckValues}
                        onSubmit={this.onSubmitComcheck.bind(this)}
                        onSubmitSuccess={this.handleCloseComcheck.bind(this)}/>
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
  addComcheck: PropTypes.func,
  audience: PropTypes.object,
  children: PropTypes.node
}

export default connect(null, {updateAudience, selectAudience, deleteAudience, addComcheck})(AudiencePopover)