/**
 * http://wpandsuch.com/posts/css-popup/css-popup.html#
 * @param {type} div_id
 * @returns {undefined}
 */
//Keeps track o0f how many graphs are in the div
var numElements;
function toggle(div_id) {
        var scale = 1;
        numElements ++;
        var size = 800;
	var el = document.getElementById(div_id);
        el.setAttribute("height", size * numElements);
	if ( el.style.display == 'none' ) {
            el.style.display = 'block';
            var svgid = lastClickedGraph;
            var graphdiv = document.getElementById(lastClickedGraph);
            graphdiv.setAttribute("width", "800px");
            var svgdiv = d3.select("#" + lastClickedGraph + "-svg")
                    .attr("width", size)
                    .attr("height", size);
            var groupdiv = d3.select("#" + lastClickedGraph + "-group")
                .attr("transform", "translate(" + 100 + "," + 100 + ")" + " scale(" + 1 + "," + 1 + ")")
            el.appendChild(graphdiv);
            
            
        }
	else {
            //var olddiv = document.getElementById(lastClickedGraph);
            //olddiv.setInnerHTML(el.innerHTML);
            el.innerHTML = "";
            el.style.display = 'none';
        }
}

function blanket_size(popUpDivVar) {
	if (typeof window.innerWidth != 'undefined') {
		viewportheight = window.innerHeight/2;
	} else {
		viewportheight = document.documentElement.clientHeight/2;
	}
	if ((viewportheight > document.body.parentNode.scrollHeight) && (viewportheight > document.body.parentNode.clientHeight)) {
		blanket_height = viewportheight;
	} else {
		if (document.body.parentNode.clientHeight > document.body.parentNode.scrollHeight) {
			blanket_height = document.body.parentNode.clientHeight;
		} else {
			blanket_height = document.body.parentNode.scrollHeight;
		}
	}
	var blanket = document.getElementById('blanket');
	blanket.style.height = blanket_height + 'px';
	var popUpDiv = document.getElementById(popUpDivVar);
	popUpDiv_height=blanket_height/2-400;//200 is half popup's height
	popUpDiv.style.top = popUpDiv_height/3 + 'px';
}
function window_pos(popUpDivVar) {
	if (typeof window.innerWidth != 'undefined') {
		viewportwidth = window.innerHeight;
	} else {
		viewportwidth = document.documentElement.clientHeight;
	}
	if ((viewportwidth > document.body.parentNode.scrollWidth) && (viewportwidth > document.body.parentNode.clientWidth)) {
		window_width = viewportwidth;
	} else {
		if (document.body.parentNode.clientWidth > document.body.parentNode.scrollWidth) {
			window_width = document.body.parentNode.clientWidth;
		} else {
			window_width = document.body.parentNode.scrollWidth;
		}
	}
	var popUpDiv = document.getElementById(popUpDivVar);
	window_width=window_width/2-400;//200 is half popup's width
	popUpDiv.style.left = window_width + 'px';
}

function popup(windowname) {
	blanket_size(windowname);
	window_pos(windowname);
	toggle('blanket');
	toggle(windowname);		
}
