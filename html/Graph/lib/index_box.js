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

// Sorts the sorted probe types by second_sort_by state if necesary so that they can
// be grouped by both second_sort_by state and probe on the x axis
// http://bl.ocks.org/phoebebright/raw/3176159/ for sorting
sort_x_by_probe_and_second_sort_by = function (graph) {
    var options = graph.options;
    //Check if there is an order given for the second_sort_by states, if none given order by dataset
    if (options.sortByOption.split(",").length != 1) {
        var order_types = options.sortByOption.split(",");
        var sample_type_order = options.sample_type_order.split(',');
        var nested_values = d3.nest()
                .key(function (d) {
                    return d.Probe;
                })
                .sortKeys(function (a, b) {
                    return probe_order.indexOf(a) - probe_order.indexOf(b);
                })
                .key(function (d) {
                    value = order_types[0]//options.sortByOption[0]
                    return d[value];
                })
                .key(function (d) {
                    return d.Sample_Type;
                })
                .sortKeys(function (a, b) {
                    return sample_type_order.indexOf(a) - sample_type_order.indexOf(b);
                })
                .entries(options.data);
    } else {
        sample_type_order = options.sample_type_order.split(',');
        nested_values = d3.nest()
                .key(function (d) {
                    return d.Probe;
                })
                .key(function (d) {
                    return d.second_sort_by;
                })
                .key(function (d) {
                    return d.Sample_Type;
                })
                .sortKeys(function (a, b) {
                    return sample_type_order.indexOf(a) - sample_type_order.indexOf(b);
                })
                .entries(options.data);
    }
    graph.nested_values = nested_values;
    return graph;
}

/* Sorts the probes on a given order or default is by the dataset */
sort_x_by_probe = function (graph) {
    var options = graph.options;
    //Check no probe order has been given, if none given order by dataset

    if (options.probe_order != "none") { //changes done by Isha
        if (options.sortByOption.split(",").length != 1) {
            var order_types = options.sortByOption.split(",");
            var probe_order = options.probe_order;
            var sample_type_order = options.sample_type_order.split(',');
            var nested_values = d3.nest()
                    .key(function (d) {
                        return d.Probe;
                    })
                    .sortKeys(function (a, b) {
                        return probe_order.indexOf(a) - probe_order.indexOf(b);
                    })
                    .key(function (d) {
                        var value = order_types[0]
                        return d[value];
                    })
                    .key(function (d) {
                        return d.Sample_Type;
                    })
                    .sortKeys(function (a, b) {
                        return sample_type_order.indexOf(a) - sample_type_order.indexOf(b);
                    })
                    .entries(options.data);
        } else {
            if (options.sortByOption == "Sample_Type") {
                var probe_order = options.probe_order;
                var sample_type_order = options.sample_type_order;
                nested_values = d3.nest()
                        .key(function (d) {
                            return d.Probe;
                        })
                        .sortKeys(function (a, b) {
                            // change sdone by ISha to correct probe order
                            return probe_order.indexOf(a) - probe_order.indexOf(b);
                        })
                        .key(function (d) {
                            return d.Sample_Type;
                        })
                        .sortKeys(function (a, b) {
                            return sample_type_order.indexOf(a) - sample_type_order.indexOf(b);
                        })
                        .entries(options.data);
            } else if (options.sortByOption != "null") {
                var probe_order = options.probe_order;
                var second_sort_by_order = options.legend_list.list;
                nested_values = d3.nest()
                        .key(function (d) {
                            return d.Probe;
                        })
                        .sortKeys(function (a, b) {
                            // change sdone by ISha to correct probe order
                            return probe_order.indexOf(a) - probe_order.indexOf(b);
                        })
                        .key(function (d) {
                            var value = options.sortByOption
                            return d[value];
                        })
                        .sortKeys(function (a, b) {
                            return second_sort_by_order.indexOf(a) - second_sort_by_order.indexOf(b);
                        })
                        .entries(options.data);
            }
        }
    } else {
        sample_type_order = options.sample_type_order.split(',');
        nested_values = d3.nest()
                .key(function (d) {
                    return d.Probe;
                })
                .key(function (d) {
                    return d.Sample_Type;
                })
                .sortKeys(function (a, b) {
                    return sample_type_order.indexOf(a) - sample_type_order.indexOf(b);
                })
                .entries(options.data);

    }
    graph.nested_values = nested_values;
    return graph;
}


