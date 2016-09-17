import React from 'react';
import {Link} from 'react-router';
import RaisedButton from 'material-ui/RaisedButton';

const style = {
  margin: 5,
};

export const Button = (props) => (
  <RaisedButton primary={true}
                label={props.label}
                type={props.type}
                onClick={props.onClick}
                style={style}/>
);

export const LinkButton = (props) => (
  <RaisedButton primary={true}
                containerElement={<Link to={props.to}/>}
                label={props.label}
                style={style}/>
)