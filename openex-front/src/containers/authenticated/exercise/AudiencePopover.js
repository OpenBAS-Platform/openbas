import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import { MoreVert } from '@material-ui/icons';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Slide from '@material-ui/core/Slide';
import { T } from '../../../components/I18n';
import { i18nRegister } from '../../../utils/Messages';
import { updateAudience, updateAudienceActivation } from '../../../actions/Audience';

i18nRegister({
  fr: {
    'Do you want to disable this audience?':
      'Souhaitez-vous désactiver cette audience ?',
    'Do you want to enable this audience?':
      'Souhaitez-vous activer cette audience ?',
    Disable: 'Désactiver',
    Enable: 'Activer',
  },
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

class AudiencePopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openEnable: false,
      openDisable: false,
      openPopover: false,
    };
  }

  handlePopoverOpen(event) {
    this.setState({ anchorEl: event.currentTarget });
  }

  handlePopoverClose() {
    this.setState({ anchorEl: null });
  }

  handleOpenDisable() {
    this.setState({ openDisable: true });
    this.handlePopoverClose();
  }

  handleCloseDisable() {
    this.setState({ openDisable: false });
  }

  submitDisable() {
    this.props.updateAudienceActivation(
      this.props.exerciseId,
      this.props.audience.audience_id,
      { audience_enabled: false },
    );
    this.handleCloseDisable();
  }

  handleOpenEnable() {
    this.setState({ openEnable: true });
    this.handlePopoverClose();
  }

  handleCloseEnable() {
    this.setState({ openEnable: false });
  }

  submitEnable() {
    this.props.updateAudienceActivation(
      this.props.exerciseId,
      this.props.audience.audience_id,
      { audience_enabled: true },
    );
    this.handleCloseEnable();
  }

  render() {
    const audienceEnabled = R.propOr(
      true,
      'audience_enabled',
      this.props.audience,
    );
    const audienceIsUpdatable = R.propOr(
      true,
      'user_can_update',
      this.props.audience,
    );
    return (
      <div>
        <IconButton
          onClick={this.handlePopoverOpen.bind(this)}
          aria-haspopup="true"
        >
          <MoreVert />
        </IconButton>
        <Menu
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handlePopoverClose.bind(this)}
          style={{ marginTop: 50 }}
        >
          {audienceEnabled ? (
            <MenuItem
              onClick={this.handleOpenDisable.bind(this)}
              disabled={!audienceIsUpdatable}
            >
              <T>Disable</T>
            </MenuItem>
          ) : (
            <MenuItem
              onClick={this.handleOpenEnable.bind(this)}
              disabled={!audienceIsUpdatable}
            >
              <T>Enable</T>
            </MenuItem>
          )}
        </Menu>
        <Dialog
          TransitionComponent={Transition}
          open={this.state.openDisable}
          onClose={this.handleCloseDisable.bind(this)}
        >
          <DialogContent>
            <DialogContentText>
              <T>Do you want to disable this audience?</T>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseDisable.bind(this)}
            >
              <T>Cancel</T>
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={this.submitDisable.bind(this)}
            >
              <T>Disable</T>
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          TransitionComponent={Transition}
          open={this.state.openEnable}
          onClose={this.handleCloseEnable.bind(this)}
        >
          <DialogContent>
            <DialogContentText>
              <T>Do you want to enable this audience?</T>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseEnable.bind(this)}
            >
              <T>Cancel</T>
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={this.submitEnable.bind(this)}
            >
              <T>Enable</T>
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

AudiencePopover.propTypes = {
  exerciseId: PropTypes.string,
  audience: PropTypes.object,
  updateAudience: PropTypes.func,
  updateAudienceActivation: PropTypes.func,
};

export default connect(null, { updateAudience, updateAudienceActivation })(AudiencePopover);
