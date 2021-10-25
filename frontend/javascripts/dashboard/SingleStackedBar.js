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
      height: 53,
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
      .attr("class", d => `rect-stacked ${d.barClass}`)
      .attr("x", d => this.dv.xScale(d.cumulative))
      .attr("y", 0)
      .attr("height", this.dimensions.boundedHeight)
      .attr("width", d => this.dv.xScale(d.percentage))
  }
}
