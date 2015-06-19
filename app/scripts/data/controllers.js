define(['app_vertical/services'], function() {
    var app = angular.module('dataApp.controllers', ['pmtBase']);

    // https://docs.google.com/a/wandoujia.com/document/d/1czdHkZiPJMFnEMnvppbhGWLuhG-5xdUPa5vt9lQyr9k/edit
    // Todo support 特定 App 下载量

    var chartOptions = {
        chart: {
            events: {}
        },
        title: {
            text: null
        },
        subtitle: {},
        tooltip: {
            crosshairs: true,
            shared: true
        },
        series: [],
        xAxis: {
            type: 'datetime'
        },
        credits: {},
        navigator: {
            enabled: false
        },
        lang: {
            noData: '没有查询到相关数据'
        },
        noData: {
            style: {
                fontSize: '18px',
                color: '#303030'
            }
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            series: {
                connectNulls: false
            }
        }
    };

    app.controller('reportCtrl', function($scope, $rootScope, $timeout, apiHelper) {
        $timeout(function() {
            baseDateRangeInit($scope, [moment().subtract('days', 29), moment()]);
            $scope.fetchMetrics();
        });

        $scope.fetchMetrics = function() {
            apiHelper('fetchMetrics', {
                params: {
                    startTime: $scope.startDate,
                    endTime: $scope.endDate
                },
                buzy: 'global'
            }).then(function(r) {
                var _dict = {};
                _.each(r, function(i) {
                    _dict[i.tokenId] = i.data;
                });
                $scope.allReportData = _dict;

                if ($scope.$root.currentConfig) {
                    $scope.currentReportData = $scope.allReportData[$scope.$root.currentConfig.alias];
                }
            });
        };

        $scope.exportCSV = function(e) {
            $scope._exportCsv.apply(e.target, [$('.pmt-standard-table:visible'), '查看数据-豌豆荚-Partners.csv']);
        };

        $scope.$watch('currentReportData', function(v) {
            if (!v) return;
            if (!v.length) return;
            var metricAliasList = '请求量,下载量,收入,分成,DAU,DLU,MAU,启动次数'.split(',');
            var metricNameList = 'requestsCount,downloadCount,profit,share,dayActiveUsers,dayLaunchUsers,monthActiveUsers,launchCount'.split(',');

            $scope.metricsList = _.map(metricAliasList, function(i, idx) {
                return {
                    name: metricNameList[idx],
                    alias: i
                };
            });

            function caluDaterange(last, first) {
                var diff = new Date(last).getTime() - new Date(first).getTime();
                return diff / (1000 * 60 * 60 * 24);
            }

            function fixUpEmptySeries(name, resp) {
                var first = resp[0].date;
                var daterange = _.range(caluDaterange(_.last(resp).date, resp[0].date) + 1);
                return _.map(daterange, function(i) {
                    var t = _.find(resp, function(ii) {
                        return new Date(ii.date).getTime() === new Date(first).getTime() + (1000 * 60 * 60 * 24) * i;
                    });
                    return t ? t[name] : null;
                });
            }

            chartOptions.series = _.map($scope.metricsList, function(i) {
                return {
                    pointInterval: 86400000,
                    pointStart: new Date(v[0].date).getTime(),
                    data: fixUpEmptySeries(i.name, v), //  _.pluck(v, i.name),
                    name: i.alias
                };
            });
            $('#main-chart').highcharts(chartOptions);
        });

        $rootScope.$watch('currentConfig.alias', function(val) {
            if (!val) return;
            if (!$scope.allReportData) return;
            $scope.currentReportData = $scope.allReportData[val];
        });
    });

    app.controller('appReportCtrl', function($scope, $rootScope, $timeout, apiHelper) {
        $timeout(function() {
            baseDateRangeInit($scope, [moment().subtract('days', 29), moment()]);
            $scope.fetchAppDown();
        });

        $scope.fetchAppDown = function() {
            apiHelper('fetchAppDown', {
                params: {
                    startTime: $scope.startDate,
                    endTime: $scope.endDate,
                    countFilter: 100
                },
                buzy: 'global'
            }).then(function(r) {
                var _dict = {};
                _.each(r, function(i) {
                    _dict[i.tokenId] = i.data;
                });
                $scope.allAppReport = _dict;
                if ($scope.$root.currentConfig) {
                    $scope.currentAppReport = $scope.allAppReport[$scope.$root.currentConfig.alias];
                }
            });
        };

        $scope.exportCSV = function(e) {
            var filename = '应用下载数据-豌豆荚-Partners.csv';
            var params = {
                    startTime: $scope.startDate,
                    endTime: $scope.endDate,
                    config: $scope.$root.currentConfig.alias,
                    filename: filename
                };
            var url = apiHelper.getUrl('fetchAppDown', 'export');
            var tempParams = [];
            for (name in params) {
                tempParams.push(encodeURIComponent(name) + '=' + encodeURIComponent(params[name]));
            }
            url = url + '?' + tempParams.join('&');
            $(e.target).attr({target: '_blank', href: url});
        };

        $rootScope.$watch('currentConfig.alias', function(val) {
            if (!val) return;
            if (!$scope.allAppReport) return;
            $scope.currentAppReport = $scope.allAppReport[val];
        });
    });
});