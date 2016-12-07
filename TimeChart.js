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
    colorScale = d3.scale.ordinal()
    .domain(BRICS)
    .range(["#98FB98", "#CD5C5C", "#FFB732", "#C0C0C0", "#BDB76B"]);

//format number to display commas
var commaFormat = d3.format(',');

// The x & y axes.
var xAxis = d3.svg.axis().orient("bottom").scale(xScale).tickSize(0).ticks(0)
                         .tickValues([1e11, 1e12,1e13,1e14]).tickFormat(function(d){return commaFormat(d/1000000000)}),
    yAxis = d3.svg.axis().scale(yScale).orient("left").tickValues([0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0]);

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

// make grid lines for x axis
function make_x_axis() {
    return d3.svg.axis()
        .scale(xScale)
        .orient("bottom")   //same as x axis
        .tickValues([1e11, 1e12,1e13,1e14])        //add ticks to be grids
}

var small = 0;

// make grid lines for y axis
function make_y_axis() {
  var range = [0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0];
  console.log(small);
  if(small==0)
      range = [0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0];
  else if(small==1)
      range = [40,50,60,70,80,90];
  else if(small==2) 
      range = [20,30,40,50,60,70,80,90,100];
  else
      range = [1e11, 1e12,1e13,1e14];
  return d3.svg.axis()
      .scale(yScale)
      .orient("left")   //same as regular axis
      .tickValues(range);       //add ticks to be grid
}

drawHDI();

//function to redraw time chart with HDI as y axis
function drawHDI(){
    //clear graph
    svg.selectAll("*").remove();
    small = 0;
    //redefine y scale for HDI
    yScale = d3.scale.linear().domain([0.2, 1.1]).range([height, 0]);
    yAxis = d3.svg.axis().scale(yScale).orient("left").tickValues([0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0]);
    //reload data to redraw graph
    loadData("BRICS_HDI.csv", "Human Development Index (HDI)", "HDI", 1,"", "");
    //move slider to starting position
    document.getElementById("slider-time").value = "1970";
}

//function to redraw time chart with life expectancy as y axis
function drawLE(){
    //clear graph
    svg.selectAll("*").remove();
    small = 1;
    //redefine y scale for life expectancy
    yScale = d3.scale.linear().domain([40, 90]).range([height, 0]);
    yAxis = d3.svg.axis().scale(yScale).orient("left").tickValues([40,50,60,70,80,90]);
    //reload data and redraw graph
    loadData("BRICS_LE.csv", "Life Expectancy at Birth (Total)", "Life Expectancy", 1,"","");
    //move slider to starting position
    document.getElementById("slider-time").value = "1970";
}

//function to redraw time chart with education as y axis
function drawEdu(){
    //clear graph
    svg.selectAll("*").remove();
    small = 2;
    //redefine y scale for education
    yScale = d3.scale.linear().domain([20, 110]).range([height, 0]);
    yAxis = d3.svg.axis().scale(yScale).orient("left").tickValues([20,30,40,50,60,70,80,90,100]);
    //reload data and redraw graph
    loadData("BRICS_EDU.csv", "% of Population receiving Education", "Education",1, "","");
    //move slider to starting position
    document.getElementById("slider-time").value = "1970";
}

//function to draw time chart with GNI as y axis
function drawHouse(){
    //clear graph
    svg.selectAll("*").remove();
    small = 3;
    //redefine y scale for education
    yScale = d3.scale.log().domain([9000000000, 12500000000000]).range([height, 0]);
    yAxis = d3.svg.axis().scale(yScale).orient("left").tickValues([1e11, 1e12,1e13,1e14]).tickFormat(function(d){return commaFormat(d/1000000000)});
    //reload data and redraw graph
    loadData("BRICS_HOUSEHOLD.csv", "Total Household Consumption (Billions of $USD)", "Consumption", 1000000000, "$", " Billion");
    //move slider to starting position
    document.getElementById("slider-time").value = "1970";
    //alert("Almost done!");
}

function loadData(file, yLabel ,yVar, formatNum, unit1, unit2){
// Load the data.
d3.csv(file, function(nations) {
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
      .style("fill", function(d) { 
          return colorScale(color(d)); })
      .style("opacity", 0.5)
      .call(position);
  
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
    .text("Gross Domestic Product (Billions of $USD)");
// Add a y-axis label.
  svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text(yLabel);
// Add the year label; the value is set on transition.
   var label = svg.append("text")
    .attr("class", "year label")
    .attr("text-anchor", "end")
    .attr("y", height - 24)
    .attr("x", width)
    .text(1970);
    
    
     //adding the gridlines going from x axis
  svg.append("g")
      //give it grid class to add css styles
      .attr("class", "grid")
      //bring it down to where x axis is
      .attr("transform", "translate(0," + height + ")")
      //make the gridlines for x axis as above
      .call(make_x_axis()
             //set ticksize of major to height of chart
             //minor ticks and end ticks get height of 0
             .tickSize(-height, 0, 0)
             //get rid of dupicate tick label, have them from axis
             .tickFormat("")
           );
      
  //adding the gridlines going from y axis
  svg.append("g")
      //for css styles
      .attr("class", "grid")
      //make gridlines for y axis as above
      .call(make_y_axis()
             //set ticksize of major to width of chart
             //minor ticks and end ticks get width of 0
             .tickSize(-width, 0, 0)
             //get rid of dupicate tick label, have them from axis
             .tickFormat("")
            );
  
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
    var vert = i * height - offset - 220;  // y coordinate (arbitrary)
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
  
  svg.selectAll("circle")
            //when the user hovers over a circle
            .on("mouseover", function(d){
                //getting position for where to place the tooltip
                //shift tooltip bottom right a bit for appearance
                var xPosition = parseFloat(d3.select(this).attr("cx")) + 120;
				var yPosition = parseFloat(d3.select(this).attr("cy")) + 100;

            
                //adding the text for the tooltip
                //using html lets us add line breaks (new line char)
                tooltip.html("<b><center>"+ d.name + "</center> </b>" + 
                            "GDP " + "<span style='float:right;'>" + "$" + commaFormat(d.gdp/1000000000) + " Billion </span> <br>" +
                            yVar + "<span style='float:right;'>" + unit1+commaFormat(d.hdi/formatNum) + unit2 +"</span> <br>" +
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
      return Math.round(+nations[index][year] *100) /100; // return the HDI for the country and year
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
}