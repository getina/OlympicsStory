import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

let w = 1100;
let h = 650;
// let xPadding = 40;
// let yPadding = 50;
let yearPadding = 10;

let vizContainer = d3.select("#viz6");

let viz = vizContainer
  .append("svg")
  .attr("class", "viz")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 "+w+" "+h)
//   .style("background-color", "lavender")
  ;

function findDuplicates(array, key) {
  let counts = {};
  let duplicates = [];

  // Count occurrences of each value in the array
  array.forEach(item => {
    counts[item[key]] = (counts[item[key]] || 0) + 1;
  });

  // Filter duplicates
  array.forEach(item => {
    if (counts[item[key]] > 1) {
      duplicates.push(item);
    }
  });

  return duplicates;
}

let mapGroup = viz.append("g");

function gotData(geoData, rehostData) {
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

  let finalData = rehostData.map(d => {
    let dictWithKeyX = dict.find(obj => d.Country in obj);

    if (dictWithKeyX !== undefined) {
      d.label_x = dictWithKeyX[d.Country].lonLabelX
      d.label_y = dictWithKeyX[d.Country].lonLabelY
    }

    return d;
  })
  finalData = finalData.filter(d => d.label_x != undefined);



  // console.log("finalData", finalData);
  let finalGroupedByCountry = d3.groups(finalData, function (d) {
    return d.Country
  })
//   console.log("finalGroupedByCountry", finalGroupedByCountry)

  // let duplicates = findDuplicates(finalData, "Country")

  // if (number == 2){
  //   duplicates = duplicates.filter(d => {
  //     return d.Season === "Summer"
  //   })
  // }else if (number == 3){
  //   duplicates = duplicates.filter(d => {
  //     return d.Season === "Winter"
  //   })
  // }

  // // console.log(duplicates) 

  // duplicates = d3.groups(duplicates, function(d){
  //   return d.Country
  // })
  // console.log("grouped", duplicates)


  // viz.append("text")
  //   .attr("class", "graphTitle")
  //   .attr("x", w / 2)
  //   .attr("y", 40) // Adjust the y-coordinate as needed
  //   .style("font-size", "24px") // Set the font size
  //   .style("text-anchor", "middle")
  //   .text("Countries that Rehosted the Olympics");

  // console.log(geoData)
  let projection = d3.geoEqualEarth()
    .fitExtent([[0, 0], [w, h]], geoData)
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

  let pathMaker = d3.geoPath(projection);
  let countryShapes = mapGroup.selectAll(".country").data(geoData.features).enter()
    .append("path")
    .attr("class", "country")
    .attr("d", pathMaker)
    .attr("fill", function (d, i) {
    //   console.log(d)
      // function isCountryInList(country) {
      //   profitData.find(dict => dict.Country === country);
      // }
      return "white";
      // let found = profitData.find(dict => dict.Country === d.properties.admin);
      // console.log(found)

      // if (found !== undefined){
      //   console.log(found)
      //   if (found.Profit > 0) return "rgb(144 238 144)"
      //   else if (found.Profit > -5) return "rgb(255 127 127)"
      //   else return "red" 

      // }
      // return "white"


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

  // function getX(d, i){
  //   return projection([d.label_x, d.label_y])[0]
  // }

  // function getY(d, i){
  //   return projection([d.label_x, d.label_y])[1]
  // }

  function getFlagX(d, i) {
    // let offset = i % 2 === 0 ? -2 : 2; // Alternate left and right offsets
    // console.log(i)
    return projection([d.label_x - 3 * i, d.label_y])[0];
  }

  function getFlagY(d, i) {
    // let offsetY = Math.floor(i / 2) * 3; // Offset vertically
    return projection([d.label_x, d.label_y + 9])[1];
  }

  function getGroupPosEnter(d, i) {
    let x = projection([d[1][0].label_x, d[1][0].label_y])[0];
    let y = -5//projection([d[1][0].label_x, d[1][0].label_y])[1];

    return "translate(" + x + ", " + y + ")"
  }

  function getGroupPos(d, i) {
    let x = projection([d[1][0].label_x, d[1][0].label_y])[0];
    let y = projection([d[1][0].label_x, d[1][0].label_y])[1];

    return "translate(" + x + ", " + y + ")"
  }

  let vizGroup = mapGroup.append("g").attr("class", "vizGroup")
  // console.log(duplicates)
  
  let datagroupsCountry = vizGroup.selectAll(".datagroupCountry") // Use a unique class for each set of data groups
    .data(finalGroupedByCountry)
    .enter()
    .append("g")
    .attr("class", "datagroupCountry")
    .attr("transform", getGroupPosEnter)
    .attr("opacity", 1)
    .attr("fill", "white")
    ;

    let flagGroups = datagroupsCountry.append("g").attr("class", "flag");//.attr("transform", "translate(-9, -7)")

    function dropFlags() {
        datagroupsCountry.transition().delay((d, i) => i * 14).attr("transform", getGroupPos);
      
        flagGroups.append("svg:image")
          .attr('x', -10)
          .attr('y', -37)
          .attr('width', 40)
          .attr('height', 40)
          .attr('xlink:href', '../pictures/flag.svg')
          .attr("class", "flag")
      
        flagGroups.append("text")
          .text(d => d[1].length)
          .attr("fill", "black")
          .attr("font-size", "12px")
          .attr("text-anchor", "middle")
          .attr("y", -18)
          .attr("x", 11)
        ;
    }

    function returnFlags(){
        // console.log("return flags")
        datagroupsCountry.transition().delay((d, i) => i * 14).attr("transform", getGroupPosEnter);
    }

//   window.addEventListener("click", function(){
//     datagroupsCountry.filter(d=>d[1].length==1).transition().attr("opacity", 0);

//     finalGroupedByCountry.filter(d=>d[1].length>1).forEach(d=>{
//       console.log(d[0]);
//       countryShapes.filter(c=>c.properties.admin==d[0]).transition().attr("fill", "yellow")
//     })
//   })

  // ------------------------------- break

  const zoom = d3.zoom()
    .scaleExtent([1, 5])
    .on("zoom", zoomed);

  function zoomed(event) {
    const {transform} = event;
    mapGroup.attr("transform", transform);
    mapGroup.attr("stroke-width", 1 / transform.k);

    const flagScale = 1 / transform.k; // Inverse of the zoom scale
    flagGroups.transition().duration(50).attr("transform", `scale(${flagScale})`);
  }

  viz.call(zoom);

  function zoomToCountry(countryName, countriesFocus, [[x0, y0], [x1, y1]]) {
    // let countries = mapGroup.selectAll(".country").data(geoData.features).enter()
    //     .append("path")
    //     .attr("class", "country")
    //     .attr("d", pathMaker)
    // ;

    // countryShapes.transition().attr("fill", "black");
    // countryShapes.filter(d=>d.properties.admin == countryName).transition().attr("fill", "blue")


    countriesFocus.forEach(d=>{
        countryShapes.filter(d2=>d2.properties.admin == d).transition().attr("fill", "blue")
    })

    // countryShapes.filter(c=>c.properties.admin==countryName).transition().attr("fill", "green")

    // console.log([[x0, y0], [x1, y1]])

    viz.transition().duration(750).call(
    zoom.transform,
    d3.zoomIdentity
        .translate(w / 2, h / 2)
        .scale(Math.min(6, 0.9 / Math.max((x1 - x0) / w, (y1 - y0) / h)))
        .translate(-(x0 + x1) / 2, -(y0 + y1) / 2)
    );
    }

  function zoomOut(){
      
      viz.transition().duration(750).call(
      zoom.transform,
      d3.zoomIdentity
          .translate(0,0)
          .scale(1)
      );  
  }   

  document.getElementById("OceaniaString").addEventListener("click", function(){
    // zoomOut();
    countryShapes.transition().attr("fill", "white");
    let countriesFocus = ["Australia"]

    let countryData = geoData.features.find(d=>d.properties.admin == "Australia")
    const [[x0, y0], [x1, y1]] = pathMaker.bounds(countryData);
    zoomToCountry("Australia", countriesFocus, [[x0, y0], [x1, y1]]);
  })

  document.getElementById("AsiaString").addEventListener("click", function(){
    // zoomOut();
    countryShapes.transition().attr("fill", "white");
    let countriesFocus = ["China", "Japan", "South Korea"]

    let countryData = geoData.features.find(d=>d.properties.admin == "China")
    const [[x0, y0], [x1, y1]] = pathMaker.bounds(countryData);
    zoomToCountry("China", countriesFocus, [[x0, y0], [x1, y1]]);
  })

  document.getElementById("EuropeString").addEventListener("click", function(){
    // zoomOut();
    // console.log("omg")
    countryShapes.transition().attr("fill", "white");
    let countriesFocus = ["Germany", "Greece",  "France", "United Kingdom", "Sweden", "Belgium", "Switzerland", "Netherlands", "Italy", "Spain", "Austria", "Norway", "Finland", "Russia"]
    
    let countryData = geoData.features.find(d=>d.properties.admin == "Germany")
    const [[x0, y0], [x1, y1]] = pathMaker.bounds(countryData);
    zoomToCountry("Germany", countriesFocus, [[x0, y0], [x1, y1]]);
  })

  document.getElementById("AmericasString").addEventListener("click", function(){
    // zoomOut();
    // console.log("hahaha")
    countryShapes.transition().attr("fill", "white");
    let countriesFocus = ["United States of America",  "Canada", "Mexico"]

    let nyLon = -52.623913;
    let nyLat = 83.1068;
    let calLon = -140;
    let calLat = 15;

    let x0 = projection([nyLon,nyLat])[0];
    let y0 = projection([nyLon,nyLat])[1];
    let x1 = projection([calLon,calLat])[0];
    let y1 = projection([calLon,calLat])[1];
    zoomToCountry("United States of America", countriesFocus, [[x0, y0], [x1, y1]]);
  })

  enterView({
    selector: '#viz6-stickyBox',
    enter: function(el) {
        dropFlags();
    },
    exit: function(el) {
        // console.log("bruh")
        zoomOut();
        returnFlags();
        countryShapes.transition().attr("fill", "white");
    },
    offset: 0.5, // enter at middle of viewport
  });
  enterView({
    selector: '#viz6-nextparagraph',
    enter: function(el) {
        // console.log("new bruh")
        zoomOut();
        returnFlags();
        countryShapes.transition().attr("fill", "white");
    },
    exit: function(el) {
        dropFlags();
    },
    offset: 0.5, // enter at middle of viewport
  });
}

d3.json("countries.geo.json").then(function (geoData) {
  d3.csv("datasets/rehost.csv").then(function (rehostData) {
    gotData(geoData, rehostData); // Load map 3
  });
});



