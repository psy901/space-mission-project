/*********************************************************
 * Define the global layout
 *********************************************************/

const svgWidth = 1400;
const svgHeight = 1500;
const margin = {
  t: 50,
  r: 50,
  b: 50,
  l: 50
};

const svg = d3
  .select('#main')
  .append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight)
  .style('border', '3px #000 solid');
const canvasWidth = svgWidth - margin.l - margin.r;
const canvasHeight = svgHeight - margin.t - margin.b;

const chartWidth = 400;
const chartHeight = 300;

var stackedChart = svg
  .append('g')
  .attr('transform', 'translate(' + [margin.l, canvasHeight - 500] + ')');

/*********************************************************
 * Define layout for the plot parts
 *********************************************************/

// Define axis
var x = d3.scaleTime().range([0, chartWidth]);

var y = d3.scaleLinear().range([chartHeight, 0]);

var xAxis = d3.axisBottom().scale(x);

var yAxis = d3.axisLeft().scale(y);

var stack = d3.stack();

var area = d3
  .area()
  .x(function(d) {
    return x(d.data.launch);
  })
  .y0(function(d) {
    return y(d[0]);
  })
  .y1(function(d) {
    return y(d[1]);
  });

/* Global Variables */
let nodes;
let planets;
let links = [];
const radius = 5;
const yOffsetFixed = 500;
const planetColors = {
  // TODO: define planet colors here
};

// read nodes
d3.json('./data/graph.json', data => {
  nodes = data.nodes;
  planets = data.planets;
});

// reads the parsed file
d3.csv('./data/interplanetary-parsed.csv', (error, data) => {
  /*********************************************************
   * Draw the graph part
   *********************************************************/
  const plot = svg
    .append('g')
    .attr('class', 'plot')
    .attr('transform', `translate(${margin.l}, ${margin.t})`);

  // FIXME: remove later if not used
  let tempNodes = d3
    .nest()
    .key(d => d.from)
    .rollup(leaves => {
      // console.log(leaves);
      const source = d3.map(leaves, d => d.from).keys();
      const target = d3.map(leaves, d => d.to).keys();
      return { target };
    })
    .entries(data);

  // Draw Nodes
  drawNodes(nodes);

  // Draw Links
  // drawLinks(data);
  drawLinks2(data);

  /*********************************************************
   * Draw the stacked area chart
   *********************************************************/

  // Parse the data by decade
  var dataByDecade = parseDataByDecade(data);

  var destByDate = parseDataByDest(data);

  // Draw stacked area chart by planet
  // drawStackedAreas(data, dataByDecade, destByDate);

  // Draw time line chart
});

function date2decade(date) {
  year = date.split('-')[0];
  decade = decade = year[2] * 10;
  return decade;
}

function parseDataByDecade(data) {
  var dataByDecade = {};
  data.forEach(function(d) {
    // Parse the decade
    decade = date2decade(d.launch);

    // Add the data
    if (dataByDecade.hasOwnProperty(decade)) {
      dataByDecade[decade].push(d);
    } else {
      dataByDecade[decade] = [d];
    }
  });
  return dataByDecade;
}

function parseDataByDest(data) {
  // Get the all destinations
  var destination_dist = {};
  data.forEach(function(d) {
    dest = d['to']['name'];
    if (destination_dist.hasOwnProperty(dest)) {
      destination_dist[dest] = destination_dist[dest] + 1;
    } else {
      destination_dist[dest] = 1;
    }
  });

  // Make empty table
  var destByDate = {};
  destByDate['launch'] = [];
  for (var dest in destination_dist) {
    destByDate[dest] = [];
  }

  // Get destination data by date
  data.forEach(function(d) {
    date = d['launch'];
    dest = d['to']['name'];
    destByDate['launch'].push(date);
    for (var key in destination_dist) {
      if (key == dest) {
        destByDate[key].push(1);
      } else {
        destByDate[key].push(0);
      }
    }
  });

  // console.log(destByDate);
  return destByDate;
}

function drawStackedAreas(data, dataByDecade, destByDate) {
  console.log('Draw Stacked Area chart');

  // Set x domain: the range of the launch dates
  x.domain(
    d3.extent(data, function(d) {
      return d.launch;
    })
  );

  // Set y domain: the range of 0 to max(sum(# instances)) for each decade
  var maxNumMissions = -1;
  for (var key in dataByDecade) {
    var val = dataByDecade[key];
    var numMissions = val.length;
    if (maxNumMissions < numMissions) {
      maxNumMissions = numMissions;
    }
  }
  y.domain([0, maxNumMissions]);

  // Get stacks of data
  // var keys = destByDate.columns.filter(function(key) { return key !== 'launch'; })
  var keys = Object.keys(destByDate).filter(function(key) {
    return key !== 'launch';
  });
  stack.keys(keys);
  // console.log(keys);
  // console.log(destByDate);
  // console.log(stack(destByDate));

  var layer = stackedChart
    .selectAll('.layer')
    .data(stack(data))
    .enter()
    .append('g')
    .attr('class', 'layer');

  // console.log(1);
  var z = d3.scaleOrdinal(d3.schemeCategory10);

  layer
    .append('path')
    .attr('class', 'area')
    .style('fill', function(d) {
      // console.log(d);
      return z(d.key);
    })
    .attr('d', area);
  // console.log(1);

  // var browser = svg.selectAll('.browser')
  //   .data(stack(data))
  //   .enter().append('g')
  //   .attr('class', function(d){ return 'browser ' + d.key; })
  //   .attr('fill-opacity', 0.5);

  // stack.order(d3.stackOrderNone);
  // stack.offset(d3.stackOffsetNone);

  // console.log(stack(data));

  // browser.append('path')
  //     .attr('class', 'area')
  //     .attr('d', area)
  //     .style('fill', function(d) { return color(d.key); });

  // browser.append('text')
  //     .datum(function(d) { return d; })
  //     .attr('transform', function(d) { return 'translate(' + x(data[13].date) + ',' + y(d[13][1]) + ')'; })
  //     .attr('x', -6)
  //     .attr('dy', '.35em')
  //     .style("text-anchor", "start")
  //     .text(function(d) { return d.key; })
  //     .attr('fill-opacity', 1);

  // Axes
  stackedChart
    .append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + chartHeight + ')')
    .call(xAxis);

  stackedChart
    .append('g')
    .attr('class', 'y axis')
    .call(yAxis);
}

