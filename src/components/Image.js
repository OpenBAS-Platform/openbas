import React, {Component, PropTypes} from "react"
import {connect} from "react-redux"
import {dataFile} from "../actions/File"

//Region background Image
class ReactBackgroundImage extends Component {

  constructor(props) {
    super(props);
    this.state = {imgData: null}
  }

  componentDidMount() {
    let _this = this
    let urlCreator = window.URL || window.webkitURL
    this.props.dataFile(this.props.image_id)
      .then(response => _this.setState({imgData: urlCreator.createObjectURL(response.data)}))
  }

  buildStyle() {
    return Object.assign({}, this.props.style, {
      backgroundImage: 'url("' + (this.state.imgData ? this.state.imgData : '/images/file_icon.png') + '")',
      backgroundSize: '100%',
      backgroundRepeat: 'none',
      backgroundPosition: 'top'
    })
  }

  render() {
    return (<div style={this.buildStyle()}>{this.props.children}</div>)
  }
}

ReactBackgroundImage.propTypes = {
  image_id: PropTypes.string,
  style: PropTypes.object,
  dataFile: PropTypes.func,
  children: React.PropTypes.node
}

export const BackgroundImage = connect(null, {dataFile})(ReactBackgroundImage);
//endregion

//Region image
class ReactImage extends Component {

  constructor(props) {
    super(props);
    this.state = {imgData: null}
  }

  componentDidMount() {
    let _this = this
    let urlCreator = window.URL || window.webkitURL
    this.props.dataFile(this.props.image_id)
      .then(response => _this.setState({imgData: urlCreator.createObjectURL(response.data)}))
  }

  render() {
    return (
      <img onClick={this.props.onClick} src={this.state.imgData ? this.state.imgData : '/images/file_icon.png'}
           style={this.props.style} alt={this.props.alt} />
    )
  }
}

ReactImage.propTypes = {
  image_id: PropTypes.string,
  alt: PropTypes.string,
  style: PropTypes.object,
  onClick: PropTypes.func,
  dataFile: PropTypes.func,
}

export const Image = connect(null, {dataFile})(ReactImage);
//endregion