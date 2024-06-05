import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

let w = 600;
let h = 350;
let xpadding = 120;
let ypadding = 75;

let vizContainer = d3.select("#viz5");

let viz = vizContainer
  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 "+w+" "+h)
    // .attr("width", w)
    // .attr("height", h)
    // .style("background-color", "lavender")
;

function gotData(incomingData){  
  // Order of operation #1:
  // I fix the dates BEFORE restructuring the data.
  // the following function is defined below
  // it allows for us to NOT WORRY about parsing
  // time strings and creating JS date objects
  // in the following script
//   console.log(incomingData)
  let timeParse = d3.timeParse("%Y");
  incomingData = incomingData.map(function(d){
      return [
        {"year": timeParse(d.Year), "type": "revenue", "value": parseFloat(d.Revenue)},
        {"year": timeParse(d.Year), "type": "costs", "value": parseFloat(d.Costs)}
      ]
  }).flat()

  // console.log("incoming", incomingData);

  // Order of operation #2: 
  // I retrieve min and max of the data before restructuing the data

  // we can use a  time scale because our data expresses
  // years in the form of JS date objects
  let xDomain = d3.extent(incomingData, function(d){ return d.year });
  // while I am at it, I also build the scale and axis
  let xScale = d3.scaleTime().domain(xDomain).range([xpadding, w-xpadding]);
  let xAxis = d3.axisBottom(xScale)
    // .tickPadding(0); // Adjust the padding between ticks

  let xAxisGroup = viz.append("g")
      .attr("class", "xaxisgroup")
      .attr("transform", "translate(0,"+(h-ypadding)+")")
  ;
  xAxisGroup.call(xAxis);
  // same for the y dimension:

  let yMax = d3.max(incomingData, function(d){
    return d.value;
  })
  let yMin = d3.min(incomingData, function(d){
    return d.value;
  })

  let yDomain = [yMin, yMax]
  let yScale = d3.scaleLinear().domain(yDomain).range([h-ypadding, ypadding]);
  let yAxis = d3.axisLeft(yScale)
    // .tickPadding(2); // Adjust the padding between ticks

  let yAxisGroup = viz.append("g")
      .attr("class", "yaxisgroup")
      .attr("transform", "translate("+(xpadding/2+60)+",0)")
  ;
  yAxisGroup.call(yAxis);

  // Add x-axis label
  viz.append("text")
  .attr("class", "xAxisLabel")
  .attr("x", w / 2)
  .attr("y", h - 40) // Adjust the y-coordinate as needed
  .style("font-size", "12px") // Set the font size to 16 pixels
  .style("text-anchor", "middle")
  .text("Years");

  // Add y-axis label
  viz.append("text")
    .attr("class", "yAxisLabel")
    .attr("transform", "rotate(-90)")
    .attr("x", (-h / 2 - 15))
    .attr("y", 90) // Adjust the y-coordinate as needed
    .style("font-size", "12px") // Set the font size to 16 pixels
    .style("text-anchor", "middle")
    .text("Dollars (in billions USD)");

    viz.selectAll(".xaxisgroup text")
    .style("font-size", "8px");

    // Adjust the font size of y-axis tick labels
    viz.selectAll(".yaxisgroup text")
    .style("font-size", "8px");
  // Order of operation #3:
  // time to shape the data to fit my goal of drawing two lines:

  // group data by country:
//   console.log(incomingData)


  let groupedData = d3.groups(incomingData, function(d){
    return d.type
  })
  
  // flatten the data arrays:
  let groupedDataFLAT = groupedData.map(function(d){
    return d[1]
  })
//   console.log("gRRRRR", groupedDataFLAT)

  

  // d3.line() returns a function that produces
  // path element's d strings for us.
  let lineMaker = d3.line()
    .x(function(d, i){
      // this happens once for evey data point inside the array lineMaker deals with at a give time (once USA, once CHINA)
      return xScale(d.year);
    })
    .y(function(d, i){
      // same
      return yScale(d.value);
    })
  ;

  let graphGroup = viz.append("g").attr("class", "graphGroup");

  graphGroup.selectAll(".line").data(groupedDataFLAT).enter()
    .append("path")  // this happens twice, once for the whole USA array and once for the whole China array
      .attr("class", "line")
      .attr("d", lineMaker) // lineMaker received the USA array, then the China array
      .attr("fill", "none")
      .attr("stroke", function(d, i){
        // console.log(d[0].type)
        if(d[0].type == "revenue"){
          return "green"
        }else{
          return "red"
        }
      })
      .attr("stroke-width", 2.5)
  ;
}

d3.csv("datasets/financials.csv").then(gotData);

// import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// let w = 600;
// let h = 350;
// let xpadding = 120;
// let ypadding = 75;

// let vizContainer = d3.select("#viz5");

// let viz = vizContainer
//   .append("svg")
//   .attr("preserveAspectRatio", "xMinYMin meet")
//   .attr("viewBox", "0 0 "+w+" "+h)
//     // .attr("width", w)
//     // .attr("height", h)
//     // .style("background-color", "lavender")
// ;

