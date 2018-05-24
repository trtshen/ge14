var viewportWidth = $(window).width();
var viewportHeight = $(window).height() / 2;
var width = viewportWidth * 0.90;
var height = width / 1.85;

var mapContainer = d3.select('#map')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g');

var projection = d3.geoMercator();

var path = d3.geoPath()
  .projection(projection);

var stateByKodPAR = d3.map();
var Kod_PAR = d3.map();
var constByKodPAR = d3.map();
var wonCoallitionByKodPAR = d3.map();
var winnerByKodPAR = d3.map();
var voteByKodPAR = d3.map();
var majorityByKodPAR = d3.map();
var losersByKodPAR = d3.map();
var wonPartyByKodPAR = d3.map();


var stateName = mapContainer.append('text')
  .attr('text-anchor', 'start')
  .attr('y', 30)
  .attr('x', (width) * 0.3)
  .text('');

var constName = mapContainer.append('text')
  .attr('text-anchor', 'start')
  .attr('y', 50)
  .attr('x', (width) * 0.3)
  .text('');

var winner = mapContainer.append('text')
  .attr('text-anchor', 'start')
  .attr('y', 70)
  .attr('x', (width) * 0.3)
  .text('');

var majority = mapContainer.append('text')
  .attr('text-anchor', 'start')
  .attr('y', 90)
  .attr('x', (width) * 0.3)
  .text('');

var loser = function(n) {
  n = n || 1;
  var extraHeight = 20 * n;
  return mapContainer.append('text')
    .classed('losers', true)
    .attr('text-anchor', 'start')
    .attr('y', extraHeight + 90)
    .attr('x', (width) * 0.3)
    .text('');
}

var results = {};
d3.queue()
  .defer(d3.json, 'data/Malaysia_Parliamentary_Boundaries_2018.json')
  .defer(d3.csv, 'data/ge14.csv', function(d) {
    if (!results[d['KodPAR']]) {
      results[d['KodPAR']] = {
        winner: '',
        winner_vote: '',
        losers: [],
        loser_vote: []
      };
    }
    stateByKodPAR.set(d['KodPAR'], d['State']);
    constByKodPAR.set(d['KodPAR'], d['const_name']);
    wonCoallitionByKodPAR.set(d['KodPAR'], d['won_coallition']);
    wonPartyByKodPAR.set(d['KodPAR'], d['won_party']);
    majorityByKodPAR.set(d['KodPAR'], d['majority']);

    // Only allow winner name displayed
    if (d['won_party'] === d['party']) {
      results[d['KodPAR']].winner = d['candidate_name'];
      results[d['KodPAR']].winner_votes = d['votes'];
    } else {
      results[d['KodPAR']].losers.push({
        name: d['candidate_name'],
        party: d['party'],
        loser_votes: d['votes']
      });
    }
    winnerByKodPAR.set(d['KodPAR'], results[d['KodPAR']]);
    // console.log(winnerByKodPAR.set(d['KodPAR'], results[d['KodPAR']]));
  })
  .await(ready);

function ready(error, map, ge14) {
  if (error) {
    throw error;
  }

  setProjection(map, 'Malaysia_Parliamentary_Boundaries_2018');

  var const_map = topojson.feature(map, map.objects.Malaysia_Parliamentary_Boundaries_2018).features;

  mapContainer.selectAll('.constituency')
    .data(const_map)
    .enter()
    .append('path')
    // set colour for each constituency according to the winning coallition
    .attr('class', function(d) {
      if (wonCoallitionByKodPAR.get(d.properties.KodPAR) === 'PH')
        return 'ph'
      else if (wonCoallitionByKodPAR.get(d.properties.KodPAR) === 'PAS')
        return 'pas'
      else if (wonCoallitionByKodPAR.get(d.properties.KodPAR) === 'BN')
        return 'bn'
      else if (wonCoallitionByKodPAR.get(d.properties.KodPAR) === 'IND')
        return 'ind'
      else {
        return 'solidariti'
      }
    })
    .on('mouseover', function(d) {
      showInfo.call(this, d);
    })
    .on('mouseout', function(d) {
      removeInfo();
    })
    .attr('d', path);
}

function setProjection(map, code) {
  projection.scale(1).translate([0, 0]);
  var b = path.bounds(topojson.feature(map, map.objects[code]));
  var s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
  var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
  projection.scale(s).translate(t);
}

function showInfo(d) {
  stateName.text(stateByKodPAR.get(d.properties.KodPAR))
    .attr('class', 'state');
  constName.text(constByKodPAR.get(d.properties.KodPAR))
    .attr('class', 'constituency');

  var candidates = winnerByKodPAR.get(d.properties.KodPAR);
  winner.text(wonCoallitionByKodPAR.get(d.properties.KodPAR) + ': ' + candidates.winner + ' (' + candidates.winner_votes + ')')
    .attr('class', 'winner');
  majority.text('Majority: ' + majorityByKodPAR.get(d.properties.KodPAR))
    .attr('class', 'majority');

  var losers = candidates.losers;
  losers.forEach(function(candidate, index) {
    loser(index + 1).text(candidate.party + ': ' + candidate.name + ' (' + candidate.loser_votes + ')')
      .attr('class', 'losers');
  });
}

function removeInfo() {
  stateName.text('');
  constName.text('');
  winner.text('');
  majority.text('');
  mapContainer.selectAll('.losers').text('');
}

// responsive
// d3.select(window).on('resize', resize);
//
// function resize() {
//
//   width = parseInt(d3.select('#map').style('width'));
//   width = $(window).width() * .97;
//   height = width / 1.85;
//
//   projection
//     .scale([width / 3.5])
//     .translate([width / 1, height * 1.4]);
//
//
//   d3.select("#map").attr("width", width).attr("height", height);
//   d3.select("svg").attr("width", width).attr("height", height);
//
//   d3.selectAll("path").attr('d', path);
//
//
// }