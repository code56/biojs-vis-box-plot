require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
                                var temp = get_x_value_scatter(graph, d);//scaleX(d[options.x_column]);
                                return temp;

                            } else {
                                width = options.error_bar_width;
                                var temp = get_x_value_scatter(graph, d) - width;//scaleX(d[options.x_column]) - width;
                                return temp;
                            }
                        }
                )
                .attr("x2",
                        function (d) {
                            if (((d.Expression_Value + d.Standard_Deviation) - d.Expression_Value) < (d.Expression_Value / dividor)) {
                                var temp = get_x_value_scatter(graph, d);//scaleX(d[options.x_column]);
                                return temp;
                            } else {
                                var temp = get_x_value_scatter(graph, d) + width;//scaleX(d[options.x_column]) + width;
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
                          if (isNaN(d.Expression_Value)){return;}
                            //Checks if the error is < 1% (default - can be made more precise see options.error_dividor) of the value
                            // If it is it doesn't paint the bars (x part)
                            if (((d.Expression_Value + d.Standard_Deviation) - d.Expression_Value) < (d.Expression_Value / dividor)) {
                                var temp = get_x_value_scatter(graph, d);//scaleX(d[options.x_column]);
                                return temp;
                            } else {
                                var temp = get_x_value_scatter(graph, d) + width;//scaleX(d[options.x_column]) + width;
                                return temp;
                            }
                        }

                )
                .attr("x2",
                        function (d) {
                          if (isNaN(d.Expression_Value)){return;}
                            if (((d.Expression_Value + d.Standard_Deviation) - d.Expression_Value) < (d.Expression_Value / dividor)) {
                                var temp = get_x_value_scatter(graph, d);//scaleX(d[options.x_column]);
                                return temp;
                            } else {
                                var temp = get_x_value_scatter(graph, d) - width;//scaleX(d[options.x_column]) - width;
                                return temp;
                            }
                        }

                )
                .attr("y1",
                        function (d) {
                          if (isNaN(d.Expression_Value)){return;}
                            temp = scaleY(d.Expression_Value - d.Standard_Deviation);//lower value
                            return temp;
                        }
                )
                .attr("y2",
                        function (d) {
                          if (isNaN(d.Expression_Value)){return;}
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
                            var temp = get_x_value_scatter(graph, d);//scaleX(d[options._column]);
                            return temp;
                        }
                )
                .attr("x2",
                        function (d) {
                            var temp = get_x_value_scatter(graph, d);//scaleX(d[options.x_column]);
                            return temp;
                        }
                )
                .attr("y1",
                        function (d) {
                          if (isNaN(d.Expression_Value)){return;}
                            temp = scaleY(d.Expression_Value + d.Standard_Deviation);//
                            return temp;
                        }
                )
                .attr("y2",
                        function (d) {
                          if (isNaN(d.Expression_Value)){return;}
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
                .style("fill", 'black'); // color is black

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

    //An array of colours which are used for the different probes
    var colours_alternate_sort = ["DarkOrchid", "Orange", "DodgerBlue", "Blue","BlueViolet","Brown", "Deeppink", "BurlyWood","CadetBlue",
     "Chartreuse","Chocolate","Coral","CornflowerBlue","Crimson","Cyan", "Red", "DarkBlue",
     "DarkGoldenRod","DarkGray", "Tomato", "Violet","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen", "DarkOrange","DarkOrchid","DarkRed","DarkSalmon","DarkSlateBlue","DarkTurquoise",
     "DarkViolet","DeepPink","DeepSkyBlue","DodgerBlue","FireBrick","ForestGreen","Fuchsia",
     "Gold","GoldenRod","Green","GreenYellow","HotPink","IndianRed","Indigo"];

    /**
     * Sets up the colours and respective groupings for the legend.
     * This is done for probes, line group, sample types -> essentially
     * any grouping which can appear on the legend
     */
    setup_colours_for_group = function (array_group, new_array, number_of_colours,colours) {

        var count = 0;
        for (i = 0; i< array_group.length; i++){
            if (count == number_of_colours){
                count = 0;
            }
            new_array[array_group[i]] = colours[count];
            count ++;
          }
        return new_array;
    }




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
          // changes the option name to num_sample_types from num_line_groups
            if (options.num_sample_types * options.box_width * 2 > options.width) {
                //Here we are compensating for any overflow that may occur due to many samples
                width_to_support_many_samples = options.box_width * 3;
            }
        }
        if (graph.graph_type == "Violin Plot") {
            if (options.num_sample_types * options.box_width * 2 > options.width) {
                //Here we are compensating for any overflow that may occur due to many samples
                width_to_support_many_samples = options.box_width * 3;
            }
        }
        /* Added during merge from Isha's code */
        width_to_support_many_samples = 0;
        if (graph.graph_type != "Scatter Plot") {
            if (options.num_sample_types * options.box_width  > options.width) {
              // changes done by Isha
                //Here we are compensating for any overflow that may occur due to many samples
                options.box_width = (options.width / options.num_sample_types)/4 ;
            }
            else {
              if ((options.num_sample_types * options.box_width )/(options.width/options.probe_order.length) > 1) {
                options.box_width = (options.width * 0.70/options.probe_order.length)/options.num_sample_types;
              }
            }
        }
        page_options.width_to_support_many_samples = width_to_support_many_samples/2;
        page_options.width = (width_to_support_many_samples * options.probe_count) + options.width;
        graph.page_options = page_options;
	/* End added */
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
     * Used to make sure that it is in the same format as we recieve from the
     * tsv format*/
    remove_spaces = function (name) {
        newstring = name.replace(/\s+/g, '_')///[&\/\\#,+()$~%.'":*?<>{}\s+]/g,'');
        return newstring;
    }

    /**
     * Sets up the SVG element
     * @param {type} graph
     * @returns {unresolved}
     */
    setup_svg = function (graph) {
        /* We are just making sure that the sorting options are in the correct
         * format with how we expect it to be i.e. no spaces insetad we
         * put underscores in */
        options = graph.options;
        options["sortByOption"] = remove_spaces(options.sortByOption);
        page_options = graph.page_options;
        // pull request
        if(graph.graph_type == "Scatter Plot") {
            full_width = page_options.full_width;
        }
        else {
          full_width = page_options.full_width;
        }
        full_height = page_options.full_height;

        if(options.scaling_required == "yes") {
          var scaleX = 0.4;
          var scaleY = 0.4;
        }

        graph.full_width = full_width;
        graph.full_height = full_height;
        background_stroke_width = options.background_stroke_width;
        background_stroke_colour = options.background_stroke_colour;

        // setup the SVG. We do this inside the d3.tsv as we want to keep everything in the same place
        // and inside the d3.tsv we get the data ready to go (called options.data in here)
        if(scaling_required == "yes") {// clear out html
        $(options.target)
                .html('')
                .css('width', (full_width * scaleX/1.05) + 'px')
                .css('height', (full_height * scaleY) + 'px');

          var idname = options.target.id;
          var tooltip_multiview = graph.options.tooltip_multiview;
          options.margin = {top: 80, left: 40, bottom: -100, right: -80};
          var top_padding = 50;
          var svg = d3.select(options.target).append("svg")
                  .attr("width", full_width * scaleX/1.05)
                  .attr("height", full_height * scaleY)
                  .attr("id", idname + "-svg")
                  .attr("class","graph-svg")
                  .on('click', function(){
                    lastClickedGraph = idname;
                    open_modal('modalDiv',"open")
                  })
                  .append("g")
                  .attr("id", idname + "-group")
                  // this is just to move the picture down to the right margin length
                  .attr("transform", "translate(" + options.margin.left + "," + (options.margin.top - top_padding) +")" + " scale(" + scaleX + "," + scaleY + ")");
        }
        else {
          // clear out html
          $(options.target)
                  .html('')
                  .css('width', full_width + 'px')
                  .css('height', full_height + 'px');
          var idname = options.target.id;
          var svg = d3.select(options.target).append("svg")
                  .attr("width", full_width)
                  .attr("height", full_height)
                  .attr("id", idname + "-svg")
                  .attr("class","graph-svg")
                  .append("g")
                  .attr("id", idname + "-group")
                  // this is just to move the picture down to the right margin length
                  .attr("transform", "translate(" + page_options.margin.left + "," + page_options.margin.top + ")");
        }


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
        counter = 0;
        svg.append("text")
            .attr("id","main_title")
            .attr("class","graph-title main-title") //Ariane changed this from hurray
            .attr("x", page_options.width/2)//options.x_middle_title)
            .attr("y", 0 - (page_options.margin.top /1.25) )
            .attr("text-anchor", "middle")
            .text(options.title)
            .style("font-family", options.font_style)
            .style("font-size", options.title_text_size)
            .style("fill", "black");

        //Adds the subtitles to the graph
        for (i = 0; i < options.subtitles.length; i ++) {
            var subtitle = (options.subtitles[i].replace(/.{125}\S*\s+/g, "$&@").split(/\s+@/))
            for(j=0;j<subtitle.length; j ++) {
              counter ++;
              svg.append("text")
              .attr("id", "subtitle")
              .attr("class","graph-title")
              .attr("x", page_options.width/2)//ptions.x_middle_title)
              .attr("y", function() {
                  num = page_options.margin.top/1.25 - (parseInt(options.text_size, 10) * (i + 1));
                  if (num <= 0) {
                      count ++;
                  }
                  return 0 - num;
              })
              .attr("text-anchor", "middle")
              // Adds the class for the specific subtitle as specified
              .text(subtitle[j])//.attr("class",options.title_class+" subtitle" + i)
              .style("font-family", options.font_style)
              .style("font-size", options.title_text_size)
              .style("fill", "black") // changes done by Isha
              .attr("transform", "translate(0,"+(10 + (counter *20) )+")");
              // .attr("class",options.title_class);
            }

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
        page_options = graph.page_options;
        options = graph.options;
        var watermark_width = 200;
        var watermark_height = 50;
        options.watermark_width = watermark_height;
        svg.append("image")
                .attr("xlink:href", options.watermark)
                .attr("id","s4m-logo")
                .attr("x", page_options.height / 2 - 100)
                .attr("y", -page_options.width -  page_options.margin.left/2)// just out of the graphs edge
                .attr("transform", "rotate(+90)")
                .attr("width", watermark_width)
                .attr("height", watermark_height);

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
        var prev_y = undefined;
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
                      .attr("x", function (d) {
                            var x1 =  margin_y_value + (name.length * 3) + 15;
                            if (y_value == prev_y) {
                                 x1 = margin_y_value + (name.length * 3) + 50 + prev_size;
                            }
                            prev_y = y_value;
                            prev_size = x1;
                            return x1;
                        })
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
    setup_vertical_lines = function (graph, sample_id_list, line_type) {
        var svg = graph.svg;
       // if (line_type == 1) {
            vertical_lines = graph.outer_label;
    //    } else {
  //          vertical_lines = graph.inner_label;
      //  }
        var multi_scaleX = graph.multi_scaleX;
        var size_half_column = 0;
        var page_options = graph.page_options;
        var num_lines = vertical_lines.length;
        var prev_line;
        var cur_line;
        var map = graph.name_mapping;
        var i = 0;
        svg.selectAll(".separator").data(vertical_lines).enter()
                .append("line")
                .attr("class", "separator")
                .attr("x1",
                            function (d, i) {
                            if (i == 0) {
                                prev_line = "none";
                                // The sxize of the first collumn is the size of
                                // the first element
                                size_half_column = multi_scaleX(d) / 4;
                            }
                            if (i == num_lines - 1) {
                                return 0;
                            }
                            var start = map[d.end_name];
                            var end = map[vertical_lines[i+ 1].start_name];
                            var diff = (multi_scaleX(end) - multi_scaleX(start)) /2;
                            avg = multi_scaleX(start) + diff;// + size_half_column;
                            return avg;/*
                        function (d, i) {
                            var start = map[d.start_name];
                            var end = map[vertical_lines[i].end_name];
                            var diff = (multi_scaleX(end) - multi_scaleX(start)) /2;
                            var x_value = multi_scaleX(start) - diff;
                            return x_value;
*/
                        }
                )
                .attr("x2",
                        function (d, i) {
                            if (i == 0) {
                                prev_line = "none";
                                // The size of the first collumn is the size of
                                // the first element
                                size_half_column = multi_scaleX(d) / 4;
                            }
                            if (i == num_lines - 1) {
                                return 0;
                            }
                            var start = map[d.end_name];
                            var end = map[vertical_lines[i + 1].start_name];
                            var diff = (multi_scaleX(end) - multi_scaleX(start)) /2;
                            avg = multi_scaleX(start) + diff;//multi_scaleX(start);// + size_half_column;
                            return avg;/*
                        function (d, i) {
                            var start = map[d.start_name];
                            var end = map[vertical_lines[i].end_name];
                            var diff = (multi_scaleX(end) - multi_scaleX(start)) /2;
                            var x_value = multi_scaleX(start) - diff;
                            return x_value;
*/
                        }

                )
                .attr("y1",
                        function (d, i) {
                           /* if (i == num_lines - 1) {
                                return 0;
                            }
                            temp = 0;*/
                            return 0;
                        }
                )
                .attr("y2",
                        function (d, i) {
                            /*if (i == num_lines - 1) {
                                return 0;
                            }*/
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
                .offset([0,100]) // adjust the position of tooltip hover
                .html(function (d) {
                    temp =
                            d + "<br/>";
                    return temp;
                });
        return tooltip_legend;
    };

    // http://bl.ocks.org/mbostock/7555321
    // break text element to text spans and split word after certain length
    function wrap(text, width) {
      var lineHeight = 1.1;
      text.each(function() {
        var text = d3.select(this),
            words = text.text().split("\n").reverse(),
            word,
            line = [],
            lineNumber = 0, // this needs to be in loop so that it incremneted within each legend and for next legend it goes to zero again
            y = text.attr("y"),
            x = text.attr("x"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", x).attr("y", y-16).attr("dy", 0 + "em");
        while (word = words.pop()) {
          line.push(word);
          tspan.text(line.join(" "));
          // for multiview the graph divs are hidden, thus added that to condition so that loop can be executed even when tspan.node().getComputedTextLength() = 0, which is in case of display none
          if ( (tspan.node().getComputedTextLength() > width) || ( (tspan.node().getComputedTextLength() == 0) && ($("#row_3").css('display') == "none" || $("#row_6").css('display') == "none" ) ) ) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan").attr("x", x).attr("y", y - 16).attr("dy", lineHeight+ lineNumber +  "em").text(word);
            lineNumber++;
          }
        }
      }
    )};

    // http://stackoverflow.com/questions/2232603/regular-expressions-to-insert-r-every-n-characters-in-a-line-and-before-a-com
    regex_function = function(size,delimiter) {
      var regex_expression =  new RegExp("(.{" + size + "})"+ delimiter, "g");
      return regex_expression;
    }

    /**
     *  http://bl.ocks.org/ZJONSSON/3918369 and
     *  http://zeroviscosity.com/d3-js-step-by-step/step-1-a-basic-pie-chart
     *  Interactive legend which allows you to display and not display the legend
     *  In a separate group to allow for scaling and also for multiple collumns
     */

    setup_D3_legend = function (graph, sample_list) {
         svg = graph.svg;
         var tip = make_legend_tooltip();
         svg.call(tip)
         var max_legend_name_length = 25;
         var delimiter = " ";
         var vertical_counter = 1;
         var rows = 1;
         var row_counter = 1;
         var sample_type_list = sample_list.list;
         var legend_type = sample_list.name;
         var legendSpacing = 4;
         var size = 5;
         var probe_length = 12;
         var sample_type_length = 17;
         var probeInfo = graph.probeInfo;
         options = graph.options;
         var legendRectSize = options.legend_rect_size;
         page_options = graph.page_options;
        // May need to change for the following graphs
        if((graph.graph_type == 'Box Plot' || graph.graph_type == 'Violin Graph') && (options.sortByOption.split(',')[0] == 'Sample_Type' || options.sortByOption.split(',')[1] == 'Sample_Type')) {
          assigned_colour= options.colour;
        }else {
          assigned_colour = options.colour_array;
        }
         //Add a legend title
         svg.append("text")
                 .attr("x", page_options.width + options.legend_padding)//options.x_middle_title)
                 .attr("y", 0)
                 .attr("text-anchor", "middle")
                 .text("Legend").attr("class", options.title_class + " legend-title")
                 .style("font-family", options.font_style)
                 .style("font-size", options.title_text_size)
                 .style("fill", "black");
                 counter = 1;
                 legend_num = 1;

         //Add the legend to the svg element
         var legend = svg.selectAll('.legend')
                 .data(sample_type_list) //options.probs contains the name and colour of the probes
                 .enter()
                 .append('g')
                 .attr('transform', function (d, i) {
                     var height = legendRectSize + 17;
                     // Probe count tells us how many samples we have
                     var offset = height / 2; //the 20 is to allow for the text above
                     var horizontal = -2 * legendRectSize  + (page_options.width +
                        (options.legend_padding * counter)) ;

                     vertical = (legend_num * height - offset)  ;

                     legend_num ++;
                     if(d.length > (2 * max_legend_name_length)) {
                         rows = Math.ceil((d.length/max_legend_name_length)/2); //calculates how many rows are required by legend_name and as one row can handle two text rows, thus divided by 2
                         legend_num++;
                     }
                     else {
                       rows = 1;
                     }
                     if (vertical > 400) {
                         legend_num = 1;
                         counter ++;
                       }

                     return 'translate(' + horizontal + ',' + vertical + ')';
                 });

         id = null;
         //Add legend squares
         legend.append('rect')
                 .attr('width', legendRectSize)
                 .attr('class', "legendClass")
                 .attr('id', function (d, i) {
             			return "legend-rect-" + d[i];
                     return "legend-rect-" + d[0];
                     // Changed this from just probeInfo[0] for testing pupose's
                     // Make the id of the rectangle that of the probe name
                 })
                 .attr('height', legendRectSize)
                 .style('fill', function (d, i) {
			                 return assigned_colour[d];
                    })
                .style('stroke', function (d, i) {
			                 return assigned_colour[d];
                })
                .style('opacity', 1)
                .on('mouseover',tip.show)
                .on('mouseout',tip.hide); //end on_click button

         //Add legend text
         legend.append('text')
                .attr("id", function (sample_type_list) {
                    return "legend-text-" + probeInfo[0];
                    })
                .attr('class', "legendClass")
                .attr('x', legendRectSize + legendSpacing)
                .attr('y', legendRectSize - legendSpacing)
                .style("font-family", options.font_style)
                .style("font-size", options.text_size)
                .style('opacity', 1)
                .text(function (sample_type_list,i) {
                  if(legend_type == "probes") {
                    if(ref_type == "ensemblID" || ref_type=="miRNA") {
                      var legend_sample_type = options.ref_name[symbol] + " " + probeInfo[sample_type_list]['label'];
                    }
                    else {
                      var legend_sample_type = options.ref_name[probeInfo[sample_type_list]['label']] + " " + probeInfo[sample_type_list]['label'];
                    }
                    var word = legend_sample_type.replace(regex_function(probe_length,delimiter), "$&\n");
                    if (probeInfo[sample_type_list]['mapping'] == "yes") {
                        return word +"*";
                    } else {
                        return word;
                    }
                  }
                  else {
                      var word = sample_type_list.replace(regex_function(sample_type_length,delimiter), "$&\n");
                      return word;
                  }
 		        }).call(wrap,size)
            .style("fill", function(sample_type_list,i){
              //make pull
              if(legend_type == "probes") {
                if(probeInfo[sample_type_list]['mapping'] == "yes") {
                  return 'red';
                }
                else {
                  return 'black';
                }
              }
              else {
                return "black";
              }
                  });
        full_width_var = (full_width + (options.legend_padding *counter)) +"px";
        full_width = full_width + (options.legend_padding *counter);
        document.getElementsByClassName("graph-svg")[0].setAttribute("width",full_width_var);
         graph.svg = svg;
         return graph;
     };

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
var general_setup = require('./general.js');
var axis = require('./axis.js');
var features = require('./features.js');
var barlinebox = require('./box_bar_line.js');
var ref_type = "probeID";

module.exports = biojsvisboxplot = function (init_options)
{
   // Sorts the sorted probe types by second_sort_by state if necesary so that they can
    // be grouped by both second_sort_by state and probe on the x axis
    // http://bl.ocks.org/phoebebright/raw/3176159/ for sorting
    sort_x_by_probe_and_second_sort_by = function(graph) {
        options = graph.options;
        //Check if there is an order given for the second_sort_by states, if none given order by dataset
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
                  value = order_types[0]//options.sortByOption[0]
                    return d[value];
                })
                .key(function(d) {
                    return d.Sample_Type;
                })
                .sortKeys(function(a,b){
                  return sample_type_order.indexOf(a) - sample_type_order.indexOf(b);})
                .entries(options.data);
        } else {
            sample_type_order = options.sample_type_order.split(',');
            nested_values = d3.nest()
                .key(function(d) {
                    return d.Probe;
                })
                .key(function(d) {
                    return d.second_sort_by;
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
                var probe_order = options.probe_order;
                var sample_type_order = options.sample_type_order.split(',');
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
                    var probe_order = options.probe_order;
                    var sample_type_order = options.sample_type_order;
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
                  var probe_order = options.probe_order;
                  var second_sort_by_order = options.legend_list.list;
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
                             .sortKeys(function(a,b){
                               return second_sort_by_order.indexOf(a) - second_sort_by_order.indexOf(b);
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


 /*------------------------------Box plot Calculations--------------------------------------*/
    /* Sets up the box plot */
    setup_box_plot = function(graph) {
        sample_types_with_colour = {}
        colour_count = 0;
        options = graph.options;
        nested_values = graph.nested_values;
        second_sort_by = "";
        sample_type_list = [];
        var colour_array = options.colour_array;
        id = 1; //  NOTE CHANGE THISLATER
         for (probe in nested_values) {
            row = nested_values[probe];
            values = row.values;
            probe_name = row.key;
            if (options.sortByOption.split(",").length != 1) { // changes done by Isha
                number_sample_types = options.sample_type_order.split(",").length; //There will be a second key which is the second_sort_by stat
                for (second_sort_bys in values) {
                    row = values[second_sort_bys];
                    second_sort_by_values = row.values;
                    second_sort_by = row.key;
                    // These are the expression values for a specific sample grouped by the probe
                    // then the second_sort_by type so now we need to append all the expression values for this
                    // group then calculate the box plot and draw the values
                    for (sample_types in second_sort_by_values) {
                        sample_row = second_sort_by_values[sample_types];
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
                        //Now have all the expression values for a specific sample type so we create box
                        //plot and calculate the values
                        if(expression_values.length != 0) {
                              if (options.bar_graph == "yes") {
                              box_plot_vals = calculate_box_plot_vals_bar(expression_values);
                            } else {
                                box_plot_vals = calculate_box_plot_vals(expression_values);
                            }// Actually draw the box plot on the graph
                            graph = draw_box_plot(expression_values, graph, box_plot_vals, probe_name, sample_type, second_sort_by,nan_counter);
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
                    second_sort_bys = [];
                    second_sort_by_names = "";
                    //At the level of the xcel file now
                    for (x in sample_values) {
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
                      graph = draw_box_plot(expression_values, graph, box_plot_vals, probe_name, sample_type, second_sort_by_names, nan_counter);
                    }

                }
            }
        }
        graph.sample_type_list = sample_type_list;
        return graph;
    }

    add_scatter_to_box = function(svg, graph, scatter_values, median_line, sample_type, colour, colour_stroke) {
        options = graph.options;
        radius = options.radius;
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

    make_box_tooltip = function(probe, sample_type, second_sort_by,nan_counter) {
        var tooltip_box = d3.tip()
            .attr('class', 'd3-tip')
            .offset([0, +110])
            .html(function(d) {
               if(nan_counter == 0){
                 temp =
                    "Probe: " + probe + "<br/>" +
                    "Sample Type: " + sample_type +"<br/>"
                  if(options.sortByOption.split(",").length != 1) {
                    temp = temp +  "State: " + second_sort_by +"<br/>"
                  }
                }
                else {
                  temp =
                       "Probe: " + probe + "<br/>" +
                       "Sample Type: " + sample_type +"<br/>" +
                       nan_counter +" Sample Removed Due to Floored Values " + "<br/>"

                   if(options.sortByOption.split(",").length != 1) {
                     temp = temp +  "State: " + second_sort_by +"<br/>"
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
            .attr("fill", function() {
              if((options.sortByOption.split(',')[0] == 'Sample_Type' || options.sortByOption.split(',')[1] == 'Sample_Type'))
                {return options.colour[sample_type_name];}
              else
                {return options.colour_array[sample_type_name]}
            })
            .attr("opacity", opacity)
            .on("mouseover", tooltip_box.show)
            .on("mouseout", tooltip_box.hide);
	return svg;
    }

    /* Draw box plot draws the box and wiskers onto the graph and also if it is a bar graph this is drawn on too */
    draw_box_plot = function(samples, graph, box_plot_vals, probe_name, sample_type_name, second_sort_by_name, nan_counter) {
        var svg = graph.svg;
        scaleY = graph.scaleY;
        scaleX = graph.scaleX;
        options = graph.options;
        tooltip_box = make_box_tooltip(probe_name, sample_type_name, second_sort_by_name,nan_counter);
        jitter = options.jitter;
        svg.call(tooltip_box);
        box_width = 50;//options.box_width;
        var map = graph.name_mapping;
        // Scale x for the layered x axis
        var box_scale = graph.multi_scaleX;
        var radius = options.radius;
        //Make a group so the whole box can be scaled if need be and add the
        //box to the group
        var median_percent = 0.9; //Means that the median line covers this amount of the box plot
        if((box_width*options.num_sample_types * options.probe_count) > options.width) {
            box_width = options.width / (options.num_sample_types * options.probe_count);
        }
        if(options.sortByOption.split(",").length != 1) {
          for(i=0; i<nested_values[0].values.length; i++) {
            //box_width = Math.min(box_width, (graph.size_of_second_sort_by_collumn / nested_values[0].values[i].values.length))
          }
            var id = remove_chars(probe_name + "-" + sample_type_name + "-" + second_sort_by_name);
            var name = map[id];
            x_buffer = box_scale(name) - box_width/2;
        } else {
            var id = remove_chars(probe_name + "-" + sample_type_name);
            var name = map[id];
            x_buffer = box_scale(name) - box_width/2;
        }
        var group_scale = scale_group_width(graph, x_buffer, box_width, box_scale(name - 1), box_scale(name + 1));
        var box_group = svg.append('g')
                        .attr("id", "group-" + id);
        box_width = box_width * group_scale;
        box_width_wiskers =options.box_width_wiskers; //assumes box width > box_width wiskers
        if (box_width_wiskers * 2 > box_width) {
            box_width_wiskers = box_width/2;
        }
        // Scale the drawing elements
        box_width = box_width * group_scale;
        box_width_wiskers = box_width_wiskers * group_scale;
        stroke_width = options.stroke_width_num * group_scale;
        radius = radius * group_scale;
        if (radius < options.mins.radius) {
            radius = options.mins.radius;
        }
        if (box_width < options.mins.box_width) {
            box_width = options.mins.box_width;
            box_width_wiskers = options.mins.box_width * 0.75;
        }
        if (stroke_width < options.mins.stroke) {
            stroke_width = options.mins.stroke;
        }
        stroke_width = stroke_width + "px";
        // changes done by Isha
        // colour_box = sample_types_with_colour[sample_type_name];
        // colour_box = options.colour_array[sample_type_name];
        if(options.whiskers_needed == true) {
          if((options.sortByOption.split(',')[0] == 'Sample_Type' || options.sortByOption.split(',')[1] == 'Sample_Type'))
            {colour_wiskers = options.colour[sample_type_name];
            colour_box = options.colour[sample_type_name]} // this is when sample type is legend and colour is gradient
          else
            {colour_wiskers = options.colour_array[sample_type_name];
            colour_box = options.colour[sample_type_name]} // this when tissue, gender etc is present and we do not need gradient
        }
        else {
          colour_wiskers = undefined;
          colour_box = options.colour[sample_type_name]
        }
        colour_median = "white";
        id = probe_name + "-" + sample_type_name + "-" + second_sort_by_name;
        //Add vertical lline
        if (options.probe_count == 1 && options.sortByOption.split(",").length == 1 && options.bar_graph == "yes") {
            opacity = 0.4;
            box_group = add_vertical_line_to_box(options.stroke_width, x_buffer + box_width*0.5,
                    box_plot_vals[0], box_plot_vals[2], box_group, scaleY,colour_wiskers, graph);
        }
        else if (options.bar_graph == "yes") {
            opacity = 0.4;
            box_group = add_vertical_line_to_box(options.stroke_width, x_buffer+ box_width*0.5,
                    box_plot_vals[0], box_plot_vals[2], box_group, scaleY,
                colour_wiskers, graph);
        } else {
            opacity = 1;
            box_group = add_vertical_line_to_box(options.stroke_width, x_buffer
                + box_width*0.5, box_plot_vals[0], box_plot_vals[4], box_group, scaleY,
                colour_wiskers, graph);
        }

        //---Want to add the correct tooltip -> this is taken as the first data point in the box ---------------------//
        var data = options.data[probe * second_sort_by];
        //Add box
        box_group = draw_box(box_group, graph, box_plot_vals, x_buffer, sample_type_name);
        //Add min line
        if (options.bar_graph == "yes") {
              if(box_width < 8){
                if (box_plot_vals[0] != box_plot_vals[2]){
                  //Add min line
                  box_group = add_line_to_box(options.stroke_width, x_buffer, box_width, box_plot_vals[0], box_group, scaleY, colour_wiskers, box_width_wiskers,"no", graph);
                  //Add max line
                  box_group = add_line_to_box(options.stroke_width, x_buffer,box_width,
                      box_plot_vals[2], box_group, scaleY, colour_wiskers, box_width_wiskers,
                      "no",graph);
                }
              }
              else {
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
                    box_plot_vals[1], box_group, scaleY, colour_box, box_width_wiskers,"yes", graph);

            //Add outside lines
            box_group = add_vertical_line_to_box(options.stroke_width, x_buffer, 0,
                box_plot_vals[1], box_group, scaleY, colour_box, graph);
            box_group = add_vertical_line_to_box(options.stroke_width, x_buffer
                + box_width, 0, box_plot_vals[1], box_group, scaleY, colour_box, graph);
        } else {
          if(box_width < 8){
            //Add max line
             box_group = add_line_to_box(options.stroke_width, x_buffer, box_width,
                 box_plot_vals[0], box_group, scaleY, colour_wiskers, box_width_wiskers,"no", graph);
             //Add max line
             box_group = add_line_to_box(options.stroke_width, x_buffer, box_width,
                 box_plot_vals[4], box_group, scaleY, colour_wiskers, box_width_wiskers,"no", graph);
          }
          else {
            //Add max line
             box_group = add_line_to_box(options.stroke_width, x_buffer, box_width,
                 box_plot_vals[0], box_group, scaleY, colour_wiskers, box_width_wiskers,"yes", graph);
             //Add median line
             box_group = add_line_to_box(options.stroke_width, x_buffer
                 , box_width, box_plot_vals[2], box_group, scaleY, colour_median,
                 (box_width/2.0)*median_percent,"yes", graph);
             //Add max line
             box_group = add_line_to_box(options.stroke_width, x_buffer, box_width,
                 box_plot_vals[4], box_group, scaleY, colour_wiskers, box_width_wiskers,"yes", graph);
          }
        }
        //Option to allow the user to test their values
        if (options.test == "yes") {
            test_values(second_sort_by_name + " " + probe_name + "|" + sample_type_name, box_plot_vals, graph, options);
        }
        if (options.draw_scatter_on_box == "yes" && jitter != "yes") {
            box_group = add_scatter_to_box(box_group, graph, samples, x_buffer + box_width/2, sample_type, "white", "black", radius);
        } else if (options.draw_scatter_on_box == "yes" && jitter == "yes") {
            box_group = draw_jitter_scatter(svg, graph, samples, x_buffer + (box_width/4), box_width, sample_type, "white", colour_wiskers, radius);
        }
        graph.svg = svg;
        return graph;
    }

    draw_jitter_scatter = function(svg, graph, samples, x, box_width, sample_type, colour, colour_stroke, radius) {
        scaleXBox = d3.scale.ordinal()
            .rangePoints([x, x + box_width]);
        options = graph.options;
        scaleXBox.domain(samples);
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
      // http://thiruvikramangovindarajan.blogspot.com.au/2014/10/calculate-quartile-q1-q3-and-median-q2.html
        values.sort(function(a, b) {return a-b});
        min_max_vals = return_min_max_vals(values);
        var median = get_median_value(values,0.50);
        max_quartile = [];
        min_quartile = [];
        min_quartile = (values.length % 2 == 0) ? values.slice(0, (values.length / 2) + 1) : values.slice(0, Math.floor(values.length / 2) + 1);
        max_quartile = (values.length % 2 == 0) ? values.slice( (values.length/2) - 1, values.length) : values.slice(Math.ceil(values.length / 2) - 1, values.length);
        min_quartile_median = get_median_value(values, 0.25);
        max_quartile_median = get_median_value(values, 0.75);
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
	get_median_value = function(values, percent) {
    // count = values.length;
    // median = (count % 2 == 0) ? (values[(values.length/2) - 1] + values[(values.length / 2)]) / 2:values[Math.floor(values.length / 2)];
    k = (values.length - 1) * percent;
    f = Math.floor(k);
    c = Math.ceil(k);
    if( f == c) {
      return values[k]
    }
    else {
      d0 = values[f] * ( c-k);
      d1 = values[c] * (k-f);
      return d0+d1;
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


 /** --------------------------- ADDED to make modular ----------------------------- */

    /**
     * gets a particular type -> this is used to mae the code more modular
     * Allows us to have probes as main type and samples for others
     */
    get_type = function (data_point) {
        return data_point.probe;
    }


    /*  Setting up the graph including y and x axes */
    setup_graph = function(graph){
        // setup all the graph elements
	    graph.graph_type = "Box Plot";
        options = graph.options;
        var label_padding = options.x_axis_label_padding;
        temp_val = 0;
        diff_val = 0;
        padding_val = 0;
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
        graph =  setup_watermark(graph);
        if (options.display.legend  === "yes") {
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

},{"./axis.js":1,"./box_bar_line.js":2,"./features.js":3,"./general.js":4}]},{},[]);
