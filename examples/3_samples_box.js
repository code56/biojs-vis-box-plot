 // if you don't specify a html file, the sniper will generate a div with id "rootDiv"
var app = require("biojs-vis-box-plot");
function round_to_two_decimal_places(num){
    new_num = Math.round(num * 100) / 100;
    return new_num;
}

//An array of colours which are used for the different probes
var colours = ["DarkOrchid", "Orange", "DodgerBlue", "Blue","BlueViolet","Brown", "Deeppink", "BurlyWood","CadetBlue",
"Chartreuse","Chocolate","Coral","CornflowerBlue","Crimson","Cyan", "Red", "DarkBlue",
"DarkGoldenRod","DarkGray", "Tomato", "Violet","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen",
"DarkOrange","DarkOrchid","DarkRed","DarkSalmon","DarkSlateBlue","DarkTurquoise",
"DarkViolet","DeepPink","DeepSkyBlue","DodgerBlue","FireBrick","ForestGreen","Fuchsia",
"Gold","GoldenRod","Green","GreenYellow","HotPink","IndianRed","Indigo"];


// tip which is displayed when hovering over a collumn. Displays the sample type 
//of the collumn
var tip = d3.tip()
    .attr('class', 'd3-tip')
    .html(function(d) {
        sample_type = d.sample_type;
        temp =
            "Sample Type: " +  sample_type + "<br/>"
        return temp;
    });

// this tooltip function is passed into the graph via the tooltip
var tooltip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([0, +110])
    .html(function(d) {
       temp = 
            "Probe: " + d.Probe + "<br/>" +
            "Sample: " + d.Sample_Type +"<br/>"+
            "Disease State: " + d.Disease_State + "<br/>"
        return temp; 
    });

//The url's to the data displayed
//data_url= '../data/ds_id_5003_scatter_gata3.tsv';
data_url = '../data/ds_id_2000_scatter_stat1.tsv';
//data_url = '../data/ds_id_2000_scatter_pdgfd.tsv';


//These are all the options which get passed to the graphs on the stemformatics website
graph_data_error = "";
dataset_error = "";
graphType = "bar";
sortByOption = "Sample_Type";
show_min_y_axis = false;
ref_name = {STAT1:"STAT1"}
main_title = "Gene Expression Graph for Gene STAT1 grouped by Sample Type"; 
whiskers_needed = true;
scaling_required = "no";
sampleTypeDisplayGroupColours = new Array();
sampleTypeDisplayGroupColours.push("#9932cc");
sampleTypeDisplayGroupColours.push("#4c1966");
sampleTypeDisplayGroupColours.push("#000000");
sampleTypeDisplayGroups = {"Dermal Fibroblast":0,"hONS":1};
dataset_data = {
 	Title: "Disease-specific, neurosphere-derived cells as models for brain disorders",
	cellsSamplesAssayed:"human olfactory neurosphere (hONS), Dermal Fibroblast",
	detectionThreshold:"5.00",
	limitSortBy: "Sample Type,Disease State",
	medianDatasetExpression:"8.93",
	sampleTypeDisplayOrder:"Dermal Fibroblast,hONS",
	y_axis_label:"Log2 Expression",
	probeColours: colours,
	sampleTypeDisplayGroupColours: sampleTypeDisplayGroupColours,
	sampleTypeDisplayGroups:sampleTypeDisplayGroups
};
show_axis = "no"

