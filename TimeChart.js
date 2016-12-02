// Various accessors that specify the four dimensions of data to visualize.
function y(d) { return d.hdi; }
function x(d) { return d.gdp; }
function radius(d) { return d.population; }
function color(d) { return d.name; }
function key(d) { return d.name; }
//var year = 0;
function updateData(year){
      getData(year);
  }
var BRICS = ["Brazil", "Russian Federation", "India", "China", "South Africa"];

// Chart dimensions.
var margin = {top: 19.5, right: 120.5, bottom: 19.5, left: 39.5},
    width = 1080 - margin.right,
    height = 500 - margin.top - margin.bottom;
// Various scales. These domains make assumptions of data, naturally.
var xScale = d3.scale.log().domain([1.5e10, 1e14]).range([0, width]),
    yScale = d3.scale.linear().domain([0.2, 1.1]).range([height, 0]),
    radiusScale = d3.scale.sqrt().domain([0, 5e8]).range([0, 40]),
    colorScale = d3.scale.category10();
// The x & y axes.
var xAxis = d3.svg.axis().orient("bottom").scale(xScale).tickSize(0).ticks(0),
    yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(12, d3.format(",d"));

// Create the SVG container and set the origin.
var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("class", "gRoot")

var tooltip = d3.select("body")      //will be adding to 'body'
            .append("div")	  //for formatting
            .attr("id", "tooltip")  //for styling
            .classed("hidden", "true");  //make hidden first

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
    .text("Gross Domestic Product (GDP in USD)");
// Add a y-axis label.
svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Human Development Index (HDI)");
// Add the year label; the value is set on transition.
var label = svg.append("text")
    .attr("class", "year label")
    .attr("text-anchor", "end")
    .attr("y", height - 24)
    .attr("x", width)
    .text(1970);
