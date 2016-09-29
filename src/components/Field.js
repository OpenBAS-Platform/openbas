import React, {PropTypes} from 'react';
import TextField from 'material-ui/TextField';

export const Field = (props) => (
    <TextField
        hintText={props.hint}
        floatingLabelText={props.label}
        name={props.name}
        type={props.type}
        onChange={props.onChange}
        floatingLabelFixed={true}
    />
)

Field.propTypes = {
    hint: PropTypes.string,
    label: PropTypes.string,
    name: PropTypes.string.isRequired,
    type: PropTypes.string,
    onChange: PropTypes.func.isRequired
}