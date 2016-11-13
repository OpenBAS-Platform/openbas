import React from 'react'
import * as d3 from 'd3'
import Faux from 'react-faux-dom'
import {connect} from 'react-redux'
import moment from 'moment'

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

  repeatTimeout() {
    const context = this
    //noinspection Eslint
    this.repeat = setTimeout(function () {
      context.rescale();
      context.repeatTimeout(context);
    }, 5000)
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
    var svgContainer = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .call((currentContainer) => {
        currentContainer
          .attr("viewBox", "0 0 " + width + " " + height)
          .attr("preserveAspectRatio", "xMinYMid")
      })
      .append('g')
      .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')

    svgContainer.append('rect')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'lightblue')
      .style('stroke', 'green')

    var start = moment().subtract(1, 'm')
    var end = moment().add(1, 'm')
    var xScale = d3.scaleTime()
      .domain([start.toDate(), end.toDate()])
      .range([0, width])

    var xAxis = d3.axisTop(xScale).ticks(30)

    var axisComponent = svgContainer.append('g')
      .attr("class", "xaxis")
      .call(xAxis);

    this.rescale = () => {
      var start = moment().subtract(1, 'm')
      var end = moment().add(1, 'm')
      var domain = [start.toDate(), end.toDate()]
      xScale.domain(domain)
      axisComponent.transition().duration(1500).ease(d3.easeSinOut).call(xAxis);
      component.animateFauxDOM(800)
    }

    window.addEventListener('resize', () => {
      var width = wrapper.clientWidth - margin.left - margin.right;
      var height = wrapper.clientHeight - margin.top - margin.bottom;
      svg.attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom)
      svg.attr("height", Math.round(width / aspect));
      component.animateFauxDOM(800)
    })
  },

  render () {
    return (<div ref='wrapper' style={{'height': 300}} className='renderedD3'>{this.state.chart}</div>)
  }
})

export default connect()(Chronos)