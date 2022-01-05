import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import { MoreVert } from '@mui/icons-material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { updateInject, deleteInject } from '../../../../actions/Inject';
import InjectForm from './InjectForm';
import inject18n from '../../../../components/i18n';
import { splitDuration } from '../../../../utils/Time';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

class InjectPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDelete: false,
      openEdit: false,
      openPopover: false,
    };
  }

  handlePopoverOpen(event) {
    event.stopPropagation();
    this.setState({ anchorEl: event.currentTarget });
  }

  handlePopoverClose() {
    this.setState({ anchorEl: null });
  }

  handleOpenEdit() {
    this.setState({ openEdit: true });
    this.handlePopoverClose();
  }

  handleCloseEdit() {
    this.setState({ openEdit: false });
  }

  onSubmitEdit(data) {
    const inputValues = R.pipe(
      R.assoc(
        'inject_depends_duration',
        data.inject_depends_duration_days * 3600 * 24
          + data.inject_depends_duration_hours * 3600
          + data.inject_depends_duration_minutes * 60
          + data.inject_depends_duration_seconds,
      ),
      R.assoc('inject_tags', R.pluck('id', data.inject_tags)),
      R.dissoc('inject_depends_duration_days'),
      R.dissoc('inject_depends_duration_hours'),
      R.dissoc('inject_depends_duration_minutes'),
      R.dissoc('inject_depends_duration_seconds'),
    )(data);
    return this.props
      .updateInject(
        this.props.exerciseId,
        this.props.inject.inject_id,
        inputValues,
      )
      .then(() => this.handleCloseEdit());
  }

  handleOpenDelete() {
    this.setState({ openDelete: true });
    this.handlePopoverClose();
  }

  handleCloseDelete() {
    this.setState({ openDelete: false });
  }

  submitDelete() {
    this.props.deleteInject(this.props.inject.inject_id);
    this.handleCloseDelete();
  }

  render() {
    const { t, inject, injectTypes } = this.props;
    const injectTags = inject.tags.map((tag) => ({
      id: tag.tag_id,
      label: tag.tag_name,
      color: tag.tag_color,
    }));
    const duration = splitDuration(inject.inject_depends_duration || 0);
    const initialValues = R.pipe(
      R.assoc('inject_tags', injectTags),
      R.pick([
        'inject_title',
        'inject_type',
        'inject_description',
        'inject_tags',
        'inject_content',
        'inject_all_audiences',
        'inject_country',
        'inject_city',
      ]),
      R.assoc('inject_depends_duration_days', duration.days),
      R.assoc('inject_depends_duration_hours', duration.hours),
      R.assoc('inject_depends_duration_minutes', duration.minutes),
      R.assoc('inject_depends_duration_seconds', duration.seconds),
    )(inject);
    return (
      <div>
        <IconButton
          onClick={this.handlePopoverOpen.bind(this)}
          aria-haspopup="true"
          size="large"
        >
          <MoreVert />
        </IconButton>
        <Menu
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handlePopoverClose.bind(this)}
        >
          <MenuItem onClick={this.handleOpenEdit.bind(this)}>
            {t('Update')}
          </MenuItem>
          <MenuItem onClick={this.handleOpenDelete.bind(this)}>
            {t('Delete')}
          </MenuItem>
        </Menu>
        <Dialog
          open={this.state.openDelete}
          TransitionComponent={Transition}
          onClose={this.handleCloseDelete.bind(this)}
        >
          <DialogContent>
            <DialogContentText>
              {t('Do you want to delete this inject?')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="secondary"
              onClick={this.handleCloseDelete.bind(this)}
            >
              {t('Cancel')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.submitDelete.bind(this)}
            >
              {t('Delete')}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          TransitionComponent={Transition}
          open={this.state.openEdit}
          onClose={this.handleCloseEdit.bind(this)}
          fullWidth={true}
          maxWidth="md"
        >
          <DialogTitle>{t('Update the inject')}</DialogTitle>
          <DialogContent>
            <InjectForm
              initialValues={initialValues}
              editing={true}
              injectTypes={injectTypes}
              onSubmit={this.onSubmitEdit.bind(this)}
              handleClose={this.handleCloseEdit.bind(this)}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

InjectPopover.propTypes = {
  t: PropTypes.func,
  exerciseId: PropTypes.string,
  inject: PropTypes.object,
  updateInject: PropTypes.func,
  deleteInject: PropTypes.func,
  injectTypes: PropTypes.array,
};

export default R.compose(
  connect(null, { updateInject, deleteInject }),
  inject18n,
)(InjectPopover);
