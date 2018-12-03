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
let datum;
let planets;
let links = [];
const planetRadius = 12;
const nonPlanetRadius = 7;
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

  datum = data;
  updateArcChart('show-planets');

  /*********************************************************
   * Draw the stacked area chart
   *********************************************************/

  // Parse the data by decade
  var dataByDecade = parseDataByDecade(data);

  var destByDate = parseDataByDest(data);

  // Draw stacked area chart by planet
  // FIXME: what do do with it?
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

function drawNodes(filteredNodes) {
  // const earth = filteredNodes.filter(node => node.name == 'earth');
  // console.log(earth)

  // TODO: chnage the color using the planetColors

  const nodeTip = d3
    .tip()
    .attr('class', 'd3-tip')
    .offset([45, 0])
    .html(d => {
      return '<strong>' + d['name'] + '</strong>';
    });
  svg.call(nodeTip);

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const canvas = d3.select('.plot');
  const prevNodes = canvas.selectAll('.node').data(filteredNodes);

  const nodesEnter = prevNodes
    .enter()
    .append('circle')
    .attr('class', 'node');

  nodesEnter
    .merge(prevNodes)
    // .transition()
    // .duration(600)
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('r', d => planets.includes(d.name) ? planetRadius : nonPlanetRadius)
    .style('fill', d => color(d.name))
    .on('mouseover', nodeTip.show)
    .on('mouseout', nodeTip.hide);

  nodesEnter
    .append('text')
    .attr('class', 'nodeName')
    .attr('x', d => d.x - 20)
    .attr('y', d => d.y + 20)
    .text(d => {
      if (planets.includes(d['name'])) return d['name'];
    });

  prevNodes.exit().remove();
}

function drawLinks(filteredData) {
  // filteredData contains only the links between major planets, no cosmos or asteroid

  // set clip-path
  const clipPath = d3
    .select('.plot')
    .append('clipPath')
    .attr('id', 'cut-off-bottom')
    .append('rect')
    .attr('height', 400)
    .attr('width', 1300)
    .attr('x', 0)
    .attr('y', 100);

  // make a dictionary for duplicate links e.g. { 'earthToMars': 1}
  const linkCount = {};

  // console.log(filteredData);
  let count = 0;

  // generate arc info for each arc
  filteredData.forEach(d => {
    d.fromInfo = nodes.filter(node => d.from == node.name)[0];
    d.toInfo = nodes.filter(node => d.to == node.name)[0];
    // console.log('after', d.from);
    // console.log(d.fromInfo, d.toInfo)

    const key = d.fromInfo.name + '_to_' + d.toInfo.name;

    linkCount[key] = linkCount[key] ? linkCount[key] + 1 : 1;
    const linkNumber = linkCount[key];

    d.link = {};
    d.link.link = key;
    d.link.linkNumber = linkNumber;
    d.link.cx = Math.abs(d.fromInfo.x + d.toInfo.x) / 2;
    d.link.cy = yOffsetFixed;
    d.link.rx = Math.abs(d.link.cx - d.toInfo.x);
    d.link.ry = 30 + linkNumber * 7;
  });

  // console.log(filteredData);

  const prevArcs = d3
    .select('.plot')
    .selectAll('.arc')
    .data(filteredData);

  const arcsEnter = prevArcs
    .enter()
    .append('ellipse')
    .attr('clip-path', 'url(#cut-off-bottom)')
    .attr('class', 'arc')
    .attr('id', d => d.name.replace(/[\s()'"]/g, "-"));

  arcsEnter
    .merge(prevArcs)
    // .transition()
    // .duration(600)
    .attr('cx', d => d.link.cx)
    .attr('cy', d => d.link.cy)
    .attr('rx', d => d.link.rx)
    .attr('ry', d => d.link.ry)
    .on('mouseover', handleMouseOverArc)
    .on('mouseout', handleMouseOutArc);

  prevArcs.exit().remove();
}

function handleMouseOverArc(d, i) {
  const hover = d3.select(this);
  let missionId = hover._groups[0][0].id.replace(/[\s()'"]/g, '-');
  // console.log(missionId)
  d3.selectAll('#' + missionId)
    .style('stroke', 'red')
    .style('stroke-width', '4px');
}

function handleMouseOutArc(d, i) {
  let missionId = d3.select(this)._groups[0][0].id;
  missionId = missionId.replace(/[\s()'"]/g, '-');
  d3.selectAll('#' + missionId)
    .style('stroke', '#888888')
    .style('stroke-width', '2px');
}

function onCategoryChanged() {
  const select = d3.select('#categorySelect').node();
  const filterKey = select.options[select.selectedIndex].value;
  updateArcChart(filterKey);
}

function updateArcChart(filterKey) {
  // filter the data for 'nodes' and 'data'

  const filteredNodes =
    filterKey == 'show-planets'
      ? nodes.filter(d => planets.includes(d.name))
      : nodes;

  const distanceExtent = d3.extent(filteredNodes, d =>
    parseFloat(d['distance'])
  );

  const distanceScale = d3
    .scaleLog()
    .domain(distanceExtent)
    // .domain([0, filteredNodes.length - 1])
    .range([planetRadius, canvasWidth - planetRadius]);

  // console.log(filteredNodes);

  // set eaeh node's x and y position
  filteredNodes.forEach(function(d, i) {
    d.x = distanceScale(d['distance']);
    // d.x = distanceScale(i);
    d.y = yOffsetFixed;
  });

  // Draw Nodes
  drawNodes(filteredNodes);

  // console.log(datum);
  const filteredData =
    filterKey == 'show-planets'
      ? datum.filter(d => planets.includes(d.from) && planets.includes(d.to))
      : datum;

  // Draw Links
  drawLinks(filteredData);
}
