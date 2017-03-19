import React, {PropTypes} from 'react'
import MUISlider from 'material-ui/Slider'
import {Field} from 'redux-form'

const renderSliderField = ({input, step, min, max, onSliderChange}) => (
  <MUISlider
    step={step}
    min={min}
    max={max}
    {...input}
    onDragStart={() => {/*disable the dragging propagation*/}}
    onChange={(event, newValue) => {
      onSliderChange && onSliderChange(event, newValue)
      input.onChange(newValue)
    }}
  />)

renderSliderField.propTypes = {
  input: PropTypes.object,
  name: PropTypes.string,
  step: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
  meta: PropTypes.object,
  onSliderChange: PropTypes.func,
}

export const SliderField = (props) => (
  <Field component={renderSliderField} {...props}/>
)
