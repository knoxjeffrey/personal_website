// import d3 from "~/javascripts/dashboard/LineChart_modules"
import * as d3 from "d3"
import { targetLineValues, minAxisValues } from "~/javascripts/dashboard/utils"

export default class Histogram {
  constructor(selectedData, selectedContext, metric, wrapper) {
    this.selectedData = selectedData
    this.selectedContext = selectedContext
    this.metric = metric
    this.wrapper = d3.select(wrapper)
    this.barPadding = 1
    this.dv = {
      yAccessor: null,
      metricAccessor: null,
      yScale: null,
      xScale: null,
      bins: null,
      binGroups: null,
      oldBinGroups: null,
      newBinGroups: null,
      bounds: null
    }
    this.dimensions = {
      width: parseInt(this.wrapper.style("width"), 10),
      height: 400,
      margin: {
        top: 15,
        right: 20,
        bottom: 40,
        left: 10,
      }
    }
    this.dimensions.boundedWidth = this.dimensions.width
      - this.dimensions.margin.left
      - this.dimensions.margin.right
    this.dimensions.boundedHeight = this.dimensions.height
      - this.dimensions.margin.top
      - this.dimensions.margin.bottom
  }

  createDataVis() {
    this.initialiseAccessors()
    this.setScales()
    this.initialiseDataVis()
    this.setGenerators()
    this.drawData()
  }

  updateDataVis(selectedData, selectedContext) {
    this.selectedData = selectedData
    this.selectedContext = selectedContext
  
    this.setScales()
    this.setGenerators()
    this.drawData()
  }

  initialiseAccessors() {
    this.dv.yAccessor = d => d.length
    this.dv.metricAccessor = d => d[this.metric]
  }

  setScales() {
    this.dv.xScale = d3.scaleLinear()
      .domain([
        0, d3.max(
          [minAxisValues(this.selectedContext), d3.max(this.selectedData.map(data => data[this.metric]))
        ])
      ])
      .range([0, this.dimensions.boundedWidth])
      .nice()

    const binsGenerator = d3.bin()
      .domain(this.dv.xScale.domain())
      .value(this.dv.metricAccessor)
      .thresholds(20)

    this.dv.bins = binsGenerator(this.selectedData)

    this.dv.yScale = d3.scaleLinear()
      .domain([0, d3.max(this.dv.bins, this.dv.yAccessor)])
      .range([this.dimensions.boundedHeight, 0])
      .nice()
  }

  initialiseDataVis() {
    // Draw canvas
    const wrapper = this.wrapper
      .append("svg")
        .attr("width", this.dimensions.width)
        .attr("height", this.dimensions.height)

    this.dv.bounds = wrapper.append("g")
        .style(
          "transform",
          `translate(${this.dimensions.margin.left}px, ${this.dimensions.margin.top}px)`
        )

    // init static elements
    this.dv.bounds.append("g")
        .attr("class", "bins")
    this.dv.bounds.append("line")
        .attr("class", "histogram--success-line")
        .attr("x1", this.dv.xScale(0))
        .attr("x2", this.dv.xScale(0))
        .attr("y1", -20)
        .attr("y2", this.dimensions.boundedHeight)
    this.dv.bounds.append("line")
        .attr("class", "histogram--fail-line")
        .attr("x1", this.dv.xScale(0))
        .attr("x2", this.dv.xScale(0))
        .attr("y1", -20)
        .attr("y2", this.dimensions.boundedHeight)
    this.dv.bounds.append("g")
        .attr("class", "histogram--x-axis")
        .style("transform", `translateY(${this.dimensions.boundedHeight}px)`)
      .append("text")
        .attr("class", "histogram--x-axis-label")
  }

  setGenerators() {
    const xAxisGenerator = d3.axisBottom()
      .scale(this.dv.xScale)
  
    const xAxis = this.dv.bounds.select(".histogram--x-axis")
      .transition(this.updateTransition())
      .call(xAxisGenerator)

    const xAxisLabel = xAxis.select(".histogram--x-axis-label")
        .attr("x", this.dimensions.boundedWidth / 2)
        .attr("y", this.dimensions.margin.bottom )
        .text(this.selectedContext.toUpperCase())
  }

