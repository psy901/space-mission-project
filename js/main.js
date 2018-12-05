/*********************************************************
 * Define the global layout
 *********************************************************/
const svgWidth = 1400;
const svgHeight = 500;
const margin = {
  t: -100,
  r: 50,
  b: 50,
  l: 100
};

// Global layout
const canvasWidth = svgWidth - margin.l - margin.r;
const canvasHeight = svgHeight - margin.t - margin.b;
const chartWidth = 500;
const chartHeight = 300;

const infoChartWidth = 250;
const infoChartHeight = 220;

/*********************************************************
 * Generate svg
 *********************************************************/
const svg = d3
  .select('#main')
  .append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight);
// .style('border', '3px #000 solid');

const infoChart = svg
  .append('g')
  .attr('transform', 'translate(1000, 100)')
  .attr('class', 'infoChart');

/*********************************************************
 * Define global variables for the upper plot parts
 *********************************************************/

/* Global Variables */
let nodes;
let datum;
let planets;
let links = [];
const planetRadius = 10;
const nonPlanetRadius = 5;
const yOffsetFixed = 500;
let currentPlanet = '';

// tooltip for node
const nodeTip = d3
  .tip()
  .attr('class', 'd3-tip')
  .offset([65, 5])
  .html(name => {
    return '<strong>' + name + '</strong>';
  });
svg.call(nodeTip);

/*********************************************************
 * Define global variables for StackedChart
 *********************************************************/
var sc_svg = d3
  .select('#main2')
  .append('svg')
  .attr('transfrom', 'translate(-100, 0)')
  .attr('width', 500)
  .attr('height', 400);
var dateParse = d3.timeParse('%Y');
var statusArray = [
  'China',
  'EU',
  'India',
  'Japan',
  'Russia',
  'Soviet Union',
  'USA'
];
// 'China', 'EU', 'India', 'Japan', 'Russia', 'Soviet Union', 'USA'];

/*********************************************************
 * Define global variables for trellis
 *********************************************************/
// Read stacked data

/*********************************************************
 * Draw the stacked area chat
 *********************************************************/
var t_svg = d3
  .select('#main2')
  .append('svg')
  .attr('width', 1000)
  .attr('height', 500);

var t_svgWidth = +t_svg.attr('width');
var t_svgHeight = +t_svg.attr('height');
var t_padding = { t: 40, r: 10, b: 40, l: 40 };
trellisWidth = t_svgWidth / 4 - t_padding.l - t_padding.r;
trellisHeight = t_svgHeight / 2 - t_padding.t - t_padding.b;

/*********************************************************
 * Read data
 *********************************************************/

// read nodes
d3.json('./data/graph.json', (error, data) => {
  if (error) {
    console.log('error!');
    return;
  }
  nodes = data.nodes;
  planets = data.planets;
});

