import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

let w = 900;
let h = 300;

const simulation = d3.forceSimulation()
    .force("charge", d3.forceManyBody().strength(0.001))
      .force("x", d3.forceX(w/2).strength(0.04))
      .force("y", d3.forceY(h/2).strength(0.04))
    .force("collide", d3.forceCollide().radius(3).strength(1))
    .on("tick", ticked)

function ticked() {
  datapoints.attr("cx", d => d.x)
            .attr("cy", d => d.y)
}

let vizContainer = d3.select("#viz7");

let viz = vizContainer
  .append("svg")
    .attr("class", "viz")
    // .attr("width", w)
    // .attr("height", h)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 "+w+" "+h)
    // .style("background-color", "lavender")
;

let datapoints = viz.append("g")
      .attr("class", "vizGroup")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
    .selectAll("circle");

// this puts the YEAR onto the visualization
let year = viz.append("text")
  .text("")
  .attr("x", w-320)
  .attr("y", h-150)
  .attr("font-family", "sans-serif")
  .attr("font-size", "2.0em")
;

function update(newData) {
  // console.log("newdata", newData)

  simulation.nodes(newData);
  simulation.alpha(1).restart();

  datapoints = datapoints.data(newData, d=>d.id)
    .join(
      enter => enter.append("circle")
      .attr("r", 3)
      .attr("fill", function(d){
        if(d.gender == "M"){
          return "blue"
        }else{
          return "pink"
        }
      }),
      update => update,
      exit => exit.transition().duration(500).attr("cy", h-50).remove()
      );
}

function formatData(genderData, index){
  // console.log(index)
  let dataByTime = genderData[index];
  let dataM = d3.range(parseInt(dataByTime.Men.replace(/,/g, ""))/10).map(dd=>{return {gender: "M"}})
  let dataW = d3.range(parseInt(dataByTime.Women.replace(/,/g, ""))/10).map(dd=>{return {gender: "W"}})
  let data = dataM.concat(dataW)
  // console.log(data);

  year.text(dataByTime.Year + " " + dataByTime.City)

  data = data.map((d, i)=>{
      let id = d.gender+"-"+i;
      const old = new Map(datapoints.data().map(d => [d.id, d]));
      if(old.get(id)){  
        return old.get(id)
      }else{
        return {gender:d.gender, id: d.gender+"-"+i, x:d.gender=="M"?w/2-300:w/2+300, y:h/2+(-50+Math.random()*100)}

      }
      // newData = newData.map(d => Object.assign(old.get(d.id) || {}, d));
      // // return {gender:d.gender, id: d.gender+"-"+i, x:d.gender=="M"?w/2-300:w/2+300, y:h/2+(-50+Math.random()*100)}
      // return {gender:d.gender, id: d.gender+"-"+i, x:"hi"}

    })
  update(data, true);

}
function gotData(genderData){
  document.querySelector("#timeSlider").addEventListener("change", function(e){
    formatData(genderData, parseInt(e.target.value))
    // console.log("target value", e.target.value)
    // console.log(dataByTime);
    
    // dataIdx++
  })

    // Set the initial value of the slider to its minimum value
  document.querySelector("#timeSlider").value = document.querySelector("#timeSlider").min;

  // Trigger the "change" event to update the visualization with data corresponding to the minimum value
  document.querySelector("#timeSlider").dispatchEvent(new Event("change"));

  enterView({
    selector: '.viz7-step1',
    enter: function(el) {
      formatData(genderData, 1)
    },
    exit: function(el) {
      formatData(genderData, 0)
    },
    offset: 0.2, // enter at middle of viewport
  });

  enterView({
    selector: '.viz7-step2',
    enter: function(el) {
      formatData(genderData, 5)
    },
    exit: function(el) {
      formatData(genderData, 1)
    },
    offset: 0.2, // enter at middle of viewport
  });

  enterView({
    selector: '.viz7-step3',
    enter: function(el) {
      formatData(genderData, 17)
    },
    exit: function(el) {
      formatData(genderData, 5)
    },
    offset: 0.2, // enter at middle of viewport
  });

  enterView({
    selector: '.viz7-step4',
    enter: function(el) {
      formatData(genderData, 26)
    },
    exit: function(el) {
      formatData(genderData, 17)
    },
    offset: 0.2, // enter at middle of viewport
  });

  enterView({
    selector: '.viz7-step5',
    enter: function(el) {
      formatData(genderData, 28)
    },
    exit: function(el) {
      formatData(genderData, 26)
    },
    offset: 0.2, // enter at middle of viewport
  });
}

d3.csv("./datasets/gender.csv").then(gotData)