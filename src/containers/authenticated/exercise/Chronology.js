import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {scaleLinear} from 'd3-scale'
import {line} from 'd3-shape'

var data = {
  series1: [{x: 0, y: 20}, {x: 1, y: 30}, {x: 2, y: 10}, {x: 3, y: 5}, {x: 4, y: 8}, {x: 5, y: 15}, {x: 6, y: 10}],
  series2: [{x: 0, y: 8}, {x: 1, y: 5}, {x: 2, y: 20}, {x: 3, y: 12}, {x: 4, y: 4}, {x: 5, y: 6}, {x: 6, y: 2}],
  series3: [{x: 0, y: 0}, {x: 1, y: 5}, {x: 2, y: 8}, {x: 3, y: 2}, {x: 4, y: 6}, {x: 5, y: 4}, {x: 6, y: 2}]
};

class Line extends Component {
  render() {
    return (
      <path d={this.props.path} stroke={this.props.color} strokeWidth={5} fill="none"/>
    );
  }
}
Line.propTypes = {
  color: PropTypes.string,
  path: PropTypes.string
}

class DataSeries extends Component {
  render() {
    var props = this.props, yScale = props.yScale, xScale = props.xScale
    var path = line().x(d => xScale(d.x)).y(d => yScale(d.y))
    return (
      <Line path={path(this.props.data)} color={this.props.color}/>
    )
  }
}
DataSeries.propTypes = {
  color: PropTypes.string,
  data: PropTypes.array
}

class Chronology extends Component {

  constructor(props) {
    super(props);
    this.state = {width: 0, height: 0}
  }

  updateSize() {
    var parentNode = this.refs.graph.parentNode
    this.setState({
      width: parentNode.clientWidth,
      height: parentNode.clientHeight
    });
  }

  componentDidMount() {
    window.addEventListener('resize', () => this.updateSize())
    this.updateSize()
  }

  render() {
    var xScale = scaleLinear().domain([0, 6]).range([0, this.state.width]);
    var yScale = scaleLinear().domain([0, 30]).range([this.state.height, 0]);
    return (
      <svg ref="graph" width={this.state.width} height={this.state.height}>
        <DataSeries data={data.series1} xScale={xScale} yScale={yScale} ref="series1" color="cornflowerblue"/>
        <DataSeries data={data.series2} xScale={xScale} yScale={yScale} ref="series2" color="red"/>
        <DataSeries data={data.series3} xScale={xScale} yScale={yScale} ref="series3" color="green"/>
      </svg>
    )
  }
}
Chronology.propTypes = {
  width: PropTypes.object,
  height: PropTypes.object,
  children: PropTypes.node
}

export default connect()(Chronology);