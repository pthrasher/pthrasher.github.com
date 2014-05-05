(function() {
  var ComplaintsGaugeDirective, Map, MapDirective, ProgressBar, RISK_COLORS, RiskGaugeDirective, directives,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  RISK_COLORS = {
    'N/A': '#ACD6E1',
    'LOW': '#3BB03B',
    'MEDIUM': '#C19D44',
    'HIGH': '#B06A3B'
  };

  Map = (function() {
    function Map(container, us, minPctForeign, maxPctForeign, width, height) {
      this.container = container;
      this.us = us;
      this.minPctForeign = minPctForeign;
      this.maxPctForeign = maxPctForeign;
      this.width = width;
      this.height = height;
      this.zoomTo = __bind(this.zoomTo, this);
      this.resetView = __bind(this.resetView, this);
      this.halfWidth = this.width / 2;
      this.halfHeight = this.height / 2;
      this.setup();
      return;
    }

    Map.prototype.setup = function() {
      this.quantize = d3.scale.quantize().domain([this.minPctForeign, this.maxPctForeign]).range(d3.range(9).map(function(i) {
        return "q" + i + "-9";
      }));
      this.projection = d3.geo.albersUsa().scale(642).translate([this.halfWidth, this.halfHeight]);
      this.path = d3.geo.path().projection(this.projection);
      this.svg = this.container.append("svg").attr("width", this.width).attr("height", this.height);
      this.svg.append("rect").attr("class", "background").attr("width", this.width).attr("height", this.height);
      this.g = this.svg.append("g");
      this.renderStates();
      this.renderCounties();
    };

    Map.prototype._aIsntB = function(a, b) {
      return a !== b;
    };

    Map.prototype.renderStates = function() {
      var idKey;
      idKey = function(d) {
        return d.id;
      };
      this.g.append("g").attr("class", "pdcig-states").selectAll("path").data(topojson.feature(this.us, this.us.objects.state).features, idKey).enter().append("path").attr("d", this.path).attr("id", function(d) {
        return "state-" + d.id;
      });
      this.g.append("path").datum(topojson.mesh(this.us, this.us.objects.state, this._aIsntB)).attr("class", "pdcig-state-borders").attr("d", this.path);
    };

    Map.prototype.renderCounties = function() {
      var countyClassHandler, idKey,
        _this = this;
      countyClassHandler = function(d) {
        var pctForeign, rlevel, stateId;
        stateId = d.properties.stateId;
        pctForeign = parseFloat(d.properties.pctForeign);
        rlevel = '';
        if (pctForeign > 0) {
          rlevel = _this.quantize(pctForeign);
        }
        return "county " + rlevel + " state-" + stateId;
      };
      idKey = function(d) {
        return d.id;
      };
      this.g.append("g").attr("class", "pdcig-counties").selectAll("path").data(topojson.feature(this.us, this.us.objects.county).features, idKey).enter().append("path").attr("d", this.path).attr("class", countyClassHandler).attr("id", function(d) {
        return "county-" + d.id;
      });
      this.g.append("path").datum(topojson.mesh(this.us, this.us.objects.county, this._aIsntB)).attr("class", "pdcig-county-borders").attr("d", this.path);
    };

    Map.prototype.transition = function(scale, x, y) {
      var tfrm;
      tfrm = "translate(" + this.halfWidth + "," + this.halfHeight + ")            scale(" + scale + ")            translate(" + (-x) + "," + (-y) + ")";
      this.g.transition().duration(750).attr('transform', tfrm).style('stroke-width', "" + (1.5 / scale) + "px");
    };

    Map.prototype.resetView = function() {
      this.transition(1, this.halfWidth, this.halfHeight);
      this.g.selectAll("path").classed("active", false);
    };

    Map.prototype.zoomTo = function(d, mult) {
      var scale, x, y, _ref,
        _this = this;
      if (mult == null) {
        mult = 1;
      }
      if (d == null) {
        return this.resetView();
      }
      if (this.currentCenter === d) {
        return;
      }
      _ref = this.path.centroid(d), x = _ref[0], y = _ref[1];
      scale = 4 * mult;
      this.currentCenter = d;
      this.g.selectAll("path").classed("active", function(d) {
        return d === _this.currentCenter;
      });
      this.transition(scale, x, y);
    };

    return Map;

  })();

  MapDirective = function() {
    return {
      restrict: 'E',
      replace: true,
      template: '<div class="pdcig-map-inner"></div>',
      link: function(scope, el, attrs) {
        var d3El, firstPassComplete, h, map, w, watcher;
        firstPassComplete = false;
        w = el.parent().width();
        h = el.parent().height();
        el.width(w);
        el.height(h);
        map = null;
        d3El = d3.select(el[0]);
        watcher = scope.$watch('topology', function(newVal, oldVal) {
          if ((newVal != null) && !firstPassComplete) {
            firstPassComplete = true;
            map = new Map(d3El, newVal, scope.minPctForeign, scope.maxPctForeign, w, h);
            scope.$on('resetMap', map.resetView);
            scope.$on('zoomMap', function(e, item, kind) {
              var eNode, id;
              id = "#" + kind + "-" + item.id;
              e = d3.select(id);
              map.zoomTo(e.datum(), kind === 'county' ? 2 : 1);
              eNode = e.node();
              eNode.parentNode.appendChild(eNode);
            });
            watcher();
          }
        });
      }
    };
  };

  ProgressBar = (function() {
    var TWO_PI;

    TWO_PI = 2 * Math.PI;

    function ProgressBar(container, width, height, total, minNum, key) {
      var minDimension;
      this.container = container;
      this.width = width;
      this.height = height;
      this.total = total;
      this.minNum = minNum;
      this.key = key;
      this.kill = __bind(this.kill, this);
      this.setPct = __bind(this.setPct, this);
      this.updateQuantize = __bind(this.updateQuantize, this);
      this.progress = this.minNum;
      this.formatPercent = d3.format(".00f");
      this.lastColor = RISK_COLORS['N/A'];
      minDimension = Math.min(this.width, this.height);
      this.innerRadius = Math.round(.36 * minDimension);
      this.outerRadius = Math.round(.48 * minDimension);
      this.textSize = Math.max(Math.round(.15 * minDimension), 8);
      this.setup();
      return;
    }

    ProgressBar.prototype.updateQuantize = function() {};

    ProgressBar.prototype.setup = function() {
      this.arc = d3.svg.arc().startAngle(0).innerRadius(this.innerRadius).outerRadius(this.outerRadius);
      this.svg = this.container.append("svg").attr("width", this.width).attr("height", this.height).append("g").attr("transform", "translate(" + (this.width / 2) + "," + (this.height / 2) + ")");
      this.meter = this.svg.append("g").attr("class", "progress-meter");
      this.meter.append("path").attr("class", "background").attr("d", this.arc.endAngle(TWO_PI));
      this.foreground = this.meter.append("path").attr("class", "foreground").style('fill', '#ACD6E1');
      this.text = this.meter.append("text").attr("text-anchor", "middle").style('font-size', "" + this.textSize + "px").attr("dy", ".35em");
    };

    ProgressBar.prototype.setPct = function(pct, newColor, postfix) {
      var color, i,
        _this = this;
      i = d3.interpolate(this.progress, pct);
      color = d3.interpolateRgb(this.lastColor, newColor);
      this.lastColor = newColor;
      return this.meter.transition().duration(500).tween("" + this.key + "-progress", function() {
        return function(t) {
          var c, pot;
          _this.progress = i(t);
          if (_this.progress !== _this.progress) {
            _this.progress = 0;
          }
          pot = _this.progress / _this.total;
          _this.foreground.attr("d", _this.arc.endAngle(TWO_PI * pot));
          _this.text.text(Math.round(_this.progress) + postfix);
          c = color(t);
          _this.foreground.style('fill', c);
          _this.text.style('fill', c);
        };
      });
    };

    ProgressBar.prototype.kill = function() {
      this.meter.transition().delay(250).attr("transform", "scale(0)");
    };

    return ProgressBar;

  })();

  ComplaintsGaugeDirective = function() {
    return {
      restrict: 'E',
      replace: true,
      template: '<div></div>',
      link: function(scope, el, attrs) {
        var d3el, firstPassComplete, pb;
        d3el = d3.select(el[0]);
        firstPassComplete = false;
        pb = null;
        scope.$watch(attrs.bindTo, function(newVal, oldVal) {
          var pct, riskLevel;
          if ((newVal != null) && !firstPassComplete) {
            pb = new ProgressBar(d3el, 201, 65, scope.maxNumComplaints, scope.minNumComplaints, 'complaints');
            firstPassComplete = true;
          }
          if (!(firstPassComplete && (newVal != null))) {
            return;
          }
          pct = newVal;
          if (pct !== pct) {
            pb.setPct(0, RISK_COLORS['N/A'], '');
          } else {
            riskLevel = scope.currentCounty.properties.riskLevel;
            pb.setPct(pct, RISK_COLORS[riskLevel], '');
          }
        });
      }
    };
  };

  RiskGaugeDirective = function() {
    return {
      restrict: 'E',
      replace: true,
      template: '<div></div>',
      link: function(scope, el, attrs) {
        var d3el, firstPassComplete, pb;
        d3el = d3.select(el[0]);
        firstPassComplete = false;
        pb = null;
        scope.$watch(attrs.bindTo, function(newVal, oldVal) {
          var pct, riskLevel;
          if ((newVal != null) && !firstPassComplete) {
            pb = new ProgressBar(d3el, 201, 65, 100, scope.minPctForeign, 'risk');
            firstPassComplete = true;
          }
          if (!(firstPassComplete && (newVal != null))) {
            return;
          }
          pct = parseFloat(newVal);
          if (pct !== pct) {
            pb.setPct(0, RISK_COLORS['N/A'], '');
          } else {
            riskLevel = scope.currentCounty.properties.riskLevel;
            pb.setPct(pct, RISK_COLORS[riskLevel], '%');
          }
        });
      }
    };
  };

  directives = angular.module('PDCIG.directives', []);

  directives.directive('pdcigMap', MapDirective).directive('pdcigRiskGauge', RiskGaugeDirective).directive('pdcigComplaintsGauge', ComplaintsGaugeDirective);

}).call(this);