/*------------------------------Box plot Calculations--------------------------------------*/
/* Sets up the box plot */
setup_box_plot = function (graph) {
    var sample_types_with_colour = {};
    var colour_count = 0;
    var options = graph.options;
    var nested_values = graph.nested_values;
    var second_sort_by = "";
    var sample_type_list = [];
    var colour_array = options.box.colour_array;
    var id = 1; //  NOTE CHANGE THISLATER
    for (var probe in nested_values) {
        var row = nested_values[probe];
        var values = row.values;
        var probe_name = row.key;
        if (options.sortByOption.split(",").length != 1) { // changes done by Isha
            var number_sample_types = options.sample_type_order.split(",").length; //There will be a second key which is the second_sort_by stat
            for (second_sort_bys in values) {
                row = values[second_sort_bys];
                var second_sort_by_values = row.values;
                second_sort_by = row.key;
                // These are the expression values for a specific sample grouped by the probe
                // then the second_sort_by type so now we need to append all the expression values for this
                // group then calculate the box plot and draw the values
                for (sample_types in second_sort_by_values) {
                    sample_row = second_sort_by_values[sample_types];
                    var nan_counter = 0;
                    sample_values = sample_row.values;
                    sample_type = sample_row.key;
                    if ($.inArray(sample_type, sample_type_list) == -1) {
                        sample_type_list.push(sample_type);
                    }
                    expression_values = [];
                    //At the level of the xcel file now
                    for (x in sample_values) {
                        if (sample_values[x].Expression_Value == sample_values[x].Expression_Value) {
                            expression_values.push(sample_values[x].Expression_Value);
                        } else {
                            nan_counter++;
                        }
                    }
                    //Now have all the expression values for a specific sample type so we create box
                    //plot and calculate the values
                    if (expression_values.length != 0) {
                        if (options.box.bar_graph == "yes") {
                            box_plot_vals = calculate_box_plot_vals_bar(expression_values);
                        } else {
                            box_plot_vals = calculate_box_plot_vals(expression_values);
                        }// Actually draw the box plot on the graph
                        graph = draw_box_plot(expression_values, graph, box_plot_vals, probe_name, sample_type, second_sort_by, nan_counter);
                    }
                }
            }
        } else {
            number_sample_types = values.length;
            for (var sample_types in values) {
                var sample_row = values[sample_types];
                var sample_values = sample_row.values;
                var sample_type = sample_row.key;
                if ($.inArray(sample_type, sample_type_list) == -1) {
                    sample_type_list.push(sample_type);
                }
                var expression_values = [];
                var second_sort_bys = [];
                var second_sort_by_names = "";
                //At the level of the xcel file now
                for (var x in sample_values) {
                    expression_values.push(sample_values[x].Expression_Value);
                    if ($.inArray(sample_type, second_sort_bys) == -1) {
                        second_sort_bys.push(sample_type);
                    }
                } /*
                 This is commented out as we now set up the colours before hand
                 
                 for(j=0; j<sample_type_list.length; j++ ) {
                 if(!sample_types_with_colour[sample_type_list[j]])
                 {sample_types_with_colour[sample_type_list[j]] = options.colour[colour_count];
                 if(colour_count < options.colour.length) {colour_count++;}
                 else {colour_count = 0;}}
                 }*/
                for (second_sort_by in second_sort_bys) {
                    second_sort_by_names = second_sort_bys[second_sort_by] + " " + second_sort_by_names;
                }
                //Now have all the expression values for a specific sample type so we create box
                //plot and calculate the values
                var nan_counter = 0;
                expression_values = expression_values.filter(function (v) {
                    if (v == v) {
                        return true;
                    } else {
                        nan_counter++;
                        return false;
                    }
                });
                // changes done by Isha
                if (expression_values.length != 0) {
                    if (options.box.bar_graph == "yes") {
                        var box_plot_vals = calculate_box_plot_vals_bar(expression_values);
                    } else {
                        box_plot_vals = calculate_box_plot_vals(expression_values);
                    }
                    // Actually draw the box plot on the graph
                    graph = draw_box_plot(expression_values, graph, box_plot_vals, probe_name, sample_type, second_sort_by_names, nan_counter);
                }

            }
        }
    }
    graph.sample_type_list = sample_type_list;
    return graph;
}

