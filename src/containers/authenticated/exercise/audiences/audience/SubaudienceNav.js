import React, {PropTypes, Component} from 'react'
import {connect} from 'react-redux'
import * as Constants from '../../../../../constants/ComponentTypes'
import {selectSubaudience} from '../../../../../actions/Subaudience'
import {Drawer} from '../../../../../components/Drawer'
import {List} from '../../../../../components/List'
import {ListItemLink} from '../../../../../components/list/ListItem';
import {Icon} from '../../../../../components/Icon'
import Theme from '../../../../../components/Theme'
import CreateSubaudience from './CreateSubaudience'

class SubaudienceNav extends Component {

  handleChangeAudience(subaudienceId) {
    this.props.selectSubaudience(this.props.exerciseId, this.props.audienceId, subaudienceId)
  }

  switchColor(disabled) {
    if (disabled) {
      return Theme.palette.disabledColor
    } else {
      return Theme.palette.textColor
    }
  }

  render() {
    return (
      <Drawer width={300} docked={true} open={true} openSecondary={true} zindex={50}>
        <CreateSubaudience exerciseId={this.props.exerciseId} audienceId={this.props.audienceId}/>
        <List>
          {this.props.subaudiences.map(subaudience => {
            return (
              <ListItemLink
                grey={!subaudience.subaudience_enabled || !this.props.audience.audience_enabled}
                type={Constants.LIST_ITEM_NOSPACE}
                key={subaudience.subaudience_id}
                active={this.props.selectedSubaudience === subaudience.subaudience_id}
                onClick={this.handleChangeAudience.bind(this, subaudience.subaudience_id)}
                label={subaudience.subaudience_name}
                leftIcon={<Icon name={Constants.ICON_NAME_SOCIAL_GROUP} color={this.switchColor(!subaudience.subaudience_enabled || !this.props.audience.audience_enabled)}/>}
              />
            )
          })}
        </List>
      </Drawer>
    );
  }
}

SubaudienceNav.propTypes = {
  exerciseId: PropTypes.string,
  audienceId: PropTypes.string,
  audience: PropTypes.object,
  selectedSubaudience: PropTypes.string,
  subaudiences: PropTypes.array,
  selectSubaudience: PropTypes.func
}

export default connect(null, {selectSubaudience})(SubaudienceNav);
