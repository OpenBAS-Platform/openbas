import React from 'react';
import * as PropTypes from 'prop-types';
import withStyles from '@mui/styles/withStyles';
import Paper from '@mui/material/Paper';
import { Map, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import * as R from 'ramda';
import { connect } from 'react-redux';
import { storeBrowser } from '../../../actions/Schema';

const styles = () => ({
  paper: {
    height: '100%',
    minHeight: '100%',
    margin: '10px 0 0 0',
    padding: 0,
    borderRadius: 8,
  },
});

const injectIcon = new L.Icon({
  iconUrl: '/images/inject.png',
  iconRetinaUrl: '/images/inject.png',
  iconAnchor: [5, 55],
  popupAnchor: [10, -44],
  iconSize: [20, 20],
});

const playerIcon = new L.Icon({
  iconUrl: '/images/person.png',
  iconRetinaUrl: '/images/person.png',
  iconAnchor: [5, 55],
  popupAnchor: [10, -44],
  iconSize: [50, 50],
});

const MiniMap = (props) => {
  const { parameters } = props;
  const {
    center, zoom, classes, injects, users,
  } = props;
  return (
    <div style={{ width: '100%', height: 400 }}>
      <Paper classes={{ root: classes.paper }} elevation={2}>
        <Map
          center={center}
          zoom={zoom}
          attributionControl={false}
          zoomControl={false}
        >
          <TileLayer url={parameters.map_tile_server} />
          {R.filter(
            (n) => n.inject_latitude && n.inject_longitude,
            injects || [],
          ).map((inject) => (
            <Marker
              key={inject.inject_id}
              position={[inject.inject_latitude, inject.inject_longitude]}
              icon={injectIcon}
            />
          ))}
          {R.filter(
            (n) => n.user_latitude && n.user_longitude,
            users || [],
          ).map((user) => (
            <Marker
              key={user.user_id}
              position={[user.user_latitude, user.user_longitude]}
              icon={playerIcon}
            />
          ))}
        </Map>
      </Paper>
    </div>
  );
};

MiniMap.propTypes = {
  center: PropTypes.array,
  users: PropTypes.array,
  injects: PropTypes.array,
  zoom: PropTypes.number,
  classes: PropTypes.object,
  t: PropTypes.func,
  fd: PropTypes.func,
  history: PropTypes.object,
};

const select = (state) => {
  const browser = storeBrowser(state);
  const parameters = browser.getSettings() ?? {};
  return { parameters };
};

export default R.compose(connect(select, null), withStyles(styles))(MiniMap);
