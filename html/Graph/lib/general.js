
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
                var new_dy = ++lineNumber * lineHeight + dy; // added this in as well
                tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", new_dy + "em").text(word).attr('text-anchor', 'middle');
            }
        }
    });
}; // end d3_wrap


// setup margins in a different function (sets up the page options (i.e. margins height etc)
setup_margins = function (graph) {
    var options = graph.options;
    page_options = {};
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
        var width_to_support_many_samples = 0;
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
        if (options.num_sample_types * options.box_width > options.width) {
            // changes done by Isha
            //Here we are compensating for any overflow that may occur due to many samples
            options.box_width = (options.width / options.num_sample_types) / 4;
        } else {
            if ((options.num_sample_types * options.box_width) / (options.width / options.probe_order.length) > 1) {
                options.box_width = (options.width * 0.70 / options.probe_order.length) / options.num_sample_types;
            }
        }
    }
    page_options.width_to_support_many_samples = width_to_support_many_samples / 2;
    page_options.width = (width_to_support_many_samples * options.probe_count) + options.width;
    graph.page_options = page_options;
    /* End added */
    graph.page_options = page_options;
    return graph;

}; ///end setup margins


set_data_order = function (graph) {
    var options = graph.options;

    if (options.sample_type_order !== "none") {
        options.data.sort(function (a, b) {
            return options.sample_type_order.indexOf(a.Sample_Type) - options.sample_type_order.indexOf(b.Sample_Type);
        })
    }
    return graph;
}

/**
 * Used to make sure that it is in the same format as we recieve from the
 * tsv format*/
