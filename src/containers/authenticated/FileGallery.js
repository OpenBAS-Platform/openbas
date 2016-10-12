import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import * as Constants from '../../constants/ComponentTypes'
import {fetchFiles} from '../../actions/File'
import {CircularSpinner} from '../../components/Spinner'
import {IconButton} from '../../components/Button'
import {GridList, GridTile} from '../../components/GridList'
import {Icon} from '../../components/Icon'

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gridList: {
    width: 500,
    height: 450,
    overflowY: 'auto',
  }
}

class FileGallery extends Component {
  componentDidMount() {
    this.props.fetchFiles();
  }

  render() {
    let loading;
    if (this.props.loading) {
      loading = <CircularSpinner />
    }

    return (
      <div style={styles.root}>
        { loading }
        <GridList cellHeight={180} padding={20} style={styles.gridList}>
          {this.props.files.toList().map(file => {
            return (
              <GridTile
                key={file.get('file_id')}
                title={file.get('file_name')}
                actionIcon={<IconButton><Icon color="white" name={Constants.ICON_NAME_ACTION_ASSIGNMENT_TURNED_IN}/></IconButton>}
              >
                <img src={file.get('file_url')} alt="Gallery"/>
              </GridTile>
            )
          })}
        </GridList>
      </div>
    );
  }
}

FileGallery.propTypes = {
  loading: PropTypes.bool,
  files: PropTypes.object,
  fetchFiles: PropTypes.func,
}

const select = (state) => {
  return {
    files: state.application.getIn(['entities', 'files']),
    loading: state.application.getIn(['ui', 'loading'])
  }
}

export default connect(select, {fetchFiles})(FileGallery);