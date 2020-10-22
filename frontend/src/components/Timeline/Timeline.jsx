import moment from 'moment';
import React from 'react';
import PropTypes from 'prop-types';
import TimlineItem from './TimlineItem';

/**
 * Converts array of events in to object having date as the key and list of
 * event for that date as the value
 *
 * @param {Array} items Array of events in the form of ts and text
 * @returns {Object} return object with key as date and values array in events for that date
 */
function getFormattedData(items) {
  const activities = {};
  items.forEach(({ts, text}, index) => {
    const date = moment(ts);
    const dateStr = date.format('DD/MM/YYYY');
    const list = activities[dateStr] || [];
    list.push({
      time: date.format('HH:mm'),
      text,
      key: index,
    });
    activities[dateStr] = list;
  });
  return activities;
}

function Timeline({items}) {
  const activities = getFormattedData(items);
  const dates = Object.keys(activities);
  return (
    <div className="time-line-ctnr">
      {dates.map(d =>
        <ul className="time-line" key={d}>
          <li className="time-label">
            <span>
              {d}
            </span>
          </li>
          {activities[d].map(({time, text, key}) =>
            <TimlineItem time={time} text={text} key={key} />,
          )}
        </ul>,
      )}
    </div>
  );
}

Timeline.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    ts: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
  })).isRequired,
};

export default Timeline;
