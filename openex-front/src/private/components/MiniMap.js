import React from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import withTheme from '@mui/styles/withTheme';
import withStyles from '@mui/styles/withStyles';
import { MapContainer, TileLayer } from 'react-leaflet';
import { connect } from 'react-redux';
import { storeHelper } from '../../actions/Schema';
import Loader from '../../components/Loader';

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
  const { parameters, center, zoom, theme } = props;
  if (R.isEmpty(parameters) || R.isNil(parameters)) {
    return <Loader variant="inElement" />;
  }
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
        <TileLayer
          url={
            theme.palette.mode === 'light'
              ? parameters.map_tile_server_light
              : parameters.map_tile_server_dark
          }
        />
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
  const helper = storeHelper(state);
  const parameters = helper.getSettings() ?? {};
  return { parameters };
};

export default R.compose(
  connect(select, null),
  withTheme,
  withStyles(styles),
)(MiniMap);
