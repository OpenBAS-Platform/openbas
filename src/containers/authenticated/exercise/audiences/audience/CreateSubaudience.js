import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {i18nRegister} from '../../../../../utils/Messages'
import {T} from '../../../../../components/I18n'
import * as Constants from '../../../../../constants/ComponentTypes'
import {addSubaudience, selectSubaudience} from '../../../../../actions/Subaudience'
import {Dialog} from '../../../../../components/Dialog';
import {FlatButton} from '../../../../../components/Button';
import SubaudienceForm from './SubaudienceForm'
import {ActionButtonCreate} from '../../../../../components/Button'
import {AppBar} from '../../../../../components/AppBar'

i18nRegister({
  fr: {
    'Sub-audiences': 'Sous-audiences',
    'Create a new sub-audience': 'Créer une nouvelle sous-audience'
  }
})

class CreateSubaudience extends Component {
  constructor(props) {
    super(props);
    this.state = {openCreate: false}
  }

  handleOpenCreate() {
    this.setState({openCreate: true})
  }

  handleCloseCreate() {
    this.setState({openCreate: false})
  }

  onSubmitCreate(data) {
    return this.props.addSubaudience(this.props.exerciseId, this.props.audienceId, data)
      .then((payload) => {
        this.props.selectSubaudience(this.props.exerciseId, this.props.audienceId, payload.result)
      })
  }

  submitFormCreate() {
    this.refs.subaudienceForm.submit()
  }

  render() {
    const actions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseCreate.bind(this)}/>,
      <FlatButton label="Create" primary={true} onTouchTap={this.submitFormCreate.bind(this)}/>,
    ]

    return (
      <div>
        <AppBar title={<T>Sub-audiences</T>} showMenuIconButton={false}
                iconElementRight={<ActionButtonCreate type={Constants.BUTTON_TYPE_CREATE_RIGHT}
                                                      onClick={this.handleOpenCreate.bind(this)} />}/>
        <Dialog title="Create a new sub-audience" modal={false}
                open={this.state.openCreate}
                onRequestClose={this.handleCloseCreate.bind(this)}
                actions={actions}>
          <SubaudienceForm ref="subaudienceForm" onSubmit={this.onSubmitCreate.bind(this)}
                        onSubmitSuccess={this.handleCloseCreate.bind(this)} />
        </Dialog>
      </div>
    );
  }
}

CreateSubaudience.propTypes = {
  exerciseId: PropTypes.string,
  audienceId: PropTypes.string,
  addSubaudience: PropTypes.func,
  selectSubaudience: PropTypes.func
}

export default connect(null, {addSubaudience, selectSubaudience})(CreateSubaudience);