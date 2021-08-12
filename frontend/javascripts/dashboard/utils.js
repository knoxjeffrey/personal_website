/**
 * @namespace javascripts.dashboard.utils
 */

/** 
 * Get the success and fail line values for the given build context
 *
 * @function targetLineValues
 * @memberof javascripts.dashboard.utils
 */
export function targetLineValues(context) {
  if (context === "production") return { successLineValue: 40, failLineValue: 50 }
  if (context === "deploy-preview") return { successLineValue: 45, failLineValue: 55 }
  if (context === "cms") return { successLineValue: 35, failLineValue: 45 }
}
