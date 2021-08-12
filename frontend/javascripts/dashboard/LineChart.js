import d3 from "~/javascripts/dashboard/d3_modules"

export default class LineChart {
  constructor(store, wrapper, tooltip) {
    this.wrapper = d3.select(wrapper)
    this.tooltip = d3.select(tooltip)
    this.tooltipCircle = null
    this.dv = {
      store,
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
    this.dimensions = {
      width: parseInt(this.wrapper.style("width"), 10),
      height: 400,
      margin: {
        top: 15,
        right: 10,
        bottom: 40,
        left: 20,
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
    this.setGenerators()
    this.initialiseDataVis()
  }

  updateDataVis() {
    const data = this.dv.store.selectedContextData
    const updatedLine = this.dv.bounds.select("path").data(data)

    this.setScales()
    this.setGenerators()

    updatedLine.attr("d", this.dv.lineGenerator(data))
        .call(this.lineTransitionIn)
    this.dv.bounds.select(".line-chart--y-axis")
        .transition().duration(250)
        .call(this.dv.yAxisGenerator)
    this.dv.bounds.select(".line-chart--x-axis")
        .transition().duration(250)
        .call(this.dv.xAxisGenerator)
    this.kpiLineTransition(this.dv.bounds, data, this.dv.store.contextSelected)
  }

  initialiseAccessors() {
    this.dv.yAccessor = d => d.deploy_time
    this.dv.xAccessor = d => d.build_number
    this.dv.dateAccessor = d => new Date(d.created_at)
    this.dv.deployIdAccessor = d => d.deploy_id
  }

  setScales() {
    this.dv.yScale = d3.scaleLinear()
      .domain([0, d3.max([60, d3.max(this.dv.store.selectedContextData.map(data => data.deploy_time))])])
      .range([this.dimensions.boundedHeight, 0])
      .nice()
    this.dv.xScale = d3.scaleLinear()
      .domain(d3.extent(this.dv.store.selectedContextData, this.dv.xAccessor))
      .range([0, this.dimensions.boundedWidth])
  }

  setGenerators() {
    this.dv.yAxisGenerator = d3.axisLeft()
      .scale(this.dv.yScale)
    this.dv.xAxisGenerator = d3.axisBottom()
      .scale(this.dv.xScale)
      .tickValues(this.dv.store.selectedContextData.map(data => data.build_number))
      .tickFormat(d3.format(".0f"))
    // Duration line generator with animation
    this.dv.lineGenerator = d3.line()
      .x(d => this.dv.xScale(this.dv.xAccessor(d)))
      .y(d => this.dv.yScale(this.dv.yAccessor(d)))
      .curve(d3.curveMonotoneX)
  }

  initialiseDataVis() {
    // Draw canvas
    const wrapperSvg = this.wrapper.append("svg")
      .attr("width", this.dimensions.width)
      .attr("height", this.dimensions.height)

    // Draw the bounds
    this.dv.bounds = wrapperSvg.append("g")
        .style("transform", `translate(${
          this.dimensions.margin.left
        }px, ${
          this.dimensions.margin.top
        }px)`)

    // Setup listener rect for mouse overs
    const listeningRect = this.dv.bounds.append("rect")
        .attr("class", "line-chart--listening-rect")
        .attr("width", this.dimensions.boundedWidth)
        .attr("height", this.dimensions.boundedHeight)
        .on("mousemove", this.onMouseMove)
        .on("mouseleave", this.onMouseLeave)
        .on("click", this.onClick)

    // Setup tooltip when mousing over the listener rect
    this.tooltipCircle = this.dv.bounds.append("circle")
        .attr("class", "line-chart--tooltip-circle")
        .attr("r", 4)

    // Setup build duration line
    const line = this.dv.bounds.append("path")
        .attr("class", "line-chart--path")
        .attr("d", this.dv.lineGenerator(this.dv.store.selectedContextData))
        .call(this.lineTransitionIn)

    // Setup axis
    const yAxis = this.dv.bounds.append("g")
        .attr("class", "line-chart--y-axis")
        .call(this.dv.yAxisGenerator)

    const xAxis = this.dv.bounds.append("g")
        .attr("class", "line-chart--x-axis")
        .call(this.dv.xAxisGenerator)
          .style("transform", `translateY(${
            this.dimensions.boundedHeight
          }px)`)
      .append("text")
        .attr("class", "line-chart--x-axis-label")
        .attr("x", this.dimensions.boundedWidth / 2)
        .attr("y", this.dimensions.margin.bottom - 5)
        .text("Build number")

    // Setup KPI lines to start from zero on y axis. These will animate into position with kpiLineTransition
    const targetKpiLine = this.dv.bounds.append("line")
        .attr("class", "line-chart--success-line")
        .attr("x1", this.dv.xScale(this.dv.xAccessor(this.dv.store.selectedContextData)))
        .attr("x2", this.dimensions.boundedWidth)
        .attr("y1", this.dv.yScale(0))
        .attr("y2", this.dv.yScale(0))

    const lowerBoundtKpiLine = this.dv.bounds.append("line")
        .attr("class", "line-chart--fail-line")
        .attr("x1", this.dv.xScale(this.dv.xAccessor(this.dv.store.selectedContextData)))
        .attr("x2", this.dimensions.boundedWidth)
        .attr("y1", this.dv.yScale(0))
        .attr("y2", this.dv.yScale(0))

    // Animate KPI lines to their position
    this.kpiLineTransition(this.dv.bounds, this.dv.store.selectedContextData, this.dv.store.contextSelected)
  }


  // ************************************************************************************
  // ************************************************************************************
  // ************************************************************************************
  // ************************************************************************************
  // ************************************************************************************


  // **************************
  // Animate new line drawing in
  // **************************
  lineTransitionIn = path => {
    path.transition().duration(500)
        .attrTween("stroke-dasharray", this.tweenDashIn)
  }

  tweenDashIn() {
    const length = this.getTotalLength()
    const i = d3.interpolateString(`0, ${length}`, `${length}, ${length}`)
    return function (t) { return i(t) }
  }

  // **************************
  // Update the KPI values for the target and lower bound
  // **************************
  targetLineValues(context) {
    if (context === "production") return { successLineValue: 40, failLineValue: 50 }
    if (context === "deploy-preview") return { successLineValue: 45, failLineValue: 55 }
    if (context === "cms") return { successLineValue: 35, failLineValue: 45 }
  }

  // **************************
  // Animate KPI lines
  // **************************
  kpiLineTransition(bounds, data, context) {
    const lineValues = this.targetLineValues(context)

    this.dv.bounds.select(".line-chart--success-line")
        .transition().duration(250)
        .attr("x1", this.dv.xScale(this.dv.xAccessor(data)))
        .attr("x2", this.dimensions.boundedWidth)
        .attr("y1", this.dv.yScale(lineValues.successLineValue))
        .attr("y2", this.dv.yScale(lineValues.successLineValue))

    this.dv.bounds.select(".line-chart--fail-line")
        .transition().duration(250)
        .attr("x1", this.dv.xScale(this.dv.xAccessor(data)))
        .attr("x2", this.dimensions.boundedWidth)
        .attr("y1", this.dv.yScale(lineValues.failLineValue))
        .attr("y2", this.dv.yScale(lineValues.failLineValue))
  }

  // **************************
  // Calculate which data point is selected on mouseover
  // **************************
  onMouseMove = event => {
    const closestDataset = this.closestDataPoint(event)

    const closestXValue = this.dv.xAccessor(closestDataset)
    const closestYValue = this.dv.yAccessor(closestDataset)

    const formatDate = d3.timeFormat("%a %-d %b, %H:%M")
    this.tooltip.select("[data-viz='date']")
        .text(formatDate(this.dv.dateAccessor(closestDataset)))

    this.tooltip.select("[data-viz='duration']")
        .html(`${closestYValue} s`)

    const x = this.dv.xScale(closestXValue) + this.dimensions.margin.left
    const y = this.dv.yScale(closestYValue) + this.dimensions.margin.top

    this.tooltip.style("transform", `translate(`
      + `calc( -50% + ${x}px),`
      + `calc(-100% + ${y}px)`
      + `)`)

    this.tooltip.transition().duration(25)
        .style("opacity", 1)

    this.tooltipCircle.transition().duration(25)
        .attr("cx", this.dv.xScale(closestXValue))
        .attr("cy", this.dv.yScale(closestYValue))
        .style("opacity", 1)
  }

  // **************************
  // Handle mouse leave
  // **************************
  onMouseLeave = () => {
    this.tooltip.transition().duration(25)
        .style("opacity", 0)
    this.tooltipCircle.transition().duration(25)
        .style("opacity", 0)
  }

  // **************************
  // Open Netlify build logs for selected build
  // **************************
  onClick = event => {
    const deployId = this.dv.deployIdAccessor(this.closestDataPoint(event))
    window.open(
      `https://app.netlify.com/sites/jeffreyknox/deploys/${deployId}`, '_blank'
    );
  }

  // **************************
  // Get the closest data point based on mouse position in listening rect
  // **************************
  closestDataPoint(event) {
    const mousePosition = d3.pointer(event)
    const hoveredDate = this.dv.xScale.invert(mousePosition[0])

    const getDistanceFromHoveredDate = d => Math.abs(this.dv.xAccessor(d) - hoveredDate)
    const closestIndex = d3.leastIndex(this.dv.store.selectedContextData, (a, b) => (
      getDistanceFromHoveredDate(a) - getDistanceFromHoveredDate(b)
    ))
    return this.dv.store.selectedContextData[closestIndex]
  }
}
