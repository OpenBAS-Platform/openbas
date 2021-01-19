import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { interval } from 'rxjs';
import { injectIntl } from 'react-intl';
import countdown from 'countdown';
import { T } from './I18n';
import {
  dateFromNow, now, ONE_SECOND, parse,
} from '../utils/Time';
import { i18nRegister } from '../utils/Messages';

const interval$ = interval(ONE_SECOND);

i18nRegister({
  fr: {
    ' ms| s| m| h| d| w| m| y| d| c| m': ' ms| s| m| h| j| s| m| a| d| s| m',
    now: 'maintenant',
    'in progress': 'en cours',
  },
});

class Countdown extends Component {
  translate(text) {
    return this.props.intl.formatMessage({ id: text });
  }

  constructor(props) {
    super(props);
    this.state = { startDate: now() };
    const options = this.translate(' ms| s| m| h| d| w| m| y| d| c| m');
    countdown.setLabels(options, options, ', ', ', ', this.translate('now'));
  }

  componentDidMount() {
    this.subscription = interval$.subscribe(() => {
      this.setState({ startDate: now() });
    });
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render() {
    if (now().isAfter(parse(this.props.targetDate))) {
      return (
        <span>
          (<T>in progress</T>)
        </span>
      );
    }
    return <span>({dateFromNow(this.props.targetDate)})</span>;
  }
}

Countdown.propTypes = {
  targetDate: PropTypes.string,
  intl: PropTypes.object,
  type: PropTypes.string,
};

export default injectIntl(Countdown);
