// if you don't specify a html file, the sniper will generate a div with id "rootDiv"
var app = require("biojsboxplot");
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
           console.log(temp);
        return temp; 
    });

//The url's to the data displayed
//data_url= '../data/ds_id_5003_scatter_gata3.tsv';
data_url = '../data/ds_id_2000_scatter_stat1.tsv';
//data_url = '../data/ds_id_2000_scatter_pdgfd.tsv';

/* Extracting the data from the csv files for use in the graph
 * Also sets relevent options based on the data passed in (for example
 * calculating the min and max values of the graph */
d3.tsv(data_url,function (error,data){
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
    sample_type_count = 0;
    j = 0;
    //need to put in the number of colours that are being used (so that it
    //can reiitterate over them again if necesary
    number_of_colours = 39;
    colour_count = 0;
    disease_states = [];
    disease_state_names = "";
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
        count++;

    });
    //USed to set up the probes and their corrosponding 
    //colours
    for(i = 0; i < probe_count; i++){
        probes[i] = [];
        probes[i][0] = probes_types[i];
      //  colour_count++;
        if(colour_count == number_of_colours){
            colour_count = 0;
        }
        probes[i][1] = colours[colour_count];
        colour_count++;
    }
    // The number of increments is how large the increment size is for the
    // y axis (i.e. 1 per whole numner etc) e.g. or an increment per number = max - min
    number_of_increments = max - min;
    // Turn number of increments into a whole number
    number_of_increments |= 0;
    probes = probes;
    sample_types = sample_types;
    probe_count = probe_count;
    title = "Box Plot";
    subtitle1 = "Subtitle"
    subtitle2 = "Subtitle"
    target = rootDiv;

    // can always use just a straight value, but it's nicer when you calculate
    // based off the number of samples that you have
    width = data.length*1;
    horizontal_grid_lines = width;
    if (width < 1000){
        width = 1000;
    }
   //Need a name of all disease states for the sample type
    for (disease in disease_states) {
        disease_state_names = disease_states[disease] + " " + disease_state_names;
    }
    // this tooltip function is passed into the graph via the tooltip
    var all_disease_tooltip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([0, +110])
    .html(function(d) {
       temp = 
            "Probe: " + d.Probe + "<br/>" +
            "Sample: " + d.Sample_Type +"<br/>"+
            "Disease State: " + disease_state_names + "<br/>"
           console.log(temp);
        return temp;
    });


    //The main options for the graph
    var options = {
	/******** Options for Data order *****************************************/
	// If no orders are given than the order is taken from the dataset
	box_width: 20,
	box_width_wiskers: 5,
	disease_state_order: "none", //Order of the disease state on the x axis
	sample_type_order: "none", //Order of the sample types on the x axis
	probe_order: "none",	//Order of the probes on the x axis
	//Including the disease state on the x axis causes the order to change as the data becomes
	//sorted by probes and disease state
	include_disease_state_x_axis: "yes", //Includes the disease state on the x axis
	size_of_disease_state_labels: 200, //The size allotted to the disease state labels
	x_axis_padding: 50,
    	all_disease_tooltip: all_disease_tooltip, // using d3-tips
	/******** End Options for Data order *****************************************/    
        /******** Options for Sizing *****************************************/
        legend_padding: 50,
        legend_rect_size: 20,	
	height: 400,
        width: 600,
        margin:{top: 50, left: 60, bottom: 500, right: 150},
        initial_padding: 10,
        x_axis_label_padding: 10,//padding for the x axis labels (how far below the graph)
        text_size: "12px",
        title_text_size: "16px",
        increment: number_of_increments * 0.5, // To double the number of increments ( mutliply by 2, same for 
        // reducing. Number of increments is how many numbers are displayed on the y axis. For none to
        // be displayed multiply by 0
        display: {hoverbars: "yes", error_bars: "yes", legend: "yes", horizontal_lines: "no", vertical_lines: "no", x_axis_labels: "yes", y_axis_title: "yes", horizontal_grid_lines: "yes"},

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
        horizontal_lines: [["Detection Threshold", "green", 5], ["Median", , 8.93]],
        horizontal_line_value_column: 'value',
        //to have horizontal grid lines = width (to span accross the grid), otherwise = 0
        horizontal_grid_lines: width,
        legend_class: "legend",
        legend_range: [0,100],
        line_stroke_width: "2px",
       //default number of colours iis 39 (before it reitterates over it again)
        number_of_colours: 39,
        //2 is the chosen padding. On either side there will be padding = to the interval between the points
        //1 gives 1/2 the interval on either side etc.
        padding: 2,
        probe_count: probe_count,
        probes: probes,
        //sample type order indicates whether or not the samplese need to be represented in a specific order
        //if no order is given then the order from the data set is taken
        sample_type_order:"none",// "DermalFibroblast, hONS", // "BM MSC,BM erythropoietic cells CD235A+,BM granulopoietic cells CD11B+,BM hematopoietic cells CD45+,Developing cortex neural progenitor cells,Ventral midbrain neural progenitor cells,Olfactory lamina propria derived stem cells",
        sample_types: sample_types,
        // Can fit 4 subtitles currently
        subtitles: [subtitle1],
        stroke_width:"3px",
        target: target,
        title: title,
        title_class: "title",
        tip: tip,//second tip to just display the sample type
        tooltip: tooltip, // using d3-tips
        //tooltip1: tooltip1, // using d3-tips unique_id: "chip_id",
        watermark:"http://www1.stemformatics.org/img/logo.gif",
        x_axis_text_angle:-45, 
        x_axis_title: "Samples",
        x_column: 'Sample_ID',
        x_middle_title: 500,
        y_axis_title: "Log2 Expression",
        y_column: 'Expression_Value'
    }

    var instance = new app(options);

    // Get the d3js SVG element
    var tmp = document.getElementById(rootDiv.id);
    var svg = tmp.getElementsByTagName("svg")[0];
    // Extract the data as SVG text string
    var svg_xml = (new XMLSerializer).serializeToString(svg);

}); 

