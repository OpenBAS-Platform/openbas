import React from 'react'
import * as d3 from 'd3'
import Faux from 'react-faux-dom'
import {connect} from 'react-redux'
import moment from 'moment'
import {debug} from '../../../../utils/Messages'

const data = []

const Chronos = React.createClass({
  mixins: [Faux.mixins.core, Faux.mixins.anim],

  getInitialState () {
    return {
      chart: 'loading...'
    }
  },

  componentWillMount() {
    this.repeatTimeout()
  },

  componentWillUnmount() {
    //noinspection Eslint
    clearTimeout(this.repeat)
  },

  addLine() {
    data.push({id: Math.random(), date: moment().round(5, 'seconds').toDate(), score: 50})
    this.updateData()
  },

  removeFirst() {
    data.shift()
    this.updateData()
  },

  repeatTimeout() {
    const context = this
    //noinspection Eslint
    this.repeat = setTimeout(function () {
      context.rescale();
      context.repeatTimeout(context);
    }, 5000)
  },

  updateData() {
    var update = this.svg.selectAll('.events')
      .data(data, d => d.id)

    update.exit()
      .transition()
      .duration(450)
      .style('opacity', 0)
      .remove()

    update
      .transition()
      .duration(450)
      .attr('x', d => this.xScale(d.date) -5 )

    update.enter()
      .append('rect')
      .attr('class', 'events')
      .style('opacity', 0)
      .attr('x', d => this.xScale(d.date) -5)
      .attr('y', d => this.yScale(d.score) -5)
      .attr('width', 10).attr('height', 10)
      .transition()
      .duration(1000)
      .style('opacity', 1)

    this.animateFauxDOM(1500)
  },

  componentDidMount () {

    var component = this
    var wrapper = this.refs.wrapper
    const faux = this.connectFauxDOM('div.renderedD3', 'chart')

    var margin = {top: 10, right: 0, bottom: 10, left: 0};
    var width = wrapper.clientWidth - margin.left - margin.right;
    var height = wrapper.clientHeight - margin.top - margin.bottom;
    var aspect = wrapper.clientWidth / wrapper.clientHeight

    var svg = d3.select(faux).append('svg')
    this.svg = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .call((currentContainer) => {
        currentContainer
          .attr("viewBox", "0 0 " + width + " " + height)
          .attr("preserveAspectRatio", "xMinYMid")
      })
      .append('g')
      .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')

    this.svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'lightblue')
      .style('stroke', 'green')

    var start = moment().round(5, 'seconds').subtract(1, 'm')
    var end = moment().round(5, 'seconds').add(1, 'm')
    debug('Boudaries', start.format(), end.format())
    this.xScale = d3.scaleTime()
      .domain([start.toDate(), end.toDate()])
      .range([0, width])

    this.yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0])

    var xAxis = d3.axisTop(this.xScale).ticks(24)

    var axisComponent = this.svg.append('g')
      .attr("class", "xaxis")
      .call(xAxis);

    this.rescale = () => {
      var start = moment().round(5, 'seconds').subtract(1, 'm')
      var end = moment().round(5, 'seconds').add(1, 'm')
      //Rescale and add data
      this.xScale.domain([start.toDate(), end.toDate()])
      this.updateData()
      //Animate the axis
      axisComponent.transition().duration(500).ease(d3.easeSinOut).call(xAxis);
    }

    window.addEventListener('resize', () => {
      var width = wrapper.clientWidth - margin.left - margin.right;
      var height = wrapper.clientHeight - margin.top - margin.bottom;
      svg.attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom)
      svg.attr("height", Math.round(width / aspect));
      component.animateFauxDOM(1500)
    })

    this.addLine()
  },

  render () {
    return (<div ref='wrapper' style={{'height': 300}} className='renderedD3'>
      {this.state.chart}
      <input type="button" onClick={this.addLine} value="load data"/>
      <input type="button" onClick={this.removeFirst} value="remove first"/>
    </div>)
  }
})

export default connect()(Chronos)