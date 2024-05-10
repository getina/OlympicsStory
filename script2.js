import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

let w = 1000;
let h = 600;
let xPadding = 120;
let yPadding = 55;
let yearPadding = 10;

let vizContainer = d3.select("#viz2");

let viz = vizContainer
  .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 "+w+" "+h)
    // .style("background-color", "lavender")
;


function gotData(medalData, gdpData){
  // console.log(country)
  let timeParser = d3.timeParse("%Y")
  let recentCountries = medalData.filter(data => data.Year >= 1960)
  // console.log(recentCountries)
  // // let filteredGDP = gdpData.find(obj => obj["Country Code"] == "USA");

  
  let sumData = recentCountries.map(d => {
    return {
      year: parseInt(d.Year),
      medals: parseInt(d.Gold) + parseInt(d.Silver) + parseInt(d.Bronze),
      host: d.Host_city,
      country: d.Country_Name
    }
  })
  
  // console.log(gdpData)

  let addGDP = sumData.map(d => {
    let year = d.year;

    let foundDict = gdpData.find(dict => dict["Country Name"] === d.country);

    // console.log(foundDict)
    if (foundDict) {
      d.gdp = parseInt(foundDict[year])
      // d.year = timeParser(year)
      return d
    }
  })

  
  let finalData = addGDP.filter(d => d !== undefined && !isNaN(d.gdp))

  // console.log(finalData)
  // min max fertility rate (for xScale)
  let medalsExtent = d3.extent(finalData, function(d, i){
    return d.medals;
  });
  // console.log("medalsExtent", medalsExtent);

  // make the xscale which we use to locate points along the xaxis
  let xScale = d3.scaleLinear().domain(medalsExtent).range([xPadding, w-xPadding]);


  // min max life expectancy
  let gdpExtent = d3.extent(finalData, function(d, i){
    return d.gdp;
  });
  // console.log("gdpExtent", gdpExtent);

  // make the yscale which we use to locate points along the yaxis
  let yScale = d3.scaleLinear().domain(gdpExtent).range([h-yPadding, yPadding]);

  // using the function defined at the bottom of this script to build two axis
  buildXAndYAxis(xScale, yScale);


  // min max Population
  let popExtent = d3.extent(finalData, function(d, i){
    return d.pop;
  });
  // console.log("popExtent", popExtent);
  // you may use this scale to define a radius for the circles
  let rScale = d3.scaleLinear().domain(popExtent).range([5, 50]);




  // the simple output of this complicated bit of code,
  // is an array of all the years the data talks about.
  // the "dates" array looks like:
  // ["1962", "1963", "1964", "1965", ... , "2012", "2013", "2014", "2015"]
  let dates = finalData.reduce(function(acc,d,i){
    if(!acc.includes(d.year)){
      acc.push(d.year)
    }
    return acc
  }, [])

  let hosts = finalData.reduce(function(acc,d,i){
    if(!acc.includes(d.host)){
      acc.push(d.host)
    }
    return acc
  }, [])

  hosts.push("Tokyo")

  // this block of code is needed to select a subsection of the data (by year)
  let currentYearIndex = 0;
  let currentYear = dates[currentYearIndex];
  function filterYear(d, i){
    if(d.year == currentYear){
      return true;
    }else{
      return false;
    }
  }

  // make a group for all things visualization:
  let vizGroup = viz.append("g").attr("class", "vizGroup");

  let previousYearData = []; // Keep track of data from the previous year

  // this function is called every second.
  // inside it is a data variable that always carries the "latest" data of a new year
  // inside it we want to draw shapes and deal wirth both updating and entering element.
  function drawViz(){

    let currentYearData = finalData.filter(filterYear);
    
    // console.log("---\nthe currentYearData array now carries the data for year", currentYear);

    // Bind currentYearData to elements
    let datagroups = vizGroup.selectAll(".datagroup").data(currentYearData, d => d.country); // Use country as the key function

    // Take care of exiting elements (remove data points for countries not present in the current year)
    datagroups.exit().remove();

    // Below here is where your coding should take place! learn from lab 6:
    // https://github.com/leoneckert/critical-data-and-visualization-spring-2020/tree/master/labs/lab-6
    // the three steps in the comments below help you to know what to aim for here

    function getGroupPosition(d, i){
      let x = xScale(d.medals)
      let y = yScale(d.gdp)
      return "translate("+x+", "+y+")"
    }

    // take care of entering elements
    let enteringGroups = datagroups.enter()
      .append("g")
      .attr("class", "datagroup")
      .attr("transform", getGroupPosition)

    enteringGroups.append("circle")
      .attr("r", 10)
      .attr("fill", "black")

    enteringGroups.append("text")
      .text(function(d, i){
        return d.country
      })
      .attr("x", 15)
      .attr("y", 0)
      .attr("fill", "purple")
      .attr("font-family", "sans-serif")
      // .attr("font-size", "0.7cm")


    // take care of updating elements
    // datagroups.select("circle")
      
    // datagroups.attr("transform", getGroupPosition)
    datagroups.transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attr("transform", getGroupPosition)



  }




  // this puts the YEAR onto the visualization
  let year = viz.append("text")
      .text("")
      .attr("x", w-100)
      .attr("y", 50)
      .attr("font-family", "sans-serif")
      .attr("font-size", "2.2em")
      .attr("text-anchor", "end"); // Align the text to the end (right)


  ;

  setInterval(function(){
    currentYearIndex++;
    if(currentYearIndex>=dates.length){
      currentYearIndex = 0;
    }
    currentYear = dates[currentYearIndex];
    year.text(currentYear + " " + hosts[currentYearIndex])
    drawViz();
  }, 3000);
}


