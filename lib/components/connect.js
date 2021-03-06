'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _isPlainObject = require('../utils/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _shallowEqual = require('../utils/shallowEqual');

var _shallowEqual2 = _interopRequireDefault(_shallowEqual);

var _handleResponse = require('../utils/handleResponse');

var _handleResponse2 = _interopRequireDefault(_handleResponse);

var _buildRequest = require('../utils/buildRequest');

var _buildRequest2 = _interopRequireDefault(_buildRequest);

var _checkTypes = require('../utils/checkTypes');

var _checkTypes2 = _interopRequireDefault(_checkTypes);

var _PromiseState = require('../PromiseState');

var _PromiseState2 = _interopRequireDefault(_PromiseState);

var _hoistNonReactStatics = require('hoist-non-react-statics');

var _hoistNonReactStatics2 = _interopRequireDefault(_hoistNonReactStatics);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

var _lodash = require('lodash.omit');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var defaultMapPropsToRequestsToProps = function defaultMapPropsToRequestsToProps() {
  return {};
};

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

// Helps track hot reloading.
var nextVersion = 0;

function connectFactory() {
  var defaults = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  function connectImpl(map) {
    var deprecatedOptionsArgument = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var finalOptions = options;
    if ('withRef' in deprecatedOptionsArgument) {
      (0, _warning2.default)(false, 'The options argument is deprecated in favor of `connect.options()`. In a future release, support will be removed.');
      finalOptions = Object.assign({}, options, { withRef: deprecatedOptionsArgument.withRef });
    }

    (0, _warning2.default)(!(Function.prototype.isPrototypeOf(defaults.buildRequest) && Function.prototype.isPrototypeOf(defaults.Request)), 'Both buildRequest and Request were provided in `connect.defaults()`. ' + 'However, this custom Request would only be used in the default buildRequest.');

    return connect(map, defaults, finalOptions);
  }

  connectImpl.defaults = function () {
    var overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    (0, _checkTypes2.default)(overrides);
    return connectFactory(Object.assign({}, defaults, overrides, { headers: Object.assign({}, defaults.headers, overrides.headers) }), options);
  };

  connectImpl.options = function () {
    var overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return connectFactory(defaults, Object.assign({}, options, overrides));
  };

  return connectImpl;
}

exports.default = connectFactory({
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});


var omitChildren = (0, _lodash2.default)('children');

