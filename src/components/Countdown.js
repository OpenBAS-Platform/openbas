import React, {Component, PropTypes} from 'react'
import {ONE_SECOND, dateFromNow, now, parse} from '../utils/Time'
import Rx from 'rxjs/Rx'
import {injectIntl} from 'react-intl'
import countdown from 'countdown'
import {T} from '../components/I18n'
import {i18nRegister} from '../utils/Messages'

i18nRegister({
  fr: {
    'is currently in progress': 'est actuellement en cours',
    'will be executed in': 'sera exécuté dans',
    ' millisecond| second| minute| hour| day| week| month| year| decade| century| millennium': ' milliseconde| seconde| minute| heure| jour| semaine| mois| année| décennie| siècle| millénaire',
    ' milliseconds| seconds| minutes| hours| days| weeks| months| years| decades| centuries| millennia': ' millisecondes| secondes| minutes| heures| jours| semaines| mois| années| décennies| siècles| millénaires',
    ' and ': ' et ',
    'now': 'maintenant',
  }
})

class Countdown extends Component {
  translate(text) {
    return this.props.intl.formatMessage({id: text})
  }

  constructor(props) {
    super(props);
    this.state = {startDate: new Date()}
    countdown.setLabels(
      this.translate(' millisecond| second| minute| hour| day| week| month| year| decade| century| millennium'),
      this.translate(' milliseconds| seconds| minutes| hours| days| weeks| months| years| decades| centuries| millennia'),
      this.translate(' and '),
      ', ',
      this.translate('now')
    );
  }

  componentDidMount() {
    const initialStream = Rx.Observable.of(1);
    const intervalStream = Rx.Observable.interval(ONE_SECOND)
    this.subscription = initialStream
        .merge(intervalStream)
        .do(() => this.setState({startDate: new Date()}))
        .subscribe()
  }

  componentWillUnmount() {
      this.subscription.unsubscribe()
  }

  render() {
      if(now().isAfter(parse(this.props.targetDate))) {
          return <span><T>is currently in progress</T></span>
      } else {
          return <span><T>will be executed in</T> {dateFromNow(this.props.targetDate)}</span>
      }
  }
}

Countdown.propTypes = {
  targetDate: PropTypes.string
}

export default injectIntl(Countdown)