add_scatter_to_box = function (svg, graph, scatter_values, median_line, sample_type, colour, colour_stroke) {
    var options = graph.options;
    var radius = options.box.radius;
    svg.selectAll(".dot") // class of .dot
            .data(scatter_values) // use the options.data and connect it to the elements that have .dot css
            .enter() // this will create any new data points for anything that is missing.
            .append("circle") // append an object circle
            .attr("class", function (d) {
                //adds the sample type as the class so that when the sample type is overered over
                //on the x label, the dots become highlighted
                return "sample-type-" + sample_type
            })
            .attr("r", radius) //radius 3.5
            .attr("cx", median_line)
            .attr("cy", function (d) {
                // set the y position as based off y_column
                // ensure that you put these on separate lines to make it easier to troubleshoot
                var cy = scaleY(d);
                return cy;
            })
            .style("stroke", colour_stroke)
            .style("stroke-width", "1px")
            .style("fill", colour)
            .attr("opacity", 0.8)
            .on('mouseover', tooltip_box.show)
            .on('mouseout', tooltip_box.hide);

    return svg;
}

make_box_tooltip = function (probe, sample_type, second_sort_by, nan_counter) {
    var tooltip_box = d3.tip()
            .attr('class', 'd3-tip')
            .offset([0, +110])
            .html(function (d) {
                if (nan_counter == 0) {
                    var temp =
                            "Probe: " + probe + "<br/>" +
                            "Sample Type: " + sample_type + "<br/>"
                    if (options.sortByOption.split(",").length != 1) {
                        temp = temp + "State: " + second_sort_by + "<br/>"
                    }
                } else {
                    var temp =
                            "Probe: " + probe + "<br/>" +
                            "Sample Type: " + sample_type + "<br/>" +
                            nan_counter + " Sample Removed Due to Floored Values " + "<br/>"

                    if (options.sortByOption.split(",").length != 1) {
                        temp = temp + "State: " + second_sort_by + "<br/>"
                    }
                }
                return temp;
            });
    return tooltip_box;
}


draw_box = function (svg, graph, box_plot_vals, x_buffer, sample_type_name) {
    var options = graph.options;
    var scaleY = graph.scaleY;
    svg.append("rect")
            .attr('width', options.box.width)
            .attr('x', x_buffer)
//            .attr('id', sample_type_name)
            .attr('y', function (d) {
                if (options.box.bar_graph == "yes") {
                    // changes done By Isha to handle bar on negative axis
                    var temp = scaleY(Math.max(0, box_plot_vals[1]));
                } else {
                    var temp = scaleY(box_plot_vals[3]);
                }
                return temp;
            })
            .attr('height', function (d) {
                if (options.box.bar_graph == "yes") {
                    var temp = Math.abs(scaleY(0) - scaleY(box_plot_vals[1]));
                } else {
                    var temp = scaleY(box_plot_vals[1]) - scaleY(box_plot_vals[3]);
                }
                if (temp == 0) {
                    temp = 2;
                }
                return temp;
            })
            .attr("fill", function () {
                if ((options.sortByOption.split(',')[0] == 'Sample_Type' || options.sortByOption.split(',')[1] == 'Sample_Type'))
                {
                    return options.box.colour_array[sample_type_name];
                } else
                {
                    return options.box.colour_array[sample_type_name]
                }
            })
            .attr("opacity", options.box.opacity)
            .on("mouseover", options.tooltip.show)
            .on("mouseout", options.tooltip.hide);
    return svg;
}

