import '../../static/css/leaflet.css';

import { withStyles, withTheme } from '@mui/styles';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { GeoJSON, MapContainer, TileLayer } from 'react-leaflet';
import { connect } from 'react-redux';

import { storeHelper } from '../../actions/Schema';
import Loader from '../../components/Loader';
import countries from '../../static/geo/countries.json';

const styles = () => ({
  paper: {
    height: '100%',
    minHeight: '100%',
    margin: '10px 0 0 0',
    padding: 0,
    borderRadius: 4,
  },
});

const colors = [
  '#fff59d',
  '#ffe082',
  '#ffb300',
  '#ffb74d',
  '#fb8c00',
  '#d95f00',
  '#e64a19',
  '#f44336',
  '#d32f2f',
  '#b71c1c',
];

const MiniMap = (props) => {
  const { parameters, center, zoom, theme, usersByLocationLevels } = props;
  if (R.isEmpty(parameters) || R.isNil(parameters)) {
    return <Loader variant="inElement" />;
  }
  const getStyle = (feature) => {
    if (usersByLocationLevels[feature.properties.ISO3]) {
      const country = usersByLocationLevels[feature.properties.ISO3];
      return {
        color: country.level ? colors[country.level] : colors[5],
        weight: 1,
        fillOpacity: props.theme.palette.mode === 'light' ? 0.5 : 0.1,
      };
    }
    return { fillOpacity: 0, color: 'none' };
  };
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
        <GeoJSON data={countries} style={getStyle} />
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
  const parameters = helper.getPlatformSettings() ?? {};
  return { parameters };
};

export default R.compose(
  connect(select, null),
  withTheme,
  withStyles(styles),
)(MiniMap);
