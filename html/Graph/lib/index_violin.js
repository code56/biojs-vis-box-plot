

// Sorts the sorted probe types by sample_type state if necesary so that they can
// be grouped by both sample_type state and probe on the x axis
// http://bl.ocks.org/phoebebright/raw/3176159/ for sorting
sort_x_by_probe_and_sample_type = function (graph) {
    var options = graph.options;
    //Check if there is an order given for the sample_type states, if none given order by dataset
    if (options.probe_order !== 'none') {
        var line_group_order = options.line_group_order;
        var probe_order = options.probe_order;
        var nested_values = d3.nest()
                .key(function (d) {
                    return d.Probe;
                })
                .sortKeys(function (a, b) {
                    return probe_order.indexOf(a.Probe) - probe_order.indexOf(b.Probe);
                })
                .key(function (d) {
                    return d.Sample_Type;
                })
                .entries(options.data);
    } else {
        nested_values = d3.nest()
                .key(function (d) {
                    return d.Probe;
                })
                .key(function (d) {
                    return d.Sample_Type;
                })
                .entries(options.data);
    }
    graph.nested_values = nested_values;
    return graph;
};


sort_by_sample_type = function (graph) {
    var options = graph.options;
    if (options.line_group_order !== 'none') {
        var line_order = options.line_group_order;
        var nested_values = d3.nest()
                .key(function (d) {
                    return d.LineGraphGroup;
                })
                .sortKeys(function (a, b) {
                    return line_order.indexOf(a.LineGraphGroup) - line_order.indexOf(b.LineGraphGroup);
                })
                .entries(options.data);
    } else {
        nested_values = d3.nest()
                .key(function (d) {
                    return d.LineGraphGroup;
                })
                .entries(options.data);
    }
    graph.nested_values = nested_values;
    return graph;
};





/*------------------------------Box plot Calculations--------------------------------------*/
/* Sets up the box plot */
setup_line_graph_violin = function (graph) {
    var options = graph.options;
    var probe_size = graph.size_of_probe_collumn;
    var sample_type_size = graph.size_of_sample_type_collumn;
    var nested_values = graph.nested_values;
    var line_group_list = [];
    var sample_type_list = options.sample_types;
    var probe = null;
    var line_groups = null;

    for (var probe in nested_values) {
        var probe_text_count = 0;
        var row = nested_values[probe];
        var values = row.values;
        var probe_name = row.key;
        var probe_num = parseInt(probe);
        var scale_x = d3.scale.ordinal()
                .rangePoints([(probe_size * probe_num) + (0.5 * sample_type_size), (probe_size * (probe_num + 1)) - (0.5 * sample_type_size)]); //No padding for now
        scale_x.domain(sample_type_list);
        for (line_groups in values) {
            // These are the expression values for a specific sample grouped by the probe
            // then the sample_type type so now we need to append all the expression values for this
            // group then calculate the box plot and draw the values
            var srow = values[line_groups];
            var samples = srow.values;
            var line_group = srow.key;
            // Actually draw the box plot ons the graph
            //Setup the scatter line once all the points have been placed
            graph = setup_scatter_line(graph, probe_num, parseInt(line_groups), scale_x, samples, probe_name, line_group);

        }
        if (options.include_sample_type_x_axis === "yes" && options.display.x_axis_labels === "yes") {
            if (probe_text_count === 0) {
                graph = setup_extra_labels(graph, scale_x, probe_num);
                probe_text_count++;
            }
        }
    }
    graph.line_group_list = line_group_list;
    return graph;
};

