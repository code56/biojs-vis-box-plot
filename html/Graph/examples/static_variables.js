

//An array of colours which are used for the different probes
var colours = ["DarkOrchid", "Orange", "DodgerBlue", "Blue", "BlueViolet", "Brown", "Deeppink", "BurlyWood", "CadetBlue",
    "Chartreuse", "Chocolate", "Coral", "CornflowerBlue", "Crimson", "Cyan", "Red", "DarkBlue",
    "DarkGoldenRod", "DarkGray", "Tomato", "Violet", "DarkGreen", "DarkKhaki", "DarkMagenta", "DarkOliveGreen",
    "DarkOrange", "DarkOrchid", "DarkRed", "DarkSalmon", "DarkSlateBlue", "DarkTurquoise",
    "DarkViolet", "DeepPink", "DeepSkyBlue", "DodgerBlue", "FireBrick", "ForestGreen", "Fuchsia",
    "Gold", "GoldenRod", "Green", "GreenYellow", "HotPink", "IndianRed", "Indigo"];


// tip which is displayed when hovering over a collumn. Displays the sample type 
//of the collumn
var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(function (d) {
            sample_type = d.sample_type;
            temp =
                    "Sample Type: " + sample_type + "<br/>"
            return temp;
        });

// this tooltip function is passed into the graph via the tooltip
var tooltip_scatter = d3.tip()
        .attr('class', 'd3-tip')
        .offset([0, +110])
        .html(function (d) {
            probe = d.Probe;
            // 2 decimal places on the display only
            Expression_Value = round_to_two_decimal_places(d[y_column]);
            lwr = round_to_two_decimal_places(d.Expression_Value - d.Standard_Deviation);
            upr = round_to_two_decimal_places(d.Expression_Value + d.Standard_Deviation);
            temp =
                    "Probe: " + d.Probe + "<br/>" +
                    "Sample Type: " + d.Sample_ID + "<br/>" +
                    "Log2 Expression: " + Expression_Value + " [" + lwr + ";" + upr + "]<br/>"
            // "MSC predicted "+msc_call+"/"+total+" iterations<br/>"
            return temp;
        });


// this tooltip function is passed into the graph via the tooltip
var tooltip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([0, +110])
        .html(function (d) {
            temp =
                    "Probe: " + d.Probe + "<br/>" +
                    "Sample: " + d.Sample_Type + "<br/>" +
                    "Disease State: " + d.Disease_State + "<br/>"
            return temp;
        });

var get_static_vars = function () {

    //These are all the options which get passed to the graphs as part of the dataset's
    //Information
    var graphType = "bar";
    var sortByOption = "Sample_Type";
    var show_min_y_axis = false;
    var ref_name = {STAT1: "STAT1"};
    var main_title = "Gene Expression Graph for Gene STAT1 grouped by Sample Type";
    var whiskers_needed = true;
    var scaling_required = "no";
    var sampleTypeDisplayGroupColours = new Array();
    sampleTypeDisplayGroupColours.push("#9932cc");
    sampleTypeDisplayGroupColours.push("#4c1966");
    sampleTypeDisplayGroupColours.push("#000000");
    sampleTypeDisplayGroups = {"Dermal Fibroblast": 0, "hONS": 1};

    //Pass all the dataset data into a dictionary for easy use.
    var dataset_data = {
        Title: "Disease-specific, neurosphere-derived cells as models for brain disorders",
        cellsSamplesAssayed: "human olfactory neurosphere (hONS), Dermal Fibroblast",
        detectionThreshold: "5.00",
        limitSortBy: "Sample Type,Disease State",
        medianDatasetExpression: "8.93",
        sampleTypeDisplayOrder: "Dermal Fibroblast,hONS",
        y_axis_label: "Log2 Expression",
        probeColours: colours,
        sampleTypeDisplayGroupColours: sampleTypeDisplayGroupColours,
        sampleTypeDisplayGroups: sampleTypeDisplayGroups
    };

    return {
        dataset_data: dataset_data,
        graph_data_error: "",
        dataset_error: "",
        graphType: graphType,
        sortByOption: sortByOption,
        show_min_y_axis: show_min_y_axis,
        ref_name: ref_name,
        main_title: main_title,
        whiskers_needed: whiskers_needed,
        scaling_required: scaling_required
    };
};




//An array of colours which are used for the different probes
var colours_alternate_sort = ["DarkOrchid", "Orange", "DodgerBlue", "Blue", "BlueViolet", "Brown", "Deeppink", "BurlyWood", "CadetBlue",
    "Chartreuse", "Chocolate", "Coral", "CornflowerBlue", "Crimson", "Cyan", "Red", "DarkBlue",
    "DarkGoldenRod", "DarkGray", "Tomato", "Violet", "DarkGreen", "DarkKhaki", "DarkMagenta", "DarkOliveGreen", "DarkOrange", "DarkOrchid", "DarkRed", "DarkSalmon", "DarkSlateBlue", "DarkTurquoise",
    "DarkViolet", "DeepPink", "DeepSkyBlue", "DodgerBlue", "FireBrick", "ForestGreen", "Fuchsia",
    "Gold", "GoldenRod", "Green", "GreenYellow", "HotPink", "IndianRed", "Indigo"];

/**
 * Sets up the colours and respective groupings for the legend.
 * This is done for probes, line group, sample types -> essentially
 * any grouping which can appear on the legend
 */
setup_colours_for_group = function (array_group, new_array, number_of_colours, colours) {

    var count = 0;
    for (i = 0; i < array_group.length; i++) {
        if (count == number_of_colours) {
            count = 0;
        }
        new_array[array_group[i]] = colours[count];
        count++;
    }
    return new_array;
}
