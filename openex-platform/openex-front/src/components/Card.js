import React from 'react';
import PropTypes from 'prop-types';
import MUICard from '@material-ui/core/Card';
import MUICardHeader from '@material-ui/core/CardHeader';
import MUICardMedia from '@material-ui/core/CardMedia';
import MUICardContent from '@material-ui/core/CardContent';

export const Card = (props) => <MUICard>{props.children}</MUICard>;

Card.propTypes = {
  children: PropTypes.node,
};

export const CardHeader = (props) => (
  <MUICardHeader
    title={props.title}
    subtitle={props.subtitle}
    avatar={props.avatar}
  />
);

CardHeader.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  avatar: PropTypes.element,
};

export const CardMedia = (props) => (
  <MUICardMedia overlay={props.overlay}>{props.children}</MUICardMedia>
);

CardMedia.propTypes = {
  overlay: PropTypes.element,
  children: PropTypes.node,
};

export const CardTitle = (props) => (
  <MUICardHeader
    title={props.title}
    titleColor={props.titleColor}
    subtitle={props.subtitle}
    subtitleColor={props.subtitleColor}
  />
);

CardTitle.propTypes = {
  title: PropTypes.string,
  titleColor: PropTypes.string,
  subtitle: PropTypes.string,
  subtitleColor: PropTypes.string,
};

export const CardText = (props) => <MUICardContent>{props.children}</MUICardContent>;

CardText.propTypes = {
  children: PropTypes.node,
};

export const CardActions = (props) => (
  <CardActions>{props.children}</CardActions>
);

CardActions.propTypes = {
  children: PropTypes.node,
};
