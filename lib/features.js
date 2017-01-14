
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
