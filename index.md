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

### Indicators

A little over 40% of all counties have at least one postsecondary
institution[^4] within their borders. Here are the percentages for
each category:

* Any school: 43.9%
* Public 4-year: 14.9%
* Public 2-year: 23.1%
* Private 4-year: 11.1%
* Private 2-year: 2.8%
* Proprietary 4-year: 4.1%
* Proprietary 2-year: 7.1%

### Distance

The two cuts of distance measure---all sampled schools vs. only those
within the same state as the county---produce two distinct types of
map. 

##### "Move to Ohio" maps

For the measures that include out-of-state schools, a number of
"move to Ohio" maps are produced. While upon first glance it may seem
that the Old Northwest states have the highest density of colleges in
the country, these maps really measure the nationally-weighted
center. The large number of colleges in New England pull the college
density center away from the lower-48 geographic center. 

These maps are most interesting when visualizing how different
subsamples of schools move this center. While the subsample of only
public 4-year institutions pulls the center toward the New England
states, the subsample of public 2-years shifts it further south and
west, reflecting state systems found in those regions.

### Notes
[^1]: Provided by the U.S. Census.
[^2]: Using the [geosphere](https://cran.r-project.org/package=geosphere) package in [R](https://cran.r-project.org).  
[^3]: The distribution of college distances for each county is right
    skewed. By taking the natural log of these values, the
    distribution becomes more normal and the influence of extreme
    values is reduced. Summing the inverse of the values, rather than
    their level, produces a final measure that is positively (rather
    than negatively) correlated with the number of nearby schools.  
[^4]: Limited to Title IV participation institutions.

</div>


