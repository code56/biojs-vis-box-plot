require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
    /**
     * Copyright 2016 Ariane Mora
     *
     * This contains helper functions related to the building of the axes for
     * the bioJS modules for Stemformatics.
     * Functions include rendering the x and y axis on the svg element. Getting
     * the bounds and setting up the general x axis labels
     */


	// USING ISHA's
      //Setting up the max and minimum values for the graph
    //we are trying to take into account not just the data but the lines as well
    // and we are taking into account that we want to be able to see 0 too
    return_y_min_max_values = function (graph) {
        options = graph.options;
        max_val = 1;
        min_val = 0;

        lwr_min_max_values_from_data = d3.extent(options.data,
                function (d) {   // this will go through each row of the options.data
                    // and provide a way to access the values
                    // you want to check that we use the highest and lowest values of the lines and at least stop at 0
                    lwr = (d.Expression_Value - d.Standard_Deviation);
                    temp = lwr; // this will get the y_column (usually prediction) from the row
                    // have to take into account lwr and upr
                    if (lwr < min_val) {
                        min_val = lwr;
                    }
                    return temp;
                }
        );

        // do the same for upr
        // changes done by Isha to add extra padding for y axis
        upr_min_max_values_from_data = d3.extent(options.data,
                function (d) {
                    var extra_padding_for_y_axis = 1;
                    // changes reverted for extra padding
                    upr = (d.Standard_Deviation + d.Expression_Value) ;

                    temp = upr;
                    if (upr > max_val) {
                        max_val = upr;
                    }
                    // changes done by isha when plot is lying way below the DT and Median
                    for(i=0;i<options.horizontal_lines.length;i++) {
                      if(options.horizontal_lines[i][2] !== "NULL"){
                        if(temp < (options.horizontal_lines[i][2])) {
                          temp = Math.ceil(options.horizontal_lines[i][2])+ 1;
                        }
                      }
                    }

                    // changes done by Isha
                    // when plot is lying on a distance < 0.5, an extra incremnet is build
                    if((Math.ceil(temp)- temp) < 0.2) {
                      temp = temp + 0.5;
                    }
                    return temp;
                }
        );


        min = lwr_min_max_values_from_data[0];

        max = upr_min_max_values_from_data[1];

        // set minimum to 0 if the minimum is a positive number
        // this means that the minimum number is at least 0
        // a negative number will be the only way to drop below 0
        if (min > 0) {
          // Ariane
          if(options.show_min_y_axis == true){
            min = Math.floor(min)
          }else {
            min = 0;
          }
        }

        // similarly, if the max number from the data is -ve
        // isha changes done to not to make max value 1
        if (max < 1) {Math.round( max * 10 ) / 10; }
        for (key in options.horizontal_lines) {
            value = options.horizontal_lines[key];
            if (value[2] > max){ max = Math.ceil(value[2]) }
            if (value[2] < min){ min = Math.floor(value[2]) }
        }
        graph.max_val = max_val;
        graph.min_val = min_val;
        graph.force_domain = [min, max];
        return graph;
    };


    /**
     * ARIANE
     * Sets up the y axis for the graph
     * @param {type} graph
     * @returns {biojsvisscatterplot.setup_y_axis.graph}
     */
    setup_y_axis = function (graph) {
        svg = graph.svg;
        max = graph.max_val;
        // ########################################## Setup Y axis labels ###################################3
        /*
         For the y axis, the scale is linear, so we create a variable called y that we can use later
         to scale and do other things. in some people call it yScale
         https://github.com/mbostock/d3/wiki/Quantitative-Scales
         The range is the range of the graph from the height to 0. This is true for all y axes
         */
        var scaleY = d3.scale.linear()
                .range([page_options.height, 0]);

        y_column = options.y_column;
        // d3.extent returns the max and min values of the array using natural order
        // we are trying to take into account not just the data but the lines as well
        graph = return_y_min_max_values(graph);
        scaleY.domain(graph.force_domain).nice();
        /* Want to make the number of ticks default to 1 for each increment */
        var num_ticks = graph.max_val - graph.min_val;
        // Since the graph has a "nice" domain
        num_ticks = num_ticks * 1.25;
        /* If there are less than 10 ticks set the default to 10 */
        if (num_ticks < 10) {
            num_ticks = 10; 
        } else {
            // User may not want any ticks
            num_ticks *= options.increment;
        }
        // setup the yaxis. this is later called when appending as a group .append("g")
        // Note that it uses the y to work out what it should output
        // trying to have the grid lines as an option
        // sets the number of points to increment by 1 whole
        // number. To change see options.increment
        var yAxis = d3.svg.axis()
                .scale(scaleY)
                .orient("left")
                .ticks(num_ticks)
                .innerTickSize(-page_options.width)
                .outerTickSize(0);

        y_axis_legend_y = (graph.full_height - options.margin.top - options.margin.bottom) / 2;

        /*Adding the title to the Y-axis: stored in options.y_axis_title: information from
         ** http://bl.ocks.org/dougdowson/8a43c7a7e5407e47afed*/
        // only display the title if the user has indicated they would like the title displayed
        if (options.display.y_axis_title === "yes") {
            svg.append("text")
                    .text(options.y_axis_title)
                    .attr("text-anchor", "middle")
                    .style("font-family", options.font_style)
                    .style("font-size", options.y_label_text_size)
                    .attr("transform", "rotate(-90)")
                    .style("text-anchor", "middle")
                    .attr("stroke", "black")
                    .attr("x", -y_axis_legend_y)
                    .attr("y", -options.y_label_x_val); //specifies how far away it is from the axis
        }
        // Only display the grid lines accross the page if the user has specified they want a grid
        if (options.display.horizontal_grid_lines === "yes") {
            svg.append("g")
                    .attr("class", "grid") //creates the horizontal lines accross the page
                    .attr("opacity", options.grid_opacity)
                    .attr("stroke", options.grid_colour)
                    .attr("stroke-width", options.background_stroke_width)
                    .call(yAxis); //implementing the y axis as an axis
        } else {
            svg.append("g")
                .call(yAxis); //implementing the y axis as an axis
        }
        graph.svg = svg;
        graph.scaleY = scaleY;
        graph.yAxis = yAxis;
        return graph;
    }; // end  setup_y_axis




    /**
     * Sets up the x axis for the graph
     * @param {type} graph
     * @returns {biojsvisscatterplot.setup_x_axis.graph}
     */
    setup_x_axis = function (graph, sample_list) {
        // ########################################## Setup X axis labels ###################################3
        page_options = graph.page_options;
        svg = graph.svg;
        options = graph.options;

        /* http://bost.ocks.org/mike/bar/3/
         because we have samples along the bottom we use ordinal instead of linear
         we also use rangeRoundBands as it gives us some flexibility
         see here for more: https://github.com/mbostock/d3/wiki/Ordinal-Scales
         Using randPoints gives greatest accuracy, it goes from the first to the last point, the padding is set as a
         factor of the interval size (i.e. outer padidng = 1/2 dist between two samples) 1 = 1/2 interval distance on the outside
         2 = 1 interval dist on the outside. Have set the default to 2 */
        var scaleX = d3.scale.ordinal()
                .rangePoints([0, page_options.width], options.padding); // note that 0.4 was chosen by iterative fiddling

        /*
         http://stackoverflow.com/questions/15713955/d3-ordinal-x-axis-change-label-order-and-shift-data-position
         The order of values for ordinal scales is the order in which you give them to .domain().
         That is, simply pass the order you want to .domain() and it should just work. */
        scaleX.domain(sample_list);
        // setup the xaxis. this is later called when appending as a group .append("g")
        // Note that it uses the x to work out what it should output
        var xAxis = d3.svg.axis()
                .scale(scaleX)
                .tickSize(0)
                .orient("bottom");

        font_size = "0px"; // set this to 0 if you don't want sample_id as the labels on the x axis
        svg.append("g")
                .attr("class", "x_axis")
                .attr("transform", "translate(0," + page_options.height + ")")
                .call(xAxis)// this is actually implementing the xAxis as an axis itself
                .selectAll("text")  // text for the xaxes - remember they are on a slant
                .attr("dx", "-2em") // when rotating the text and the size
                .style("font-size", font_size)
                .style("text-anchor", "end")
                .attr("dy", "-0.1em")
                .attr("transform", function (d) {
                    return "rotate(-65)"; // this is rotating the text
                })
                .append("text") // main x axis title
                .attr("class", "label")
                .attr("x", page_options.width)
                .attr("y", +24)
                .style("text-anchor", "end")
                .text(options.x_axis_title);

        graph.svg = svg;
        graph.scaleX = scaleX;

        
        return graph;
    }; //end  setup_x_axis




    /**
     * Prepares the data for the x axis and adds the labels to the x axis
     * This is to make the sample types replace the sample ids
     * Height offset is used if we are havig a second set of labels
     * @param {type} graph
     * @returns {unresolved}
     */
    setup_x_axis_labels = function (graph, label_list, height_offset, class_name, collective_name) {
        svg = graph.svg;
        scaleX = graph.scaleX;
        vertical_lines = graph.vertical_lines;
        page_options = graph.page_options;
        options = graph.options;
        // handle gaps between samples oin the x axis
        //value = calculate_difference_between_samples(label_list, scaleX);
        // in the same function you want to store the padding
        // and you want to calculate that last padding too
        sample_type_count = 0;


        svg.selectAll(class_name)  // text for the xaxes - remember they are on a slant
                .data(vertical_lines).enter()
                .append("text") // when rotating the text and the size
                .text(
                        function (d) {
                            // If the user does't want to have labels on the x axis we don't append the
                            // smaple type
                            var temp = get_type(d);
                            return temp;
                        }
                )
                .attr("class", "x_axis_diagonal_labels")
                .style("text-anchor", "end")
                .attr("id", function(d) {
                    /* This is used during testing to check the correct sample
 * is displayed */
			var point = get_type(d);
                    return "xLabel-" + point.replace(/\ |(|)/g, '');
                })
                // Even though we are rotating the text and using the cx and the cy, we need to
                // specify the original y and x
                .attr("y", page_options.height + options.x_axis_label_padding + height_offset)
                .attr("x",
                        function (d, i) {
                            var avg = calculate_x_value_of_labels(d, label_list, scaleX, i, graph);
                            return avg;
                        }
                ) // when rotating the text and the size
                .style("font-family", options.font_style)
                .style("font-size", options.text_size)
                .attr("transform",
                        /*combination of this: http://stackoverflow.com/questions/11252753/rotate-x-axis-text-in-d3
                         // and this: http://www.w3.org/TR/SVG/coords.html#TransformAttribute
                         // basically, you just have to specify the angle of the rotation and you have
                         // additional cx and cy points that you can use as the origin.
                         // therefore you make cx and cy your actual points on the graph as if it was 0 angle change
                         // you still need to make the y and x set as above*/
                        function (d, i) {
                            // actual x value if there was no rotation
                            var x_value = calculate_x_value_of_labels(d, label_list, scaleX, i, graph);
                            // actual y value if there was no rotation
                            var y_value = page_options.height + height_offset;
                            return "rotate(" + options.x_axis_text_angle + "," + x_value + "," + y_value + ")";
                        }
                )
                /* Sets up the tooltips to display on the mouseover of the sample type label. This tooltip
                 changes the scatter points (increases the size and changes the opacity.
                 Note: due to stange sample type names (i.e. having unagreeable characters) it assigns
                 a number to each sample type and calls this rather than the sample type name.
                 This is set up in simple.js and saves in array options.sample_types where the key
                 is the sample type */
                .on('mouseover', function (d) {
                   label_hover_on_feature(d, sample_type_count, collective_name, options);
                })
		.on('mouseout', function (d) {
		   label_hover_out_feature(d, sample_type_count, collective_name, options);                   
		});

        graph.svg = svg;
        return graph;
    }; // setup_x_axis_using_sample_types



   



},{}],2:[function(require,module,exports){
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
    add_line_to_box = function (stroke_width, x_buffer, box_width, y_value, svg, scaleY, colour, box_width_wiskers, divisor, multiplier) {
        svg.append("line")
                .attr("x1", (x_buffer - box_width/divisor) + box_width_wiskers)
                .attr("x2", (x_buffer + box_width * multiplier) - box_width_wiskers)
                .attr("y1", scaleY(y_value))
                .attr("y2", scaleY(y_value))
                .attr("shape-rendering", "crispEdges")
                .attr("stroke-width", stroke_width)
                .attr("stroke", colour);
        return svg;
    };
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
    add_vertical_line_to_box = function (stroke_width, x_position, y_lower, y_upper, svg, scaleY, colour_wiskers) {
        svg.append("line")
                .attr("x1", x_position)
                .attr("x2", x_position)
                .attr("y1", scaleY(y_lower))
                .attr("y2", scaleY(y_upper))
                .attr("shape-rendering", "crispEdges")
                .attr("stroke-width", stroke_width)
                .attr("stroke", colour_wiskers);
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


   /**
     * Calculates interval between the probes
     * also used for calculating the distance bwteen the day states
     * @param {type} graph
     * @returns {unresolved}
     */
    calculate_x_value_of_probes = function (graph) {
        options = graph.options;
        width = options.width;
        scaleX = graph.scaleX;
        probe_count = options.probe_count;
        section_size = (width / probe_count);
        //graph.size_of_day_state_collumn = section_size;
	graph_element = section_size;
        graph.size_of_probe_collumn = section_size;
        return graph;
    };// calculate_x_value_of_probes


    /**
     * Calculates interval between the day states/ or another type 
     * of separating factor (i.e. could be disease states etc)
     * @param {type} graph
     * @returns {unresolved}
     */
    calculate_x_value_of_state = function (graph, count) {
        options = graph.options;
        width = options.width;
        probe_count = options.probe_count;
        scaleX = graph.scaleX;
        //day_state_count = options.day_count;
        section_size = (width / probe_count) / count; //day_state_count;
        //graph.size_of_day_state_collumn = section_size;
	//graph_element = section_size;
        return section_size;
    }; // calculate_x_value_of_probes


/* Adds disease state labels to the bottom of the graph these are before the probe*/
    setup_disease_state_labels = function (graph) {
        svg = graph.svg;
        scaleX = graph.scaleX;
        sample_id_list = graph.sample_id_list;
        nested_values = graph.nested_values;
        page_options = graph.page_options;
        options = graph.options;
        initial_padding = graph.page_options.width_to_support_many_samples;
        //Below are used for calculating the positioning of the labels
        size_of_disease_state_collumn = graph.size_of_disease_state_collumn;
        full_size_of_a_probe_collumn = graph.size_of_probe_collumn;
        count = 0;
        disease = null;
        for (probe in vertical_lines) {
            padding = (initial_padding * parseInt(probe) * 2) + (full_size_of_a_probe_collumn * parseInt(probe));
            probe = vertical_lines[probe];
            disease_state_list = probe.disease_state_list;
            count = 0;
            for (disease in disease_state_list) {
                current_state = disease_state_list[disease];
                svg.append("text") // when rotating the text and the size
                        .text(current_state)
                        .attr("class", "x_axis_diagonal_labels")
                        .style("text-anchor", "end")
                        // Even though we are rotating the text and using the cx and the cy, we need to 
                        // specify the original y and x  
                        .attr("y", page_options.height)
                        .attr("x", function () {
                            x = padding + (size_of_disease_state_collumn * (parseInt(disease) + 1));
                            if (vertical_lines.length === 1) {
                                x = padding + (size_of_disease_state_collumn * (parseInt(disease) + 1)) - (size_of_disease_state_collumn / 2) + (size_of_disease_state_collumn * 0.15);
                            }
                            return x;
                        })
                        // when rotating the text and the size
                        .style("font-family", options.font_style)
                        .style("font-size", options.text_size)
                        .attr("transform", function () {
                            // actual x value if there was no rotation
                            x_value = padding + (size_of_disease_state_collumn * (parseInt(disease) + 1)) + (0.2 * graph.size_of_disease_state_collumn);
                            // actual y value if there was no rotation
                            if (vertical_lines.length === 1) {
                                x_value = padding + (size_of_disease_state_collumn * (parseInt(disease) + 1)) - (size_of_disease_state_collumn / 2) + (size_of_disease_state_collumn * 0.15);
                            }
                            y_value = page_options.height + options.x_axis_padding;
                            return "rotate(" + options.x_axis_text_angle + "," + x_value + "," + y_value + ")";
                        }
                        );
                count++;
            }
        }

        graph.svg = svg;
        return graph;
    };





    /* // combination of this: http://stackoverflow.com/questions/11252753/rotate-x-axis-text-in-d3
     // and this: http://www.w3.org/TR/SVG/coords.html#TransformAttribute
     // basically, you just have to specify the angle of the rotation and you have
     // additional cx and cy points that you can use as the origin.
     // therefore you make cx and cy your actual points on the graph as if it was 0 angle change
     // you still need to make the y and x set as above*/

    setup_extra_labels = function (graph, scale_x, probe_num) {
        svg = graph.svg;
        scaleX = graph.scaleX;
        page_options = graph.page_options;
        options = graph.options;
        y_val = options.height + 10;
        //Below are used for calculating the positioning of the labels
        size_of_probe_collumn = graph.size_of_probe_collumn / options.data.length;
        padding = 2 * page_options.width_to_support_many_samples;
        sort_by_sample_id = options.sort_by_sample_id;

        svg.selectAll(".sample_type_text")
                .data(options.data).enter()
                .append("text") // when rotating the text and the size
                .text(function (d) {
                    // If the user does't want to have labels on the x axis we don't append the probe
                    if (sort_by_sample_id === "no") {
                        return get_state_type(d);
                    } else {
                        return d.Sample_ID;
                    }
                })
                        /*combination of this: http://stackoverflow.com/questions/11252753/rotate-x-axis-text-in-d3
                         and this: http://www.w3.org/TR/SVG/coords.html#TransformAttribute
                         basically, you just have to specify the angle of the rotation and you have
                         additional cx and cy points that you can use as the origin.
                         therefore you make cx and cy your actual points on the graph as if it was 0 angle change
                         you still need to make the y and x set as above */
                .attr("class", "x_axis_diagonal_labels")
                .style("text-anchor", "end")
                // Even though we are rotating the text and using the cx and the cy, we need to 
                // specify the original y and x  
                .attr("y", page_options.height + options.x_axis_label_padding)
                .attr("x",
                        function (d) {
                            if (sort_by_sample_id === "no") {
                                x_value = scale_x(get_state_type(d)) + (size_of_probe_collumn);
                            } else {
                                x_value = scale_x(d.Sample_ID);
                            }
                            return x_value;
                        }
                ) // when rotating the text and the size
                .style("font-family", options.font_style)
                .style("font-size", options.text_size)
                .attr("transform",
                        function (d, i) {
                            // actual x value if there was no rotation
                            if (sort_by_sample_id === "no") {
                                x_value = scale_x(get_state_type(d)) + (size_of_probe_collumn);
                            } else {
                                x_value = scale_x(d.Sample_ID);
                            }
                            y_value = y_val;
                            return "rotate(" + options.x_axis_text_angle + "," + x_value + "," + y_value + ")";
                        }
                );
        graph.svg = svg;
        return graph;
    };



},{}],3:[function(require,module,exports){

    /**
     * Copyright 2016 Ariane Mora
     *
     * The features are a set of extra features which can be called and
     * implememnted in any of the bioJS graphs. These are not integral to the
     * graphs functionality. Hover bars allow the users to view the groupings
     * more easily and error bars are only required on one dataset so have been
     * placed in the extra features doc.
     *
     */
 
    /**
     * sets up bars under the graph so that when the user hovers the mouse above it
     * Essentially sets a bar graph up under the scatter plot
     * This allows the user to easily see what "group" they are looking at
     * @param {type} graph
     * @returns {unresolved}
     */
    setup_hover_bars = function (graph, sample_id_list) {
        svg = graph.svg;
        options = graph.options;
        //sets up the tooltip which displys the sample type when the bar is hovered
        //over.
        tip = options.tip;
        svg.call(tip);
        opacity = 0; // start with the colour being white
        scaleX = graph.scaleX;
        scaleY = graph.scaleY;
        vertical_lines = graph.vertical_lines;
        page_options = graph.page_options;
        //once and first are place holder values to check if it is the first element
        //as these need to have a different amount of padding
        sample_id_count = 0;
        first = 0;
        once = 0;
        //the tooltip for hovering over the bars which displays the sample type
        var tooltip_sample;

        x_values_for_bars = new Array();
        //This is required so taht the bars stop midway between the two sample types (i.e. on the line)
        padding = (calculate_difference_between_samples(sample_id_list, scaleX)) / 2;

        //Appending the bar to the graph
        svg.selectAll(".bar")
                .data(vertical_lines) // use the options.data and connect it to the elements that have .dot css
                .enter() // this will create any new data points for anything that is missing.
                .append("rect")
                .attr("id", function (d) {
                    return d.sample_type;
                }
                )
                /* .attr("class", "bar")*/
                .style("opacity", opacity)
                .style("fill", "#FFA62F")
                .attr("x", function (d) {
                    sample_id_count++;
                    if (first === 0) {
                        first = 1;
                        //need to add a padding of 10 to make up for the padding on the grid
                        //so that the highlighted collumn goes to the edge
                        //options.padding spefies how far away the user would like the initial one
                        //to be from the start of the graph
                        return scaleX(d.start_sample_id) - padding * options.padding;
                    } else {
                        return scaleX(d.start_sample_id) - padding;
                    }
                })
                .attr("width", function (d, i) {
                    sample_id_count--;
                    if (once === 0) {
                        once = 1;
                        return scaleX(d.end_sample_id) - scaleX(d.start_sample_id) + 3 / 2 * options.padding * padding;
                    }
                    if (sample_id_count === 0) {
                        //if it is the last sample type need to account for padding of the graph
                        //which as with the beggining means there needs to be extra padding added
                        //This is beacuse rangeRoundPoints has been used for the domain, see that
                        //Comment for more detail on the use
                        return scaleX(d.end_sample_id) - scaleX(d.start_sample_id) + 3 / 2 * options.padding * padding;

                    } else {
                        return scaleX(d.end_sample_id) - scaleX(d.start_sample_id) + options.padding * padding;
                    }
                })
                .attr("y", 0)
                .attr("height", page_options.height - 2)
                .on("mouseover", function (d) {
                    //on the mouse over of the graph the tooltip is displayed (tranisition fades it in)
                    barOver = document.getElementById(d.sample_type);
                    barOver.style.opacity = "0.5";
                    tooltip_sample = d3.select("body").append("div")
                            .attr('class', 'tooltip')
                            .style("opacity", 1e-6)
                            .html(function () {
                                temp =
                                        "Sample Type: " + d.sample_type + "<br/>";
                                return temp;
                            });

                    tooltip_sample.style("opacity", 1);
                })
                .on("mousemove", function (d) {
                    //on mousemove it follows the cursor around and displayed the current sample type it is hovering over
                    tooltip_sample.html = "Sample Type: " + d.sample_type + "<br/>";
                    tooltip_sample.style('left', Math.max(0, d3.event.pageX - 150) + "px");
                    tooltip_sample.style('top', (d3.event.pageY + 20) + "px");
                    tooltip_sample.show;
                })
                .on("mouseout", function (d) {
                    tooltip_sample.remove();
                    barOver = document.getElementById(d.sample_type);
                    barOver.style.opacity = "0";
                });

        graph.svg = svg;
        return graph;
    };



    /**
     * Sets up the error bars (if there) still sets them up on the small graph
     * This feature can be enabled or disabled.
     */
    setup_error_bars = function (graph) {
        svg = graph.svg;
        options = graph.options;
        page_options = graph.page_options;
        scaleX = graph.scaleX;
        scaleY = graph.scaleY;
        tooltip = graph.options.tooltip;
        shape_rendering = "auto";
        //If the graph is small need the stroke width to be smaller
        stroke_width = options.error_stroke_width;
        dividor = options.error_dividor;

        /*  http://bost.ocks.org/mike/circles/
         This pattern is so common, you’ll often see the selectAll + data + enter + append methods called
         sequentially, one immediately after the other. Despite it being common, keep in mind that this
         is just one special case of a data join.
         */
        width = options.error_bar_width;

        svg.selectAll(".max").data(options.data).enter()
                .append("line") // append an object line
                .attr("class", "max")
                .attr("x1",
                        function (d) {
                            //Checks if the error is < 1% of the value (default - can be made more precise see options.error_dividor)
                            //If it is it doesn't paint the bars (x part)
                            if (((d.Expression_Value + d.Standard_Deviation) - d.Expression_Value) < (d.Expression_Value / dividor)) {
                                var temp = scaleX(d[options.x_column]);
                                return temp;

                            } else {
                                width = options.error_bar_width;
                                var temp = scaleX(d[options.x_column]) - width;
                                return temp;
                            }
                        }
                )
                .attr("x2",
                        function (d) {
                            if (((d.Expression_Value + d.Standard_Deviation) - d.Expression_Value) < (d.Expression_Value / dividor)) {
                                var temp = scaleX(d[options.x_column]);
                                return temp;
                            } else {
                                var temp = scaleX(d[options.x_column]) + width;
                                return temp;
                            }
                        }
                )
                .attr("y1",
                        function (d) {
                            if (((d.Expression_Value + d.Standard_Deviation) - d.Expression_Value) > 0) {
                                temp = scaleY(d.Expression_Value + d.Standard_Deviation);//upper value
                                return temp;
                            } else {
                                return 0;
                            }
                        }
                )
                .attr("y2",
                        function (d) {
                            if (((d.Expression_Value + d.Standard_Deviation) - d.Expression_Value) > 0) {
                                temp = scaleY(d.Expression_Value + d.Standard_Deviation);//upper value
                                return temp;
                            } else {
                                return 0;
                            }
                        }
                )
                .attr("shape-rendering", shape_rendering)
                .attr("stroke-width", stroke_width)
                .attr("stroke", "black")
                .on('mouseover', tooltip.show)
                .on('mouseout', tooltip.hide)
                .style("fill", 'none'); // color is black


        svg.selectAll(".min").data(options.data).enter()
                .append("line") // append an object line
                .attr("class", "min")
                .attr("x1",
                        function (d) {
                            //Checks if the error is < 1% (default - can be made more precise see options.error_dividor) of the value
                            // If it is it doesn't paint the bars (x part)
                            if (((d.Expression_Value + d.Standard_Deviation) - d.Expression_Value) < (d.Expression_Value / dividor)) {
                                var temp = scaleX(d[options.x_column]);
                                return temp;
                            } else {
                                var temp = scaleX(d[options.x_column]) + width;
                                return temp;
                            }
                        }

                )
                .attr("x2",
                        function (d) {
                            if (((d.Expression_Value + d.Standard_Deviation) - d.Expression_Value) < (d.Expression_Value / dividor)) {
                                var temp = scaleX(d[options.x_column]);
                                return temp;
                            } else {
                                var temp = scaleX(d[options.x_column]) - width;
                                return temp;
                            }
                        }

                )
                .attr("y1",
                        function (d) {
                            temp = scaleY(d.Expression_Value - d.Standard_Deviation);//lower value
                            return temp;
                        }
                )
                .attr("y2",
                        function (d) {
                            temp = scaleY(d.Expression_Value - d.Standard_Deviation);//lower value
                            return temp;
                        }
                )
                .attr("shape-rendering", shape_rendering)
                .attr("stroke-width", stroke_width)
                .attr("stroke", "black")
                .on('mouseover', tooltip.show)
                .on('mouseout', tooltip.hide)
                .style("fill", 'none'); // color is black


        svg.selectAll(".vertical").data(options.data).enter()
                .append("line") // append an object line
                .attr("class", "vertical")
                .attr("x1",
                        function (d) {
                            var temp = scaleX(d[options.x_column]);
                            return temp;
                        }
                )
                .attr("x2",
                        function (d) {
                            var temp = scaleX(d[options.x_column]);
                            return temp;
                        }
                )
                .attr("y1",
                        function (d) {
                            temp = scaleY(d.Expression_Value + d.Standard_Deviation);//
                            return temp;
                        }
                )
                .attr("y2",
                        function (d) {
                            temp = scaleY(d.Expression_Value - d.Standard_Deviation);
                            return temp;
                        }
                )
                .attr("shape-rendering", shape_rendering)
                .attr("stroke-width", stroke_width)
                .on('mouseover', tooltip.show)
                .on('mouseout', tooltip.hide)
                .attr("stroke-width", "2px")
                .attr("stroke", "black")
                .style("fill", 'none'); // color is black

        graph.svg = svg;
        return graph;
    }; // end setup_error_bars


},{}],4:[function(require,module,exports){

    /**
     * Copyright 2016 Ariane Mora
     * 
     * general.js contains a set of functions which are used by all the bioJS
     * modules in several tools. Such generic functions include creating the
     * SVG, setting up margins, generating defult options, setting up the water
     * mark, generating horizontal and vertical lines and titles.
     *
     */
 
    /* this is just to define the options as defaults: added numberFormat*/
    default_options = function () {

        var options = {
            target: "#graph",
            unique_id: "Sample_ID",
            margin: {top: 80, right: 0, bottom: 30, left: 0},
            height: 1500,
            width: 1060,
            x_axis_title: "Samples",
            y_axis_title: "Log2 Expression"
        };
        return options;

    }; // end  defaultOptions

    // Derived from http://bl.ocks.org/mbostock/7555321
    d3_wrap = function (text, width) {
        text.each(function () {
            var text = d3.select(this),
                    words = text.text().split(/\s+/).reverse(),
                    word,
                    line = [],
                    lineNumber = 0,
                    lineHeight = 1.1, // ems
                    y = text.attr("y"),
                    x = text.attr("x"), // set x to be x, not 0 as in the example
                    dy = parseFloat(text.attr("dy")); // no dy
            // added this in as sometimes dy is not used
            if (isNaN(dy)) {
                dy = 0;
            }
            tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

            while (word === words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    new_dy = ++lineNumber * lineHeight + dy; // added this in as well
                    tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", new_dy + "em").text(word).attr('text-anchor', 'middle');
                }
            }
        });
    }; // end d3_wrap


    // setup margins in a different function (sets up the page options (i.e. margins height etc)
    setup_margins = function (graph) {
        options = graph.options;
        //height = options.height;
        page_options.margin = options.margin;
        page_options.margin_left = options.margin.left;
        page_options.width = options.width;
        page_options.margin_top = options.margin.top;
        page_options.margin_bottom = options.margin.bottom;
        page_options.height = options.height;
        page_options.horizontal_grid_lines = options.horizontal_grid_lines;
        page_options.full_width = options.width + options.margin.left + options.margin.right;
        page_options.full_height = options.height + options.margin.top + options.margin.bottom;
        if (graph.graph_type == "Box Plot" || graph.graph_type == "Line Graph") {
            width_to_support_many_samples = 0;
            if (options.num_sample_types * options.box_width * 2 > options.width) {
                //Here we are compensating for any overflow that may occur due to many samples
                width_to_support_many_samples = options.box_width * 3;
            }
            page_options.width_to_support_many_samples = width_to_support_many_samples / 2;
            page_options.width = (width_to_support_many_samples * options.probe_count) + options.width;
            graph.page_options = page_options;
        }
        if (graph.graph_type == "Line Graph") {
            if (options.num_line_groups * options.box_width * 2 > options.width) {
                //Here we are compensating for any overflow that may occur due to many samples
                width_to_support_many_samples = options.box_width * 3;
            }
        }
        if (graph.graph_type == "Violin Plot") {
            if (options.num_line_groups * options.box_width * 2 > options.width) {
                //Here we are compensating for any overflow that may occur due to many samples
                width_to_support_many_samples = options.box_width * 3;
            }
        }
        graph.page_options = page_options;
        return graph;

    }; ///end setup margins


    set_data_order = function(graph) {
        if (options.sample_type_order !== "none") {
            options.data.sort(function(a, b) {
                return options.sample_type_order.indexOf(a.Sample_Type) - options.sample_type_order.indexOf(b.Sample_Type);
            })
        }
        return graph;
    }


    /**
     * Sets up the SVG element
     * @param {type} graph
     * @returns {unresolved}
     */
    setup_svg = function (graph) {
        options = graph.options;
        page_options = graph.page_options;
        full_width = page_options.full_width;
        full_height = page_options.full_height;

        graph.full_width = full_width;
        graph.full_height = full_height;
        background_stroke_width = options.background_stroke_width;
        background_stroke_colour = options.background_stroke_colour;

        // clear out html
        $(options.target)
                .html('')
                .css('width', full_width + 'px')
                .css('height', full_height + 'px');

        // setup the SVG. We do this inside the d3.tsv as we want to keep everything in the same place
        // and inside the d3.tsv we get the data ready to go (called options.data in here)
        var svg = d3.select(options.target).append("svg")
                .attr("width", full_width)
                .attr("height", full_height)
                .append("g")
                // this is just to move the picture down to the right margin length
                .attr("transform", "translate(" + page_options.margin.left + "," + page_options.margin.top + ")");


        // this is to add a background color
        // from: http://stackoverflow.com/questions/20142951/how-to-set-the-background-color-of-a-d3-js-svg
        svg.append("rect")
                .attr("width", page_options.width)
                .attr("height", page_options.height)
                .attr("stroke-width", background_stroke_width)
                .attr("stroke", background_stroke_colour)
                .attr("fill", options.background_colour);

        // this is the Main Title
        // http://bl.ocks.org/mbostock/7555321

        // Positions the title in a position relative to the graph
        height_divisor = 1.5;
        count = 0; // keeps track of the number of subtitles and if we
        // need to change the graph size to account for them

        svg.append("text")
        .attr("id","hurray")
            .attr("x", page_options.width/2)//options.x_middle_title)
            .attr("y", 0 - (page_options.margin.top /height_divisor) )
            // .attr("text-anchor", "middle")
            .text(options.title)
            .style("font-family", options.font_style)
            .style("font-size", options.title_text_size)
            .style("fill", "black");

        //Adds the subtitles to the graph
        for (i = 0; i < options.subtitles.length; i ++) {
            svg.append("text")
            .attr("id", "subtitle-"+ options.subtitles[i])
            .attr("x", page_options.width/2)//ptions.x_middle_title)
            .attr("y", function() {
                num = page_options.margin.top/height_divisor - (parseInt(options.text_size, 10) * (i + 1));
                if (num <= 0) {
                    count ++;
                }
                return 0 - num;
            })
            .attr("text-anchor", "middle")
            // Adds the class for the specific subtitle as specified
            .text(options.subtitles[i])//.attr("class",options.title_class+" subtitle" + i)
            .style("font-family", "Arial")
            .style("font-size", options.text_size)
            .style("fill", "black"); // changes done by Isha
            // .attr("class",options.title_class);
        }
        max_width_of_text = 800;
        suggested_width_of_text = options.width * 0.7;
        if (max_width_of_text < suggested_width_of_text) {
            width_of_title = max_width_of_text;
        } else {
            width_of_title = suggested_width_of_text;
        }
        svg.selectAll("." + options.title_class)
                .call(this.d3_wrap, width_of_title);
        graph.svg = svg;
        return graph;
    }; // setup_svg



    /*  Setting up the watermark */
    setup_watermark = function (graph) {
        svg = graph.svg;
        options = graph.options;

        svg.append("image")
                .attr("xlink:href", options.watermark)
                .attr("x", page_options.height / 2 - 100)
                .attr("y", -page_options.width - (page_options.margin_left/3))// just out of the graphs edge
                .attr("transform", "rotate(+90)")
                .attr("width", 200)
                .attr("height", 100);

        graph.svg = svg;
        return graph;
    }; // setup_watermark
   /**
     * This is to setup multiple horizontal lines with a label
     * colours can be chosen (options) otherwise a random colour is chosen
     * Horizontal lines are pre defined by the user. These can include:
     * Det line, or median line.
     * @param {type} graph
     * @returns {unresolved}
     */
    setup_horizontal_lines = function (graph) {
        svg = graph.svg;
        scaleX = graph.scaleX;
        scaleY = graph.scaleY;
        options = graph.options;
        width = page_options.width;
        lines = options.lines;
        horizontal_lines = options.horizontal_lines;
        font_size = options.text_size;
        margin_y_value = 20;
        colour_random = d3.scale.category20();
        //adds the horizontal lines to the graph. Colours are given, if no colour is given
        //a coloour is chosen at random.

        for (var i = 0; i < horizontal_lines.length; i++) {
            var name = horizontal_lines[i][0];
            //if no colours are defined pick one at random
            if (horizontal_lines[i][1] === undefined) {
                var colour = colour_random;
            } else {
                var colour = horizontal_lines[i][1];
            }
            var y_value = horizontal_lines[i][2];
            if (y_value != "NULL") {
              svg.append("line") // append an object line
                      .attr("class", "lines")
                      .attr("data-legend", function (d) {
                          return name;
                      })
                      .attr("x1", 0)
                      .attr("x2", width)
                      .attr("y1", scaleY(y_value))
                      .attr("y2", scaleY(y_value))
                      .attr("shape-rendering", "crispEdges")
                      .attr("stroke-width", options.line_stroke_width)
                      .attr("opacity", "0.6")
                      .style("stroke", colour);

              svg.append("text")
                      .attr("x", margin_y_value + (name.length * 3) + 15)
                      .attr("y", scaleY(y_value) - 10)
                      .text(name)
                      .attr("text-anchor", "middle")
                      .style("font-family", options.font_style)
                      .style("font-size", font_size)
                      .style("fill", colour)
                      .attr("class", options.title_class);

            }
                    }

        graph.svg = svg;
        return graph;
    }; // end setup_horizontal_lines

    /**
     * This changes the array of the user input into a easier format for
     * adding them to the graph
     * @param {type} graph
     * @returns {unresolved}
     */
    preprocess_lines = function (graph) {
        horizontal_lines = graph.options.horizontal_lines;
        lines = Array();
        for (key in horizontal_lines) {
            name = key;
            value = horizontal_lines[key];
            data_line = {'value': value, 'name': name};
            lines.push(data_line);
        }

        graph.options.lines = lines;

        return graph;
    };   // end preprocess_lines


    /* Similary with the code above this is used to calculate the interval between
     the scatter points, however this is used in the hover bars (slightly
     different as it uses the whole difference not 1/2 as with above */
    calculate_difference_between_samples = function (sample_id_list, scaleX) {

        prev_sample_id = sample_id_list[0];
        step_sample_id = sample_id_list[1];
        value = scaleX(step_sample_id) - scaleX(prev_sample_id);
        return value;
    };

 

    /**
     * Draws the vertical line on the x axis from the calculated x value above
     */
    setup_vertical_lines = function (graph, sample_id_list) {
        svg = graph.svg;
        vertical_lines = graph.vertical_lines;
        page_options = graph.page_options;
        svg.selectAll(".separator").data(vertical_lines).enter()
                .append("line")
                .attr("class", "separator")
                .attr("x1",
                        function (d, i) {
                            avg = calculate_x_value_of_vertical_lines(d, sample_id_list, scaleX, i, graph);
                            return avg;
                        }
                )
                .attr("x2",
                        function (d, i) {
                            avg = calculate_x_value_of_vertical_lines(d, sample_id_list, scaleX, i, graph);
                            return avg;
                        }
                )
                .attr("y1",
                        function (d) {
                            temp = 0;
                            return temp;
                        }
                )
                .attr("y2",
                        function (d) {
                            // this is to keep it within the graph
                            temp = page_options.height;
                            return temp;
                        }
                )
                .attr("shape-rendering", "crispEdges")
                .attr("stroke-width", options.line_stroke_width)
                .attr("opacity", "0.2")
                .attr("stroke", "black");

        graph.svg = svg;
        return graph;
    }; // //setup_vertical_lines


    /* Makes the tooltuip for the legend */
    make_legend_tooltip = function () {
        var tooltip_legend = d3.tip()
                .attr('class', 'd3-tip')
                .html(function (d) {
                    temp =
                            d + "<br/>";
                    return temp;
                });
        return tooltip_legend;
    };






    /* http://bl.ocks.org/ZJONSSON/3918369 and http://zeroviscosity.com/d3-js-step-by-step/step-1-a-basic-pie-chart
     Interactive legend which allows you to display and not display the legend*/
    setup_D3_legend = function (graph, legend_data) {
        svg = graph.svg;
        var legendSpacing = 4;
        options = graph.options;
        var legendRectSize = options.legend_rect_size;
        page_options = graph.page_options;
	if (options.show_legend_tooltip !== "no") {
            tooltip_legend = make_legend_tooltip();
            if (tooltip_legend !== null) {
                svg.call(tooltip_legend);
            }
        } else {
	    // tip which is displayed when hovering over a collumn. Displays the sample type 
	    //of the collumn
	    var tip_decoy = d3.tip()
    	    .attr('class', 'd3-tip');
                tooltip_legend = tip_decoy;
        }
        //Add a legend title
        svg.append("text")
                .attr("x", page_options.width + options.legend_padding)//options.x_middle_title)
                .attr("y", 0 - (page_options.margin.top / height_divisor))
                .attr("text-anchor", "middle")
                .text("Legend").attr("class", options.title_class)
                .style("font-family", options.font_style)
                .style("font-size", options.title_text_size)
                .style("fill", "black")
                .attr("class", options.title_class)
                .on('mouseover', function (d) {
                    if (options.display.legend_hover === "yes") {
                        var leg = document.getElementsByClassName("legendClass");
                        for (i = 0; i < leg.length; i++) {
                            if (leg[i].style.opacity !== 0) {
                                d3.select(leg[i]).style("opacity", 0);
                            } else {
                                d3.select(leg[i]).style("opacity", 1);
                            }
                        }
                    }
                });



        //Add the legend to the svg element
        var legend = svg.selectAll('.legend')
                .data(legend_data) //options.probs contains the name and colour of the probes
                .enter()
                .append('g')
                .attr('transform', function (d, i) {
                    var height = legendRectSize + legendSpacing;
                    // Probe count tells us how many samples we have
                    var offset = height / 2 + options.probe_count / 2; //the 20 is to allow for the text above
                    var horizontal = -2 * legendRectSize + page_options.width + options.legend_padding;
                    var vertical = i * height - offset;
                    return 'translate(' + horizontal + ',' + vertical + ')';
                })
                .on('mouseover', tooltip_legend.show)
                .on('mouseout', tooltip_legend.hide);

        var id = null;
        //Add legend squares
        legend.append('rect')
                .attr('width', legendRectSize)
                .attr('class', "legendClass")
                .attr('id', function (d, i) {
		    if (graph.graph_type !== "Scatter Plot") {
			return "legend-rect-" + d[i];
		    }
                    id = d[0];
                    return "legend-rect-" + d[0];
                    // Changed this from just probeInfo[0] for testing pupose's
                    // Make the id of the rectangle that of the probe name
                })
                .attr('height', legendRectSize)
                .style('fill', function (d, i) {
		    if (graph.graph_type !== "Scatter Plot") {
			return options.colour[i];
		    }
                    return d[1]; //First element stored in the probe array is colour
                })
                .style('stroke', function (d, i) {
		    if (graph.graph_type !== "Scatter Plot") {
			return options.colour[i];
		    }
                    return d[1]; //First element stored in the probe array is colour
                })
                .style('opacity', 1)
                .on('mouseover', function (d, i) {
		    if (graph.graph_type !== "Scatter Plot") {
			return;
		    }
                    var probe = d[0];
                    //Gets the elements by probe and assigns colour to the line (this is started off hidden)
                    var probe_group = document.getElementsByClassName("line-probe-" + probe.replace(/\ |(|)/g, ''));
                   for (i = 0; i < probe_group.length; i++) {
                        if (probe_group[i].style.opacity != 0) {
                            d3.select(probe_group[i]).style("opacity", 0);
                        } else {
                            d3.select(probe_group[i]).style("opacity", 1);
                        }
                    }
                }); //end on_click button

        //Add legend text
        legend.append('text')
                .attr("id", function (probeInfo) {
                    return "legend-text-" + probeInfo[0];
                    })
                .attr('class', "legendClass")
                .attr('x', legendRectSize + legendSpacing)
                .attr('y', legendRectSize - legendSpacing)
                .style("font-family", options.font_style)
                .style("font-size", options.text_size)
                .style('opacity', 1)
		.style("fill", function(probeInfo){
                  if(probeInfo[2] == "no") {
                    return 'black';
                  }
                  else {
                    return 'red';
                  }
                })
                .text(function (probeInfo) {
		   if(false) {
                          if (probeInfo[2] == "no") {return probeInfo[0];}
                          else {return probeInfo[0] +"*";}
                        }
                      else {
                        // Ariane -> ref_name was not defined it must be
                        // a global variable set elsewhere, I have moved it to
                        // the options
                        if (probeInfo[2] == "no") {return options.ref_name + " "+ probeInfo[0];}
                        else {return options.ref_name + " "+ probeInfo[0] +"*";}
                      }
 		});
        graph.svg = svg;
        return graph;
    };



},{}],5:[function(require,module,exports){
    /**
     * Copyright 2016 Ariane Mora
     *
     * A general set of tests that check that components have been rendered on
     * the svg. Other elemnets can be tested in addition and specific placement
     * and values should be tested as well.
     *
     */

    /**
     * This is the start of an automatic test which simply runs to check that
     * all the svg elements have been rendered correctly
     */ 
    run_tests = function (graph) {
        /* Run check for all scatter points */
        var options = graph.options;
        var data = options.data;
        check_num_points(options, data, graph);
        check_x_labels(options, data, graph);    
        check_horizontal_lines(options, graph);
        check_legend(options, data, graph);
        check_titles(options, graph);
        check_axis(options, graph);
        return graph;
    };
	
    /**
     * Checks that all the ticks are drawn and the correct number are drawn as
     * specified */  
    check_axis = function (options, graph) {
        /* Get all the tick elements */
        var ticks = document.getElementsByClassName("tick");
        /* Want to make sure that the largest tick is > the max value and
         * the smallest tick is < the smallest value */
        var min = 1000;
        var max = 0;
        for (var d in ticks) {
            var val = parseFloat(ticks[d].innerHTML);
            if (val  < min) {
                min = val;
            }
            if (val > max) {
                max = val;
            }
        }
        if (max < graph.max_val) {
            console.log("Ticks max val was too small");
        }
        if (min > graph.min_val) {
            console.log("Ticks min val was too large");
        }
        console.log("check for axis complete, num ticks: ", ticks.length);
    }

    /**
     * Checks that the titles are correctly printed    
     */ 
    check_titles = function (options, graph) {
        // Check main title
        var title_name = options.title;
        var title_size = options.title_text_size;
        var title = document.getElementById("title-"+ title_name);
        if (title.innerHTML !== title_name || title.style.fontSize
             !== title_size) {
            console.log("Error with text of main title: "+ title_name);
        }
        //Check the subtitles
        var subtitle_size = options.text_size;
        for (var d in options.subtitles) {
            var subtitle_name = options.subtitles[d];
            var subtitle = document.getElementById("subtitle-"+ subtitle_name);
            if (subtitle.innerHTML !== subtitle_name ||
                    subtitle.style.fontSize !== subtitle_size) {
                console.log("Error with text of sub title: "+ subtitle_name);
            }
        }
        console.log("Titles and subTitles have been checked");
    };
    
    /**
     * Checks that the legend is displayed correctly.
     * Checks the number of the rectangles and the text is displayed correctly
     */
    check_legend = function (options, data, graph) {
        // Use the probes that we from the data origionally
        var probes = options.probes; // Contains the probe info and colour
        for (var d in probes) {
            var probe_name = probes[d][0];
            var colour = probes[d][1].toUpperCase();
            var legend_text = document.getElementById("legend-text-"+ probe_name);
            var legend_rect = document.getElementById("legend-rect-"+ probe_name);
            /* Check the correct text is displayed maybe later implement
             * a check for the position */
            if (legend_text.innerHTML !== probe_name) {
                 console.log("Error with legend text: ", name);       
            }
            /* Check that the rectangle is correct colour and displaying */
            var rect_colour = legend_rect.style.fill.toUpperCase();
            var rect_height = parseFloat(legend_rect.getAttribute("height"));
            var rect_width = parseFloat(legend_rect.getAttribute("width"));
            if (rect_width !== options.legend_rect_size ||
                    rect_height !== options.legend_rect_size) {
                        console.log("Error with legend rect size: ", name);
            }
            if (rect_colour !== colour) {
                console.log("Error with legend rect colour: ", name);
            }
        }
        console.log("Checked Legend for correct rectangles being displayed and"
            + " legend text");
    } 

    /**
     * Checks the numeber of horizontal lines,
     * the text, the values and that they are drawn within the bounds of the
     * grpah
     */ 
    check_horizontal_lines = function (options, graph) {
        var horizontal_lines = options.horizontal_lines;
        var width = page_options.width;
        var font_size = options.text_size;
        var colour_random = d3.scale.category20();
	    for (var i = 0; i < horizontal_lines.length; i++) {
            var name = horizontal_lines[i][0];
            //if no colours are defined pick one at random
            if (horizontal_lines[i][1] === undefined) {
                var colour = colour_random;
            } else {
                var colour = horizontal_lines[i][1];
            }
            var y_value = horizontal_lines[i][2];
            /* Get element that should be renedered in html */
            var line = document.getElementById("horizontal-line-" + name);
            var line_text = document.getElementById("horizontal-line-text-" + name);       
            var y1 = parseFloat(line.getAttribute("y1"));
            var y2 = parseFloat(line.getAttribute("y2"));
            var x1 = parseFloat(line.getAttribute("x1"));
            var x2 = parseFloat(line.getAttribute("x2"));
            var max = graph.scaleY(graph.max_val);
            var min =  graph.scaleY(graph.min_val);
            var y_actual = parseFloat(graph.scaleY(y_value)); /* Round value */
            /* Want it to span the whole witdh and it to be a straight line */
            if ((x2 - x1) !== width || y1 !== y2 || y1 !== y_actual) {
                console.log("Error with horizontal line positioning: ", name);
            }
            /* Want to check it is within the graph note operands are flipped
             * as smaller values have a larger y value*/
            if (y1 > min || y1 < max) {
                 console.log("Error with horizontal line ouside bounds: ", name);
            }
            /* Check text is correct and has a size (i.e. is redered)*/
            if (line_text.innerHTML !== name) {
                console.log("Error with horizontal line text: ", name);
            }
            if (line_text.style.fontSize !== font_size) {
                console.log("Error with horizontal line text size: ", name);
            }
        }
        console.log("Horizontal lines have been checked for spanning page," + 
            " bounds, text_size and text");
    }


    /**
     * Checks there are the correct number of labels and they
     * have the correct text on the x axis
     */  
    check_x_labels = function (options, data, graph) {
        /* When we first read in the data we get the sample types
         * from this so itterate through and check that each one 
         * has a corrosponding label */
        var num_labels = 0;
        for (var d in options.x_labels) {
            var sample_name =  options.x_labels[d];
             var label = document.getElementById("xLabel-"
+  sample_name.replace(/\ |(|)/g,
''));
            var text = label.innerHTML;
            /* Check that it has the correct text*/
            if (text !== sample_name) {
                console.log("Error in x labels with sample: ", sample_name,
text);
            }
            /* Check that the stroke width is the correct one i.e. drawn */
            var family = label.style.fontFamily;
            var size = label.style.fontSize;
            if (family !== options.font_style) {
                 console.log("Error in style of x labels with sample: ",
sample_name);
            }
            if (size !== options.text_size) {
                 console.log("Error in size of x labels with sample: ",
                sample_name);
            }

        }
        console.log("x labels have been checked for size, font, text");   
    }
    
    /**
     * Checks the correct number of scatter points are drawn on a graph
     */  
    check_num_points = function (options, data, graph) {
        /* Check the correct number of scatter points were rendered 
         * and we have the correct number for each sample type  */
        var total_num_points = 0;
        for (var d in data) {
            var sample = data[d];
            var scatter_point = document.getElementById("scatter-point-"
                + sample.Sample_ID);
            /* Simple check to check that the point has a radius of the 
             * Correct size  */
            var radius = parseInt(scatter_point.getAttribute("r"));
            if (radius !== options.circle_radius) {
                console.log("error with following sample type: ",
                    sample.Sample_ID);
            }
            total_num_points ++; // We should have a point for each line in the
            // data set
        }
        console.log("Scatter points have been checked for size and number of " +
"points");
    }


},{}],"biojs-vis-box-plot":[function(require,module,exports){
/*
    Copyright 2015 Ariane Mora

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.


    This is a standalone unit to call when you want to create a box plot graph.

*/
var biojsvisboxplot;
var test = require('./test.js');
var general_setup = require('./general.js');
var axis = require('./axis.js');
var features = require('./features.js');
var barlinebox = require('./box_bar_line.js');
module.exports = biojsvisboxplot = function(init_options)
{

 

    /*
    This includes:
    - returning vertical_lines which is the basis for calculating the vertical lines that
    separate the sample types.
    - returning the sample_id_list that allows the scaleX.domain(sample_id_list) call to
    create the values for the x values of the samples for ordinal values
    - also want to store the starting sample_id of a sample type as well so that we can
    calculate the middle of the sample types to display just the sample type
    */
    setup_data_for_x_axis = function(graph){
          //Set up any lists needed for setting up x and y axis
        options = graph.options;
        nested_values = graph.nested_values;
        sort_by_diseases = false;
        if (options.sortByOption.split(",").length != 1) {
            sort_by_multiple = true;
        }
        sample_id_list = [];
        sample_type_list = [];
        disease_state_list = [];
        disease_state_count = 0; //Keeps track of how many disease types there are so we can evenly
        //Space them appart on the x-axis
        vertical_lines = [];
        probe_list = [];
        line_count = 0;
        for (probe in nested_values) {
            disease_state_count = 0;
            disease_state_list = [];
            row = nested_values[probe];
            key = row.key;

            values = row.values; //ONLY WILL WORK FOR SORTED BY DISEASES AT THE MOMENT
            if (options.sortByOption.split(",").length != 1) { //There will be a second key which is the disease state
                for (disease_states in values) {
                    row = values[disease_states];
                    disease_state = row.key;
                    // Keeps track of the disease state, if the disease state changes we know that we
                    // need a new vertical line (this is only important if we have sorted by disease
                    // state in addition to probes for the x axis
                    disease_state_list.push(disease_state);
                    disease_state_count ++;
                    //Update the starting sample id to the current end
                }
                multi_map = nested_values[probe].values[0].values[0].values[0]['Multi_Mapping']
            }
            else {
              multi_map = nested_values[probe].values[0].values[0]['Multi_Mapping']
            }
            temp = {};
            //Sort by disease state as well if we are having that on the x axis
            temp['probe'] = key;
            temp['mapping'] = multi_map;
            temp['disease_state_list'] = disease_state_list;
            vertical_lines.push(temp);
            line_count ++;
        }
        graph.probe_count = line_count;
        graph.vertical_lines = vertical_lines;
        graph.sample_type_list = sample_type_list;
        graph.probe_list = probe_list;
        graph.disease_state_list = disease_state_list;
        graph.disease_state_count = disease_state_count;
        graph.sample_id_list = sample_id_list;
        return graph;
    } // setup_data_for_x_axis

   // Sorts the sorted probe types by disease state if necesary so that they can
    // be grouped by both disease state and probe on the x axis
    // http://bl.ocks.org/phoebebright/raw/3176159/ for sorting
    sort_x_by_probe_and_disease_state = function(graph) {
        options = graph.options;
        //Check if there is an order given for the disease states, if none given order by dataset
        if (options.sortByOption.split(",").length != 1) {
            order_types = options.sortByOption.split(",");
            sample_type_order = options.sample_type_order.split(',');
            nested_values = d3.nest()
                .key(function(d) {
                    return d.Probe;
                })
                .sortKeys(function(a, b) {
                    return probe_order.indexOf(a) - probe_order.indexOf(b);
                })
                .key(function (d) {
                  value = options.sortByOption[0]
                    return d[value];
                })
                .key(function(d) {
                    return d.Sample_Type;
                })
                .sortKeys(function(a,b){return sample_type_order.indexOf(a) - sample_type_order.indexOf(b);})
                .entries(options.data);
        } else {
            sample_type_order = options.sample_type_order.split(',');
            nested_values = d3.nest()
                .key(function(d) {
                    return d.Probe;
                })
                .key(function(d) {
                    return d.Disease_State;
                })
                .key(function(d) {
                    return d.Sample_Type;
                })
               .sortKeys(function(a,b){return sample_type_order.indexOf(a) - sample_type_order.indexOf(b);})
               .entries(options.data);
        }
        graph.nested_values = nested_values;
        return graph;
    }

    /* Sorts the probes on a given order or default is by the dataset */
    sort_x_by_probe = function(graph) {
        options = graph.options;
        //Check no probe order has been given, if none given order by dataset

        if (options.probe_order != "none") { //changes done by Isha
          if (options.sortByOption.split(",").length != 1) {
                order_types = options.sortByOption.split(",");
                sample_type_order = options.sample_type_order.split(',');
                nested_values = d3.nest()
                    .key(function(d) {
                        return d.Probe;
                    })
                    .sortKeys(function(a, b) {
                        return probe_order.indexOf(a) - probe_order.indexOf(b);
                    })
                    .key(function (d) {
                      value = order_types[0]
                        return d[value];
                    })
                    .key(function(d) {
                        return d.Sample_Type;
                    })
                    .sortKeys(function(a,b){return sample_type_order.indexOf(a) - sample_type_order.indexOf(b);})
                    .entries(options.data);
          }
          else {
                if(options.sortByOption == "Sample_Type") {
                    probe_order = options.probe_order;
                    sample_type_order = options.sample_type_order;
                    nested_values = d3.nest()
                        .key(function(d) {
                            return d.Probe;
                        })
                        .sortKeys(function(a, b) {
                          // change sdone by ISha to correct probe order
                            return probe_order.indexOf(a) - probe_order.indexOf(b);
                        })
                        .key(function(d) {
                            return d.Sample_Type;
                        })
                        .sortKeys(function(a,b){return sample_type_order.indexOf(a) - sample_type_order.indexOf(b);})
                        .entries(options.data);
                }
                else if(options.sortByOption != "null") {
                  probe_order = options.probe_order;
                     nested_values = d3.nest()
                             .key(function(d) {
                                 return d.Probe;
                             })
                             .sortKeys(function(a, b) {
                               // change sdone by ISha to correct probe order
                                 return probe_order.indexOf(a) - probe_order.indexOf(b);
                             })
                             .key(function (d) {
                               value = options.sortByOption
                                 return d[value];
                             })
                             .entries(options.data);
               }
          }
        } else {
          sample_type_order = options.sample_type_order.split(',');
            nested_values = d3.nest()
                .key(function(d) {
                    return d.Probe;
                })
                .key(function(d) {
                    return d.Sample_Type;
                })
               .sortKeys(function(a,b){return sample_type_order.indexOf(a) - sample_type_order.indexOf(b);})
               .entries(options.data);

        }
        graph.nested_values = nested_values;
        return graph;
    }


   
     /* Calculates interval between the probes
     * also used for calculating the distance bwteen the disease states
     */
    calculate_x_value_of_probes = function(graph) {
        options = graph.options;
        width = options.width;
        scaleX = graph.scaleX;
        probe_count = graph.probe_count;
        section_size = (width/ probe_count);
        graph.size_of_disease_state_collumn = section_size;
        graph.size_of_probe_collumn = section_size;
        return graph;
    } // calculate_x_value_of_probes

    /* Calculates interval between the probes
     * also used for calculating the distance bwteen the disease states
     */
    calculate_x_value_of_disease_state1 = function(graph) {
        options = graph.options;
        width = options.width;
        probe_count = graph.probe_count;
        scaleX = graph.scaleX;
        disease_state_count = graph.disease_state_count;
        section_size = (width/probe_count)/disease_state_count;
        graph.size_of_disease_state_collumn = section_size;
        return graph;
    } // calculate_x_value_of_probes

    /* Adds disease state labels to the bottom of the graph these are before the probe*/
    setup_disease_state_labels = function (graph) {
        svg = graph.svg;
        scaleX= graph.scaleX;
        sample_id_list = graph.sample_id_list;
        nested_values = graph.nested_values;
        page_options = graph.page_options;
        options = graph.options;
        initial_padding = graph.page_options.width_to_support_many_samples;
        //Below are used for calculating the positioning of the labels
        size_of_disease_state_collumn = graph.size_of_disease_state_collumn;
        full_size_of_a_probe_collumn = graph.size_of_probe_collumn;
        count = 0;
        for (probe in vertical_lines) {
            padding = (initial_padding * parseInt(probe) * 2) + (full_size_of_a_probe_collumn * parseInt(probe));
            probe = vertical_lines[probe];
            disease_state_list = probe.disease_state_list;
            count = 0;
            for (disease in disease_state_list) {
                current_state = disease_state_list[disease];
                svg.append("text") // when rotating the text and the size
                    .text(
                        function(d, i){
                            // If the user does't want to have labels on the x axis we don't append the probe
                                return current_state;
                    })
                    .attr("class", "x_axis_diagonal_labels")
                    .style("text-anchor", "end")
                    // Even though we are rotating the text and using the cx and the cy, we need to
                    // specify the original y and x
                    .attr("y", page_options.height)
                    .attr("x", function() {
                            x = padding + (size_of_disease_state_collumn * (parseInt(disease) + 1));
                            if (vertical_lines.length <=2) {
                                x = padding + (size_of_disease_state_collumn * (parseInt(disease) + 1)) - (size_of_disease_state_collumn/2) + (size_of_disease_state_collumn * 0.15);
                            }
                            return x;
                        })
                     // when rotating the text and the size
                    .style("font-family", options.font_style)
                    .style("font-size", options.text_size)
                    .attr("transform", function() {
                            // actual x value if there was no rotation
                            x_value = padding + (size_of_disease_state_collumn * (parseInt(disease) + 1)) + (0.2 * graph.size_of_disease_state_collumn);
                            // actual y value if there was no rotation
                            if (vertical_lines.length <=2) {
                                x_value = padding + (size_of_disease_state_collumn * (parseInt(disease) + 1)) - (size_of_disease_state_collumn/2) + (size_of_disease_state_collumn * 0.15);
                            }
                            y_value = page_options.height + options.x_axis_padding;
                            return "rotate("+options.x_axis_text_angle+","+x_value+","+y_value+")";
                        }
                     );
                    count ++;
                }
            }

        graph.svg = svg;
        return graph;
    }

 /*------------------------------Box plot Calculations--------------------------------------*/
    /* Sets up the box plot */
    setup_box_plot = function(graph) {
        sample_types_with_colour = {}
        colour_count = 0;
        options = graph.options;
        nested_values = graph.nested_values;
        disease_state = "";
        sample_type_list = [];
        id = 1; //  NOTE CHANGE THISLATER
         for (probe in nested_values) {
            row = nested_values[probe];
            values = row.values;
            probe_name = row.key;
            if (options.sortByOption.split(",").length != 1) { // changes done by Isha
                number_sample_types = options.sample_type_order.split(",").length; //There will be a second key which is the disease stat
                for (disease_states in values) {
                    row = values[disease_states];
                    disease_values = row.values;
                    disease_state = row.key;

                    // These are the expression values for a specific sample grouped by the probe
                    // then the disease type so now we need to append all the expression values for this
                    // group then calculate the box plot and draw the values
                    for (sample_types in disease_values) {
                        sample_row = disease_values[sample_types];
                        var nan_counter = 0;
                        sample_values = sample_row.values;
                        sample_type = sample_row.key;
                        if($.inArray(sample_type, sample_type_list) == -1) {
                            sample_type_list.push(sample_type);
                        }
                        expression_values = [];
                        //At the level of the xcel file now
                        for (x in sample_values) {
                          if(sample_values[x].Expression_Value == sample_values[x].Expression_Value){
                            expression_values.push(sample_values[x].Expression_Value);
                          }
                          else{
                            nan_counter ++;
                          }
                        }
                        for(j=0; j<sample_type_list.length; j++ ) {
                          if(!sample_types_with_colour[sample_type_list[j]])
                          {sample_types_with_colour[sample_type_list[j]] = options.colour[colour_count];
                          if(colour_count < options.colour.length) {colour_count++;}
                          else {colour_count = 0;}}
                        }
                        //Now have all the expression values for a specific sample type so we create box
                        //plot and calculate the values
                        if(expression_values.length != 0) {
                              if (options.bar_graph == "yes") {
                              box_plot_vals = calculate_box_plot_vals_bar(expression_values);
                            } else {
                                box_plot_vals = calculate_box_plot_vals(expression_values);
                            }// Actually draw the box plot on the graph
                            graph = draw_box_plot(expression_values, graph, box_plot_vals, parseInt(probe), parseInt(disease_states), parseInt(sample_types), number_sample_types, probe_name, sample_type, disease_state,nan_counter);
                        }
                    }
                }
            } else {
                number_sample_types = values.length;
                for(sample_types in values) {
                    sample_row = values[sample_types];
                    sample_values = sample_row.values;

                    sample_type = sample_row.key;
                    if($.inArray(sample_type, sample_type_list) == -1) {
                        sample_type_list.push(sample_type);
                    }
                    expression_values = [];
                    disease_states = [];
                    disease_state_names = "";
                    //At the level of the xcel file now
                    for (x in sample_values) {
                        expression_values.push(sample_values[x].Expression_Value);
                        if ($.inArray(sample_type, disease_states) == -1) {
                            disease_states.push(sample_type);
                        }
                    }
                    for(j=0; j<sample_type_list.length; j++ ) {
                      if(!sample_types_with_colour[sample_type_list[j]])
                      {sample_types_with_colour[sample_type_list[j]] = options.colour[colour_count];
                      if(colour_count < options.colour.length) {colour_count++;}
                      else {colour_count = 0;}}
                    }
                    for (disease in disease_states) {
                        disease_state_names = disease_states[disease] + " " + disease_state_names;
                    }
                    //Now have all the expression values for a specific sample type so we create box
                    //plot and calculate the values
                    var nan_counter = 0;
                    expression_values = expression_values.filter(function(v) {if(v==v){
                                                            return true;}
                                                            else{
                                                              nan_counter ++;
                                                              return false;
                                                          }});
                    // changes done by Isha
                    if(expression_values.length != 0) {
                      if (options.bar_graph == "yes") {
                          box_plot_vals = calculate_box_plot_vals_bar(expression_values);
                      } else {
                          box_plot_vals = calculate_box_plot_vals(expression_values);
                      }
                      // Actually draw the box plot on the graph
                      graph = draw_box_plot(expression_values, graph, box_plot_vals, parseInt(probe), 0, parseInt(sample_types), number_sample_types, probe_name, sample_type, disease_state_names, nan_counter);
                    }

                }
            }
        }
        graph.sample_type_list = sample_type_list;
        return graph;
    }

    add_scatter_to_box = function(graph, scatter_values, median_line, sample_type, colour, colour_stroke) {
        options = graph.options;
        radius = options.radius;
        svg = graph.svg;
        svg.selectAll(".dot") // class of .dot
            .data(scatter_values) // use the options.data and connect it to the elements that have .dot css
            .enter() // this will create any new data points for anything that is missing.
            .append("circle") // append an object circle
            .attr("class", function(d) {
                    //adds the sample type as the class so that when the sample type is overered over
                    //on the x label, the dots become highlighted
                    return "sample-type-" + sample_type})
            .attr("r", radius) //radius 3.5
            .attr("cx", median_line)
            .attr("cy", function(d) {
                // set the y position as based off y_column
                // ensure that you put these on separate lines to make it easier to troubleshoot
                var cy =  scaleY(d);
                return cy;
            })
            .style("stroke", colour_stroke)
            .style("stroke-width","1px")
            .style("fill", colour)
            .attr("opacity", 0.8)
           .on('mouseover', tooltip_box.show)
           .on('mouseout', tooltip_box.hide);

            return svg;
    }

    make_box_tooltip = function(probe, sample_type, disease_state,nan_counter) {
        var tooltip_box = d3.tip()
            .attr('class', 'd3-tip')
            .offset([0, +110])
            .html(function(d) {
               if(nan_counter == 0){
                 temp =
                    "Probe: " + probe + "<br/>" +
                    "Sample: " + sample_type +"<br/>"
                  if(options.sortByOption.split(",").length != 1) {
                    temp = temp +  "State: " + disease_state +"<br/>"
                  }
                }
                else {
                  temp =
                       "Probe: " + probe + "<br/>" +
                       "Sample: " + sample_type +"<br/>" +
                       nan_counter +" Sample Removed Due to Floored Values " + "<br/>"

                   if(options.sortByOption.split(",").length != 1) {
                     temp = temp +  "State: " + disease_state +"<br/>"
                   }
                }
                return temp;
            });
        return tooltip_box;
    }


    /* Draw box plot draws the box and wiskers onto the graph and also if it is a bar graph this is drawn on too */
    draw_box_plot = function(samples, graph, box_plot_vals, probe, disease_state, sample_type, number_sample_types, probe_name, sample_type_name, disease_state_name,nan_counter) {
        svg = graph.svg;
        scaleY = graph.scaleY;
        scaleX = graph.scaleX;
        options = graph.options;
        tooltip_box = make_box_tooltip(probe_name, sample_type_name, disease_state_name,nan_counter);
        jitter = options.jitter;
        svg.call(tooltip_box);
        box_width = options.box_width;
        if((box_width*options.num_sample_types * options.probe_count) > options.width) {
          box_width = options.width / (options.num_sample_types * options.probe_count);
        }
        if(options.sortByOption.split(",").length != 1) {
          for(i=0; i<nested_values[0].values.length; i++) {
            box_width = Math.min(box_width, (graph.size_of_disease_state_collumn / nested_values[0].values[i].values.length))
          }

        }
        box_width_wiskers =options.box_width_wiskers; //assumes box width > box_width wiskers
        // changes done by Isha
        colour_box = sample_types_with_colour[sample_type_name];
        if(options.whiskers_needed == true) {
          colour_wiskers = sample_types_with_colour[sample_type_name];
        }
        else {
          colour_wiskers = undefined;
        }
        colour_median = "white";
        id = probe_name + "-" + sample_type_name + "-" + disease_state_name;
        stroke_width = options.stroke_width;
        stroke_width_num = options.stroke_width_num;
        probe_size = graph.size_of_probe_collumn;
        disease_state_size = graph.size_of_disease_state_collumn;
        if(options.sortByOption.split(",").length == 1 ) {
          sample_type_size = disease_state_size/(nested_values[0].values.length );
        }
        else {
          sample_type_size = disease_state_size/(nested_values[0].values[0].values.length +1 );
        }
        x_buffer = 0;
        counter = 0;
        if (sample_type_size * 3 < box_width && options.bar_graph == "yes" && (options.sortByOption.split(",").length == 1)) {
              if(sample_type_size < box_width) {
                box_width = sample_type_size/2;
                stroke_width_num = sample_type_size/4;
                x_buffer = (number_sample_types * box_width);
              }
        }
        if (sample_type_size *3.25 < box_width && options.bar_graph == "no" && (options.sortByOption.split(",").length == 1)) {
            box_width = sample_type_size * 4/5;
        }

        if (number_sample_types == 1) {
            number_sample_types = 5/3;
        }
        x_buffer += (0.75 * graph.page_options.width_to_support_many_samples) +  (2 * graph.page_options.width_to_support_many_samples * (probe)) + (probe_size * probe) + (disease_state_size * disease_state);
        //Add vertical lline
        if (options.probe_count == 1 && options.sortByOption.split(",").length == 1 && options.bar_graph == "yes") {
            x_buffer = (sample_type_size * (sample_type)) + (sample_type_size * 3 / 8);
            // padding_val = ((page_options.width)/options.probe_count - (number_sample_types * box_width))/5;
            // changes done by Isha
            if((x_buffer < 0) && (diff_val == 0)){
              diff_val = 0 - x_buffer;
              // padding_val = (page_options.width - (number_sample_types * box_width))/3;
              counter ++;
            }

            if((diff_val != 0)){
                counter = 0;
            }
            x_buffer = x_buffer + diff_val+padding_val;
            opacity = 0.4;

            svg = add_vertical_line_to_box(options.stroke_width, x_buffer + box_width*0.5, box_plot_vals[0], box_plot_vals[2], svg, scaleY, colour_wiskers);
        }
        else if (options.bar_graph == "yes") {
            opacity = 0.4;
            // padding_val = ((page_options.width)/options.probe_count - (number_sample_types * box_width))/5;

            if (options.sortByOption.split(",").length == 1) {
                // x_buffer = x_buffer + (probe_size / number_sample_types) - (number_sample_types/2 * box_width) - (number_sample_types/2 * stroke_width_num) + (sample_type * box_width) + (sample_type *stroke_width_num) ;
                // changes done by Isha
                x_buffer += (sample_type_size * (sample_type)) + (sample_type_size * 3/8);
            } else {
                // x_buffer = x_buffer + (disease_state_size / number_sample_types) - (number_sample_types/2 * box_width) - (number_sample_types/2 * stroke_width_num) + (sample_type * box_width) + (sample_type *stroke_width_num) ;
                  x_buffer += (sample_type_size * (sample_type)) + (sample_type_size * 3/8);
            }
            if((x_buffer < 0) && (diff_val == 0)){
              diff_val = 0 - x_buffer;
              padding_val = (page_options.width - (number_sample_types * box_width))/3;
              counter++;
            }
            if(diff_val != 0){
              counter = 0;
            }
            x_buffer = x_buffer + diff_val+padding_val;
            svg = add_vertical_line_to_box(options.stroke_width, x_buffer + box_width*0.5, box_plot_vals[0], box_plot_vals[2], svg, scaleY, colour_wiskers);
        } else {
            opacity = 1;
            x_buffer += (sample_type_size * (sample_type)) + (sample_type_size * 3 / 8);
            svg = add_vertical_line_to_box(options.stroke_width, x_buffer + box_width*0.5, box_plot_vals[0], box_plot_vals[4], svg, scaleY, colour_wiskers);
        }
        //---------------------------Want to add the correct tooltip -> this is taken as the first data point in the box ---------------------//
        var data = options.data[probe * disease_state];
        //Add box
        svg.append("rect")
            .attr('width', box_width)
            .attr('x', x_buffer)
            .attr('id', id)
            .attr('y', function(d) {
                    if (options.bar_graph == "yes") {
                      // changes done By Isha to handle bar on negative axis
                        temp = scaleY(Math.max(0,box_plot_vals[1]));
                    } else {
                        temp = scaleY(box_plot_vals[3]);
                    }
                    return temp;
            })
            .attr('height', function(d) {
                    if (options.bar_graph == "yes") {
                        temp = Math.abs(scaleY(0) - scaleY(box_plot_vals[1]));
                    } else {
                        temp = scaleY(box_plot_vals[1]) - scaleY(box_plot_vals[3]);
                    }
                    if(temp == 0) {temp = 2;}
                return temp;
                })
            .attr("fill", sample_types_with_colour[sample_type_name])
            .attr("opacity", opacity)
            .on("mouseover", tooltip_box.show)
            .on("mouseout", tooltip_box.hide);

        //Add min line
        if (options.bar_graph == "yes") {

              if(box_width < 5){
                //Add min line
                svg = add_line_to_box(options.stroke_width, x_buffer , box_width, box_plot_vals[0], svg, scaleY, colour_wiskers, box_width_wiskers, "no");
                //Add max line
                svg = add_line_to_box(options.stroke_width, x_buffer , box_width, box_plot_vals[2], svg, scaleY, colour_wiskers, box_width_wiskers, "no");
              }
              else {
                //Add min line
                svg = add_line_to_box(options.stroke_width, x_buffer , box_width, box_plot_vals[0], svg, scaleY, colour_wiskers, box_width_wiskers, "yes");
                //Add max line
                svg = add_line_to_box(options.stroke_width, x_buffer , box_width, box_plot_vals[2], svg, scaleY, colour_wiskers, box_width_wiskers, "yes");
              }
              //Add median lines
              svg = add_line_to_box(options.stroke_width, x_buffer, box_width, box_plot_vals[1], svg, scaleY, colour_box, box_width_wiskers,"yes");

            //Add outside lines
            svg = add_vertical_line_to_box(options.stroke_width, x_buffer, 0, box_plot_vals[1], svg, scaleY, colour_box);
            svg = add_vertical_line_to_box(options.stroke_width, x_buffer + box_width, 0, box_plot_vals[1], svg, scaleY, colour_box);
        } else {
           //Add max line
            svg = add_line_to_box(options.stroke_width, x_buffer, box_width, box_plot_vals[0], svg, scaleY, colour_wiskers, box_width_wiskers,"yes");
            //Add median line
            svg = add_line_to_box(options.stroke_width, x_buffer + box_width*.25, box_width*0.5, box_plot_vals[2], svg, scaleY, colour_median, 0,"yes");
            //Add max line
            svg = add_line_to_box(options.stroke_width, x_buffer, box_width, box_plot_vals[4], svg, scaleY, colour_wiskers, box_width_wiskers,"yes");
        }
        //Option to allow the user to test their values
        if (options.test == "yes") {
            test_values(disease_state_name + " " + probe_name + "|" + sample_type_name, box_plot_vals, graph, options);
        }
        if (options.draw_scatter_on_box == "yes" && jitter != "yes") {
            svg = add_scatter_to_box(graph, samples, x_buffer + box_width/2, sample_type, "white", "black");
        } else if (options.draw_scatter_on_box == "yes" && jitter == "yes") {
            svg = draw_jitter_scatter(graph, samples, x_buffer + (box_width/4), box_width, sample_type, "white", colour_box);
        }
        graph.svg = svg;
        return graph;
    }

    draw_jitter_scatter = function(graph, samples, x, box_width, sample_type, colour, colour_stroke) {
        scaleXBox = d3.scale.ordinal()
            .rangePoints([x, x + box_width]);
       options = graph.options;
        radius = options.radius;
        scaleXBox.domain(samples);
        svg = graph.svg;
        scale = (box_width/2) / samples.length;
        svg.selectAll(".dot") // class of .dot
            .data(samples) // use the options.data and connect it to the elements that have .dot css
            .enter() // this will create any new data points for anything that is missing.
            .append("circle") // append an object circle
            .attr("class", function(d) {
                    //adds the sample type as the class so that when the sample type is overered over
                    //on the x label, the dots become highlighted
                    return "sample-type-" + sample_type})
            .attr("r", radius) //radius 3.5
            .attr("cx", function(d, i) {
                    cx = x + (scale * i);
                    return cx;
                    })
            .attr("cy", function(d) {
                // set the y position as based off y_column
                // ensure that you put these on separate lines to make it easier to troubleshoot
                var cy =  scaleY(d);
                return cy;
            })
            .style("stroke", colour_stroke)
            .style("stroke-width","1px")
            .style("fill", colour)
            .attr("opacity", 0.8);
           // .on('mouseover', tooltip.show)
           // .on('mouseout', tooltip.hide);

            return svg;

    }


    /* A small function to test the values from the computed values
     * Checks values from graphs downloaded from stemformatics */
    test_values = function(name, box_plot_vals, graph, options) {
        //var fs = require('fs');
        //name in format as saved by stemformatics: name, average. standard deviation, min, max, median, Q1, Q3
        row = name + "," + 0 + "," + 0 + "," + box_plot_vals[0] + "," + box_plot_vals[4] + "," + box_plot_vals[2] + "," + box_plot_vals[1] + "," + box_plot_vals[3];
        if (options.bar_graph == "yes") {
            row = name + "," + box_plot_vals[1] + "," + 0 + "," + box_plot_vals[0] + "," + box_plot_vals[2] + "," + 0 + "," + 0 + "," + 0;
        }
        //console.log(row);
        /*fs.writeFile(options.test_path, row, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        }); */
    }

	get_mean_value = function(values) {
		sum = 0;
        for (i in values) {
            sum += values[i];
        }
        mean = sum / values.length;
        return mean;
	}


    add_line_to_box = function(stroke_width, x_buffer, box_width, y_value, svg, scaleY, colour, box_width_wiskers,median) {
      // changes done by Isha
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
                    .on("mouseover", tooltip_box.show)
                    .on("mouseout", tooltip_box.hide);
          }
          else {
            svg.append("line")
                    .attr("x1", (x_buffer ))
                    .attr("x2", (x_buffer + box_width))
                    .attr("y1", scaleY(y_value))
                    .attr("y2", scaleY(y_value))
                    .attr("shape-rendering","crispEdges")
                    .attr("stroke-width",stroke_width)
                    .attr("stroke", colour)
                    .on("mouseover", tooltip_box.show)
                    .on("mouseout", tooltip_box.hide);
          }

        }
        else {
          svg.append("line")
                  .attr("x1", (x_buffer - box_width/4) + box_width_wiskers)
                  .attr("x2", (x_buffer + box_width* 1.25) - box_width_wiskers)
                  .attr("y1", scaleY(y_value))
                  .attr("y2", scaleY(y_value))
                  .attr("shape-rendering","crispEdges")
                  .attr("stroke-width",stroke_width)
                  .attr("stroke", colour)
                  .on("mouseover", tooltip_box.show)
                  .on("mouseout", tooltip_box.hide);;
        }

        return svg;
    }

    add_vertical_line_to_box = function(stroke_width, x_position, y_lower, y_upper, svg, scaleY, colour_wiskers) {
        svg.append("line")
            .attr("x1", x_position)
            .attr("x2", x_position)
            .attr("y1", scaleY(y_lower))
            .attr("y2", scaleY(y_upper))
            .attr("shape-rendering","crispEdges")
            .attr("stroke-width",stroke_width)
            .attr("stroke", colour_wiskers)
            .on("mouseover", tooltip_box.show)
            .on("mouseout", tooltip_box.hide);;
        return svg;
}
    /* Takes the array of samples for a specific sample type
     * already ordered */
    calculate_box_plot_vals_bar = function(values) {
        min_max_vals = return_min_max_vals(values);
        var mean = get_mean_value(values);
        sum = 0;
        numbers_meaned = [];
        for (x in values) {
            numbers_meaned.push(Math.abs(values[x] - mean));
        }
        standard_deviation = get_mean_value(numbers_meaned);
        min = min_max_vals[0];
        max = min_max_vals[1];
        return [mean - standard_deviation, mean, mean + standard_deviation];
    }

    /* Takes the array of samples for a specific sample type
     * already ordered */
    calculate_box_plot_vals = function(values) {
        min_max_vals = return_min_max_vals(values);
        var median = get_median_value(values);
        max_quartile = [];
        min_quartile = [];
        for(i in values) {
            if (values[i] >= median) {
                max_quartile.push(values[i]);
            }
            // changes done by isha
            if (values[i] <= median) {
                min_quartile.push(values[i]);
            }
        }
        min_quartile_median = get_median_value(min_quartile);
        max_quartile_median = get_median_value(max_quartile);
        min = min_max_vals[0];
        max = min_max_vals[1];
        return [min, min_quartile_median, median, max_quartile_median, max];
    }

    //Returns the max and minimum values from the daa set
    return_min_max_vals = function(values) {
      // changes done by Isha for caculating box plot for negative values
        max_val = -50;
        min_val = 100;

        for (sample_value in values) {
            if (values[sample_value] < min_val) {
                min_val = values[sample_value];
            }
            if (values[sample_value] > max_val) {
                max_val = values[sample_value];
            }
        }
        return [min_val, max_val];
    }


	//Returns the median value from a set of values
	//https://gist.github.com/caseyjustus/1166258
	get_median_value = function(values) {

		values.sort(function(a, b) {return a-b});
		med = Math.floor(values.length/2);
		if (values.length % 2) {
			return values[med];
		} else {
			return ((values[med - 1] + values[med]) / 2.0);
		}
	}

	/* Gets the 3 important values for the box plot
	 * Median
	 * Lower median value
	 * upper median value
	 */
	get_box_plot_values = function(graph) {
		options = graph.options;
		expression_values = [];
		lwr_half_of_Expresssion_vals = [];
		upr_half_of_expression_vals = [];

		get_expression_values = d3.extent(options.data, function(d) {
			expression_values.append(d.Expression_Value);
			return d.Expression_Value;
		});
		get_expression_values.sort(function(a, b) {return a-b});
		median_val = get_median_value(expression_values);
		for(val in expression_values) {
			if (val < median_val) {
				lwr_half_of_expresssion_vals.append(val);
			} else if (val > median_val) {
				upr_half_of_expression_vals.append(val);
			}
		}
		third_quartile = get_median_value(lwr_half_of_expresssion_vals);
		first_quartile = get_median_value(upr_half_of_expression_vals);
		graph.median_val = median_val;
		graph.third_quartile = third_quartile;
		graph.first_quartile = first_quartile;
		return graph;
	}

    /*------------------------End of box plot calculations -----------------------------------*/
    /* Adds probe labels to the bottom of the graph */
    setup_probe_labels = function (graph) {
        svg = graph.svg;
        scaleX= graph.scaleX;
        sample_id_list = graph.sample_id_list;
        vertical_lines = graph.vertical_lines;
        page_options = graph.page_options;
        options = graph.options;
        //Below are used for calculating the positioning of the labels
        size_of_probe_collumn = graph.size_of_probe_collumn;
        padding = 2 * page_options.width_to_support_many_samples;
        if (vertical_lines.length == 1 && options.sortByOption.split(",").length != 1) {
            size_of_probe_collumn = 0.75 * size_of_probe_collumn;
        }
	    svg.selectAll(".probe_text")
            .data(vertical_lines).enter()
            .append("text") // when rotating the text and the size
            .text(
                function(d){
                    // If the user does't want to have labels on the x axis we don't append the probe
                          if(false) {
                            if (d.mapping == "no") {return d.probe;}
                            else {return d.probe +"*";}
                          }
                        else {
                          if (d.mapping == "no") {return options.ref_name + " "+ d.probe;}
                          else {return options.ref_name + " "+ d.probe +"*";}
                        }
                })
            .attr("class", "x_axis_diagonal_labels")
            .attr("id",function(d){ return d.probe })
            .style("text-anchor", "end")
    	    // Even though we are rotating the text and using the cx and the cy, we need to
            // specify the original y and x
            .attr("y", page_options.height + options.x_axis_label_padding)
            .attr("x",
                function(d, i){
                    x_value = (padding * (i + 1)) + (size_of_probe_collumn * (i + 1));
                    if (options.include_disease_state_x_axis != "yes") {
                        x_value = x_value - (0.5 * size_of_probe_collumn);
                    }
                    return x_value;
                }
            ) // when rotating the text and the size
            .style("font-family", options.font_style)
            .style("font-size", options.text_size)
            .style("fill", function(d){
              if(d.mapping == "no") {
                return 'black';
              }
              else {
                return 'red';
              }
            })
            .attr("transform",
                // combination of this: http://stackoverflow.com/questions/11252753/rotate-x-axis-text-in-d3
                // and this: http://www.w3.org/TR/SVG/coords.html#TransformAttribute
                // basically, you just have to specify the angle of the rotation and you have
                // additional cx and cy points that you can use as the origin.
                // therefore you make cx and cy your actual points on the graph as if it was 0 angle change
                // you still need to make the y and x set as above
                function(d, i) {
                    // actual x value if there was no rotation
                    x_value = (padding * (i + 1)) + (size_of_probe_collumn * (i + 1));
                    // actual y value if there was no rotation
                    if (options.sortByOption.split(",").length != 1) {
                        y_value = page_options.height + 10;
                    } else {
                      // changes done
                        x_value = x_value - (0.5 * size_of_probe_collumn);
                        // x_value = x_value - (0.5 * size_of_probe_collumn) + (padding * (i + 1));
                        y_value = page_options.height + 10;
                    }
                    return "rotate("+options.x_axis_text_angle+","+x_value+","+y_value+")";
                }
             )
        graph.svg = svg;
        return graph;
    }

    /* sets up the vertical lines between the sample points */
    setup_vertical_lines = function(graph){
        svg = graph.svg;
        vertical_lines = graph.vertical_lines;
        sample_id_list = graph.sample_id_list;
        page_options = graph.page_options;
        padding = (2 * page_options.width_to_support_many_samples);
        size_of_probe_collumn = graph.size_of_probe_collumn;
        for (i = 0; i < graph.probe_count; i++) {
              svg.append("line")
                .attr("x1",
                    function(d){
                       avg = (padding + size_of_probe_collumn) * (i + 1); //returns the position for the line
                       return avg;
                    }
                )
                .attr("x2",
                    function(d){
                       avg = (padding + size_of_probe_collumn) * (i + 1); //returns the position for the line
                       return avg;
                    }
                )
                .attr("y1",
                    function(d){
                        temp = 0;
                        return temp;
                    }
                )
                .attr("y2",
                    function(d){
                        // this is to keep it within the graph
                        temp = page_options.height;
                        return temp;
                    }
                )
                .attr("shape-rendering","crispEdges")
                .attr("stroke-width",options.line_stroke_width)
                .attr("opacity","0.2")
                .attr("stroke","black");
        }
        graph.svg = svg;
        return graph;
    } // //setup_vertical_lines

    //This is to setup multiple horizontal lines with a label
    //colours can be chosen (options) otherwise a random colour is chosen
    setup_horizontal_lines = function(graph){
        svg = graph.svg;
        scaleX = graph.scaleX;
        scaleY = graph.scaleY;
        options = graph.options;
        width = page_options.width;
        lines = options.lines;
        horizontal_lines = options.horizontal_lines;
        font_size = options.text_size;
        margin_y_value = 20;
        colour_random = d3.scale.category20();
        //adds the horizontal lines to the graph. Colours are given, if no colour is given
        //a coloour is chosen at random.

        for(var i = 0; i < horizontal_lines.length; i++){
            var name = horizontal_lines[i][0];
            //if no colours are defined pick one at random
            if( horizontal_lines[i][1] == undefined){
                var colour = colour_random;
            } else {
                var colour = horizontal_lines[i][1];
            }
            var y_value = horizontal_lines[i][2];
            // changes done by isha
            if ((y_value != "NULL")) {
              svg.append("line") // append an object line
                  .attr("class", "lines")
  		        .attr("data-legend", function(d) {return name})
                  .attr("x1", 0)
                  .attr("x2", width)
                  .attr("y1", scaleY(y_value))
                  .attr("y2", scaleY(y_value))
                  .attr("shape-rendering","crispEdges")
                  .attr("stroke-width",options.line_stroke_width)
                  .attr("opacity","0.6")
                  .style("stroke", colour);

              svg.append("text")
                  .attr("x", margin_y_value + (name.length*3) + 15)
                  .attr("y", scaleY(y_value) - 10)
                  .text(name)
                  .attr("text-anchor", "middle")
                  .style("font-family", options.font_style)
                  .style("font-size", font_size)
                  .style("fill", colour)
                  .attr("class",options.title_class);
            }

        }

    graph.svg = svg;
        return graph;
    } // end setup_horizontal_lines

    preprocess_lines = function(graph){
        horizontal_lines = graph.options.horizontal_lines;
        lines = Array();
        for (key in horizontal_lines){
            name = key;
            value = horizontal_lines[key];
            data_line = {'value':value,'name':name};
            lines.push(data_line);
        }

        graph.options.lines = lines;

        return graph;
    }   // end preprocess_lines

    //sets up bars under the graph so that when the user hovers the mouse above it
    //Essentially sets a bar graph up under the box plot
    setup_hover_bars = function(graph) {
        svg = graph.svg;
        options = graph.options;
        //sets up the tooltip which displys the sample type when the bar is hovered
        //over.
        tip = options.tip;
        svg.call(tip);
        opacity = 0; // start with the colour being white
	    scaleX = graph.scaleX;
        scaleY = graph.scaleY;
        vertical_lines = graph.vertical_lines;
        sample_id_list = graph.sample_id_list;
        page_options = graph.page_options;
        calculate_x_value_of_vertical_lines = calculate_x_value_of_vertical_lines;
        //once and first are place holder values to check if it is the first element
        //as these need to have a different amount of padding
        sample_id_count = 0;
        first = 0;
        once = 0;
        //the tooltip for hovering over the bars which displays the sample type
        var tooltip_sample;

        x_values_for_bars = new Array();
        //This is required so taht the bars stop midway between the two sample types (i.e. on the line)
        padding = (calculate_difference_between_samples(sample_id_list,scaleX))/2;

        //Appending the bar to the graph
        svg.selectAll(".bar")
            .data(vertical_lines) // use the options.data and connect it to the elements that have .dot css
            .enter() // this will create any new data points for anything that is missing.
            .append("rect")
            .attr("id", function(d) {
                return d.sample_type;
                }
            )
           /* .attr("class", "bar")*/
	    .style("opacity", opacity)
	    .style("fill", "#FFA62F")
            .attr("x", function(d){
                sample_id_count++;
                if(first == 0) {
                    first = 1;
                    //need to add a padding of 10 to make up for the padding on the grid
                    //so that the highlighted collumn goes to the edge
                    //options.padding spefies how far away the user would like the initial one
                    //to be from the start of the graph
                    return scaleX(d.start_sample_id) - padding * options.padding;
                } else {
                    return scaleX(d.start_sample_id) - padding;
                }
            })
            .attr("width", function(d, i) {
                sample_id_count--;
                if(once == 0) {
                    once = 1;
                    return scaleX(d.end_sample_id) - scaleX(d.start_sample_id) + 3/2 * options.padding * padding;
                } if (sample_id_count == 0) {
                    //if it is the last sample type need to account for padding of the graph
                    //which as with the beggining means there needs to be extra padding added
                    //This is beacuse rangeRoundPoints has been used for the domain, see that
                    //Comment for more detail on the use
                    return scaleX(d.end_sample_id) - scaleX(d.start_sample_id) + 3/2 * options.padding * padding;

                } else {
                    return scaleX(d.end_sample_id) - scaleX(d.start_sample_id) + options.padding * padding;
                }
            })
            .attr("y", 0)
            .attr("height", page_options.height - 2)
            .on("mouseover", function(d) {
                //on the mouse over of the graph the tooltip is displayed (tranisition fades it in)
                barOver = document.getElementById(d.sample_type);
		barOver.style.opacity = "0.5";
		tooltip_sample = d3.select("body").append("div")
                    .attr('class', 'tooltip')
                    .style("opacity", 1e-6)
                    .html(function(){
                    temp =
                        "Sample Type: " +  d.sample_type + "<br/>"
                        return temp;
                    });

                tooltip_sample.style("opacity", 1);
                })
            .on("mousemove", function(d) {
                //on mousemove it follows the cursor around and displayed the current sample type it is hovering over
                tooltip_sample.html =  "Sample Type: " +  d.sample_type + "<br/>";
                tooltip_sample.style('left', Math.max(0, d3.event.pageX - 150) + "px");
                tooltip_sample.style('top', (d3.event.pageY + 20) + "px");
                tooltip_sample.show;
              })
            .on("mouseout", function(d) {
                tooltip_sample.remove();
		barOver = document.getElementById(d.sample_type);
		barOver.style.opacity = "0";
            });

        graph.svg = svg;
        return graph;
    }

    //Sets up the SVG element
    setup_svg = function (graph){
        options = graph.options;
        page_options = graph.page_options;
        full_width = page_options.full_width;
        full_height = page_options.full_height;

        graph.full_width = full_width;
        graph.full_height = full_height;
        background_stroke_width = options.background_stroke_width;
        background_stroke_colour = options.background_stroke_colour;

        // clear out html
        $(options.target)
            .html('')
            .css('width',full_width+'px')
            .css('height',full_height+'px');

        // setup the SVG. We do this inside the d3.tsv as we want to keep everything in the same place
        // and inside the d3.tsv we get the data ready to go (called options.data in here)
        var svg = d3.select(options.target).append("svg")
            .attr("width", full_width)
            .attr("height",full_height)
        .append("g")
            // this is just to move the picture down to the right margin length
            .attr("transform", "translate(" + page_options.margin.left + "," + page_options.margin.top + ")");


        // this is to add a background color
        // from: http://stackoverflow.com/questions/20142951/how-to-set-the-background-color-of-a-d3-js-svg
        svg.append("rect")
            .attr("width", page_options.width)
            .attr("height", page_options.height)
            .attr("stroke-width", background_stroke_width)
            .attr("stroke", background_stroke_colour)
            .attr("fill", options.background_colour);

        // this is the Main Title
        // http://bl.ocks.org/mbostock/7555321

        // Positions the title in a position relative to the graph
        height_divisor = 1.5;
        count = 0; // keeps track of the number of subtitles and if we
        // need to change the graph size to account for them
        svg.append("text")
            .attr("x", page_options.width/2)//options.x_middle_title)
            .attr("y", 0 - (page_options.margin.top /height_divisor) )
            .attr("text-anchor", "middle")
            .text(options.title).attr("class",options.title_class)
            .style("font-family", options.font_style)
            .style("font-size", options.title_text_size)
            .style("fill", "black")
            .attr("class",options.title_class);

        //Adds the subtitles to the graph
        for (i = 0; i < options.subtitles.length; i ++) {
            svg.append("text")
            .attr("id", "subtitle-"+ options.subtitles[i])
            .attr("x", page_options.width/2)//ptions.x_middle_title)
            .attr("y", function() {
                num = page_options.margin.top/height_divisor - (parseInt(options.text_size, 10) * (i + 1));
                if (num <= 0) {
                    count ++;
                }
                return 0 - num;
            })
            .attr("text-anchor", "middle")
            // Adds the class for the specific subtitle as specified
            .text(options.subtitles[i]).attr("class",options.title_class+" subtitle" + i)
            .style("font-family", "Arial")
            .style("font-size", options.text_size)
            .style("fill", "black")
            .attr("class",options.title_class);
        }

        max_width_of_text = 800;
        suggested_width_of_text = options.width*0.7;
        if (max_width_of_text < suggested_width_of_text){
            width_of_title = max_width_of_text;
        } else {
            width_of_title = suggested_width_of_text;
        }
        svg.selectAll("."+options.title_class)
            .call(d3_wrap,width_of_title);

        graph.svg = svg;
        return graph;
    } // setup_svg

    /*  Setting up the watermark */
    setup_watermark = function(graph){
        svg = graph.svg;
        options = graph.options;

        svg.append("image")
            .attr("xlink:href",options.watermark)
            .attr("x", page_options.height/2 - 100)
            .attr("y", -page_options.width - (page_options.margin_left/3 ))// just out of the graphs edge
            .attr("transform", "rotate(+90)")
            .attr("width", 200)
            .attr("height", 100);

        graph.svg = svg;
        return graph;
    } // setup_watermark

    make_legend_tooltip = function() {
        var tooltip_legend = d3.tip()
            .attr('class', 'd3-tip')
            .html(function(d) {
               temp =
                    d + "<br/>"
                return temp;
            });
        return tooltip_legend;
    }


    /* http://bl.ocks.org/ZJONSSON/3918369 and http://zeroviscosity.com/d3-js-step-by-step/step-1-a-basic-pie-chart
	Interactive legend which allows you to display and not display the legend*/
    setup_D3_legend = function(graph) {
	svg = graph.svg;
	var legendSpacing = 4;
	options = graph.options;
   	var legendRectSize = options.legend_rect_size;
	page_options = graph.page_options;
    tooltip_legend = options.tooltip;
    if (options.show_legend_tooltip != "no") {
	    tooltip_legend = make_legend_tooltip();
        svg.call(tooltip_legend);
    }
    //Add a legend title
        svg.append("text")
            .attr("x", page_options.width + options.legend_padding)//options.x_middle_title)
            .attr("y", 0 - (page_options.margin.top /height_divisor) )
            .attr("text-anchor", "middle")
            .text("Legend").attr("class",options.title_class)
            .style("font-family", options.font_style)
            .style("font-size", options.title_text_size)
            .style("fill", "black")
            .attr("class",options.title_class);
   //Add the legend to the svg element
	var legend = svg.selectAll('.legend')
		.data(graph.sample_type_list) //options.probs contains the name and colour of the probes
		.enter()
		.append('g')
		.attr('transform', function(d, i) {
			var height = legendRectSize + legendSpacing;
			// Probe count tells us how many samples we have
      // changes done by Isha
			var offset = height/2 ; //the 20 is to allow for the text above
			var horizontal = -2 * legendRectSize + page_options.width + options.legend_padding;
			var vertical = i * height - offset;
			return 'translate(' + horizontal + ','+ vertical + ')';
		})
        .on('mouseover', tooltip_legend.show)
        .on('mouseout', tooltip_legend.hide);

	//Add legend squares
	legend.append('rect')
		.attr('width', legendRectSize)
		.attr('class', "legendClass")
		.attr('id', function(d, i) {
			return d[i];
			// Make the id of the rectangle that of the probe name
		})
		.attr('height', legendRectSize)
		.style('fill', function(d, i) {
			return sample_types_with_colour[d]; //First element stored in the probe array is colour
		})
		.style('stroke',  function(d, i) {
                        return options.colour[i]; //First element stored in the probe array is colour
                })
		.style('opacity', 1)
        .on('mouseover', function(d) {
            if (options.legend_toggle_opacity != "no") {
                var leg = document.getElementById(d);
                if (leg.style.opacity != 0) {
                    d3.select(leg).style("opacity", 0);
                } else {
                    d3.select(leg).style("opacity", 1);
                }
            }
        });
 //end on_click button
    if (options.legend_text != "no") {
	//Add legend text
        legend.append('text')
            .attr('class', "legendClass")
            .attr('id', function(d) {
                        return d;
                    })
            .attr('x', legendRectSize + legendSpacing)
            .attr('y', legendRectSize - legendSpacing)
            .style("font-family", options.font_style)
            .style("font-size", options.text_size)
            .style('opacity', 1)
            .text(function(d) {
                if (options.legend_shorten_text == "yes") {
                    text = d.substring(0, options.substring_legend_length);
                } else {
                    text = d;
                }
                return text;
            });
    }
	graph.svg = svg;
	return graph;
    }

	
    /* Extra functions below have been added to make code more modular */


    /**
     * gets a particular type -> this is used to mae the code more modular
     * Allows us to have probes as main type and samples for others
     */
    get_type = function (data_point) {
        return data_point.probe;
    }



    /* This is used for calculating the size of the interval between the scatter points
     i.e. for setting up the vertical lines */
    calculate_x_value_of_labels = function (d, sample_id_list, scaleX, i, graph) {
        var vertical_lines = graph.vertical_lines;
        var size_of_probe_collumn = graph.size_of_probe_collumn;
        var padding = 2 * graph.page_options.width_to_support_many_samples;
        if (vertical_lines.length === 1 && graph.options.include_disease_state_x_axis === "yes") {
            size_of_probe_collumn = 0.75 * size_of_probe_collumn;
        }
	    var x_value = (padding * (i + 1)) + (size_of_probe_collumn * (i + 1));
        x_value = x_value - (0.5 * size_of_probe_collumn);
        return x_value;
    }; // calculate_x_value_of_sample_types


   label_hover_on_feature = function (d, sample_type_count, collective_name, options) {
       // var radius = options.circle_radius;
        sample_type_count++;
        var name = get_type(d);
          var sample_type_group = document.getElementsByClassName(collective_name + name);
          for (i = 0; i < sample_type_group.length; i++) {
         //     d3.select(sample_type_group[i]).attr("r", options.hover_circle_radius).style("opacity", 0.5);
          }
    }


   label_hover_out_feature = function (d, sample_type_count, collective_name, options) {
        //var radius = options.circle_radius;
        var name = get_type(d);
        var sample_type_group = document.getElementsByClassName(collective_name + name);
        for (i = 0; i < sample_type_group.length; i++) {
         //   d3.select(sample_type_group[i]).attr("r", radius).style("opacity", 1);
        }
    }

 /**
    * Calculates where we want to put the ertical elines which separate the different
    * sample types on the x axis.
    */
    calculate_x_value_of_vertical_lines = function (d, sample_id_list, scaleX,
i , graph) {
        var padding = (2 * graph.page_options.width_to_support_many_samples);
        var size_of_probe_collumn = graph.size_of_probe_collumn;

        var avg = (padding + size_of_probe_collumn) * (i + 1); //returns the position for the line
        return avg;

    }; // calculate_x_value_of_vertical_lines

    /*  Setting up the graph including y and x axes */
    setup_graph = function(graph){
        // setup all the graph elements
        options = graph.options;
	graph.graph_type = "Box Plot";
        var label_padding = 80; // For if there are 2 sets of labels
        // setup all the graph elements
        options = graph.options;
        temp_val = 0;
        diff_val = 0;
        padding_val = 0;
        graph = setup_margins(graph);
        //graph = setup_size_options(graph);
        graph = setup_svg(graph);
        // Check if it is also being sorted by the disease state on the x axis
        if (options.include_disease_state_x_axis == "yes") {
            graph = sort_x_by_probe_and_disease_state(graph);
        } else {
            graph = sort_x_by_probe(graph);
        }

        graph = setup_data_for_x_axis(graph);
        graph = setup_x_axis(graph, graph.probe_list);
        graph.size_of_disease_state_collumn = calculate_x_value_of_probes(graph);
graph.size_of_disease_state_collumn = calculate_x_value_of_state(graph, graph.disease_state_count);
        if (options.include_disease_state_x_axis === "yes") {
            
            graph = setup_disease_state_labels(graph);
        }
        if (graph.options.include_disease_state_x_axis !== "yes") {
            label_padding = 0;
        }
        graph = setup_x_axis_labels(graph, null, label_padding, ".probe_text", ".probe-");
        graph = calculate_x_value_of_probes(graph);
     	if (options.sortByOption.split(",").length != 1) {
            graph = calculate_x_value_of_state(graph);
            graph = setup_disease_state_labels(graph);
        }
        graph = setup_probe_labels(graph);
        graph = setup_y_axis(graph);
        graph = setup_box_plot(graph);
        graph = setup_D3_legend(graph);
        graph = setup_vertical_lines(graph);
        graph =  setup_watermark(graph);
	    // Only display the vertical lines if the user chooses so
        if (options.display.vertical_lines == "yes") {
            graph = setup_vertical_lines(graph);
        }
        if (options.display.horizontal_lines == "yes") {
            graph = setup_horizontal_lines(graph);
        }
        return graph;

    }  // end setup_graph

    // run this right at the start of the initialisation of the class
    init = function(init_options){
        var options = default_options();
        options = init_options;
        page_options = {}; // was new Object() but jshint wanted me to change this
        var graph = {}; // this is a new object
        graph.options = options;
        graph = preprocess_lines(graph);
        graph = setup_graph(graph);
        var target = $(options.target);
        target.addClass('box_plot');

        svg = graph.svg;
    }

    // constructor to run right at the start
    init(init_options);
}

},{"./axis.js":1,"./box_bar_line.js":2,"./features.js":3,"./general.js":4,"./test.js":5}]},{},[]);
