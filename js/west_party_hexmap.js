$(document).ready(function() {

  // Create the svg element
  var mapContainer = d3
    .select('#west-party-hexmap')
    .append('svg')
    .attr("width", $(window).width()/2)
    // .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    // .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(responsivefy);

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
      .attr('class', const_color)
      .on('mouseover', function(d) {
        d3.select(this).classed('const_color', false);
        d3.select(this).classed('active', true);
        showInfo.call(this, d);
      })
      .on('mouseout', function(d) {
        d3.select(this).classed('const_color', true);
        d3.select(this).classed('active', false);
        removeInfo.call(this, d);
      });

    // legend
    var legend_coallition = ['PH', 'BN', 'PAS', 'IND'];
    var legend = mapContainer.append('svg')
      .attr('width', 200)
      .attr('height', 300)
      .attr('x', 0)
      .attr('y', (height - 120))
      .selectAll('g')
      .data(legend_coallition)
      .enter()
      .append('g')
      .attr('transform', function(d, i) {
        return "translate(0," + i * 30 + ")";
      });

    legend.append('rect')
      .attr('width', 30)
      .attr('height', 30)
      .attr('class', function(d) {
        if (d === 'PH') {
          return 'ph';
        } else if (d === 'PAS') {
          return 'pas';
        } else if (d === 'BN') {
          return 'bn';
        } else {
          return 'ind';
        }
      })
      .attr('stroke', '#D3D3D3')
      .attr('stroke-width', '1');

    legend.append('text')
      .attr('x', 32)
      .attr('y', 15)
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