add_scatter_for_sample_ids = function (scatter_values, graph, colour, scale_x) {
    var options = graph.options;
    var radius = options.radius;
    var svg = graph.svg;
    var probe_colours = options.probe_colours;
    var scaleY = graph.scaleY;
    var tooltip = options.tooltip;
    svg.call(tooltip);
    var probe_count = 0;
    svg.selectAll(".dot") // class of .dot
            .data(scatter_values) // use the options.data and connect it to the elements that have .dot css
            .enter() // this will create any new data points for anything that is missing.
            .append("circle") // append an object circle
            .attr("class", function (d) {
                //adds the sample type as the class so that when the sample type is overered over 
                //on the x label, the dots become highlighted 
                return "sample-type-" + d.LineGraphGroup;
            })
            .attr("r", radius) //radius 3.5
            .attr("cx", function (d) {
                var cx = scale_x(d.Sample_ID);
                return cx;
            })
            .attr("cy", function (d) {
                // set the y position as based off y_column
                // ensure that you put these on separate lines to make it easier to troubleshoot
                var cy = 0;
                cy = scaleY(d.Expression_Value);
                return cy;
            })
            .style("stroke", options.background_stroke_colour)
            .style("stroke-width", "1px")
            .style("fill", function (d) {
                return colour[probe_count];
            })
            .attr("opacity", 0.8)
            .on('mouseover', tooltip.show)
            .on('mouseout', tooltip.hide);

    graph.svg = svg;
    return graph;
};


add_scatter_violin = function (scatter_values, graph, colour, scale_x, y_value_if_error, scatter_tooltip, sample_count) {
    var options = graph.options;
    var radius = options.radius;
    var svg = graph.svg;
    var scaleY = graph.scaleY;
    svg.call(scatter_tooltip);
    var centreX = scale_x(scatter_values[0].Sample_Type);
    var toggle_count_odd = 1;
    var toggle_count_even = 0;
    var min = 0;
    var max = 0;
    svg.selectAll(".dot") // class of .dot
            .data(scatter_values) // use the options.data and connect it to the elements that have .dot css
            .enter() // this will create any new data points for anything that is missing.
            .append("circle") // append an object circle
            .attr("id", scatter_values[0].Sample_Type)
            .attr("class", function (d) {
                //adds the sample type as the class so that when the sample type is overered over 
                //on the x label, the dots become highlighted 
                return "sample-type-" + d.LineGraphGroup;
            })
            .attr("r", radius) //radius 3.5
            .attr("cx", function (d, i) {
                if (i % 2 === 0) {
                    var cx = centreX + (radius * toggle_count_even);
                    max = cx;
                    toggle_count_even++;
                    //temp = {x: cx, y: scaleY(d.Expression_Value)};
                    //graph.interpolate_values.push(temp);
                } else {
                    cx = centreX - (radius * toggle_count_odd);
                    min = cx;
                    toggle_count_odd++;
                    // temp = {x: cx, y: scaleY(d.Expression_Value)};
                    // graph.interpolate_values.push(temp);
                }
                return cx;
            })
            .attr("cy", function (d) {
                // set the y position as based off y_column
                // ensure that you put these on separate lines to make it easier to troubleshoot
                var cy = 0;
                if (y_value_if_error === 0) {
                    cy = scaleY(d.Expression_Value);
                } else {
                    cy = scaleY(y_value_if_error);
                }
                return cy;
            })
            .style("stroke", options.background_stroke_colour)
            .style("stroke-width", "1px")
            .style("fill", colour)
            .attr("opacity", 0.8)
            .on('mouseover', scatter_tooltip.show)
            .on('mouseout', scatter_tooltip.hide);

    if (scatter_values.length > 1) {
        len = scatter_values.length - 1;
        temp1 = {x: centreX - (radius * toggle_count_odd) - (radius * 2), y: scaleY(scatter_values[len].Expression_Value)};
        graph.interpolate_min_values.push(temp1);

        temp2 = {x: centreX + (radius * toggle_count_odd) + (radius * 2), y: scaleY(scatter_values[len].Expression_Value)};
        graph.interpolate_max_values.push(temp2);
    }
    return svg;
};


