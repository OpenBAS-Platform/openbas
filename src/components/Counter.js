import React, {Component, PropTypes} from 'react';

export default class CounterElem extends Component {
  static propTypes = {
    increment: PropTypes.func.isRequired,
    decrement: PropTypes.func.isRequired
  };

  render() {
    const {increment, decrement, count, lines} = this.props;
    return (
      <div>
        Clicked: {count} times
        <ul>
          {lines.map(function(val, i){
            return <li key={i}>{val}</li>;
          })}
        </ul>
        {' '}
        <button onClick={increment}>+</button>
        {' '}
        <button onClick={decrement}>-</button>
      </div>
    );
  }
}