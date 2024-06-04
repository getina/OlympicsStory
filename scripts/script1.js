import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

let w = 550;
let h = 450;
// let xPadding = 40;
// let yPadding = 50;
let yearPadding = 10;

let vizContainer = d3.select("#viz1");

// console.log(document.querySelector("#viz1"))

let viz = vizContainer
  .append("svg")
    // .attr("width", w)
    // .attr("height", h)
    // .style("background-color", "#faf0e6")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 "+w+" "+h)
;


function gotData(medalData, gdpData, countryName){
  // console.log(country)
  let timeParser = d3.timeParse("%Y")
  let filteredMedals = medalData.filter(data => data.Country_Name.toUpperCase() == countryName.toUpperCase())
  // let filteredGDP = gdpData.find(obj => obj["Country Code"] == "USA");

  let finalData = filteredMedals.map(d => {
    return {
      medals: parseInt(d.Gold) + parseInt(d.Silver) + parseInt(d.Bronze),
      year: timeParser(d.Year),
      country: countryName
    }
  })

  // console.log(finalData)

  // x scale 
  function getYear(d, i){
    return d.year
  }

  let minYear = d3.min(finalData, getYear)
  let maxYear = d3.max(finalData, getYear)
  let xScale = d3.scaleTime().domain([minYear, maxYear]).range([40, w-40])

  // y scale
  function getMedals(d, i){
    return d.medals;
  }
  
  let maxMedals = d3.max(finalData, getMedals)
  // let medalsExtent = d3.extent('0finalData, getMedals);
  let yScale = d3.scaleLinear().domain([0,maxMedals]).range([h-100, 100]);
  
  // axis 
  let xAxisGroup = viz.append("g").attr("class", "xAxisGroup")
  let xAxis = d3.axisBottom(xScale)
  xAxisGroup.call(xAxis)
    .selectAll("text")
    .style("fill", "black"); // Set x-axis label color to black
  xAxisGroup.attr("transform", "translate(10," + (h-90) + ")")
  xAxisGroup.selectAll("path, line")
    .style("stroke", "black"); // Set x-axis line color to black

  let yAxisGroup = viz.append("g").attr("class", "yAxisGroup")
  let yAxis = d3.axisLeft(yScale)
  yAxisGroup.call(yAxis)
    .selectAll("text")
    .style("fill", "black"); // Set x-axis label color to black
  yAxisGroup.attr("transform", "translate(50,7)")
  yAxisGroup.selectAll("path, line")
    .style("stroke", "black"); // Set x-axis line color to black

  // Add x-axis label
  viz.append("text")
    .attr("class", "xAxisLabel")
    .attr("x", w / 2)
    .attr("y", h - 50) // Adjust the y-coordinate as needed
    .style("font-size", "15px") // Set the font size to 16 pixels
    .style("text-anchor", "middle")
    .text("Years");

  // Add y-axis label
  viz.append("text")
    .attr("class", "yAxisLabel")
    .attr("transform", "rotate(-90)")
    .attr("x", -h / 2)
    .attr("y", 15) // Adjust the y-coordinate as needed
    .style("font-size", "15px") // Set the font size to 16 pixels
    .style("text-anchor", "middle")
    .text("Medals");

  // visualization 
  let vizGroup = viz.append("g").attr("class", "vizGroup")
  let datagroups = vizGroup.selectAll(".datagroup").data(finalData).enter()
    .append("g")
      .attr("class", "datagroup")
  ;

  let tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("z-index", 9999)
    .style("background-color", "rgba(255, 255, 255, 0.9)") // Change the background color to a translucent white
    .style("border", "1px solid black") // Add a border
    .style("padding", "5px") // Add padding for better readability
    .style("border-radius", "5px") // Add border radius for rounded corners

  // console.log(tooltip)


  datagroups.append("circle")
    // .attr("cx", getLocation)
    .attr("cx", 0) 
    .attr("cy", 0) 
    .attr("r", 4)

  
    .on("mouseover", function(event, d) {
      d3.select(this).attr("fill", "red"); // Change the fill color to red when hovering over
      tooltip
          .style("opacity", .9)
          .style("left", event.pageX + "px") // Adjust the offset as needed
          .style("top", event.pageY + 20 + "px"); // Adjust the offset as needed
  
      tooltip.html("Year: " + d.year.getFullYear() + "<br/>" + "Medals: " + d.medals);
    })

    .on("mouseout", function() {
      d3.select(this).attr("fill", "black"); // Change the fill color back to blue when mouse moves out
      tooltip.transition()
          .duration(500) // Duration of the transition in milliseconds
          .style("opacity", 0)
    });


  // let groupedData = [finalData]
  

  // console.log(groupedData)

  let nestedData = d3.group(finalData, d => d.countryName);
  let graphGroup = viz.append("g").attr("class", "graphGroup");
  
  let lineMaker = d3.line()
    .x(function(d, i){
      // this happens once for evey data point inside the array lineMaker deals with at a give time (once USA, once CHINA)
      return xScale(d.year) + yearPadding;
    })
    .y(function(d, i){
      // same
      return yScale(d.medals);
    })


  graphGroup.selectAll(".line").data(nestedData).enter()
    .append("path")  // this happens twice, once for the whole USA array and once for the whole China array
      .attr("class", "line")
      .attr("d", function(d) {
        return lineMaker(d[1]); // d[1] contains the array of data points for each country
      })
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 3)
  ;

  function getGroupPosition(d, i){
    let x = xScale(d.year) + yearPadding
    let y = yScale(d.medals)
    return "translate("+x+", "+y+")"
  }

  datagroups.attr("transform", getGroupPosition)

  let yearText = viz.append("text")
    .text(countryName)
    .attr("x", w-10)
    .attr("y", 60)
    .attr("font-family", "sans-serif")
    .attr("font-size", "1.2em")
    .attr("text-anchor", "end"); // Align the text to the end (right)
}


function renderGraph(countryName) {
  d3.csv("../datasets/medals.csv").then(function(incomingDataMedals){
    d3.csv("../datasets/gdp.csv").then(function(incomingDataGDP){
      viz.selectAll("*").remove();
      gotData(incomingDataMedals, incomingDataGDP, countryName);

    });
  });
}

let countries = "";

let sideView = d3.select("#sideView")
  .style("overflow-y", "scroll")
  // .style("height", "800px")
  ;

d3.csv("../datasets/medals.csv").then(function(incomingDataMedals){
  // d3.csv("gdp.csv").then(function(incomingDataGDP){
    // console.log("name:", countryName)
  let countrySet = new Set(incomingDataMedals.map(d => d.Country_Name));
  countries = Array.from(countrySet);
  countries.sort();
  
  renderGraph("United States");

  // Populate the sideView with text elements for different countries
  sideView.selectAll("div")
    .data(countries)
    .enter()
    .append("div")
    .text(function(country) { return country; })
    .style("cursor", "pointer")
    .on("click", function() {
      var countryName = d3.select(this).text();
      renderGraph(countryName); // Render the graph for the selected country
    });
});