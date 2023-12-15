import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { Button, Slide, Chip, Avatar, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, Box, ListItemIcon, Grid, Fab } from '@mui/material';
import { Add, PersonOutlined } from '@mui/icons-material';
import withStyles from '@mui/styles/withStyles';
import { updateAudiencePlayers } from '../../../../actions/Audience';
import SearchFilter from '../../../../components/SearchFilter';
import inject18n from '../../../../components/i18n';
import { storeHelper } from '../../../../actions/Schema';
import { fetchPlayers } from '../../../../actions/User';
import CreatePlayer from '../../players/CreatePlayer';
import { resolveUserName, truncate } from '../../../../utils/String';
import { isExerciseReadOnly } from '../../../../utils/Exercise';
import ItemTags from '../../../../components/ItemTags';
import TagsFilter from '../../../../components/TagsFilter';

const styles = () => ({
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
      tags: [],
    };
  }

  componentDidMount() {
    this.props.fetchPlayers();
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

  handleAddTag(value) {
    if (value) {
      this.setState({ tags: [value] });
    }
  }

  handleClearTag() {
    this.setState({ tags: [] });
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
      classes,
      t,
      usersMap,
      audienceUsersIds,
      exercise,
      organizationsMap,
    } = this.props;
    const { keyword, usersIds, tags } = this.state;
    const filterByKeyword = (n) => keyword === ''
      || (n.user_email || '').toLowerCase().indexOf(keyword.toLowerCase())
        !== -1
      || (n.user_firstname || '').toLowerCase().indexOf(keyword.toLowerCase())
        !== -1
      || (n.user_lastname || '').toLowerCase().indexOf(keyword.toLowerCase())
        !== -1
      || (n.user_phone || '').toLowerCase().indexOf(keyword.toLowerCase())
        !== -1
      || (n.organization_name || '')
        .toLowerCase()
        .indexOf(keyword.toLowerCase()) !== -1
      || (n.organization_description || '')
        .toLowerCase()
        .indexOf(keyword.toLowerCase()) !== -1;
    const filteredUsers = R.pipe(
      R.map((u) => ({
        organization_name:
          organizationsMap[u.user_organization]?.organization_name ?? '-',
        organization_description:
          organizationsMap[u.user_organization]?.organization_description
          ?? '-',
        ...u,
      })),
      R.filter(
        (n) => tags.length === 0
          || R.any(
            (filter) => R.includes(filter, n.user_tags),
            R.pluck('id', tags),
          ),
      ),
      R.filter(filterByKeyword),
      R.take(10),
    )(R.values(usersMap));
    return (
      <div>
        <Fab
          onClick={this.handleOpen.bind(this)}
          color="primary"
          aria-label="Add"
          className={classes.createButton}
          disabled={isExerciseReadOnly(exercise)}
        >
          <Add />
        </Fab>
        <Dialog
          open={this.state.open}
          TransitionComponent={Transition}
          onClose={this.handleClose.bind(this)}
          fullWidth={true}
          maxWidth="lg"
          PaperProps={{
            elevation: 1,
            sx: {
              minHeight: 580,
              maxHeight: 580,
            },
          }}
        >
          <DialogTitle>{t('Add players in this audience')}</DialogTitle>
          <DialogContent>
            <Grid container={true} spacing={3} style={{ marginTop: -15 }}>
              <Grid item={true} xs={8}>
                <Grid container={true} spacing={3}>
                  <Grid item={true} xs={6}>
                    <SearchFilter
                      onChange={this.handleSearchUsers.bind(this)}
                      fullWidth={true}
                    />
                  </Grid>
                  <Grid item={true} xs={6}>
                    <TagsFilter
                      onAddTag={this.handleAddTag.bind(this)}
                      onClearTag={this.handleClearTag.bind(this)}
                      currentTags={tags}
                      fullWidth={true}
                    />
                  </Grid>
                </Grid>
                <List>
                  {filteredUsers.map((user) => {
                    const disabled = usersIds.includes(user.user_id)
                      || audienceUsersIds.includes(user.user_id);
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
                          primary={resolveUserName(user)}
                          secondary={user.organization_name}
                        />
                        <ItemTags variant="list" tags={user.user_tags} />
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
                    const user = usersMap[userId];
                    const userGravatar = R.propOr('-', 'user_gravatar', user);
                    return (
                      <Chip
                        key={userId}
                        onDelete={this.removeUser.bind(this, userId)}
                        label={truncate(resolveUserName(user), 22)}
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
            <Button onClick={this.handleClose.bind(this)}>{t('Cancel')}</Button>
            <Button color="secondary" onClick={this.submitAddUsers.bind(this)}>
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
  exercise: PropTypes.object,
  audienceId: PropTypes.string,
  updateAudiencePlayers: PropTypes.func,
  fetchPlayers: PropTypes.func,
  organizations: PropTypes.array,
  usersMap: PropTypes.object,
  audienceUsersIds: PropTypes.array,
};

const select = (state, ownProps) => {
  const helper = storeHelper(state);
  const { exerciseId } = ownProps;
  return {
    exercise: helper.getExercise(exerciseId),
    usersMap: helper.getUsersMap(),
    organizationsMap: helper.getOrganizationsMap(),
  };
};

export default R.compose(
  connect(select, { updateAudiencePlayers, fetchPlayers }),
  inject18n,
  withStyles(styles),
)(AudienceAddPlayers);
