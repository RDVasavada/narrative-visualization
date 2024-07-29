import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const polarizationDataHouse = await d3.csv("polarization.csv", (d) => {
    if (d.chamber == "House") {
        return {
            chamber: d.chamber,
            year: new Date(d.year),
            propModDem: d.propmoderatedemd1,
            propPartisanDem: 1 - d.propmoderatedemd1,
            propModR: d.propmoderaterepd1,
            propPartisanR: 1 - d.propmoderaterepd1
        }
    }
});

const polarizationDataSenate = await d3.csv("polarization.csv", (d) => {
    if (d.chamber == "Senate") {
        return {
            chamber: d.chamber,
            year: new Date(d.year),
            propModDem: d.propmoderatedemd1,
            propPartisanDem: 1 - d.propmoderatedemd1,
            propModR: d.propmoderaterepd1,
            propPartisanR: 1 - d.propmoderaterepd1
        }
    }
});


/* Inspired by https://d3-graph-gallery.com/graph/pie_annotation.html */
// set the dimensions and margins of the graph
var width = 450
var height = 450
var margin = 40

// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
var radius = Math.min(width, height) / 2 - margin

var houseLatestD = [
    {
        "key": "moderateDem",
        "value": polarizationDataHouse[polarizationDataHouse.length-1].propModDem
    },
    {
        "key": "partisanDem",
        "value": 1 - polarizationDataHouse[polarizationDataHouse.length-1].propModDem
    }
]

var houseLatestR = [
    {
        "key": "moderateRep",
        "value": polarizationDataHouse[polarizationDataHouse.length-1].propModR
    },
    {
        "key": "partisanRep",
        "value": 1 - polarizationDataHouse[polarizationDataHouse.length-1].propModR
    }
]

var senateLatestD = [
    {
        "key": "moderateDem",
        "value": polarizationDataSenate[polarizationDataSenate.length-1].propModDem
    },
    {
        "key": "partisanDem",
        "value": 1 - polarizationDataSenate[polarizationDataSenate.length-1].propModDem
    }
]

var senateLatestR = [
    {
        "key": "moderateRep",
        "value": polarizationDataSenate[polarizationDataSenate.length-1].propModR
    },
    {
        "key": "partisanRep",
        "value": 1 - polarizationDataSenate[polarizationDataSenate.length-1].propModR
    }
]

// set the color scale
var colorD = d3.scaleOrdinal()
  .domain(["moderateDem", "partisanDem"])
  .range(["#deebf7","#3182bd"]);

var colorR = d3.scaleOrdinal()
  .domain(["moderateRep", "partisanRep"])
  .range(["#fee0d2","#de2d26"]);

// A function that create / update the plot for a given variable:
function updateD(data) {
    d3.select("#svg1").selectAll("*").remove()

    // append the svg object 
    var svg = d3.select("#svg1")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // Compute the position of each group on the pie:
    var pie = d3.pie()
    .value(function(d) {return d.value; })
    var data_ready = pie(data)
    // Now I know that group A goes from 0 degrees to x degrees and so on.

    // shape helper to build arcs:
    var arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(radius)

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    svg
    .selectAll('mySlices')
    .data(data_ready)
    .enter()
    .append('path')
    .attr('d', arcGenerator)
    .attr('fill', function(d){ return(colorD(d.data.key)) })
    .attr("stroke", "black")
    .style("stroke-width", "2px")
    .style("opacity", 0.7)

    // Now add the annotation. Use the centroid method to get the best coordinates
    svg
    .selectAll('mySlices')
    .data(data_ready)
    .enter()
    .append('text')
    .text(function(d){ return d.data.key})
    .attr("transform", function(d) { return "translate(" + arcGenerator.centroid(d) + ")";  })
    .style("text-anchor", "middle")
    .style("font-size", 17)
}

function updateR(data) {
    d3.select("#svg2").selectAll("*").remove()

    var svgR = d3.select("#svg2")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // Compute the position of each group on the pie:
    var pie = d3.pie()
    .value(function(d) {return d.value; })
    var data_ready = pie(data)
    // Now I know that group A goes from 0 degrees to x degrees and so on.

    // shape helper to build arcs:
    var arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(radius)

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    svgR
    .selectAll('mySlices')
    .data(data_ready)
    .enter()
    .append('path')
    .attr('d', arcGenerator)
    .attr('fill', function(d){ return(colorR(d.data.key)) })
    .attr("stroke", "black")
    .style("stroke-width", "2px")
    .style("opacity", 0.7)

    // Now add the annotation. Use the centroid method to get the best coordinates
    svgR
    .selectAll('mySlices')
    .data(data_ready)
    .enter()
    .append('text')
    .text(function(d){ return d.data.key})
    .attr("transform", function(d) { return "translate(" + arcGenerator.centroid(d) + ")";  })
    .style("text-anchor", "middle")
    .style("font-size", 17)
}

// Initialize the plot with the first dataset
updateD(houseLatestD)
updateR(houseLatestR)

d3.select("#selectButton").on("change", function(event) {
    const selectedOption = event.target.value;
    if (selectedOption === "House") {
        updateD(houseLatestD)
        updateR(houseLatestR)
    } else {
        updateD(senateLatestD)
        updateR(senateLatestR)
    }
});