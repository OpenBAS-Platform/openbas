import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
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
    var data = new FormData();
    data.append('file', this.refs.fileUpload.files[0])
    this.props.addFile(data)
    this.handleCloseUpload()
  }

  handleFileSelect(file) {
    this.props.imageSelector(file)
  }

  render() {
    return (
      <div style={styles.root}>
        <GridList cellHeight={180} padding={20} type={Constants.GRIDLIST_TYPE_GALLERY}>
          {this.props.files.toList().map(file => {
            return (
              <GridTile
                key={file.get('file_id')}
                title={file.get('file_name')}
                actionIcon={
                  <IconButton onClick={this.handleFileSelect.bind(this, file)}>
                    <Icon color="white"
                          name={Constants.ICON_NAME_ACTION_ASSIGNMENT_TURNED_IN}/>
                  </IconButton>
                }
              >
                <img src={file.get('file_url')} alt="Gallery"/>
              </GridTile>
            )
          })}
        </GridList>
        <FloatingActionsButtonCreate onClick={this.openFileDialog.bind(this)}/>
        <input type="file" ref="fileUpload" style={{"display" : "none"}}  onChange={this.handleFileChange.bind(this)} />
      </div>
    );
  }
}

FileGallery.propTypes = {
  files: PropTypes.object,
  fetchFiles: PropTypes.func,
  imageSelector: PropTypes.func,
  addFile: PropTypes.func
}

const select = (state) => {
  return {
    files: state.application.getIn(['entities', 'files']),
  }
}

export default connect(select, {fetchFiles, addFile})(FileGallery);