  drawData() {
    this.dv.binGroups = this.dv.bounds.select(".bins")
      .selectAll(".bin")
      .data(this.dv.bins)

    this.oldBinGroups()
    this.newBinGroups()
    this.animateBinGroups()
    this.kpiLineTransition()
  }

  oldBinGroups() {
    this.dv.oldBinGroups = this.dv.binGroups.exit()
    this.dv.oldBinGroups.selectAll("rect")
      .style("fill", "red")
      .transition(this.exitTransition())
      .attr("height", 0)
      .attr("y", d => this.dimensions.boundedHeight)
    this.dv.oldBinGroups.selectAll("text")
      .transition(this.exitTransition())
      .attr("y", this.dimensions.boundedHeight)
    this.dv.oldBinGroups.transition(this.exitTransition())
      .remove()
  }

  newBinGroups() {
    this.dv.newBinGroups = this.dv.binGroups.enter().append("g")
        .attr("class", "bin")
    this.dv.newBinGroups.append("rect")
        .attr("x", d => this.dv.xScale(d.x0) + this.barPadding)
        .attr("y", d => this.dimensions.boundedHeight)
        .attr("width", d => d3.max([
          0,
          this.dv.xScale(d.x1) - this.dv.xScale(d.x0) - this.barPadding
        ]))
        .attr("height", 0)
        .style("fill", "yellowgreen")
    this.dv.newBinGroups.append("text")
      .attr("x", d => this.dv.xScale(d.x0) + (this.dv.xScale(d.x1) - this.dv.xScale(d.x0)) / 2)
      .attr("y", this.dimensions.boundedHeight)
  }

  animateBinGroups() {
    this.dv.binGroups = this.dv.newBinGroups.merge(this.dv.binGroups)

    const barRects = this.dv.binGroups.select("rect")
      .transition(this.updateTransition())
        .attr("x", d => this.dv.xScale(d.x0) + this.barPadding)
        .attr("y", d => this.dv.yScale(this.dv.yAccessor(d)))
        .attr("width", d => d3.max([
          0,
          this.dv.xScale(d.x1) - this.dv.xScale(d.x0) - this.barPadding
        ]))
        .attr("height", d => this.dimensions.boundedHeight - this.dv.yScale(this.dv.yAccessor(d)))
        .transition()
          .style("fill", "cornflowerblue")

    const barText = this.dv.binGroups.select("text")
      .transition(this.updateTransition())
        .attr("x", d => this.dv.xScale(d.x0) + (this.dv.xScale(d.x1) - this.dv.xScale(d.x0)) / 2)
        .attr("y", d => this.dv.yScale(this.dv.yAccessor(d)) - 5)
        .text(function(d) {
          return d.length > 0 ? d.length : null
        })
        .attr("class", "histogram--bar-text")
  }

  kpiLineTransition() {
    const lineValues = targetLineValues(this.selectedContext)
    console.log(lineValues)
    this.dv.bounds.select(".histogram--success-line")
      .transition(this.updateTransition())
        .attr("x1", this.dv.xScale(lineValues.successLineValue))
        .attr("x2", this.dv.xScale(lineValues.successLineValue))
        .attr("y1", -20)
        .attr("y2", this.dimensions.boundedHeight)

    this.dv.bounds.select(".histogram--fail-line")
        .transition().duration(250)
        .attr("x1", this.dv.xScale(lineValues.failLineValue))
        .attr("x2", this.dv.xScale(lineValues.failLineValue))
        .attr("y1", -20)
        .attr("y2", this.dimensions.boundedHeight)
  }

  updateTransition() {
    d3.transition()
      .duration(250)
      .delay(500)
      .ease(d3.easeCubicInOut)
  }

  exitTransition() {
    d3.transition()
      .duration(250)
      .ease(d3.easeCubicInOut)
  }
}
