import { CircularProgress } from '@mui/material';
import { withStyles } from '@mui/styles';
import * as PropTypes from 'prop-types';
import { Component } from 'react';

const styles = () => ({
  container: {
    width: '100vh',
    height: 'calc(100vh-180px)',
    padding: '0 0 0 180px',
  },
  containerInElement: {
    width: '100%',
    height: '100%',
    display: 'table',
  },
  containerInElementTiny: {
    width: 'auto',
  },
  loader: {
    width: '100%',
    margin: 0,
    padding: 0,
    position: 'absolute',
    top: '46%',
    left: 0,
    textAlign: 'center',
    zIndex: 20,
  },
  loaderInElement: {
    width: '100%',
    margin: 0,
    padding: 0,
    display: 'table-cell',
    verticalAlign: 'middle',
    textAlign: 'center',
  },
  loaderCircle: {
    display: 'inline-block',
  },
});

const inElementVariants = ['inElement', 'inElementTiny'];

class Loader extends Component {
  render() {
    const { classes, variant, withRightPadding } = this.props;
    return (
      <div
        className={this.getContainer(variant, classes)}
        style={
          inElementVariants.includes(variant)
            ? { paddingRight: withRightPadding ? 200 : 0 }
            : {}
        }
      >
        <div
          className={
            inElementVariants.includes(variant) ? classes.loaderInElement : classes.loader
          }
          style={
            !inElementVariants.includes(variant)
              ? { paddingRight: withRightPadding ? 100 : 0 }
              : {}
          }
        >
          <CircularProgress
            size={this.getSize(variant)}
            thickness={1}
            className={this.props.classes.loaderCircle}
          />
        </div>
      </div>
    );
  }

  getContainer(variant, classes) {
    if (variant === 'inElement') {
      return classes.containerInElement;
    }
    if (variant === 'inElementTiny') {
      return classes.containerInElementTiny;
    }
    return classes.container;
  }

  getSize(variant) {
    if (variant === 'inElement') {
      return 40;
    }
    if (variant === 'inElementTiny') {
      return '1rem';
    }
    return 80;
  }
}

Loader.propTypes = {
  classes: PropTypes.object.isRequired,
  variant: PropTypes.string,
  withRightPadding: PropTypes.bool,
};

export default withStyles(styles)(Loader);
