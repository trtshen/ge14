// Define the div for the tooltip
var div = d3.select('body').append('div')
  .attr('class', 'map-tooltip')
  .style('display', 'none');

// Set the size and margins of the svg
// width = ((window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) * 0.8)- margin.left - margin.right;
// var height = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) * 0.8;

var margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10
  },
  width = ((window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) * 0.8) - margin.left - margin.right,
  height = ((window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) * 0.8) - margin.top - margin.bottom;

var chawWidth = ($(window).width() < 500) ? $(window).width() : $(window).width()/2;

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

/*
  function responsivefy(svg) {
    // get container + svg aspect ratio
    var container = d3.select(svg.node().parentNode),
      width = (parseInt(svg.style("width")) * 0.85),
      height = parseInt(svg.style("height")),
      aspect = width / height;
    
    // get width of container and resize svg to fit it
    function resize(svg) {
      if (e.currentTarget) {
        var width = e.currentTarget.innerWidth;
        console.log('innerWidth::', width);
        svg.attr("width", (width/2));
      } else {
        var targetWidth = (parseInt(container.style("width")) * 0.85);
        svg.attr("width", targetWidth);
        svg.attr("height", Math.round(targetWidth / aspect));
      // }
    }

    // add viewBox and preserveAspectRatio properties,
    // and call resize so that svg resizes on inital page load
    svg.attr("viewBox", "0 0 " + width + " " + height)
      .attr("perserveAspectRatio", "xMinYMid")
      .call(resize);

    d3.select(window).on("resize." + container.attr("id"), resize);
  }
 */