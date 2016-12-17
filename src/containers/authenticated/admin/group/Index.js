import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import R from 'ramda'
import * as Constants from '../../../../constants/ComponentTypes'
import {fetchGroups} from '../../../../actions/Group'
import {List} from '../../../../components/List'
import {MainListItem, HeaderItem} from '../../../../components/list/ListItem';
import {Icon} from '../../../../components/Icon'
import CreateGroup from './CreateGroup'
import GroupPopover from './GroupPopover'

const styles = {
  'header': {
    'icon': {
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700',
      padding: '8px 0 0 8px'
    },
    'group_name': {
      float: 'left',
      width: '25%',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700'
    },
  },
  'title': {
    float: 'left',
    fontSize: '20px',
    fontWeight: 600
  },
  'empty': {
    marginTop: 40,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'center'
  },
  'number': {
    float: 'right',
    color: '#9E9E9E',
    fontSize: '12px',
  },
  'name': {
    float: 'left',
    width: '25%',
    padding: '5px 0 0 0'
  }
}

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {sortBy: 'group_name', orderAsc: true}
  }

  componentDidMount() {
    this.props.fetchGroups()
  }

  reverseBy(field) {
    this.setState({sortBy: field, orderAsc: !this.state.orderAsc})
  }

  SortHeader(field, label) {
    var icon = this.state.orderAsc ? Constants.ICON_NAME_NAVIGATION_ARROW_DROP_DOWN
      : Constants.ICON_NAME_NAVIGATION_ARROW_DROP_UP
    const IconDisplay = this.state.sortBy === field ? <Icon type={Constants.ICON_TYPE_SORT} name={icon}/> : ""
    return <div style={styles.header[field]} onClick={this.reverseBy.bind(this, field)}>
      {label} {IconDisplay}
    </div>
  }

  //TODO replace with sortWith after Ramdajs new release
  ascend(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
  }

  descend(a, b) {
    return a > b ? -1 : a < b ? 1 : 0;
  }

  render() {
    return <div>
      <div style={styles.title}>Groups management</div>
      <div className="clearfix"></div>
      <List>
        <HeaderItem leftIcon={<span style={styles.header.icon}>#</span>}
                    rightIconButton={<Icon style={{display: 'none'}}/>} primaryText={<div>
          {this.SortHeader('group_name', 'Name')}
          <div className="clearfix"></div>
        </div>}/>

        {R.values(this.props.groups).map(group => {
          let group_id = R.propOr(Math.random(), 'group_id', group)
          let group_name = R.propOr('-', 'group_name', group)

          return <MainListItem
            key={group_id}
            leftIcon={<Icon name={Constants.ICON_NAME_SOCIAL_PUBLIC} type={Constants.ICON_TYPE_MAINLIST}/>}
            rightIconButton={<GroupPopover group={group} groupUsersIds={group.group_users.map(u => u.user_id)}/>}
            primaryText={
              <div>
                <div style={styles.name}>{group_name}</div>
                <div className="clearfix"></div>
              </div>
            }
          />
        })}
      </List>
      <CreateGroup/>
    </div>
  }
}

Index.propTypes = {
  groups: PropTypes.object,
  fetchGroups: PropTypes.func,
}

const select = (state) => {
  return {
    groups: state.referential.entities.groups,
  }
}

export default connect(select, {fetchGroups})(Index);