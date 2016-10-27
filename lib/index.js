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

            svg = add_vertical_line_to_box(options.stroke_width, x_buffer
                    + box_width*0.5, box_plot_vals[0], box_plot_vals[2], svg, scaleY,
                    colour_wiskers, graph);
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
            svg = add_vertical_line_to_box(options.stroke_width, x_buffer
                + box_width*0.5, box_plot_vals[0], box_plot_vals[2], svg, scaleY,
                colour_wiskers, graph);
        } else {
            opacity = 1;
            x_buffer += (sample_type_size * (sample_type)) + (sample_type_size * 3 / 8);
            svg = add_vertical_line_to_box(options.stroke_width, x_buffer
                + box_width*0.5, box_plot_vals[0], box_plot_vals[4], svg, scaleY,
                colour_wiskers, graph);
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
                svg = add_line_to_box(options.stroke_width, x_buffer
                    , box_width, box_plot_vals[0], svg, scaleY, colour_wiskers, box_width_wiskers,
                    "no", graph);
                //Add max line
                svg = add_line_to_box(options.stroke_width, x_buffer_width, 
                    box_plot_vals[2], svg, scaleY, colour_wiskers, box_width_wiskers,
                     graph);
              }
              else {
                //Add min line
                svg = add_line_to_box(options.stroke_width, x_buffer
                    , box_width, box_plot_vals[0], svg, scaleY, colour_wiskers, box_width_wiskers,
                    "yes", graph);
                //Add max line
                svg = add_line_to_box(options.stroke_width, x_buffer
                    , box_width, box_plot_vals[2], svg, scaleY, colour_wiskers, box_width_wiskers,
                    "yes", graph);
              }
              //Add median lines
              svg = add_line_to_box(options.stroke_width, x_buffer, box_width,
                    box_plot_vals[1], svg, scaleY, colour_box, box_width_wiskers,"yes", graph);

            //Add outside lines
            svg = add_vertical_line_to_box(options.stroke_width, x_buffer, 0,
                box_plot_vals[1], svg, scaleY, colour_box, graph);
            svg = add_vertical_line_to_box(options.stroke_width, x_buffer
                + box_width, 0, box_plot_vals[1], svg, scaleY, colour_box, graph);
        } else {
           //Add max line
            svg = add_line_to_box(options.stroke_width, x_buffer, box_width,
                box_plot_vals[0], svg, scaleY, colour_wiskers, box_width_wiskers,"yes", graph);
            //Add median line
            svg = add_line_to_box(options.stroke_width, x_buffer
                + box_width*.25, box_width*0.5, box_plot_vals[2], svg, scaleY, colour_median,
                0,"yes", graph);
            //Add max line
            svg = add_line_to_box(options.stroke_width, x_buffer, box_width,
                box_plot_vals[4], svg, scaleY, colour_wiskers, box_width_wiskers,"yes", graph);
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
   

 /** --------------------------- ADDED to make modular ----------------------------- */

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
	graph.graph_type = "Box Plot";
        var label_padding = 80; // For if there are 2 sets of labels
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
     	if (options.sortByOption.split(",").length != 1) {
		graph.size_of_disease_state_collumn = calculate_x_value_of_state(graph, 			graph.disease_state_count);            
		
            graph = setup_disease_state_labels(graph);
        } else {
	    label_padding = 0;
	}
	graph = setup_x_axis_labels(graph, null, label_padding, ".probe_text", ".probe-");	
       // graph = setup_probe_labels(graph);
        graph = setup_y_axis(graph);
        graph = setup_box_plot(graph);
        graph =  setup_watermark(graph);
        graph = setup_D3_legend(graph, graph.sample_type_list);
        //graph = setup_vertical_lines(graph);

	    // Only display the vertical lines if the user chooses so
        if (options.display.vertical_lines == "yes") {
            graph = setup_vertical_lines(graph, graph.sample_id_list);
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