d3.tsv(data_url,function (error,data){
    increment_value = 6;
    graph_box_width = 900;
    normal_graph_box_width = 900;
    var multi_group = sortByOption.split(",").length;
    max = 0;
    min = 0;
    number_of_increments = 0;
    count = 0;
    //make an array to store the number of probes for the legend
    probes_types = new Array();
    probes = new Array();
    probe_count = 0;
    //Saving the sample types and corrosponding id to use when
    //itterating over for the hovering over the ample types and altering the scatter
    //points for that sample type
    sample_types = new Array();
    sample_type_array = new Array();
    // Array which is the first sortByOption
    var sort_option_array = new Array();
    sortByOption = remove_spaces(sortByOption);
    var split_options = sortByOption.split(",");
    if (split_options[0] == "Sample_Type" || split_options[1] == "Sample_Type") {
        first_option = "Sample_Type";
    } else {
        first_option = split_options[0];
    }
    sample_type_count = 0;
    j = 0;

    data.forEach(function(d){
        // ths + on the front converts it into a number just in case
        d.Expression_Value = +d.Expression_Value;
        d.Standard_Deviation = +d.Standard_Deviation;
        d.Probe = d.Probe;
        //calculates the max value of the graph otherwise sets it to 0
        //calculates the min value and uses this if max < 0 otherwise sets to 0
        //increment valye = max - min.
        if(d.Expression_Value + d.Standard_Deviation > max){
            max = d.Expression_Value + d.Standard_Deviation;
        }
        if(d.Expression_Value - d.Standard_Deviation < min){
            min = d.Expression_Value - d.Standard_Deviation;
        }
        if($.inArray(d.Probe, probes_types) == -1){
            probes_types.push(d.Probe);
            probe_count++;
        }
        if($.inArray(d.Sample_Type, sample_type_array) == -1) {
            //Gives each sample type a unique id so that they can be grouped
            //And highlighted together
            sample_type_array.push(d.Sample_Type);
            sample_types[d.Sample_Type] = sample_type_count;
            j++;
            sample_type_count ++;
        }
        if($.inArray(d[first_option], sort_option_array) == -1){
            sort_option_array.push(d[first_option]);
        }
        count++;

    });

    /* Set up colour arrays */
    var sort_colour = {};
    var number_of_colours = 39;
    sort_colour = colours
    //if (first_option != "Sample_Type" ) {
            setup_colours_for_group(sample_type_array, sort_colour,
         number_of_colours,dataset_data['probeColours']);
    //}
    // The number of increments is how large the increment size is for the
    // y axis (i.e. 1 per whole numner etc) e.g. or an increment per number = max - min
    // chnages done by isha
    number_of_increments = max - min;
    max_y_val = max;
    // chnages for whne max = 0, thus number of increments are 0 as well
    if (number_of_increments < dataset_data["medianDatasetExpression"])  {
      number_of_increments = Math.ceil(dataset_data["medianDatasetExpression"]);
    }
    else if (number_of_increments < dataset_data["detectionThreshold"])  {
      number_of_increments = Math.ceil(dataset_data["detectionThreshold"]);
    }
    // Turn number of increments into a whole number
    number_of_increments = Math.ceil(number_of_increments);

    if((number_of_increments * increment_value) < 6) {
      number_of_increments = 6;
    }
    if((number_of_increments * increment_value) > 10) {
      number_of_increments = 10;
    }
    probes = probes;
    sample_types = sample_types;
    probe_count = probe_count;
    title = "Box Plot";
    subtitle1 = dataset_data["Title"]
    subtitle2 = dataset_data["cellsSamplesAssayed"]
    target = rootDiv;

    // can always use just a straight value, but it's nicer when you calculate
    // based off the number of samples that you have
    width = data.length*1;
    horizontal_grid_lines = width;
    if (width < 1000){
        width = 1000;
    }
    // this tooltip function is passed into the graph via the tooltip
    var all_second_sort_by_tooltip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([0, +110])
    .html(function(d) {
       temp =
            "Probe: " + d.Probe + "<br/>" +
            "Sample: " + d.Sample_Type +"<br/>"+
            "second_sort_by State: " + second_sort_by_names + "<br/>"
        return temp;
    });

    // we will always hide x axis if graph is of normal width and too  many probes
    if (graph_box_width == normal_graph_box_width) {
      show_axis == "no"
    }
    //calculate if x axis label should be shown on load or not
    if((probe_count * sample_type_count) > 35 && show_axis == "no") {
      x_axis_labels_required = "no";
    }
    else {
      x_axis_labels_required = "yes";
    }

    // sorted sample type as per groups
    sorted_sample_types = Object.keys(dataset_data['sampleTypeDisplayGroups']).sort(function(a,b){return dataset_data['sampleTypeDisplayGroups'][a]-dataset_data['sampleTypeDisplayGroups'][b]})
    if ((sortByOption.split(',')[0] == 'Sample_Type' || sortByOption.split(',')[1] == 'Sample_Type')) {
      sort_option_array = sorted_sample_types;
      if((sortByOption.split(',').length == 1) && (sortByOption.split(',')[0] != 'Sample_Type')){
        sort_option_array = sort_option_array.sort(sortAlphaNum_array); // when sorting by diseas_state, or gender or time . we wnat legend to be sorted
      }
    }
    //The main options for the graph
    var options = {
        // Minimums so that we don't have items disapearing if they are too
        // small
        mins: {stroke: 1.5, radius: 1.5, box_width: 2},
        multi_group: multi_group,
        legend_list: {name: first_option, list: sort_option_array},
	colour_array: sort_colour,
	jitter: "no",
        test: "no", //Only used to test the data -> outputs the values to a file on the computer
        test_path: "/home/ariane/Documents/stemformatics/bio-js-box-plot/test/box_plot_test.csv", //Path to save the test file to including name
        // save as .csv file
        /********   Options for Data order *****************************************/
        // If no orders are given than the order is taken from the dataset
        bar_graph: graphType,
        box_width: 50,
        box_width_wiskers: 15,
        second_sort_by_order: "no", //Order of the second_sort_by state on the x axis
        sample_type_order: dataset_data["sampleTypeDisplayOrder"], //Order of the sample types on the x axis
        probe_order: probes_types,	//Order of the probes on the x axis
        //Including the second_sort_by state on the x axis causes the order to change as the data becomes
        //sorted by probes and second_sort_by state
        include_second_sort_by_x_axis: "no", //Includes the second_sort_by state on the x axis
        size_of_second_sort_by_labels: 200, //The size allotted to the second_sort_by state labels
        x_axis_padding: 50,
    	all_second_sort_by_tooltip: all_second_sort_by_tooltip, // using d3-tips
	    draw_scatter_on_box: "no",
        ref_name: ref_name,
	    radius: 3,
	    /******** End Options for Data order *****************************************/
        /******** Options for Sizing *****************************************/
        legend_padding: 190,
        legend_rect_size: 20,
        whiskers_needed : whiskers_needed,
    	  height: 400,
        width: graph_box_width,
        margin:{top: 200, left: 100, bottom: 400, right: 270},
        initial_padding: 10,
        legend_on_x_axis: "no",
        x_axis_label_padding: 10,//padding for the x axis labels (how far below the graph)
        text_size: "12px",
        title_text_size: "16px",
        sortByOption: sortByOption,
        show_min_y_axis: show_min_y_axis,
        increment: number_of_increments * increment_value, // To double the number of increments ( mutliply by 2, same for
        // reducing. Number of increments is how many numbers are displayed on the y axis. For none to
        // be displayed multiply by 0
        display: {hoverbars: "yes", error_bars: "yes", legend: "yes", horizontal_lines: "yes", vertical_lines: "yes", x_axis_labels: "yes", y_axis_title: "yes", horizontal_grid_lines: "yes"},

        circle_radius: 2,  // for the scatter points
        hover_circle_radius: 10,
        /*********** End of sizing options **********************************/
        background_colour: "white",
        background_stroke_colour:  "black",
        background_stroke_width:  "1px",
        colour: colours,
        font_style: "Arial",
        grid_colour: "black",
        grid_opacity: 0.5,
        y_label_text_size: "14px",
        y_label_x_val: 40,
        data: data,
        // eq. yes for x_axis labels indicates the user wants labels on the x axis (sample types)
        // indicate yes or no to each of the display options below to choose which are displayed on the graph
        domain_colours : ["#FFFFFF","#7f3f98"],
        error_bar_width:5,
	    error_stroke_width: "1px",
        error_dividor:100,//100 means error bars will not show when error < 1% value
        //horizontal lines takes a name, colour and the yvalue. If no colour is given one is chosen at random
        horizontal_lines: [["Detection Threshold "+dataset_data["detectionThreshold"], "green", dataset_data["detectionThreshold"]], ["Median "+dataset_data["medianDatasetExpression"], , dataset_data["medianDatasetExpression"]]],
        horizontal_line_value_column: 'value',
        //to have horizontal grid lines = width (to span accross the grid), otherwise = 0
        horizontal_grid_lines: width,
        legend_class: "legend",
        legend_range: [0,100],
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
        sample_type_order: dataset_data["sampleTypeDisplayOrder"],// "DermalFibroblast, hONS", // "BM MSC,BM erythropoietic cells CD235A+,BM granulopoietic cells CD11B+,BM hematopoietic cells CD45+,Developing cortex neural progenitor cells,Ventral midbrain neural progenitor cells,Olfactory lamina propria derived stem cells",
        sample_types: sample_types,
        num_sample_types: sample_type_count,
        // Can fit 4 subtitles currently
        subtitles: [subtitle1,subtitle2],
        stroke_width:"3px",
	    stroke_width_num: 3,
        target: target,
        title: main_title,
        title_class: "title",
        tip: tip,//second tip to just display the sample type
        tooltip: tooltip, // using d3-tips
        //tooltip1: tooltip1, // using d3-tips unique_id: "chip_id",
        watermark:"https://www1.stemformatics.org/img/logo.gif",
        x_axis_text_angle:-45,
        x_axis_title: "Samples",
        x_column: 'Sample_ID',
        x_middle_title: 500,
        y_axis_title: dataset_data["y_axis_label"],
        y_column: 'Expression_Value'
    }

    var instance = new app(options);

    // Get the d3js SVG element
    var tmp = document.getElementById(rootDiv.id);
    var svg = tmp.getElementsByTagName("svg")[0];
    // Extract the data as SVG text string
    var svg_xml = (new XMLSerializer).serializeToString(svg);
});

