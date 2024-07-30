import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"

window.onload = async function(){
    let response = await fetch("/static/data/medals.csv")
    let medals = await response.text();
    // console.log("CSV data:", medals);
    //let medals = await d3.text("/static/data/medals.csv"); //returns a "promise"

    //parse the csv data
    let parsedData = d3.csvParse(medals, d3.autoType);
    // console.log("Parsed data:", parsedData);

    //create a bar chart
    const margin = {top: 20, right:30, bottom: 40, left:90};
    const div = document.getElementById("leftDiv");
    const divWidth = div.clientWidth;
    const divHeight = div.clientHeight;
    const width = divWidth - margin.left - margin.right;
    const height = divHeight - margin.top - margin.bottom;

    //clear any existing content in the leftDiv
    d3.select("#leftDiv").selectAll("*").remove();

    const svg = d3.select("#leftDiv")
        .append("svg")
        .attr("width", divWidth)
        .attr("height", divHeight)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .domain([0, d3.max(parsedData, d=> d.Total)])
        .range([0, width]);

    const y = d3.scaleBand()
        .domain(parsedData.map(d => d["Team/NOC"]))
        .range([0, height])
        .padding(0.1);
    
    svg.append("g")
        .selectAll("rect")
        .data(parsedData)
        .enter()
        .append("rect")
        .attr("x", x(0))
        .attr("y", d=> y(d["Team/NOC"]))
        .attr("width", d => x(d.Total))
        .attr("height", y.bandwidth())
        .attr("fill", "steelblue");

    svg.append("g")
        .call(d3.axisLeft(y));

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));
};