function drawNodes(nodes) {
  // console.log(nodes);

  // const filteredData = nodes.filter(d => planets.includes(d.name));
  // FIXME: revert
  const filteredData = nodes;

  const xScale = d3
    .scaleLinear()
    .domain([0, filteredData.length - 1])
    .range([radius, canvasWidth - radius]);

  // set eaeh node's x and y position
  filteredData.forEach(function(d, i) {
    d.x = xScale(i);
    d.y = yOffsetFixed;
  });

  // TODO: chnage the color using the planetColors
  const color = d3.scaleOrdinal(d3.schemeCategory10);
  // console.log(nodes.filter(d => planets.includes(d.name)));
  d3.select('.plot')
    .selectAll('.node')
    .data(filteredData)
    .enter()
    .append('circle')
    .attr('class', 'node')
    .attr('id', d => d.name)
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('r', radius)
    .style('fill', d => color(d.name))
    .on('mouseover', d => {
      // TODO: add any mouseover function here
    })
    .on('mouseout', d => {
      // TODO: add any mouseout function here
    });
}

function drawLinks2(data) {
  // filteredData contains only the links between major planets, no cosmos or asteroid
  // FIXME: revert
  // const filteredData = data.filter(
    // d => planets.includes(d.from) && planets.includes(d.to)
  // );

  const filteredData = data;
  // set clip-path
  const clipPath = d3
    .select('.plot')
    .append('clipPath')
    .attr('id', 'cut-off-bottom')
    .append('rect')
    .attr('height', 300)
    .attr('width', 1300)
    .attr('x', 0)
    .attr('y', 200);

  // TODO: make a dictionary for duplicate links e.g. { 'earthToMars': 1}
  linkCount = {};

  filteredData.forEach(d => {
    d.from = nodes.filter(node => d.from == node.name)[0];
    d.to = nodes.filter(node => d.to == node.name)[0];

    const key = d.from.name + '_to_' + d.to.name;
    linkCount[key] = linkCount[key] ? linkCount[key] + 1 : 1;
    const linkNumber = linkCount[key];

    d.link = {};
    d.link.link = key;
    d.link.linkNumber = linkNumber;
    d.link.cx = Math.abs(d.from.x + d.to.x) / 2;
    d.link.cy = yOffsetFixed;
    d.link.rx = Math.abs(d.link.cx - d.to.x);
    d.link.ry = 30 + linkNumber * 5;

    // console.log(d);
  });

  
  const ellipses = d3
  .select('.plot')
  .selectAll('.arc')
  // .data(filteredData.filter(d => d.link.link == 'earth_to_venus'))
  .data(filteredData)
  .enter()
  .append('ellipse')
  .attr('clip-path', 'url(#cut-off-bottom)')
  .attr('class', 'link')
  .attr('cx', d => d.link.cx)
  .attr('cy', d => d.link.cy)
  .attr('rx', d => d.link.rx)
  .attr('ry', d => d.link.ry)
  
  
  console.log(linkCount);
  // console.log(filteredData);
}

function drawLinks(data) {
  // arc returning methods
  const angleScale = d3
    .scaleLinear()
    .range([(3 * Math.PI) / 2, (5 * Math.PI) / 2]);
  const arc = d3.radialLine().angle(d => angleScale(d));

  // replace 'from' and 'to' of passed 'data' with 'nodes'
  data.forEach(d => {
    d.from = nodes.filter(node => d.from == node.name)[0];
    d.to = nodes.filter(node => d.to == node.name)[0];
  });

  // console.log(data);
  // console.log(
  // data.filter(
  // d => planets.includes(d.to.name) && planets.includes(d.from.name)
  // )
  // );
  // add data

  d3.select('.plot')
    .selectAll('.links')
    .data(
      data.filter(
        d => planets.includes(d.to.name) && planets.includes(d.from.name)
      )
    )
    .enter()
    .append('path')
    .attr('class', 'link')
    .attr('transform', (d, i) => {
      // console.log(i);
      if (!d.from || !d.to) {
        // console.log(d);
        // skip if no trip exists
        return;
      }
      const xOffset = d.from.x + (d.to.x - d.from.x) / 2;
      const yOffset = yOffsetFixed;
      return `translate(${xOffset}, ${yOffset})`;
    })
    .attr('d', d => {
      if (!d.from || !d.to) {
        // skip if no trip exists
        return;
      }
      // distance between two planets
      const xDist = Math.abs(d.from.x - d.to.x);

      // set the radius of the arc to half of the distance
      arc.radius(xDist / 2);
      // console.log(xDist);

      // creates a smooth curve
      const points = d3.range(0, Math.ceil(xDist / 3));
      angleScale.domain([0, points.length - 1]);
      return arc(points);
    });
}
