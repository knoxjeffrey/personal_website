import { Controller } from "stimulus"
import { subscription } from "~/javascripts/store/mixins/subscription"
import d3 from "~/javascripts/dashboard/d3_modules"

const wrapper = d3.select("[data-viz='wrapper']")
const tooltip = d3.select("[data-viz='tooltip']")
let tooltipCircle

const dv = {
  store: null,
  yAccessor: null,
  xAccessor: null,
  dateAccessor: null,
  deployIdAccessor: null,
  yScale: null,
  xScale: null,
  yAxisGenerator: null,
  xAxisGenerator: null,
  lineGenerator: null,
  bounds: null
}

const dimensions = {
  width: parseInt(wrapper.style("width"), 10),
  height: 400,
  margin: {
    top: 15,
    right: 10,
    bottom: 40,
    left: 20,
  },
}

dimensions.boundedWidth = dimensions.width
  - dimensions.margin.left
  - dimensions.margin.right
dimensions.boundedHeight = dimensions.height
  - dimensions.margin.top
  - dimensions.margin.bottom

// **************************
// Animate new line drawing in
// **************************
function lineTransitionIn(path) {
  path.transition().duration(500)
      .attrTween("stroke-dasharray", tweenDashIn);
}

function tweenDashIn() {
  const length = this.getTotalLength()
  const i = d3.interpolateString(`0, ${length}`, `${length}, ${length}`)
  return function (t) { return i(t) }
}

// **************************
// Update the KPI values for the target and lower bound
// **************************
function targetLineValues(context) {
  if (context === "production") return { successLineValue: 40, failLineValue: 50 }
  if (context === "deploy-preview") return { successLineValue: 45, failLineValue: 55 }
  if (context === "cms") return { successLineValue: 35, failLineValue: 45 }
}

// **************************
// Animate KPI lines
// **************************
function kpiLineTransition(bounds, data, context) {
  const lineValues = targetLineValues(context)

  dv.bounds.select(".line-chart--success-line")
      .transition().duration(250)
      .attr("x1", dv.xScale(dv.xAccessor(data)))
      .attr("x2", dimensions.boundedWidth)
      .attr("y1", dv.yScale(lineValues.successLineValue))
      .attr("y2", dv.yScale(lineValues.successLineValue))

  dv.bounds.select(".line-chart--fail-line")
      .transition().duration(250)
      .attr("x1", dv.xScale(dv.xAccessor(data)))
      .attr("x2", dimensions.boundedWidth)
      .attr("y1", dv.yScale(lineValues.failLineValue))
      .attr("y2", dv.yScale(lineValues.failLineValue))
}

// **************************
// Calculate which data point is selected on mouseover
// **************************
function onMouseMove(event) {
  const closestDataset = closestDataPoint(event)

  const closestXValue = dv.xAccessor(closestDataset)
  const closestYValue = dv.yAccessor(closestDataset)

  const formatDate = d3.timeFormat("%a %-d %b, %H:%M")
  tooltip.select("[data-viz='date']")
      .text(formatDate(dv.dateAccessor(closestDataset)))

  tooltip.select("[data-viz='duration']")
      .html(`${closestYValue} s`)

  const x = dv.xScale(closestXValue) + dimensions.margin.left
  const y = dv.yScale(closestYValue) + dimensions.margin.top

  tooltip.style("transform", `translate(`
    + `calc( -50% + ${x}px),`
    + `calc(-100% + ${y}px)`
    + `)`)

  tooltip.transition().duration(25)
      .style("opacity", 1)

  tooltipCircle.transition().duration(25)
      .attr("cx", dv.xScale(closestXValue))
      .attr("cy", dv.yScale(closestYValue))
      .style("opacity", 1)
}

// **************************
// Handle mouse leave
// **************************
function onMouseLeave() {
  tooltip.transition().duration(25)
      .style("opacity", 0)
  tooltipCircle.transition().duration(25)
      .style("opacity", 0)
}

// **************************
// Open Netlify build logs for selected build
// **************************
function onClick(event) {
  const deployId = dv.deployIdAccessor(closestDataPoint(event))
  window.open(
    `https://app.netlify.com/sites/jeffreyknox/deploys/${deployId}`, '_blank'
  );
}

// **************************
// Get the closest data point based on mouse position in listening rect
// **************************
function closestDataPoint(event) {
  const mousePosition = d3.pointer(event)
  const hoveredDate = dv.xScale.invert(mousePosition[0])

  const getDistanceFromHoveredDate = d => Math.abs(dv.xAccessor(d) - hoveredDate)
  const closestIndex = d3.leastIndex(dv.store.selectedContextData, (a, b) => (
    getDistanceFromHoveredDate(a) - getDistanceFromHoveredDate(b)
  ))
  return dv.store.selectedContextData[closestIndex]
}

export default class extends Controller {
  connect() {
    subscription(this)
    this.subscribe()
    dv.store = this.store()
    // this.reconnect()
  }

