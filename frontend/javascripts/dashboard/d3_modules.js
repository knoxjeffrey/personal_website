import { extent, leastIndex, max } from "d3-array"
import { axisBottom, axisLeft } from "d3-axis"
import { interpolateString } from "d3-interpolate"
import { scaleLinear } from "d3-scale"
import { pointer, select } from "d3-selection"
import { curveMonotoneX, line } from "d3-shape"
import { timeFormat } from "d3-time-format"
import { transition } from "d3-transition"

export default {
  extent, leastIndex, max,
  axisBottom, axisLeft,
  interpolateString,
  scaleLinear,
  pointer, select,
  curveMonotoneX, line,
  timeFormat,
  transition
}
