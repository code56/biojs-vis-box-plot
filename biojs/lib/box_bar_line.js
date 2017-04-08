    /**
     * Copyright 2016 Ariane Mora
     *
     * This provides a set of functions which are used by the line, box, bar
     * and violin plots. Such functions include calculations such as getting
     * the mean values, error bars, positioning of the labels and setting up
     * secondary labels for the x axis. It also includes the functions for
     * adding some generic componenets to the svg such as a line to
     * a box/bar/line graph and other componenets.
     *
     */

    /**
     * Scaling function for the wwidh of elements
     */
    scale_group_width = function (graph, x, box_width, prev_x, next_x) {
        // If it is undefined it means it is either the end or start of the
        // graph -> set spacing between the box's to be the size of 0.5 box
        var spacing = box_width;
        if (prev_x == undefined) {
            prev_x = 0;
        }
        if (next_x == undefined) {
            next_x = graph.options.width;
        }
        var diff = next_x - prev_x;
        var size = x + box_width - prev_x + spacing;
        var scaleX = 1;
        if (diff < size) {
            scaleX = diff/size;
        }
        return scaleX;

    }

    /**
     * Takes an array of values and gets the mean
     * @param {array} values
     * @returns {nm$_index.sum|Number|nm$_index.mean}
     */
    get_mean_value = function (values) {
        sum = 0;
        for (i in values) {
            sum += values[i];
        }
        mean = sum / values.length;
        return mean;
    };

  /**
     * Note the divisor param is only used in the box_plot and bar graph to make sure the
     * line is centered
     * @param {int in px} stroke_width
     * @param {int} x_buffer x value scaled to day position
     * @param {int} box_width length of the line
     * @param {int} y_value unscaled expression value
     * @param {svg} svg
     * @param {scale function} scaleY
     * @param {string} colour
     * @param {int} box_width_wiskers
     * @returns {unresolved}
     */
    add_line_to_box = function(stroke_width, x_buffer, box_width, y_value, svg,
            scaleY, colour, box_width_wiskers, median, graph) {
      // changes done by Isha
        x_buffer = x_buffer + box_width/2.0;
        if (options.bar_graph == "yes") {
          if(median == "no") {
            svg.append("line")
            .attr("x1", (x_buffer - 15 ))
            .attr("x2", (x_buffer + 15))
                    .attr("y1", scaleY(y_value))
                    .attr("y2", scaleY(y_value))
                    .attr("shape-rendering","crispEdges")
                    .attr("stroke-width",stroke_width)
                    .attr("stroke", colour)
                    .on("mouseover", function() {
			if (graph.graph_type == "Box Plot") {
				tooltip_box.show;
			}})
                    .on("mouseout", function() {
			if (graph.graph_type == "Box Plot") {
				tooltip_box.hide;
			}});
          }
          else {
            svg.append("line")
            .attr("x1", (x_buffer - box_width/2))
            .attr("x2", (x_buffer + box_width/2))
                    .attr("y1", scaleY(y_value))
                    .attr("y2", scaleY(y_value))
                    .attr("shape-rendering","crispEdges")
                    .attr("stroke-width",stroke_width)
                    .attr("stroke", colour)
                    .on("mouseover", function() {
			if (graph.graph_type == "Box Plot") {
				tooltip_box.show;
			}})
                    .on("mouseout", function() {
			if (graph.graph_type == "Box Plot") {
				tooltip_box.hide;
			}});
		}

        }
        else {
          if(median == "no") {
            svg.append("line")
            .attr("x1", (x_buffer - 15 ))
            .attr("x2", (x_buffer + 15))
                    .attr("y1", scaleY(y_value))
                    .attr("y2", scaleY(y_value))
                    .attr("shape-rendering","crispEdges")
                    .attr("stroke-width",stroke_width)
                    .attr("stroke", colour)
                    .on("mouseover", function() {
			if (graph.graph_type == "Box Plot") {
				tooltip_box.show;
			}})
                    .on("mouseout", function() {
			if (graph.graph_type == "Box Plot") {
				tooltip_box.hide;
			}});
          }
          else {
            svg.append("line")
            .attr("x1", (x_buffer - box_width_wiskers))
            .attr("x2", (x_buffer + box_width_wiskers))
                    .attr("y1", scaleY(y_value))
                    .attr("y2", scaleY(y_value))
                    .attr("shape-rendering","crispEdges")
                    .attr("stroke-width",stroke_width)
                    .attr("stroke", colour)
                      .on("mouseover", function() {
        if (graph.graph_type == "Box Plot") {
          tooltip_box.show;
        }})
                      .on("mouseout", function() {
        if (graph.graph_type == "Box Plot") {
          tooltip_box.hide;
        }});
          }
		}

        return svg;
    }
