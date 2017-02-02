import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import Infinite from 'react-infinite'
import R from 'ramda'
import Theme from '../../../../components/Theme'
import {T} from '../../../../components/I18n'
import {i18nRegister} from '../../../../utils/Messages'
import * as Constants from '../../../../constants/ComponentTypes'
import {fetchAudiences} from '../../../../actions/Audience'
import {SearchField} from '../../../../components/SimpleTextField'
import {Icon} from '../../../../components/Icon'
import {List} from '../../../../components/List'
import {MainListItemLink} from '../../../../components/list/ListItem';
import CreateAudience from './audience/CreateAudience'

const styles = {
  container: {
    textAlign: 'left'
  },
  'empty': {
    marginTop: 30,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'center'
  },
  'title': {
    float: 'left',
    fontSize: '13px',
    textTransform: 'uppercase'
  },
  'search': {
    float: 'right',
  }
}

i18nRegister({
  fr: {
    'Audiences': 'Audiences',
    'You do not have any audiences in this exercise.': 'Vous n\'avez aucune audience dans cet exercice.',
    'players': 'joueurs'
  }
})

class IndexAudiences extends Component {
  constructor(props) {
    super(props)
    this.state = {searchTerm: '', itemsNumber: 0, displayedNumber: 0, initialNumber: 0}
  }

  componentDidMount() {
    this.setState({
      initialNumber: this.computeInitialNumbersOfRows(),
      displayedNumber: this.computeInitialNumbersOfRows(),
    })
    this.props.fetchAudiences(this.props.exerciseId).then(() => {
      this.setState({itemsNumber: this.props.audiences.length})
    })
  }

  onCreate() {
    this.setState({itemsNumber: this.state.itemsNumber+1})
    this.handleInfiniteLoad()
  }

  handleSearchAudiences(event, value) {
    this.setState({searchTerm: value})
  }

  computeInitialNumbersOfRows() {
    return Math.round(window.innerHeight / 77) + 1
  }

  switchColor(disabled) {
    if (disabled) {
      return Theme.palette.disabledColor
    } else {
      return Theme.palette.textColor
    }
  }

  handleInfiniteLoad() {
    let remainder = this.state.itemsNumber - this.state.displayedNumber
    if (remainder >= this.state.initialNumber) {
      this.setState({displayedNumber: this.state.displayedNumber + this.state.initialNumber})
    } else if (remainder > 0) {
      this.setState({displayedNumber:  this.state.displayedNumber + remainder})
    }
  }

  render() {
    const keyword = this.state.searchTerm
    let filterByKeyword = n => keyword === '' || n.audience_name.toLowerCase().indexOf(keyword.toLowerCase()) !== -1
    let filteredAudiences = R.filter(filterByKeyword, this.props.audiences)

    return (
      <div style={styles.container}>
        <div style={styles.title}><T>Audiences</T></div>
        <div style={styles.search}>
          <SearchField name="keyword" fullWidth={true} type="text" hintText="Search"
                       onChange={this.handleSearchAudiences.bind(this)}
                       styletype={Constants.FIELD_TYPE_RIGHT}/>
        </div>
        <div className="clearfix"></div>
        {this.props.audiences.length === 0 ?
          <div style={styles.empty}><T>You do not have any events in this exercise.</T></div> : ""}
        <List>
          <Infinite elementHeight={77}
                    containerHeight={window.innerHeight}
                    infiniteLoadBeginEdgeOffset={200}
                    useWindowAsScrollContainer={true}
                    onInfiniteLoad={this.handleInfiniteLoad.bind(this)}>
            {R.take(this.state.displayedNumber, filteredAudiences).map(audience => {
              return (
                <MainListItemLink
                  to={'/private/exercise/' + this.props.exerciseId + '/audiences/' + audience.audience_id}
                  key={audience.audience_id}
                  leftIcon={<Icon name={Constants.ICON_NAME_SOCIAL_GROUP}
                                  color={this.switchColor(!audience.audience_enabled)}/>}
                  primaryText={
                    <div style={{color: this.switchColor(!audience.audience_enabled)}}>
                      {audience.audience_name}
                    </div>
                  }
                  secondaryText={
                    <div style={{color: this.switchColor(!audience.audience_enabled)}}>
                      {audience.audience_users_number}&nbsp;
                      <T>players</T>
                    </div>
                  }
                  rightIcon={<Icon name={Constants.ICON_NAME_HARDWARE_KEYBOARD_ARROW_RIGHT}
                                   color={this.switchColor(!audience.audience_enabled)}/>}
                />
              )
            })}
          </Infinite>
        </List>
        <CreateAudience exerciseId={this.props.exerciseId} onCreate={this.onCreate.bind(this)}/>
      </div>
    )
  }
}

IndexAudiences.propTypes = {
  exerciseId: PropTypes.string,
  audiences: PropTypes.array,
  fetchAudiences: PropTypes.func.isRequired,
}

const filteredAudiences = (audiences, exerciseId) => {
  let audiencesFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => n.audience_exercise.exercise_id === exerciseId),
    R.sort((a, b) => a.audience_name.localeCompare(b.audience_name))
  )
  return audiencesFilterAndSorting(audiences)
}

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  let audiences = filteredAudiences(state.referential.entities.audiences, exerciseId)

  return {
    exerciseId,
    audiences
  }
}

export default connect(select, {fetchAudiences})(IndexAudiences);