// read interplanetary data
d3.csv('./data/interplanetary-parsed-with-country.csv', (error, data) => {
  if (error) {
    console.log('error');
    return;
  }
  /*********************************************************
   * Draw the arc graph
   *********************************************************/
  const plot = svg
    .append('g')
    .attr('class', 'plot')
    .attr('transform', `translate(${margin.l}, ${margin.t})`);

  data.forEach(d => {
    d.name = d.name.replace(/[\s()'"]/g, '_');
  });
  datum = data;
  updateArcChart('show-planets');
  updateStackedAreas('all');
  /*********************************************************
   * Draw the trellis
   *********************************************************/
  dataset = data;
  drawTrellis();
});
/*
// Read stacked data
d3.csv("./data/stacked-mars.csv", function (error, data) {
  if (error) throw error;
  // Convert string values to date, numbers
  marsData = data.map(function (d) {
    var dataObject = {
      date: dateParse(d.date)
    };
    statusArray.forEach(function (s) {
      dataObject[s] = +d[s];
    })
    return dataObject;
   });

  console.log(data);
  // drawStackedAreas();
})

  /*********************************************************
   * Draw the stacked area chart
   *********************************************************/

function drawTrellis() {
  t_svg
    .selectAll('.background')
    .data(['A', 'B', 'C', 'C', 'A', 'B', 'C', 'C']) // dummy data
    .enter()
    .append('rect') // Append 4 rectangles
    .attr('class', 'background')
    .attr('width', trellisWidth) // Use our trellis dimensions
    .attr('height', trellisHeight)
    .attr('transform', function(d, i) {
      // Position based on the matrix array indices.
      // i = 1 for column 1, row 0)
      var tx =
        (i % 4) * (trellisWidth + t_padding.l + t_padding.r) + t_padding.l;
      var ty =
        Math.floor(i / 4) * (trellisHeight + t_padding.t + t_padding.b) +
        t_padding.t;
      return 'translate(' + [tx, ty] + ')';
    });

  var parseDate = d3.timeParse('%Y-%m-%d');
  var dateDomain = [new Date(1960, 0), new Date(2018, 0)];

  dataset.forEach(function(price) {
    price.launch = parseDate(price.launch);
    price.finish = parseDate(price.finish);
  });
  var parseDate = d3.timeParse('%Y-%m-%d');
  var dateDomain = [new Date(1960, 0), new Date(2018, 0)];
  var countryDomain = [
    'USA',
    'Russia',
    'Soviet Union',
    'China',
    'India',
    'Japan',
    'EU'
  ];
  var priceDomain = [0, 223.02];

  t_filteredData = dataset.filter(function(d) {
    return d['object'] == 'planet';
  });

  var agencyNames = d3
    .set(
      dataset.map(function(d) {
        return d.agency;
      })
    )
    .values();

  var nested = d3
    .nest()
    .key(function(c) {
      return c.to;
    })
    .entries(t_filteredData);

  var trellisG = t_svg
    .selectAll('.trellis')
    .data(nested)
    .enter()
    .append('g')
    .attr('class', 'trellis')
    .attr('transform', function(d, i) {
      var tx =
        (i % 4) * (trellisWidth + t_padding.l + t_padding.r) + t_padding.l;
      var ty =
        Math.floor(i / 4) * (trellisHeight + t_padding.t + t_padding.b) +
        t_padding.t;
      return 'translate(' + [tx, ty] + ')';
    });

  var xScale = d3
    .scaleTime()
    .domain(dateDomain)
    .range([0, trellisWidth]);
  var countryNames = d3
    .set(
      dataset.map(function(d) {
        return d.country;
      })
    )
    .values();

  agencyScale = d3
    .scaleBand()
    .domain(countryNames)
    .range([trellisHeight, 0])
    .padding(0.1);

  var planetNames = nested.map(function(d) {
    return d.key;
  });

  var colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(planetNames);

  // add grid
  var xGrid = d3
    .axisTop(xScale)
    .ticks(5)
    .tickSize(-trellisHeight, 0, 0)
    .tickFormat('');
  countryScale = d3
    .scaleBand()
    .domain(countryNames)
    .range([trellisHeight, 0])
    .padding(0.1);

  trellisG
    .append('g')
    .attr('class', 'x grid')
    .call(xGrid);

  var yGrid = d3
    .axisLeft(agencyScale)
    .tickSize(-trellisWidth, 0, 0)
    .tickFormat('');

  trellisG
    .append('g')
    .attr('class', 'y grid')
    .call(yGrid);
  var colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(planetNames);

  // add grid
  var xGrid = d3
    .axisTop(xScale)
    .ticks(5)
    .tickSize(-trellisHeight, 0, 0)
    .tickFormat('');

  var yGrid = d3
    .axisLeft(countryScale)
    .tickSize(-trellisWidth, 0, 0)
    .tickFormat('');

  trellisG
    .append('g')
    .attr('class', 'y grid')
    .attr('opacity', 0.2)
    .call(yGrid);

  trellisG
    .selectAll('circle')
    .data(function(d) {
      return d.values;
    })
    .enter()
    .append('circle')
    .attr('r', 2)
    .attr('cx', function(d) {
      return xScale(d.launch);
    })
    .attr('cy', function(d) {
      return countryScale(d.country) + 10;
    })
    .attr('fill', 'white')
    .attr('fill-opacity', 1);

  // Axis for trellis
  var xAxis = d3.axisBottom(xScale).ticks(5);

  trellisG
    .append('g')
    .attr('class', 'trellisAxis')
    .attr('transform', 'translate(0,' + trellisHeight + ')')
    .call(xAxis);

  var yAxis = d3.axisLeft(countryScale);

  trellisG
    .append('g')
    .attr('class', 'y axis')
    .style('display', (d, i) => {
      if (d.key != 'mars' && d.key != 'mercury') {
        return 'none';
      }
    })
    .attr('transform', 'translate(0,0)')
    .call(yAxis);

  // Label axis
  trellisG
    .append('text')
    .attr('class', 'x axis-label')
    .attr(
      'transform',
      'translate(' + [35 + trellisWidth / 4, trellisHeight + 34] + ')'
    );
  // .text('Launch Date');

  trellisG
    .append('text')
    .attr('class', 'y axis-label')
    .attr(
      'transform',
      'translate(' + [-50, trellisHeight / 4 + 50] + ') rotate(270)'
    );
  // .text('Countries');

  // Append country labels
  trellisG
    .append('text')
    .attr('class', 'company-label')
    .attr(
      'transform',
      'translate(' + [40 + trellisWidth / 4, trellisHeight / 4 - 55] + ')'
    )
    .attr('fill', function(d) {
      return colorScale(d.key);
    })
    .text(function(d) {
      return d.key;
    });

  trellisG
    .selectAll('circle')
    .data(function(d) {
      return d.values;
    })
    .enter()
    .append('circle')
    .attr('r', 2)
    .attr('cx', function(d) {
      return xScale(d.launch);
    })
    .attr('cy', function(d) {
      return agencyScale(d.agency) + 20;
    })
    .attr('fill', 'black')
    .attr('fill-opacity', 0.7);

  // Axis for trellis
  var xAxis = d3.axisBottom(xScale).ticks(5);
  trellisG
    .append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + trellisHeight + ')')
    .call(xAxis);

  var yAxis = d3.axisLeft(agencyScale);
  trellisG
    .append('g')
    .attr('class', 'y axis')
    .style('display', (d, i) => {
      console.log(d.key);
      if (d.key != 'mars' && d.key != 'mercury') {
        return 'none';
      }
    })
    .attr('transform', 'translate(0,0)')
    .call(yAxis);

  // Label axis
  trellisG
    .append('text')
    .attr('class', 'x axis-label')
    .attr(
      'transform',
      'translate(' + [trellisWidth / 4, trellisHeight + 34] + ')'
    )

  trellisG
    .append('text')
    .attr('class', 'y axis-label')
    .attr(
      'transform',
      'translate(' + [-40, trellisHeight / 4 + 100] + ') rotate(270)'
    )

  //append company labels
  trellisG
    .append('text')
    .attr('class', 'company-label')
    .attr(
      'transform',
      'translate(' + [trellisWidth / 4, trellisHeight / 4] + ')'
    )
    .attr('fill', function(d) {
      return colorScale(d.key);
    })
    .text(function(d) {
      return d.key;
    });
}

function drawStackedAreas(parsedData) {
  const stackAreaCanvas = sc_svg.append('g').attr('class', 'stackedArea');
  var stackedContainer = d3_container
    .container()
    .height(400)
    .width(500)
    .margin(10, 80, 50, 50);
  var sc_width = stackedContainer.contentWidth();
  var sc_height = stackedContainer.contentHeight();
  stackAreaCanvas.call(stackedContainer);
  var content = stackedContainer.content();

  var stack = d3
    .stack()
    .keys(statusArray)
    .offset(d3.stackOffsetNone);

  var layers = stack(parsedData);
  console.log('DRAWING STACKED CHART!');

  var x = d3
    .scaleTime()
    .domain([parsedData[0].date, parsedData[parsedData.length - 1].date])
    .range([0, sc_width]);

  var y = d3
    .scaleLinear()
    .domain([0, d3.max(layers, stackMax)])
    .range([sc_height, 0]);

  var xAxis = d3.axisBottom(x);
  var yAxis = d3
    .axisLeft(y)
    .tickFormat(d3.format('d'))
    .tickValues([0, 1, 2, 3, 4, 5, 6, 7]);

  var gX = content
    .append('g')
    .attr('transform', 'translate(0,' + sc_height + ')')
    .attr('class', 'axis axis--x')
    .call(xAxis)
    .select('.domain')
    .remove();

  var gY = content
    .append('g')
    .attr('class', 'axis axis--y')
    .call(yAxis);

  var colors = statusArray.map(function(d, i) {
    return d3.interpolateWarm(i / statusArray.length);
  });

  var colorScale = d3
    .scaleOrdinal()
    .domain(statusArray)
    .range(colors);

  var legendOffset = stackedContainer.margin().left() + 300;

  var legend = d3
    .legendColor()
    .shapeWidth(50)
    .cells(statusArray.length)
    .orient('vertical')
    .labelAlign('start')
    .scale(colorScale);

  var area = d3
    .area()
    .x(function(d, i) {
      return x(d.data.date);
    })
    .y0(function(d) {
      return y(d[0]);
    })
    .y1(function(d) {
      return y(d[1]);
    })
    .curve(d3.curveBasis);

  var layerGroups = content
    .selectAll('.layer')
    .data(layers)
    .enter()
    .append('g')
    .attr('width', 400)
    .attr('class', 'layer');

  stackAreaCanvas
    .append('g')
    .attr('class', 'legend')
    .attr('transform', 'translate(' + legendOffset.toString() + ',20)');

  stackAreaCanvas.select('.legend').call(legend);

  layerGroups
    .append('path')
    .attr('d', area)
    .attr('fill', function(d, i) {
      return colors[i];
    });

  function stackMax(layer) {
    return d3.max(layer, function(d) {
      return d[1];
    });
  }
}

function drawNodes(filterKey) {
  const filteredNodes =
    filterKey == 'show-planets'
      ? nodes.filter(d => planets.includes(d.name))
      : nodes;

  // const distanceExtent = d3.extent(filteredNodes, d =>
  // parseFloat(d['distance'])
  // );
  // console.log(distanceExtent);
  const distanceExtent = [18, 6334];
  const distanceScale = d3
    .scaleLog()
    .domain(distanceExtent)
    // .domain([0, filteredNodes.length - 1])
    .range([planetRadius, canvasWidth - planetRadius]);

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  // set eaeh node's x and y position
  filteredNodes.forEach(function(d, i) {
    d.x = distanceScale(d['distance']);
    d.y = yOffsetFixed;
  });

  const prevNodes = d3
    .select('.plot')
    .selectAll('.node')
    .data(filteredNodes, d => {
      // console.log(d);
      data = {};
      data['x'] = d.x;
      data['y'] = d.y;
      data['name'] = d.name;
      return data;
    });

  const nodesEnter = prevNodes
    .enter()
    .append('g')
    .attr('class', 'node');

  nodesEnter
    .merge(prevNodes)
    .append('circle')
    // .transition()
    // .duration(600)
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('r', d => (planets.includes(d.name) ? planetRadius : nonPlanetRadius))
    .attr('class', d => (!planets.includes(d.name) ? 'asteroid' : null))
    // .style('fill', d => color(d.name))
    .on('mouseover', handleMouseOverNode)
    .on('mouseout', handleMouseOutNode)
    .on('click', handleMouseClick);

  nodesEnter
    .append('text')
    .attr('class', 'nodeName')
    .attr('transform', 'translate(0, 10)')
    .attr('x', d => d.x - 20)
    .attr('y', d => d.y + 20)
    .text(d => {
      if (planets.includes(d['name'])) return d['name'];
    });
  // console.log(prevNodes);
  prevNodes.exit().remove();
}

function handleMouseOverNode() {
  const hover = d3.select(this);
  let name = hover._groups[0][0].__data__.name;
  if (!planets.includes(name)) {
    nodeTip.show(name);
  }

  // change color here
  hover.classed('nodeHover', true);
}

function handleMouseOutNode() {
  nodeTip.hide();
  const hover = d3.select(this);
  hover.classed('nodeHover', false);
}

function drawArcs(filteredData) {
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

  const prevArcs = d3
    .select('.plot')
    .selectAll('.arc')
    .data(filteredData);

  const arcsEnter = prevArcs
    .enter()
    .append('ellipse')
    .attr('clip-path', 'url(#cut-off-bottom)')
    .attr('class', 'arc');

  arcsEnter
    .merge(prevArcs)
    // .transition()
    // .duration(600)
    .attr('id', d => d.name.replace(/[\s()'"]/g, '_'))
    .attr('cx', d => d.link.cx)
    .attr('cy', d => d.link.cy)
    .attr('rx', d => d.link.rx)
    .attr('ry', d => d.link.ry)
    .on('mouseover', handleMouseOverArc)
    .on('mouseout', handleMouseOutArc)
    .on('click', handleMouseClick);

  prevArcs.exit().remove();
}

function drawInfoChart(filteredData) {
  if (!filteredData) {
    console.log('no data available');
    return;
  }

  // console.log(filteredData);
  const chart = d3
    .select('.infoChart')
    .append('g')
    .attr('class', 'chart');

  // sort an array of missions in the order of 'launch' date
  const parseDate = d3.timeParse('%m/%d/%Y');
  filteredData.sort((a, b) => {
    return parseDate(a.launch) - parseDate(b.launch);
  });

  const missionName = filteredData[0].name;
  const missionAgency = filteredData[0].agency;
  const startDate = filteredData[0].launch;
  const endDate = filteredData[filteredData.length - 1].finish;

  chart
    .append('text')
    .attr('class', 'infoDesc')
    .text(`Mission: ${missionName}`);

  chart
    .append('text')
    .attr('class', 'infoDesc')
    .text(`Agency: ${missionAgency}`)
    .attr('transform', 'translate(0, 20)');

  chart
    .append('text')
    .attr('class', 'infoDesc')
    .text(`Start: ${startDate}`)
    .attr('transform', 'translate(0, 40)');

  chart
    .append('text')
    .attr('class', 'infoDesc')
    .text(`End: ${endDate}`)
    .attr('transform', 'translate(0, 60)');

  // TODO: add 'missionName', 'agency' 'startDate', 'endDate', 'hubs'

  // infoChart
  // .append('rect')
  // .attr('width', infoChartWidth)
  // .attr('height', infoChartHeight);
  // Draw a template here

  // if fileterdData == null (no click), just draw nothing?

  // update merge exit occur
}

function handleMouseClick(d, i) {
  const click = d3.select(this);
  let nodeName = click._groups[0][0].__data__.name;

  // call updateStackedChart
  updateStackedAreas(nodeName);
}

function handleMouseOverArc(d, i) {
  const hover = d3.select(this);
  let missionName = hover._groups[0][0].id.replace(/[\s()'"]/g, '_');
  // console.log(missionName)
  d3.selectAll('#' + missionName)
    .style('stroke', 'red')
    .style('stroke-width', '4px');

  // TODO: update the right-corner chart
  updateInfoChart(missionName);
}

function handleMouseOutArc(d, i) {
  let missionId = d3.select(this)._groups[0][0].id;
  missionId = missionId.replace(/[\s()'"]/g, '_');
  d3.selectAll('#' + missionId)
    .style('stroke', '#888888')
    .style('stroke-width', '2px');

  updateInfoChart(null);
}

function onCategoryChanged() {
  const select = d3.select('#categorySelect').node();
  const filterKey = select.options[select.selectedIndex].value;
  updateArcChart(filterKey);
}

function updateArcChart(filterKey) {
  // filter the data for 'nodes' and 'data'

  // Draw Nodes
  drawNodes(filterKey);
  // drawNodes(filteredNodes);

  // console.log(datum);
  const filteredData =
    filterKey == 'show-planets'
      ? datum.filter(d => planets.includes(d.from) && planets.includes(d.to))
      : datum;

  // Draw Links
  drawArcs(filteredData);
  drawNodes(filterKey);
}

function updateInfoChart(missionName) {
  const filteredData = datum.filter(d => d.name == missionName);
  // console.log(filteredData);
  if (!missionName) {
    d3.select('.chart').remove();
  } else {
    drawInfoChart(filteredData);
  }
}

function updateStackedAreas(filterKey) {
  // TODO: update global variable for stacked Chart here
  if (currentPlanet == filterKey) {
    console.log(currentPlanet, filterKey);
    return;
  }
  d3.select('.stackedArea').remove();
  // d3.select('.content').remove();
  currentPlanet = filterKey;
  const filename = `stacked-${filterKey}.csv`;
  console.log(filename);

  d3.csv(`./data/${filename}`, function(error, data) {
    if (error) throw error;
    // Convert string values to date, numbers
    parsedData = data.map(function(d) {
      var dataObject = {
        date: dateParse(d.date)
      };
      statusArray.forEach(function(s) {
        dataObject[s] = +d[s];
      });
      return dataObject;
    });
    drawStackedAreas(parsedData);
  });
  // parsedData = if name == 'none' allData if name == mars marsedata...ANGLE_instanced_arrays.VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE
}
