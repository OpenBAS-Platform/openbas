import { forwardRef, Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { withStyles } from '@mui/styles';
import { Fab, Dialog, DialogTitle, DialogContent, Slide } from '@mui/material';
import { Add } from '@mui/icons-material';
import OrganizationForm from './OrganizationForm';
import { addOrganization } from '../../../../actions/Organization';
import inject18n from '../../../../components/i18n';

const Transition = forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const styles = () => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
  },
});

class CreateOrganization extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    this.setState({ open: false });
  }

  onSubmit(data) {
    const inputValues = R.pipe(
      R.assoc('organization_tags', R.pluck('id', data.organization_tags)),
    )(data);
    return this.props
      .addOrganization(inputValues)
      .then((result) => (result.result ? this.handleClose() : result));
  }

  render() {
    const { classes, t } = this.props;
    return (
      <div>
        <Fab
          onClick={this.handleOpen.bind(this)}
          color="primary"
          aria-label="Add"
          className={classes.createButton}
        >
          <Add />
        </Fab>
        <Dialog
          open={this.state.open}
          TransitionComponent={Transition}
          onClose={this.handleClose.bind(this)}
          fullWidth={true}
          maxWidth="md"
          PaperProps={{ elevation: 1 }}
        >
          <DialogTitle>{t('Create a new organization')}</DialogTitle>
          <DialogContent>
            <OrganizationForm
              onSubmit={this.onSubmit.bind(this)}
              initialValues={{ organization_tags: [] }}
              handleClose={this.handleClose.bind(this)}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

CreateOrganization.propTypes = {
  classes: PropTypes.object,
  t: PropTypes.func,
  addOrganization: PropTypes.func,
};

export default R.compose(
  connect(null, { addOrganization }),
  inject18n,
  withStyles(styles),
)(CreateOrganization);
