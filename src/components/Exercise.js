import React, {PropTypes} from 'react';

const styles = {
  exercise: {
    display: 'inline-block',
    border: '1px solid #e6e6e6',
    margin: 20,
    width: 400,
    height: 300,
    borderRadius: 2,
    cubicBezier: '(0.23, 1, 0.32, 1) 0ms',
    boxSizing: 'border-box',
    boxShadow: 'rgba(0, 0, 0, .5)'
  },
  header: {
    width: '100%',
    borderBottom: '1px solid #e6e6e6',
    fontSize: 13,
    padding: '10px 0 10px 0',
    color: '#616161'
  },
  body: {

  }
}

export const Exercise = (props) => (
  <div style={styles.exercise}>
    <div style={styles.header}>
      {props.organizer}
    </div>
  </div>
)

Exercise.propTypes = {
  name: PropTypes.string,
  subtitle: PropTypes.string,
  description: PropTypes.string,
  organizer: PropTypes.string,
  organizerLogo: PropTypes.string,
  image: PropTypes.string
}