$(document).ready(function() {

  // Set the size and margins of the svg
  // width = ((window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) * 0.8) - margin.left - margin.right;
  // var height = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) * 0.8;

  var margin = {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10
    },
    width = ((window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) * 0.8) - margin.left - margin.right,
    height = ((window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) * 0.7) - margin.top - margin.bottom;

  // Create the svg element
  var mapContainer = d3
    .select('#west-malay-hexmap')
    .append('svg')
    .attr("width", width)
    .attr("height", height)
    .append("g")
    // .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(responsivefy);

  function responsivefy(svg) {
    // get container + svg aspect ratio
    var container = d3.select(svg.node().parentNode),
      width = parseInt(svg.style("width")),
      height = parseInt(svg.style("height")),
      aspect = width / height;

    // add viewBox and preserveAspectRatio properties,
    // and call resize so that svg resizes on inital page load
    svg.attr("viewBox", "0 0 " + width + " " + height)
      .attr("perserveAspectRatio", "xMinYMid")
      .call(resize);

    d3.select(window).on("resize." + container.attr("id"), resize);

    // get width of container and resize svg to fit it
    function resize() {
      var targetWidth = parseInt(container.style("width"));
      svg.attr("width", targetWidth);
      svg.attr("height", Math.round(targetWidth / aspect));
    }
  }

  var quantize = d3.scaleQuantize()
    .domain([0, 100])
    .range(d3.range(5).map(function(i) {
      return "q" + i + "-5";
    }));

  d3.json("data/west.hexjson", function(error, hexjson) {
    // Render the hexes
    var hexes = d3.renderHexJSON(hexjson, width, height);

    // Bind the hexes to g elements of the svg and position them
    var hexmap = mapContainer
      .selectAll("g")
      .data(hexes)
      .enter()
      .append("g")
      .attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      });

    // Draw the polygons around each hex's centre
    hexmap
      .append('polygon')
      .attr('points', function(d) {
        return d.points;
      })
      .attr('stroke', '#D3D3D3')
      .attr('stroke-width', '1')
      .attr('class', malay_color)
      .on('mouseover', function(d) {
        d3.select(this).classed('malay_color', false);
        d3.select(this).classed('active', true);
        showInfo.call(this, d);
      })
      .on('mouseout', function(d) {
        d3.select(this).classed('malay_color', true);
        d3.select(this).classed('active', false);
        removeInfo.call(this, d);
      });

      // legend

      var size = 200;

      var legend_malay = ['20', '40', '60', '80+', ''];

      var legendTitle = mapContainer.append('text')
        .attr('x', 0)
        .attr('y', (height - 45))
        .attr('width', 300)
        .attr('height', 20)
        .text('Malay voters percentage (%)')
        .style('font-size', 'small');

      var legend = mapContainer.append('svg')
        .attr('width', 150)
        .attr('height', 100)
        .attr('x', 0)
        .attr('y', (height - 35))
        .selectAll('g')
        .data(legend_malay)
        .enter()
        .append('g')
        .attr('transform', function(d, i) {
          return 'translate(' + i * 30 + ", 0)";
        })
        .style('font-size', 'small');

      legend.append('rect')
        .attr('width', 30)
        .attr('height', 10)
        .attr('class', function(d, i) {
          return "q" + i + "-5";
        });

      legend.append('text')
        .attr('x', 27)
        .attr('y', 20)
        .attr('dx', '-0.5em')
        .attr('dy', '0.5em')
        .attr('text-anchor', 'start')
        .attr('class', 'legend')
        .text(function(d) {
          return d;
        });

    function const_color(d) {
      if (d.ge14_win_coallition === 'PH')
        return 'ph';
      else if (d.ge14_win_coallition === 'PAS')
        return 'pas';
      else if (d.ge14_win_coallition === 'BN')
        return 'bn';
      else if (d.ge14_win_coallition === 'SOLIDARITI')
        return 'solidariti';
      else {
        return 'ind';
      }
    }

    function malay_color(d) {
      return quantize(d.ge14_malay);
    }

    function showInfo(d) {
      div.style('display', 'block');
      div.style('opacity', 0.9);
      div.html('<span class="uk-text-bold uk-text-uppercase">' + d.constituency + '</span><br>' +
          '<span class="uk-text-bold uk-text-warning">' + d.ge14_malay + '%</span> Malay voters' + '<br>' +
          '<span class="uk-text-bold">State:</span> ' + d.state + '<br>' +
          '<span class="uk-text-bold">Winning Party: </span>' + d.ge14_win_coallition + '<br>' +
          '<span class="uk-text-bold">Majority: </span>' + d3.format(',')(d.ge14_majority_pct) + ' %')
        .style("left", (d3.event.pageX - 75) + "px")
        .style("top", (d3.event.pageY - 140) + "px");
    }

    function removeInfo() {
      div.style('display', 'none');
    }
  });
});