setup_scatter_line = function (graph, probe_num, sample_num, scale_x, sample_values, probe_name, sample_name) {
    var options = graph.options;
    var samples = sample_values;
    var colour = options.colour;
    var scaleY = graph.scaleY;
    var radius = options.radius;
    graph.interpolate_min_values = [];
    graph.interpolate_max_values = [];
    var centreX = scale_x(sample_values[0].Sample_Type);
    var probe_size = graph.size_of_probe_collumn;
    var sample_type_size = graph.size_of_sample_type_collumn;
    var rad = options.level_of_overlap;
    var current_samples = [];
    var sample_count = 0;

    sample_values.sort(function (a, b) {
        return a.Expression_Value - b.Expression_Value;
    });
    var lwr_l = {x: centreX, y: scaleY(sample_values[0].Expression_Value) + (2 * radius)};
    graph.interpolate_min_values.push(lwr_l);
    graph.interpolate_max_values.push(lwr_l);

    var final_diff = 0;
    var diff = 0; //Difference between the sample types expression values for each ID
    for (var i = 0; i < sample_values.length; i++) {
        current_samples.push(sample_values[i]);
        if (i === sample_values.length - 1) {
            diff += Math.abs(sample_values[i].Expression_Value - sample_values[i - 1].Expression_Value);
        } else {
            diff += Math.abs(sample_values[i].Expression_Value - sample_values[i + 1].Expression_Value);
        }
        if (diff < rad) {
            sample_count++;
        } else {
            svg = add_scatter_violin(current_samples, graph, colour[sample_num], scale_x, 0, options.tooltip, sample_count);

            current_samples = [];
            sample_count = 0;
            if (diff > (2 * rad)) {
                if (i === sample_values.length - 1) {
                    yval = sample_values[i].Expression_Value;
                    final_diff = diff;
                } else {
                    yval = sample_values[i + 1].Expression_Value;
                }
                var tmp = {x: centreX, y: scaleY(yval) - (diff / 2)};
                graph.interpolate_min_values.push(tmp);
                graph.interpolate_max_values.push(tmp);
            }
            diff = 0;
        }
    }
    //----------------------NEED TO FIX THIS CURRENTLY ADDING LAST SCATTER SEPARATELY -----------------------
    var len = sample_values.length - 1;
    //current_samples = [];
    //current_samples.push(sample_values[len]);
    //svg =  add_scatter(current_samples, graph, colour[sample_num], scale_x, 0, options.tooltip, sample_count);
    line = d3.svg.line()
            .x(function (d) {
                return d.x;
            })
            .y(function (d) {
                return d.y;
            })
            .interpolate("basis");
    var upr_l = {x: centreX, y: scaleY(sample_values[len].Expression_Value - (final_diff)) - (2 * rad)};
    graph.interpolate_min_values.push(upr_l);
    graph.interpolate_max_values.push(upr_l);

    graph.interpolate_min_values.sort(function (a, b) {
        return a.y - b.y;
    });
    graph.interpolate_max_values.sort(function (a, b) {
        return b.y - a.y;
    });

    for (i in graph.interpolate_max_values) {
        graph.interpolate_min_values.push(graph.interpolate_max_values[i]);
    }
    /*   svg.append("path")
     .attr("d", line(graph.interpolate_max_values))
     .attr("stroke", "black")
     .style("stroke-width","2")
     .style("fill", "none");
     */
    svg.append("path")
            .attr("d", line(graph.interpolate_min_values))
            .attr("stroke", "black")
            .style("stroke-width", "2")
            .style("fill", "none");/*
             .on("mouseover", function(data, i) {
             if (options.legend_toggle_opacity !=="no") {
             var leg = document.getElementById(data[i].Sample_Type);
             console.log(leg);
             console.log("LEG");
             if (leg.style.opacity !==0) {
             d3.select(leg).style("opacity", 0);
             } else {
             d3.select(leg).style("opacity", 1);
             }
             }
             });*/


    graph.svg = svg;
    return graph;

};



sort_by_sample_type = function (data, sample_type_order) {
    if (sample_type_order !== "none") {
        data.sort(function (a, b) {
            return sample_type_order.indexOf(a.Sample_Type) - sample_type_order.indexOf(b.Sample_Type);
        });
    } else {
        //SORTING FOR LINEGRAPH
        data.sort(function (a, b) {
            return a.Sample_Type.localeCompare(b.Sample_Type);
        });
    }
    return data;
};

