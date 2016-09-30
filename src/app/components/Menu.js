import React, {PropTypes} from 'react';
import MUIMenu from 'material-ui/Menu';

export const Menu = (props) => (
  <MUIMenu
    multiple={props.multiple}
  />
)

Menu.propTypes = {
  multiple: PropTypes.bool
}