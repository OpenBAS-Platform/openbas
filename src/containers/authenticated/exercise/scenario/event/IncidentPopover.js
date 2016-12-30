import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import R from 'ramda'
import {i18nRegister} from '../../../../../utils/Messages'
import {T} from '../../../../../components/I18n'
import * as Constants from '../../../../../constants/ComponentTypes'
import {Popover} from '../../../../../components/Popover';
import {Menu} from '../../../../../components/Menu'
import {Dialog, DialogTitleElement} from '../../../../../components/Dialog'
import {IconButton, FlatButton} from '../../../../../components/Button'
import {Icon} from '../../../../../components/Icon'
import {MenuItemLink, MenuItemButton} from "../../../../../components/menu/MenuItem"
import {SimpleTextField} from '../../../../../components/SimpleTextField'
import {Chip} from '../../../../../components/Chip'
import {List} from '../../../../../components/List'
import {Avatar} from '../../../../../components/Avatar';
import {MainSmallListItem} from '../../../../../components/list/ListItem'
import {updateIncident, deleteIncident, selectIncident} from '../../../../../actions/Incident'
import {fetchSubobjectives} from '../../../../../actions/Subobjective'
import IncidentForm from './IncidentForm'

const styles = {
  container: {
    float: 'left',
    marginTop: '-14px'
  },
  'title': {
    float: 'left',
    width: '80%',
    padding: '5px 0 0 0'
  },
  'empty': {
    margin: '0 auto',
    marginTop: '10px',
    textAlign: 'center'
  }
}

i18nRegister({
  fr: {
    'Update the incident': 'Modifier l\'incident',
    'Do you want to delete this incident?': 'Souhaitez-vous supprimer cet incident ?',
    'Linked subobjectives': 'Sous-objectifs liés',
    'No subobjective found.': 'Aucun sous-objectif trouvé.',
    'Search for a subobjective': 'Rechercher un sous-objectif'
  }
})

class IncidentPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDelete: false,
      openEdit: false,
      openSubobjectives: false,
      openPopover: false,
      subobjectivesIds: this.props.incidentSubobjectivesIds,
      searchTerm: ''
    }
  }

  componentDidMount() {
    this.props.fetchSubobjectives(this.props.exerciseId);
  }

  handlePopoverOpen(event) {
    event.preventDefault()
    this.setState({openPopover: true, anchorEl: event.currentTarget})
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
    return this.props.updateIncident(this.props.exerciseId, this.props.eventId, this.props.incident.incident_id, data)
  }

  submitFormEdit() {
    this.refs.incidentForm.submit()
  }

  handleOpenSubobjectives() {
    this.setState({openSubobjectives: true, subobjectivesIds: this.props.incidentSubobjectivesIds})
    this.handlePopoverClose()
  }

  handleCloseSubobjectives() {
    this.setState({openSubobjectives: false, searchTerm: ''})
  }

  handleSearchSubobjectives(event, value) {
    this.setState({searchTerm: value})
  }

  addSubobjective(subobjectiveId) {
    this.setState({subobjectivesIds: R.append(subobjectiveId, this.state.subobjectivesIds)})
  }

  removeSubobjective(subobjectiveId) {
    this.setState({subobjectivesIds: R.filter(s => s !== subobjectiveId, this.state.subobjectivesIds)})
  }

  submitAddSubobjectives() {
    this.props.updateIncident(this.props.exerciseId, this.props.eventId, this.props.incident.incident_id, {incident_subobjectives: this.state.subobjectivesIds})
    this.handleCloseSubobjectives()
  }

  handleOpenDelete() {
    this.setState({openDelete: true})
    this.handlePopoverClose()
  }

  handleCloseDelete() {
    this.setState({openDelete: false})
  }

  submitDelete() {
    this.props.deleteIncident(this.props.exerciseId, this.props.eventId, this.props.incident.incident_id).then(() => {
      this.props.selectIncident(this.props.exerciseId, this.props.eventId, undefined)
    })
    this.handleCloseDelete()
  }

  render() {
    const editActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseEdit.bind(this)}/>,
      <FlatButton label="Update" primary={true} onTouchTap={this.submitFormEdit.bind(this)}/>,
    ]
    const subobjectivesActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseSubobjectives.bind(this)}/>,
      <FlatButton label="Update" primary={true} onTouchTap={this.submitAddSubobjectives.bind(this)}/>,
    ]
    const deleteActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseDelete.bind(this)}/>,
      <FlatButton label="Delete" primary={true} onTouchTap={this.submitDelete.bind(this)}/>,
    ]

    let initialValues = R.pick(['incident_title', 'incident_story', 'incident_type', 'incident_weight'], this.props.incident)

    //region filter subobjectives by active keyword
    const keyword = this.state.searchTerm
    let filterByKeyword = n => keyword === '' ||
    n.subobjective_title.toLowerCase().indexOf(keyword.toLowerCase()) !== -1 ||
    n.subobjective_description.toLowerCase().indexOf(keyword.toLowerCase()) !== -1
    let filteredSubobjectives = R.filter(filterByKeyword, R.values(this.props.subobjectives))
    //endregion

    return (
      <div style={styles.container}>
        <IconButton onClick={this.handlePopoverOpen.bind(this)}>
          <Icon name={Constants.ICON_NAME_NAVIGATION_MORE_VERT}/>
        </IconButton>
        <Popover open={this.state.openPopover} anchorEl={this.state.anchorEl}
                 onRequestClose={this.handlePopoverClose.bind(this)}>
          <Menu multiple={false}>
            <MenuItemLink label="Edit" onTouchTap={this.handleOpenEdit.bind(this)}/>
            <MenuItemLink label="Linked subobjectives" onTouchTap={this.handleOpenSubobjectives.bind(this)}/>
            <MenuItemButton label="Delete" onTouchTap={this.handleOpenDelete.bind(this)}/>
          </Menu>
        </Popover>
        <Dialog title="Confirmation" modal={false} open={this.state.openDelete}
                onRequestClose={this.handleCloseDelete.bind(this)} actions={deleteActions}>
          <T>Do you want to delete this incident?</T>
        </Dialog>
        <Dialog title="Update the incident" modal={false} open={this.state.openEdit}
                autoScrollBodyContent={true}
                onRequestClose={this.handleCloseEdit.bind(this)} actions={editActions}>
          <IncidentForm ref="incidentForm"
                        initialValues={initialValues}
                        onSubmit={this.onSubmitEdit.bind(this)}
                        onSubmitSuccess={this.handleCloseEdit.bind(this)}
                        types={this.props.incident_types}/>
        </Dialog>
        <DialogTitleElement
          title={<SimpleTextField name="keyword" fullWidth={true} type="text" hintText="Search for a subobjective"
                                  onChange={this.handleSearchSubobjectives.bind(this)}
                                  styletype={Constants.FIELD_TYPE_INTITLE}/>}
          modal={false}
          open={this.state.openSubobjectives}
          onRequestClose={this.handleCloseSubobjectives.bind(this)}
          autoScrollBodyContent={true}
          actions={subobjectivesActions}>
          <div>
            {this.state.subobjectivesIds.map(subobjectiveId => {
              let subobjective = R.propOr({}, subobjectiveId, this.props.subobjectives)
              let subobjective_title = R.propOr('-', 'subobjective_title', subobjective)
              return (
                <Chip
                  key={subobjectiveId}
                  onRequestDelete={this.removeSubobjective.bind(this, subobjectiveId)}
                  type={Constants.CHIP_TYPE_LIST}>
                  <Avatar icon={<Icon name={Constants.ICON_NAME_IMAGE_CENTER_FOCUS_WEAK}/>} size={32}
                          type={Constants.AVATAR_TYPE_CHIP}/>
                  {subobjective_title}
                </Chip>
              )
            })}
            <div className="clearfix"></div>
          </div>
          <div>
            {filteredSubobjectives.length === 0 ? <div style={styles.empty}><T>No subobjective found.</T></div> : ""}
            <List>
              {filteredSubobjectives.map(subobjective => {
                let disabled = R.find(subobjective_id => subobjective_id === subobjective.subobjective_id, this.state.subobjectivesIds) !== undefined
                return (
                  <MainSmallListItem
                    key={subobjective.subobjective_id}
                    disabled={disabled}
                    onClick={this.addSubobjective.bind(this, subobjective.subobjective_id)}
                    primaryText={
                      <div>
                        <div style={styles.title}>{subobjective.subobjective_title}</div>
                        <div className="clearfix"></div>
                      </div>
                    }
                    leftAvatar={<Icon name={Constants.ICON_NAME_IMAGE_CENTER_FOCUS_WEAK}
                                      type={Constants.ICON_TYPE_LIST}/>}
                  />
                )
              })}
            </List>
          </div>
        </DialogTitleElement>
      </div>
    )
  }
}

IncidentPopover.propTypes = {
  exerciseId: PropTypes.string,
  eventId: PropTypes.string,
  deleteIncident: PropTypes.func,
  updateIncident: PropTypes.func,
  selectIncident: PropTypes.func,
  fetchSubobjectives: PropTypes.func,
  incident: PropTypes.object,
  incident_types: PropTypes.object,
  incidentSubobjectivesIds: PropTypes.array,
  subobjectives: PropTypes.object
}

const select = (state) => {
  return {
    incident_types: state.referential.entities.incident_types,
    subobjectives: state.referential.entities.subobjectives,
  }
}

export default connect(select, {fetchSubobjectives, updateIncident, deleteIncident, selectIncident})(IncidentPopover)
