import React from 'react';
import PropTypes from 'prop-types';
import MUIChip from 'material-ui/Chip';

/* TAG LISTE AVAILABLE */
const chipTagListe = {
  float: 'left',
  backgroundColor: 'lightblue',
  marginLeft: '5px',
  marginTop: '5px',
  borderRadius: '6px',
};

const chipTagListeLabelStyle = {
  fontSize: '14px',
  lineHeight: '32px',
};

export const TagListe = (props) => (
  <MUIChip
    style={chipTagListe}
    onClick={props.onClick}
    onRequestDelete={props.onRequestDelete}
    labelStyle={chipTagListeLabelStyle}
  >
    {props.value.length > 25
      ? `${props.value.substring(0, 25)}...`
      : props.value}
  </MUIChip>
);

TagListe.propTypes = {
  value: PropTypes.string,
  onClick: PropTypes.func,
  onRequestDelete: PropTypes.func,
};

const chipSmallTagListe = {
  float: 'left',
  backgroundColor: 'lightblue',
  marginLeft: '3px',
  marginTop: '3px',
  borderRadius: '4px',
};

const chipSmallTagListeLabelStyle = {
  fontSize: '12px',
  lineHeight: '20px',
  paddingLeft: '5px',
  paddingRight: '5px',
};

export const TagSmallListe = (props) => (
  <MUIChip style={chipSmallTagListe} labelStyle={chipSmallTagListeLabelStyle}>
    {props.value.length > 25
      ? `${props.value.substring(0, 25)}...`
      : props.value}
  </MUIChip>
);

TagSmallListe.propTypes = {
  value: PropTypes.string,
};

/* TagExerciseListe */
const chipTagExerciseListe = {
  float: 'left',
  backgroundColor: 'yellowgreen',
  marginLeft: '5px',
  marginTop: '5px',
  borderRadius: '6px',
};

const chipTagExerciseListeLabelStyle = {
  fontSize: '14px',
  lineHeight: '32px',
};

export const TagExerciseListe = (props) => (
  <MUIChip
    style={chipTagExerciseListe}
    onClick={props.onClick}
    labelStyle={chipTagExerciseListeLabelStyle}
  >
    {' '}
    {props.value.length > 25
      ? `${props.value.substring(0, 25)}...`
      : props.value}{' '}
  </MUIChip>
);

TagExerciseListe.propTypes = {
  value: PropTypes.string,
  onClick: PropTypes.func,
};

const chipSmallTagExerciseListe = {
  float: 'left',
  backgroundColor: 'yellowgreen',
  marginLeft: '3px',
  marginTop: '3px',
  borderRadius: '4px',
};

const chipSmallTagExerciseListeLabelStyle = {
  fontSize: '12px',
  lineHeight: '20px',
  paddingLeft: '5px',
  paddingRight: '5px',
};

export const TagSmallExerciseListe = (props) => (
  <MUIChip
    style={chipSmallTagExerciseListe}
    onClick={props.onClick}
    labelStyle={chipSmallTagExerciseListeLabelStyle}
  >
    {' '}
    {props.value.length > 25
      ? `${props.value.substring(0, 25)}...`
      : props.value}{' '}
  </MUIChip>
);

TagSmallExerciseListe.propTypes = {
  value: PropTypes.string,
  onClick: PropTypes.func,
};

/* TAG ADD TO FILTER */
const chipTagAddToFilter = {
  float: 'left',
  margin: '4px',
};

const chipTagAddToFilterLabelStyle = {
  lineHeight: '32px',
};

export const TagAddToFilter = (props) => (
  <MUIChip
    style={chipTagAddToFilter}
    onRequestDelete={props.onRequestDelete}
    labelStyle={chipTagAddToFilterLabelStyle}
  >
    {props.value.length > 25
      ? `${props.value.substring(0, 25)}...`
      : props.value}
  </MUIChip>
);

TagAddToFilter.propTypes = {
  onRequestDelete: PropTypes.func,
  value: PropTypes.string,
};
