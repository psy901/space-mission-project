// **** Example of how to create padding and spacing for trellis plot****
var svg = d3.select('svg');

// Hand code the svg dimensions, you can also use +svg.attr('width') or +svg.attr('height')
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

// Define a padding object
// This will space out the trellis subplots
var padding = {t: 20, r: 20, b: 60, l: 60};

// Compute the dimensions of the trellis plots, assuming a 2x2 layout matrix.
trellisWidth = svgWidth / 4 - padding.l - padding.r;
trellisHeight = svgHeight / 2 - padding.t - padding.b;

// As an example for how to layout elements with our variables
// Lets create .background rects for the trellis plots
svg.selectAll('.background')
    .data(['A', 'B', 'C', 'C', 'A', 'B', 'C', 'C']) // dummy data
    .enter()
    .append('rect') // Append 4 rectangles
    .attr('class', 'background')
    .attr('width', trellisWidth) // Use our trellis dimensions
    .attr('height', trellisHeight)
    .attr('transform', function(d, i) {
        // Position based on the matrix array indices.
        // i = 1 for column 1, row 0)
        var tx = (i % 4) * (trellisWidth + padding.l + padding.r) + padding.l;
        var ty = Math.floor(i / 4) * (trellisHeight + padding.t + padding.b) + padding.t;
        return 'translate('+[tx, ty]+')';
    });

var parseDate = d3.timeParse('%Y-%m-%d');
// To speed things up, we have already computed the domains for your scales
var dateDomain = [new Date(1960, 0), new Date(2018, 0)];

var agencyDomain = ["soviet", 'nasa','jaxa','esa', 'cnsa','isro','roscosmos']

var priceDomain = [0, 223.02];

// **** How to properly load data ****
d3.csv('interplanetary-parsed.csv', function(error, dataset) {
    if(error) {
        console.error('Error while loading ./stock_prices.csv dataset.');
        console.error(error);
        return; // Early return out of the callback function
    }

   // console.log(dataset);
// **** Your JavaScript code goes here ****

    dataset.forEach(function(price) {
        //console.log(price);
        price.launch = parseDate(price.launch);
        price.finish = parseDate(price.finish);

    });

    filteredData = dataset.filter(function (d) {
        return d['object'] == "planet";
    });

//    console.log(filteredData);


    var agencyNames = d3.set(dataset.map(function(d) {
        return d.agency;
    })).values();
    console.log(agencyNames);


    var nested = d3.nest()
        .key(function(c) {
            return c.to;
        })
        .entries(filteredData); // step3

    console.log(nested);






    var trellisG = svg.selectAll('.trellis')
        .data(nested)
        .enter()
        .append('g')
        .attr('class', 'trellis')
        .attr('transform', function(d, i) {

            // Position based on the matrix array indices.
            // i = 1 for column 1, row 0)
            var tx = (i % 4) * (trellisWidth + padding.l + padding.r) + padding.l;
            var ty = Math.floor(i / 4) * (trellisHeight + padding.t + padding.b) + padding.t;
            return 'translate('+[tx, ty]+')';
        });


    // Add Scales

    var xScale = d3.scaleTime()
        .domain(dateDomain)
        .range([0, trellisWidth]);


    // var yScale = d3.scaleLinear()
    //     .domain(priceDomain)
    //     .range([trellisHeight, 0]);



    agencyScale = d3.scaleBand().domain(agencyNames)
        .range([trellisHeight, 0]).padding(0.1);



    console.log('11111111');

    // var lineInterpolate = d3.line()
    //     .x(function(d) { return xScale(d.launch); })
    //     .y(function(d) { return yScale(d.price); });

    //Adding color

    var planetNames = nested.map(function(d){
        return d.key;
    });



  //  console.log(planetNames);

    var colorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(planetNames);



    // add grid
    var xGrid =d3.axisTop(xScale)
        .ticks(5)
        .tickSize(-trellisHeight, 0, 0)
        .tickFormat('');

    trellisG.append('g')
        .attr('class', 'x grid')
        .call(xGrid);

    var yGrid = d3.axisLeft(agencyScale)
        .tickSize(-trellisWidth, 0, 0)
        .tickFormat('')

    trellisG.append('g')
        .attr('class', 'y grid')
        .call(yGrid);



    trellisG.selectAll('circle')
        .data(function(d){
            console.log(d);
            return d.values;
        })
        // .data(filteredData)
        .enter()
        .append('circle')
        .attr('r', 2)
        .attr('cx', function (d) {
             console.log(d);
            return xScale(d.launch)
        })
        .attr('cy',function(d) { return agencyScale(d.agency) + 20;})
        // .attr('transform', `translate(${padding.l},${padding.t})`)
        .attr("fill", "black")
        .attr("fill-opacity", 0.7);





    // Axis for trellis
    var xAxis = d3.axisBottom(xScale).ticks(5);
    trellisG.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,'+trellisHeight+')')
        .call(xAxis);

    var yAxis = d3.axisLeft(agencyScale);
    trellisG.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(0,0)')
        .call(yAxis);



    // Label axis
    trellisG.append('text')
        .attr('class', 'x axis-label')
        .attr('transform', 'translate('+[trellisWidth / 4, trellisHeight + 34]+')')
        .text('Launch Date');

    trellisG.append('text')
        .attr('class', 'y axis-label')
        .attr('transform', 'translate('+[-40, trellisHeight / 4 + 100]+') rotate(270)')
        .text('Space Agencies');



    //append company labels

    trellisG.append('text')
        .attr('class', 'company-label')
        .attr('transform', 'translate('+[trellisWidth / 4, trellisHeight / 4]+')')
        .attr('fill', function(d){
            return colorScale(d.key);
        })
        .text(function(d){
            return d.key;
        });


});