/**
 *
 * @param {int} stroke_width
 * @param {int} x_position x value scaled to day position
 * @param {int} y_lower y_value unscaled expression value - max for the day
 * and line group
 * @param {int} y_upper y_value unscaled expression value - min for the day
 * and line group
 * @param {type} svg
 * @param {scale function} scaleY
 * @param {string} colour_wiskers
 * @returns {unresolved}
 */
    add_vertical_line_to_box = function (stroke_width, x_position, y_lower,
            y_upper, svg, scaleY, colour_wiskers, graph) {
        svg.append("line")
            .attr("x1", x_position)
            .attr("x2", x_position)
            .attr("y1", scaleY(y_lower))
            .attr("y2", scaleY(y_upper))
            .attr("shape-rendering","crispEdges")
            .attr("stroke-width",stroke_width)
            .attr("stroke", colour_wiskers)
            .on("mouseover", function() {
			if (graph.graph_type == "Box Plot") {
				tooltip_box.show;
			}})
            .on("mouseout", function() {
			if (graph.graph_type == "Box Plot") {
				tooltip_box.hide;
			}});

        return svg;
    };

    //setting up the line to append for each of the values (i.e. line between scatter points)
    //http://bl.ocks.org/d3noob/e99a762017060ce81c76 helpful for nesting the probes

    /**
     * Adds a line between two of the scatter points
     * @param {type} svg
     * @param {string} colour
     * @param {int} x1
     * @param {int} x2
     * @param {int} y1
     * @param {int} y2
     * @param {int} line_stroke_width
     * @returns {unresolved}
     */
    add_scatter_line = function (svg, colour, x1, x2, y1, y2, line_stroke_width) {
        svg.append("line")
                .attr("x1", x1)
                .attr("x2", x2)
                .attr("y1", y1)
                .attr("y2", y2)
                .attr("shape-rendering", "crispEdges")
                .attr("stroke-width", line_stroke_width)
                .attr("stroke", colour);
        return svg;
    };//end  setup_scatter_line


  /**
     * Takes an array of the samples for a specific sample type
     * These have been ordered already
     * @param {array} values
     * @returns {Array}
     */
    calculate_error_bars = function (values) {
        var mean = get_mean_value(values);
        sum = 0;
        numbers_meaned = [];
        x = null;
        for (x in values) {
            numbers_meaned.push(Math.abs(values[x] - mean));
        }
        standard_deviation = get_mean_value(numbers_meaned);
        return [mean - standard_deviation, mean, mean + standard_deviation];
    };

    /**
     * Creates the tooltip for a scatter point
     * @param {string} probe
     * @param {string} line_group
     * @param {string} day
     * @param {array or single string} sample_ids
     * @returns {biojsvislinegraph.make_scatter_tooltip.tooltip_scatter}
     */
    make_scatter_tooltip = function (probe, line_group, sample_type, sample_ids, type) {
        var tooltip_scatter = d3.tip()
                .attr('class', 'd3-tip')
                .offset([0, +110])
                .html(function (d) {
                    temp =
                            "Probe: " + probe + "<br/>" +
                            "Line Group: " + line_group + "<br/>" +
                            type + sample_type + "<br/>" +
                            "Samples: " + sample_ids + "<br/>";
                    return temp;
                });
        return tooltip_scatter;
    };

    /**
     * Test function
     * @param {type} name
     * @param {type} box_plot_vals
     * @param {type} graph
     * @param {type} options
     * @returns {undefined}
     */
    test_values = function (name, box_plot_vals, graph, options) {
        //var fs = require('fs');
        //name in format as saved by stemformatics: name, average. standard deviation, min, max, median, Q1, Q3
        row = name + "," + 0 + "," + 0 + "," + box_plot_vals[0] + "," + box_plot_vals[4] + "," + box_plot_vals[2] + "," + box_plot_vals[1] + "," + box_plot_vals[3];
        if (options.bar_graph === "yes") {
            row = name + "," + box_plot_vals[1] + "," + 0 + "," + box_plot_vals[0] + "," + box_plot_vals[2] + "," + 0 + "," + 0 + "," + 0;
        }
    };
