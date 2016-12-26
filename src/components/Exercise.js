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
  subHeader: {
    width: '100%',
    fontWeight: 400,
    color: '#616161',
    height: '30px'
  },
  title: {
    margin: '5px 0 5px 0',
    fontSize: '25px',
    fontWeight: 600,
    fontVariant: 'small-caps',
  },
  subtitle: {
    fontSize: '14px',
    fontWeight: 300,
    color: '#808080'
  },
  body: function (image) {
    return {
      backgroundImage: 'url("' + image + '")',
      backgroundSize: '100%',
      height: '150px',
      position: 'relative'
    }
  },
  hover: {
    position: 'absolute',
    bottom: 0,
    padding: '10px',
    backgroundColor: 'rgba(0, 0, 0, .7)',
    width: '380px'
  },
  description: {
    padding: 0,
    margin: 0,
    color: '#ffffff',
    fontWeight: 400,
    fontSize: '13px'
  },
  line: {
    position: 'relative',
  },
  dateLeft: {
    fontSize: '13px',
    position: 'absolute',
    top: '8px',
    left: '8px'
  },
  dateRight: {
    fontSize: '13px',
    position: 'absolute',
    top: '8px',
    right: '8px'
  }
}

export const Exercise = (props) => (
  <Paper className="exercise" type={Constants.PAPER_TYPE_EXERCISE} zDepth={4}>
    <div style={styles.header}>
      <div style={styles.title}>{props.name}</div>
      <div style={styles.subtitle}>{props.subtitle}</div>
      </div>
    <div style={styles.subHeader}>
      <div style={styles.line}>
        <div style={styles.dateLeft}>{props.startDate}</div>
        <div className="line">
          <ul>
            <li></li>
            <li></li>
          </ul>
        </div>
        <div style={styles.dateRight}>{props.endDate}</div>
        <div className="clearfix"></div>
      </div>
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
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  status: PropTypes.string,
  image: PropTypes.string
}