// load data
d3.csv("medals.csv").then(function(incomingDataMedals){
  d3.csv("gdp.csv").then(function(incomingDataGDP){
    gotData(incomingDataMedals, incomingDataGDP)
  })
});




// function to build x anc y axis.
// the only reasons these are down here is to make the code above look less polluted

function buildXAndYAxis(xScale, yScale){
  let xAxisGroup = viz.append("g").attr("class", 'xaxis');
  let xAxis = d3.axisBottom(xScale);
  xAxisGroup.call(xAxis)
  xAxisGroup.attr("transform", "translate(0, "+ (h-yPadding) +")")
  xAxisGroup.append("g").attr('class', 'xLabel')
    .attr("transform", "translate("+w/2+", 53)")
    .append("text")
    .attr("fill", "black")
    .text("Medals")
    .attr("font-family", "sans-serif")
    .attr("font-size", "2.3em")

  ;
  

//   // Add x-axis label
//   viz.append("text")
//     .attr("class", "xAxisLabel")
//     .attr("x", w / 2)
//     .attr("y", h - 50) // Adjust the y-coordinate as needed
//     .style("font-size", "15px") // Set the font size to 16 pixels
//     .style("text-anchor", "middle")
//     .text("Years");


  let yAxisGroup = viz.append("g").attr("class", 'yaxis');
  let yAxis = d3.axisLeft(yScale);
  
  yAxisGroup.call(yAxis)
  yAxisGroup.attr("transform", "translate("+xPadding+", 0)")

  yAxisGroup.append("g").attr('class', 'xLabel')
    .attr("transform", "translate(-90, "+ (h/2-75) +") rotate(-90)")
    .append("text")
    .attr("fill", "black")
    .text("GDP Per Capita")
    .attr("font-family", "sans-serif")
    .attr("font-size", "2.3em")
  ;

  yAxisGroup.selectAll("g.tick text")
  .style("font-size", "18px");

  xAxisGroup.selectAll("g.tick text")
  .style("font-size", "18px");

  viz.selectAll(".xaxis path")
  .style("stroke-width", "2px");

  viz.selectAll(".yaxis path")
  .style("stroke-width", "2px");
}
