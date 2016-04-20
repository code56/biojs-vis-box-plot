require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"biojsboxplot":[function(require,module,exports){
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
var biojsboxplot;

module.exports = biojsboxplot = function(init_options)
{

    /* this is just to define the options as defaults: added numberFormat*/
    this.default_options = function(){

        var options = {
            target: "#graph",
            unique_id: "Sample_ID",
            margin:{top: 80, right: 0, bottom: 30, left: 0},
            height: 1500,
            width: 1060,
            x_axis_title: "Samples",
            y_axis_title: "Log2 Expression"
        }
        return options;
        
    } // end this.defaultOptions

    // Derived from http://bl.ocks.org/mbostock/7555321
    this.d3_wrap = function (text, width) {
        text.each(function() {
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
            if (isNaN(dy)){
                dy =0;
            } else {
                dy = dy;
            }
            tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
        
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                new_dy =++lineNumber * lineHeight + dy; // added this in as well
                tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", new_dy+ "em").text(word).attr('text-anchor','middle');
            }
        }
      });
    } // end d3_wrap


    // setup margins in a different function (sets up the page options (i.e. margins height etc)
    this.setup_margins = function(graph){
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
        page_options.full_height = options.height  + options.margin.top + options.margin.bottom;

        graph.page_options = page_options;
        return graph;

    } ///end setup margins
     

    //Setting up the max and minimum values for the graph 
    //we are trying to take into account not just the data but the lines as well
    // and we are taking into account that we want to be able to see 0 too
    this.return_y_min_max_values = function(graph){
        options = graph.options;
        max_val = 1;
        min_val = 0;

        lwr_min_max_values_from_data = d3.extent(options.data, 
            function(d) {   // this will go through each row of the options.data
                            // and provide a way to access the values 
                // you want to check that we use the highest and lowest values of the lines and at least stop at 0
                lwr = (d.Expression_Value - d.Standard_Deviation);
                temp = lwr; // this will get the y_column (usually prediction) from the row
                // have to take into account lwr and upr
                if(lwr < min_val){
                    min_val = lwr;
                }
                return temp; 
            }
        );

        // do the same for upr
        upr_min_max_values_from_data = d3.extent(options.data, 
            function(d) {
                upr = (d.Standard_Deviation + d.Expression_Value);
                temp = upr;
                if(upr > max_val){
                    max_val = upr;
                }
                return temp; 
            }
        );


        min = lwr_min_max_values_from_data[0];

        max = upr_min_max_values_from_data[1];

        // set minimum to 0 if the minimum is a positive number
        // this means that the minimum number is at least 0
        // a negative number will be the only way to drop below 0
        if (min > 0) { min = 0; }

        // similarly, if the max number from the data is -ve
        // at least show 0
        if (max < 1) { max = 1; } 
        for (key in options.horizontal_lines){
            value = options.horizontal_lines[key];
            if (value > max){ max = value }
            if (value < min){ min = value }
        }
        graph.max_val = max_val;
        graph.min_val = min_val; 
        graph.force_domain =[min,max]; 
        return graph;
    }

    this.setup_y_axis = function(graph){
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

        // setup the yaxis. this is later called when appending as a group .append("g")
        // Note that it uses the y to work out what it should output
       //trying to have the grid lines as an option 
      var yAxis = d3.svg.axis() 
                    .scale(scaleY)
                    .orient("left")
                    //sets the number of points to increment by 1 whole number. To change see options.increment
                    .ticks(options.increment)
                    .innerTickSize(-page_options.width)
                    .outerTickSize(0);  

        y_column = options.y_column;
        // d3.extent returns the max and min values of the array using natural order
        // we are trying to take into account not just the data but the lines as well
        graph = this.return_y_min_max_values(graph);
        scaleY.domain(graph.force_domain).nice();
        y_axis_legend_y = (graph.full_height - options.margin.top - options.margin.bottom)/2;
        
        /*Adding the title to the Y-axis: stored in options.y_axis_title: information from
        ** http://bl.ocks.org/dougdowson/8a43c7a7e5407e47afed*/         
        // only display the title if the user has indicated they would like the title displayed
        if (options.display.y_axis_title == "yes") {
            svg.append("text")
              .text(options.y_axis_title)
              .attr("text-anchor", "middle")
              .style("font-family", options.font_style)
              .style("font-size",  options.y_label_text_size)
              .attr("transform", "rotate(-90)")
              .style("text-anchor", "middle")
              .attr("stroke", "black")
              .attr("x", -y_axis_legend_y)
              .attr("y", -options.y_label_x_val); //specifies how far away it is from the axis
        }
        // Only display the grid lines accross the page if the user has specified they want a grid
        if (options.display.horizontal_grid_lines == "yes") {
            svg.append("g")
                .attr("class", "grid") //creates the horizontal lines accross the page
                .attr("opacity", options.grid_opacity)
                .attr("stroke", options.grid_colour)
		.attr("stroke-width",options.background_stroke_width)
		.call(yAxis); //implementing the y axis as an axis
        } else {
            svg.append("g")
                .call(yAxis); //implementing the y axis as an axis
        }   
        graph.svg = svg;
        graph.scaleY = scaleY;
        graph.yAxis = yAxis;
        return graph;
    } // end this.setup_y_axis

    /*
    This includes:
    - returning vertical_lines which is the basis for calculating the vertical lines that
    separate the sample types.
    - returning the sample_id_list that allows the scaleX.domain(sample_id_list) call to 
    create the values for the x values of the samples for ordinal values 
    - also want to store the starting sample_id of a sample type as well so that we can 
    calculate the middle of the sample types to display just the sample type
    */
    this.setup_data_for_x_axis = function(graph){
          //Set up any lists needed for setting up x and y axis
        options = graph.options;
        nested_values = graph.nested_values;
        sort_by_diseases = false;
        if (options.include_disease_state_x_axis == "yes") {
            sort_by_diseases = true;
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
            if (sort_by_diseases == true) { //There will be a second key which is the disease state
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
            }
            temp = {};
            //Sort by disease state as well if we are having that on the x axis
            temp['probe'] = key;
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
    this.sort_x_by_probe_and_disease_state = function(graph) {
        options = graph.options;
        //Check if there is an order given for the disease states, if none given order by dataset
        if (options.disease_state_order != 'none') {
            disease_order = options.disease_state_order.split(',');
            sample_type_order = options.sample_type_order.split(',');
            nested_values = d3.nest()
                .key(function(d) {                      
                    return d.Probe;
                })
                .sortKeys(function(a, b) {
                    return probe_order.indexOf(a) - probe_order.indexOf(b);
                })
                .key(function(d) { 
                    return d.Disease_State;
                })
                .sortKeys(function(a,b){return disease_state_order.indexOf(a) - disease_state_order.indexOf(b);})
                .key(function(d) {
                    return d.Sample_Type;
                })
                .sortKeys(function(a,b){return sample_type_order.indexOf(a) - sample_type_order.indexOf(b);})
                .entries(options.data);
        } else {
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
               .entries(options.data);
        }
        graph.nested_values = nested_values;
        return graph;
    }

    /* Sorts the probes on a given order or default is by the dataset */
    this.sort_x_by_probe = function(graph) {
        options = graph.options;
        //Check no probe order has been given, if none given order by dataset
        if (options.probe_order != "none") {
            probe_order = options.probe_order.split(',');
            sample_type_order = options.sample_type_order.split(',');            
            nested_values = d3.nest()
                .key(function(d) {
                    return d.Probe;
                })
                .sortKeys(function(a, b) {
                    return probe_order.indexOf(a) - probe_order.indexOf(b);
                })
                .key(function(d) {
                    return d.Sample_Type;
                })
                .sortKeys(function(a,b){return sample_type_order.indexOf(a) - sample_type_order.indexOf(b);})
                .entries(options.data);
        } else {
            nested_values = d3.nest()
                .key(function(d) {
                    return d.Probe;
                })
                .key(function(d) {
                    return d.Sample_Type;
                })
               .entries(options.data);

        }
        graph.nested_values = nested_values;
        return graph;
    }


    this.setup_x_axis = function (graph){
        page_options = graph.page_options;
        svg = graph.svg;
        options = graph.options;
        probe_list = graph.probe_list;

        /* http://bost.ocks.org/mike/bar/3/
        - Probes along the bottom we use ordinal instead of linear
        - See here for more: https://github.com/mbostock/d3/wiki/Ordinal-Scales
        - rangePoints gives greatest accuracy (first to the last point)
        - Padding is set as a factor of the interval size (i.e. outer padidng = 1/2 
            dist between two samples) 1 = 1/2 interval distance on the outside
            2 = 1 interval dist on the outside. Have set the default to 2 */
        var scaleX = d3.scale.linear()
            .range([0, page_options.width]);
        /*
        http://stackoverflow.com/questions/15713955/d3-ordinal-x-axis-change-label-order-and-shift-data-position
        The order of values for ordinal scales is the order in which you give them to .domain(). 
        That is, simply pass the order you want to .domain() and it should just work. */
        scaleX.domain(probe_list);
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
            .attr("transform", function(d) {
                return "rotate(-65)" // this is rotating the text 
                })
        .append("text") // main x axis title
            .attr("class", "label")
            .attr("x", page_options.width)
            .attr("y", +24)
            .style("text-anchor", "end")
            .text(options.x_axis_title);

        graph.probe_list = probe_list;
        graph.svg = svg;
        graph.scaleX = scaleX;
        return graph ;
    } //end this.setup_x_axis


     /* Calculates interval between the probes
     * also used for calculating the distance bwteen the disease states 
     */
    this.calculate_x_value_of_probes = function(graph) {
        options = graph.options;
        width = options.width;
        scaleX = graph.scaleX;
        probe_count = graph.probe_count;
        section_size = (width/probe_count);
        graph.size_of_disease_state_collumn = section_size;
        graph.size_of_probe_collumn = section_size;
        return graph;
    } // calculate_x_value_of_probes

    /* Calculates interval between the probes
     * also used for calculating the distance bwteen the disease states 
     */
    this.calculate_x_value_of_disease_state = function(graph) {
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
    this.setup_disease_state_labels = function (graph) {
        svg = graph.svg;
        scaleX= graph.scaleX;
        sample_id_list = graph.sample_id_list;
        nested_values = graph.nested_values;
        page_options = graph.page_options;
        options = graph.options;
        //Below are used for calculating the positioning of the labels
        size_of_disease_state_collumn = graph.size_of_disease_state_collumn;
        full_size_of_a_probe_collumn = graph.size_of_probe_collumn;
        count = 0;
        if (vertical_lines.length == 1) {
         
        }
        for (probe in vertical_lines) {
            padding = full_size_of_a_probe_collumn * parseInt(probe);
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
                            if (vertical_lines.length == 1) {
                                x = padding + (size_of_disease_state_collumn * (parseInt(disease) + 1)) - (size_of_disease_state_collumn/2);
                            }
                            return x;
                        })
                     // when rotating the text and the size
                    .style("font-family", options.font_style)
                    .style("font-size", options.text_size)
                    .attr("transform", function() {
                            // actual x value if there was no rotation
                            x_value = padding + (size_of_disease_state_collumn * (parseInt(disease) + 1));
                            // actual y value if there was no rotation
                            if (vertical_lines.length == 1) {
                                x_value = padding + (size_of_disease_state_collumn * (parseInt(disease) + 1)) - (size_of_disease_state_collumn/2);
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

    this.setup_box_plot = function(graph) {
        options = graph.options;
        nested_values = graph.nested_values;
        disease_state = "";
        sample_type_list = [];
        id = 1; //  NOTE CHANGE THISLATER 
         for (probe in nested_values) {
            row = nested_values[probe];
            values = row.values;
            probe_name = row.key;
            if (sort_by_diseases == true) { //There will be a second key which is the disease stat
                for (disease_states in values) {
                    row = values[disease_states];
                    disease_values = row.values;
                    disease_state = row.key;
                    number_sample_types = disease_values.length;
                    //These are the expression values for a specific sample grouped by the probe
                    // then the disease type so now we need to append all the expression values for this
                    // group then calculate the box plot and draw the values
                    for (sample_types in disease_values) {
                        sample_row = disease_values[sample_types];
                        sample_values = sample_row.values;
                        sample_type = sample_row.key;
                        if($.inArray(sample_type, sample_type_list) == -1) {
                            sample_type_list.push(sample_type);
                        }
                        expression_values = [];
                        //At the level of the xcel file now
                        for (x in sample_values) {
                            expression_values.push(sample_values[x].Expression_Value);
                        }
                        //Now have all the expression values for a specific sample type so we create box
                        //plot and calculate the values
                        box_plot_vals = this.calculate_box_plot_vals(expression_values);
                        // Actually draw the box plot on the graph
                        graph = this.draw_box_plot(graph, box_plot_vals, parseInt(probe), parseInt(disease_states), parseInt(sample_types), number_sample_types, probe_name, sample_type, disease_state);
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
                        if ($.inArray(sample_values[x].Disease_State, disease_states) == -1) {
                            disease_states.push(sample_values[x].Disease_State);   
                        }
                    }
                    for (disease in disease_states) {
                        disease_state_names = disease_states[disease] + " " + disease_state_names;
                    }
                    //Now have all the expression values for a specific sample type so we create box
                    //plot and calculate the values
                    box_plot_vals = this.calculate_box_plot_vals(expression_values);
                    // Actually draw the box plot on the graph
                    graph = this.draw_box_plot(graph, box_plot_vals, parseInt(probe), 0, parseInt(sample_types), number_sample_types, probe_name, sample_type, disease_state_names);
                }   
            }
        }
        graph.sample_type_list = sample_type_list;
        return graph;
    }

    this.draw_box_plot = function(graph, box_plot_vals, probe, disease_state, sample_type, number_sample_types, probe_name, sample_type_name, disease_state_name) {
        svg = graph.svg;
        scaleY = graph.scaleY;
        scaleX = graph.scaleX;
        options = graph.options;
        if (options.include_disease_state_x_axis == "yes") {
            tooltip = options.tooltip;
        } else {
            tooltip = options.all_disease_tooltip;  
        }
        svg.call(tooltip);
        box_width = options.box_width;
        box_width_wiskers = (box_width - options.box_width_wiskers)/2; //assumes box width > box_width wiskers
        colour_wiskers = options.colour[sample_type];
        colour_median = "white";
        id = probe_name + "-" + sample_type_name + "-" + disease_state_name;
        colour_box = options.colour[sample_type]; 
        stroke_width = options.stroke_width;
        probe_size = graph.size_of_probe_collumn;
        disease_state_size = graph.size_of_disease_state_collumn;
        sample_type_size = disease_state_size/number_sample_types;
        x_buffer = (probe_size * probe) + (disease_state_size * disease_state) + (sample_type_size * (sample_type)) + (sample_type_size * 3 / 8);
        console.log(probe, disease_state, sample_type, number_sample_types, disease_state_size); 
        //Add vertical lline
        svg = this.add_vertical_line_to_box(options.stroke_width, x_buffer + box_width*0.5, box_plot_vals[0], box_plot_vals[4], svg, scaleY, colour_wiskers);
        //Add box
        svg.append("rect")
            .data(options.data)
            .attr('width', box_width)
            .attr('x', x_buffer)
            .attr('id', id)
            .attr('y', function(d) {
                   return scaleY(box_plot_vals[3]);
            })
            .attr('height', function(d) {
                temp = scaleY(box_plot_vals[1]) - scaleY(box_plot_vals[3]);
                return temp;
                })
            .attr("stroke-width", 0)
            .attr("fill", colour_box)
            .on("mouseover", tooltip.show) 
            .on("mouseout", tooltip.hide);
                //Add min line
        svg = this.add_line_to_box(options.stroke_width, x_buffer, box_width, box_plot_vals[0], svg, scaleY, colour_wiskers, box_width_wiskers);
        //Add median line
        svg = this.add_line_to_box(options.stroke_width, x_buffer + box_width*.25, box_width*0.5, box_plot_vals[2], svg, scaleY, colour_median, 0);
        //Add max line
        svg = this.add_line_to_box(options.stroke_width, x_buffer, box_width, box_plot_vals[4], svg, scaleY, colour_wiskers, box_width_wiskers);
        graph.svg = svg;
        return graph;
    }
    
    this.add_line_to_box = function(stroke_width, x_buffer, box_width, y_value, svg, scaleY, colour, box_width_wiskers) {
        svg.append("line")
                .attr("x1", (x_buffer - box_width/2) + box_width_wiskers)
                .attr("x2", (x_buffer + box_width* 1.5) - box_width_wiskers)
                .attr("y1", scaleY(y_value))
                .attr("y2", scaleY(y_value))
                .attr("shape-rendering","crispEdges")
                .attr("stroke-width",stroke_width)
                .attr("stroke", colour); 
        return svg;
    }
    
    this.add_vertical_line_to_box = function(stroke_width, x_position, y_lower, y_upper, svg, scaleY, colour_wiskers) {
        svg.append("line")
            .attr("x1", x_position)
            .attr("x2", x_position)
            .attr("y1", scaleY(y_lower))
            .attr("y2", scaleY(y_upper))
            .attr("shape-rendering","crispEdges")
            .attr("stroke-width",stroke_width)
            .attr("stroke", colour_wiskers);
        return svg;
}


    /* Takes the array of samples for a specific sample type
     * already ordered */
    this.calculate_box_plot_vals = function(values) {
        min_max_vals = this.return_min_max_vals(values);
        var median = this.get_median_value(values);
        max_quartile = [];
        min_quartile = [];
        for(i in values) {
            if (values[i] > median) {
                max_quartile.push(values[i]);
            }
            if (values[i] < median) {
                min_quartile.push(values[i]);
            }
        }
        min_quartile_median = this.get_median_value(min_quartile);
        max_quartile_median = this.get_median_value(max_quartile);
        min = min_max_vals[0];
        max = min_max_vals[1];
        return [min, min_quartile_median, median, max_quartile_median, max];
    }

    //Returns the max and minimum values from the daa set
    this.return_min_max_vals = function(values) {
        max_val = 0;
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
	this.get_median_value = function(values) {
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
	this.get_box_plot_values = function(graph) {
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
    this.setup_probe_labels = function (graph) {
        svg = graph.svg;
        scaleX= graph.scaleX;
        sample_id_list = graph.sample_id_list;
        vertical_lines = graph.vertical_lines;
        page_options = graph.page_options;
        options = graph.options;
        //Below are used for calculating the positioning of the labels
        size_of_probe_collumn = graph.size_of_probe_collumn;
        if (vertical_lines.length == 1) {
            size_of_probe_collumn = 0.66*size_of_probe_collumn;
        }
	    svg.selectAll(".probe_text")
            .data(vertical_lines).enter()
            .append("text") // when rotating the text and the size
            .text(
                function(d){
                    // If the user does't want to have labels on the x axis we don't append the probe
                        return d.probe;
                }
            )
            .attr("class", "x_axis_diagonal_labels")
            .style("text-anchor", "end")
    	    // Even though we are rotating the text and using the cx and the cy, we need to 
            // specify the original y and x  
            .attr("y", page_options.height + options.x_axis_label_padding)
            .attr("x",
                function(d, i){
                    x_value = size_of_probe_collumn * (i + 1);
                    if (options.include_disease_state_x_axis != "yes") {
                        x_value = x_value - (0.5 * size_of_probe_collumn);
                    }
                    return x_value;
                }
            ) // when rotating the text and the size
            .style("font-family", options.font_style)
            .style("font-size", options.text_size)
            .attr("transform",
                // combination of this: http://stackoverflow.com/questions/11252753/rotate-x-axis-text-in-d3
                // and this: http://www.w3.org/TR/SVG/coords.html#TransformAttribute
                // basically, you just have to specify the angle of the rotation and you have
                // additional cx and cy points that you can use as the origin.
                // therefore you make cx and cy your actual points on the graph as if it was 0 angle change
                // you still need to make the y and x set as above
                function(d, i) {
                    // actual x value if there was no rotation
                    x_value = size_of_probe_collumn * (i + 1);
                    // actual y value if there was no rotation
                    if (options.include_disease_state_x_axis == "yes") {
                        y_value = page_options.height + options.size_of_disease_state_labels;
                    } else {
                        x_value = x_value - (0.5 * size_of_probe_collumn);
                        y_value = page_options.height + 10;
                    }   
                    return "rotate("+options.x_axis_text_angle+","+x_value+","+y_value+")";
                }
             )
        graph.svg = svg;
        return graph;   
    }

    /* sets up the vertical lines between the sample points */
    this.setup_vertical_lines = function(graph){
        svg = graph.svg;
        vertical_lines = graph.vertical_lines;
        sample_id_list = graph.sample_id_list;
        page_options = graph.page_options;
        size_of_probe_collumn = graph.size_of_probe_collumn;
        for (i = 0; i < options.probe_count; i++) {
            svg.append("line")
                .attr("x1", 
                    function(d){
                       avg = size_of_probe_collumn * (i + 1); //returns the position for the line
                       return avg; 
                    }
                ) 
                .attr("x2", 
                    function(d){
                       avg = size_of_probe_collumn * (i + 1); //returns the position for the line
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
    this.setup_horizontal_lines = function(graph){
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
    
    graph.svg = svg;
        return graph; 
    } // end setup_horizontal_lines

    this.preprocess_lines = function(graph){
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
    this.setup_hover_bars = function(graph) {
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
        calculate_x_value_of_vertical_lines = this.calculate_x_value_of_vertical_lines;
        //once and first are place holder values to check if it is the first element
        //as these need to have a different amount of padding
        sample_id_count = 0;
        first = 0;
        once = 0;
        //the tooltip for hovering over the bars which displays the sample type
        var tooltip_sample;

        x_values_for_bars = new Array();
        //This is required so taht the bars stop midway between the two sample types (i.e. on the line)
        padding = (this.calculate_difference_between_samples(sample_id_list,scaleX))/2;
        
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
    this.setup_svg = function (graph){
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
            .call(this.d3_wrap,width_of_title); 

        graph.svg = svg;
        return graph;
    } // setup_svg

    /*  Setting up the watermark */
    this.setup_watermark = function(graph){
        svg = graph.svg;
        options = graph.options;

        svg.append("image")
            .attr("xlink:href",options.watermark)
            .attr("x", page_options.height/2 - 100)
            .attr("y", -page_options.width - page_options.margin_left)// just out of the graphs edge
            .attr("transform", "rotate(+90)")
            .attr("width", 200)
            .attr("height", 100);

        graph.svg = svg;
        return graph;
    } // setup_watermark


    /* http://bl.ocks.org/ZJONSSON/3918369 and http://zeroviscosity.com/d3-js-step-by-step/step-1-a-basic-pie-chart
	Interactive legend which allows you to display and not display the legend*/
    this.setup_D3_legend = function(graph) {
	svg = graph.svg;	
	var legendSpacing = 4;
	options = graph.options;
   	var legendRectSize = options.legend_rect_size;
	page_options = graph.page_options;
	
	//Add a legend title
        svg.append("text")
            .attr("x", page_options.width + options.legend_padding)//options.x_middle_title)             
            .attr("y", 0 - (page_options.margin.top /height_divisor) )
            .attr("text-anchor", "middle")
            .text("Legend").attr("class",options.title_class)
            .style("font-family", options.font_style)
            .style("font-size", options.title_text_size)
            .style("fill", "black")
            .attr("class",options.title_class)
	    .on('mouseover', function(d) {
			var leg = document.getElementsByClassName("legendClass");
			for (i = 0; i < leg.length; i++) {
				if (leg[i].style.opacity != 0) {
					d3.select(leg[i]).style("opacity", 0);
				} else {
					d3.select(leg[i]).style("opacity", 1);
				}
			}
		});
	

	//Add the legend to the svg element
	var legend = svg.selectAll('.legend')
		.data(graph.sample_type_list) //options.probs contains the name and colour of the probes
		.enter()
		.append('g')
		.attr('transform', function(d, i) {
			var height = legendRectSize + legendSpacing;
			// Probe count tells us how many samples we have
			var offset = height/2 + options.probe_count / 2; //the 20 is to allow for the text above 
			var horizontal = -2 * legendRectSize + page_options.width + options.legend_padding;
			var vertical = i * height - offset;
			return 'translate(' + horizontal + ','+ vertical + ')';
		});

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
			return options.colour[i]; //First element stored in the probe array is colour
		})
		.style('stroke',  function(d, i) {
                        return options.colour[i]; //First element stored in the probe array is colour
                })
		.style('opacity', 1);/*
		.on('mouseover', function() {
                        var sample_type = (this.id);
                        //Gets the elements by probe and assigns colour to the line (this is started off hidden)
                        var probe_group = document.getElementsByClassName("line-probe-" + probe.replace(/\ |(|)/g,''));
                        for (i = 0; i < probe_group.length; i++) {
                            if(probe_group[i].style.opacity != 0) {
                                d3.select(probe_group[i]).style("opacity", 0);
                            } else {
                                d3.select(probe_group[i]).style("opacity", 1);
                            }
                        }
                    }); //end on_click button
*/
	//Add legend text
	legend.append('text')
		.attr('class', "legendClass")
		.attr('x', legendRectSize + legendSpacing)
		.attr('y', legendRectSize - legendSpacing)
	        .style("font-family", options.font_style)
            	.style("font-size", options.text_size)
		.style('opacity', 1)
		.text(function(d) { return d; });

	graph.svg = svg;
	return graph;
    }


    /*  Setting up the graph including y and x axes */ 
    this.setup_graph = function(graph){
        // setup all the graph elements
        options = graph.options;
        graph = this.setup_margins(graph);
        //graph = this.setup_size_options(graph);
        graph = this.setup_svg(graph);
        // Check if it is also being sorted by the disease state on the x axis
        if (options.include_disease_state_x_axis == "yes") {
            graph = this.sort_x_by_probe_and_disease_state(graph);
        } else {
            graph = this.sort_x_by_probe(graph);
        }
        graph = this.setup_data_for_x_axis(graph);
        graph = this.setup_x_axis(graph);
        graph = this.calculate_x_value_of_probes(graph);
     	if (options.include_disease_state_x_axis == "yes") {
            graph = this.calculate_x_value_of_disease_state(graph);
            graph = this.setup_disease_state_labels(graph);
        }
        graph = this.setup_probe_labels(graph);
        graph = this.setup_y_axis(graph);
        graph = this.setup_box_plot(graph);
        graph = this.setup_D3_legend(graph);
        graph = this.setup_vertical_lines(graph);
	 // Only display the vertical lines if the user chooses so
        if (options.display.vertical_lines == "yes") {
            graph = this.setup_vertical_lines(graph);
        }
        // Display the legend if the user has specified they want the legend
      //  if (options.display.legend == "yes") {
       //     graph = this.setup_legend(graph);
       // }
        //if (options.display.error_bars == "yes") {
        //    graph = this.setup_error_bars(graph);
       // }
      //  graph = this.setup_box_line(graph);
        if (options.display.horizontal_lines == "yes") {
            graph = this.setup_horizontal_lines(graph);
        }
        //graph = this.setup_watermark(graph);
    //    if (options.display.hoverbars == "yes") {
    //        graph = this.setup_hover_bars(graph);
   //     }

        return graph;

    }  // end setup_graph  

    // run this right at the start of the initialisation of the class
    this.init = function(init_options){
        var options = this.default_options();
        options = init_options;
        page_options = {}; // was new Object() but jshint wanted me to change this
        //size_options = {};
        var graph = {}; // this is a new object
        graph.options = options;
        graph = this.preprocess_lines(graph);
        graph = this.setup_graph(graph);
        var target = $(options.target);
        target.addClass('box_plot');

        svg = graph.svg;
    } 

    // constructor to run right at the start
    this.init(init_options);
}

},{}]},{},[]);
