import React, {PropTypes} from 'react';
import * as Constants from '../constants/ComponentTypes'
import {
  Card as MUICard,
  CardActions as MUICardActions,
  CardHeader as MUICardHeader,
  CardMedia as MUICardMedia,
  CardTitle as MUICardTitle,
  CardText as MUICardText
} from 'material-ui/Card';

const cardStyle = {
  width: 400
}

export const Card = (props) => (
  <MUICard style={cardStyle}>{props.children}</MUICard>
)

Card.propTypes = {
  children: PropTypes.node
}

export const CardHeader = (props) => (
  <MUICardHeader
    title={props.title}
    subtitle={props.subtitle}
    avatar={props.avatar}
  />
)

CardHeader.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  avatar: PropTypes.element
}

export const CardMedia = (props) => (
  <MUICardMedia overlay={props.overlay}>
    {props.children}
  </MUICardMedia>
)

CardMedia.propTypes = {
  overlay: PropTypes.element,
  children: PropTypes.node
}

export const CardTitle = (props) => (
  <MUICardTitle title={props.title} titleColor={props.titleColor} subtitle={props.subtitle} subtitleColor={props.subtitleColor} />
)

CardTitle.propTypes = {
  title: PropTypes.string,
  titleColor: PropTypes.string,
  subtitle: PropTypes.string,
  subtitleColor: PropTypes.string
}

export const CardText = (props) => (
  <MUICardText>
    {props.children}
  </MUICardText>
)

CardText.propTypes = {
  children: PropTypes.node
}

export const CardActions = (props) => (
  <CardActions>
    {props.children}
  </CardActions>
)

CardActions.propTypes = {
  children: PropTypes.node
}