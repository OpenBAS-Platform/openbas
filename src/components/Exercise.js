import React, {PropTypes} from 'react';
import * as Constants from "../constants/ComponentTypes";
import {Paper} from './Paper'

const styles = {
  header: {
    width: '100%',
    borderBottom: '1px solid #e6e6e6',
    fontWeight: 400,
    padding: '10px 0 10px 0',
    color: '#616161',
  },
  body: function (image) {
    return {
      textAlign: 'left',
      backgroundImage: 'url("' + image + '")',
      height: 150,
      position: 'relative'
    }
  },
  hover: {
    position: 'absolute',
    bottom: 0,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, .6)',
    height: 30
  },
  description: {
    padding: 0,
    margin: 0,
    color: '#ffffff',
    fontWeight: 400,
    fontSize: 14
  }
}

export const Exercise = (props) => (
  <Paper className="exercise" type={Constants.PAPER_TYPE_EXERCISE}>
    <div style={styles.header}>
      <h3>{props.name}</h3>
      <h5>{props.subtitle}</h5>
    </div>
    <div style={styles.body(props.image)}>
      <div style={styles.hover}>
        <p style={styles.description}>{props.description}</p>
      </div>
    </div>
  </Paper>
)

Exercise.propTypes = {
  name: PropTypes.string,
  subtitle: PropTypes.string,
  description: PropTypes.string,
  organizer: PropTypes.string,
  organizerLogo: PropTypes.string,
  image: PropTypes.string
}