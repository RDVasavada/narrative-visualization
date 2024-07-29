import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const polarizationDataHouse = await d3.csv("polarization.csv", (d) => {
    if (d.chamber == "House") {
        return {
            chamber: d.chamber,
            year: new Date(d.year),
            demMean: d.demmeand1,
            repMean: d.repmeand1
        }
    }
});

const polarizationDataSenate = await d3.csv("polarization.csv", (d) => {
    if (d.chamber == "Senate") {
        return {
            chamber: d.chamber,
            year: new Date(d.year),
            demMean: d.demmeand1,
            repMean: d.repmeand1
        }
    }
});

/* Inspired by https://observablehq.com/@d3/line-chart/2 */
// Declare the chart dimensions and margins.
const width = 928;
const height = 500;
const marginTop = 20;
const marginRight = 30;
const marginBottom = 30;
const marginLeft = 40;

// Declare the x (horizontal position) scale.
const x = d3.scaleUtc(d3.extent(polarizationDataHouse, d => d.year), [marginLeft, width - marginRight]);

// Declare the y (vertical position) scale.
const y = d3.scaleLinear([-0.8, 0.8], [height - marginBottom, marginTop]);

// Declare the line generators
const demLine = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.demMean));

const repLine = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.repMean));

// Create the SVG container.
const svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

// Append a path for the line.
const drawLine = (data, chamber) => {
    d3.select("svg").selectAll("*").remove()

    // Add the x-axis.
    svg.append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

    // Add the y-axis, remove the domain line, add grid lines and a label.
    svg.append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y).ticks(height / 40))
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll(".tick line").clone()
        .attr("x2", width - marginLeft - marginRight)
        .attr("stroke-opacity", 0.1))
    .call(g => g.append("text")
        .attr("x", -marginLeft)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text("Mean Party Positions"));

    svg.append("path")
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", 1.5)
        .attr("d", demLine(data)); 

    svg.append("path")
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1.5)
        .attr("d", repLine(data)); 

    /* Inspired by https://gist.github.com/d3noob/8603837 */
    svg.append("text")
		.attr("transform", "translate(" + x(data[data.length-1].year) + "," + y(data[data.length-1].demMean) + ")")
		.attr("dy", ".35em")
		.attr("text-anchor", "start")
		.style("fill", "blue")
		.text("Dem");

	svg.append("text")
		.attr("transform", "translate(" + x(data[data.length-1].year) + "," + y(data[data.length-1].repMean) + ")")
		.attr("dy", ".35em")
		.attr("text-anchor", "start")
		.style("fill", "red")
		.text("Rep");
}

drawLine(polarizationDataHouse, "House")

d3.select("#selectButton").on("change", function(event) {
    const selectedOption = event.target.value;
    if (selectedOption === "House") {
        drawLine(polarizationDataHouse, selectedOption);
    } else {
        drawLine(polarizationDataSenate, selectedOption);
    }
});