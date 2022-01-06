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
import { updateAudience, deleteAudience } from '../../../../actions/Audience';
import { updateInjectAudiences } from '../../../../actions/Inject';
import inject18n from '../../../../components/i18n';
import AudienceForm from './AudienceForm';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

class AudiencePopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDelete: false,
      openEdit: false,
      openRemove: false,
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
      R.assoc('audience_tags', R.pluck('id', data.audience_tags)),
    )(data);
    return this.props
      .updateAudience(
        this.props.exerciseId,
        this.props.audience.audience_id,
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
    this.props.deleteAudience(
      this.props.exerciseId,
      this.props.audience.audience_id,
    );
    this.handleCloseDelete();
  }

  handleOpenRemove() {
    this.setState({ openRemove: true });
    this.handlePopoverClose();
  }

  handleCloseRemove() {
    this.setState({ openRemove: false });
  }

  submitRemove() {
    this.props.updateInjectAudiences(
      this.props.exerciseId,
      this.props.injectId,
      {
        inject_audiences: R.filter(
          (n) => n !== this.props.audience.audience_id,
          this.props.injectAudiencesIds,
        ),
      },
    );
    this.handleCloseRemove();
  }

  render() {
    const { t, audience, injectId } = this.props;
    const audienceTags = audience.tags.map((tag) => ({
      id: tag.tag_id,
      label: tag.tag_name,
      color: tag.tag_color,
    }));
    const initialValues = R.pipe(
      R.assoc('audience_tags', audienceTags),
      R.pick(['audience_name', 'audience_description', 'audience_tags']),
    )(audience);
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
          {injectId && (
            <MenuItem onClick={this.handleOpenRemove.bind(this)}>
              {t('Remove from the inject')}
            </MenuItem>
          )}
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
              {t('Do you want to delete this audience?')}
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
          <DialogTitle>{t('Update the audience')}</DialogTitle>
          <DialogContent>
            <AudienceForm
              initialValues={initialValues}
              editing={true}
              onSubmit={this.onSubmitEdit.bind(this)}
              handleClose={this.handleCloseEdit.bind(this)}
            />
          </DialogContent>
        </Dialog>
        <Dialog
          open={this.state.openRemove}
          TransitionComponent={Transition}
          onClose={this.handleCloseRemove.bind(this)}
        >
          <DialogContent>
            <DialogContentText>
              {t('Do you want to remove the audience from the inject?')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="secondary"
              onClick={this.handleCloseRemove.bind(this)}
            >
              {t('Cancel')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.submitRemove.bind(this)}
            >
              {t('Remove')}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

AudiencePopover.propTypes = {
  t: PropTypes.func,
  exerciseId: PropTypes.string,
  audience: PropTypes.object,
  updateAudience: PropTypes.func,
  deleteAudience: PropTypes.func,
  updateInjectAudiences: PropTypes.func,
  injectId: PropTypes.string,
  injectAudiencesIds: PropTypes.string,
};

export default R.compose(
  connect(null, { updateAudience, deleteAudience, updateInjectAudiences }),
  inject18n,
)(AudiencePopover);
