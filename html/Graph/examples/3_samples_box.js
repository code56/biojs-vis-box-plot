
setup_data_box = function (svgID) {

    // Your data URL
    var data_url = 'Graph/data/stat1.tsv';

    var increment_value = 6;
    var graph_box_width = 900;
    var normal_graph_box_width = 900;
    // Gets the static variables 
    var defaults = get_static_vars();
    d3.tsv(data_url, function (error, data) {

        var multi_group = defaults.sortByOption.split(",").length;
        /* Extracting the data from the csv files for use in the graph
         * Also sets relevent options based on the data passed in (for example
         * calculating the min and max values of the graph */

        var max = 0, min = 0, number_of_increments = 0, count = 0;
        var sample_type_count = 0, probe_count = 0, colour_count = 0;
        //make an array to store the number of probes for the legend
        var probes_types = new Array();
        var probes = new Array();
        //Saving the sample types and corrosponding id to use when
        //itterating over for the hovering over the ample types and altering the scatter
        //points for that sample type
        var sample_types = new Array();
        var sample_type_array = new Array();

        // Ensure there aren't any spaces - Just to make things consistant
        var sortByOption = remove_spaces(defaults.sortByOption);
        var split_options = sortByOption.split(",");
        // This is a way of making it easier to specify what the sorting option
        // is. Normally it is Sample Type
        if (split_options[0] == "Sample_Type" || split_options[1] == "Sample_Type") {
            var first_option = "Sample_Type";
        } else {
            var first_option = split_options[0];
        }
        //need to put in the number of colours that are being used (so that it
        //can reiitterate over them again if necesary
        var number_of_colours = 39;

        data.forEach(function (d) {
            // ths + on the front converts it into a number just in case
            d.Expression_Value = +d.Expression_Value;
            d.Standard_Deviation = +d.Standard_Deviation;
            //calculates the max value of the graph otherwise sets it to 0
            //calculates the min value and uses this if max < 0 otherwise sets to 0
            //increment valye = max - min.
            if (d.Expression_Value + d.Standard_Deviation > max) {
                max = d.Expression_Value + d.Standard_Deviation;
            }
            if (d.Expression_Value - d.Standard_Deviation < min) {
                min = d.Expression_Value - d.Standard_Deviation;
            }
            if ($.inArray(d.Probe, probes_types) == -1) {
                probes_types.push(d.Probe);
                probe_count++;
            }
            if ($.inArray(d.Sample_Type, sample_type_array) == -1) {
                //Gives each sample type a unique id so that they can be grouped
                //And highlighted together
                sample_type_array.push(d.Sample_Type);
                sample_types[d.Sample_Type] = sample_type_count;
                sample_type_count++;
            }
            count++;

        });

        probes_types = probes_types.sort()
        /* Set up colour arrays */
        // For scatter graphs we use the probe colour
        var probe_colour = {};
        probe_colour = setup_colours_for_group(probes_types, probe_colour,
                number_of_colours, defaults.dataset_data['probeColours']);
        // For box bar line we use sample colour
        var sample_colour = {};
        sample_colour = setup_colours_for_group(sample_type_array.sort(), sample_colour,
                number_of_colours, colours);

        // The number of increments is how large the increment size is for the
        // y axis (i.e. 1 per whole numner etc) e.g. or an increment per number = max - min
        // changes done by isha
        number_of_increments = max - min;
        // this is when max-min is 0
        if (number_of_increments < defaults.dataset_data["medianDatasetExpression"]) {
            if (number_of_increments < defaults.dataset_data["detectionThreshold"]) {
                number_of_increments = Math.ceil(defaults.dataset_data["detectionThreshold"]);
            } else {
                number_of_increments = Math.ceil(defaults.dataset_data["medianDatasetExpression"]);
            }
        }
        // Turn number of increments into a whole number
        number_of_increments = Math.ceil(number_of_increments);

        if ((number_of_increments * increment_value) < 6) {
            number_of_increments = 6;
        }
        if ((number_of_increments * increment_value) > 10) {
            number_of_increments = 10;
        }

        // Set up the title and subtitle for the graphs
        var title = defaults.main_title;
        var subtitle1 = defaults.dataset_data["Title"];
        var subtitle2 = defaults.dataset_data["cellsSamplesAssayed"];
        var target = svgID;

        // can always use just a straight value, but it's nicer when you calculate
        // based off the number of samples that you have
        var width = data.length * 1;
        var horizontal_grid_lines = width;
        if (width < 1000) {
            width = 1000;
        }
        var split_sort_by_option = sortByOption.split(',');
        if (split_sort_by_option[0] == "Sample Type") {
            split_sort_by_option[0] = "Sample_Type";
        } else if (split_sort_by_option[1] == "Sample Type") {
            split_sort_by_option[1] = "Sample_Type";
        }
        //The main options for the graph
        var options_box = {
            // Minimums so that we don't have items disapearing if they are too
            // small
            box: {
                mins: {stroke: 1.5, radius: 1.5, box_width: 2},
                jitter: "no",
                symbol: 0, // Which label we want to display 0 = first letter for shortening
                radius: 3,
                bar_graph: "no",
                width: 50,
                width_wiskers: 15,
                whiskers_needed: defaults.whiskers_needed,
                //second_sort_by_order: "no", //Order of the second_sort_by state on the x axis
                include_second_sort_by_x_axis: "no", //Includes the second_sort_by state on the x axis
                draw_scatter: "no", //Draws the scatter points on a box
                x_axis_label_padding: 10, //padding for the x axis labels (how far below the graph)
                colour_array: sample_colour,
                tooltip: tooltip
            },
            scatter: {
                error_needed: false, // Sets up error bars
                radius: 2, // for the scatter points
                //hover_circle_radius: 10           
                error_bar_width: 5,
                error_stroke_width: "1px",
                error_dividor: 100, //100 means error bars will not show when error < 1% value
                colour_array: probe_colour //normally sorted colours but for scatter doesn't have 

            },
            multi_group: multi_group,
            legend_list: {name: first_option, list: defaults.colours},
            split_sort_by_option: split_sort_by_option, //Used to get the sample type (made modular)
            test: "no", //Only used to test the data -> outputs the values to a file on the computer
            test_path: "/home/ariane/Documents/stemformatics/bio-js-box-plot/test/box_plot_test.csv", //Path to save the test file to including name
            /********   Options for Data order *****************************************/
            // If no orders are given than the order is taken from the dataset
            sample_type_order: defaults.dataset_data["sampleTypeDisplayOrder"], //Order of the sample types on the x axis
            probe_order: probes_types, //Order of the probes on the x axis
            ref_name: defaults.ref_name,
            /******** End Options for Data order *****************************************/
            /******** Options for Sizing *****************************************/
            legend_padding: 190,
            legend_rect_size: 20,
            height: 400,
            width: graph_box_width,
            margin: {top: 200, left: 100, bottom: 400, right: 270},
            scaling_required: defaults.scaling_required,
            text_size: "12px",
            title_text_size: "16px",
            sortByOption: sortByOption,
            show_min_y_axis: defaults.show_min_y_axis,
            increment: number_of_increments * increment_value, // To double the number of increments ( mutliply by 2, same for
            // reducing. Number of increments is how many numbers are displayed on the y axis. For none to
            // be displayed multiply by 0
            display: {hoverbars: "yes", error_bars: "yes", legend: "no", horizontal_lines: "yes", vertical_lines: "yes", x_axis_labels: "yes", y_axis_title: "yes", horizontal_grid_lines: "yes"},
            /*********** End of sizing options **********************************/
            background_colour: "white",
            background_stroke_colour: "black",
            background_stroke_width: "1px",
            colour: defaults.colours,
            font_style: "Arial",
            grid_colour: "black",
            grid_opacity: 0.5,
            y_label_text_size: "14px",
            y_label_x_val: 40,
            data: data,
            // eq. yes for x_axis labels indicates the user wants labels on the x axis (sample types)
            // indicate yes or no to each of the display options below to choose which are displayed on the graph

            //horizontal lines takes a name, colour and the yvalue. If no colour is given one is chosen at random
            horizontal_lines: [["Detection Threshold " + defaults.dataset_data["detectionThreshold"], "green", defaults.dataset_data["detectionThreshold"]], ["Median " + defaults.dataset_data["medianDatasetExpression"], , defaults.dataset_data["medianDatasetExpression"]]],
            horizontal_line_value_column: 'value',
            //to have horizontal grid lines = width (to span accross the grid), otherwise = 0
            horizontal_grid_lines: width,
            legend_class: "legend",
            legend_range: [0, 100],
            line_stroke_width: "2px",
            legend_text: "yes",
            legend_shorten_text: "no",
            substring_legend_length: 15,
            show_legend_tooltip: "no",
            legend_toggle_opacity: "no",
            //default number of colours iis 39 (before it reitterates over it again)
            number_of_colours: 39,
            //2 is the chosen padding. On either side there will be padding = to the interval between the points
            //1 gives 1/2 the interval on either side etc.
            padding: 2,
            probe_count: probe_count,
            probes: probes,
            //sample type order indicates whether or not the samplese need to be represented in a specific order
            //if no order is given then the order from the data set is taken
            sample_type_order: defaults.dataset_data["sampleTypeDisplayOrder"], // "DermalFibroblast, hONS", // "BM MSC,BM erythropoietic cells CD235A+,BM granulopoietic cells CD11B+,BM hematopoietic cells CD45+,Developing cortex neural progenitor cells,Ventral midbrain neural progenitor cells,Olfactory lamina propria derived stem cells",
                    sample_types: sample_types,
            num_sample_types: sample_type_count,
            // Can fit 4 subtitles currently
            subtitles: [subtitle1, subtitle2],
            stroke_width: "3px",
            stroke_width_num: 3,
            target: target,
            title: defaults.main_title,
            title_class: "title",
            tip: tip, //second tip to just display the sample type
            tooltip: tooltip, // using d3-tips
            watermark: "https://www1.stemformatics.org/img/logo.gif",
            x_axis_text_angle: -45,
            x_axis_title: "Samples",
            x_column: 'Sample_ID',
            x_middle_title: 500,
            y_axis_title: defaults.dataset_data["y_axis_label"],
            y_column: 'Expression_Value'
        };

        var instance = init_box(options_box);
        return options_box;
    });
};

