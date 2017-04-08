# biojs-vis-box-plot

The biojs folder and HTML folder contain the same project just in a slightly different format.

If you are wanting to insert the graphs into a html div, I would recomend looking at the HTML folder.

index.html contains an example of how to do this.


## Brief description of use in HTML:

In the index.html include the necessary JavaScript files at the top, the order is important as the files call one another so ceertain files are requried to load first.

The graphs load in a certain div by taking the div id as the argument.
There are "options" for each graph - and can be used to change the appearence of the components:

These are in html/Graph/examples

Static variables contain shared variables amoungst all the examples and can also be changed. 
This includes things such as, title, description etc.

Things specific to a graph are under their name within the options (e.g. scatter or box)
Note box also includes bar graph - for a bar graph the options.box.bar_graph = "yes".

### Index files
Each gaph type has a different index.js file, these are in the Graph/lib folder. They call different functions. 
I have tried to keep the shared functions separate and these are things such as :

Building the axis (in axis.js)
Drawing the SVG (general.js) etc.

These are shared amoungst all the bioJS graphs.

The options are listed below.

       var options_scatter = {
            // Minimums so that we don't have items disapearing if they are too
            // small
            box: {
                mins: {stroke: 1.5, radius: 1.5, box_width: 2},
                jitter: "no",
                radius: 3,
                bar_graph: "yes",
                width: 50,
                width_wiskers: 15,
                whiskers_needed: defaults.whiskers_needed,
                //second_sort_by_order: "no", //Order of the second_sort_by state on the x axis
                include_second_sort_by_x_axis: "no", //Includes the second_sort_by state on the x axis
                draw_scatter: "no", //Draws the scatter points on a box
                x_axis_label_padding: 10, //padding for the x axis labels (how far below the graph)
                colour_array: defaults.sort_colour,
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


NOTE: CALCULATIONS ARE YET TO BE TESTED -> unit testing coming soon

## Getting Started
Install the module with: `npm install biojs-vis-box-plot`

for more details of the options, see the working example [here](http://biojs.io/d/biojs-vis-scatter-plot)  and the example code [here](https://github.com/ArianeMora/bio-js-scatter-plot/blob/master/examples/simple.js)



## Contributing

All contributions are welcome.

## Support

If you have any problem or suggestion please open an issue [here](https://github.com/rowlandm/biojs-vis-rohart-msc-test/issues).

## License 
This software is licensed under the Apache 2 license, quoted below.

Copyright (c) 2015, ArianeMora

Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
