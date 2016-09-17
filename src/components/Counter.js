import React, {Component, PropTypes} from 'react';
import {Button} from './Button';

export default class Counter extends Component {
  static propTypes = {
    increment: PropTypes.func.isRequired,
    decrement: PropTypes.func.isRequired,
    counter: PropTypes.object
  };

  render() {
    const {increment, decrement, counter} = this.props;
    return (
      <div>
        Clicked: {counter.get('count')} times
        <ul>
          {counter.get('lines').map(function(val, i){
            return <li key={i}>{val}</li>;
          })}
        </ul>
        {' '}
        <Button label="+" onClick={increment}/>
        {' '}
        <Button label="-" onClick={decrement}/>
      </div>
    );
  }
}