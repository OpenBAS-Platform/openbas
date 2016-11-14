import React, {PropTypes} from 'react';
import * as Constants from "../constants/ComponentTypes";
import {Paper} from './Paper'

const styles = {
  header: {
    width: '100%',
    height: '80px',
    borderBottom: '1px solid #e6e6e6',
    fontWeight: 400,
    padding: '15px 0 10px 0',
    color: '#616161',
  },
  title: {
    padding: '0 8px 0 8px',
    margin: 0,
    height: '30px',
    fontSize: '16px',
    fontWeight: 600
  },
  description: {
    padding: 0,
    margin: 0,
    height: '40px',
    fontWeight: 400,
    fontSize: '13px',
    display: 'flex',
  },
  descriptionContent: {
    padding: '0 8px 0 8px',
    margin: 'auto',
  },
  body: function (image) {
    return {
      backgroundImage: 'url("' + image + '")',
      backgroundSize: '100%',
      height: '100px',
      position: 'relative'
    }
  }
}

export const Event = (props) => (
  <Paper className="event" type={Constants.PAPER_TYPE_EVENT} zDepth={4}>
    <div style={styles.header}>
      <div style={styles.title}>{props.title}</div>
      <div style={styles.description}><div style={styles.descriptionContent}>{props.description}</div></div>
    </div>
    <div style={styles.body(props.image)}></div>
  </Paper>
)

Event.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string
}