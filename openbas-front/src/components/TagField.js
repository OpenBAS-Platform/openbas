import { LabelOutlined } from '@mui/icons-material';
import { Box, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { withStyles } from '@mui/styles';
import * as R from 'ramda';
import { Component } from 'react';
import { connect } from 'react-redux';

import { storeHelper } from '../actions/Schema';
import { addTag, fetchTags } from '../actions/Tag';
import TagForm from '../admin/components/settings/tags/TagForm';
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

class TagField extends Component {
  constructor(props) {
    super(props);
    this.state = { tagCreation: false, tagInput: '' };
  }

  componentDidMount() {
    this.props.fetchTags();
  }

  handleOpenTagCreation() {
    this.setState({ tagCreation: true });
  }

  handleCloseTagCreation() {
    this.setState({ tagCreation: false });
  }

  onSubmit(data) {
    const { name, setFieldValue, values } = this.props;
    this.props.addTag(data).then((result) => {
      if (result.result) {
        const newTag = result.entities.tags[result.result];
        const tags = R.append(
          {
            id: newTag.tag_id,
            label: newTag.tag_name,
            color: newTag.tag_color,
          },
          values[name],
        );
        setFieldValue(name, tags);
        return this.handleCloseTagCreation();
      }
      return result;
    });
  }

  render() {
    const {
      t,
      name,
      tags,
      classes,
      onKeyDown,
      style,
      label,
      placeholder,
      userAdmin,
      disabled,
    } = this.props;
    const tagsOptions = R.map(
      n => ({
        id: n.tag_id,
        label: n.tag_name,
        color: n.tag_color,
      }),
      tags,
    );
    return (
      <>
        <Autocomplete
          variant="standard"
          size="small"
          name={name}
          fullWidth={true}
          multiple={true}
          disabled={disabled}
          label={label}
          placeholder={placeholder}
          options={tagsOptions}
          style={style}
          openCreate={userAdmin && !disabled ? this.handleOpenTagCreation.bind(this) : null}
          onKeyDown={onKeyDown}
          renderOption={(props, option) => (
            <Box component="li" {...props} key={option.id}>
              <div className={classes.icon} style={{ color: option.color }}>
                <LabelOutlined />
              </div>
              <div className={classes.text}>{option.label}</div>
            </Box>
          )}
          classes={{ clearIndicator: classes.autoCompleteIndicator }}
        />
        {userAdmin && (
          <Dialog
            open={this.state.tagCreation}
            onClose={this.handleCloseTagCreation.bind(this)}
            PaperProps={{ elevation: 1 }}
          >
            <DialogTitle>{t('Create a new tag')}</DialogTitle>
            <DialogContent>
              <TagForm
                onSubmit={this.onSubmit.bind(this)}
                handleClose={this.handleCloseTagCreation.bind(this)}
              />
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  }
}

const select = (state) => {
  const helper = storeHelper(state);
  return {
    tags: helper.getTags(),
    userAdmin: helper.getMe()?.user_admin ?? false,
  };
};

export default R.compose(
  connect(select, { fetchTags, addTag }),
  inject18n,
  withStyles(styles),
)(TagField);
