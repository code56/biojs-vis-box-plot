# biojs-vis-scatter-plot

[![NPM version](http://img.shields.io/npm/v/biojs-vis-rohart-msc-test.svg)](https://www.npmjs.org/package/biojs-vis-scatter-plot) 

> BioJS component to provide a scatter-plot graphing tool hosted in Stemformatics

## Getting Started
Install the module with: `npm install biojs-vis-scatter-plot`

for more details of the options, see the working example [here](http://biojs.io/d/biojs-vis-scatter-plot)  and the example code [here](https://github.com/ArianeMora/bio-js-scatter-plot/blob/master/examples/simple.js)


```javascript
var app = require('biojs-vis-scatter-plot');

var options = {
   background_colour: "white",
   background_stroke_colour:  "black",
   background_stroke_width:  "1px",
   circle_radius: {small: 2, large: 3.5},//3.5,  // for the scatter points
   colour: colours,
   data: data,
   domain_colours : ["#FFFFFF","#7f3f98"],
   error_bar_width:5,
   error_dividor:100,//100 means error bars will not show when error < 1% value 
   //the graph size can be set to small (to fit multiple grpahs to a page)
   graph_size: "",
   height: {small: 400, large: 1500},
   //horizontal lines takes a name, colour and the yvalue. If no colour is given one is chosen at random
   horizontal_lines: [["Detection Threshold", "green", 5], ["Median", , 8.93]],
   horizontal_line_value_column: 'value',
   //to have horizontal grid lines = width (to span accross the grid), otherwise = 0
   horizontal_grid_lines: 0,//width,
   legend_class: "legend",
   increment: number_of_increments,
   legend_range: [0,100],
   line_stroke_width: "2px",
   margin_legend: width - 10,//width - 190,
   margin: {top: 180, left:200, bottom: 530, right: 300},
   margin_small:{top: 40, left: 40, bottom: 40, right: 80},//default number of colours is 39 (before it `            reitterates over it again)
   number_of_colours: 39,
   probe_count: probe_count,
   probes: probes,
   //sample type order indicates whether or not the samplese need to be represented in a specific order
   //if no order is given then the order from the data set is taken
   sample_type_order:"none",// "DermalFibroblast, hONS",
   show_horizontal_line_labels: true,
   subtitle1: subtitle1,
   subtitle2: subtitle2,
   stroke_width:"1.5px",
   target: target,
   text_size:  {small: "12px", large: "20px"},
   title: title,
   title_class: "title",
   title_text_size: {small: "12px", large: "30px"},
   tip: tip,//second tip to just display the sample type
   tooltip: tooltip, // using d3-tips
   unique_id: "chip_id",
   watermark:"http://www1.stemformatics.org/img/logo.gif",
   width: {small: 500, large: width}, // suggest 50 per sample
   x_axis_text_angle:-45,
   x_axis_title: "Samples",
   x_column: 'Sample_ID',
   x_middle_title: {small: 200, large: 500},
   y_axis_title: "Log2 Expression",
   y_column: 'Expression_Value'
}


var instance = new app(options);
```

## Documentation

#### Running the instance for developing

Note: If you are running Ubuntu LTS 12.04 or 14.04 you will be behind in npm. To fix this, do the following:
```
sudo apt-get purge nodejs npm

curl -sL https://deb.nodesource.com/setup | sudo bash -

sudo apt-get install -y nodejs

sudo npm install -g watchify biojs-sniper

```

Once you have downloaded the code, you will need to ensure that you create a build directory in the root directory.

You can simply run the following command in the directory to see a website appear on [localhost:9090](http://localhost:9090)

```
npm run w
```

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