/* Add the country label; the value is set on transition.
var countrylabel = svg.append("text")
    .attr("class", "country label")
    .attr("text-anchor", "start")
    .attr("y", 80)
    .attr("x", 20)
    .text(" "); */

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
      .attr("data-legend",function(d) { return d.name})
      .style("fill", function(d) { return colorScale(color(d)); })
      .call(position);
  
  
        var legendRectSize = 18; // Size of legend rectangles
        var legendSpacing = 10;  // Spacing between legend spaces

        var legend = svg.selectAll('.legend') // Select legend property (none yet)
          .data(interpolateData(1970))  // Grab data
          .enter()    // enter into data
          .append('g')    // append onto g element
          .attr('class', 'legend')     // call the class legend
          .attr('transform', function(d, i) {    // placement of the legend
            var height = legendRectSize + legendSpacing;  // height = rectangle size + spaces
            var offset =  height * BRICS.length / 2 ;  // offset by the #of countries * height /2 (arbitrary)
            var horz = -2 * legendRectSize + 1000; // x coordinate (arbitrary)
            var vert = i * height - offset - 360;  // y coordinate (arbitrary)
            return 'translate(' + horz + ',' + vert + ')'; // translates legend to location
          });                                                     

        legend.append('rect') // Add colored recntangles 
          .attr('width', legendRectSize) // width of rectangle = size
          .attr('height', legendRectSize) // height of rectangle = size 
          .style('fill', function(d) { return colorScale(color(d)); }); // Set color of rectangle
          
        legend.append('text')   // add the text to the legend
          .attr('x', legendRectSize + legendSpacing)  // x coor of text is rectSize + spacing (aligned next to square)
          .attr('y', legendRectSize - legendSpacing)  // y coor of text is rectSize - spacing (aligned at same height)
          .text(function(d) { return d.name; });      // text is the name of the country 
  
  
  // Add a title and make it display country name on hover.
 /* dot.append("title")
      .text(function(d) { return d.name; }); */
  
   svg.selectAll(".text")    //select all nonexistent class text
        .data(interpolateData(1970))               //bind data
        .enter().append("text")   //add placeholders and append text there
        .attr("class","text")     //give class of text for styling/access
        .style("text-anchor", "middle")  //print so middle is placed at point
        //place at values below (center of circles)
        .attr("x", function(d) {return xScale(d.gdp);})
        .attr("y", function(d) {return yScale(d.hdi)+(0.7 * radiusScale(radius(d)) );})
        //print black
        .style("fill", "black")
        //add country's name as text for each one
        .text(function (d) {return d.name; });
  

  // Start a transition that interpolates the data based on year.
  svg.transition()
      .duration(30000)
      .ease("linear")
  // Positions the dots based on data.
  
  var commaFormat = d3.format(',');
  
  svg.selectAll("circle")
            //when the user hovers over a circle
            .on("mouseover", function(d){
                //getting position for where to place the tooltip
                //shift tooltip bottom right a bit for appearance
                var xPosition = parseFloat(d3.select(this).attr("cx")) + 120;
				var yPosition = parseFloat(d3.select(this).attr("cy")) + 100;

            
                //adding the text for the tooltip
                //using html lets us add line breaks (new line char)
                tooltip.html("<center>"+ d.name + "</center>" + 
                            "GDP " + "<span style='float:right;'>" + "$" + commaFormat(d.gdp/1000000000) + " Billion </span> <br>" +
                            "HDI " + "<span style='float:right;'>" + d.hdi + "</span> <br>" +
                            "Total Population " + "<span style='float:right;'>" + commaFormat(d.population/1000000) + " Million </span>")
                       //.transition()
                       //.duration(1000)
                       //position the tooltip using specified values
                       .style("left", xPosition + "px")		
                       .style("top", yPosition + "px");
                
                //select tooltip and make it visible
                d3.select("#tooltip").classed("hidden", false);
            })
        
            //when the user moves mouse off circle
            .on("mouseout", function(d) {
                //make the tooltip not visible
                d3.select("#tooltip").classed("hidden", true);	
            }); 


  //update position/size of circles and position of country labels
  function position(dot) {
    /* temporary storage for x and y positions */
    var tempX = [1,2,3,4,5];
    var tempY = [1,2,3,4,5];
      
    //update circles
    dot.attr("cx", function(d, i) { 
        //store x position of circle for label
        tempX[i] = xScale(x(d));
        //get x position
        return xScale(x(d)); })
       .attr("cy", function(d, i) {
        //store y position of circle for label
        tempY[i] = yScale(d.hdi)+(0.7 * radiusScale(radius(d)));
        //get y position
        return yScale(y(d)); })
       .attr("r", function(d) { return radiusScale(radius(d)); });
      
    //update position of text using stored x and y values
    svg.selectAll(".text")
       .attr("x", function(d, i) { return tempX[i]; })
       .attr("y", function(d, i) { return tempY[i]; });
  }
  
  // Interpolates the dataset for the given (fractional) year.
  function interpolateData(year) {
    return nations.map(function(d) { // maps data ot the nations
      return {
        name: d.Country, // country name = d.Coutnry
        hdi: getHDI(year, d.Country), // call getHDI to get the HDI for this year and country
        gdp: getGDP(year, d.Country), // call getGDP to get the GDP for this year and country
        // call getPopulation to get the population for this year and country
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
  // retrieves HDI for a country and a year
  function getHDI(year, country){
      var index = 0; // initialize index
      for(var i=0; i<5; i++){
          if(country === BRICS[i]){ // Check which index the country responds to
              index = i; // set the index
          }
      }
      return +nations[index][year]; // return the HDI for the country and year
  }
  // retrieves GDP for a country and year
  function getGDP(year, country){
      var index = 0; // initialize index
      for(var i=0; i<5; i++){ 
          if(country === BRICS[i]){ // Check which index the country responds to
              index = i; // set the index
          }
      }
      index+=5; // add 5 since GDP is in the range [5, 9]
      return +nations[index][year]; // return the population for the country and year
  }        
  // retrieves population for a country and year
  function getPopulation(year, country){
      var index = 0; // initialize index
      for(var i=0; i<5; i++){
          if(country === BRICS[i]){ // Check which index the country responds to
              index = i; // set the index
          }
      }
      index+=10; // add 10 since GDP is in the range [10, 14]
      return +nations[index][year]; // return the population for the country and year
  }  
  // Helper function to redraw circles for a given year
  getData = function(year){ 
      dot.data(interpolateData(year)) // send in the correct year data to the dot svg
           .call(position); // call position function to calculate new positions
      label.text(year); // change label text to current year
  }

});