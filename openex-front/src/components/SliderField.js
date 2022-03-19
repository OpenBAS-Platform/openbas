import React from 'react';
import * as PropTypes from 'prop-types';
import MUISlider from '@mui/material/Slider';
import { Field } from 'react-final-form';

const renderSliderField = ({
  input, step, min, max, onSliderChange,
}) => (
  <MUISlider
    step={step}
    min={min}
    max={max}
    {...input}
    onDragStart={() => {
      /* disable the dragging propagation */
    }}
    onChange={(event, newValue) => {
      if (onSliderChange) {
        onSliderChange(event, newValue);
      }
      input.onChange(newValue);
    }}
  />
);

renderSliderField.propTypes = {
  input: PropTypes.object,
  name: PropTypes.string,
  step: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
  meta: PropTypes.object,
  onSliderChange: PropTypes.func,
};

// eslint-disable-next-line import/prefer-default-export
export const SliderField = (props) => (
  <Field component={renderSliderField} {...props} />
);
