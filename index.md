---
layout: page
custom_css:
- index
custom_js:
- d3.min
- topojson.v1.min
- queue.v1.min
- colorbrewer
- jquery.min
- d3-legend.min
- spin.min
- index.map
---

<div id="viz-container">
	<div id="map-container"></div>
	<div id="buttons-container">
		<div class="switch">
			<input type="checkbox" name="switch"
				class="switch-checkbox" id="myswitch">
			<label class="switch-label" for="myswitch">
				<span class="switch-inner"></span>
				<span class="switch-switch"></span>
			</label>
		</div>
		<div class="rbdiv"></div>
	</div>
	<div id="submap-container">
		<div id="tooltip-container">
			<div id="tooltip"></div>
		</div>
	</div>
</div>

<div class="posttext" markdown="1">

College opportunity can be measured in any number of ways. One common
measure of opportunity is the spatial availability of postsecondary
institutions. Simply stated: for a given area---let's say a
county---how many colleges are nearby? Even more simply: does this county
have a college? Much academic research and policy work uses these
count and indicator measures when trying to account for college
opportunity.

Yet these measures are not without their flaws. Indicator metrics
treat counties with one college the same as those with 10, 20, 30, or
more, effectively saying that being near one college is the same as
being near many. While count measures take the number of colleges into
account, they assume that the student college decision is bounded by
the county. These boundaries ignore migration/commuter zones and the
fact that county boundaries may not be salient for most students. 

Another measure, the inverse log distance to surrounding schools,
represents an attempt to more accurately measure college availability
in an area. Using the population-weighted centroid of each county[^1],
the straight-line ("as the crow flies" distance) is measured to each
college in the country[^2]. Taking the natural log of these
numbers and summing their inverses[^3], a measure is constructed for
each county. Higher numbers mean a higher density of schools; lower
numbers mean fewer schools.

The map above visualizes each of these measures for various samples
of colleges and universities. For the indicators, a county is shaded
if there are any schools within the sample in the county. Hovering
over the county with give the number of schools. Sliding the toggle
switch gives the distance measures. These too are computed for a
variety of school samples under one of two conditions. Either all
relevant schools are included in the measure or only those within the
same state.

##### Notes
[^1]: Provided by the U.S. Census.
[^2]: Using the [geosphere](https://cran.r-project.org/package=geosphere) package in [R](https://cran.r-project.org).  
[^3]: The distribution of college distances for each county is right
    skewed. By taking the natural log of these values, the
    distribution becomes more normal and the influence of extreme
    values is reduced. Summing the inverse of the values, rather than
    their level, produces a final measure that is positively (rather
    than negatively) correlated with the number of nearby schools.

</div>


