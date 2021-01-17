import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Slide from '@material-ui/core/Slide';
import { T } from '../../../../components/I18n';
import { i18nRegister } from '../../../../utils/Messages';
import * as Constants from '../../../../constants/ComponentTypes';
import { Popover } from '../../../../components/Popover';
import { Menu } from '../../../../components/Menu';
import { Icon } from '../../../../components/Icon';
import { MenuItemButton } from '../../../../components/menu/MenuItem';
import { redirectToChecks } from '../../../../actions/Application';
import { deleteDryrun } from '../../../../actions/Dryrun';

const style = {
  float: 'left',
  marginTop: '-14px',
};

i18nRegister({
  fr: {
    'Do you want to delete this dryrun?':
      'Souhaitez-vous supprimer cette simulation ?',
  },
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

class DryrunPopover extends Component {
  constructor(props) {
    super(props);
    this.state = { openDelete: false, openPopover: false };
  }

  handlePopoverOpen(event) {
    event.stopPropagation();
    this.setState({ anchorEl: event.currentTarget });
  }

  handlePopoverClose() {
    this.setState({ anchorEl: null });
  }

  handleOpenDelete() {
    this.setState({ openDelete: true });
    this.handlePopoverClose();
  }

  handleCloseDelete() {
    this.setState({ openDelete: false });
  }

  submitDelete() {
    if (this.props.listenDeletionCall) this.props.listenDeletionCall();
    this.props
      .deleteDryrun(this.props.exerciseId, this.props.dryrun.dryrun_id)
      .then(() => this.props.redirectToChecks(this.props.exerciseId));
  }

  render() {
    const dryrunIsDeletable = R.propOr(
      true,
      'user_can_update',
      this.props.dryrun,
    );

    const deleteActions = [
      <Button
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseDelete.bind(this)}
      />,
      dryrunIsDeletable ? (
        <Button
          key="delete"
          label="Delete"
          primary={true}
          onClick={this.submitDelete.bind(this)}
        />
      ) : (
        ''
      ),
    ];

    return (
      <div style={style}>
        <IconButton onClick={this.handlePopoverOpen.bind(this)}>
          <Icon name={Constants.ICON_NAME_NAVIGATION_MORE_VERT} />
        </IconButton>
        <Popover
          open={this.state.openPopover}
          anchorEl={this.state.anchorEl}
          onClose={this.handlePopoverClose.bind(this)}
        >
          {dryrunIsDeletable ? (
            <Menu multiple={false}>
              <MenuItemButton
                label="Delete"
                onClick={this.handleOpenDelete.bind(this)}
              />
            </Menu>
          ) : (
            ''
          )}
        </Popover>
        <Dialog
          open={this.state.openDelete}
          TransitionComponent={Transition}
          onClose={this.handleCloseDelete.bind(this)}
        >
          <T>Do you want to delete this dryrun?</T>
        </Dialog>
      </div>
    );
  }
}

DryrunPopover.propTypes = {
  exerciseId: PropTypes.string,
  deleteDryrun: PropTypes.func,
  redirectToChecks: PropTypes.func,
  listenDeletionCall: PropTypes.func,
  dryrun: PropTypes.object,
};

export default connect(null, { deleteDryrun, redirectToChecks })(DryrunPopover);
