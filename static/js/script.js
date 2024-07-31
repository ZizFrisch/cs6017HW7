import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"

window.onload = async function(){
    //load and parse medals data
    let response = await fetch("/static/data/medals.csv")
    let medals = await response.text();
    // console.log("CSV data:", medals);
    //let medals = await d3.text("/static/data/medals.csv"); //returns a "promise"
    //parse the csv data
    let parsedData = d3.csvParse(medals, d3.autoType);
    // console.log("Parsed data:", parsedData);

    //load and parse athletes data
    let athletesResponse = await fetch("/static/data/Athletes.csv")
    let athletes = await athletesResponse.text();
    let parsedAthletes = d3.csvParse(athletes, d3.autoType);

    // aggregate medals and athletes by country
    
    let ratioData = getRatios(parsedData, parsedAthletes);
    console.log("RatioData: ", ratioData);
    
    createMedalsChart(parsedData);
    createRatioChart(ratioData);
};


// Function gets the ratios of the countries and returns them
function getRatios(medals, athletes){
    // Aggregate medals by country
    let medalsByCountry = new Map();
        medals.forEach(d => {
        medalsByCountry.set(d["Team/NOC"], d.Total);
    });

    console.log("Medals by country:", medalsByCountry)

    //Aggregate Athletes by country
    let athletesByCountry = new Map();
    athletes.forEach( d => {
        let country = d.NOC;
        if (!athletesByCountry.has(country)){
            athletesByCountry.set(country, 0);
        }
        athletesByCountry.set(country, athletesByCountry.get(country) + 1);
    });
    console.log("Athletes by country:", athletesByCountry)
    
    //compute ratios
    let ratioData = [];
    medalsByCountry.forEach((medals, country) => {
        let athletes = athletesByCountry.get(country) || 0;
        let ratio = athletes ? medals/athletes : 0;
        ratioData.push({country, ratio});
    });

    return ratioData;
}


function createMedalsChart(data){
    // Create a stack generator
    const stack = d3.stack()
    .keys(["Gold", "Silver", "Bronze"]);

    const series = stack(data);
    console.log("Stacked data:", series);

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

    // X axis
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Total)])
        .range([0, width]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    // Y axis
    const y = d3.scaleBand()
        .domain(data.map(d => d["Team/NOC"]))
        .range([0, height])
        .padding(0.1);

    svg.append("g")
        .call(d3.axisLeft(y));
    
    // Color scale
    const color = d3.scaleOrdinal()
        .domain(["Gold", "Silver", "Bronze"])
        .range(["#ffd700", "#c0c0c0", "#cd7f32"]);

    // Tooltip
    const tooltip = d3.select(".tooltip");

    // Bars
    svg.append("g")
        .selectAll("g")
        .data(series)
        .enter()
        .append("g")
        .attr("fill", d => color(d.key))
        .selectAll("rect")
        .data(d => d)
        .enter()
        .append("rect")
        .attr("x", d => x(d[0]))
        .attr("y", d => y(d.data["Team/NOC"]))
        .attr("width", d => x(d[1]) - x(d[0]))
        .attr("height", y.bandwidth())
        .on("mouseover", function(event, d) {
            const [xStart, xEnd] = d;
            const medalsCount = xEnd - xStart; // get medal count from data
            tooltip.transition() // fade in
                .duration(200)
                .style("opacity", .9);
            tooltip.html(medalsCount) // position tooltip
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 9) + "px");
            d3.select(this).attr("stroke", "black"); //outline bar
        })
        .on("mouseout", function(d) {
            tooltip.transition() // fade out
                .duration(200)
                .style("opacity", 0);
            d3.select(this).attr("stroke", null); // remove outline
        });
}


function createRatioChart(data){
    // Create a stack generator
    // const stack = d3.stack()
    // .keys(["Gold", "Silver", "Bronze"]);

    // const series = stack(data);
    // console.log("Stacked data:", series);
    
    //create a bar chart
    const margin = {top: 20, right:30, bottom: 40, left:90};
    const div = document.getElementById("centerDiv");
    const divWidth = div.clientWidth;
    const divHeight = div.clientHeight;
    const width = divWidth - margin.left - margin.right;
    const height = divHeight - margin.top - margin.bottom;

    //clear any existing content in the centerDiv
    d3.select("#centerDiv").selectAll("*").remove();

    const svg = d3.select("#centerDiv")
        .append("svg")
        .attr("width", divWidth)
        .attr("height", divHeight)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // X axis
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.ratio)]) //this
        .range([0, width]);

    // Y axis
    const y = d3.scaleBand()
        .domain(data.map(d => d.country)) //this
        .range([0, height])
        .padding(0.1);

    //Bars
    svg.append("g")
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", x(0))
        .attr("y", d => y(d.country))
        .attr("width", d => x(d.ratio))
        .attr("height", y.bandwidth())
        .attr("fill", "steelblue");

    svg.append("g")
        .call(d3.axisLeft(y));

    svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));
    
    // Color scale
    // const color = d3.scaleOrdinal()
    //     .domain(["Gold", "Silver", "Bronze"])
    //     .range(["#ffd700", "#c0c0c0", "#cd7f32"]);

    // Tooltip
    // const tooltip = d3.select(".tooltip");

    // Bars
    // svg.append("g")
    //     .selectAll("g")
    //     .data(series)
    //     .enter()
    //     .append("g")
    //     .attr("fill", d => color(d.key))
    //     .selectAll("rect")
    //     .data(d => d)
    //     .enter()
    //     .append("rect")
    //     .attr("x", d => x(d[0]))
    //     .attr("y", d => y(d.data["Team/NOC"]))
    //     .attr("width", d => x(d[1]) - x(d[0]))
    //     .attr("height", y.bandwidth())
    //     .on("mouseover", function(event, d) {
    //         const [xStart, xEnd] = d;
    //         const medalsCount = xEnd - xStart; // get medal count from data
    //         tooltip.transition() // fade in
    //             .duration(200)
    //             .style("opacity", .9);
    //         tooltip.html(medalsCount) // position tooltip
    //             .style("left", (event.pageX + 5) + "px")
    //             .style("top", (event.pageY - 9) + "px");
    //         d3.select(this).attr("stroke", "black"); //outline bar
    //     })
    //     .on("mouseout", function(d) {
    //         tooltip.transition() // fade out
    //             .duration(200)
    //             .style("opacity", 0);
    //         d3.select(this).attr("stroke", null); // remove outline
    //     });
}