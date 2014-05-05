(function() {
  var InfoGraphic, ProgressBar,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  ProgressBar = (function() {
    var TWO_PI;

    TWO_PI = 2 * Math.PI;

    function ProgressBar(container, width, height, total) {
      var minDimension;
      this.container = container;
      this.width = width;
      this.height = height;
      this.total = total;
      this.kill = __bind(this.kill, this);
      this.animate = __bind(this.animate, this);
      this.tick = __bind(this.tick, this);
      this.progress = 0;
      this.formatPercent = d3.format(".0%");
      minDimension = Math.min(this.width, this.height);
      this.innerRadius = Math.round(.36 * minDimension);
      this.outerRadius = Math.round(.48 * minDimension);
      this.setup();
    }

    ProgressBar.prototype.setup = function() {
      this.arc = d3.svg.arc().startAngle(0).innerRadius(this.innerRadius).outerRadius(this.outerRadius);
      this.svg = this.container.append("svg").attr("width", this.width).attr("height", this.height).append("g").attr("transform", "translate(" + (this.width / 2) + "," + (this.height / 2) + ")");
      this.meter = this.svg.append("g").attr("class", "progress-meter");
      this.meter.append("path").attr("class", "background").attr("d", this.arc.endAngle(TWO_PI));
      this.foreground = this.meter.append("path").attr("class", "foreground");
      this.text = this.meter.append("text").attr("text-anchor", "middle").attr("dy", ".35em");
    };

    ProgressBar.prototype.tick = function(tickBy) {
      if (tickBy == null) {
        tickBy = 1;
      }
      this.animate(this.progress + tickBy);
    };

    ProgressBar.prototype.animate = function(to) {
      var i,
        _this = this;
      i = d3.interpolate(this.progress, to / this.total);
      d3.transition().tween("progress", function() {
        return function(t) {
          _this.progress = i(t);
          _this.foreground.attr("d", _this.arc.endAngle(TWO_PI * _this.progress));
          _this.text.text(_this.formatPercent(_this.progress));
        };
      });
    };

    ProgressBar.prototype.kill = function() {
      this.meter.transition().delay(250).attr("transform", "scale(0)");
    };

    return ProgressBar;

  })();

  InfoGraphic = (function() {
    var RISK_MAP;

    RISK_MAP = {
      "HIGH": "risk-high",
      "LOW": "risk-low",
      "MEDIUM": "risk-medium",
      "N/A": "risk-na"
    };

    function InfoGraphic(container, data) {
      this.container = container;
      this.data = data;
      this.pluckCounties = __bind(this.pluckCounties, this);
      this.pluckStates = __bind(this.pluckStates, this);
      this.$container = $(this.container);
      this.d3container = d3.select(this.container);
      this.minPctForeign = +Infinity;
      this.maxPctForeign = -Infinity;
      this.states = [];
      this.stateIdsByName = {};
      this.statesById = {};
      this.statesByAbbr = {};
      this.countiesById = {};
      this.countiesByState = {};
      this.pluckStates();
      this.pluckCounties();
      this.sortData();
      this.setup();
      return;
    }

    InfoGraphic.prototype.setup = function() {
      this.$panels = $("<div></div>");
      this.$panels.addClass('pd-ig-panels');
      this.$statePanel = $("<ul></ul>");
      this.$statePanel.addClass('pd-ig-statepanel'.addClass('pd-ig-panel'));
      this.$countyPanel = $("<ul></ul>");
      this.$countyPanel.addClass('pd-ig-countypanel'.addClass('pd-ig-panel'));
      this.$infoPanel = $("<div></div>");
      this.$infoPanel.addClass('pd-ig-infopanel'.addClass('pd-ig-panel'));
      this.$gradeEl = $("<div></div>");
      this.$gradeEl.addClass('pd-ig-grade');
      this.$pctForeignEl = $("<div></div>");
      this.$pctForeignEl.addClass('pd-ig-pctforeign');
      this.$infoPanel.append(this.$gradeEl.append(this.$pctForeignEl));
      this.$panels.append(this.$statePanel.append(this.$countyPanel.append(this.$infoPanel)));
      this.$mapEl = $('<div></div>');
      this.$mapEl.addClass('pd-ig-map');
      this.$container.append(this.$panels.append(this.$mapEl));
      this.map = new Map(d3.select(this.$map[0]));
    };

    InfoGraphic.prototype.pluckStates = function() {
      var state, stateName, _i, _len, _ref;
      _ref = this.data.objects.state.geometries;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        state = _ref[_i];
        stateName = state.properties.name;
        this.states.push(state);
        this.stateIdsByName[stateName] = state.id;
        this.statesById[state.id] = state;
      }
    };

    InfoGraphic.prototype.pluckCounties = function() {
      var county, countyName, pf, state, stateName, _base, _i, _len, _ref;
      _ref = this.data.objects.county.geometries;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        county = _ref[_i];
        state = this.statesById[county.properties.stateId];
        if (state == null) {
          continue;
        }
        stateName = state.properties.name;
        countyName = county.properties.name;
        if (state.counties == null) {
          state.counties = [];
        }
        if ((_base = this.countiesByState)[stateName] == null) {
          _base[stateName] = {};
        }
        state.counties.push(county);
        this.countyIdsByName[stateName][countyName] = county;
        this.countiesById[county.id] = county;
        pf = parseFloat(county.properties.pctForeign);
        if (pf > 0) {
          this.minPctForeign = Math.min(pf, this.minPctForeign);
          this.maxPctForeign = Math.max(pf, this.maxPctForeign);
        }
      }
    };

    InfoGraphic.prototype.handleStateClick = function(d) {};

    InfoGraphic.prototype.handleCountyClick = function(d) {};

    InfoGraphic.prototype.updateInfoPanel = function() {};

    return InfoGraphic;

  })();

  $(function() {
    var clicked, countiesById, countyIdsByName, countyNames, handleDataLoaded, renderCounties, renderStates, stateIdsByName, stateNames, statesById, xhr, zoomToCounty;
    handleDataLoaded = function(data) {
      var ig;
      ig = new InfoGraphic('#info-graphic-container', data);
    };
    xhr = d3.json("/static/js/combined.json");
    xhr.on('load', handleDataLoaded);
    xhr.get();
    clicked = function(d, kmult, kind) {
      var centered, centroid, k, kk, x, y;
      if (kmult == null) {
        kmult = 1;
      }
      x = null;
      y = null;
      k = null;
      if (d && centered !== d) {
        centroid = path.centroid(d);
        x = centroid[0];
        y = centroid[1];
        k = 4 * kmult;
        kk = 2;
        centered = d;
      } else {
        x = width / 2;
        y = height / 2;
        k = 1;
        kk = 1;
        centered = null;
      }
      g.selectAll("path").classed("active", centered && function(d) {
        return d === centered;
      });
      g.transition().duration(750).attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")").style("stroke-width", 1.5 / kk + "px");
    };
    stateNames = [];
    countyNames = {};
    stateIdsByName = {};
    countyIdsByName = {};
    statesById = {};
    countiesById = {};
    zoomToCounty = function(stateName, countyName) {
      var c, d, grade, id, pf, selectedCounty;
      id = countyIdsByName[stateName][countyName];
      if (id == null) {
        return;
      }
      selectedCounty = countyName;
      d = d3.select("#county-" + id).datum();
      clicked(d, 4);
      c = countiesById[id];
      gradeEl.removeClass('risk-na').removeClass('risk-low').removeClass('risk-medium').removeClass('risk-high');
      pctEl.removeClass('risk-na').removeClass('risk-low').removeClass('risk-medium').removeClass('risk-high');
      if (c != null) {
        pf = parseFloat(c.properties.pctForeign).toFixed(2) + '%';
        grade = c.properties.riskLevel;
        gradeEl.addClass(colorScale[grade]);
        pctEl.addClass(colorScale[grade]);
      } else {
        pf = '';
        grade = '';
      }
      gradeEl.html(grade);
      pctEl.html(pf);
    };
    renderCounties = function(data, stateName) {
      var d, id, lis;
      countyPicker.classed('active', true);
      lis = countyPicker.selectAll('li').data(data).text(String);
      lis.enter().append('li').text(String).on('click', function(d) {
        var selectedCounty;
        selectedCounty = d;
        zoomToCounty(stateName, d);
        lis.classed('active', function(d) {
          return d === selectedCounty;
        });
      });
      lis.exit().remove();
      id = stateIdsByName[stateName];
      if (id == null) {
        return;
      }
      d3.selectAll(".county").classed('state-active', function(d) {
        return d.properties.stateId === id;
      });
      d = d3.select("#state-" + id).datum();
      clicked(d);
    };
    renderStates = function() {
      var handleClick, lis;
      handleClick = function(d) {
        var selectedCounty, selectedState;
        if (d === selectedState) {
          selectedState = null;
          selectedCounty = null;
          clicked();
          return;
        }
        selectedState = d;
        renderCounties(countyNames[d], d);
        lis.classed('active', function(d) {
          return d === selectedState;
        });
      };
      lis = statePicker.selectAll('li').data(stateNames).text(String);
      lis.enter().append('li').text(String).on('click', handleClick);
      lis.exit().remove();
    };
    return d3.json("/static/js/combined.json", function(err, us) {
      var counties, maxPctForeign, minPctForeign, stateName;
      minPctForeign = +Infinity;
      maxPctForeign = -Infinity;
      console.log(minPctForeign, maxPctForeign);
      for (stateName in countyNames) {
        counties = countyNames[stateName];
        if (counties.length === 0) {
          counties.push("Entire State");
        }
        counties = counties.sort(d3.ascending);
      }
      stateNames = stateNames.sort(d3.ascending);
      renderStates();
    });
  });

}).call(this);
