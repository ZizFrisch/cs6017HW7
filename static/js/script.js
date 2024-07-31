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
    // generate country buttons
    generateCountryButtons(parsedData);
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


function createMedalsChart(data, selectedCountries = []){
    // Filter data if selected countries are provided
    // This creates a new filtered array and assigns it to 'data'
    if (selectedCountries.length > 0) {
        data = data.filter(d => selectedCountries.includes(d["Team/NOC"]));
    }
    
    //create a stack generator
    const stack = d3.stack()
    .keys(["Gold", "Silver", "Bronze"]);

    const series = stack(data);
    console.log("Stacked data:", series);

    //create a bar chart
    const margin = {top: 20, right:30, bottom: 40, left:130};
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

    // add gridlines for the x-axis
    svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x)
            .ticks(10)
            .tickSize(-height)
            .tickFormat("")
        );

    // // add gridlines for the y-axis
    // svg.append("g")
    //     .attr("class", "grid")
    //     .call(d3.axisLeft(y)
    //         .tickSize(-width)
    //         .tickFormat("")
    //     );
    
    // color scale
    const color = d3.scaleOrdinal()
        .domain(["Gold", "Silver", "Bronze"])
        .range(["#ffd700", "#c0c0c0", "#cd7f32"]);

    // medal count tooltip
    const tooltip = d3.select(".tooltip");

    // make the bars
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
};

function generateCountryButtons(data) {
    const rightDiv = d3.select("#rightDiv");

    // sort countries alphabetically
    //data.sort((a, b) => d3.ascending(a["Team/NOC"], b["Team/NOC"]));
    const teams = [...new Set(data.map(d => d["Team/NOC"]))].sort(d3.ascending);

    // create button for all countries
    rightDiv.append("button")
        .attr("id", "all-teams")
        .text("All Teams")
        .on("click", function() {
            const allTeamsButton = d3.select(this);
            const isSelected = allTeamsButton.classed("selected");

            if (isSelected) {
                // If already selected, clear all selections
                rightDiv.selectAll("button").classed("selected", false);
            } else {
                // If not selected, select all buttons
                rightDiv.selectAll("button").classed("selected", true);
            }
            updateSelectedCountries(data);
        });

    // create buttons for each country
    teams.forEach(team => {
        rightDiv.append("button")
            .attr("class", "country-button")
            .attr("data-team", team)
            .text(team)
            .on("click", function() {
                d3.select(this).classed("selected", !d3.select(this).classed("selected"));
                updateSelectedCountries(data);
            });
    });
}


function createRatioChart(data, selectedCountries = []){
    // Create a stack generator
    // const stack = d3.stack()
    // .keys(["Gold", "Silver", "Bronze"]);

    // const series = stack(data);
    // console.log("Stacked data:", series);

    // Filter data if selected countries are provided
    if (selectedCountries.length > 0) {
        data = data.filter(d => selectedCountries.includes(d["Team/NOC"]));
    }
    
    //create a bar chart
    const margin = {top: 20, right:30, bottom: 40, left:130};
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

function updateSelectedCountries(data) {
    const selectedCountries = d3.selectAll(".country-button.selected")
        .nodes()
        .map(button => button.getAttribute("data-team"));

    console.log("Selected countries:", selectedCountries);

    // TODO
    // trigger listener for barchat like updateBarChart(selectedCountries);
    createMedalsChart(data, selectedCountries);
}