// Various accessors that specify the four dimensions of data to visualize.
function x(d) { return d.hdi; }
function y(d) { return d.gdp; }
function radius(d) { return d.population; }
function color(d) { return d.name; }
function key(d) { return d.name; }
var BRICS = ["Brazil", "Russian Federation", "India", "China", "South Africa"];
// Chart dimensions.
var margin = {top: 19.5, right: 19.5, bottom: 19.5, left: 39.5},
    width = 960 - margin.right,
    height = 500 - margin.top - margin.bottom;
// Various scales. These domains make assumptions of data, naturally.
var xScale = d3.scale.linear().domain([0, 1]).range([0, width]),
    yScale = d3.scale.log().domain([1e9, 5e13]).range([height, 0]),
    radiusScale = d3.scale.sqrt().domain([0, 5e8]).range([0, 40]),
    colorScale = d3.scale.category10();
// The x & y axes.
var xAxis = d3.svg.axis().orient("bottom").scale(xScale).ticks(12, d3.format(",d")),
    yAxis = d3.svg.axis().scale(yScale).orient("left");
// Create the SVG container and set the origin.
var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("class", "gRoot")
// Add the x-axis.
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);
// Add the y-axis.
svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);
// Add an x-axis label.
svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height - 6)
    .text("income per capita, inflation-adjusted (dollars)");
// Add a y-axis label.
svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("life expectancy (years)");
// Add the year label; the value is set on transition.
var label = svg.append("text")
    .attr("class", "year label")
    .attr("text-anchor", "end")
    .attr("y", height - 24)
    .attr("x", width)
    .text(1800);
// Add the country label; the value is set on transition.
var countrylabel = svg.append("text")
    .attr("class", "country label")
    .attr("text-anchor", "start")
    .attr("y", 80)
    .attr("x", 20)
    .text(" ");
var first_time = true;
// Load the data.
d3.csv("BRICS_Household.csv", function(nations) {
  // A bisector since many nation's data is sparsely-defined.
  var bisect = d3.bisector(function(d) { return d[0]; });
  // Add a dot per nation. Initialize the data at 1800, and set the colors.
  var dot = svg.append("g")
      .attr("class", "dots")
    .selectAll(".dot")
      .data(interpolateData(1970))
    .enter().append("circle")
      .attr("class", "dot")
      .style("fill", function(d) { return colorScale(color(d)); })
      .call(position)
  // Add a title.
  dot.append("title")
      .text(function(d) { return d.name; });
  // Start a transition that interpolates the data based on year.
  svg.transition()
      .duration(30000)
      .ease("linear")
  // Positions the dots based on data.
  function position(dot) {
    dot.attr("cx", function(d) { 
        return xScale(x(d)); })
       .attr("cy", function(d) { return yScale(y(d)); })
       .attr("r", function(d) { return radiusScale(radius(d)); });
  }
  // Defines a sort order so that the smallest dots are drawn on top.
  function order(a, b) {
    return radius(b) - radius(a);
  }
  // Updates the display to show the specified year.
  function displayYear(year) {
    dot.data(interpolateData(year+dragit.time.min), key).call(position).sort(order);
    label.text(dragit.time.min + Math.round(year));
  }
  // Interpolates the dataset for the given (fractional) year.
  function interpolateData(year) {
    return nations.map(function(d) {
      return {
        name: d.Country,
        hdi: getHDI(year, d.Country),
        gdp: getGDP(year, d.Country),
        population: getPopulation(year, d.Country)
      };
    });
  }
  // Finds (and possibly interpolates) the value for the specified year.
  function interpolateValues(values, year) {
    var i = bisect.left(values, year, 0, values.length - 1),
        a = values[i];
    if (i > 0) {
      var b = values[i - 1],
          t = (year - a[0]) / (b[0] - a[0]);
      return a[1] * (1 - t) + b[1] * t;
    }
    return a[1];
  }
  
  function getHDI(year, country){
      var index = 0;
      for(var i=0; i<5; i++){
          if(country === BRICS[i]){
              index = i;
          }
      }
      console.log(country + " " + nations[index][year]);
      return +nations[index][year];
  }
    
  function getGDP(year, country){
      var index = 0;
      for(var i=0; i<5; i++){
          if(country === BRICS[i]){
              index = i;
          }
      }
      index+=5;
      return +nations[index][year];
  }        

  function getPopulation(year, country){
      var index = 0;
      for(var i=0; i<5; i++){
          if(country === BRICS[i]){
              index = i;
          }
      }
      index+=10;
      return +nations[index][year];
  }        
    /*
  init();
  function update(v, duration) {
    dragit.time.current = v || dragit.time.current;
    displayYear(dragit.time.current)
    d3.select("#slider-time").property("value", dragit.time.current);
  }
  function init() {
    dragit.init(".gRoot");
    dragit.time = {min:1800, max:2009, step:1, current:1800}
    dragit.data = d3.range(nations.length).map(function() { return Array(); })
    for(var yy = 1800; yy<2009; yy++) {
      interpolateData(yy).filter(function(d, i) { 
        dragit.data[i][yy-dragit.time.min] = [xScale(x(d)), yScale(y(d))];
      })
    }
    dragit.evt.register("update", update);
    //d3.select("#slider-time").property("value", dragit.time.current);
    d3.select("#slider-time")
      .on("mousemove", function() { 
        update(parseInt(this.value), 0);
        //clear_demo();
      })
    var end_effect = function() {
      countrylabel.text("");
      dot.style("opacity", 1)
    }
    dragit.evt.register("dragend", end_effect)
  };
    */

});