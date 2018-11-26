

var svg = d3.select('svg');

// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 40, r: 40, b: 40, l: 40};

// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

// Color mapping based on mission type
missionTyprColors = { flyby: '#fc5a74', orbit: '#fee633',
    lander: '#24d5e8', rover: '#82e92d', ongoing: '#fc5a74'};


d3.csv('./planet_only.csv', function(error, dataset) {

    var planetNames = d3.set(dataset.map(function(d) {
        return d.to;
    })).values();

    successRateExtent = d3.extent(dataset, function (d) {
        return parseFloat(d['success_rate']);
    });

    totalExtent = d3.extent(dataset, function (d) {
        return parseFloat(d['total']);
    });

    radiusScale = d3.scaleLinear().domain(totalExtent).range([10,80]);


    planetScale = d3.scaleBand().domain(planetNames)
        .range([0, chartWidth]).padding(0.1);


    successScale = d3.scaleLinear()
        .domain([0,1]).range([chartHeight,0]);


    svg.selectAll('circle').data(dataset).enter()
        .append('circle')
        .attr('r', function (d) {
            return radiusScale(d.total);
        })
        .attr('cx', function (d) {
            return planetScale(d.to)
        })
        .attr('cy',function(d) { return successScale(d.success_rate);})
        .attr('transform', `translate(${padding.l},${padding.t})`)
        .attr("fill", function (d,i) { return missionTyprColors[d.type]})
        .attr("fill-opacity", 0.7);

//x-axis

    svg.append('g').attr('class', 'x axis')
    .attr('transform', 'translate(0,760)')
        .call(d3.axisBottom(planetScale));

//y axis
    svg.append('g').attr('class', 'y axis')
    .attr('transform', 'translate(1140,40)')
        .call(d3.axisRight(successScale));

});


svg.append('text')
    .attr('class', 'label')
    .attr('transform','translate(1180,300) rotate(90)')
    .text('Success Rate');

svg.append('text')
    .attr('class', 'label')
    .attr('transform','translate(600,700)')
    .text('Planets');
