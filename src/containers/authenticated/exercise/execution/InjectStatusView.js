import React, {PropTypes, Component} from 'react'
import R from 'ramda'
import Theme from '../../../../components/Theme'
import {T} from '../../../../components/I18n'
import {i18nRegister} from '../../../../utils/Messages'
import {dateFormat} from '../../../../utils/Time'

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

  render() {
    let inject_status = R.propOr('-', 'inject_status', this.props.inject)
    console.log(inject_status)

    return (
      <div style={styles.container}>
        <div style={styles.title}><T>{inject_status.status_name}</T></div>
        <div style={styles.date}>{dateFormat(inject_status.status_date)}</div>
        <div style={{clear: 'both'}}></div><br />
        <div style={styles.message}>{inject_status.status_message}</div>
      </div>
    )
  }
}

InjectStatusView.propTypes = {
  inject: PropTypes.object
}

export default InjectStatusView