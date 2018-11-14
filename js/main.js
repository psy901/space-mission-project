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

/* Global Variables  */
let nodes;
let planets;
let links = [];
const radius = 5;
const yOffsetFixed = 700;
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
  // console.log(data);
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
  drawLinks(data);
  // drawLinks2(data);
});

function drawNodes(nodes) {
  // console.log(nodes);

  const filteredData = nodes.filter(d => planets.includes(d.name));

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
  const filteredData = data.filter(
    d => planets.includes(d.from) && planets.includes(d.to)
  );

  // TODO: make a dictionary for duplicate links e.g. { 'earthToMars': 1}
  filteredData.forEach(d => {
    d.from = nodes.filter(node => d.from == node.name)[0];
    d.to = nodes.filter(node => d.to == node.name)[0];

    d.link = {};
    d.link.cx = Math.abs(d.from.x + d.to.x) / 2;
    d.link.cy = yOffsetFixed;

    // TODO: add cx, cy, rx, ry
  });

  console.log(filteredData);
  // d3.select('.plot').selectAll('.links').data(filteredData).enter().append()
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
  console.log(
    data.filter(
      d => planets.includes(d.to.name) && planets.includes(d.from.name)
    )
  );
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
