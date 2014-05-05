(function() {
  var InfographicCtrl,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  InfographicCtrl = (function() {
    var DATAURI;

    DATAURI = '/static/js/combined-latest.json';

    function InfographicCtrl($scope, $log, $q) {
      this.$scope = $scope;
      this.$log = $log;
      this.$q = $q;
      this.zipSearchTrigger = __bind(this.zipSearchTrigger, this);
      this.statesFilter = __bind(this.statesFilter, this);
      this.countiesFilter = __bind(this.countiesFilter, this);
      this.toggleCounty = __bind(this.toggleCounty, this);
      this.toggleState = __bind(this.toggleState, this);
      this.handleDataLoaded = __bind(this.handleDataLoaded, this);
      d3.json(DATAURI, this.handleDataLoaded);
      this.minPctForeign = +Infinity;
      this.maxPctForeign = -Infinity;
      this.minNumComplaints = +Infinity;
      this.maxNumComplaints = -Infinity;
      this.states = [];
      this.stateIdsByName = {};
      this.statesById = {};
      this.statesByAbbr = {};
      this.statesByZip = {};
      this.countiesById = {};
      this.countiesByState = {};
      this.countiesByZip = {};
      this.zipSearchTrigger = _.debounce(this.zipSearchTrigger, 500);
      this.$scope.toggleState = this.toggleState;
      this.$scope.toggleCounty = this.toggleCounty;
      this.$scope.zipSearchTrigger = this.zipSearchTrigger;
      this.$scope.stateFilter = '';
      this.$scope.statesFilter = this.statesFilter;
      this.$scope.countyFilter = '';
      this.$scope.countiesFilter = this.countiesFilter;
      this.deferredProcessing = this.$q.defer();
      this.$scope.counties = [];
      this.$scope.states = [];
      this.$scope.topology = null;
      this.$scope.mapOpts = null;
      this.$scope.currentState = null;
      this.$scope.currentCounty = null;
      this.$scope.currentStateName = null;
      this.$scope.currentCountyName = null;
      return;
    }

    InfographicCtrl.prototype.handleDataLoaded = function(err, data) {
      var countyLen, stateLen;
      this.data = data;
      countyLen = this.data.objects.county.geometries.length;
      stateLen = this.data.objects.state.geometries.length;
      this.processData();
    };

    InfographicCtrl.prototype.processData = function() {
      var county, countyName, numComplaints, pf, state, stateName, zip, _base, _base1, _base2, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
      _ref = this.data.objects.state.geometries;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        state = _ref[_i];
        stateName = state.properties.name;
        this.states.push(state);
        this.stateIdsByName[stateName] = state.id;
        this.statesById[state.id] = state;
      }
      _ref1 = this.data.objects.county.geometries;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        county = _ref1[_j];
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
        this.countiesByState[stateName][countyName] = county;
        this.countiesById[county.id] = county;
        _ref2 = county.properties.zips;
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          zip = _ref2[_k];
          if ((_base1 = this.statesByZip)[zip] == null) {
            _base1[zip] = state;
          }
          if ((_base2 = this.countiesByZip)[zip] == null) {
            _base2[zip] = [];
          }
          if (__indexOf.call(this.countiesByZip[zip], county) >= 0) {
            continue;
          }
          this.countiesByZip[zip].push(county);
        }
        pf = parseFloat(county.properties.pctForeign);
        if (pf > 0) {
          this.minPctForeign = Math.min(pf, this.minPctForeign);
          this.maxPctForeign = Math.max(pf, this.maxPctForeign);
        }
        numComplaints = county.properties.numComplaints;
        if (numComplaints > 0) {
          this.minNumComplaints = Math.min(numComplaints, this.minNumComplaints);
          this.maxNumComplaints = Math.max(numComplaints, this.maxNumComplaints);
        }
      }
      this.states = this.states.sort(function(a, b) {
        return d3.ascending(a.properties.name, b.properties.name);
      });
      this.$scope.states = this.states;
      this.$scope.topology = this.data;
      this.$scope.minPctForeign = this.minPctForeign;
      this.$scope.maxPctForeign = this.maxPctForeign;
      this.$scope.minNumComplaints = this.minNumComplaints;
      this.$scope.maxNumComplaints = this.maxNumComplaints;
      this.$scope.$apply();
    };

    InfographicCtrl.prototype.getCountiesForState = function(state) {
      var counties, county, name, _counties;
      counties = this.countiesByState[state.properties.name];
      _counties = (function() {
        var _results;
        _results = [];
        for (name in counties) {
          county = counties[name];
          _results.push(county);
        }
        return _results;
      })();
      return _counties.sort(function(a, b) {
        return d3.ascending(a.properties.name, b.properties.name);
      });
    };

    InfographicCtrl.prototype.toggleState = function(stateName) {
      var id, state;
      id = this.stateIdsByName[stateName];
      if (id == null) {
        return;
      }
      state = this.statesById[id];
      if (state === this.$scope.currentState) {
        this.$scope.currentState = null;
        this.$scope.currentCounty = null;
        this.$scope.currentStateName = null;
        this.$scope.currentCountyName = null;
        this.$scope.counties = [];
        this.$scope.$broadcast('resetMap');
        this.$scope.countyFilter = '';
      } else {
        this.$scope.currentState = state;
        this.$scope.currentStateName = state.properties.name;
        this.$scope.counties = this.getCountiesForState(state);
        this.$scope.$broadcast('zoomMap', state, 'state');
      }
    };

    InfographicCtrl.prototype.toggleCounty = function(countyName) {
      var county, stateName, _ref;
      stateName = this.$scope.currentStateName;
      county = (_ref = this.countiesByState[stateName]) != null ? _ref[countyName] : void 0;
      if (county == null) {
        return;
      }
      if (county === this.$scope.currentCounty) {
        this.$scope.currentCounty = null;
        this.$scope.currentCountyName = null;
        this.$scope.$broadcast('zoomMap', this.$scope.currentState, 'state');
      } else {
        this.$scope.currentCounty = county;
        this.$scope.currentCountyName = countyName;
        this.$scope.$broadcast('zoomMap', county, 'county');
      }
    };

    InfographicCtrl.prototype.itemFilter = function(item, filter) {
      var name;
      name = item.properties.name.toLowerCase().replace('county', '');
      return name.indexOf(filter.toLowerCase()) === 0;
    };

    InfographicCtrl.prototype.countiesFilter = function(county) {
      if (this.$scope.countyFilter.length === 0) {
        return true;
      }
      if (county === this.$scope.currentCounty) {
        return true;
      }
      return this.itemFilter(county, this.$scope.countyFilter);
    };

    InfographicCtrl.prototype.statesFilter = function(state) {
      if (this.$scope.stateFilter.length === 0) {
        return true;
      }
      if (state === this.$scope.currentState) {
        return true;
      }
      return this.itemFilter(state, this.$scope.stateFilter);
    };

    InfographicCtrl.prototype.zipSearchTrigger = function() {
      var counties, state, validZip;
      validZip = /\d{5}/.test(this.$scope.zipCode);
      if (this.validZip && !validZip) {
        this.$scope.currentState = null;
        this.$scope.currentCounty = null;
        this.$scope.currentStateName = null;
        this.$scope.currentCountyName = null;
        this.$scope.stateFilter = '';
        this.$scope.counties = [];
        this.$scope.$broadcast('resetMap');
        this.$scope.countyFilter = '';
        this.$scope.$apply();
      }
      if (!validZip) {
        return;
      }
      state = this.statesByZip[this.$scope.zipCode];
      if (state == null) {
        return;
      }
      counties = this.countiesByZip[this.$scope.zipCode];
      if (!(counties.length > 0)) {
        return;
      }
      this.$scope.currentState = state;
      this.$scope.currentStateName = state.properties.name;
      this.$scope.counties = this.countiesByZip[this.$scope.zipCode];
      this.$scope.stateFilter = state.properties.name;
      this.$scope.currentCounty = null;
      this.$scope.currentCountyName = null;
      if (counties.length === 1) {
        this.$scope.currentCounty = this.$scope.counties[0];
        this.$scope.currentCountyName = this.$scope.counties[0].properties.name;
        this.$scope.$broadcast('zoomMap', this.$scope.currentCounty, 'county');
      } else {
        this.$scope.$broadcast('zoomMap', state, 'state');
      }
      this.validZip = validZip;
      this.$scope.$apply();
    };

    return InfographicCtrl;

  })();

  angular.module('PDCIG.controllers', []).controller('InfographicCtrl', InfographicCtrl);

  angular.module('PDCIG', ['ngAnimate', 'PDCIG.directives', 'PDCIG.controllers']);

}).call(this);
