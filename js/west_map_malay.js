$(document).ready(function() {

  var width = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) * 0.8;
  // var height = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) * 0.9;
  var height = 600;

  // var viewportWidth = $(window).width();
  // var viewportHeight = $(window).height() / 2;
  // var width = viewportWidth * 0.8;
  // var height = width / 1.85;

  var mapContainer = d3.select('#west_map_malay')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g');

  var projection = d3.geoMercator();

    projection.scale([width / 3.5])
    .translate([width / 1, height * 1.4]);

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
  var malayByKodPAR = d3.map();

  var quantize = d3.scaleQuantize()
    .domain([0, 100])
    .range(d3.range(5).map(function(i) {
      return "q" + i + "-5";
    }));

  var instruction = mapContainer.append('text')
    .attr('x', (width * 0.65))
    .attr('y', 120)
    .text('Mouse over/tab to see details');

  var constName = mapContainer.append('text')
    .attr('text-anchor', 'start')
    .attr('y', 150)
    .attr('x', (width * 0.65))
    .text('');

  var stateName = mapContainer.append('text')
    .attr('text-anchor', 'start')
    .attr('y', 180)
    .attr('x', (width * 0.65))
    .text('');

  var winner = mapContainer.append('text')
    .attr('text-anchor', 'start')
    .attr('y', 210)
    .attr('x', (width * 0.65))
    .text('');

  var majority = mapContainer.append('text')
    .attr('text-anchor', 'start')
    .attr('y', 240)
    .attr('x', (width * 0.65))
    .text('');

  var loser = function(n) {
    n = n || 1;
    var extraHeight = 30 * n;
    return mapContainer.append('text')
      .classed('losers', true)
      .attr('text-anchor', 'start')
      .attr('y', extraHeight + 240)
      .attr('x', (width * 0.65))
      .text('');
  };

  // Credit
  mapContainer.append('text')
    .attr('x', 5)
    .attr('y', (height - 10))
    .attr('class', 'credit')
    .text('Credit: YS Fang (Tindak Malaysia, 2018), Malaysian Election Commission (2018), Malaysiakini (2008)');

  var results = {};

  d3.queue()
    .defer(d3.json, 'data/west_msia.json')
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
      majorityByKodPAR.set(d['KodPAR'], d['majority']);
      malayByKodPAR.set(d['KodPAR'], d['malay']);

      // Only allow winner name displayed
      if (d['coallition'] === d['won_coallition']) {
        results[d['KodPAR']].winner = d['candidate_name'];
        results[d['KodPAR']].winner_votes = d['votes'];
      } else {
        results[d['KodPAR']].losers.push({
          name: d['candidate_name'],
          coallition: d['coallition'],
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

    setProjection(map, 'west_msia');

    var const_map = topojson.feature(map, map.objects.west_msia).features;

    mapContainer.selectAll('.constituency')
      .data(const_map)
      .enter()
      .append('path')
      .attr('class', malay_color)
      .on('mouseover', function(d) {
        d3.select(this).attr('class', const_color);
        showInfo.call(this, d);
      })
      .on('mouseout', function(d) {
        d3.select(this).attr('class', malay_color);
        removeInfo();
      })
      .attr('d', path);


    // legend
    var size = 200;

    var legend_malay = ['20', '40', '60', '80+', ''];

    var legendTitle = mapContainer.append('text')
      .attr('x', (width * 0.65))
      .attr('y', 40)
      .attr('width', 300)
      .attr('height', 20)
      .text('Malay voters percentage (%)');

    var legend = mapContainer.append('svg')
      .attr('width', 300)
      .attr('height', 100)
      .attr('x', (width * 0.65))
      .attr('y', 50)
      .selectAll('g')
      .data(legend_malay)
      .enter()
      .append('g')
      .attr('transform', function(d, i) {
        return 'translate(' + i * 40 + ", 0)";
      });

    legend.append('rect')
      .attr('width', 40)
      .attr('height', 10)
      .attr('class', function(d, i) {
        return "q" + i + "-5";
      });

    legend.append('text')
      .attr('x', 35)
      .attr('y', 20)
      .attr('dy', '0.5em')
      .attr('text-anchor', 'start')
      .attr('class', 'legend')
      .text(function(d) {
        return d;
      });
  }

  // render colour for each constituency
  function const_color(d) {
    if (wonCoallitionByKodPAR.get(d.properties.KodPAR) === 'PH')
      return 'ph';
    else if (wonCoallitionByKodPAR.get(d.properties.KodPAR) === 'PAS')
      return 'pas';
    else if (wonCoallitionByKodPAR.get(d.properties.KodPAR) === 'BN')
      return 'bn';
    else if (wonCoallitionByKodPAR.get(d.properties.KodPAR) === 'IND')
      return 'ind';
    else {
      return 'solidariti';
    }
  }

  // render colour for constituency according to Malay voter percentage
  function malay_color(d) {
    return quantize(malayByKodPAR.get(d.properties.KodPAR));
  }

  function setProjection(map, code) {
    projection.scale(1).translate([0, 0]);
    var b = path.bounds(topojson.feature(map, map.objects[code]));
    var s = 0.95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
    var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
    projection.scale(s).translate(t);
  }

  function showInfo(d) {

    instruction.text('');

    constName.text(constByKodPAR.get(d.properties.KodPAR) + ' (' + malayByKodPAR.get(d.properties.KodPAR) + '% Malay voters)')
      .attr('class', 'constituency');

    stateName.text('State: ' + stateByKodPAR.get(d.properties.KodPAR))
      .attr('class', 'state');

    var candidates = winnerByKodPAR.get(d.properties.KodPAR);

    winner.text(wonCoallitionByKodPAR.get(d.properties.KodPAR) + ': ' + candidates.winner + ' (' + candidates.winner_votes + ' votes)')
      .attr('class', 'winner');

    majority.text('Majority: ' + majorityByKodPAR.get(d.properties.KodPAR) + ' votes')
      .attr('class', 'majority');

    var losers = candidates.losers;

    losers.forEach(function(candidate, index) {
      loser(index + 1).text(candidate.coallition + ': ' + candidate.name + ' (' + candidate.loser_votes + ' votes)')
        .attr('class', 'losers');
    });
  }

  function removeInfo() {

    instruction.text('Mouse over/tab to see details.');
    stateName.text('');
    constName.text('');
    winner.text('');
    majority.text('');
    mapContainer.selectAll('.losers').text('');
  }

  // // responsive
  // d3.select(window).on('resize', resize);
  //
  // function resize() {
  //
  //   width = parseInt(d3.select('#west_map_malay').style('width'));
  //   width = $(window).width() * 0.8;
  //   height = width / 1.85;
  //
  //   projection
  //     .scale([width / 3.5])
  //     .translate([width / 1, height * 1.4]);
  //
  //   d3.select('#west_map_malay').attr('width', width).attr('height', height);
  //   d3.select('svg').attr('width', width).attr('height', height);
  //
  //   d3.selectAll('path').attr('d', path);
  // }
});
