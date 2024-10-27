import { Add } from '@mui/icons-material';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { withStyles } from '@mui/styles';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { Component } from 'react';

import Transition from '../../../components/common/Transition';
import inject18n from '../../../components/i18n';
import { LessonContext } from '../common/Context';
import ObjectiveForm from './ObjectiveForm';

const styles = () => ({
  createButton: {
    float: 'left',
    marginTop: -15,
  },
});

class CreateObjective extends Component {
  // Context
  static contextType = LessonContext;

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

  onSubmit = (data) => {
    const { onAddObjective } = this.context;
    return onAddObjective(data)
      .then((result) => {
        if (result.result) {
          this.handleClose();
        }
        return result;
      });
  };

  render() {
    const { classes, t } = this.props;
    return (
      <div>
        <IconButton
          color="secondary"
          aria-label="Add"
          onClick={this.handleOpen.bind(this)}
          classes={{ root: classes.createButton }}
          size="large"
        >
          <Add fontSize="small" />
        </IconButton>
        <Dialog
          open={this.state.open}
          TransitionComponent={Transition}
          onClose={this.handleClose.bind(this)}
          fullWidth
          maxWidth="md"
          PaperProps={{ elevation: 1 }}
        >
          <DialogTitle>{t('Create a new objective')}</DialogTitle>
          <DialogContent>
            <ObjectiveForm
              initialValues={{ objective_priority: 1 }}
              onSubmit={this.onSubmit.bind(this)}
              handleClose={this.handleClose.bind(this)}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

CreateObjective.propTypes = {
  classes: PropTypes.object,
  t: PropTypes.func,
  addObjective: PropTypes.func,
};

export default R.compose(
  inject18n,
  withStyles(styles),
)(CreateObjective);
