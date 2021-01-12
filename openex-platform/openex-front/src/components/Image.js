import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// eslint-disable-next-line import/no-cycle
import { dataFile } from '../actions/File';

// Region background Image
class ReactBackgroundImage extends Component {
  constructor(props) {
    super(props);
    this.state = { imgData: null };
  }

  fetchImageData(imageId) {
    // eslint-disable-next-line no-underscore-dangle
    const _this = this;
    const urlCreator = window.URL || window.webkitURL;
    this.props
      .dataFile(imageId)
      .then((response) => _this.setState({ imgData: urlCreator.createObjectURL(response.data) }));
  }

  componentDidMount() {
    this.fetchImageData(this.props.image_id);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.image_id !== this.props.image_id) {
      this.fetchImageData(this.props.image_id);
    }
  }

  buildStyle() {
    return {
      ...this.props.style,
      backgroundImage:
        `url("${
          this.state.imgData ? this.state.imgData : '/images/file_icon.png'
        }")`,
      backgroundSize: '100%',
      backgroundRepeat: 'none',
      backgroundPosition: 'top',
    };
  }

  render() {
    return <div style={this.buildStyle()}>{this.props.children}</div>;
  }
}

ReactBackgroundImage.propTypes = {
  image_id: PropTypes.string,
  style: PropTypes.object,
  dataFile: PropTypes.func,
  children: PropTypes.node,
};

export const BackgroundImage = connect(null, { dataFile })(
  ReactBackgroundImage,
);
// endregion

// Region image
class ReactImage extends Component {
  constructor(props) {
    super(props);
    this.state = { imgData: null };
  }

  fetchImageData(imageId) {
    // eslint-disable-next-line no-underscore-dangle
    const _this = this;
    const urlCreator = window.URL || window.webkitURL;
    this.props
      .dataFile(imageId)
      .then((response) => _this.setState({ imgData: urlCreator.createObjectURL(response.data) }));
  }

  componentDidMount() {
    this.fetchImageData(this.props.image_id);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.image_id !== this.props.image_id) {
      this.fetchImageData(this.props.image_id);
    }
  }

  render() {
    return (
      <img
        onClick={this.props.onClick}
        src={this.state.imgData ? this.state.imgData : '/images/file_icon.png'}
        style={this.props.style}
        alt={this.props.alt}
      />
    );
  }
}

ReactImage.propTypes = {
  image_id: PropTypes.string,
  alt: PropTypes.string,
  style: PropTypes.object,
  onClick: PropTypes.func,
  dataFile: PropTypes.func,
};

export const Image = connect(null, { dataFile })(ReactImage);
// endregion
