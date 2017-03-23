---
---

// loader settings
var opts = {
    lines: 13
    , length: 28
    , width: 14
    , radius: 42
    , scale: 1
    , corners: 1
    , color: '#000'
    , opacity: 0.5
    , rotate: 0
    , direction: 1
    , speed: 1
    , trail: 60
    , fps: 20
    , zIndex: 2e9
    , className: 'spinner'
    , top: '50%'
    , left: '50%'
    , shadow: false
    , hwaccel: false
    , position: 'absolute'
}

var target = document.getElementById('viz-container');

// initial function while waiting for load
function init() {

    // trigger loader
    var spinner = new Spinner(opts).spin(target);

    // wait until load all
    queue()
	.defer(d3.json, "{{ site.siteurl }}/data/us.json")
	.defer(d3.tsv, "{{ site.siteurl }}/data/mapdata.tsv")
	.defer(d3.tsv, "{{ site.siteurl }}/data/countynames.tsv")
	.await(function(error, us, data, names) {
	    spinner.stop();
	    ready(us, data, names);
	});
}

// start the spinner, load data, kill spinner, load map
init();

// primary wrapper function
function ready(us, data, names) {

    var indicators = [["Any", "sn"],
		      ["Public 4-year", "s1"],
		      ["Public 2-year", "s4"],
		      ["Private 4-year", "s2"],
		      ["Private 2-year", "s5"],
		      ["Proprietary 4-year", "s3"],
		      ["Proprietary 2-year", "s6"]]
    , indicators_checked = "sn";

    var distance = [["All", "d"],
		    ["All 4-year", "d4"],
		    ["Public 4-year", "dp4"],
		    ["All 2-year", "d2"],
		    ["Public 2-year", "dp2"],
		    ["Proprietary","df"],
		    ["In-state 4-year", "d4s"],
		    ["In-state, public 4-year", "dp4s"],
		    ["In-state 2-year", "d2s"],
		    ["In-state, public 2-year", "dp2s"],
		    ["In-state, proprietary", "dfs"]]
    , distance_checked = "d";

    var df = indicators
    , initcheck = indicators_checked;

    // set up form
    var form = d3.select(".rbdiv")
	.append("form")
	.selectAll("div")
	.data(df)
	.enter()
	.append("div");


    // add buttons
    form.append("input")
	.attr({
	    type: "radio",
	    name: "radio",
	    class: "radio",
	    id: function(d) { return d[1]; },
	    value: function(d) { return d[1]; }

	})
	.property("checked", function(d) {
	    return d[1] == initcheck;
	});

    // add the labels
    form.append("label")
	.attr({
	    for: function(d) { return d[1]; }
	})
	.text(function(d) { return d[0]; });

    // init variables for first load
    var dataColumn = initcheck;

    // map dimensions
    var width = 800
    , height = 500;

    // set projection
    var projection = d3.geo.albers()
	.scale(1100)
	.translate([width / 2, height / 2]);

    // project paths
    var path = d3.geo.path()
	.projection(projection);

    // color function
    var colorILD = d3.scale.ordinal()
	.domain([0,1,2,3,4,5,6,7,8,9])
	.range(colorbrewer.RdBu[10]);

    // hash to associate names with counties for mouse-over
    var id_name_map = {};
    for (var i = 0; i < names.length; i++) {
	id_name_map[names[i].id] = names[i].name;
    }

    // init map svg
    var svg = d3.select("#map-container").append("svg")
	.attr("width", width)
	.attr("height", height);

    // function to draw map
    function drawMap(dataColumn) {

	// init mapping function for getting value by id
	var varById = d3.map();

	// is it a distance measure?
	var dcs = (dataColumn.slice(0,1) == 'd') ? true : false;

	// associate value with id
	data.forEach(function(d) {
	    varById.set(d.id, +d[dataColumn]);
	});

	// similar to above -- associate cost (values in selected
	// column, less last value) with id
	var id_val_map = {};
	for (var i = 0; i < names.length; i++) {
	    id_val_map[names[i].id] = +data[i][dataColumn];
	}

        // clear old so doesn't slow down (will just keep appending otherwise)
	svg.selectAll("g.counties").remove();
	svg.selectAll("g.states").remove();
	svg.selectAll("path").remove();

        // start building map: counties, tooltip, state outlines
	svg.append("g")
	    .attr("class", "counties")
	    .selectAll("path")
	    .data(topojson.feature(us, us.objects.counties).features)
	    .enter().append("path")
	    .style("fill", function(d) {
		val = varById.get(d.id);
		if ( dcs ) {
		    return colorILD(val);
		} else {
		    if (+val > 0) { return "rgb(227,74,51)" }
		    else {return "rgb(189,189,189)"}
		}
		;})
	    .attr("d", path)
	    .on("mousemove", function(d) {
		var html = "";

		html += "<div class=\"tooltip_kv\">";
		html += "<span class=\"tooltip_key\">";
		html += id_name_map[d.id] + ': ' + id_val_map[d.id];
		if ( dcs ) {
		    html += "0th %tile";
		} else {
		    if ( id_val_map[d.id] == 1 ) {
			html += " school ";
		    } else {
			html += " schools";
		    }
		}
		html += "</span>";
		html += "</div>";

		$("#tooltip").html(html);
		$(this).attr("stroke", "#000").attr("stroke-width", 2);
		$("#tooltip").show();
	    })
	    .on("mouseout", function() {
                $(this).attr("stroke", "");
                $("#tooltip").hide();
	    });

	svg.append("path")
	    .datum(topojson.mesh(us, us.objects.states, function(a, b) {
		return a !== b;
	    }))
	    .attr("class", "states")
	    .attr("d", path);
    }

    // draw map for first time
    drawMap(dataColumn);

    // if sample selector changes, redraw map
    d3.selectAll('input[name=radio]').on("change", function() {
	dataColumn = this.value;
	drawMap(dataColumn);
    });

    // if slider changes, then change buttons
    d3.select('input[name=switch]').on("change", function() {
	checked = d3.select("input[name=switch]").property("checked");
	if ( checked ) {
	    df = distance;
	    initcheck = distance_checked;
	} else {
	    df = indicators;
	    initcheck = indicators_checked;
	}

	// remove old
	d3.select(".rbdiv").select('form').remove();

	// redraw buttons
	form = d3.select(".rbdiv")
	    .append("form")
	    .selectAll("div")
	    .data(df)
	    .enter()
	    .append("div");

	// add buttons
	form.append("input")
	    .attr({
		type: "radio",
		name: "radio",
		class: "radio",
		id: function(d) { return d[1]; },
		value: function(d) { return d[1]; }
	    })
	    .property("checked", function(d) {
		return d[1] == initcheck;
	    });

	// add the labels
	form.append("label")
	    .attr({
		for: function(d) { return d[1]; }
	    })
	    .text(function(d) { return d[0]; });

	drawMap(initcheck);

	// reinitialize radio button event handler
	d3.selectAll('input[name=radio]').on("change", function() {
	    dataColumn = this.value;
	    drawMap(dataColumn);
	});

    });
}
