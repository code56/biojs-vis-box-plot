   //setting up the line to append for each of the values (i.e. line between scatter points)
    //http://bl.ocks.org/d3noob/e99a762017060ce81c76 helpful for nesting the probes
    setup_scatter_line = function (graph) {
        var options = graph.options;
        var scatter_line = d3.svg.line()
                .x(function (d, i) {
                    return scaleX(d[options.x_column]);
                })
                .y(function (d) {
                    return scaleY(d.Expression_Value);
                });
        //nest the values to take order into account (ordered by probe type)
        var dataNest = d3.nest()
                .key(function (d) {
                    return d.Probe;
                })
                .entries(options.data);
        //Gets the colours for the probes (these can be random or prespecified)
        var colour = options.colour;
        var colour_count = 0;
        //nests through for each probe (doesn't take order into account)
        //order needs to be done separately (see above function dataNest)
        dataNest.forEach(function (d, i) {
            svg.append("path")
                    .attr("class", function () {
                        // console.log("line-probe-" + d.key.replace(/\ |(|)/g, ''));
                        return "line-probe-" + remove_chars(d.key);//.replace(/\ |(|)/g, '');
                    })
                    .style("stroke", function () {
                        colour_count++;
                        //if it reaches the number of colours reitterate over them again
                        if (i % options.number_of_colours === 0) {
                            colour_count = 0;
                        }
                        return colour[colour_count];
                    })
                    .style("stroke-width", options.line_stroke_width)
                    .attr("id", 'tag' + remove_chars(d.key))//.replace(/\s+/g, ''))
                    .style("opacity", 1)
                    .attr("fill", "none")
                    .attr("d", scatter_line(d.values));
        });
        graph.svg = svg;
        return graph;

    };//end  setup_scatter_line

    /**
     * Returns a scaled x value
     */
    get_x_value_scatter = function (graph, data) {
        var scaleX = graph.multi_scaleX;
        var sample_id = data.Sample_ID;
        var sort_by_options = graph.options.split_sort_by_option;
        var options = graph.options;
        if (options.multi_group != 1) {
            var option2 = data[sort_by_options[0]];
            // Currently there is an error with the sample type -> needs to be
            // changed to having an underscore
            var option1 = data[sort_by_options[1]];
            var scale_val = graph.name_mapping[remove_chars(option2 + "-" + sample_id
                     + "-" + option1)];
            var centreX = scaleX(scale_val);
        } else {
            var scale_val = graph.name_mapping[remove_chars(data[sort_by_options[0]] +
                    "-" + sample_id)];
            centreX = scaleX(scale_val);
        }
        return centreX;
    }




    sort_scatter_data = function (graph) {
	var options = graph.options;
        var sample_type_count = 0;
        //check if no sample type order has been given. in this case order by order
        // in datasheheet
        var sort_by_options = options.sortByOption.split(',');
        if (options.sortByOption == null) {
            var sample_type_order = options.sample_type_order.split(',');
            var nested_values = d3.nest()
                    .key(function (d) {
                        return d.Sample_Type;
                    })
                    .sortKeys(function (a, b) {
                        return sample_type_order.indexOf(a) - sample_type_order.indexOf(b);
                    })
                    .key(function (d) {
                        return d.Sample_ID;
                    })
                    .entries(options.data);
        }
	    else if (options.sortByOption != "null") {
          if(sort_by_options.length == 1) {
            nested_values = d3.nest()
                    .key(function (d) {
                        var value = sort_by_options[0];
                        return d[value];
                    })
                    .key(function (d) {
                        return d.Sample_ID;
                    })
                    .entries(options.data);
          } else {
            nested_values = d3.nest()
                    .key (function (d) {
                        var value = sort_by_options[0];
                        return d[value];
                    })
                    .key (function (d) {
                        var value2 = sort_by_options[1];
                        return d[value2];
                    })
                    .key (function (d) {
                        return d.Sample_ID;
                        }
                    )
                    .entries(options.data);
          }
	    }
        graph.nested_values = nested_values;
        return graph;
    }



    /**
     * Sets up the actual scatter points on the graph, assigns colours based on
     * probe types also has a tooltip (see simple.js for tooltip setup)
     * with relevent info aobut each point
     * @param {type} graph
     * @returns {unresolved}
     */
    setup_scatter = function (graph) {
        //size_options = graph.size_options;
        var svg = graph.svg;
        var options = graph.options;
        var page_options = graph.page_options;
        var scaleX = graph.multi_scaleX;//graph.scaleX;
        var scaleY = graph.scaleY;
        var y_column = options.y_column;
        var x_column = options.x_column;
        // ######################################## Setup points on the graph ####################################3
        /*  http://bost.ocks.org/mike/circles/
         This pattern is so common, you’ll often see the selectAll + data + enter + append methods called
         sequentially, one immediately after the other. Despite it being common, keep in mind that this
         is just one special case of a data join.
         */
        var tooltip = options.tooltip;
        svg.call(tooltip);
        var x = -1;
        var radius = options.scatter.radius;
        var probes = new Array();
        var color_object = {};

        for(i=0;i<options.probes.length;i++) {
          color_object[options.probes[i]] = options.colour_array[options.probes[i]];
        }

        svg.selectAll(".dot") // class of .dot
                .data(options.data) // use the options.data and connect it to the elements that have .dot css
                .enter() // this will create any new data points for anything that is missing.
                .append("circle") // append an object circle
                .attr("class", function (d) {
                  // chnages done by Isha - no plot for scatter NaN
                  if (isNaN(d[options.y_column])){return;}
                    //adds the sample type as the class so that when the sample type is overered over
                    //on the x label, the dots become highlighted
                    return "sample-type-" + options.sample_types[d.Sample_Type];
                })
                .attr("id", function(d) {
                  if (isNaN(d[options.y_column])){return;}
                    return "scatter-point-" + d.Sample_ID;
                }) // cahnges done by Isha
                .attr("r", function(d){
                  if (isNaN(d[options.y_column])){return;}
                  else {
                    return radius;
                  }
                }) //radius 3.5
                .attr("cx", function (d) {
                  if (isNaN(d[options.y_column])){return;}
                    // set the x position as based off x_column
                    // ensure that you put these on separate lines to make it easier to troubleshoot
                    var xval = get_x_value_scatter(graph, d);//graph.name_mapping[remove_chars(d.Sample_Type + "-" + d.Probe + "-" + d.Sample_ID)];
                    //var cx = scaleX(xval);//d[options.x_column]);
                    return xval;
                })
                .attr("cy", function (d) {
                  if (isNaN(d[options.y_column])){return;}
                    // set the y position as based off y_column
                    // ensure that you put these on separate lines to make it easier to troubleshoot
                    // changes done by Isha
                    var cy = scaleY(d[options.y_column]);
                    return cy;
                })
                .style("stroke", "black")
                .style("stroke-width", function(d){
                  if (isNaN(d[options.y_column])){return "0px";}
                  else {return "1px";}
                })
                .style("fill", function (d) {
                    //chooses the colour based on the probe
                    //gets the colours from options
                    if (isNaN(d[options.y_column])){return;}
                    return options.scatter.colour_array[d.Probe];//"Red";//color_object[d.Probe];

                })
                .on('mouseover', tooltip.show)
                .on('mouseout', tooltip.hide);

        graph.svg = svg;
        return graph;
    };    // end of  setup_scatter



    set_data_order = function(graph) {
        var options = graph.options;
        if (options.sample_type_order !== "none") {
            options.data.sort(function(a, b) {
                var x = a.Sample_Type;
                var y = b.Sample_Type;
                return x < y ? -1 : x > y ? 1 : 0;
            })
        }
        return graph;
    }

    get_type = function (data_point) {
        return data_point;
    }

    /*  Setting up the graph including y and x axes */
    setup_graph_scatter = function (graph) {
        graph.graph_type = "Scatter Plot";
        var label_padding = 20;
        // setup all the graph elements
        var options = graph.options;
        var class_name = ".sample_type_text";
        var collective_name = ".sample-type-";
        graph = preprocess_lines(graph);
        graph = setup_margins(graph);
        graph = set_data_order(graph);
        graph = setup_svg(graph);
        graph = sort_scatter_data(graph);
        graph = setup_data_for_x_axis(graph);
        graph = setup_x_axis(graph, graph.sample_id_list);
        if (options.display.x_axis_labels === "yes") {
            if (options.multi_group != 1) {
                graph = setup_x_axis_labels(graph, graph.sample_id_list, label_padding, class_name, collective_name, 2);
                label_padding += 80;
            }
            graph = setup_x_axis_labels(graph, graph.sample_id_list, label_padding, class_name, collective_name, 1);

        }

        graph = setup_y_axis(graph);
        // Only display the vertical lines if the user chooses so
        if (options.display.vertical_lines === "yes") {
            //Need to pass it the list on which the lines are to be created
            graph = setup_vertical_lines(graph, graph.sample_id_list);
        }
        // Display the legend if the user has specified they want the legend
         if (options.display.legend  === "yes") {
            graph = setup_D3_legend(graph, options.legend_list);
        }
        if (options.error_needed == true) {
            graph = setup_error_bars(graph)
        }
        if (options.display.horizontal_lines === "yes") {
            graph = setup_horizontal_lines(graph);
        }
        graph =  setup_watermark(graph);
        if (options.display.hoverbars === "yes") {
            //graph = setup_hover_bars(graph);
        }
        graph = setup_scatter(graph);
        if(options.scaling_required == "yes") {
          $('.x_axis_label').hide();
          $('.y_axis_label').hide();
          $('.main-title').hide();
        }
        return graph;

    };  // end setup_graphsize_of_second_sort_by_labels

    // end test
    // run this right at the start of the initialisation of the class
    init_scatter = function (init_options) {
        var options = default_options();
        options = init_options;
        var page_options = {}; // was new Object() but jshint wanted me to change this
        //size_options = {};
        var graph = {}; // this is a new object
        graph.options = options;
        graph.page_options = page_options;
        graph = setup_graph_scatter(graph);
        var target = $(options.target);
        target.addClass('scatter_plot');
        svg = graph.svg;
    };