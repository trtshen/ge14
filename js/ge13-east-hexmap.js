$(document).ready(function() {
  // Create the svg element
  var mapContainer = d3
    .select('#ge13-east-map')
    .append('svg')
    .attr("width", width)
    .attr("height", height)
    .append('g')
    // .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(responsivefy);
    
  d3.json('data/east.hexjson', function(error, hexjson) {
    // Render the hexes
    var hexes = d3.renderHexJSON(hexjson, width, height);

    // Bind the hexes to g elements of the svg and position them
    var hexmap = mapContainer
      .selectAll('g')
      .data(hexes)
      .enter()
      .append('g')
      .attr('transform', function(hex) {
        return 'translate(' + hex.x + ',' + hex.y + ')';
      });

    // Draw the polygons around each hex's centre
    hexmap
      .append('polygon')
      .attr('points', function(hex) {
        return hex.points;
      })
      .attr('stroke', '#D3D3D3')
      .attr('stroke-width', '1')
      .attr('class', ge13_const_color)
      .on('mouseover', function(d) {
        showInfo.call(this, d);
        d3.select(this).classed('ge13_const_color', false);
        d3.select(this).classed('active', true);
      })
      .on('mouseout', function(d) {
        removeInfo.call(this, d);
        d3.select(this).classed('ge13_const_color', true);
        d3.select(this).classed('active', false);
      });

    function ge13_const_color(d) {
      if (d.ge13_win_coallition === 'PR')
        return 'ph';
      else if (d.ge13_win_coallition === 'PAS')
        return 'pas';
      else if (d.ge13_win_coallition === 'BN')
        return 'bn';
      else if (d.ge13_win_coallition === 'SOLIDARITI')
        return 'solidariti';
      else {
        return 'ind';
      }
    }

    function showInfo(d) {
      div.style('display', 'block');
      div.style('opacity', 0.9);
      div.html('<span class="uk-text-bold uk-text-uppercase">' + d.constituency + '</span><br>' +
          '<span class="uk-text-bold">State:</span> ' + d.state + '<br>' +
          '<span class="uk-text-bold">Winning Party: </span>' + d.ge13_win_coallition + '<br>' +
          '<span class="uk-text-bold">Majority: </span>' + d3.format(',')(d.ge13_majority_pct) + ' %')
        .style("left", (d3.event.pageX - 75) + "px")
        .style("top", (d3.event.pageY - 140) + "px");
    }

    function removeInfo(d) {
      div.style('display', 'none');
    }



  });
});
