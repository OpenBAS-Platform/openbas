import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import { MoreVert, PersonOutlined } from '@mui/icons-material';
import { withStyles } from '@mui/styles';
import { deleteGroup, fetchGroup, updateGroupInformation, updateGroupUsers } from '../../../../actions/Group';
import { addGrant, addGroupOrganization, deleteGrant, deleteGroupOrganization } from '../../../../actions/Grant';
import GroupForm from './GroupForm';
import SearchFilter from '../../../../components/SearchFilter';
import inject18n from '../../../../components/i18n';
import { storeHelper } from '../../../../actions/Schema';
import Transition from '../../../../components/common/Transition';
import ItemTags from '../../../../components/ItemTags';
import TagsFilter from '../../common/filters/TagsFilter';
import { resolveUserName, truncate } from '../../../../utils/String';
import Drawer from '../../../../components/common/Drawer';

const styles = () => ({
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

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box style={{ padding: 0, marginTop: 20 }} sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
};

class GroupPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDelete: false,
      tabSelect: 0,
      openEdit: false,
      openUsers: false,
      openGrants: false,
      openPopover: false,
      keyword: '',
      tags: [],
      usersIds: props.groupUsersIds,
    };
  }

  handlePopoverOpen(event) {
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

  async onSubmitEdit(data) {
    return this.props
      .updateGroupInformation(this.props.group.group_id, data)
      .then((result) => {
        if (this.props.onUpdate) {
          const groupUpdated = result.entities.groups[result.result];
          this.props.onUpdate(groupUpdated);
        }
        this.setState({ openEdit: false });
      });
  }

  handleOpenUsers() {
    this.setState({ openUsers: true, usersIds: this.props.groupUsersIds });
    this.handlePopoverClose();
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

  handleCloseUsers() {
    this.setState({ openUsers: false, keyword: '' });
  }

  submitUpdateUsers() {
    this.props.updateGroupUsers(this.props.group.group_id, {
      group_users: this.state.usersIds,
    }).then(this.fetchAndUpdateGroup.bind(this));
    this.handleCloseUsers();
  }

  handleOpenGrants() {
    this.setState({ openGrants: true });
    this.handlePopoverClose();
  }

  handleCloseGrants() {
    this.setState({ openGrants: false });
  }

  handleTabChange(event, tabKey) {
    this.setState({ tabSelect: tabKey });
  }

  fetchAndUpdateGroup() {
    this.props.fetchGroup(this.props.group.group_id).then((result) => {
      if (this.props.onUpdate) {
        this.props.onUpdate(result.entities.groups[this.props.group.group_id]);
      }
    });
  }

  handleGrantCheck(data, grantId, event) {
    const isChecked = event.target.checked;
    if (isChecked) {
      this.props
        .addGrant(this.props.group.group_id, data)
        .then(this.fetchAndUpdateGroup.bind(this));
    }
    // the grand does not exist
    if (!isChecked && grantId !== null) {
      this.props
        .deleteGrant(this.props.group.group_id, grantId)
        .then(this.fetchAndUpdateGroup.bind(this));
    }
  }

  handleGrantScenarioCheck(scenarioId, grantId, grantName, event) {
    const data = {
      grant_name: grantName,
      grant_scenario: scenarioId,
    };
    this.handleGrantCheck(data, grantId, event);
  }

  handleGrantExerciseCheck(exerciseId, grantId, grantName, event) {
    const data = {
      grant_name: grantName,
      grant_exercise: exerciseId,
    };
    this.handleGrantCheck(data, grantId, event);
  }

  handleGrantOrganization(organizationId, event) {
    const isChecked = event.target.checked;
    if (isChecked) {
      this.props
        .addGroupOrganization(this.props.group.group_id, {
          organization_id: organizationId,
        })
        .then(() => {
          this.props.fetchGroup(this.props.group.group_id);
        });
    }
    // the grand does not exist
    if (!isChecked && organizationId !== null) {
      this.props
        .deleteGroupOrganization(this.props.group.group_id, organizationId)
        .then(() => {
          this.props.fetchGroup(this.props.group.group_id);
        });
    }
  }

  handleOpenDelete() {
    this.setState({ openDelete: true });
    this.handlePopoverClose();
  }

  handleCloseDelete() {
    this.setState({ openDelete: false });
  }

  submitDelete() {
    this.props.deleteGroup(this.props.group.group_id).then(
      () => {
        if (this.props.onDelete) {
          this.props.onDelete(this.props.group.group_id);
        }
      },
    );
    this.handleCloseDelete();
  }

  render() {
    const { classes, t, usersMap, group, organizationsMap } = this.props;
    const initialValues = R.pick(
      [
        'group_name',
        'group_description',
        'group_default_user_assign',
        'group_default_scenario_observer',
        'group_default_scenario_planner',
        'group_default_exercise_planner',
        'group_default_exercise_observer',
      ],
      group,
    );
    const { keyword, tags } = this.state;
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
      <>
        <IconButton
          color="primary"
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
          <MenuItem onClick={this.handleOpenUsers.bind(this)}>
            {t('Manage users')}
          </MenuItem>
          <MenuItem onClick={this.handleOpenGrants.bind(this)}>
            {t('Manage grants')}
          </MenuItem>
          <MenuItem onClick={this.handleOpenDelete.bind(this)}>
            {t('Delete')}
          </MenuItem>
        </Menu>
        <Dialog
          open={this.state.openDelete}
          TransitionComponent={Transition}
          onClose={this.handleCloseDelete.bind(this)}
          PaperProps={{ elevation: 1 }}
        >
          <DialogContent>
            <DialogContentText>
              {t('Do you want to delete this group?')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCloseDelete.bind(this)}>
              {t('Cancel')}
            </Button>
            <Button color="secondary" onClick={this.submitDelete.bind(this)}>
              {t('Delete')}
            </Button>
          </DialogActions>
        </Dialog>
        <Drawer
          open={this.state.openEdit}
          handleClose={this.handleCloseEdit.bind(this)}
          title={t('Update the group')}
        >
          <GroupForm
            initialValues={initialValues}
            editing={true}
            onSubmit={this.onSubmitEdit.bind(this)}
            handleClose={this.handleCloseEdit.bind(this)}
          />
        </Drawer>
        <Drawer
          open={this.state.openUsers}
          handleClose={this.handleCloseUsers.bind(this)}
          title={t('Manage the users of this group')}
        >
          <>
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
                    const disabled = this.state.usersIds.includes(user.user_id);
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
                        label={user ? truncate(resolveUserName(user), 22) : '-'}
                        avatar={<Avatar src={userGravatar} size={32} />}
                        classes={{ root: classes.chip }}
                      />
                    );
                  })}
                </Box>
              </Grid>
            </Grid>
            <div style={{ float: 'right', marginTop: 20 }}>
              <Button variant="contained" style={{ marginRight: 10 }} onClick={this.handleCloseUsers.bind(this)}>
                {t('Cancel')}
              </Button>
              <Button variant="contained" color="secondary" onClick={this.submitUpdateUsers.bind(this)}>
                {t('Update')}
              </Button>
            </div>
          </>
        </Drawer>
        <Drawer
          open={this.state.openGrants}
          handleClose={this.handleCloseGrants.bind(this)}
          title={t('Manage grants')}
        >
          <>
            <Tabs
              value={this.state.tabSelect}
              onChange={this.handleTabChange.bind(this)}
              textColor="secondary"
              indicatorColor="secondary"
              aria-label="secondary tabs example"
            >
              <Tab label="Scenarios" />
              <Tab label="Simulations" />
              <Tab label="Organizations" />
            </Tabs>
            <TabPanel value={this.state.tabSelect} index={0}>
              <Table selectable={false} size="small">
                <TableHead adjustForCheckbox={false} displaySelectAll={false}>
                  <TableRow>
                    <TableCell>{t('Scenario')}</TableCell>
                    <TableCell style={{ textAlign: 'center' }}>
                      {t('Read/Write')}
                    </TableCell>
                    <TableCell style={{ textAlign: 'center' }}>
                      {t('Read Only')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody displayRowCheckbox={false}>
                  {this.props.scenarios.map((scenario) => {
                    const grantPlanner = R.find(
                      (g) => g.grant_scenario === scenario.scenario_id
                        && g.grant_name === 'PLANNER',
                    )(group.group_grants);
                    const grantObserver = R.find(
                      (g) => g.grant_scenario === scenario.scenario_id
                        && g.grant_name === 'OBSERVER',
                    )(group.group_grants);
                    const grantPlannerId = R.propOr(
                      null,
                      'grant_id',
                      grantPlanner,
                    );
                    const grantObserverId = R.propOr(
                      null,
                      'grant_id',
                      grantObserver,
                    );
                    return (
                      <TableRow key={scenario.scenario_id}>
                        <TableCell style={{ width: '60%' }}>{scenario.scenario_name}</TableCell>
                        <TableCell style={{ width: '20%', textAlign: 'center' }}>
                          <Checkbox
                            checked={grantPlannerId !== null}
                            onChange={this.handleGrantScenarioCheck.bind(
                              this,
                              scenario.scenario_id,
                              grantPlannerId,
                              'PLANNER',
                            )}
                          />
                        </TableCell>
                        <TableCell style={{ width: '20%', textAlign: 'center' }}>
                          <Checkbox
                            checked={
                              grantObserverId !== null
                              || grantPlannerId !== null
                            }
                            disabled={grantPlannerId !== null}
                            onChange={this.handleGrantScenarioCheck.bind(
                              this,
                              scenario.scenario_id,
                              grantObserverId,
                              'OBSERVER',
                            )}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabPanel>
            <TabPanel value={this.state.tabSelect} index={1}>
              <Table selectable={false} size="small">
                <TableHead adjustForCheckbox={false} displaySelectAll={false}>
                  <TableRow>
                    <TableCell>{t('Simulation')}</TableCell>
                    <TableCell style={{ textAlign: 'center' }}>
                      {t('Read/Write')}
                    </TableCell>
                    <TableCell style={{ textAlign: 'center' }}>
                      {t('Read Only')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody displayRowCheckbox={false}>
                  {this.props.exercises.map((exercise) => {
                    const grantPlanner = R.find(
                      (g) => g.grant_exercise === exercise.exercise_id
                        && g.grant_name === 'PLANNER',
                    )(group.group_grants);
                    const grantObserver = R.find(
                      (g) => g.grant_exercise === exercise.exercise_id
                        && g.grant_name === 'OBSERVER',
                    )(group.group_grants);
                    const grantPlannerId = R.propOr(
                      null,
                      'grant_id',
                      grantPlanner,
                    );
                    const grantObserverId = R.propOr(
                      null,
                      'grant_id',
                      grantObserver,
                    );
                    return (
                      <TableRow key={exercise.exercise_id}>
                        <TableCell style={{ width: '60%' }}>{exercise.exercise_name}</TableCell>
                        <TableCell style={{ width: '20%', textAlign: 'center' }}>
                          <Checkbox
                            checked={grantPlannerId !== null}
                            onChange={this.handleGrantExerciseCheck.bind(
                              this,
                              exercise.exercise_id,
                              grantPlannerId,
                              'PLANNER',
                            )}
                          />
                        </TableCell>
                        <TableCell style={{ width: '20%', textAlign: 'center' }}>
                          <Checkbox
                            checked={
                              grantObserverId !== null
                              || grantPlannerId !== null
                            }
                            disabled={grantPlannerId !== null}
                            onChange={this.handleGrantExerciseCheck.bind(
                              this,
                              exercise.exercise_id,
                              grantObserverId,
                              'OBSERVER',
                            )}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabPanel>
            <TabPanel value={this.state.tabSelect} index={2}>
              <Table selectable={false} size="small">
                <TableHead adjustForCheckbox={false} displaySelectAll={false}>
                  <TableRow>
                    <TableCell>{t('Organization')}</TableCell>
                    <TableCell style={{ textAlign: 'center' }}>
                      {t('Granted')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody displayRowCheckbox={false}>
                  {this.props.organizations.map((organization) => {
                    const isOrgaChecked = (
                      this.props.group.group_organizations ?? []
                    ).includes(organization.organization_id);
                    return (
                      <TableRow key={organization.organization_id}>
                        <TableCell>{organization.organization_name}</TableCell>
                        <TableCell style={{ textAlign: 'center' }}>
                          <Checkbox
                            checked={isOrgaChecked}
                            onChange={this.handleGrantOrganization.bind(
                              this,
                              organization.organization_id,
                            )}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabPanel>
            <div style={{ float: 'right', marginTop: 20 }}>
              <Button variant="contained" onClick={this.handleCloseGrants.bind(this)}>
                {t('Close')}
              </Button>
            </div>
          </>
        </Drawer>
      </>
    );
  }
}

GroupPopover.propTypes = {
  t: PropTypes.func,
  group: PropTypes.object,
  fetchGroup: PropTypes.func,
  updateGroupUsers: PropTypes.func,
  updateGroupInformation: PropTypes.func,
  deleteGroup: PropTypes.func,
  addGrant: PropTypes.func,
  addGroupOrganization: PropTypes.func,
  deleteGroupOrganization: PropTypes.func,
  deleteGrant: PropTypes.func,
  groupUsersIds: PropTypes.array,
};

const select = (state) => {
  const helper = storeHelper(state);
  return {
    usersMap: helper.getUsersMap(),
    organizations: helper.getOrganizations(),
    organizationsMap: helper.getOrganizationsMap(),
    exercises: helper.getExercises(),
    scenarios: helper.getScenarios(),
  };
};

export default R.compose(
  connect(select, {
    fetchGroup,
    updateGroupInformation,
    updateGroupUsers,
    deleteGroup,
    addGrant,
    deleteGrant,
    addGroupOrganization,
    deleteGroupOrganization,
  }),
  inject18n,
  withStyles(styles),
)(GroupPopover);
