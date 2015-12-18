/**
 * @license Angulartics v0.19.2
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * License: MIT
 */
(function (angular) {
    'use strict';

    /**
     * @ngdoc overview
     * @name angulartics.google.analytics
     * Enables analytics support for Google Analytics (http://google.com/analytics)
     * for Cordova with google-analytics-plugin (https://github.com/danwilson/google-analytics-plugin)
     */
    angular.module('angulartics.appsee', ['angulartics'])

        .provider('appseeCordova', function () {
            var appseeCordova = [
                '$q', '$log', 'ready', 'debug', 'trackingId',
                function ($q, $log, ready, debug, trackingId) {
                    var deferred = $q.defer();
                    var deviceReady = false;

                    window.addEventListener('deviceReady', function () {
                        deviceReady = true;
                        deferred.resolve();
                    });

                    setTimeout(function () {
                        if (!deviceReady) {
                            deferred.resolve();
                        }
                    }, 3000);

                    function success() {
                        if (debug) {
                            $log.info(arguments);
                        }
                    }

                    function failure(err) {
                        if (debug) {
                            $log.error(err);
                        }
                    }

                    this.init = function () {
                        return deferred.promise.then(function () {
                            var analytics = window.Appsee;
                            if (typeof analytics != 'undefined') {
                                ready(analytics, success, failure);
                                analytics.start(trackingId);
                            } else if (debug) {
                                $log.error('AppSee Plugin for Cordova is not available');
                            }
                        });
                    };
                }];

            return {
                $get: ['$injector', function ($injector) {
                    return $injector.instantiate(appseeCordova, {
                        ready: this._ready || angular.noop,
                        debug: this.debug,
                        trackingId: this.trackingId
                    });
                }],
                ready: function (fn) {
                    this._ready = fn;
                }
            };
        })

        .config(['$analyticsProvider', 'appseeCordovaProvider', function ($analyticsProvider, appseeCordovaProvider) {
            
            appseeCordovaProvider.ready(function (analytics, success, failure) {

                $analyticsProvider.registerPageTrack(function (path) {
                    analytics.startScreen(path);
                });

                $analyticsProvider.registerEventTrack(function (action, properties) {
                    analytics.addEventWithProperties(action, properties);
                });

            });
            
        }])

        .run(['appseeCordova', function (appseeCordova) {
            appseeCordova.init();
        }]);

})(angular);