// function gotData(incomingData){  
//   // Order of operation #1:
//   // I fix the dates BEFORE restructuring the data.
//   // the following function is defined below
//   // it allows for us to NOT WORRY about parsing
//   // time strings and creating JS date objects
//   // in the following script
// //   console.log(incomingData)
//   let timeParse = d3.timeParse("%Y");
//   incomingData = incomingData.map(function(d){
//       return [
//         {"year": timeParse(d.Year), "type": "revenue", "value": parseFloat(d.Revenue)},
//         {"year": timeParse(d.Year), "type": "costs", "value": parseFloat(d.Costs)}
//       ]
//   }).flat()

//   console.log("incoming", incomingData);

//   // Order of operation #2: 
//   // I retrieve min and max of the data before restructuing the data

//   // we can use a  time scale because our data expresses
//   // years in the form of JS date objects
//   let xDomain = d3.extent(incomingData, function(d){ return d.year });
//   // while I am at it, I also build the scale and axis
//   let xScale = d3.scaleTime().domain(xDomain).range([xpadding, w-xpadding]);
//   let xAxis = d3.axisBottom(xScale)
//     // .tickPadding(0); // Adjust the padding between ticks

//   let xAxisGroup = viz.append("g")
//       .attr("class", "xaxisgroup")
//       .attr("transform", "translate(0,"+(h-ypadding)+")")
//   ;
//   xAxisGroup.call(xAxis);
//   // same for the y dimension:

//   let yMax = d3.max(incomingData, function(d){
//     return d.value;
//   })
//   let yMin = d3.min(incomingData, function(d){
//     return d.value;
//   })

//   let yDomain = [yMin, yMax]
//   let yScale = d3.scaleLinear().domain(yDomain).range([h-ypadding, ypadding]);
//   let yAxis = d3.axisLeft(yScale)
//     // .tickPadding(2); // Adjust the padding between ticks

//   let yAxisGroup = viz.append("g")
//       .attr("class", "yaxisgroup")
//       .attr("transform", "translate("+(xpadding/2+60)+",0)")
//   ;
//   yAxisGroup.call(yAxis);

//   // Add x-axis label
//   viz.append("text")
//   .attr("class", "xAxisLabel")
//   .attr("x", w / 2)
//   .attr("y", h - 40) // Adjust the y-coordinate as needed
//   .style("font-size", "12px") // Set the font size to 16 pixels
//   .style("text-anchor", "middle")
//   .text("Years");

//   // Add y-axis label
//   viz.append("text")
//     .attr("class", "yAxisLabel")
//     .attr("transform", "rotate(-90)")
//     .attr("x", (-h / 2 - 15))
//     .attr("y", 90) // Adjust the y-coordinate as needed
//     .style("font-size", "12px") // Set the font size to 16 pixels
//     .style("text-anchor", "middle")
//     .text("Dollars (in billions USD)");

//     viz.selectAll(".xaxisgroup text")
//     .style("font-size", "8px");

//     // Adjust the font size of y-axis tick labels
//     viz.selectAll(".yaxisgroup text")
//     .style("font-size", "8px");
//   // Order of operation #3:
//   // time to shape the data to fit my goal of drawing two lines:

//   // group data by country:
// //   console.log(incomingData)


//   let groupedData = d3.groups(incomingData, function(d){
//     return d.type
//   })
  
//   // flatten the data arrays:
//   let groupedDataFLAT = groupedData.map(function(d){
//     return d[1]
//   })
// //   console.log("gRRRRR", groupedDataFLAT)

  

//   // d3.line() returns a function that produces
//   // path element's d strings for us.
//   let lineMaker = d3.line()
//     .x(function(d, i){
//       // this happens once for evey data point inside the array lineMaker deals with at a give time (once USA, once CHINA)
//       return xScale(d.year);
//     })
//     .y(function(d, i){
//       // same
//       return yScale(d.value);
//     })
//   ;

//   let graphGroup = viz.append("g").attr("class", "graphGroup");

//   function toggleLineVisibility(type) {
//     if(type == "revenue"){
//       console.log("draw green")
//   // Draw the first line
//       graphGroup.append("path")
//         .attr("class", "line")
//         .attr("d", lineMaker(groupedDataFLAT[0])) // Pass only the first array to lineMaker
//         .attr("fill", "none")
//         .attr("stroke", "green") // Set the stroke color directly for revenue
//         .attr("stroke-width", 2.5);
//     }else{
//       console.log("draw red")
//       graphGroup.append("path")
//       .attr("class", "line")
//       .attr("d", lineMaker(groupedDataFLAT[1])) // Pass only the second array to lineMaker
//       .attr("fill", "none")
//       .attr("stroke", "red") // Set the stroke color directly for costs
//       .attr("stroke-width", 2.5);
//     }

//       // const line = viz.select("." + type + "Line");
//       // const currentState = line.style("display");
//       // const newState = currentState === "none" ? "block" : "none";
//       // line.style("display", newState);
//   }

//   document.getElementById("viz5").addEventListener("DOMContentLoaded", function () {
//     // Add event listeners to the buttons
//     document.getElementById("revenueBtn").addEventListener("click", function () {
//       console.log("clicckkk")
//       toggleLineVisibility("revenue");
//     });

//     document.getElementById("costBtn").addEventListener("click", function () {
//         toggleLineVisibility("costs");
//     });
//   })
// }

// d3.csv("financials.csv").then(gotData);
