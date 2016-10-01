    /**
     * Copyright 2016 Ariane Mora
     *
     * A general set of tests that check that components have been rendered on
     * the svg. Other elemnets can be tested in addition and specific placement
     * and values should be tested as well.
     *
     */

    /**
     * This is the start of an automatic test which simply runs to check that
     * all the svg elements have been rendered correctly
     */ 
    run_tests = function (graph) {
        /* Run check for all scatter points */
        var options = graph.options;
        var data = options.data;
        check_num_points(options, data, graph);
        check_x_labels(options, data, graph);    
        check_horizontal_lines(options, graph);
        check_legend(options, data, graph);
        check_titles(options, graph);
        check_axis(options, graph);
        return graph;
    };
	
    /**
     * Checks that all the ticks are drawn and the correct number are drawn as
     * specified */  
    check_axis = function (options, graph) {
        /* Get all the tick elements */
        var ticks = document.getElementsByClassName("tick");
        /* Want to make sure that the largest tick is > the max value and
         * the smallest tick is < the smallest value */
        var min = 1000;
        var max = 0;
        for (var d in ticks) {
            var val = parseFloat(ticks[d].innerHTML);
            if (val  < min) {
                min = val;
            }
            if (val > max) {
                max = val;
            }
        }
        if (max < graph.max_val) {
            console.log("Ticks max val was too small");
        }
        if (min > graph.min_val) {
            console.log("Ticks min val was too large");
        }
        console.log("check for axis complete, num ticks: ", ticks.length);
    }

    /**
     * Checks that the titles are correctly printed    
     */ 
    check_titles = function (options, graph) {
        // Check main title
        var title_name = options.title;
        var title_size = options.title_text_size;
        var title = document.getElementById("title-"+ title_name);
        if (title.innerHTML !== title_name || title.style.fontSize
             !== title_size) {
            console.log("Error with text of main title: "+ title_name);
        }
        //Check the subtitles
        var subtitle_size = options.text_size;
        for (var d in options.subtitles) {
            var subtitle_name = options.subtitles[d];
            var subtitle = document.getElementById("subtitle-"+ subtitle_name);
            if (subtitle.innerHTML !== subtitle_name ||
                    subtitle.style.fontSize !== subtitle_size) {
                console.log("Error with text of sub title: "+ subtitle_name);
            }
        }
        console.log("Titles and subTitles have been checked");
    };
    
    /**
     * Checks that the legend is displayed correctly.
     * Checks the number of the rectangles and the text is displayed correctly
     */
    check_legend = function (options, data, graph) {
        // Use the probes that we from the data origionally
        var probes = options.probes; // Contains the probe info and colour
        for (var d in probes) {
            var probe_name = probes[d][0];
            var colour = probes[d][1].toUpperCase();
            var legend_text = document.getElementById("legend-text-"+ probe_name);
            var legend_rect = document.getElementById("legend-rect-"+ probe_name);
            /* Check the correct text is displayed maybe later implement
             * a check for the position */
            if (legend_text.innerHTML !== probe_name) {
                 console.log("Error with legend text: ", name);       
            }
            /* Check that the rectangle is correct colour and displaying */
            var rect_colour = legend_rect.style.fill.toUpperCase();
            var rect_height = parseFloat(legend_rect.getAttribute("height"));
            var rect_width = parseFloat(legend_rect.getAttribute("width"));
            if (rect_width !== options.legend_rect_size ||
                    rect_height !== options.legend_rect_size) {
                        console.log("Error with legend rect size: ", name);
            }
            if (rect_colour !== colour) {
                console.log("Error with legend rect colour: ", name);
            }
        }
        console.log("Checked Legend for correct rectangles being displayed and"
            + " legend text");
    } 

    /**
     * Checks the numeber of horizontal lines,
     * the text, the values and that they are drawn within the bounds of the
     * grpah
     */ 
    check_horizontal_lines = function (options, graph) {
        var horizontal_lines = options.horizontal_lines;
        var width = page_options.width;
        var font_size = options.text_size;
        var colour_random = d3.scale.category20();
	    for (var i = 0; i < horizontal_lines.length; i++) {
            var name = horizontal_lines[i][0];
            //if no colours are defined pick one at random
            if (horizontal_lines[i][1] === undefined) {
                var colour = colour_random;
            } else {
                var colour = horizontal_lines[i][1];
            }
            var y_value = horizontal_lines[i][2];
            /* Get element that should be renedered in html */
            var line = document.getElementById("horizontal-line-" + name);
            var line_text = document.getElementById("horizontal-line-text-" + name);       
            var y1 = parseFloat(line.getAttribute("y1"));
            var y2 = parseFloat(line.getAttribute("y2"));
            var x1 = parseFloat(line.getAttribute("x1"));
            var x2 = parseFloat(line.getAttribute("x2"));
            var max = graph.scaleY(graph.max_val);
            var min =  graph.scaleY(graph.min_val);
            var y_actual = parseFloat(graph.scaleY(y_value)); /* Round value */
            /* Want it to span the whole witdh and it to be a straight line */
            if ((x2 - x1) !== width || y1 !== y2 || y1 !== y_actual) {
                console.log("Error with horizontal line positioning: ", name);
            }
            /* Want to check it is within the graph note operands are flipped
             * as smaller values have a larger y value*/
            if (y1 > min || y1 < max) {
                 console.log("Error with horizontal line ouside bounds: ", name);
            }
            /* Check text is correct and has a size (i.e. is redered)*/
            if (line_text.innerHTML !== name) {
                console.log("Error with horizontal line text: ", name);
            }
            if (line_text.style.fontSize !== font_size) {
                console.log("Error with horizontal line text size: ", name);
            }
        }
        console.log("Horizontal lines have been checked for spanning page," + 
            " bounds, text_size and text");
    }


    /**
     * Checks there are the correct number of labels and they
     * have the correct text on the x axis
     */  
    check_x_labels = function (options, data, graph) {
        /* When we first read in the data we get the sample types
         * from this so itterate through and check that each one 
         * has a corrosponding label */
        var num_labels = 0;
        for (var d in options.x_labels) {
            var sample_name =  options.x_labels[d];
             var label = document.getElementById("xLabel-"
+  sample_name.replace(/\ |(|)/g,
''));
            var text = label.innerHTML;
            /* Check that it has the correct text*/
            if (text !== sample_name) {
                console.log("Error in x labels with sample: ", sample_name,
text);
            }
            /* Check that the stroke width is the correct one i.e. drawn */
            var family = label.style.fontFamily;
            var size = label.style.fontSize;
            if (family !== options.font_style) {
                 console.log("Error in style of x labels with sample: ",
sample_name);
            }
            if (size !== options.text_size) {
                 console.log("Error in size of x labels with sample: ",
                sample_name);
            }

        }
        console.log("x labels have been checked for size, font, text");   
    }
    
    /**
     * Checks the correct number of scatter points are drawn on a graph
     */  
    check_num_points = function (options, data, graph) {
        /* Check the correct number of scatter points were rendered 
         * and we have the correct number for each sample type  */
        var total_num_points = 0;
        for (var d in data) {
            var sample = data[d];
            var scatter_point = document.getElementById("scatter-point-"
                + sample.Sample_ID);
            /* Simple check to check that the point has a radius of the 
             * Correct size  */
            var radius = parseInt(scatter_point.getAttribute("r"));
            if (radius !== options.circle_radius) {
                console.log("error with following sample type: ",
                    sample.Sample_ID);
            }
            total_num_points ++; // We should have a point for each line in the
            // data set
        }
        console.log("Scatter points have been checked for size and number of " +
"points");
    }

