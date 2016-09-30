import React, {PropTypes} from 'react';
import MUIList from 'material-ui/List';

export const List = (props) => (
  <MUIList
    style={props.style}
  />
)

List.propTypes = {
  style: PropTypes.object
}