/*
 * biojs-vis-box-plot
 *
 * Copyright (c) 2016 arianemora
 * Licensed under the Apache 2 license.
 */

var biojsvisboxplot;

module.exports = biojsvisboxplot = function(init_options) {

    /* ------- Generic graphing necessities universal to all Stemformatics graphs ---------- */
    // From Scatter plot	
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
        graph.svg = svg;
        return graph;
    }

        // this is to add a background color
        // from: http://stackoverflow.com/questions/20142951/how-to-set-the-background-color-of-a-d3-js-svg
    this.setup_background_colour = function(graph) {
        svg = graph.svg;
        options = graph.options;
        page_options = graph.page_options;
        svg.append("rect")
            .attr("width", page_options.width)
            .attr("height", page_options.height)
            .attr("stroke-width", background_stroke_width)
            .attr("stroke", background_stroke_colour)
            .attr("fill", options.background_colour);
        
        graph.svg = svg;

    }

    
        // this is the Main Title
        // http://bl.ocks.org/mbostock/7555321
    this.setup_titles = function(graph) {
        svg = graph.svg;
        options = graph.options;
        page_options = graph.page_options;
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
    } // end setup_titles

    /*---------------------End of basic graphing tools which require no changes ---------------*/

    /*------------------------------Box plot Calculations--------------------------------------*/

	//Returns the max and minimum values from the daa set
	this.return_y_min_max_vals = function(graph) {
		options = graph.options;
		maxVal = 1;
		minVal = 0;
		
		getMinMaxValFromData = d3.extent(options.data, function(d) {
			temp = d.Expression_Value;
			if (d.Expression_Value < minVal) {
				minVal = d.Expression_Value;
			}
			if (d.Expression_Value > maxVal) {
				maxVal = d.Expression_Value;
			}
			return temp;
		}
		 // set minimum to 0 if the minimum is a positive number
        	// this means that the minimum number is at least 0
        	// a negative number will be the only way to drop below 0
        	if (minVal > 0) { minVal = 0; }
        	// similarly, if the max number from the data is -ve
        	// at least show 0
        	if (maxVal < 1) { maxVal = 1; }
        	for (key in options.horizontal_lines){
            	value = options.horizontal_lines[key];
            	if (value > maxVal){ maxVal = value }
        		if (value < minVal){ minVal = value }
	        }

		graph.maxVal = maxVal;
		graph.minVal = minVal;
		graph.force_domain = [minVal, maxVal];
		return graph;
	}

	//Returns the median value from a set of values
	//https://gist.github.com/caseyjustus/1166258
	this.get_median_value = function(values) {
		options = graph.options;
		values.sort(function(a, b) {return a-b});
		median = Math.floor(values.length/2);
		if (values.length % 2) {
			return values[median];
		} else {
			return (values[median - 1] + values[median] / 2.0);
		}
	}

	/* Gets the 3 important values for the box plot
	 * Median
	 * Lower median value
	 * upper median value
	 */
	this.get_box_plot_values = function(graph) {
		options = graph.options;
		expressionValues = [];
		lwrHalfOfExpresssionVals = [];
		uprHalfOfExpressionVals = [];

		getExpressionValues = d3.extent(options.data, function(d) {
			expressionValues.append(d.Expression_Value);
			return d.Expression_Value;
		}
		expressionValues.sort();
		medianVal = get_median_value(expressionValues);
		for(val in expressionValues) {
			if (val < medianVal) {
				lwrHalfOfExpressionVals.append(val);
			} else if (val > medianVal) {
				uprHalfOfExpressionVals.append(val);
			}
		}
		lwrMedianVal = get_median_value(lwrHalfOfMedianVals);
		uprMedianVal = get_median_value(uprHalfOfMedianVals);
		graph.medianVal = medianVal;
		graph.lwrMedianVal = lwrMedianVal;
		graph.uprMedianVal = uprMedianVal;
		return graph;
	}

    /*------------------------End of box plot calculations -----------------------------------*/

    /*------------------------Group the data accordingly into lists --------------------------*/

    /*
    - returns verticalLines which is the basis for calculating the vertical lines that
    separate the sample types.
    - returning the probeList that allows the scaleX.domain(probeList) call to 
    create the values for the x values of the probes for ordinal values 
    - also want to store the starting sample_id of a probe as well so that we can 
    calculate the middle of the sample types to display just the sample type
    */    
    this.setup_data_for_axis = function(graph) { 
        //Set up any lists needed for setting up x and y axis
        options = graph.options;
        nestedValues = graph.nestedValues;
        sampleIdList = [];
        sampleTypeList = [];
        verticalLines = [];
        probeList = [];
        lineCount = 0;
        probeCount = 0;
        for (probe in probeValues) {
            row = probeValues[probe];
            key = row.key;
            values = row.values;
            for (i in values) {
                sample = values[i];
                probe = sample.Probe;
                sampleType = sample.Sample_Type;
                sampleID = sample.Sample_ID
                //This checks for multiple id's, count contains how many samples there are
                //Ensures the x axis lables and the vertical lines are correct
                if ($.inArray(probe, probeList) == -1) {
                    probeList.push(probe);
                    probe ++;
                }
                if ($.inArray(sampleID, sampleIdList) == -1) {
                    sampleIdList.push(sampleId);
                }
                if ($.inArray(sampleType, sampleTypeList) == -1) {
                    sampleTypeList.push(sampleType);
                }
            }
            temp = {};
            temp['probe'] = key;
            temp['start_sample_id'] = values[0].Sample_ID;
            temp['end_sample_id'] = sampleID;
            verticalLines.push(temp);
            lineCount ++;
            }
            graph.probeCount = probeCount;
            graph.verticalLines = verticalLines;
            graph.sampleTypeList = sampleTypeList;
            graph.probeList = probeList;
            return graph;
        }

    /* Sorts the probes on a given order or default is by the dataset */
    this.sort_probes = function(graph) {
        options = graph.options;
        //Check no probe order has been given, if none given order by dataset
        if (options.probe_order != "none") {
            probeOder = options.probe_order.split(',');
            nestedValues = d3.nest()
                .key(function(d) {
                    return d.Probe;
                })
                .sortKeys(function(a, b) {
                    return probe_order.indexOf(a) - probe_order.indexOf(b);
                })
                .entries(options.data);
        } else {
            probeValues = d3.nest()
                .key(function(d) {
                    return d.Probe;
                })
                .entries(options.data);
        }
        graph.nestedValues = nestedValues;
        return graph;
    }



    /*-------------------------------Draw the graph ------------------------------------------*/

    /* For box plot the x axis is the probes */
    this.setup_x_axis = function(graph) {
        pageOptions = graph.pageOptions;
        svg = graph.svg;
        options = graph.options;
        probeList = graph.probeList;

        /* http://bost.ocks.org/mike/bar/3/
        - Probes along the bottom we use ordinal instead of linear
        - See here for more: https://github.com/mbostock/d3/wiki/Ordinal-Scales
        - rangePoints gives greatest accuracy (first to the last point)
        - Padding is set as a factor of the interval size (i.e. outer padidng = 1/2 
            dist between two samples) 1 = 1/2 interval distance on the outside
            2 = 1 interval dist on the outside. Have set the default to 2 */
        var scaleX = d3.scale.ordinal()
            .rangePoints([0, page_options.width], options.padding);
          /*
        http://stackoverflow.com/questions/15713955/d3-ordinal-x-axis-change-label-order-and-shift-data-position
        The order of values for ordinal scales is the order in which you give them to .domain(). 
        That is, simply pass the order you want to .domain() and it should just work. */
        scaleX.domain(probeList);
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

        graph.probeList = probeList;
        graph.svg = svg;
        graph.scaleX = scaleX;

        // If the user wants labels we need to append the labels to the graph 
        if (options.display.x_axis_labels == "yes") {
            graph = this.setup_x_axis_using_probe_types(graph);
        }
        return graph ;
    } //end this.setup_x_axis



    /* Adds probe labels to the bottom of the graph */
    this.setup_x_axis_using_probe_type = function (graph) {
        svg = graph.svg;
        scaleX= graph.scaleX;
        sampleIdList = graph.sampleIdList;
        verticalLines = graph.verticalLines;
        pageOptions = graph.page_options;
        options = graph.options;
        //Below are used for calculating the positioning of the labels
        calcXValofProbes = this.calculate_x_value_or_probes;
        diff = this.calculate_difference_between_probes(sampleIdList, scaleX);
        
        svg.selectAll(".probe_text")
           .data(vertical_lines).enter()
            .append("text") // when rotating the text and the size
            .text(
                function(d){
                    // If the user does't want to have labels on the x axis we don't append the probe
                        temp = d.probe;
                        return temp;
                }
            )
            .attr("class", "x_axis_diagonal_labels")
            .style("text-anchor", "end")
    // Even though we are rotating the text and using the cx and the cy, we need to 
            // specify the original y and x  
            .attr("y", page_options.height + options.x_axis_label_padding)
            .attr("x",
                function(d){
                   avg = calcXValofProbes(d, sampleIdList, scaleX);
                   return avg;
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
                    x_value = calcXValofProbes(d, sampleIdList, scaleX);
                    // actual y value if there was no rotation
                    y_value = page_options.height;
                    return "rotate("+options.x_axis_text_angle+","+x_value+","+y_value+")";
                }
             )
        graph.svg = svg;
        return graph;   
    }


    /* Draws the "whiskers" on the box plot these are at the min and max values */
	this.setup_min_and_max_lines = function(graph) {
		min = graph.min;
		max = graph.max;
		options = graph.options;
		width = options.boxPlotWidth;
		strokeWidth = options.strokeWidth;
	
    }

    

