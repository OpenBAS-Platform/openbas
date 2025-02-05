import { PersonOutlined } from '@mui/icons-material';
import { Box, Dialog, DialogContent, DialogTitle } from '@mui/material';
import * as R from 'ramda';
import { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from 'tss-react/mui';

import { storeHelper } from '../actions/Schema';
import { addPlayer, fetchPlayers } from '../actions/User';
import PlayerForm from '../admin/components/teams/players/PlayerForm';
import { resolveUserName } from '../utils/String';
import Autocomplete from './Autocomplete';
import inject18n from './i18n';

const styles = () => ({
  icon: {
    paddingTop: 4,
    display: 'inline-block',
  },
  text: {
    display: 'inline-block',
    flexGrow: 1,
    marginLeft: 10,
  },
  autoCompleteIndicator: {
    display: 'none',
  },
});

class PlayerField extends Component {
  constructor(props) {
    super(props);
    this.state = { userCreation: false, userInput: '' };
  }

  componentDidMount() {
    this.props.fetchPlayers();
  }

  handleOpenUserCreation() {
    this.setState({ userCreation: true });
  }

  handleCloseUserCreation() {
    this.setState({ userCreation: false });
  }

  onSubmit(data) {
    const { name, setFieldValue, values } = this.props;
    this.props.addPlayer(data).then((result) => {
      if (result.result) {
        const newUser = result.entities.users[result.result];
        const users = R.append(
          {
            id: newUser.user_id,
            label: resolveUserName(newUser),
          },
          values[name],
        );
        setFieldValue(name, users);
        return this.handleCloseUserCreation();
      }
      return result;
    });
  }

  render() {
    const {
      t,
      name,
      users,
      classes,
      onKeyDown,
      style,
      label,
      placeholder,
      noMargin,
    } = this.props;
    const usersOptions = R.map(
      n => ({
        id: n.user_id,
        label: resolveUserName(n),
      }),
      users,
    );
    return (
      <div>
        <Autocomplete
          variant="standard"
          size="small"
          name={name}
          noMargin={noMargin}
          fullWidth={true}
          multiple={true}
          label={label}
          placeholder={placeholder}
          options={usersOptions}
          style={style}
          openCreate={this.handleOpenUserCreation.bind(this)}
          onKeyDown={onKeyDown}
          renderOption={(props, option) => (
            <Box component="li" {...props} key={option.id}>
              <div className={classes.icon}>
                <PersonOutlined color="primary" />
              </div>
              <div className={classes.text}>{option.label}</div>
            </Box>
          )}
          classes={{ clearIndicator: classes.autoCompleteIndicator }}
        />
        <Dialog
          open={this.state.userCreation}
          onClose={this.handleCloseUserCreation.bind(this)}
        >
          <DialogTitle>{t('Create a new user')}</DialogTitle>
          <DialogContent>
            <PlayerForm
              initialValues={{ user_tags: [] }}
              handleClose={this.handleCloseUserCreation.bind(this)}
              onSubmit={this.onSubmit.bind(this)}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

const select = (state) => {
  const helper = storeHelper(state);
  return {
    users: helper.getUsers(),
  };
};

export default R.compose(
  connect(select, { fetchPlayers, addPlayer }),
  inject18n,
  Component => withStyles(Component, styles),
)(PlayerField);
