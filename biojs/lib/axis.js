    /**
     * Copyright 2016 Ariane Mora
     *
     * This contains helper functions related to the building of the axes for
     * the bioJS modules for Stemformatics.
     * Functions include rendering the x and y axis on the svg element. Getting
     * the bounds and setting up the general x axis labels
     */

    /**
     * A general Scaling function which is used to ensure that all elements are
     * scaled to the same amount within a graph -> means we don't have to
     * increase the size of the graph if we can just scale the elements width
     * wise */

    /**
     * removes all special characters)
     */
    remove_chars = function (name) {
        newstring = name.replace(/[&\/\\#,()$~%.'":*?<>{}\s+]/g,'');///[^\w\-\+]/g, '')///[&\/\\#,+()$~%.'":*?<>{}\s+]/g,'');
        return newstring;
    }

    /**
     * Returns a scaled x value
     */
    get_x_value = function (graph, data) {
        var scaleX = graph.multi_scaleX;
        var sort_by_options = graph.options.sortByOption.split(',');
        if (options.multi_group != 1) {
            var option2 = data[sort_by_options[0]];
            // Currently there is an error with the sample type -> needs to be
            // changed to having an underscore
            sort_by_options[1] = "Sample_Type";
            var option1 = data[sort_by_options[1]];
            var scale_val = graph.name_mapping[remove_chars(data.Probe + "-" + option1 + "-" + option2)];
            centreX = scaleX(scale_val);
        } else {
            var scale_val = graph.name_mapping[remove_chars(data.Probe + "-" + data[sort_by_options[0]])];
            centreX = scaleX(scale_val);
        }
        return centreX;
    }


    /**
     * This function ensures that we are never actually using the names for any
     * of ths scaling functions as there can be encoding issues if the data has
     * been copied and pasted. This is an error which is very hard to pick up
     * on. The best way to overcome this is to create a map.
     */
    create_name_mapping = function (names) {
        var map = [];
        var count = 0;
        var list = [];
        for (var n in names) {
            map[names[n]] = count;
            map['val'] = count;
            list.push(count);
            count ++;
        }
        var ret = {};
        ret['map'] = map;
        ret['list'] = list;
        return ret;
    }

    /*
    This includes:
    - returning vertical_lines which is the basis for calculating the vertical lines that
  	separate the sample types.
    - returning the sample_id_list that allows the scaleX.domain(sample_id_list) call to
    create the values for the x values of the samples for ordinal values
    - also want to store the starting sample_id of a sample type as well so that we can
    calculate the middle of the sample types to display just the sample type
    - Need to also create unique names so that a scale can be made for the x axis -> this
      allows us to make sure that it is placed in the correct position and never goes off
      The graph.
    */
    setup_data_for_x_axis = function(graph){
          //Set up any lists needed for setting up x and y axis
        options = graph.options;
        var nested_values = graph.nested_values;
        sort_by_second_sort_bys = false;
        if (options.multi_group != 1) {
            sort_by_multiple = true;
        }
        sample_id_list = [];
        sample_type_list = [];
        second_sort_by_list = [];
        // This allows us to have a scale for the x axis no matter how many
        // different samples
        var multi_xaxis_scale = [];
        var vertical_lines_mapping = [];
        second_sort_by_count = 0; //Keeps track of how many second_sort_by types there are so we can evenly
        //Space them appart on the x-axis
        probe_list = [];
        line_count = 0;
        // We only ever want the vertical lines for the outer component at the
        // moment
        var second_sort_by;
        var sample_type;
        var vertical_lines = [];
        var inner_label = [];
        var outer_label = [];
        var very_inner_label = [];
        var start_name;
        var outer_start_name;
        var cur_name;
        var tempX_outer;
        var probeInfo= {};
        var legend_list = options.legend_list.list;

        for (var p in nested_values) {
            second_sort_by_count = 0;
            second_sort_by_list = [];
            row = nested_values[p];
            probe = row.key;
            values = row.values;
            if (options.multi_group != 1) { //There will be a second key which is the second_sort_by state
                tempX_outer = {};
                for (var st in values) {
                    var srow = values[st];
                    second_sort_by = srow.key;
                    dvals = srow.values;
                    tempX = {};
                    for (var ds in dvals) {
                        inner_tempX = {};
                        var drow = dvals[ds];
                        var sample_type = drow.key;
                        cur_name = remove_chars(probe + "-" + sample_type + "-" + second_sort_by);
                        // Keeps track of the second_sort_by state, if the second_sort_by state changes we know that we
                        // need a new vertical line (this is only important if we have sorted by second_sort_by
                        // state in addition to probes for the x axis
                        second_sort_by_list.push(second_sort_by);
                        second_sort_by_count ++;
                        tempX = {};
                        tempX['label1'] = probe;
                        tempX['label2'] = second_sort_by;
                        tempX['scale_name'] = cur_name;
                        inner_tempX['label1'] = sample_type;
                        inner_tempX['label2'] = second_sort_by;
                        inner_tempX['scale_name'] = cur_name;
                        inner_tempX['end_name'] = cur_name;
                        inner_tempX['start_name'] = cur_name;
                        if (graph.graph_type != "Scatter Plot") {
                            tempX['mapping'] = nested_values[p].values[0].values[0].values[0]['Multi_Mapping']; // get the mapping value pf probe p from the first sample, as the mapping value of probe is always unique
                            tempX['Multi_Mapping_gene'] = nested_values[p].values[0].values[0].values[0]['Multi_Mapping_gene'];
                        }
                        if(graph.graph_type == "Scatter Plot") {
                          for(var legend in legend_list) {
                            if(!probeInfo[legend_list[legend]]) {
                              // storing multi map information so that can be used in axis label and legend to show * and red colour
                                  for(var i=0; i< nested_values[p].values[0].values[0].values.length; i++) {
                                      if(legend_list[legend] == nested_values[p].values[0].values[0].values[i]["Probe"]) {
                                         probeInfo[legend_list[legend]] = [];
                                         probeInfo[legend_list[legend]]['label'] = legend_list[legend];
                                         probeInfo[legend_list[legend]]['mapping'] = nested_values[p].values[0].values[0].values[i]['Multi_Mapping'];
                                         probeInfo[legend_list[legend]]['Multi_Mapping_gene'] = nested_values[p].values[0].values[0].values[i]['Multi_Mapping_gene'];
                                      }
                                  }
                            }
                          }
                        }
                        if (ds == 0) {
                            if (st == 0) {
                                outer_start_name = cur_name;
                            }
                            start_name = cur_name;
                            tempX['start_name'] = cur_name;
                        }
                        vertical_lines_mapping.push(tempX);
                        if ($.inArray(cur_name, multi_xaxis_scale) == -1) {
                            multi_xaxis_scale.push(cur_name);
                        }
                        // Update the starting sample id to the current end
                        very_inner_label.push(inner_tempX);

                    }
                    tempX['start_name'] = start_name;
                    tempX['end_name'] = cur_name;
                    inner_label.push(tempX);
                }
                // Push the last scale name as this will be where we want the
                // vertical line to occur
                outer_start_name = remove_chars(probe + "-" + values[0].values[0].key + "-" + values[0].key);
                //if (graph.graph_type == "Scatter Plot"
                tempX_outer['label1'] = probe;
                tempX_outer['label2'] = second_sort_by;
                tempX_outer['scale_name'] = cur_name;
                tempX_outer['start_name'] = outer_start_name;
                tempX_outer['end_name'] = cur_name;
                if (graph.graph_type != "Scatter Plot") {
                    tempX['mapping'] = nested_values[p].values[0].values[0].values[0]['Multi_Mapping']; //find the Multi_Mapping value for probe p
                    tempX['Multi_Mapping_gene'] = nested_values[p].values[0].values[0].values[0]['Multi_Mapping_gene']; // find the mapped genes
                }
                outer_label.push(tempX_outer);
                vertical_lines.push(outer_start_name);
                vertical_lines.push(cur_name);
            } else {
                // Want to make a unique name for each probe and sample_type
                // for the x axis grouping
                tempX = {};
                for (var st in values) {
                    srow = values[st];
                    sample_type = srow.key;
                    cur_name = remove_chars(probe + "-" + sample_type);
                    tempX = {}
                    inner_tempX = {}
                    tempX['label1'] = probe;
                    inner_tempX['label1'] = sample_type;
                    inner_tempX['scale_name'] = cur_name;
                    tempX['scale_name'] = cur_name;
                    if (graph.graph_type != "Scatter Plot") {
                        tempX['mapping'] = nested_values[p].values[0].values[0]['Multi_Mapping']; // get the mapping value pf probe p from the first array, as the mapping value of probe is always unique
                        tempX['Multi_Mapping_gene'] = nested_values[p].values[0].values[0]['Multi_Mapping_gene']; // get the multi mapping gene names for probe p
                    }
                    if(graph.graph_type == "Scatter Plot") {
                      for(var legend in legend_list) {
                        if(!probeInfo[legend_list[legend]]) {
                          // storing multi map information so that can be used in axis label and legend to show * and red colour
                              for(var i=0; i< nested_values[p].values[0].values.length; i++) {
                                  if(legend_list[legend] == nested_values[p].values[0].values[i]["Probe"]) {
                                     probeInfo[legend_list[legend]] = [];
                                     probeInfo[legend_list[legend]]['label'] = legend_list[legend];
                                     probeInfo[legend_list[legend]]['mapping'] = nested_values[p].values[0].values[i]['Multi_Mapping'];
                                     probeInfo[legend_list[legend]]['Multi_Mapping_gene'] = nested_values[p].values[0].values[i]['Multi_Mapping_gene'];
                                  }
                              }
                        }
                      }
                    }
                    if (st == 0) {
                        outer_start_name = cur_name;
                        vertical_lines.push(outer_start_name);
                        tempX['start_name'] = outer_start_name;
                        inner_tempX['start_name'] = outer_start_name;
                    }
                    if ($.inArray(cur_name, multi_xaxis_scale) == -1) {
                        multi_xaxis_scale.push(cur_name);
                    }
                    // If it is the line graph we want a second labeling even
                    // though there isn't a second grouping
                    tempX['start_name'] = start_name;
                    tempX['end_name'] = cur_name;
                    inner_tempX['start_name'] = cur_name;
                    inner_tempX['end_name'] = cur_name;
                    inner_label.push(tempX);
                    very_inner_label.push(inner_tempX);
                    vertical_lines_mapping.push(tempX);
                }
                // Push the last element as this will be where we want to draw
                // the vertical line
                tempX['start_name'] = outer_start_name;
                vertical_lines.push(cur_name);
                tempX['end_name'] = cur_name;
                outer_label.push(tempX);
            }
            line_count ++;
        }
        var name_mapping = create_name_mapping(multi_xaxis_scale);
        graph.vertical_lines_mapping = vertical_lines_mapping;
        graph.multi_xaxis_list = multi_xaxis_scale;
        graph.vertical_lines = vertical_lines;
        graph.name_mapping = name_mapping.map;
        graph.outer_label = outer_label;
        graph.inner_label = inner_label;
        graph.very_inner_label = very_inner_label;
        graph.probeInfo = probeInfo;
        // Set up a scale on the x axis based on the values
        graph.multi_scaleX = setup_multi_axis_scale(graph, name_mapping.list);
        graph.probe_count = line_count;
        graph.sample_type_list = sample_type_list;
        graph.probe_list = probe_list;
        graph.second_sort_by_list = second_sort_by_list;
        graph.second_sort_by_count = second_sort_by_count;
        graph.sample_id_list = sample_id_list;
        return graph;
    } // setup_data_for_x_axis


  /**
     * Sets up a scale for the X axis based on the groupings
     * Means that it won't go over the size of the graph.
     */
    setup_multi_axis_scale = function (graph, scale_list) {

        var multi_scaleX = d3.scale.ordinal()
                .rangePoints([0, graph.page_options.width], graph.options.padding);
        multi_scaleX.domain(scale_list);
        return multi_scaleX;
    }


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
        // var num_ticks = graph.max_val - graph.min_val;
        // // Since the graph has a "nice" domain
        // num_ticks = num_ticks * 1.25;
        // /* If there are less than 10 ticks set the default to 10 */
        // if (num_ticks < 10) {
        //     num_ticks = 10;
        // } else {
        //     // User may not want any ticks
        //     num_ticks *= options.increment;
        // }
        // setup the yaxis. this is later called when appending as a group .append("g")
        // Note that it uses the y to work out what it should output
        // trying to have the grid lines as an option
        // sets the number of points to increment by 1 whole
        // number. To change see options.increment
        var yAxis = d3.svg.axis()
                .scale(scaleY)
                .orient("left")
                // .ticks(num_ticks)
                .innerTickSize(-page_options.width)
                .outerTickSize(0);

        y_axis_legend_y = (graph.full_height - options.margin.top - options.margin.bottom) / 2;
        if(scaling_required == "yes") {
          y_axis_legend_y = (graph.full_height - options.margin.top - options.margin.bottom)/4;
        }

        /*Adding the title to the Y-axis: stored in options.y_axis_title: information from
         ** http://bl.ocks.org/dougdowson/8a43c7a7e5407e47afed*/
        // only display the title if the user has indicated they would like the title displayed
        if (options.display.y_axis_title === "yes") {
            svg.append("text")
                    .text(options.y_axis_title)
                    .attr("class", "y_axis_label")
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


    calc_x_value_label = function (graph, d, i, info) {
            var prev_line = info.prev_line;
            var cur_line;
            if (i == 0) {
                prev_line = "none";
            }
            // We need to split the lines to see if the sample
            // has changed and add a line if it has
            if (options.multi_group != 1) {
                cur_line = d.label1 + d.label2;
            } else {
                cur_line = d.label1;
            }
            if (cur_line != prev_line) {
                avg = graph.multi_scaleX(graph.multi_xaxis_list[i]);
                prev_line = cur_line;
                info.prev_line = prev_line;
                info.xval = avg + graph.size_of_half_col;
                return info;
            } else {
                info.xval = 0;
                return info;
            }
        }

    // returns label name based on option parameter passed
    return_label_name = function(d,i,label_num,graph,option) {
      ref_type = "probeID"; 
      if(ref_type == "probeID") {
        delimiter = ",";
      }
      else {
        delimiter = " ";
      }
      var legend_name_length = 24;
      var prefix;
      if (label_num == 1 || label_num == 3) {
          temp = d.label1;
      }
       else {
          temp = d.label2;
      }
          if( option == 1) // returns gene and probe name STAT1 ILMN_1543256
            {
                  if(graph.graph_type == "Scatter Plot" || label_num == 3 || label_num == 2) {
                    prefix = "";
                  }
                  else {
                    if(ref_type == "gene_set_id" || ref_type == "probeID") {
                      prefix = options.ref_name[temp];
                    }
                    else {
                      prefix = options.ref_name[symbol];
                    }
                  }
                  word = prefix + " " + temp;
                  temp = word.replace(regex_function(legend_name_length,delimiter), "$&\n")
                  if (d.mapping == "yes") {
                      return temp + "*";
                  } else {
                      return temp;
                  }
            }
          else if(option == 2 ) { // return probe ILMN_565872
                  temp = temp.replace(regex_function(legend_name_length,delimiter), "$&\n")
                if (d.mapping == "yes") {
                    return temp + "*";
                } else {
                    return temp;
                }
          }

          else if (option == 3) { // return STAT1 peak
                if(graph.graph_type == "Scatter Plot" || label_num == 3 || label_num == 2) {
                  prefix = temp;
                }
                else {
                  if(ref_type == "gene_set_id" || ref_type == "probeID") {
                    prefix = options.ref_name[temp] + " " + probe_name;
                  }
                  else {
                    prefix = options.ref_name[symbol] + " " + probe_name;
                  }
                }
                  word = prefix
                  temp = word.replace(regex_function(legend_name_length,delimiter), "$&\n")

                if (d.mapping == "yes") {
                    return temp + "*";
                } else {
                    return temp;
                }
          }

          else if (option == 4) { // return peak
                if(graph.graph_type == "Scatter Plot" || label_num == 3 || label_num == 2) {
                  prefix = temp;
                }
                else {
                  prefix = probe_name;
                }
                  word = prefix;
                  temp = word.replace(regex_function(legend_name_length,delimiter), "$&\n");
                if (d.mapping == "yes") {
                    return temp + "*";
                } else {
                    return temp;
                }
          }
          else if(option == 5) { // return STAT1
                if(graph.graph_type == "Scatter Plot" || label_num == 3 || label_num == 2) {
                  prefix = temp;
                }
                else {
                  if(ref_type == "probeID") {
                    prefix = options.ref_name[temp];
                  }
                  else if(ref_type == "gene_set_id" ) {
                    prefix = gene_set_name;
                  }
                  else {
                    prefix = options.ref_name[symbol];
                  }
                }
                  word = prefix
                  temp = word.replace(regex_function(legend_name_length,delimiter), "$&\n");
                if (d.mapping == "yes") {
                    return temp + "*";
                } else {
                    return temp;
                }
          }

          else if(option == 6) { //  return peak ILMN_1464223
                if(graph.graph_type == "Scatter Plot" || label_num == 3 || label_num == 2) {
                  prefix = temp;
                }
                else {
                  prefix = probe_name + " " + temp;
                }
                  word = prefix;
                  temp = word.replace(regex_function(legend_name_length,delimiter), "$&\n");
                if (d.mapping == "yes") {
                    return temp + "*";
                } else {
                    return temp;
                }
          }

    }

    /* Makes the tooltip for the label */
    make_label_tooltip = function () {
        var tooltip_label = d3.tip()
                .attr('class', 'd3-tip')
                .offset([150,-50])
                .html(function (d) {
                    temp =
                            d.label1 + "<br/>";
                    return temp;
                });
        return tooltip_label;
    };
    /**
     * Prepares the data for the x axis and adds the labels to the x axis
     * This is to make the sample types replace the sample ids
     * Height offset is used if we are havig a second set of labels
     * Label_num tells us whether it is the first or second label for placement
     * and knowing which label we are using
     */
    setup_x_axis_labels = function (graph, label_list, height_offset, class_name, collective_name, label_num) {
        svg = graph.svg;
        position = options.axis;
        var tip = make_label_tooltip();
        svg.call(tip);
        var map = graph.name_mapping;
        page_options = graph.page_options;
        options = graph.options;
        if (label_num == 1) {
            vertical_lines = graph.outer_label;
        }
        else if(label_num == 3) {
          vertical_lines = graph.very_inner_label;
        }
        else {
            vertical_lines = graph.inner_label;
        }
        // handle gaps between samples oin the x axis
        // in the same function you want to store the padding
        // and you want to calculate that last padding too
        var num_lines = vertical_lines.length;
        //vertical_lines = graph.multi_xaxis_list;//graph.vertical_lines;
        var multi_scaleX = graph.multi_scaleX;
        var info;
        var size = 5; // specifies min width for legend text
        var x_axis_text_angle = options.x_axis_text_angle;

        svg.selectAll(class_name)  // text for the xaxes - remember they are on a slant
                .data(vertical_lines).enter()
                .append("text") // when rotating the text and the size
                .attr("class", "x_axis_diagonal_labels x_axis_label")
                .style("text-anchor", "end")
                .style("fill", function(d){
                  if(d.mapping == "yes") {
                    return 'red';
                  }
                  else {
                    return 'no';
                  }
                })
                .attr("id", function(d) {
                    //return "xLabel-" + d.label1;
                    /* This is used during testing to check the correct sample
                    * is displayed */
                })
                // Even though we are rotating the text and using the cx and the cy, we need to
                // specify the original y and x
                .attr("y", function() {
                  if(position == "top" && label_num == 1) {
                    if(angle == -45) {return  0 - height_offset -100}
                    else {return 0 - height_offset;}
                  }
                  else {
                    return page_options.height + height_offset;
                  }
                })
                .attr("x",
                        function (d, i) {
                            var start = map[d.start_name];
                            var end = map[vertical_lines[i].end_name];
                            var diff = (multi_scaleX(end) - multi_scaleX(start)) /2;
                            var x_value = multi_scaleX(start) + diff;
                            return x_value ;
                        }
                ) // when rotating the text and the size
                .text(
                  function(d,i){
                    return return_label_name(d,i,label_num,graph,1)
                })//.call(wrap,size)
                .style("font-family", options.font_style)
                .style("font-size", options.text_size)
                .on("click",function(d){
                        if (label_num == 1) {
                            temp_label = d.label1;
                        }
                        else if(label_num == 3) {
                            temp_label = d.label1;
                        }
                         else {
                            temp_label = d.label2;
                        }
                  if ($("#store_and_submit_select_probes").is(":visible")){
                    var text = "";
                    if($("#textarea-probe").val()) { text = $("#textarea-probe").val() + " ";}
                    $("#textarea-probe").val("");
                    $("#textarea-probe").val( text + temp_label);
                  }
                  else {
                    if(d.mapping == "yes") { // mapping will be yes only for probes, thus if sample type is on x axis, it won't have this click function
                      var url = window.location.href
                      var db_id = $('#db_id').html();
                      var chip_type = $('#chip_type').html();
                      if (label_num == 1) {
                          temp_label = d.label1;
                      } else {
                          temp_label = d.label2;
                      }
                      new_url = url.split(".org")[0]+".org/probes/multi_map_summary?probe_id="+temp_label+"&chip_type="+chip_type+"&db_id="+db_id;
                      window.location = new_url;
                    }
                  }
                })
                .attr("transform",
                        /*combination of this: http://stackoverflow.com/questions/11252753/rotate-x-axis-text-in-d3
                         // and this: http://www.w3.org/TR/SVG/coords.html#TransformAttribute
                         // basically, you just have to specify the angle of the rotation and you have
                         // additional cx and cy points that you can use as the origin.
                         // therefore you make cx and cy your actual points on the graph as if it was 0 angle change
                         // you still need to make the y and x set as above*/
                        function (d, i)  {
                            var start = map[d.start_name];
                            var end = map[vertical_lines[i].end_name];
                            var diff = (multi_scaleX(end) - multi_scaleX(start)) /2;
                            var x_value = multi_scaleX(start) + diff;
                            if(position == "top" && label_num == 1) {
                              var y_value = 0 - height_offset;
                              x_axis_text_angle = angle;
                              if(angle == -45) {y_value -= 100}
                            }
                            else {
                              var y_value = page_options.height + height_offset;
                            }
                            return "rotate(" +x_axis_text_angle + "," + x_value + "," + y_value + ")";
                        }
                )
                /* Sets up the tooltips to display on the mouseover of the sample type label. This tooltip
                 changes the scatter points (increases the size and changes the opacity.
                 Note: due to stange sample type names (i.e. having unagreeable characters) it assigns
                 a number to each sample type and calls this rather than the sample type name.
                 This is set up in simple.js and saves in array options.sample_types where the key
                 is the sample type */
                .on('mouseover', tip.show)
            		.on('mouseout', tip.hide);

        graph.svg = svg;
        return graph;
    }; // setup_x_axis_using_sample_types

    setup_x_axis_click_label_button = function (graph) {
      var padding = 50;
      svg = graph.svg
      svg.append("text")
         .attr("id", "x_axis_button")
         .attr("y",options.height + padding)
         .attr("x",(options.width/2))
         .text("show x axis")
         .on('click', function() {
           draw_graph_with_axis();
         });
      graph.svg = svg;
      return graph;
    }

  //------------Things added to make it modular ---------------------

     label_hover_on_feature = function (d, sample_type_count, collective_name, options) {

      }


     label_hover_out_feature = function (d, sample_type_count, collective_name, options) {
          var radius = options.circle_radius;
          var name = get_type(d);
          var sample_type_group = document.getElementsByClassName(collective_name + name);
          for (i = 0; i < sample_type_group.length; i++) {
              d3.select(sample_type_group[i]).attr("r", radius).style("opacity", 1);
          }
      }
