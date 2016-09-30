import React, {PropTypes, Component} from 'react';
import * as MUI from 'material-ui/Popover';
import Avatar from 'material-ui/Avatar';
import {Button} from './Button'
import * as Constants from '../constants/ComponentTypes';

export class Popover extends Component {
  constructor(props) {
    super(props);
    this.state = {open: false}
  }

  handleTouchTap(event) {
    event.preventDefault() // This prevents ghost click.
    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    })
  }

  handleRequestClose() {
    this.setState({open: false})
  }

  render() {
    let handler;
    if (this.props.type === Constants.POPOVER_TYPE_AVATAR) {
      handler = <Avatar style={{cursor: 'pointer'}}
                        onTouchTap={this.handleTouchTap.bind(this)}>{this.props.avatar}</Avatar>
    } else {
      handler = <Button label={this.props.label ? this.props.label : 'action'}
                        onTouchTap={this.handleTouchTap.bind(this)}/>
    }
    return (
      <div>
        {handler}
        <MUI.Popover open={this.state.open} anchorEl={this.state.anchorEl}
                     onRequestClose={this.handleRequestClose.bind(this)}>
          {this.props.children}
        </MUI.Popover>
      </div>
    )
  }
}

Popover.propTypes = {
  avatar: PropTypes.string,
  label: PropTypes.string,
  type: PropTypes.string.isRequired,
  trigger: PropTypes.object,
  children: React.PropTypes.node
}