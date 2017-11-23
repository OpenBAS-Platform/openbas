import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import * as R from 'ramda'
import {i18nRegister} from '../../utils/Messages'
import * as Constants from '../../constants/ComponentTypes'
import {fetchFiles, addFile, deleteFile, downloadFile} from '../../actions/File'
import {IconButton} from '../../components/Button'
import {Image} from '../../components/Image'
import {GridList, GridTile} from '../../components/GridList'
import {Icon} from '../../components/Icon'
import {FloatingActionsButtonCreate} from '../../components/Button';
import {SimpleTextField} from '../../components/SimpleTextField'

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  image: {
    cursor: 'pointer'
  }
}

i18nRegister({
  fr: {
    'Search for a file': 'Rechercher un fichier',
  }
})

class FileGallery extends Component {
  constructor(props) {
    super(props);
    this.state = {openUpload: false, searchTerm: ''}
  }

  componentDidMount() {
    this.props.fetchFiles();
  }

  handleSearchFiles(event, value) {
    this.setState({searchTerm: value})
  }

  openFileDialog() {
    this.refs.fileUpload.click()
  }

  handleFileChange() {
    let data = new FormData();
    data.append('file', this.refs.fileUpload.files[0])
    this.props.addFile(data)
  }

  handleFileSelect(file) {
    this.props.fileSelector(file)
  }

  handleFileDelete(file_id) {
    return this.props.deleteFile(file_id)
  }

  handleFileDownload(file_id, file_name) {
    return this.props.downloadFile(file_id, file_name)
  }

  render() {
    const keyword = this.state.searchTerm
    let filterByKeyword = n => keyword === '' ||
    n.file_name.toLowerCase().indexOf(keyword.toLowerCase()) !== -1 ||
    n.file_type.toLowerCase().indexOf(keyword.toLowerCase()) !== -1
    let filteredFiles = R.filter(filterByKeyword, R.values(this.props.files))

    return (
      <div style={styles.root}>
        <SimpleTextField name="keyword" fullWidth={true} type="text" hintText="Search for a file"
                         onChange={this.handleSearchFiles.bind(this)}
                         styletype={Constants.FIELD_TYPE_INLINE}/>
        <GridList cellHeight={180} padding={20} type={Constants.GRIDLIST_TYPE_GALLERY}>
          {filteredFiles.map(file => {
            let type = file.file_type
            return (
              <GridTile key={file.file_id} title={file.file_name} actionIcon={
                  <div style={{width: '100px'}}>
                    <IconButton onClick={this.handleFileDownload.bind(this, file.file_id, file.file_name)}>
                      <Icon color="white" name={Constants.ICON_NAME_FILE_FILE_DOWNLOAD}/>
                    </IconButton>
                    <IconButton onClick={this.handleFileDelete.bind(this, file.file_id)}>
                      <Icon color="white" name={Constants.ICON_NAME_ACTION_DELETE}/>
                    </IconButton>
                  </div>
                }>
                {type === 'png' || type === 'jpg' || type === 'jpeg' || type === 'gif' ?
                  <Image image_id={file.file_id} alt="Gallery" style={styles.image}
                         onClick={this.handleFileSelect.bind(this, file)} /> :
                  <img src="/images/file_icon.png" alt="Gallery" style={styles.image}
                       onClick={this.handleFileSelect.bind(this, file)}/>}
              </GridTile>
            )
          })}
        </GridList>
        <FloatingActionsButtonCreate onClick={this.openFileDialog.bind(this)} type={Constants.BUTTON_TYPE_FLOATING}/>
        <input type="file" ref="fileUpload" style={{"display": "none"}} onChange={this.handleFileChange.bind(this)}/>
      </div>
    )
  }
}

FileGallery.propTypes = {
  files: PropTypes.object,
  fetchFiles: PropTypes.func,
  fileSelector: PropTypes.func,
  addFile: PropTypes.func,
  deleteFile: PropTypes.func,
  downloadFile: PropTypes.func
}

const select = (state) => {
  return {
    files: state.referential.entities.files
  }
}

export default connect(select, {fetchFiles, addFile, deleteFile, downloadFile})(FileGallery);
