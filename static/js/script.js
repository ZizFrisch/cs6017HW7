import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"

window.onload = async function(){
    let response = await fetch("/static/data/medals.csv")
    let medals = await response.text();
    console.log("CSV data:", medals);
    //let medals = await d3.text("/static/data/medals.csv"); //returns a "promise"

    //parse the csv data
    let parsedData = d3.csvParse(medals, d3.autoType);
    console.log("Parsed data:", parsedData);

    //create a bar chart
    const margin = {top: 20, right:30, bottom: 40, left:90};
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", 'translate(${margin.left},${margin.top})');

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
        .attr("transform", 'translate(0,${height})')
        .call(d3.axisBottom(x));

};


// d3.json('/data').then(function(data) {
//     const svg = d3.select('#chart')
//                   .append('svg')
//                   .attr('width', 600)
//                   .attr('height', 400);

//     const margin = {top: 20, right: 30, bottom: 40, left: 40},
//           width = +svg.attr('width') - margin.left - margin.right,
//           height = +svg.attr('height') - margin.top - margin.bottom;

//     const x = d3.scaleBand()
//                 .domain(data.map(d => d.Category))
//                 .range([margin.left, width - margin.right])
//                 .padding(0.1);

//     const y = d3.scaleLinear()
//                 .domain([0, d3.max(data, d => d.Value)])
//                 .nice()
//                 .range([height - margin.bottom, margin.top]);

//     const xAxis = g => g
//                       .attr('transform', `translate(0,${height - margin.bottom})`)
//                       .call(d3.axisBottom(x).tickSizeOuter(0));

//     const yAxis = g => g
//                       .attr('transform', `translate(${margin.left},0)`)
//                       .call(d3.axisLeft(y))
//                       .call(g => g.select('.domain').remove());

//     svg.append('g')
//        .selectAll('rect')
//        .data(data)
//        .join('rect')
//        .attr('x', d => x(d.Category))
//        .attr('y', d => y(d.Value))
//        .attr('height', d => y(0) - y(d.Value))
//        .attr('width', x.bandwidth());

//     svg.append('g').call(xAxis);
//     svg.append('g').call(yAxis);
// });
