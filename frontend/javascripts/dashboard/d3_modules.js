/**
 * @namespace javascripts.dashboard.Chart_modules
 * @description Load in the require d3 modules for the visualisation
 */

import { bin, extent, leastIndex, max } from "d3-array"
import { axisBottom, axisLeft } from "d3-axis"
import { format } from "d3-format"
import { interpolateString } from "d3-interpolate"
import { scaleLinear } from "d3-scale"
import { pointer, select } from "d3-selection"
import { curveMonotoneX, line } from "d3-shape"
import { timeFormat } from "d3-time-format"
import { transition } from "d3-transition"
import { easeCubicInOut } from "d3-ease"

export default {
  bin, extent, leastIndex, max,
  axisBottom, axisLeft,
  format,
  interpolateString,
  scaleLinear,
  pointer, select,
  curveMonotoneX, line,
  timeFormat,
  transition,
  easeCubicInOut
}
