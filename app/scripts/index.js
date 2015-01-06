window._ServerUrl = 'http://test.wandoujia.com';
require(['routes',
    'templates',
    'system/index',
    'app_vertical/index',
    'data/index'
], function(routeInfo) {

    /* Base Setup here */
    // extend underscore functionlity
    _.mixin(_.string.exports());
    // http://stackoverflow.com/questions/1408289/best-way-to-do-variable-interpolation-in-javascript
    String.prototype.supplant = function(o) {
        return this.replace(/{([^{}]*)}/g,
            function(a, b) {
                var r = o[b];
                return typeof r === 'string' || typeof r === 'number' ? r : a;
            }
        );
    };

    var oemApp = angular.module('oemApp', [
        'ngSanitize',
        'ngAnimate',
        'ui.router',
        'ui.bootstrap',
        'oemApp.templates',
        'systemApp',
        'appVerticalApp',
        'dataApp'
    ]);

    /* base routes defined here */
    oemApp.config(function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/system');
    });

    oemApp.run(function($state, $rootScope) {
        $rootScope.$state = $state;
    });

    // Todo: 探索下 directive(Name 哪些会被过滤掉，attribute 大小写等)
    oemApp.directive('sTable', function() {
        return {
            templateUrl: 'templates/_tpls/data-table.html',
            restrict: 'EA',
            scope: {
                dataList: '=rowList',
                headList: '='
            },
            replace: true
        };
    });

    oemApp.directive('s', function($compile) {
        return {
            templateUrl: 'templates/_tpls/router-item.html',
            scope: {
                item: '=data'
            },
            replace: true,
            link: function($scope, $elem, $attr) {
                // $attr.$set('ui-sref', $scope.item.state);
                var link = $elem.find('a')[0];
                link.setAttribute('ui-sref', $scope.item.state);
                $compile($elem.contents())($scope);
            }
        }
    });

    angular.bootstrap(document, ['oemApp']);
});