remove_spaces = function (name) {
    var newstring = name.replace(/\s+/g, '_')///[&\/\\#,+()$~%.'":*?<>{}\s+]/g,'');
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
    var options = graph.options;
    options["sortByOption"] = remove_spaces(options.sortByOption);
    var page_options = graph.page_options;
    // pull request
    if (graph.graph_type == "Scatter Plot") {
        var full_width = page_options.full_width;
    } else {
        var full_width = page_options.full_width;
    }
    var full_height = page_options.full_height;

    if (options.scaling_required == "yes") {
        var scaleX = 0.4;
        var scaleY = 0.4;
    }

    graph.full_width = full_width;
    graph.full_height = full_height;
    var background_stroke_width = options.background_stroke_width;
    var background_stroke_colour = options.background_stroke_colour;

    // setup the SVG. We do this inside the d3.tsv as we want to keep everything in the same place
    // and inside the d3.tsv we get the data ready to go (called options.data in here)
    if (options.scaling_required == "yes") {// clear out html
        $(options.target)
                .html('')
                .css('width', (full_width * scaleX / 1.05) + 'px')
                .css('height', (full_height * scaleY) + 'px');

        var idname = options.target.id;
        var tooltip_multiview = graph.options.tooltip_multiview;
        options.margin = {top: 80, left: 40, bottom: -100, right: -80};
        var top_padding = 50;
        var svg = d3.select(options.target).append("svg")
                .attr("width", full_width * scaleX / 1.05)
                .attr("height", full_height * scaleY)
                .attr("id", idname + "-svg")
                .attr("class", "graph-svg")
                .on('click', function () {
                    lastClickedGraph = idname;
                    open_modal('modalDiv', "open")
                })
                .append("g")
                .attr("id", idname + "-group")
                // this is just to move the picture down to the right margin length
                .attr("transform", "translate(" + options.margin.left + "," + (options.margin.top - top_padding) + ")" + " scale(" + scaleX + "," + scaleY + ")");
    } else {
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
                .attr("class", "graph-svg")
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
    var height_divisor = 1.5;
    var count = 0; // keeps track of the number of subtitles and if we
    // need to change the graph size to account for them
    var counter = 0;
    svg.append("text")
            .attr("id", "main_title")
            .attr("class", "graph-title main-title") //Ariane changed this from hurray
            .attr("x", page_options.width / 2)//options.x_middle_title)
            .attr("y", 0 - (page_options.margin.top / 1.25))
            .attr("text-anchor", "middle")
            .text(options.title)
            .style("font-family", options.font_style)
            .style("font-size", options.title_text_size)
            .style("fill", "black");

    //Adds the subtitles to the graph
    for (i = 0; i < options.subtitles.length; i++) {
        var subtitle = (options.subtitles[i].replace(/.{125}\S*\s+/g, "$&@").split(/\s+@/))
        for (j = 0; j < subtitle.length; j++) {
            counter++;
            svg.append("text")
                    .attr("id", "subtitle")
                    .attr("class", "graph-title")
                    .attr("x", page_options.width / 2)//ptions.x_middle_title)
                    .attr("y", function () {
                        num = page_options.margin.top / 1.25 - (parseInt(options.text_size, 10) * (i + 1));
                        if (num <= 0) {
                            count++;
                        }
                        return 0 - num;
                    })
                    .attr("text-anchor", "middle")
                    // Adds the class for the specific subtitle as specified
                    .text(subtitle[j])//.attr("class",options.title_class+" subtitle" + i)
                    .style("font-family", options.font_style)
                    .style("font-size", options.title_text_size)
                    .style("fill", "black") // changes done by Isha
                    .attr("transform", "translate(0," + (10 + (counter * 20)) + ")");
            // .attr("class",options.title_class);
        }

    }
    var max_width_of_text = 800;
    var suggested_width_of_text = options.width * 0.7;
    if (max_width_of_text < suggested_width_of_text) {
        var width_of_title = max_width_of_text;
    } else {
        var width_of_title = suggested_width_of_text;
    }
    svg.selectAll("." + options.title_class)
            .call(this.d3_wrap, width_of_title);
    graph.svg = svg;
    return graph;
}; // setup_svg



/*  Setting up the watermark */
setup_watermark = function (graph) {
    var svg = graph.svg;
    var page_options = graph.page_options;
    var options = graph.options;
    var watermark_width = 200;
    var watermark_height = 50;
    options.watermark_width = watermark_height;
    svg.append("image")
            .attr("xlink:href", options.watermark)
            .attr("id", "s4m-logo")
            .attr("x", page_options.height / 2 - 100)
            .attr("y", -page_options.width - page_options.margin.left / 2)// just out of the graphs edge
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
    var svg = graph.svg;
    var scaleX = graph.scaleX;
    var scaleY = graph.scaleY;
    var options = graph.options;
    var width = page_options.width;
    var lines = options.lines;
    var horizontal_lines = options.horizontal_lines;
    var font_size = options.text_size;
    var margin_y_value = 20;
    var colour_random = d3.scale.category20();
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
                        var x1 = margin_y_value + (name.length * 3) + 15;
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
    var horizontal_lines = graph.options.horizontal_lines;
    var lines = Array();
    for (var key in horizontal_lines) {
        var value = horizontal_lines[key];
        var data_line = {'value': value, 'name': key};
        lines.push(data_line);
    }

    graph.options.lines = lines;

    return graph;
};   // end preprocess_lines


/* Similary with the code above this is used to calculate the interval between
 the scatter points, however this is used in the hover bars (slightly
 different as it uses the whole difference not 1/2 as with above */
calculate_difference_between_samples = function (sample_id_list, scaleX) {

    var prev_sample_id = sample_id_list[0];
    var step_sample_id = sample_id_list[1];
    var value = scaleX(step_sample_id) - scaleX(prev_sample_id);
    return value;
};



/**
 * Draws the vertical line on the x axis from the calculated x value above
 */
setup_vertical_lines = function (graph, sample_id_list, line_type) {
    var svg = graph.svg;
    var options = graph.options;
    // if (line_type == 1) {
    var vertical_lines = graph.outer_label;
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
                        var end = map[vertical_lines[i + 1].start_name];
                        var diff = (multi_scaleX(end) - multi_scaleX(start)) / 2;
                        var avg = multi_scaleX(start) + diff;// + size_half_column;
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
                        var diff = (multi_scaleX(end) - multi_scaleX(start)) / 2;
                        var avg = multi_scaleX(start) + diff;//multi_scaleX(start);// + size_half_column;
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


/* Makes the tooltuip for the legend */
make_legend_tooltip = function () {
    var tooltip_legend = d3.tip()
            .attr('class', 'd3-tip')
            .offset([0, 100]) // adjust the position of tooltip hover
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
    text.each(function () {
        var text = d3.select(this),
                words = text.text().split("\n").reverse(),
                word,
                line = [],
                lineNumber = 0, // this needs to be in loop so that it incremneted within each legend and for next legend it goes to zero again
                y = text.attr("y"),
                x = text.attr("x"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", x).attr("y", y - 16).attr("dy", 0 + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            // for multiview the graph divs are hidden, thus added that to condition so that loop can be executed even when tspan.node().getComputedTextLength() = 0, which is in case of display none
            if ((tspan.node().getComputedTextLength() > width) || ((tspan.node().getComputedTextLength() == 0) && ($("#row_3").css('display') == "none" || $("#row_6").css('display') == "none"))) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", x).attr("y", y - 16).attr("dy", lineHeight + lineNumber + "em").text(word);
                lineNumber++;
            }
        }
    }
    )
}
;

// http://stackoverflow.com/questions/2232603/regular-expressions-to-insert-r-every-n-characters-in-a-line-and-before-a-com
regex_function = function (size, delimiter) {
    var regex_expression = new RegExp("(.{" + size + "})" + delimiter, "g");
    return regex_expression;
}

/**
 *  http://bl.ocks.org/ZJONSSON/3918369 and
 *  http://zeroviscosity.com/d3-js-step-by-step/step-1-a-basic-pie-chart
 *  Interactive legend which allows you to display and not display the legend
 *  In a separate group to allow for scaling and also for multiple collumns
 */

setup_D3_legend = function (graph, sample_list) {
    var svg = graph.svg;
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
    var options = graph.options;
    var legendRectSize = options.legend_rect_size;
    var page_options = graph.page_options;
    var ref_type = options.ref_name;
    // May need to change for the following graphs
    if ((graph.graph_type == 'Box Plot' || graph.graph_type == 'Violin Graph') && (options.sortByOption.split(',')[0] == 'Sample_Type' || options.sortByOption.split(',')[1] == 'Sample_Type')) {
        var assigned_colour = options.colour;
    } else {
        var assigned_colour = options.colour_array;
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
    var counter = 1;
    var legend_num = 1;

    //Add the legend to the svg element
    var legend = svg.selectAll('.legend')
            .data(sample_type_list) //options.probs contains the name and colour of the probes
            .enter()
            .append('g')
            .attr('transform', function (d, i) {
                var height = legendRectSize + 17;
                // Probe count tells us how many samples we have
                var offset = height / 2; //the 20 is to allow for the text above
                var horizontal = -2 * legendRectSize + (page_options.width +
                        (options.legend_padding * counter));

                var vertical = (legend_num * height - offset);

                legend_num++;
                if (d.length > (2 * max_legend_name_length)) {
                    rows = Math.ceil((d.length / max_legend_name_length) / 2); //calculates how many rows are required by legend_name and as one row can handle two text rows, thus divided by 2
                    legend_num++;
                } else {
                    rows = 1;
                }
                if (vertical > 400) {
                    legend_num = 1;
                    counter++;
                }

                return 'translate(' + horizontal + ',' + vertical + ')';
            });

    var id = null;
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
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide); //end on_click button

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
            .text(function (sample_type_list, i) {
                if (legend_type == "probes") {
                    if (ref_type == "ensemblID" || ref_type == "miRNA") {
                        var legend_sample_type = options.ref_name[symbol] + " " + probeInfo[sample_type_list]['label'];
                    } else {
                        var legend_sample_type = options.ref_name[probeInfo[sample_type_list]['label']] + " " + probeInfo[sample_type_list]['label'];
                    }
                    var word = legend_sample_type.replace(regex_function(probe_length, delimiter), "$&\n");
                    if (probeInfo[sample_type_list]['mapping'] == "yes") {
                        return word + "*";
                    } else {
                        return word;
                    }
                } else {
                    var word = sample_type_list.replace(regex_function(sample_type_length, delimiter), "$&\n");
                    return word;
                }
            }).call(wrap, size)
            .style("fill", function (sample_type_list, i) {
                //make pull
                if (legend_type == "probes") {
                    if (probeInfo[sample_type_list]['mapping'] == "yes") {
                        return 'red';
                    } else {
                        return 'black';
                    }
                } else {
                    return "black";
                }
            });
    var full_width_var = (full_width + (options.legend_padding * counter)) + "px";
    var full_width = full_width + (options.legend_padding * counter);
    document.getElementsByClassName("graph-svg")[0].setAttribute("width", full_width_var);
    graph.svg = svg;
    return graph;
};