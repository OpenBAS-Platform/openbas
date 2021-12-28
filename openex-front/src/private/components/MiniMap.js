import React from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { withStyles } from '@mui/styles';
import { MapContainer, TileLayer } from 'react-leaflet';
import { connect } from 'react-redux';

const styles = () => ({
  paper: {
    height: '100%',
    minHeight: '100%',
    margin: '10px 0 0 0',
    padding: 0,
    borderRadius: 8,
  },
});

const MiniMap = (props) => {
  const { parameters, center, zoom } = props;
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        zoomControl={false}
        attributionControl={false}
        style={{ height: '100%' }}
      >
        <TileLayer url={parameters.map_tile_server} />
      </MapContainer>
    </div>
  );
};

MiniMap.propTypes = {
  center: PropTypes.array,
  zoom: PropTypes.number,
  classes: PropTypes.object,
  history: PropTypes.object,
};

const select = (state) => {
  const parameters = R.propOr(
    {},
    'global',
    state.referential.entities.parameters,
  );
  return { parameters };
};

export default R.compose(connect(select, null), withStyles(styles))(MiniMap);
