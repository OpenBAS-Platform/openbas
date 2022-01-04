import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Fab from '@mui/material/Fab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Slide from '@mui/material/Slide';
import withStyles from '@mui/styles/withStyles';
import { Add, ControlPointOutlined } from '@mui/icons-material';
import { ListItemIcon } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import { addInject, fetchInjectTypes } from '../../../../actions/Inject';
import InjectForm from './InjectForm';
import inject18n from '../../../../components/i18n';
import {storeBrowser} from "../../../../actions/Schema";

const styles = (theme) => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
  },
  text: {
    fontSize: 15,
    color: theme.palette.primary.main,
    fontWeight: 500,
  },
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

class CreateInject extends Component {
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
      R.assoc(
        'inject_organization',
        data.inject_organization && data.inject_organization.id
          ? data.inject_organization.id
          : data.inject_organization,
      ),
      R.assoc('inject_tags', R.pluck('id', data.inject_tags)),
    )(data);
    return this.props.addInject(inputValues).then((result) => {
      if (result.result) {
        if (this.props.onCreate) {
          this.props.onCreate(result.result);
        }
        return this.handleClose();
      }
      return result;
    });
  }

  render() {
    const {
      classes, t, organizations, inline,
    } = this.props;
    return (
      <div>
        {inline === true ? (
          <ListItem
            button={true}
            divider={true}
            onClick={this.handleOpen.bind(this)}
            color="primary"
          >
            <ListItemIcon color="primary">
              <ControlPointOutlined color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={t('Create a new inject')}
              classes={{ primary: classes.text }}
            />
          </ListItem>
        ) : (
          <Fab
            onClick={this.handleOpen.bind(this)}
            color="primary"
            aria-label="Add"
            className={classes.createButton}
          >
            <Add />
          </Fab>
        )}
        <Dialog
          open={this.state.open}
          TransitionComponent={Transition}
          onClose={this.handleClose.bind(this)}
          fullWidth={true}
          maxWidth="md"
        >
          <DialogTitle>{t('Create a new inject')}</DialogTitle>
          <DialogContent>
            <InjectForm
              editing={false}
              onSubmit={this.onSubmit.bind(this)}
              organizations={organizations}
              initialValues={{ inject_tags: [] }}
              handleClose={this.handleClose.bind(this)}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

CreateInject.propTypes = {
  t: PropTypes.func,
  addInject: PropTypes.func,
  fetchInjectTypes: PropTypes.func,
  inline: PropTypes.bool,
  onCreate: PropTypes.func,
  organizations: PropTypes.array,
  inject_types: PropTypes.array,
};

const select = (state) => {
  return {
    inject_types: state.referential.entities.inject_types,
  };
};

export default R.compose(
  connect(select, { addInject, fetchInjectTypes }),
  inject18n,
  withStyles(styles),
)(CreateInject);
