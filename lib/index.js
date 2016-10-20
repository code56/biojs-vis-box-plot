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
