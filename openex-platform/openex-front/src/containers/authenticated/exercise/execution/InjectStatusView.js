import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import Theme from '../../../../components/Theme';
import { T } from '../../../../components/I18n';
import { i18nRegister } from '../../../../utils/Messages';
import { dateFormat, convertToCountdown } from '../../../../utils/Time';

i18nRegister({
  fr: {
    SUCCESS: 'Succès',
    ERROR: 'Erreur',
    PARTIAL: 'Partiel',
  },
  en: {
    SUCCESS: 'Success',
    ERROR: 'Error',
    PARTIAL: 'Partial',
  },
});

const styles = {
  container: {
    color: Theme.palette.textColor,
    padding: '20px 0px 10px 0px',
  },
  title: {
    float: 'left',
    fontSize: '24px',
    fontWeight: '500',
    margin: '0px 0px 10px 0px',
  },
  date: {
    float: 'right',
  },
  message: {
    fontSize: '14px',
    margin: '0px 0px 10px 0px',
  },
  story: {},
};

class InjectStatusView extends Component {
  // eslint-disable-next-line class-methods-use-this
  readJSON(str) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return null;
    }
  }

  render() {
    const injectStatus = R.propOr('-', 'inject_status', this.props.inject);
    const injectMessageLines = this.readJSON(
      R.propOr(null, 'status_message', injectStatus),
    );
    const time = convertToCountdown(injectStatus.status_execution);

    return (
      <div style={styles.container}>
        <div style={styles.title}>
          <T>{injectStatus.status_name}</T> ({time})
        </div>
        <div style={styles.date}>{dateFormat(injectStatus.status_date)}</div>
        <div className="clearfix" />
        <br />
        <div style={styles.message}>
          {injectMessageLines.map((line) => (
            <div key={Math.random()}>{line}</div>
          ))}
        </div>
      </div>
    );
  }
}

InjectStatusView.propTypes = {
  inject: PropTypes.object,
};

export default InjectStatusView;