/* Draw box plot draws the box and wiskers onto the graph and also if it is a bar graph this is drawn on too */
draw_box_plot = function (samples, graph, box_plot_vals, probe_name, sample_type_name, second_sort_by_name, nan_counter) {
    var svg = graph.svg;
    var scaleY = graph.scaleY;
    var scaleX = graph.scaleX;
    var options = graph.options;
    var tooltip_box = make_box_tooltip(probe_name, sample_type_name, second_sort_by_name, nan_counter);
    var jitter = options.box.jitter;
    var colour_wiskers, colour_box, x_buffer, opacity;
    svg.call(tooltip_box);
    var box_width = options.box.width;
    var map = graph.name_mapping;
    var colour_median = "white";
    // Scale x for the layered x axis
    var box_scale = graph.multi_scaleX;
    var radius = options.box.radius;
    //Make a group so the whole box can be scaled if need be and add the
    //box to the group
    var median_percent = 0.9; //Means that the median line covers this amount of the box plot
    if ((box_width * options.num_sample_types * options.probe_count) > options.width) {
        box_width = options.width / (options.num_sample_types * options.probe_count);
    }
    if (options.sortByOption.split(",").length != 1) {
        for (i = 0; i < nested_values[0].values.length; i++) {
            //box_width = Math.min(box_width, (graph.size_of_second_sort_by_collumn / nested_values[0].values[i].values.length))
        }
        var id = remove_chars(probe_name + "-" + sample_type_name + "-" + second_sort_by_name);
        var name = map[id];
        x_buffer = box_scale(name) - box_width / 2;
    } else {
        var id = remove_chars(probe_name + "-" + sample_type_name);
        var name = map[id];
        x_buffer = box_scale(name) - box_width / 2;
    }
    var group_scale = scale_group_width(graph, x_buffer, box_width, box_scale(name - 1), box_scale(name + 1));
    var box_group = svg.append('g')
            .attr("id", "group-" + id);
    box_width = box_width * group_scale;
    var box_width_wiskers = options.box.width_wiskers; //assumes box width > box_width wiskers
    if (box_width_wiskers * 2 > box_width) {
        box_width_wiskers = box_width / 2;
    }
    // Scale the drawing elements
    box_width = box_width * group_scale;
    box_width_wiskers = box_width_wiskers * group_scale;
    var stroke_width = options.stroke_width_num * group_scale;
    radius = radius * group_scale;
    if (radius < options.box.mins.radius) {
        radius = options.box.mins.radius;
    }
    if (box_width < options.box.mins.box_width) {
        box_width = options.box.mins.box_width;
        box_width_wiskers = options.box.mins.box_width * 0.75;
    }
    if (stroke_width < options.box.mins.stroke) {
        stroke_width = options.box.mins.stroke;
    }
    stroke_width = stroke_width + "px";
    // changes done by Isha
    // colour_box = sample_types_with_colour[sample_type_name];
    // colour_box = options.box.colour_array[sample_type_name];
    if (options.box.whiskers_needed == true) {
        // if((options.sortByOption.split(',')[0] == 'Sample_Type' || options.sortByOption.split(',')[1] == 'Sample_Type'))
        //   {colour_wiskers = options.colour[sample_type_name];
        //   colour_box = options.colour[sample_type_name]} // this is when sample type is legend and colour is gradient
        //  else
        {
            colour_wiskers = options.box.colour_array[sample_type_name];
            colour_box = options.box.colour_array[sample_type_name]
        } // this when tissue, gender etc is present and we do not need gradient
    } else {
        colour_wiskers = undefined;
        colour_box = options.box.colour_array[sample_type_name]
    }

    id = probe_name + "-" + sample_type_name + "-" + second_sort_by_name;
    //Add vertical lline
    if (options.probe_count == 1 && options.sortByOption.split(",").length == 1 && options.box.bar_graph == "yes") {
        opacity = 0.4;
        box_group = add_vertical_line_to_box(options.stroke_width, x_buffer + box_width * 0.5,
                box_plot_vals[0], box_plot_vals[2], box_group, scaleY, colour_wiskers, graph);
    } else if (options.box.bar_graph == "yes") {
        opacity = 0.4;
        box_group = add_vertical_line_to_box(options.stroke_width, x_buffer + box_width * 0.5,
                box_plot_vals[0], box_plot_vals[2], box_group, scaleY,
                colour_wiskers, graph);
    } else {
        opacity = 1;
        box_group = add_vertical_line_to_box(options.stroke_width, x_buffer
                + box_width * 0.5, box_plot_vals[0], box_plot_vals[4], box_group, scaleY,
                colour_wiskers, graph);
    }

    //---Want to add the correct tooltip -> this is taken as the first data point in the box ---------------------//
    //var data = options.data[probe * second_sort_by];
    //Add box
    box_group = draw_box(box_group, graph, box_plot_vals, x_buffer, sample_type_name);
    //Add min line
    if (options.box.bar_graph == "yes") {
        if (box_width < 8) {
            if (box_plot_vals[0] != box_plot_vals[2]) {
                //Add min line
                box_group = add_line_to_box(options.stroke_width, x_buffer, box_width, box_plot_vals[0], box_group, scaleY, colour_wiskers, box_width_wiskers, "no", graph);
                //Add max line
                box_group = add_line_to_box(options.stroke_width, x_buffer, box_width,
                        box_plot_vals[2], box_group, scaleY, colour_wiskers, box_width_wiskers,
                        "no", graph);
            }
        } else {
            //Add min line
            box_group = add_line_to_box(options.stroke_width, x_buffer
                    , box_width, box_plot_vals[0], box_group, scaleY, colour_wiskers, box_width_wiskers,
                    "yes", graph);
            //Add max line
            box_group = add_line_to_box(options.stroke_width, x_buffer
                    , box_width, box_plot_vals[2], box_group, scaleY, colour_wiskers, box_width_wiskers,
                    "yes", graph);
        }
        //Add median lines
        box_group = add_line_to_box(options.stroke_width, x_buffer, box_width,
                box_plot_vals[1], box_group, scaleY, colour_box, box_width_wiskers, "yes", graph);

        //Add outside lines
        box_group = add_vertical_line_to_box(options.stroke_width, x_buffer, 0,
                box_plot_vals[1], box_group, scaleY, colour_box, graph);
        box_group = add_vertical_line_to_box(options.stroke_width, x_buffer
                + box_width, 0, box_plot_vals[1], box_group, scaleY, colour_box, graph);
    } else {
        if (box_width < 8) {
            //Add max line
            box_group = add_line_to_box(options.stroke_width, x_buffer, box_width,
                    box_plot_vals[0], box_group, scaleY, colour_wiskers, box_width_wiskers, "no", graph);
            //Add max line
            box_group = add_line_to_box(options.stroke_width, x_buffer, box_width,
                    box_plot_vals[4], box_group, scaleY, colour_wiskers, box_width_wiskers, "no", graph);
        } else {
            //Add max line
            box_group = add_line_to_box(options.stroke_width, x_buffer, box_width,
                    box_plot_vals[0], box_group, scaleY, colour_wiskers, box_width_wiskers, "yes", graph);
            //Add median line
            box_group = add_line_to_box(options.stroke_width, x_buffer
                    , box_width, box_plot_vals[2], box_group, scaleY, colour_median,
                    (box_width / 2.0) * median_percent, "yes", graph);
            //Add max line
            box_group = add_line_to_box(options.stroke_width, x_buffer, box_width,
                    box_plot_vals[4], box_group, scaleY, colour_wiskers, box_width_wiskers, "yes", graph);
        }
    }
    //Option to allow the user to test their values
    if (options.test == "yes") {
        test_values(second_sort_by_name + " " + probe_name + "|" + sample_type_name, box_plot_vals, graph, options);
    }
    if (options.box.draw_scatter == "yes" && jitter != "yes") {
        box_group = add_scatter_to_box(box_group, graph, samples, x_buffer + box_width / 2, sample_type, "white", "black", radius);
    } else if (options.box.draw_scatter == "yes" && jitter == "yes") {
        box_group = draw_jitter_scatter(svg, graph, samples, x_buffer + (box_width / 4), box_width, sample_type, "white", colour_wiskers, radius);
    }
    graph.svg = svg;
    return graph;
}

