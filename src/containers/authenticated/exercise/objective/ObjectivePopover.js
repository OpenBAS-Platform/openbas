import React, {Component} from 'react'
import PropTypes from 'prop-types'
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
import {MenuItemLink, MenuItemButton} from "../../../../components/menu/MenuItem"
import {fetchObjective, updateObjective, deleteObjective} from '../../../../actions/Objective'
import {addSubobjective} from '../../../../actions/Subobjective'
import ObjectiveForm from './ObjectiveForm'
import SubobjectiveForm from './SubobjectiveForm'

const style = {
  position: 'absolute',
  top: '10px',
  right: 0,
}

i18nRegister({
  fr: {
    'Update the objective': 'Modifier l\'objectif',
    'Create a new subobjective': 'Créer un nouveau sous-objectif',
    'Add a subobjective': 'Ajouter un sous-objectif',
    'Do you want to delete this objective?': 'Souhaitez-vous supprimer cet objectif ?'
  }
})

class ObjectivePopover extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openDelete: false,
      openEdit: false,
      openPopover: false,
      openCreateSubobjective: false
    }
  }

  handlePopoverOpen(event) {
    event.stopPropagation()
    this.setState({
      openPopover: true,
      anchorEl: event.currentTarget,
    })
  }

  handlePopoverClose() {
    this.setState({openPopover: false})
  }

  handleOpenEdit() {
    this.setState({openEdit: true})
    this.handlePopoverClose()
  }

  handleCloseEdit() {
    this.setState({openEdit: false})
  }

  onSubmitEdit(data) {
    return this.props.updateObjective(this.props.exerciseId, this.props.objective.objective_id, data)
  }

  submitFormEdit() {
    this.refs.objectiveForm.submit()
  }

  handleOpenDelete() {
    this.setState({openDelete: true})
    this.handlePopoverClose()
  }

  handleCloseDelete() {
    this.setState({openDelete: false})
  }

  submitDelete() {
    this.props.deleteObjective(this.props.exerciseId, this.props.objective.objective_id)
    this.handleCloseDelete()
  }

  handleOpenCreateSubobjective() {
    this.setState({openCreateSubobjective: true})
    this.handlePopoverClose()
  }

  handleCloseCreateSubobjective() {
    this.setState({openCreateSubobjective: false})
  }

  onSubmitCreateSubobjective(data) {
    return this.props.addSubobjective(this.props.exerciseId, this.props.objective.objective_id, data).then(() => {
      this.props.fetchObjective(this.props.exerciseId, this.props.objective.objective_id)
    })
  }

  submitFormCreateSubobjective() {
    this.refs.subobjectiveForm.submit()
  }

  render() {
    const editActions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleCloseEdit.bind(this)}
      />,
      <FlatButton
        label="Update"
        primary={true}
        onTouchTap={this.submitFormEdit.bind(this)}
      />,
    ]
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
    ]
    const createSubobjectiveActions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleCloseCreateSubobjective.bind(this)}
      />,
      <FlatButton
        label="Create"
        primary={true}
        onTouchTap={this.submitFormCreateSubobjective.bind(this)}
      />,
    ]

    let initialValues = R.pick(['objective_title', 'objective_description', 'objective_priority'], this.props.objective)
    return (
      <div style={style}>
        <IconButton onClick={this.handlePopoverOpen.bind(this)}>
          <Icon name={Constants.ICON_NAME_NAVIGATION_MORE_VERT}/>
        </IconButton>
        <Popover open={this.state.openPopover}
                 anchorEl={this.state.anchorEl}
                 onRequestClose={this.handlePopoverClose.bind(this)}>
          <Menu multiple={false}>
            <MenuItemLink label="Add a subobjective" onTouchTap={this.handleOpenCreateSubobjective.bind(this)}/>
            <MenuItemLink label="Edit" onTouchTap={this.handleOpenEdit.bind(this)}/>
            <MenuItemButton label="Delete" onTouchTap={this.handleOpenDelete.bind(this)}/>
          </Menu>
        </Popover>
        <Dialog
          title="Confirmation"
          modal={false}
          open={this.state.openDelete}
          onRequestClose={this.handleCloseDelete.bind(this)}
          actions={deleteActions}
        >
          <T>Do you want to delete this objective?</T>
        </Dialog>
        <Dialog
          title="Update the objective"
          modal={false}
          open={this.state.openEdit}
          onRequestClose={this.handleCloseEdit.bind(this)}
          actions={editActions}
        >
          <ObjectiveForm ref="objectiveForm" initialValues={initialValues} onSubmit={this.onSubmitEdit.bind(this)}
                         onSubmitSuccess={this.handleCloseEdit.bind(this)}/>
        </Dialog>
        <Dialog
          title="Create a new subobjective"
          modal={false}
          open={this.state.openCreateSubobjective}
          onRequestClose={this.handleCloseCreateSubobjective.bind(this)}
          actions={createSubobjectiveActions}
        >
          <SubobjectiveForm ref="subobjectiveForm" onSubmit={this.onSubmitCreateSubobjective.bind(this)}
                            onSubmitSuccess={this.handleCloseCreateSubobjective.bind(this)}/>
        </Dialog>
      </div>
    )
  }
}

ObjectivePopover.propTypes = {
  exerciseId: PropTypes.string,
  fetchObjective: PropTypes.func,
  updateObjective: PropTypes.func,
  deleteObjective: PropTypes.func,
  addSubobjective: PropTypes.func,
  objective: PropTypes.object,
  children: PropTypes.node
}

export default connect(null, {fetchObjective, updateObjective, deleteObjective, addSubobjective})(ObjectivePopover)