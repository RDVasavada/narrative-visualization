import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const polarizationDataHouse = await d3.csv("polarization.csv", (d) => {
    if (d.chamber == "House") {
        return {
            chamber: d.chamber,
            year: new Date(d.year),
            partyDiff: d.partymeandiffd1,
        }
    }
});

const polarizationDataSenate = await d3.csv("polarization.csv", (d) => {
    if (d.chamber == "Senate") {
        return {
            chamber: d.chamber,
            year: new Date(d.year),
            partyDiff: d.partymeandiffd1,
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
console.log(x)

// Declare the y (vertical position) scale.
const y = d3.scaleLinear([0.4, d3.max(polarizationDataHouse, d => d.partyDiff)], [height - marginBottom, marginTop]);

// Declare the line generator.
const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.partyDiff));

// Append a path for the line.
const drawLine = (data, chamber) => {
    var color = ""
    d3.select("svg").selectAll("*").remove()

    if (chamber == "House") {
        color = "purple"
    }

    if (chamber == "Senate") {
        color = "green"
    }

    // Create the SVG container.
    const svg = d3.select("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
        .on("pointerenter pointermove", pointermoved)
        .on("pointerleave", pointerleft)
        .on("touchstart", event => event.preventDefault());

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
            .text("Mean Party Distance"));

    svg.append("path")
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 1.5)
        .attr("d", line(data));

    /* Inspired by https://observablehq.com/@d3/line-with-tooltip/2 */
    // Create the tooltip container.
    const tooltip = svg.append("g");

    // Add the event listeners that show or hide the tooltip.
    const bisect = d3.bisector(d => d.year).center;
    function pointermoved(event) {
        const i = bisect(data, x.invert(d3.pointer(event)[0]));
        tooltip.style("display", null);
        tooltip.attr("transform", `translate(${x(data[i].year)},${y(data[i].partyDiff)})`);

        const path = tooltip.selectAll("path")
            .data([,])
            .join("path")
            .attr("fill", "white")
            .attr("stroke", "black");

        const text = tooltip.selectAll("text")
            .data([,])
            .join("text")
            .call(text => text
                .selectAll("tspan")
                .data([data[i].year.getFullYear(), data[i].partyDiff])
                .join("tspan")
                .attr("x", 0)
                .attr("y", (_, i) => `${i * 1.1}em`)
                .attr("font-weight", (_, i) => i ? null : "bold")
                .text(d => d));

        size(text, path);
    }

    function pointerleft() {
        tooltip.style("display", "none");
    }

    // Wraps the text with a callout path of the correct size, as measured in the page.
    function size(text, path) {
        const { x, y, width: w, height: h } = text.node().getBBox();
        text.attr("transform", `translate(${-w / 2},${15 - y})`);
        path.attr("d", `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
    }
}

drawLine(polarizationDataHouse, "House")

d3.select("#selectButton").on("change", function (event) {
    const selectedOption = event.target.value;
    if (selectedOption === "House") {
        drawLine(polarizationDataHouse, selectedOption);
    } else {
        drawLine(polarizationDataSenate, selectedOption);
    }
});