import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import withStyles from '@mui/styles/withStyles';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Fab from '@mui/material/Fab';
import { Add, CloudDownloadOutlined, DeleteOutlined } from '@mui/icons-material';
import { i18nRegister } from '../../utils/Messages';
import { T } from '../../components/I18n';
import {
  fetchFiles,
  addFile,
  deleteFile,
  downloadFile,
} from '../../actions/File';
import { Image } from '../../components/Image';

const styles = () => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    overflow: 'hidden',
  },
  createButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
  },
  tile: {
    cursor: 'pointer',
  },
});

i18nRegister({
  fr: {
    'Search for a file': 'Rechercher un fichier',
  },
});

class FileGallery extends Component {
  constructor(props) {
    super(props);
    this.state = { openUpload: false, searchTerm: '' };
  }

  componentDidMount() {
    this.props.fetchFiles();
  }

  handleSearchFiles(event) {
    this.setState({ searchTerm: event.target.value });
  }

  openFileDialog() {
    this.refs.fileUpload.click();
  }

  handleFileChange() {
    const data = new FormData();
    data.append('file', this.refs.fileUpload.files[0]);
    this.props.addFile(data);
  }

  handleFileSelect(file) {
    this.props.fileSelector(file);
  }

  handleFileDelete(fileId) {
    return this.props.deleteFile(fileId);
  }

  handleFileDownload(fileId, fileName) {
    return this.props.downloadFile(fileId, fileName);
  }

  render() {
    const { classes } = this.props;
    const keyword = this.state.searchTerm;
    const filterByKeyword = (n) => keyword === ''
      || n.file_name.toLowerCase().indexOf(keyword.toLowerCase()) !== -1
      || n.file_type.toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
    const filteredFiles = R.filter(filterByKeyword, R.values(this.props.files));
    return (
      <div>
        <TextField
          name="keyword"
          fullWidth={true}
          label={<T>Search for a file</T>}
          onChange={this.handleSearchFiles.bind(this)}
          style={{ marginBottom: 20 }}
        />
        <div className={classes.root}>
          <ImageList cellHeight={180} cols={4}>
            {filteredFiles.map((file) => {
              const type = file.file_type;
              return (
                <ImageListItem key={file.file_id} className={classes.tile}>
                  <ImageListItemBar
                    title={file.file_name}
                    actionIcon={
                      <div style={{ width: 100 }}>
                        <IconButton
                          onClick={this.handleFileDownload.bind(
                            this,
                            file.file_id,
                            file.file_name,
                          )}
                          style={{ color: '#ffffff' }}
                          size="large">
                          <CloudDownloadOutlined />
                        </IconButton>
                        <IconButton
                          onClick={this.handleFileDelete.bind(
                            this,
                            file.file_id,
                          )}
                          style={{ color: '#ffffff' }}
                          size="large">
                          <DeleteOutlined />
                        </IconButton>
                      </div>
                    }
                  />
                  {type === 'image/png'
                  || type === 'image/jpg'
                  || type === 'image/jpeg'
                  || type === 'image/gif' ? (
                    <Image
                      image_id={file.file_id}
                      alt="Gallery"
                      style={styles.image}
                      onClick={this.handleFileSelect.bind(this, file)}
                    />
                    ) : (
                    <img
                      src="/images/file_icon.png"
                      alt="Gallery"
                      style={styles.image}
                      onClick={this.handleFileSelect.bind(this, file)}
                    />
                    )}
                </ImageListItem>
              );
            })}
          </ImageList>
        </div>
        <Fab
          onClick={this.openFileDialog.bind(this)}
          color="secondary"
          aria-label="Add"
          className={classes.createButton}
        >
          <Add />
        </Fab>
        <input
          type="file"
          ref="fileUpload"
          style={{ display: 'none' }}
          onChange={this.handleFileChange.bind(this)}
        />
      </div>
    );
  }
}

FileGallery.propTypes = {
  files: PropTypes.object,
  fetchFiles: PropTypes.func,
  fileSelector: PropTypes.func,
  addFile: PropTypes.func,
  deleteFile: PropTypes.func,
  downloadFile: PropTypes.func,
};

const select = (state) => ({
  files: state.referential.entities.files,
});

export default R.compose(
  connect(select, {
    fetchFiles,
    addFile,
    deleteFile,
    downloadFile,
  }),
  withStyles(styles),
)(FileGallery);
