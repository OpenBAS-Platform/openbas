import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Button from '@mui/material/Button';
import Slide from '@mui/material/Slide';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Add, PersonOutlined } from '@mui/icons-material';
import Box from '@mui/material/Box';
import withStyles from '@mui/styles/withStyles';
import { ListItemIcon } from '@mui/material';
import Grid from '@mui/material/Grid';
import Fab from '@mui/material/Fab';
import { interval } from 'rxjs';
import { updateAudiencePlayers } from '../../../../actions/Audience';
import SearchFilter from '../../../../components/SearchFilter';
import inject18n from '../../../../components/i18n';
import { storeBrowser } from '../../../../actions/Schema';
import { fetchPlayers } from '../../../../actions/User';
import { FIVE_SECONDS } from '../../../../utils/Time';
import CreatePlayer from '../../players/CreatePlayer';
import { resolveUserName } from '../../../../utils/String';

const interval$ = interval(FIVE_SECONDS);

const styles = (theme) => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
  },
  box: {
    width: '100%',
    minHeight: '100%',
    padding: 20,
    border: '1px dashed rgba(255, 255, 255, 0.3)',
  },
  chip: {
    margin: '0 10px 10px 0',
  },
  text: {
    fontSize: 15,
    color: theme.palette.primary.main,
    fontWeight: 800,
  },
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

class AudienceAddPlayers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      keyword: '',
      usersIds: [],
    };
  }

  componentDidMount() {
    this.props.fetchPlayers();
    this.subscription = interval$.subscribe(() => {
      this.props.fetchPlayers();
    });
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    this.setState({ open: false, keyword: '', usersIds: [] });
  }

  handleSearchUsers(value) {
    this.setState({ keyword: value });
  }

  addUser(userId) {
    this.setState({ usersIds: R.append(userId, this.state.usersIds) });
  }

  removeUser(userId) {
    this.setState({
      usersIds: R.filter((u) => u !== userId, this.state.usersIds),
    });
  }

  submitAddUsers() {
    this.props.updateAudiencePlayers(
      this.props.exerciseId,
      this.props.audienceId,
      {
        audience_users: R.uniq([
          ...this.props.audienceUsersIds,
          ...this.state.usersIds,
        ]),
      },
    );
    this.handleClose();
  }

  onCreate(result) {
    this.addUser(result);
  }

  render() {
    const {
      classes, t, users, audienceUsersIds,
    } = this.props;
    const { keyword, usersIds } = this.state;
    const filterByKeyword = (n) => keyword === ''
      || (n.user_email || '').toLowerCase().indexOf(keyword.toLowerCase())
        !== -1
      || (n.user_firstname || '').toLowerCase().indexOf(keyword.toLowerCase())
        !== -1
      || (n.user_lastname || '').toLowerCase().indexOf(keyword.toLowerCase())
        !== -1
      || (n.user_phone || '').toLowerCase().indexOf(keyword.toLowerCase())
        !== -1
      || (n.user_organization || '')
        .toLowerCase()
        .indexOf(keyword.toLowerCase()) !== -1;
    const filteredUsers = R.pipe(R.filter(filterByKeyword), R.take(5))(users);
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
          keepMounted={true}
          onClose={this.handleClose.bind(this)}
          fullWidth={true}
          maxWidth="md"
          PaperProps={{
            sx: {
              minHeight: 540,
              maxHeight: 540,
            },
          }}
        >
          <DialogTitle>{t('Add players in this audience')}</DialogTitle>
          <DialogContent>
            <Grid container={true} spacing={3}>
              <Grid item={true} xs={8}>
                <SearchFilter
                  onChange={this.handleSearchUsers.bind(this)}
                  fullWidth={true}
                />
                <List>
                  {filteredUsers.map((user) => {
                    const disabled = usersIds.includes(user.user_id)
                      || audienceUsersIds.includes(user.user_id);
                    const organizationName = R.propOr(
                      '-',
                      'organization_name',
                      user.getOrganization(),
                    );
                    return (
                      <ListItem
                        key={user.user_id}
                        disabled={disabled}
                        button={true}
                        divider={true}
                        dense={true}
                        onClick={this.addUser.bind(this, user.user_id)}
                      >
                        <ListItemIcon>
                          <PersonOutlined />
                        </ListItemIcon>
                        <ListItemText
                          primary={user.user_email}
                          secondary={organizationName}
                        />
                      </ListItem>
                    );
                  })}
                  <CreatePlayer
                    inline={true}
                    onCreate={this.onCreate.bind(this)}
                  />
                </List>
              </Grid>
              <Grid item={true} xs={4}>
                <Box className={classes.box}>
                  {this.state.usersIds.map((userId) => {
                    const user = this.props.browser.getUser(userId);
                    const userGravatar = R.propOr('-', 'user_gravatar', user);
                    return (
                      <Chip
                        key={userId}
                        onDelete={this.removeUser.bind(this, userId)}
                        label={resolveUserName(user)}
                        avatar={<Avatar src={userGravatar} size={32} />}
                        classes={{ root: classes.chip }}
                      />
                    );
                  })}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="secondary"
              onClick={this.handleClose.bind(this)}
            >
              {t('Cancel')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.submitAddUsers.bind(this)}
            >
              {t('Add')}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

AudienceAddPlayers.propTypes = {
  t: PropTypes.func,
  exerciseId: PropTypes.string,
  audienceId: PropTypes.string,
  updateAudiencePlayers: PropTypes.func,
  fetchPlayers: PropTypes.func,
  organizations: PropTypes.array,
  users: PropTypes.array,
  audienceUsersIds: PropTypes.array,
};

const select = (state) => {
  const browser = storeBrowser(state);
  const users = browser.getUsers();
  const organizations = browser.getOrganizations();
  return {
    users,
    organizations,
    browser,
  };
};

export default R.compose(
  connect(select, { updateAudiencePlayers, fetchPlayers }),
  inject18n,
  withStyles(styles),
)(AudienceAddPlayers);
