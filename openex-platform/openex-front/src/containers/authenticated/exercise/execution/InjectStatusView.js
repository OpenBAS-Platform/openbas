import React, {Component} from 'react'
import PropTypes from 'prop-types'
import * as R from 'ramda'
import Theme from '../../../../components/Theme'
import {T} from '../../../../components/I18n'
import {i18nRegister} from '../../../../utils/Messages'
import {dateFormat, convertToCountdown} from '../../../../utils/Time'

i18nRegister({
  fr: {
    'SUCCESS': 'Succès',
    'ERROR': 'Erreur',
    'PARTIAL': 'Partiel'
  },
  en: {
    'SUCCESS': 'Success',
    'ERROR': 'Error',
    'PARTIAL': 'Partial'
  }
})

const styles = {
  'container': {
    color: Theme.palette.textColor,
    padding: '20px 0px 10px 0px'
  },
  'title': {
    float: 'left',
    fontSize: '24px',
    fontWeight: '500',
    margin: '0px 0px 10px 0px'
  },
  'date': {
    float: 'right'
  },
  'message': {
    fontSize: '14px',
    margin: '0px 0px 10px 0px',
  },
  'story': {

  }
}

class InjectStatusView extends Component {
  readJSON(str) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return null;
    }
  }

  render() {
    let inject_status = R.propOr('-', 'inject_status', this.props.inject)
    let inject_message_lines = this.readJSON(R.propOr(null, 'status_message', inject_status))
    let time = convertToCountdown(inject_status.status_execution)

    return (
      <div style={styles.container}>
        <div style={styles.title}><T>{inject_status.status_name}</T> ({time})</div>
        <div style={styles.date}>{dateFormat(inject_status.status_date)}</div>
        <div style={{clear: 'both'}}></div><br />
        <div style={styles.message}>
          {inject_message_lines.map(line => {
            return <div key={Math.random()}>{line}</div>
          })}
          </div>
      </div>
    )
  }
}

InjectStatusView.propTypes = {
  inject: PropTypes.object
}

export default InjectStatusView