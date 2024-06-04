import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

let w = 1200;
let h = 650;

let vizContainer = d3.select("#viz4");

let viz = vizContainer
  .append("svg")
    .attr("class", "viz")
    // .attr("width", w)
    // .attr("height", h)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 "+w+" "+h)
    // .style("background-color", "lavender")
;

function gotData(geoData, profitData){
  // make dictionary with labelx and labely -- map
  let dict = geoData.features.map(d => {
    let name = d.properties.admin
    let x = d.properties.label_x
    let y = d.properties.label_y
    let dictEntry = {}

    dictEntry[name] = { 
      lonLabelX: x,
      lonLabelY: y 
    }

    return dictEntry
  })

  // console.log(dict)

  let finalData = profitData.map(d => {
    let dictWithKeyX = dict.find(obj => d.Country in obj);
    
    if (dictWithKeyX !== undefined) {
      d.label_x = dictWithKeyX[d.Country].lonLabelX
      d.label_y = dictWithKeyX[d.Country].lonLabelY
    }
    
    return d;
  })

//   console.log(finalData)

  // console.log(geoData)
  let projection = d3.geoEqualEarth()
    .fitExtent([[0,0], [w, h]], geoData)
    // .translate([w/2, h/2])
    // .center([43.6532, 79.3832])
  ;

  
 // let addGDP = newData.map(d => {
  //   let year = d.year;
  //   if (filteredGDP.hasOwnProperty(year)) {
  //     d.gdp = parseFloat(filteredGDP[year]);
  //   }
  //   return d;
  // })

  // console.log("this is profit:", profitData)
  let pathMaker = d3.geoPath(projection);
  viz.selectAll(".country").data(geoData.features).enter()
    .append("path")
      .attr("class", "country")
      .attr("d", pathMaker)
      .attr("fill", function(d, i){

        // function isCountryInList(country) {
        //   profitData.find(dict => dict.Country === country);
        // }

        let found = profitData.find(dict => dict.Country === d.properties.admin);
        // console.log(found)

        if (found !== undefined){
        //   console.log(found)
          if (found.Profit > 0) return "rgb(144 238 144)"
          else if (found.Profit > -5) return "rgb(255 127 127)"
          else return "red" 

        }
        return "white"


        // if (d.properties.admin in )
        // // Find country
        // let found = profitData.find(element => {
        //   console.log(d.properties.admin, element.Country)
        //   return d.properties.admin === element.country
        // });
        
        // console.log(found)
        // return found ? "red" : "white";
      })
      // .attr("fill", function(d, i){
      //   console.log(d)
        
      //   profitData.array.forEach(element => {
      //     if(d.properties.admin == element.country){
      //       return "red"
      //     }
      //   });
        
        
      //   return "white"
      // })
      .attr("stroke", "black")

  // toronto    
  // let lon = -79.3832
  // let lat = 43.6532

  // nicaragua "label"
  // let lon = -85.069347
  // let lat = 12.670697

  // viz.append("circle")
  //   .attr("cx", function(d, i){
  //     return projection([lon, lat])[0]
  //   })
  //   .attr("cy", function(d, i){
  //     return projection([lon, lat])[1]
  //   })
  //   .attr("r", 10)
  //   .attr("fill", "red")

  // Define the tooltip element
  let tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)
  .style("position", "absolute")
  .style("pointer-events", "none")
  .style("background-color", "white")
  .style("border", "1px solid black")
  .style("padding", "5px")
  .style("border-radius", "5px");

  viz.selectAll(".country")
    .on("mouseover", function(event, d) {
      let countryName = d.properties.admin;
      let found = profitData.find(dict => dict.Country === countryName);
      if (found) {
        tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);
        if(found.Profit > 0){
          tooltip.html("Country: " + found.Country + "<br/>Profit: " + Math.abs(found.Profit) + " billion USD")
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px");
        }else{
          tooltip.html("Country: " + found.Country + "<br/>Loss: " + Math.abs(found.Profit) + " billion USD")
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 28) + "px");
        }
      }
      
    })
    .on("mouseout", function(d) {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });
}

d3.json("countries.geo.json").then(function(geoData){
  d3.csv("../datasets/summer_profit.csv").then(function(profitData){
    gotData(geoData, profitData)
  })
});