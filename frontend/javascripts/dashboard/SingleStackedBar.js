import d3 from "~/javascripts/dashboard/d3_modules"

/**
 * @class javascripts.dashboard.SingleStackedBar
 * @classdesc d3.js single stacked bar chart
 */
export default class SingleStackedBar {
  constructor(selectedData, selectedContext, wrapper) {
    this.selectedData = selectedData
    this.selectedContext = selectedContext
    this.wrapper = d3.select(wrapper)
    this.dv = {
      xScale: null
    }
    this.dimensions = {
      width: parseInt(this.wrapper.style("width"), 10),
      height: 93,
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      }
    }
    this.dimensions.boundedWidth = this.dimensions.width
      - this.dimensions.margin.left
      - this.dimensions.margin.right
    this.dimensions.boundedHeight = this.dimensions.height
      - this.dimensions.margin.top
      - this.dimensions.margin.bottom
  }

  /** 
   * Called the first time the page is loaded to setup the visualisation
   *
   * @instance
   * @memberof javascripts.dashboard.SingleStackedBar
   **/
  createDataVis() {
    this.setScales()
    this.initialiseDataVis()
    this.drawDataVis()
  }

  /** 
   * When the data set is updated this will cause the visualisation to animate
   *
   * @instance
   * @memberof javascripts.dashboard.SingleStackedBar
   **/
  updateDataVis(selectedData, selectedContext) {
    this.selectedData = selectedData
    this.selectedContext = selectedContext

    this.redrawDataVis()
  }

  /** 
   * Setup the scales for the visualisation
   *
   * @instance
   * @memberof javascripts.dashboard.SingleStackedBar
   **/
  setScales() {
    this.dv.xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, this.dimensions.boundedWidth])
  }

  /** 
   * Setup the wrapper and the bounds for the visualisation
   *
   * @instance
   * @memberof javascripts.dashboard.SingleStackedBar
   **/
  initialiseDataVis() {
    const wrapper = this.wrapper
      .append("svg")
        .attr("width", this.dimensions.width)
        .attr("height", this.dimensions.height)

    this.dv.bounds = wrapper.append("g")
        .style(
          "transform",
          `translate(${this.dimensions.margin.left}px, ${this.dimensions.margin.top}px)`
        )
  }

  /** 
   * Animate the rendering of the stack bar chart, the legend and the percentage values within the
   * legend
   *
   * @instance
   * @memberof javascripts.dashboard.SingleStackedBar
   **/
  drawDataVis() { 
    // Initially set bars in position with no width
    this.dv.bounds.selectAll("rect")
      .data(this.selectedData)
      .enter().append("rect")
      .attr("class", d => `single-stacked-bar--${d.barClassModifier}`)
      .attr("x", d => this.dv.xScale(d.cumulative))
      .attr("y", 0)
      .attr("height", 53)
      .attr("width", 0)

    // Transition in the bar width 1 bar at a time with a delay set so the next bar waits for the
    // preceeding bar to finish animating 
    this.dv.bounds.selectAll("rect")
      .data(this.selectedData)
      .transition()
      .ease(d3.easeLinear)
      .delay(d => (d.cumulative / 100) * 250)
      .duration(d => (d.percentage / 100) * 250)
      .attr("width", d => this.dv.xScale(d.percentage))

    this.dv.bounds.selectAll(".single-stacked-bar-legend")
      .data(this.selectedData)
      .enter().append("rect")
      .attr("class", d => `single-stacked-bar-legend single-stacked-bar-legend--${d.barClassModifier}`)
      .attr("x", (d, i) => i * 90)
      .attr("y", 63)
      .attr("height", 30)
      .attr("width", 60)

      this.dv.bounds.selectAll('.single-stacked-bar-percentage')
      .data(this.selectedData)
      .enter().append("text")
      .attr("class", "single-stacked-bar-percentage")
      .attr("x", (d, i) => (i * 90) + 30)
      .attr("y", 82)
      .text(d => `${d.percentage} %`)
  }

  /** 
   * Animate the bars transitioning to the updated data set and change the percentage values in the
   * legend
   *
   * @instance
   * @memberof javascripts.dashboard.SingleStackedBar
   **/
  redrawDataVis() {
    this.dv.bounds.selectAll("rect")
      .data(this.selectedData)
      .transition()
      .duration(250)
      .ease(d3.easeCubicInOut)
      .attr("x", d => this.dv.xScale(d.cumulative))
      .attr("width", d => this.dv.xScale(d.percentage))

    this.dv.bounds.selectAll(".single-stacked-bar-percentage")
      .data(this.selectedData)
      .transition()
      .duration(250)
      .ease(d3.easeCubicInOut)
      .text(d => `${d.percentage} %`)
  }
}
