import React, {PropTypes} from 'react';
import MUICheckbox from 'material-ui/Checkbox';

export const Checkbox = (props) => (
  <MUICheckbox
    label={props.label}
    onCheck={props.onCheck}
    defaultChecked={props.defaultChecked}
  />
)

Checkbox.propTypes = {
  label: PropTypes.node,
  defaultChecked: PropTypes.bool,
  onCheck: PropTypes.func,
}