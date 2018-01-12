﻿var app = angular.module('asmeApp', ['ngMap', 'angular-loading-bar', 'ngMaterial', 'angular.filter']);

app.factory('asmeFactory', ['$http', function ($http) {
    return {
        getTopics: function (pagenum) {
            return $http.get('/Data/GetTopics?pagenum=' + pagenum);
        }
    };
}]);

app.directive('topicCard', topicCardDirective);
function topicCardDirective() {
    return {
        restrict: 'E',
        templateUrl: '/templates/topiccard'
    };
}

app.controller('asmeController', asmeController);

asmeController.$inject = ['$scope', '$window', '$interval', 'asmeFactory', 'NgMap'];

function asmeController($scope, $window, $interval, asmeFactory, NgMap) {
    console.log('home controller', Date());
    var pagenum = 1;
    var searching = false;
    $scope.defaultImage = "/Content/images/ASME-Logo-white-border.png";

    var getTopics = function (domore) {
        searching = true;
        asmeFactory.getTopics(pagenum).then(function (res) {
            console.log('got asme topics', res);
            searching = false;
            if (domore) {
                $scope.topicPretty += JSON.stringify(res, null, 2);
                res.data.topics.forEach(function (item) {
                    $scope.topics.push(item);
                })
            } else {
                $scope.topicPretty = JSON.stringify(res, null, 2);
                $scope.topics = res.data.topics;
            }
            
            $scope.topicCategories = [...new Set($scope.topics.map(item => item.LinkCalloutText))];
        }).catch(function (e) {
            console.log('error getting d2 topic', e);
        });
    };

    getTopics(false);

    //detect when scrolled to bottom of the page so we can asynchrounsly load more
    var lastWindowBottom = 0;
    angular.element($window).bind("scroll", function () {
        var windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
        var body = document.body, html = document.documentElement;
        var docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        windowBottom = windowHeight + window.pageYOffset;
        if (windowBottom + 100 >= docHeight && windowBottom > lastWindowBottom) {
            if (!searching && $scope.topics) {
                $scope.getMore();
            }
        }
        //for determining which direction we are scrolling in case applied filters keep scroll at bottom of screen
        lastWindowBottom = windowBottom;
    });

    $scope.getMore = function () {
        pagenum++;
        getTopics(true);
    }

    $scope.goToUrl = function (url) {
        $window.open('https://www.asme.org' + url);
    }
    $scope.filterTopic = function (val, type) {
        //filter by first entered search string then by category
        var returnData = $scope.topics;
        if (val) {
            returnData = returnData.filter(x => x.BigHeader.toLowerCase().indexOf(val.toLowerCase()) > -1 || x.Copy.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }
        if (type) {
            returnData = returnData.filter(x => x.LinkCalloutText.indexOf(type) > -1);
        }
        return returnData;
    };
    
    $scope.scrollTo = function (el) {
        $(el).goTo();
    };

}

$(function () {
    $.fn.goTo = function () {
        $('html, body').animate({
            scrollTop: ($(this).offset().top - 50) + 'px'
        }, 'fast');
        $(this).focus();
        return this; // for chaining...
    };
});