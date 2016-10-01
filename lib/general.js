
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
                .attr("id", "title-"+ options.title)
                .attr("x", page_options.width / 2)//options.x_middle_title)
                .attr("y", 0 - (page_options.margin.top / height_divisor))
                .attr("text-anchor", "middle")
                .text(options.title).attr("class", options.title_class)
                .style("font-family", options.font_style)
                .style("font-size", options.title_text_size)
                .style("fill", "black")
                .attr("class", options.title_class);

        //Adds the subtitles to the graph
        for (i = 0; i < options.subtitles.length; i++) {
            svg.append("text")
                    .attr("id", "subtitle-"+ options.subtitles[i])
                    .attr("x", page_options.width / 2)//ptions.x_middle_title)
                    .attr("y", function () {
                        num = page_options.margin.top / height_divisor - (parseInt(options.text_size, 10) * (i + 1));
                        if (num <= 0) {
                            count++;
                        }
                        return 0 - num;
                    })
                    .attr("text-anchor", "middle")
                    // Adds the class for the specific subtitle as specified
                    .text(options.subtitles[i]).attr("class", options.title_class + " subtitle" + i)
                    .style("font-family", "Arial")
                    .style("font-size", options.text_size)
                    .style("fill", "black")
                    .attr("class", options.title_class);
        }

        max_width_of_text = 800;
        suggested_width_of_text = options.width * 0.7;
        if (max_width_of_text < suggested_width_of_text) {
            width_of_title = max_width_of_text;
        } else {
            width_of_title = suggested_width_of_text;
        }
       // svg.selectAll("." + options.title_class)
       //         .call(d3_wrap, width_of_title);

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
                .attr("y", -page_options.width - page_options.margin_left)// just out of the graphs edge
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
            svg.append("line") // append an object line
                    .attr("class", "lines")
                    .attr("data-legend", function (d) {
                        return name;
                    })
                    .attr("id", "horizontal-line-"+ name)
                    .attr("x1", 0)
                    .attr("x2", width)
                    .attr("y1", scaleY(y_value))
                    .attr("y2", scaleY(y_value))
                    .attr("shape-rendering", "crispEdges")
                    .attr("stroke-width", options.line_stroke_width)
                    .attr("opacity", "0.6")
                    .style("stroke", colour);

            svg.append("text")
                    .attr("id", "horizontal-line-text-"+ name)
                    .attr("x", margin_y_value + (name.length * 3) + 15)
                    .attr("y", scaleY(y_value) - 10)
                    .text(name)
                    .attr("text-anchor", "middle")
                    .style("font-family", options.font_style)
                    .style("font-size", font_size)
                    .style("fill", colour)
                    .attr("class", options.title_class);
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
                .text(function (probeInfo) {
		   if (graph.graph_type !== "Scatter Plot") {
			return probeInfo;
		    }
                    return probeInfo[0];
                });

        graph.svg = svg;
        return graph;
    };


