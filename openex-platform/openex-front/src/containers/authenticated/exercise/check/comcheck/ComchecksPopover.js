import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import * as R from 'ramda';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';
import Slide from '@material-ui/core/Slide';
import { MoreVert } from '@material-ui/icons';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { i18nRegister } from '../../../../../utils/Messages';
import { addComcheck } from '../../../../../actions/Comcheck';
import { redirectToComcheck } from '../../../../../actions/Application';
import ComcheckForm from './ComcheckForm';
import { submitForm } from '../../../../../utils/Action';
import { T } from '../../../../../components/I18n';

const styles = () => ({
  container: {
    float: 'left',
    marginTop: -8,
  },
});

i18nRegister({
  fr: {
    'Launch a comcheck': 'Lancer un test de communication',
  },
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

class DryrunsPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openLaunch: false,
      openPopover: false,
    };
  }

  handlePopoverOpen(event) {
    event.preventDefault();
    this.setState({
      openPopover: true,
      anchorEl: event.currentTarget,
    });
  }

  handlePopoverClose() {
    this.setState({ anchorEl: null });
  }

  handleOpenLaunch() {
    this.setState({ openLaunch: true });
    this.handlePopoverClose();
  }

  handleCloseLaunch() {
    this.setState({ openLaunch: false });
  }

  onSubmitLaunch(data) {
    return this.props
      .addComcheck(this.props.exerciseId, data)
      .then((payload) => {
        this.props.redirectToComcheck(this.props.exerciseId, payload.result);
      });
  }

  t(id) {
    return this.props.intl.formatMessage({ id });
  }

  render() {
    const { classes } = this.props;
    const initialComcheckValues = {
      comcheck_subject: this.t('Communication check'),
      comcheck_message: `${this.t('Hello')},<br /><br />${this.t(
        'This is a communication check before the beginning of the exercise. Please click on the following link in order to confirm you successfully received this message:',
      )}`,
      comcheck_footer: `${this.t('Best regards')},<br />${this.t(
        'The exercise control Team',
      )}`,
    };
    return (
      <div className={classes.container}>
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
          <MenuItem onClick={this.handleOpenLaunch.bind(this)}>
            <T>Launch a comcheck</T>
          </MenuItem>
        </Menu>
        <Dialog
          open={this.state.openLaunch}
          TransitionComponent={Transition}
          onClose={this.handleCloseLaunch.bind(this)}
          maxWidth="md"
          fullWidth={true}
        >
          <DialogTitle>
            <T>Launch a comcheck</T>
          </DialogTitle>
          <DialogContent>
            <ComcheckForm
              initialValues={initialComcheckValues}
              audiences={this.props.audiences}
              onSubmit={this.onSubmitLaunch.bind(this)}
            />
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseLaunch.bind(this)}
            >
              <T>Cancel</T>
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => submitForm('comcheckForm')}
            >
              <T>Launch</T>
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

DryrunsPopover.propTypes = {
  exerciseId: PropTypes.string,
  audiences: PropTypes.array,
  addComcheck: PropTypes.func,
  redirectToComcheck: PropTypes.func,
  intl: PropTypes.object,
};

export default R.compose(
  connect(null, { addComcheck, redirectToComcheck }),
  withStyles(styles),
)(injectIntl(DryrunsPopover));