  // reconnect() {
  //   // if (this.store().selectedNetlifyBuildData) {
  //   //   this.storeUpdated(this.store(), "selectedNetlifyBuildData")
  //   // }
  //   console.log('re')
  //   if(dv.store.selectedContextData) {
  //     if(document.querySelector("[data-viz='wrapper']").getElementsByTagName("svg").length === 0) {
  //       console.log('yep')
  //       return this.createDataVis()
  //     }
  //   }
  // }
  
  createDataVis() {
    this.initialiseAccessors()
    this.setScales()
    this.setGenerators()
    this.initialiseDataVis()
  }

  updateDataVis() {
    const data = dv.store.selectedContextData
    const updatedLine = dv.bounds.select("path").data(data)

    this.setScales()
    this.setGenerators()

    updatedLine.attr("d", dv.lineGenerator(data))
        .call(lineTransitionIn)
    dv.bounds.select(".line-chart--y-axis")
        .transition().duration(250)
        .call(dv.yAxisGenerator)
    dv.bounds.select(".line-chart--x-axis")
        .transition().duration(250)
        .call(dv.xAxisGenerator)
    kpiLineTransition(dv.bounds, data, dv.store.contextSelected)
  }

  initialiseAccessors() {
    dv.yAccessor = d => d.deploy_time
    dv.xAccessor = d => d.build_number
    dv.dateAccessor = d => new Date(d.created_at)
    dv.deployIdAccessor = d => d.deploy_id
  }

  setScales() {
    dv.yScale = d3.scaleLinear()
      .domain([0, d3.max([60, d3.max(dv.store.selectedContextData.map(data => data.deploy_time))])])
      .range([dimensions.boundedHeight, 0])
      .nice()
    dv.xScale = d3.scaleLinear()
      .domain(d3.extent(dv.store.selectedContextData, dv.xAccessor))
      .range([0, dimensions.boundedWidth])
  }

  setGenerators() {
    dv.yAxisGenerator = d3.axisLeft()
      .scale(dv.yScale)
    dv.xAxisGenerator = d3.axisBottom()
      .scale(dv.xScale)
      .tickValues(dv.store.selectedContextData.map(data => data.build_number))
      .tickFormat(d3.format(".0f"))
    // Duration line generator with animation
    dv.lineGenerator = d3.line()
      .x(d => dv.xScale(dv.xAccessor(d)))
      .y(d => dv.yScale(dv.yAccessor(d)))
      .curve(d3.curveMonotoneX)
  }

  initialiseDataVis() {
    // Draw canvas
    const wrapperSvg = wrapper.append("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)

    // Draw the bounds
    dv.bounds = wrapperSvg.append("g")
        .style("transform", `translate(${
          dimensions.margin.left
        }px, ${
          dimensions.margin.top
        }px)`)

    // Setup listener rect for mouse overs
    const listeningRect = dv.bounds.append("rect")
        .attr("class", "line-chart--listening-rect")
        .attr("width", dimensions.boundedWidth)
        .attr("height", dimensions.boundedHeight)
        .on("mousemove", onMouseMove)
        .on("mouseleave", onMouseLeave)
        .on("click", onClick)

    // Setup tooltip when mousing over the listener rect
    tooltipCircle = dv.bounds.append("circle")
        .attr("class", "line-chart--tooltip-circle")
        .attr("r", 4)

    // Setup build duration line
    const line = dv.bounds.append("path")
        .attr("class", "line-chart--path")
        .attr("d", dv.lineGenerator(dv.store.selectedContextData))
        .call(lineTransitionIn)

    // Setup axis
    const yAxis = dv.bounds.append("g")
        .attr("class", "line-chart--y-axis")
        .call(dv.yAxisGenerator)

    const xAxis = dv.bounds.append("g")
        .attr("class", "line-chart--x-axis")
        .call(dv.xAxisGenerator)
          .style("transform", `translateY(${
            dimensions.boundedHeight
          }px)`)
      .append("text")
        .attr("class", "line-chart--x-axis-label")
        .attr("x", dimensions.boundedWidth / 2)
        .attr("y", dimensions.margin.bottom - 5)
        .text("Build number")

    // Setup KPI lines to start from zero on y axis. These will animate into position with kpiLineTransition
    const targetKpiLine = dv.bounds.append("line")
        .attr("class", "line-chart--success-line")
        .attr("x1", dv.xScale(dv.xAccessor(dv.store.selectedContextData)))
        .attr("x2", dimensions.boundedWidth)
        .attr("y1", dv.yScale(0))
        .attr("y2", dv.yScale(0))

    const lowerBoundtKpiLine = dv.bounds.append("line")
        .attr("class", "line-chart--fail-line")
        .attr("x1", dv.xScale(dv.xAccessor(dv.store.selectedContextData)))
        .attr("x2", dimensions.boundedWidth)
        .attr("y1", dv.yScale(0))
        .attr("y2", dv.yScale(0))

    // Animate KPI lines to their position
    kpiLineTransition(dv.bounds, dv.store.selectedContextData, dv.store.contextSelected)
  }

  storeUpdated(store, prop) {
    if (prop === "selectedContextData") {
      if(document.querySelector("[data-viz='wrapper']").getElementsByTagName("svg").length === 0) {
        this.createDataVis()
      } else {
        this.updateDataVis()
      }
    }
  }

  disconnect() {
    this.unsubscribe()
  }
}
