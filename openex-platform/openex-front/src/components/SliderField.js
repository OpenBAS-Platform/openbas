import React from 'react';
import PropTypes from 'prop-types';
import MUISlider from '@material-ui/core/Slider';
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
      // eslint-disable-next-line no-unused-expressions
      onSliderChange && onSliderChange(event, newValue);
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
