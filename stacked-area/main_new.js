var svg = d3.select("svg");

var container = d3_container.container();

container
  .height(500)
  .width(960)
  .margin(50, 0, 30, 50);

var width = container.contentWidth(),
  height = container.contentHeight();

svg.call(container);

var content = container.content();

var dateParse = d3.timeParse('%Y');

var statusArray = ['China', 'EU', 'India', 'Japan', 'Russia', 'Soviet Union', 'USA'];

d3.csv("stacked-mars.csv", function (error, loadedData) {
  if (error) throw error;
  // Convert string values to date, numbers
  var parsedData = loadedData.map(function (d) {
    var dataObject = {
      date: dateParse(d.date)
    };
    statusArray.forEach(function (s) {
      dataObject[s] = +d[s];
    })
    return dataObject;
  });

  var stack = d3.stack()
    .keys(statusArray)
    .offset(d3.stackOffsetDiverging);

  var layers = stack(parsedData);

  var x = d3.scaleTime()
    .domain([parsedData[0].date, parsedData[parsedData.length - 1].date])
    .range([0, width]);

  var y = d3.scaleLinear()
    .domain([0, d3.max(layers, stackMax)])
    .range([height, 0]);

  var xAxis = d3.axisBottom(x);
  var yAxis = d3.axisLeft(y);

  var gX = content.append("g")
    .attr("transform", "translate(0," + height + ")")
    .attr("class", "axis axis--x")
    .call(xAxis)
    .select(".domain")
    .remove();

  var gY = content.append("g")
    .attr("class", "axis axis--y")
    .call(yAxis);

  var colors = statusArray.map(function (d, i) {
    return d3.interpolateWarm(i / statusArray.length);
  });

  var colorScale = d3.scaleOrdinal()
    .domain(statusArray)
    .range(colors);

  var legendOffset = container.margin().left() + width - 32 * statusArray.length;

  var legend = d3.legendColor()
    .shapeWidth(50)
    .cells(statusArray.length)
    .orient("vertical")
    .labelAlign("start")
    .scale(colorScale);

  // console.log(layers);

  var area = d3.area()
    .x(function (d, i) { return x(d.data.date); })
    .y0(function (d) { return y(d[0]); })
    .y1(function (d) { return y(d[1]); })
    .curve(d3.curveBasis);

  var layerGroups = content.selectAll(".layer")
    .data(layers)
    .enter().append("g")
    .attr("class", "layer");

  svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + legendOffset.toString() + ",0)");

  svg.select(".legend")
    .call(legend);

  layerGroups.append("path")
    .attr("d", area)
    .attr("fill", function (d, i) { return colors[i]; });

  function stackMax(layer) {
    return d3.max(layer, function (d) { return d[1]; });
  }

});