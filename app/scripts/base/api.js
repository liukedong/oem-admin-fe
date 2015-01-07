define([], function() {
    function apiHelper($http) {
        var _maps = {},
            _urlPrfix = '';

        function _buildUrl(toUrl, params) {
            if (!params) return toUrl;

            _.each(params, function(val) {
                if (toUrl.indexOf('/:') > -1) {
                    toUrl = toUrl.replace(/\/:[^/]+/, '/' + val);
                } else {
                    toUrl = toUrl + '/' + val;
                }
            });
            return toUrl;
        }

        // endpont[, url part arr][,data/params][,opt]
        function helper(endpoint, opt) {
            arguments = _.toArray(arguments);
            var _api = _maps[arguments.shift()];
            if (!_api) throw new Error('Endpint ' + endpoint + 'Does Not Exist!');
            if (_.isObject(_.last(arguments))) {
                opt = arguments.pop();
            } else {
                opt = {};
            }
            if (_.isObject(_.last(arguments))) {
                if (/(DELETE)|(GET)/.test(_api.method)) {
                    opt.params = arguments.pop();
                } else {
                    opt.data = arguments.pop();
                }
            }

            return $http(_.extend({
                method: _api.method,
                url: _buildUrl(_api.url, arguments),
            }, opt));
        }

        helper.config = function(maps, opt) {
            var _prefix = _urlPrfix;
            if (opt && opt.urlPrefix) {
                _prefix = opt.urlPrefix;
            }
            _.each(maps, function(apiStr, key) {
                maps[key] = {
                    method: apiStr.split(' ')[0],
                    url: _prefix + apiStr.split(' ')[1]
                };
            });
            _maps = _.extend(_maps, maps);
        };

        helper.getUrl = function(endpoint) {
            arguments = _.toArray(arguments);
            var _api = _maps[arguments.shift()];
            return _buildUrl(_api.url, arguments)
        };

        return helper;
    }

    // 'muceApp.base.services.notice'
    angular.module('siva.apiUtilities', [])
        .factory('apiHelper', ['$http', apiHelper])
        .factory('apiHelperInterceptor', function($q, $location, $rootScope, $notice) {

            function unwrapResponse(response) {
                var data = response.data;
                try {
                    if (typeof data === 'string') {
                        data = JSON.parse(data);
                        response.data = data;
                    }
                } catch (err) {
                    return response;
                }
            }

            function requestHandler(config) {
                if (config.url.indexOf('templates') === -1) {
                    var _params = $location.search();
                    config.params = _.extend({}, $location.search(), config.params);
                }
                return config;
            }

            function responseErrorHandler(response) {
                unwrapResponse(response);
                if ($rootScope.hasAuthed) {
                    try {
                        var errTypeMap = {
                            offlineError: '不存在或下线应用',
                            blacklist: '黑名单应用',
                            repeatError: '重复应用'
                        };
                        var _msg = '';
                        if (response.data) {
                            _.each(['offlineError', 'blacklist', 'repeatError'], function(type) {
                                if (response.data[type]) {
                                    _msg += '包名中包含了' + errTypeMap[type] + ': ' + response.data[type].join(', ');
                                }
                            });
                        }
                        if (!_msg) {
                            _msg = 'Error-' + response.status + ': ' + (response.config.url || '');
                        }
                        $notice.error(_msg);
                    } catch (e) {
                        console.log('Err in apiHelperInterceptor: ' + e);
                    }
                }
                return $q.reject(response);
            }

            function responseHandler(response) {
                unwrapResponse(response);
                // api prefix check
                if (response.config.url.indexOf('/api/') > -1) {
                    if (_.contains(['PUT', 'POST', 'DELETE'], response.config.method)) {
                        $notice.success('操作成功！\n设置将在十分钟内全部生效');
                    }
                    // omit for angular-file-upload callback
                    if (response.config.file) {
                        return response;
                    }
                    return response.data;
                }
                return response;
            }

            return {
                request: requestHandler,
                responseError: responseErrorHandler,
                response: responseHandler
            };
        })
        .config(function($httpProvider) {
            $httpProvider.defaults.transformResponse.splice(0, 1);
            $httpProvider.interceptors.push('apiHelperInterceptor');
        });
});