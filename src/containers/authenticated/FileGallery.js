import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import R from 'ramda'
import * as Constants from '../../constants/ComponentTypes'
import {fetchFiles, addFile} from '../../actions/File'
import {IconButton} from '../../components/Button'
import {GridList, GridTile} from '../../components/GridList'
import {Icon} from '../../components/Icon'
import {FloatingActionsButtonCreate} from '../../components/Button';

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  }
}

class FileGallery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openUpload: false
    }
  }

  componentDidMount() {
    this.props.fetchFiles();
  }

  openFileDialog() {
    this.refs.fileUpload.click()
  }

  handleFileChange() {
    let data = new FormData();
    data.append('file', this.refs.fileUpload.files[0])
    this.props.addFile(data)
    this.handleCloseUpload()
  }

  handleFileSelect(file) {
    this.props.fileSelector(file)
  }

  render() {
    return (
      <div style={styles.root}>
        <GridList cellHeight={180} padding={20} type={Constants.GRIDLIST_TYPE_GALLERY}>
          {R.values(this.props.files).map(file => {
            return (
              <GridTile
                key={file.file_id}
                title={file.file_name}
                actionIcon={
                  <IconButton onClick={this.handleFileSelect.bind(this, file)}>
                    <Icon color="white" name={Constants.ICON_NAME_ACTION_ASSIGNMENT_TURNED_IN}/>
                  </IconButton>
                }>
                {file.file_type === 'png' || file.file_type === 'jpg' || file.file_type === 'gif' ?
                  <img src={file.file_url} alt="Gallery"/> : <img src="../../public" alt="Gallery"/>}
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
  addFile: PropTypes.func
}

const select = (state) => {
  return {
    files: state.referential.entities.files
  }
}

export default connect(select, {fetchFiles, addFile})(FileGallery);