add_scatter_for_multiple_reps = function (graph, sample_types_with_replicates, colour, scale_x, scatter_tooltip) {
    var svg = graph.svg;
    var options = graph.options;
    var box_width = options.box_width;
    var box_width_wiskers = box_width / 2;
    var scaleY = graph.scaleY;
    var x_buffer = scale_x(sample_types_with_replicates[0].Sample_Type);
    var bar_vals = calculate_error_bars(sample_types_with_replicates);
    svg = add_line_to_box(options.stroke_width, x_buffer, box_width / 2, bar_vals[0], svg, scaleY, colour, box_width_wiskers / 2);
    //Add max line
    svg = add_line_to_box(options.stroke_width, x_buffer, box_width / 2, bar_vals[2], svg, scaleY, colour, box_width_wiskers / 2);
    //Add median lines
    svg = add_vertical_line_to_box(options.stroke_width, x_buffer, bar_vals[0], bar_vals[2], svg, scaleY, colour);
    svg = add_scatter_violin(sample_types_with_replicates, graph, colour, scale_x, bar_vals[1], scatter_tooltip);
//(options.stroke_width, x_buffer, box_width, box_plot_vals[1], svg, scaleY, colour_wiskers, box_width_wiskers);
    graph.svg = svg;
    graph.temp_y_val = bar_vals[1];
    return graph;
};

/* Takes the array of samples for a specific sample type
 * already ordered */
calculate_error_bars = function (values_raw) {
    var values = [];
    x = 0;
    for (i in values_raw) {
        values.push(values_raw[i].Expression_Value);
    }
    var mean = get_mean_value(values);
    var sum = 0;
    var numbers_meaned = [];
    for (x in values) {
        numbers_meaned.push(Math.abs(values[x] - mean));
    }
    var standard_deviation = get_mean_value(numbers_meaned);
    return [mean - standard_deviation, mean, mean + standard_deviation];
};




/**
 * gets a particular type -> this is used to mae the code more modular
 * Allows us to have probes as main type and samples for others
 */
get_state_type = function (data_point) {
    return data_point.Sample_Type;
}


/**
 * gets a particular type -> this is used to mae the code more modular
 * Allows us to have probes as main type and samples for others
 */
get_type = function (data_point) {
    return data_point;
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
        i, graph) {
    var padding = (2 * graph.page_options.width_to_support_many_samples);
    var size_of_probe_collumn = graph.size_of_probe_collumn;

    var avg = (padding + size_of_probe_collumn) * (i + 1); //returns the position for the line
    return avg;

}; // calculate_x_value_of_vertical_lines

/**
 * Calculates interval between the probes
 * also used for calculating the distance bwteen the day states
 * @param {type} graph
 * @returns {unresolved}
 */
calculate_x_value_of_probes = function (graph) {
    var options = graph.options;
    var width = options.width;
    var scaleX = graph.scaleX;
    var probe_count = options.probe_count;
    var section_size = (width / probe_count);
    //graph.size_of_day_state_collumn = section_size;
    return section_size;
    
};// calculate_x_value_of_probes


/**
 * Calculates interval between the day states/ or another type 
 * of separating factor (i.e. could be disease states etc)
 * @param {type} graph
 * @returns {unresolved}
 */
calculate_x_value_of_state = function (graph, count) {
    var options = graph.options;
    var width = options.width;
    var probe_count = options.probe_count;
    var scaleX = graph.scaleX;
    //day_state_count = options.day_count;
    var section_size = (width / probe_count) / count; //day_state_count;
    //graph.size_of_day_state_collumn = section_size;
    //graph_element = section_size;
    return section_size;
}; // calculate_x_value_of_probes

/**
 * Prepares the data for the x axis and adds the labels to the x axis
 * This is to make the sample types replace the sample ids
 * Height offset is used if we are havig a second set of labels
 * @param {type} graph
 * @returns {unresolved}
 */
