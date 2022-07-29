import React, { Component } from 'react';
import * as R from 'ramda';
import { DomainOutlined } from '@mui/icons-material';
import Box from '@mui/material/Box';
import withStyles from '@mui/styles/withStyles';
import { connect } from 'react-redux';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import MediaForm from '../admin/components/medias/MediaForm';
import { fetchMedias, addMedia } from '../actions/Media';
import { Autocomplete } from './Autocomplete';
import inject18n from './i18n';
import { storeHelper } from '../actions/Schema';

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

class MediaField extends Component {
  constructor(props) {
    super(props);
    this.state = { mediaCreation: false, mediaInput: '' };
  }

  componentDidMount() {
    this.props.fetchMedias();
  }

  handleOpenMediaCreation() {
    this.setState({ mediaCreation: true });
  }

  handleCloseMediaCreation() {
    this.setState({ mediaCreation: false });
  }

  onSubmit(data) {
    const { name, setFieldValue } = this.props;
    const inputValues = R.pipe(
      R.assoc('media_tags', R.pluck('id', data.media_tags)),
    )(data);
    this.props.addMedia(inputValues).then((result) => {
      if (result.result) {
        const newMedia = result.entities.medias[result.result];
        const media = {
          id: newMedia.media_id,
          label: newMedia.media_name,
        };
        setFieldValue(name, media);
        return this.handleCloseMediaCreation();
      }
      return result;
    });
  }

  render() {
    const { t, name, medias, classes } = this.props;
    const mediasOptions = R.map(
      (n) => ({
        id: n.media_id,
        label: n.media_name,
      }),
      medias,
    );
    return (
      <div>
        <Autocomplete
          variant="standard"
          size="small"
          name={name}
          fullWidth={true}
          multiple={false}
          label={t('Media')}
          options={mediasOptions}
          style={{ marginTop: 20 }}
          openCreate={this.handleOpenMediaCreation.bind(this)}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <div className={classes.icon}>
                <DomainOutlined />
              </div>
              <div className={classes.text}>{option.label}</div>
            </Box>
          )}
          classes={{ clearIndicator: classes.autoCompleteIndicator }}
        />
        <Dialog
          open={this.state.mediaCreation}
          onClose={this.handleCloseMediaCreation.bind(this)}
          PaperProps={{ elevation: 1 }}
        >
          <DialogTitle>{t('Create a new media')}</DialogTitle>
          <DialogContent>
            <MediaForm
              onSubmit={this.onSubmit.bind(this)}
              initialValues={{ media_tags: [] }}
              handleClose={this.handleCloseMediaCreation.bind(this)}
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
    medias: helper.getMedias(),
  };
};

export default R.compose(
  connect(select, { fetchMedias, addMedia }),
  inject18n,
  withStyles(styles),
)(MediaField);
