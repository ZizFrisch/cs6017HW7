d3.json('/data').then(function(data) {
    const svg = d3.select('#chart')
                  .append('svg')
                  .attr('width', 600)
                  .attr('height', 400);

    const margin = {top: 20, right: 30, bottom: 40, left: 40},
          width = +svg.attr('width') - margin.left - margin.right,
          height = +svg.attr('height') - margin.top - margin.bottom;

    const x = d3.scaleBand()
                .domain(data.map(d => d.Category))
                .range([margin.left, width - margin.right])
                .padding(0.1);

    const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.Value)])
                .nice()
                .range([height - margin.bottom, margin.top]);

    const xAxis = g => g
                      .attr('transform', `translate(0,${height - margin.bottom})`)
                      .call(d3.axisBottom(x).tickSizeOuter(0));

    const yAxis = g => g
                      .attr('transform', `translate(${margin.left},0)`)
                      .call(d3.axisLeft(y))
                      .call(g => g.select('.domain').remove());

    svg.append('g')
       .selectAll('rect')
       .data(data)
       .join('rect')
       .attr('x', d => x(d.Category))
       .attr('y', d => y(d.Value))
       .attr('height', d => y(0) - y(d.Value))
       .attr('width', x.bandwidth());

    svg.append('g').call(xAxis);
    svg.append('g').call(yAxis);
});
