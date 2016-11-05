import React, {PropTypes, Component} from 'react'
import {connect} from 'react-redux'
import * as Constants from '../../../../constants/ComponentTypes'
import {fetchAudiences} from '../../../../actions/Audience'
import {Drawer} from '../../../../components/Drawer'
import {List} from '../../../../components/List'
import {ListItemLink} from '../../../../components/list/ListItem';
import {Icon} from '../../../../components/Icon'

import CreateAudience from './CreateAudience'

class AudienceNav extends Component {
  componentDidMount() {
    this.props.fetchAudiences(this.props.id);
  }

  handleOpenCreate() {
    this.refs.createAudience.handleOpen()
  }

  handleChangeAudience(audience) {
    this.props.onChangeAudience(audience)
  }

  render() {
    return (
      <Drawer width={300} docked={true} open={true} openSecondary={true} zindex={100}>
        <CreateAudience id={this.props.id} />
        <List>
          {this.props.audiences.toList().map(audience => {
            return (
              <ListItemLink
                key={audience.get('audience_id')}
                onClick={this.handleChangeAudience.bind(this, audience)}
                label={audience.get('audience_name')}
                leftIcon={<Icon name={Constants.ICON_NAME_SOCIAL_GROUP}/>}/>
            )
          })}
        </List>
      </Drawer>
    );
  }
}

AudienceNav.propTypes = {
  id: PropTypes.string,
  audiences: PropTypes.object,
  fetchAudiences: PropTypes.func,
  onChangeAudience: PropTypes.func
}

const select = (state) => {
  return {
    audiences: state.application.getIn(['entities', 'audiences']),
  }
}

export default connect(select, {fetchAudiences})(AudienceNav);