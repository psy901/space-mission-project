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
  .attr('class', 'legend')
  .attr('transfrom', 'translate(-100, 0)')
  .attr('width', 500)
  .attr('height', 500);
var dateParse = d3.timeParse('%Y');
var statusArray = [
  'China',
  'EU',
  'India',
  'Japan',
  'Russia',
  'USA',
  'Soviet Union'
];

/*********************************************************
 * Define global variables for trellis
 *********************************************************/
// Read stacked data

/*********************************************************
 * Draw the stacked area chat
 *********************************************************/
var t_svg = d3
  .select('#main3')
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
    .attr('class', 'trellisRect')
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

  dataset.forEach(function(price) {
    price.launch = parseDate(price.launch);
    price.finish = parseDate(price.finish);
  });

  t_filteredData = dataset.filter(function(d) {
    return d['object'] == 'planet';
  });

  var countryNames = d3
    .set(
      dataset.map(function(d) {
        return d.country;
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

  countryScale = d3
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

  var yGrid = d3
    .axisLeft(countryScale)
    .tickSize(-trellisWidth, 0, 0)
    .tickFormat('');

  var colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(planetNames);

  // Setting for type of missions
  // XXXXXXXXXX
  var typeDomain = ['lander', 'towards', 'orbit', 'flyby', 'rover', 'ongoing'];
  var blue = '#21BFD1';
  var red = '#E54925';
  var yellow = '#E5D925';
  var color_of_type = {
    lander: blue,
    towards: 'black',
    orbit: red,
    flyby: yellow,
    rover: blue,
    ongoing: 'white'
  };

  var legendColorScale = d3
    .scaleOrdinal()
    .domain(typeDomain)
    .range(blue, 'black', red, yellow, blue);

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
    // .attr("d", function(d,i, j) {
    // return d3.svg.symbol().type("triangle-down");
    // })
    .attr('r', 4)
    .attr('cx', function(d) {
      return xScale(d.launch);
    })
    .attr('cy', function(d) {
      return countryScale(d.country) + 10;
    })
    .attr('fill', function(d) {
      if (d['success'] == 'False') {
        return 'none';
      } else {
        return color_of_type[d['type']];
      }
    })
    .attr('stroke', function(d) {
      return color_of_type[d['type']];
    })
    .attr('opacity', 1);

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
    .attr('class', 'trellisAxis')
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

  trellisG
    .append('text')
    .attr('class', 'y axis-label')
    .attr(
      'transform',
      'translate(' + [-50, trellisHeight / 4 + 50] + ') rotate(270)'
    );

  // Append country labels
  trellisG
    .append('text')
    .attr('class', 'company-label')
    .attr('id', d => d.key)
    .attr(
      'transform',
      'translate(' + [40 + trellisWidth / 4, trellisHeight / 4 - 55] + ')'
    )
    // .attr('fill', function(d) {
      // return colorScale(d.key);
    // })
    .text(function(d) {
      return d.key;
    });

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
    .attr('class', 'country-label')
    .attr(
      'transform',
      'translate(' + [53 + trellisWidth / 4, trellisHeight / 4 - 55] + ')'
    )
    .attr('fill', function(d) {
      return colorScale(d.key);
    });

  var trellis_legend = d3
    .legendColor()
    .labelFormat(d3.format('.2f'))
    .shapeWidth(50)
    .orient('horizontal')
    .labelAlign('start')
    .scale(legendColorScale)
    .useClass(true);

  trellisG.select('trellis').call(trellis_legend);
}

function drawStackedAreas(parsedData) {
  const stackAreaCanvas = sc_svg
    .append('g')
    .attr('class', 'stackedArea')
    .attr('transform', 'translate(0, 100)');
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
  // console.log('DRAWING STACKED CHART!');
  // console.log(parsedData[0].date)

  const parseDate = d3.timeParse('%m/%d/%Y');
  const start = parseDate('10/10/1960');
  const end = parseDate('9/8/2016');
  var x = d3
    .scaleTime()
    // .domain([parsedData[0].date, parsedData[parsedData.length - 1].date])
    .domain([start, end])
    .range([0, sc_width]);

  var y = d3
    .scaleLinear()
    // .domain([0, d3.max(layers, stackMax)])
    .domain([0, 7])
    .range([sc_height, 0]);

  var xAxis = d3.axisBottom(x);
  var yAxis = d3
    .axisLeft(y)
    .tickValues([0, 1, 2, 3, 4, 5, 6, 7])
    .tickFormat(d3.format('d'));

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

  // XXXXXXXXXXXXXXXXXXXXX
  // var typeDomain = ['lander', 'towards', 'orbit', 'flyby', 'rover', 'ongoing'];
  // var blue = '#21BFD1';
  // var red = '#E54925';
  // var yellow = '#E5D925';
  // var color_of_type = {
  //   lander: blue,
  //   towards: 'black',
  //   orbit: red,
  //   flyby: yellow,
  //   rover: blue,
  //   ongoing: 'white'
  // };
  // d3.colorOrdinal....? // find like this

  var colors = statusArray.map(function(d, i) {
    return d3.interpolateWarm(i / statusArray.length);
  });

  
  var colorScale = d3
    .scaleOrdinal()
    .domain(statusArray)
    .range(colors);

  var legendOffset = stackedContainer.margin().left() + 30;

  var legend = d3
    .legendColor()
    .shapeWidth(50)
    .cells(statusArray.length)
    .orient('horizontal')
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
    .curve(d3.curveCatmullRom.alpha(0.5));

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
    .attr('transform', 'translate(' + legendOffset.toString() + ', 0)');

  stackAreaCanvas
    .select('.legend')
    .call(legend)
    .attr('transform', 'translate(70, -40)');

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
    .attr('class', 'node')
    .attr('id', d => d.name)
    .on('mouseover', handleMouseOverNode)
    .on('mouseout', handleMouseOutNode)
    .on('click', handleMouseClick);

    nodesEnter
    .merge(prevNodes)
    .append('circle')
    // .transition()
    // .duration(600)
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('r', d => (planets.includes(d.name) ? planetRadius : nonPlanetRadius))
    .attr('class', d => (!planets.includes(d.name) ? 'asteroid' : null))
    .attr('id', d => d.name)


  nodesEnter
    .append('text')
    .attr('class', d => d.name)
    .attr('transform', 'translate(0, 10)')
    .attr('x', d => d.x - 20)
    .attr('y', d => d.y + 20)
    .text(d => {
      if (planets.includes(d['name'])) return d['name'];
    });

  prevNodes.exit().remove();
}

function handleMouseClick() {
  const click = d3.select(this);
  let nodeName = click._groups[0][0].__data__.name;
  
  // find all the missions that has 'from' == nodeName

  const missions = $('#from-'+nodeName);
  console.log(missions)


  // find all arcs with the mission names, and put clicked class


  if ($('#'+nodeName).hasClass('clicked')) {
    // the node was already clicked; remove the 'clicked
    $('#'+nodeName).removeClass('clicked');
    $('#'+nodeName).removeClass('nodeHover');
    $('.company-label.clicked').removeClass('clicked');

    

  } else {
    // untoggle any 'clicked' node and add to current one
    $('.node.clicked').removeClass('clicked');
    $('.company-label.clicked').removeClass('clicked');
    
    $('#'+nodeName).addClass('clicked');
    $('.company-label'+'#'+nodeName).addClass('clicked');

    // find all arcs with 'clicked' and remove the class
  }


  updateStackedAreas(nodeName);
  updateTrellisTitle(nodeName);
}

function updateTrellisTitle(nodeName) {
  const items = d3.selectAll('.company-label')._groups[0];
  // console.log(typeof(items))
  // console.log(items)
  const target = Array.from(items).filter(item => {
    return item.__data__.key == nodeName
  });
  // target.attr('stroke', 'none');
  // console.log(target);
  // d3.select(target).classed("hmm")

  // console.log(target)
}

function handleMouseOverNode() {
  const hover = d3.select(this);
  let name = hover._groups[0][0].__data__.name;
  if (!planets.includes(name)) {
    nodeTip.show(name);
  } else {
    hover.classed('clickable', true);
  }
  // change color here
  hover.classed('nodeHover', true);
}

function handleMouseOutNode() {
  nodeTip.hide();
  const hover = d3.select(this);
  // console.log(hover)
  // console.log(hover._groups[0][0].className);
  hover.classed('nodeHover', false);
  hover.classed('clickable', false);
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
    .attr('class', d => d.success == 'False' ? 'failed' : null)
    // .attr('id', d => `from-${d.from}`)
    .attr('cx', d => d.link.cx)
    .attr('cy', d => d.link.cy)
    .attr('rx', d => d.link.rx)
    .attr('ry', d => d.link.ry)
    .on('mouseover', handleMouseOverArc)
    .on('mouseout', handleMouseOutArc);
  // .on('click', handleMouseClick);

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
  const startDate = String(filteredData[0].launch).split('00:')[0];
  const endDate = String(filteredData[filteredData.length - 1].finish).split(
    '00:'
  )[0];
  // console.log(endDate == 'null');
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
    .text(`End: ${endDate == 'null' ? 'Ongoing' : endDate}`)
    .attr('transform', 'translate(0, 60)');
}



function handleMouseOverArc(d, i) {
  const hover = d3.select(this);
  let missionName = hover._groups[0][0].id.replace(/[\s()'"]/g, '_');
  // console.log(missionName)
  d3.selectAll('#' + missionName)
  .classed('arcHover', true)
    // .style('stroke', 'red')
    // .style('stroke-width', '4px');

  updateInfoChart(missionName);
}

function handleMouseOutArc(d, i) {
  let missionId = d3.select(this)._groups[0][0].id;
  missionId = missionId.replace(/[\s()'"]/g, '_');
  console.log(missionId)
  d3.selectAll('#' + missionId)
    .classed('arcHover', false);
    // .style('stroke', 'white')
    // .style('stroke-width', '2px');

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
  if (currentPlanet == filterKey) {
    // console.log(currentPlanet, filterKey);
    return;
  }
  currentPlanet = filterKey;
  const filename = `stacked-${filterKey}.csv`;

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

    if (planets.includes(currentPlanet) || currentPlanet == 'all') {
      d3.select('.stackedArea').remove();
      drawStackedAreas(parsedData);
    }
  });
}
