import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import * as R from 'ramda'
import {fetchComcheckStatus} from '../../../actions/Comcheck'
import {Toolbar, ToolbarGroup, ToolbarTitle} from '../../../components/Toolbar'
import {i18nRegister} from '../../../utils/Messages'
import * as Constants from '../../../constants/ComponentTypes'
import {dateFormat} from '../../../utils/Time'

i18nRegister({
  fr: {
    'Communication check': 'Vérification de la communication'
  }
})

const styles = {
  comcheck: {
    margin: '0 auto',
    marginTop: '45vh',
    transform: 'translateY(-60%)',
    textAlign: 'center',
    width: '400px',
    border: '1px solid #ddd',
    borderRadius: '10px',
    paddingBottom: '20px'
  }
}

class IndexComcheck extends Component {
  componentDidMount() {
    this.props.fetchComcheckStatus(this.props.statusId)
  }

  render() {
    let status_state = R.propOr(0, 'status_state', this.props.comcheck_status)
    let status_last_update = R.propOr(undefined, 'status_last_update', this.props.comcheck_status)

    return (
      <div style={styles.comcheck}>
        <Toolbar type={Constants.TOOLBAR_TYPE_LOGIN}>
          <ToolbarGroup>
            <ToolbarTitle text="Communication check" type={Constants.TOOLBAR_TYPE_LOGIN}/>
          </ToolbarGroup>
        </Toolbar>
        <br />
        Your communication check is <strong>{status_state ? 'successfull' : 'failed'}</strong>.<br />
        {status_last_update !== undefined ? 'Verification done at ' + dateFormat(status_last_update) : ''}
      </div>
    )
  }
}

IndexComcheck.propTypes = {
  statusId: PropTypes.string,
  comcheck_status: PropTypes.object,
  fetchComcheckStatus: PropTypes.func
}

const select = (state, ownProps) => {
  let statusId = ownProps.params.statusId
  let comcheck_status = R.propOr({}, statusId, state.referential.entities.comchecks_statuses)
  return {
    statusId,
    comcheck_status
  }
}

export default connect(select, {fetchComcheckStatus})(IndexComcheck)