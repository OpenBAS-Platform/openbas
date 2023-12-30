import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import withStyles from '@mui/styles/withStyles';
import { Fab, Dialog, DialogTitle, DialogContent, Slide, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Add, ControlPointOutlined } from '@mui/icons-material';
import TeamForm from './TeamForm';
import { addTeam } from '../../../../actions/Team';
import inject18n from '../../../../components/i18n';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const styles = (theme) => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 230,
  },
  text: {
    fontSize: 15,
    color: theme.palette.primary.main,
    fontWeight: 500,
  },
});

class CreateTeam extends Component {
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
      R.assoc('team_tags', R.pluck('id', data.team_tags)),
    )(data);
    return this.props
      .addTeam(this.props.exerciseId, inputValues)
      .then((result) => {
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
    const { classes, t, inline } = this.props;
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
              primary={t('Create a new team')}
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
          PaperProps={{ elevation: 1 }}
        >
          <DialogTitle>{t('Create a new team')}</DialogTitle>
          <DialogContent>
            <TeamForm
              onSubmit={this.onSubmit.bind(this)}
              initialValues={{ team_tags: [] }}
              handleClose={this.handleClose.bind(this)}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

CreateTeam.propTypes = {
  exerciseId: PropTypes.string,
  classes: PropTypes.object,
  t: PropTypes.func,
  addTeam: PropTypes.func,
  inline: PropTypes.bool,
  onCreate: PropTypes.func,
};

export default R.compose(
  connect(null, { addTeam }),
  inject18n,
  withStyles(styles),
)(CreateTeam);