draw_jitter_scatter = function (svg, graph, samples, x, box_width, sample_type, colour, colour_stroke, radius) {
    var scaleXBox = d3.scale.ordinal()
            .rangePoints([x, x + box_width]);
    var options = graph.options;
    scaleXBox.domain(samples);
    var scale = (box_width / 2) / samples.length;
    svg.selectAll(".dot") // class of .dot
            .data(samples) // use the options.data and connect it to the elements that have .dot css
            .enter() // this will create any new data points for anything that is missing.
            .append("circle") // append an object circle
            .attr("class", function (d) {
                //adds the sample type as the class so that when the sample type is overered over
                //on the x label, the dots become highlighted
                return "sample-type-" + sample_type
            })
            .attr("r", radius) //radius 3.5
            .attr("cx", function (d, i) {
                cx = x + (scale * i);
                return cx;
            })
            .attr("cy", function (d) {
                // set the y position as based off y_column
                // ensure that you put these on separate lines to make it easier to troubleshoot
                var cy = scaleY(d);
                return cy;
            })
            .style("stroke", colour_stroke)
            .style("stroke-width", "1px")
            .style("fill", colour)
            .attr("opacity", 0.8);
    // .on('mouseover', tooltip.show)
    // .on('mouseout', tooltip.hide);

    return svg;

}