setup_x_axis_labels_violin = function (graph, label_list, height_offset, class_name, collective_name) {
    var svg = graph.svg;
    var scaleX = graph.scaleX;
    var vertical_lines = graph.vertical_lines;
    var page_options = graph.page_options;
    var options = graph.options;
    // handle gaps between samples oin the x axis
    //value = calculate_difference_between_samples(label_list, scaleX);
    // in the same function you want to store the padding
    // and you want to calculate that last padding too
    var sample_type_count = 0;


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
            .attr("id", function (d) {
                /* This is used during testing to check the correct sample
                 * is displayed */
                var point = get_type(d);
                return "xLabel-" + point.replace(/\ |(|)/g, '');
            })
            // Even though we are rotating the text and using the cx and the cy, we need to
            // specify the original y and x
            .attr("y", page_options.height + options.violin.x_axis_label_padding + height_offset)
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
        /**
         * Draws the vertical line on the x axis from the calculated x value above
         */
        setup_vertical_lines_violin = function (graph, sample_id_list) {
            var svg = graph.svg;
            var vertical_lines = graph.vertical_lines;
            var page_options = graph.page_options;
            var options = graph.options;
            var scaleX = graph.scaleX;
            svg.selectAll(".separator").data(vertical_lines).enter()
                    .append("line")
                    .attr("class", "separator")
                    .attr("x1",
                            function (d, i) {
                                var avg = calculate_x_value_of_vertical_lines(d, sample_id_list, scaleX, i, graph);
                                return avg;
                            }
                    )
                    .attr("x2",
                            function (d, i) {
                                var avg = calculate_x_value_of_vertical_lines(d, sample_id_list, scaleX, i, graph);
                                return avg;
                            }
                    )
                    .attr("y1",
                            function (d) {
                                var temp = 0;
                                return temp;
                            }
                    )
                    .attr("y2",
                            function (d) {
                                // this is to keep it within the graph
                                var temp = page_options.height;
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

        /*  Setting up the graph including y and x axes */
        setup_graph = function (graph) {
            // setup all the graph elements
            graph.graph_type = "Line Graph";
            var label_padding = 0; // For if there are 2 sets of labels 
            var options = graph.options;
            graph = setup_margins(graph);
            graph = setup_svg(graph);
            if (options.sort_by_sample_id === "no") {
                graph = sort_x_by_probe_and_sample_type(graph);
            }
            if (options.include_sample_type_x_axis === "yes" && options.display.x_axis_labels === "yes") {
                label_padding = 80;
            }
            // Check if it is also being sorted by the sample_type state on the x axis
            graph = setup_x_axis(graph, options.violin.x_axis_list);
            graph.size_of_sample_type_collumn = calculate_x_value_of_probes(graph);
            graph.size_of_sample_type_collumn = calculate_x_value_of_state(graph, options.sample_type_count);
            var vertical_lines = options.violin.x_axis_list;
            graph.vertical_lines = vertical_lines;
            if (options.display.x_axis_labels === "yes") {
                graph = setup_x_axis_labels_violin(graph, null, label_padding, ".probe_text", ".probe-");
            }
            graph = setup_y_axis(graph);
            graph = setup_line_graph_violin(graph);
            // Only display the vertical lines if the user chooses so
            if (options.display.vertical_lines === "yes") {
                graph = setup_vertical_lines_violin(graph);
            }

            //graph =  setup_hover_bars(graph);
            // Display the legend if the user has specified they want the legend
            if (options.display.legend === "yes") {
                graph = setup_D3_legend(graph, options.legend_list);
            }
            if (options.display.horizontal_lines === "yes") {
                graph = setup_horizontal_lines(graph);
            }
            return graph;

        };  // end setup_graph  

// run this right at the start of the initialisation of the class
        init_violin = function (init_options) {
            var options = default_options();
            options = init_options;
            var page_options = {}; // was new Object() but jshint wanted me to change this
            var graph = {}; // this is a new object
            graph.options = options;
            graph = preprocess_lines(graph);
            graph = setup_graph(graph);
            var target = $(options.target);
            target.addClass('violin_graph');
            svg = graph.svg;
            options.test_graph = graph;
        };

