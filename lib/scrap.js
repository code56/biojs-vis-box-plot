  var legend_btn = document.createElement("input");
        legend_btn.type = "button";
        legend_btn.id = "legend_btn";
        legend_btn.className = "btn";
        legend_btn.style.fontSize = options.text_size;
        legend_btn.style.fontFamily = options.font_style;
        legend_btn.value = "Legend";
        legend_btn.innerHTML = "Legend";
        legend_btn.setAttribute('content', 'test content');
        legend_btn.onclick = function() {

    var div = document.getElementById('table');
        if (div.style.display !== 'none') {
            div.style.display = 'none';
        }
        else {
            div.style.display = 'block';
        }
    };

    //Create the legend as a table in a separate div so that it can be togeled on an off
    //and grow dynamically.
    probe_number = 0;
    colour_count = 0;
    for (var i = 0; i < options.probe_count + 2; i++) {
        row = table.insertRow(-1);
        if(i== 500){
            break;
        }
        colour_count++;
        for (var j = 0; j < (2*columnCount); j++) {
            var cell = row.insertCell(-1);
            if(j%2 == 0){
                if(probe_number + 1 <= options.probe_count){
                    colour_count++;
                    if(colour_count == 0){
                        colour_count = 0;
                    }
                    //to display the colour of each probe a button is created
                    //this can later be used to toggle the scatter_line
                    btn = document.createElement('input');
                    btn.type = "button";
                    btn.className = "btn";
                    btn.id = options.probes[probe_number][0];
                    btn.style.background = options.probes[probe_number][1];
                    // When the probe button is clicked we want to display the scatter line
                    btn.onclick = function() {
                        var probe = (this.id);
                        //Gets the elements by probe and assigns colour to the line (this is started off hidden)
                        var probe_group = document.getElementsByClassName("line-probe-" + probe.replace(/\ |(|)/g,''));
                        for (i = 0; i < probe_group.length; i++) {
                            if(probe_group[i].style.opacity != 0) {
                                d3.select(probe_group[i]).style("opacity", 0);
                            } else {
                                d3.select(probe_group[i]).style("opacity", 1);
                            }
                        }
                    }; //end on_click button
                    cell.appendChild(btn);
                } else { //have added all the probes
                    break;
                }
            } else {
                if(probe_number >= options.probe_count){
                    break;
                }
                //writes the probe name to the cell
                cell.innerHTML = options.probes[probe_number][0];
                cell.style.fontSize = options.text_size;
                cell.style.fontFamily = options.font_style;
                probe_number++;
            }
        }
     }
    //creiates the div to a


    var legend = svg.append('legend')
                .attr("class","legend")
                .attr("transform","translate(50,30)")
                .attr("height", 100)
                .attr("width", 100)
                .style("font-size","12px")
                .call(d3.legend);

            legend.selectAll('rect')
                .data(dataset)
                .enter()
                .append("rect")
                .attr("x", w - 65)
                .attr("y", function(d, i){ return i *  20;})
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", function(d) {
                var color = color_hash[dataset.indexOf(d)][1];
                return color;
              })

            legend.selectAll('text')
                .data(dataset)
                .enter()
                .append("text")
                .attr("x", w - 52)
                .attr("y", function(d, i){ return i *  20 + 9;})
                .text(function(d) {
                        var text = color_hash[dataset.indexOf(d)][0];
                        return text;
                });
    //creates the div to append to the svg element and put the table in
    var div = document.createElement("div");
            div.id = "div";
            div.style.position = "absolute";
            div.style.color = "white";
            div.style.left = page_options.width + options.x_axis_label_padding + page_options.margin.left;
            div.style.top = page_options.margin.top;
            div.appendChild(legend_btn); //add the legend button above
            div.appendChild(table);

        document.body.appendChild(div);

<F5>