/* A small function to test the values from the computed values
 * Checks values from graphs downloaded from stemformatics */
test_values = function (name, box_plot_vals, graph, options) {
    //var fs = require('fs');
    //name in format as saved by stemformatics: name, average. standard deviation, min, max, median, Q1, Q3
    var row = name + "," + 0 + "," + 0 + "," + box_plot_vals[0] + "," + box_plot_vals[4] + "," + box_plot_vals[2] + "," + box_plot_vals[1] + "," + box_plot_vals[3];
    if (options.box.bar_graph == "yes") {
        row = name + "," + box_plot_vals[1] + "," + 0 + "," + box_plot_vals[0] + "," + box_plot_vals[2] + "," + 0 + "," + 0 + "," + 0;
    }

}

get_mean_value = function (values) {
    var sum = 0;
    for (i in values) {
        sum += values[i];
    }
    var mean = sum / values.length;
    return mean;
}



/* Takes the array of samples for a specific sample type
 * already ordered */
calculate_box_plot_vals_bar = function (values) {
    var min_max_vals = return_min_max_vals(values);
    var mean = get_mean_value(values);
    var sum = 0;
    var numbers_meaned = [];
    for (x in values) {
        numbers_meaned.push(Math.abs(values[x] - mean));
    }
    var standard_deviation = get_mean_value(numbers_meaned);
    var min = min_max_vals[0];
    var max = min_max_vals[1];
    return [mean - standard_deviation, mean, mean + standard_deviation];
}

/* Takes the array of samples for a specific sample type
 * already ordered */
calculate_box_plot_vals = function (values) {
    // http://thiruvikramangovindarajan.blogspot.com.au/2014/10/calculate-quartile-q1-q3-and-median-q2.html
    values.sort(function (a, b) {
        return a - b
    });
    var min_max_vals = return_min_max_vals(values);
    var median = get_median_value(values, 0.50);
    var max_quartile = [];
    var min_quartile = [];
    var min_quartile = (values.length % 2 == 0) ? values.slice(0, (values.length / 2) + 1) : values.slice(0, Math.floor(values.length / 2) + 1);
    var max_quartile = (values.length % 2 == 0) ? values.slice((values.length / 2) - 1, values.length) : values.slice(Math.ceil(values.length / 2) - 1, values.length);
    var min_quartile_median = get_median_value(values, 0.25);
    var max_quartile_median = get_median_value(values, 0.75);
    var min = min_max_vals[0];
    var max = min_max_vals[1];
    return [min, min_quartile_median, median, max_quartile_median, max];
}