function connect(mapPropsToRequestsToProps, defaults, options) {
  var finalMapPropsToRequestsToProps = mapPropsToRequestsToProps || defaultMapPropsToRequestsToProps;
  var dependsOnProps = finalMapPropsToRequestsToProps.length >= 1;
  var dependsOnContext = finalMapPropsToRequestsToProps.length == 2;

  var topFetch = void 0;
  var topRequest = void 0;
  if (typeof window !== 'undefined') {
    if (window.fetch) {
      topFetch = window.fetch.bind(window);
    }
    if (window.Request) {
      topRequest = window.Request.bind(window);
    }
  } else if (typeof global !== 'undefined') {
    if (global.fetch) {
      topFetch = global.fetch.bind(global);
    }
    if (global.Request) {
      topRequest = global.Request.bind(global);
    }
  } else if (typeof self !== 'undefined') {
    if (self.fetch) {
      topFetch = self.fetch.bind(self);
    }
    if (self.Request) {
      topRequest = self.Request.bind(self);
    }
  }

  defaults = Object.assign({
    buildRequest: _buildRequest2.default,
    credentials: 'same-origin',
    fetch: topFetch,
    force: false,
    handleResponse: _handleResponse2.default,
    method: 'GET',
    redirect: 'follow',
    refreshing: false,
    refreshInterval: 0,
    Request: topRequest
  }, defaults);

  (0, _checkTypes2.default)(defaults);

  options = Object.assign({
    withRef: false,
    pure: true
  }, options);

  // Helps track hot reloading.
  var version = nextVersion++;

  function coerceMappings(rawMappings) {
    (0, _invariant2.default)((0, _isPlainObject2.default)(rawMappings), '`mapPropsToRequestsToProps` must return an object. Instead received %s.', rawMappings);

    var mappings = {};
    Object.keys(rawMappings).forEach(function (prop) {
      mappings[prop] = coerceMapping(prop, rawMappings[prop]);
    });
    return mappings;
  }

  function coerceMapping(prop, mapping, parent) {
    if (Function.prototype.isPrototypeOf(mapping)) {
      return mapping;
    }

    if (typeof mapping === 'string') {
      mapping = { url: mapping };
    }

    (0, _invariant2.default)((0, _isPlainObject2.default)(mapping), 'Request for `%s` must be either a string or a plain object. Instead received %s', prop, mapping);
    (0, _invariant2.default)(mapping.hasOwnProperty('url') || mapping.hasOwnProperty('value'), 'Request object for `%s` must have `url` (or `value`) attribute.', prop);
    (0, _invariant2.default)(!(mapping.hasOwnProperty('url') && mapping.hasOwnProperty('value')), 'Request object for `%s` must not have both `url` and `value` attributes.', prop);

    (0, _checkTypes2.default)(mapping);

    if (parent) {
      mapping.parent = parent.parent || parent;
    }

    mapping = assignDefaults(mapping, parent);

    (0, _invariant2.default)((0, _isPlainObject2.default)(mapping.meta), 'meta for `%s` must be a plain object. Instead received %s', prop, mapping.meta);

    mapping.equals = function (that) {
      var _this = this;

      that = that.parent || that;

      if (this.comparison !== undefined) {
        return this.comparison === that.comparison;
      }

      return ['value', 'url', 'method', 'headers', 'body'].every(function (c) {
        return (0, _shallowEqual2.default)(_this[c], that[c]);
      });
    }.bind(mapping);

    return mapping;
  }

  function assignDefaults(mapping, parent) {
    var rawHeaders = Object.assign({}, defaults.headers, mapping.headers);
    var headers = {};
    for (var key in rawHeaders) {
      // Discard headers with falsy values
      if (rawHeaders.hasOwnProperty(key) && rawHeaders[key]) {
        headers[key] = rawHeaders[key];
      }
    }

    return Object.assign({
      meta: {}
    }, defaults, parent ? {
      fetch: parent.fetch,
      buildRequest: parent.buildRequest,
      handleResponse: parent.handleResponse,
      Request: parent.Request,
      comparison: parent.comparison,
      then: undefined,
      andThen: undefined
    } : {}, mapping, { headers: headers });
  }

  return function wrapWithConnect(WrappedComponent) {
    var RefetchConnect = function (_Component) {
      _inherits(RefetchConnect, _Component);

      function RefetchConnect(props, context) {
        _classCallCheck(this, RefetchConnect);

        var _this2 = _possibleConstructorReturn(this, _Component.call(this, props, context));

        _this2.version = version;
        _this2.state = { mappings: {}, startedAts: {}, data: {}, refreshTimeouts: {} };
        return _this2;
      }

      RefetchConnect.prototype.componentWillMount = function componentWillMount() {
        this.refetchDataFromProps();
      };

      RefetchConnect.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps, nextContext) {
        if (!options.pure || dependsOnProps && !(0, _shallowEqual2.default)(omitChildren(this.props), omitChildren(nextProps)) || dependsOnContext && !(0, _shallowEqual2.default)(this.context, nextContext)) {
          this.refetchDataFromProps(nextProps, nextContext);
        }
      };

      RefetchConnect.prototype.shouldComponentUpdate = function shouldComponentUpdate(nextProps, nextState) {
        return !options.pure || this.state.data != nextState.data || !(0, _shallowEqual2.default)(this.props, nextProps);
      };

      RefetchConnect.prototype.componentWillUnmount = function componentWillUnmount() {
        this.clearAllRefreshTimeouts();
        this._unmounted = true;
      };

      RefetchConnect.prototype.render = function render() {
        var ref = options.withRef ? 'wrappedInstance' : null;
        return _react2.default.createElement(WrappedComponent, _extends({}, this.state.data, this.props, { ref: ref }));
      };

      RefetchConnect.prototype.getWrappedInstance = function getWrappedInstance() {
        (0, _invariant2.default)(options.withRef, 'To access the wrapped instance, you need to specify { withRef: true } in .options().');

        return this.refs.wrappedInstance;
      };

      RefetchConnect.prototype.refetchDataFromProps = function refetchDataFromProps() {
        var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;
        var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.context;

        this.refetchDataFromMappings(finalMapPropsToRequestsToProps(omitChildren(props), context) || {});
      };

      RefetchConnect.prototype.refetchDataFromMappings = function refetchDataFromMappings(mappings) {
        var _this3 = this;

        mappings = coerceMappings(mappings);
        Object.keys(mappings).forEach(function (prop) {
          var mapping = mappings[prop];

          if (Function.prototype.isPrototypeOf(mapping)) {
            _this3.setAtomicState(prop, new Date(), mapping, function () {
              _this3.refetchDataFromMappings(mapping.apply(undefined, arguments));
            });
            return;
          }

          if (mapping.force || !mapping.equals(_this3.state.mappings[prop] || {})) {
            _this3.refetchDatum(prop, mapping);
          }
        });
      };

      RefetchConnect.prototype.refetchDatum = function refetchDatum(prop, mapping) {
        var startedAt = new Date();

        if (this.state.refreshTimeouts[prop]) {
          window.clearTimeout(this.state.refreshTimeouts[prop]);
        }

        return this.createPromise(prop, mapping, startedAt);
      };

      RefetchConnect.prototype.createPromise = function createPromise(prop, mapping, startedAt) {
        var _this4 = this;

        var meta = mapping.meta;
        var initPS = this.createInitialPromiseState(prop, mapping);
        var onFulfillment = this.createPromiseStateOnFulfillment(prop, mapping, startedAt);
        var onRejection = this.createPromiseStateOnRejection(prop, mapping, startedAt);

        if (mapping.hasOwnProperty('value')) {
          if (mapping.value instanceof Promise) {
            this.setAtomicState(prop, startedAt, mapping, initPS(meta));
            return mapping.value.then(onFulfillment(meta), onRejection(meta));
          } else {
            return onFulfillment(meta)(mapping.value);
          }
        } else {
          var request = mapping.buildRequest(mapping);
          meta.request = request;
          this.setAtomicState(prop, startedAt, mapping, initPS(meta));

          var fetched = mapping.fetch(request);
          return fetched.then(function (response) {
            meta.response = response;
            meta.component = _this4.refs.wrappedInstance;

            return response;
          }).then(mapping.handleResponse).then(onFulfillment(meta), onRejection(meta));
        }
      };

      RefetchConnect.prototype.createInitialPromiseState = function createInitialPromiseState(prop, mapping) {
        var _this5 = this;

        return function (meta) {
          if (typeof mapping.refreshing == 'function') {
            var current = _this5.state.data[prop];
            if (current) {
              current.value = mapping.refreshing(current.value);
            }
            return _PromiseState2.default.refresh(current, meta);
          } else if (mapping.refreshing) {
            return _PromiseState2.default.refresh(_this5.state.data[prop], meta);
          } else {
            return _PromiseState2.default.create(meta);
          }
        };
      };

      RefetchConnect.prototype.createPromiseStateOnFulfillment = function createPromiseStateOnFulfillment(prop, mapping, startedAt) {
        var _this6 = this;

        return function (meta) {
          return function (value) {
            var refreshTimeout = null;
            if (mapping.refreshInterval > 0) {
              refreshTimeout = window.setTimeout(function () {
                _this6.refetchDatum(prop, Object.assign({}, mapping, { refreshing: true, force: true }));
              }, mapping.refreshInterval);
            }

            if (mapping.then) {
              var thenMapping = mapping.then(value, meta);
              if (typeof thenMapping !== 'undefined') {
                _this6.refetchDatum(prop, coerceMapping(null, thenMapping, mapping));
                return;
              }
            }

            _this6.setAtomicState(prop, startedAt, mapping, _PromiseState2.default.resolve(value, meta), refreshTimeout, function () {
              if (mapping.andThen) {
                _this6.refetchDataFromMappings(mapping.andThen(value, meta));
              }
            });
          };
        };
      };

      RefetchConnect.prototype.createPromiseStateOnRejection = function createPromiseStateOnRejection(prop, mapping, startedAt) {
        var _this7 = this;

        return function (meta) {
          return function (reason) {
            if (mapping.catch) {
              var catchMapping = mapping.catch(reason, meta);
              if (typeof catchMapping !== 'undefined') {
                _this7.refetchDatum(prop, coerceMapping(null, catchMapping, mapping));
                return;
              }
            }

            _this7.setAtomicState(prop, startedAt, mapping, _PromiseState2.default.reject(reason, meta), null, function () {
              if (mapping.andCatch) {
                _this7.refetchDataFromMappings(mapping.andCatch(reason, meta));
              }
            });
          };
        };
      };

      RefetchConnect.prototype.setAtomicState = function setAtomicState(prop, startedAt, mapping, datum, refreshTimeout, callback) {
        if (this._unmounted) {
          return;
        }

        this.setState(function (prevState) {
          var _Object$assign, _Object$assign2, _Object$assign3, _Object$assign4;

          if (startedAt < prevState.startedAts[prop]) {
            return {};
          }

          return {
            startedAts: Object.assign({}, prevState.startedAts, (_Object$assign = {}, _Object$assign[prop] = startedAt, _Object$assign)),
            mappings: Object.assign({}, prevState.mappings, (_Object$assign2 = {}, _Object$assign2[prop] = mapping, _Object$assign2)),
            data: Object.assign({}, prevState.data, (_Object$assign3 = {}, _Object$assign3[prop] = datum, _Object$assign3)),
            refreshTimeouts: Object.assign({}, prevState.refreshTimeouts, (_Object$assign4 = {}, _Object$assign4[prop] = refreshTimeout, _Object$assign4))
          };
        }, callback);
      };

      RefetchConnect.prototype.clearAllRefreshTimeouts = function clearAllRefreshTimeouts() {
        var _this8 = this;

        Object.keys(this.state.refreshTimeouts).forEach(function (prop) {
          clearTimeout(_this8.state.refreshTimeouts[prop]);
        });
      };

      return RefetchConnect;
    }(_react.Component);

    RefetchConnect.displayName = 'Refetch.connect(' + getDisplayName(WrappedComponent) + ')';
    RefetchConnect.WrappedComponent = WrappedComponent;

    if (dependsOnContext && WrappedComponent.contextTypes) {
      RefetchConnect.contextTypes = WrappedComponent.contextTypes;
    }

    if (process.env.NODE_ENV !== 'production') {
      RefetchConnect.prototype.componentWillUpdate = function componentWillUpdate() {
        if (this.version === version) {
          return;
        }

        // We are hot reloading!
        this.version = version;
        this.clearAllRefreshTimeouts();
        this.refetchDataFromProps();
      };
    }

    return (0, _hoistNonReactStatics2.default)(RefetchConnect, WrappedComponent);
  };
}