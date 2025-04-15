import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

let w = 900;
let h = 600;
    
let vizContainer = d3.select("#viz3");

let viz = vizContainer
  .append("svg")
    .attr("class", "viz")
    // .attr("width", w)
    // .attr("height", h)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 "+w+" "+h)
    // .style("background-color", "lavender")
;

function getX(d){
  return Math.random() * (w - 100) + 50
}

function getY(d){
  return Math.random() * (h - 100) + 50
}


function gotData(medalData){
  // console.log("this is the medalData", medalData)
  let vizGroup = viz.append("g").attr("class", "vizGroup");
  medalData = medalData.map(d => {
    return {country: d.Country, weight: parseFloat(d.Gold), x:getX(d), y:getY(d)}
  })

  // console.log(medalData)


  // min max Population
  let weightExtent = d3.extent(medalData, function(d, i){
    return d.weight;
  });

  // you may use this scale to define a radius for the circles
  let rScale = d3.scaleLinear().domain(weightExtent).range([5, 120]);


  let datagroups = vizGroup.selectAll(".datagroup").data(medalData).enter().append("g")
    .attr("class", "datagroup")
    .attr("transform", d => `translate(${d.x},${d.y})`)
    .style("opacity", 1);

  datagroups.append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", function(d){
      return rScale(d.weight);
    })
    .attr("fill", "white")
    .attr("stroke", "black");

  datagroups.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", ".35em")
    .attr("fill", "black")
    .attr("font-size", "15px")
    .text(d => {
      const circleRadius = rScale(d.weight);
      if (circleRadius < 30) {
          return "";
      } else {
        return d.country;
      }
    });

  let tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("z-index", 9999)
    .style("background-color", "lightgrey") // Change the background color to a translucent white
    .style("border", "1px solid black") // Add a border
    .style("padding", "5px") // Add padding for better readability
    .style("border-radius", "5px") // Add border radius for rounded corners

  datagroups.selectAll("circle, text")
    .on("mouseover", function(event, d) {
      let circle = d3.select(this.parentNode).select("circle");
      circle.attr("fill", "#fffdaf");
      // d3.select(this).attr("fill", "#fffdaf"); // Change the fill color to yellow when hovering over
      tooltip
          .transition()
          .duration(200)
          .style("opacity", .9)
          .style("left", event.pageX + "px")
          .style("top", event.pageY + 20 + "px");
      tooltip.html("Country: " + d.country + "<br/>" + "Weight: " + d.weight);
    })
    .on("mouseout", function() {
      let circle = d3.select(this.parentNode).select("circle");
      circle.attr("fill", "white");
      // d3.select(this).attr("fill", "white"); // Change the fill color back to white when mouse moves out
      tooltip.transition()
          .duration(500)
          .style("opacity", 0);
    });

  // console.log(datagroups)


  const simulation = d3.forceSimulation(medalData)
    .force("charge", d3.forceManyBody().strength(0.001))
    .force("x", d3.forceX(w/2).strength(0.015)) // Attract circles towards the horizontal center
    .force("y", d3.forceY(h/2).strength(0.015)) // Attract circles towards the vertical center
    .force("collide", d3.forceCollide().radius(d => rScale(d.weight) + 2).strength(1)) // Adjust radius based on circle size
    .on("tick", ticked)
  //   .on("end", () => {
  //     // Call a function to display the visualization after the simulation ends
  //     displayCircles();
  //   });

  // function displayCircles() {
  //   // Show the visualization on the screen
  //   // This could include any additional steps or animations you want
  //   datagroups.transition().duration(500).style("opacity", 1);
  // }

  function ticked() {
    datagroups.attr("transform", d => `translate(${d.x},${d.y})`);
  }

  // function rerun(){
  //   d3.csv("medalsPerCapita.csv").then(gotData)
  // }
}

function hide() {
  viz.selectAll(".vizGroup").selectAll("*").remove();

  // viz.selectAll("circle")
  //   .transition()
  //   .duration(100) // Duration of the transition in milliseconds
  //   .attr("fill", "transparent")
  //   .attr("stroke", "transparent");

  // // Select all text elements and remove them with a smooth transition
  // viz.selectAll("text")
  //   .transition()
  //   .duration(500) // Duration of the transition in milliseconds
  //   .style("opacity", 0)
  //   .remove();
}

document.getElementById("BahamasString").addEventListener("click", function(){
  d3.selectAll("#viz3 .datagroup circle") // Select all circles
    .transition() // Apply transition
    .duration(300) // Set transition duration
    .attr("fill", "white") // Change fill color to white

  d3.selectAll("#viz3 .datagroup") // Select all circles
    .filter(d => d.country === "Bahamas") // Filter to select only circles associated with the United States
    .select("circle") // Select the circles
    .transition() // Apply transition
    .delay(300) // Delay the transition to ensure it occurs after the reset
    .duration(300) // Set transition duration
    .attr("fill", "#fffdaf"); // Change the fill color to yellow
})

document.getElementById("USString").addEventListener("click", function(){
  d3.selectAll("#viz3 .datagroup circle") // Select all circles
    .transition() // Apply transition
    .duration(300) // Set transition duration
    .attr("fill", "white") // Change fill color to white

  d3.selectAll("#viz3 .datagroup") // Select all circles
    .filter(d => d.country === "United States") // Filter to select only circles associated with the United States
    .select("circle") // Select the circles
    .transition() // Apply transition
    .delay(300) // Delay the transition to ensure it occurs after the reset
    .duration(300) // Set transition duration
    .attr("fill", "#fffdaf"); // Change the fill color to yellow
})

let existing = true;

enterView({
  selector: '.graphBox3',
  enter: function(el) {
    // console.log("this is supposed to hapen")
    d3.csv("datasets/medalsPerCapita.csv").then(gotData)
    // exisiting = true
  },
  exit: function(el) {
    hide()
    // exisiting = false
  },
  offset: 0.2, // enter at bottom of viewport
});

enterView({
  selector: '#viz3-nextparagraph',
  enter: function(el) {
    hide()
  },
  exit: function(el) {
    // console.log("this is nOT")
    d3.csv("datasets/medalsPerCapita.csv").then(gotData)
  },
  offset: 1, // enter at bottom of viewport
});

// d3.csv("medalsPerCapita.csv").then(gotData)