//Returns the max and minimum values from the daa set
return_min_max_vals = function (values) {
    // changes done by Isha for caculating box plot for negative values
    var max_val = -50;
    var min_val = 100;

    for (var sample_value in values) {
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
get_median_value = function (values, percent) {
    // count = values.length;
    // median = (count % 2 == 0) ? (values[(values.length/2) - 1] + values[(values.length / 2)]) / 2:values[Math.floor(values.length / 2)];
    var k = (values.length - 1) * percent;
    var f = Math.floor(k);
    var c = Math.ceil(k);
    if (f == c) {
        return values[k]
    } else {
        var d0 = values[f] * (c - k);
        var d1 = values[c] * (k - f);
        return d0 + d1;
    }
}

/* Gets the 3 important values for the box plot
 * Median
 * Lower median value
 * upper median value
 */
get_box_plot_values = function (graph) {
    var options = graph.options;
    var expression_values = [];
    var lwr_half_of_Expresssion_vals = [];
    var upr_half_of_expression_vals = [];

    var get_expression_values = d3.extent(options.data, function (d) {
        expression_values.append(d.Expression_Value);
        return d.Expression_Value;
    });
    get_expression_values.sort(function (a, b) {
        return a - b
    });
    var median_val = get_median_value(expression_values);
    for (var val in expression_values) {
        if (val < median_val) {
            lwr_half_of_expresssion_vals.append(val);
        } else if (val > median_val) {
            upr_half_of_expression_vals.append(val);
        }
    }
    var third_quartile = get_median_value(lwr_half_of_expresssion_vals);
    var first_quartile = get_median_value(upr_half_of_expression_vals);
    graph.median_val = median_val;
    graph.third_quartile = third_quartile;
    graph.first_quartile = first_quartile;
    return graph;
}

/*------------------------End of box plot calculations -----------------------------------*/


/** --------------------------- ADDED to make modular ----------------------------- */

/**
 * gets a particular type -> this is used to mae the code more modular
 * Allows us to have probes as main type and samples for others
 */
get_type = function (data_point) {
    return data_point.probe;
}


/*  Setting up the graph including y and x axes */
setup_graph_box = function (graph) {
    // setup all the graph elements
    graph.graph_type = "Box Plot";
    var options = graph.options;
    var label_padding = options.box.x_axis_label_padding;
    var temp_val = 0;
    var diff_val = 0;
    var padding_val = 0;
    var x_axis_position = "bottom";
    var class_name = ".probe_text";
    var collective_name = ".probe-";
    var class_name_for_legend = ".sample_text";
    var collective_name_for_legend = ".sample-";
    graph = setup_margins(graph);
    //graph = setup_size_options(graph);
    graph = setup_svg(graph);
    // Check if it is also being sorted by the second_sort_by state on the x axis
    if (options.include_second_sort_by_x_axis == "yes") {
        graph = sort_x_by_probe_and_second_sort_by(graph);
    } else {
        graph = sort_x_by_probe(graph);
    }
    graph = setup_data_for_x_axis(graph);
    graph = setup_x_axis(graph, graph.probe_list);
    graph = setup_x_axis_labels(graph, null, label_padding, class_name_for_legend, collective_name_for_legend, 3, x_axis_position);
    label_padding += 120;
    if (options.sortByOption.split(",").length != 1) {
        graph = setup_x_axis_labels(graph, null, label_padding, class_name, collective_name, 2, x_axis_position);
        // Add extra padding to the label
        label_padding += 80;
    }
    graph = setup_x_axis_labels(graph, null, label_padding, class_name, collective_name, 1, x_axis_position);
    graph = setup_y_axis(graph);
    graph = setup_box_plot(graph);
    graph = setup_watermark(graph);
    if (options.display.legend === "yes") {
        graph = setup_D3_legend(graph, options.legend_list);
    }
    //graph = setup_vertical_lines(graph);

    // Only display the vertical lines if the user chooses so
    if (options.display.vertical_lines == "yes") {
        graph = setup_vertical_lines(graph, graph.sample_id_list, 1);
        graph = setup_vertical_lines(graph, graph.sample_id_list, 2);
    }
    if (options.display.horizontal_lines == "yes") {
        graph = setup_horizontal_lines(graph);
    }
    return graph;

};  // end setup_graph

// run this right at the start of the initialisation of the class
init_box = function (init_options) {
    var options = default_options();
    options = init_options;
    var page_options = {}; // was new Object() but jshint wanted me to change this
    var graph = {}; // this is a new object
    graph.options = options;
    graph = preprocess_lines(graph);
    graph = setup_graph_box(graph);
    var target = $(options.target);
    target.addClass('box_plot');

    svg = graph.svg;
};


