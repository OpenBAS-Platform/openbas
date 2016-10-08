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
  title: {
    margin: '5px 0 5px 0',
    fontSize: 25,
    fontWeight: 600,
    fontVariant: 'small-caps',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 300,
    color: '#808080'
  },
  body: function (image) {
    return {
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
    height: 30,
    width: 380
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
      <div style={styles.title}>{props.name}</div>
      <div style={styles.subtitle}>{props.subtitle}</div>
    </div>
    <div style={styles.body(props.image)}>
      <div className="exerciseHover" style={styles.hover}>
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