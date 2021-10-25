import d3 from "~/javascripts/dashboard/d3_modules"

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

  createDataVis() {
    this.setScales()
    this.initialiseDataVis()
  }

  updateDataVis(selectedData, selectedContext) {
    this.selectedData = selectedData
    this.selectedContext = selectedContext

    this.redrawDataVis()
  }

  setScales() {
    this.dv.xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, this.dimensions.boundedWidth])
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

    this.dv.bounds.selectAll("rect")
      .data(this.selectedData)
      .enter().append("rect")
      .attr("class", d => `single-stacked-bar--${d.barClassModifier}`)
      .attr("x", d => this.dv.xScale(d.cumulative))
      .attr("y", 0)
      .attr("height", 53)
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

  redrawDataVis() {
    this.dv.bounds.selectAll("rect")
      .data(this.selectedData)
      .attr("class", d => `single-stacked-bar--${d.barClassModifier}`)
      .attr("x", d => this.dv.xScale(d.cumulative))
      .attr("y", 0)
      .attr("height", 53)
      .attr("width", d => this.dv.xScale(d.percentage))

    this.dv.bounds.selectAll('.single-stacked-bar-percentage')
      .data(this.selectedData)
      .attr("class", "single-stacked-bar-percentage")
      .attr("x", (d, i) => (i * 90) + 30)
      .attr("y", 82)
      .text(d => `${d.percentage} %`)
  }
}
