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

class DryinjectStatusView extends Component {

  render() {
    let dryinject_status = R.propOr('-', 'dryinject_status', this.props.dryinject)
    let dryinject_message_lines = JSON.parse(R.propOr(null, 'status_message', dryinject_status))

    return (
      <div style={styles.container}>
        <div style={styles.title}><T>{dryinject_status.status_name}</T></div>
        <div style={styles.date}>{dateFormat(dryinject_status.status_date)}</div>
        <div style={{clear: 'both'}}></div><br />
        <div style={styles.message}>
          {dryinject_message_lines.map(line => {
            return <div key={line}>{line}</div>
          })}
        </div>
      </div>
    )
  }
}

DryinjectStatusView.propTypes = {
  dryinject: PropTypes.object
}

export default DryinjectStatusView