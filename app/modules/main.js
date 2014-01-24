'use strict';

angular.module('kscrPocApp', [
  'ngAnimate',
  //'ngCookies',
  'ngResource',
  'ngSanitize',
  //'ngRoute',
  'ngTouch',
  'ui.router',
  'jmdobry.angular-cache'
])
  .config(function ($httpProvider, $stateProvider, $urlRouterProvider) {
    
    // Enable cross-domain resource sharing (CORS)
    // http://thibaultdenizet.com/tutorial/cors-with-angular-js-and-sinatra/
    $httpProvider.defaults.useXDomain = true;
    //delete $httpProvider.defaults.headers.common['X-Requested-With'];

    // States
    $stateProvider
      .state('app', {
        abstract: true,
        templateUrl: 'modules/app.html',
        controller: 'AppCtrl'
      })
      .state('app.search', {
        url: '/search',
        templateUrl: 'modules/app/search.html',
        data: {
          title: 'Search'
        }
      })
      .state('app.search.results-empty', {
        url: '',
        templateUrl: 'modules/app/search/results-empty.html',
        data: {
          title: 'No results'
        }
      })
      .state('app.search.results', {
        abstract: true,
        url: '',
        templateUrl: 'modules/app/search/results.html',
        controller: 'AppSearchResultsCtrl'
      })
      .state('app.search.results.list', {
        url: '',
        templateUrl: 'modules/app/search/results/list.html',
        data: {
          title: '3 results'
        }
      })
      .state('app.search.results.details', {
        url: '/:index/:code',
        templateUrl: 'modules/app/search/results/details.html',
        controller: 'AppSearchResultsDetailsCtrl'
      })
      .state('app.schedule', {
        url: '/schedule',
        templateUrl: 'modules/app/schedule.html',
        data: {
          title: 'Schedule'
        },
        controller: 'AppScheduleCtrl'
      });

    // For any unmatched url, send to a default route
    $urlRouterProvider.otherwise('/search');
  })
  .run(function ($rootScope, $state, $angularCacheFactory, $http) {
    $rootScope.$state = $state;

    var pageTitle = 'Course Registration';
    $rootScope.pageTitle = pageTitle;

    $rootScope.$on('$stateChangeSuccess', function (event, toState) {
      var titles = [pageTitle];
      if(angular.isDefined(toState.data) && angular.isDefined(toState.data.title)) {
        titles.unshift(toState.data.title);
      }
      $rootScope.pageTitle = titles.join(' - ');
    });

    // Until the `ui-sref` directive allows dynamic state references,
    // we need to manually store and trigger dynamic states.
    // https://github.com/angular-ui/ui-router/issues/395

    // TODO
    // Perhaps a full history could be stored for each state,
    // instead of only one-level back.

    // List of all dynamic state references.
    $rootScope.srefs = {};

    // Register a dynamic state reference.
    var registerSref = function(baseStateName, toState, toParams) {
      $rootScope.srefs[baseStateName] = $state.href(toState, toParams);
    };

    // Registering the default dynamic states.
    registerSref('app.search', 'app.search');

    // Whenver the state changes, override the dynamic href
    // generated for any of the decendants of the base state.
    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams) {
      angular.forEach($rootScope.srefs, function(value, key) {
        if( $state.includes(key) ) {
          registerSref(key, toState, toParams);
        }
      });
    });

    //
    // Caching
    //

    // Configuration
    // http://jmdobry.github.io/angular-cache/configuration.html
    var defaultCache = $angularCacheFactory('defaultCache', {
      // Hold 1000 items.
      cache: 1000,
      // Items expire after 15 minutes.
      maxAge: 15 * 60 * 1000,
      // Cache clears after 60 minutes.
      cacheFlushInterval: 60 * 60 * 1000,
      // Items will be swiftly deleted.
      deleteOnExpire: 'aggressive',
      // Store cache.
      storageMode: 'localStorage',
      // Sync with localStorage on every operation.
      verifyIntegrity: true
    });

    // Override the default cache.
    //$http.defaults.cache = defaultCache;

  });
