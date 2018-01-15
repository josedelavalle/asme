var app = angular.module('asmeApp', ['ngMap', 'angular-loading-bar', 'ngMaterial', 'angular.filter', 'googlechart']);

app.factory('asmeFactory', ['$http', function ($http) {
    return {
        getTopics: function (pageNum) {
            return $http.get('/Data/GetTopics?pagenum=' + pageNum);
        },
        getProducts: function (pageNum) {
            return $http.get('/Data/GetProducts?pagenum=' + pageNum);
        },
        getEvents: function () {
            return $http.get('/Data/GetEvents');
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

app.directive('productCard', productCardDirective);
function productCardDirective() {
    return {
        restrict: 'E',
        templateUrl: '/templates/productcard'
    };
}

app.directive('eventCard', eventCardDirective);
function eventCardDirective() {
    return {
        restrict: 'E',
        templateUrl: '/templates/eventcard'
    };
}


app.directive('slideToggle', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var target, content;
            attrs.expanded = (attrs.expanded === "true") ? true : false;

            element.bind('click', function (e) {
                if (!attrs.slideToggle) {
                    if (!target) target = $(this).parent().find(".slideable")[0];
                } else {
                    if (!target) target = document.querySelector(attrs.slideToggle);
                }
                if (!content) content = target.querySelector('.slideable_content');
                if (!attrs.expanded) {
                    content.style.border = '1px solid rgba(0,0,0,0)';
                    var y = content.clientHeight;
                    content.style.border = 0;
                    target.style.height = y + 'px';
                } else {
                    target.style.height = '100px';
                }
                attrs.expanded = !attrs.expanded;
            });
        }
    };
});

app.directive('slideable', function () {
    return {
        restrict: 'C',
        compile: function (element, attr) {
            // wrap tag
            var contents = element.html();
            element.html('<div class="slideable_content" style="margin:0 !important; padding:0 !important" >' + contents + '</div>');

            return function postLink(scope, element, attrs) {
                // default properties
                attrs.duration = (!attrs.duration) ? '1s' : attrs.duration;
                attrs.easing = (!attrs.easing) ? 'ease-in-out' : attrs.easing;
                var startHeight = "100px";
                //if (!attrs.showonload) {

                //    var y = content.clientHeight;
                //    startHeight = y + 'px';
                //}
                element.css({
                    'overflow': 'hidden',
                    'height': startHeight,
                    'transitionProperty': 'height',
                    'transitionDuration': attrs.duration,
                    'transitionTimingFunction': attrs.easing,
                    'background': 'rgba(0, 0, 0, 0)'
                });
            };
        }
    };
});

app.filter("trust", ['$sce', function ($sce) {
    return function (htmlCode) {
        return $sce.trustAsHtml(htmlCode);
    }
}]);

app.controller('asmeController', asmeController);

asmeController.$inject = ['$scope', '$window', '$interval', 'asmeFactory', 'NgMap'];

function asmeController($scope, $window, $interval, asmeFactory, NgMap) {
    console.log('home controller', Date());
    var heatmap, vm = this;
    var topicsPageNum = 1;
    var productsPageNum = 1;
    $scope.showcard = 1;
    var searching = false;
    $scope.currentNavItem = 'page1';
    $scope.showMarkers = true;
    $scope.showHeatmap = false;
    var colorArray = ['#1baae5', '#195772', '#0378aa', '#3e7187'];

    if ($window.innerWidth < 767) {
        $scope.chartHeight = "190px";
        $scope.isMobile = true;
    } else {
        $scope.chartHeight = "200px";
        $scope.isMobile = false;
    }
    

    $scope.defaultImage = "/Content/images/ASME-Logo-white-border.png";

    function groupArray(arr, field) {
        var counts = arr.reduce((p, c) => {
            var name = c[field];
            if (!p.hasOwnProperty(name)) {
                p[name] = 0;
            }
            p[name]++;
            return p;
        }, {});
        return counts;
    }
    
    var formatChart = function (obj) {
        $scope.myTopicChartObject.data.rows = [];
        // group array by field
        var counts = groupArray(obj, 'LinkCalloutText');

        // map grouped array into usable object
        var countsExtended = Object.keys(counts).map(k => {
            return { name: k, count: counts[k] };
        });

        var i = 0;

        countsExtended.forEach(function (item) {
            var objToPush = {
                c: [
                    { v: item.name },
                    { v: item.count },
                    { v: colorArray[i % colorArray.length] },
                    { v: item.count }
                ]
            };
            i++;
            $scope.myTopicChartObject.data.rows.push(objToPush);
        });
    }

    var createHeatmapData = function (data) {
        
        $scope.heatmapData = data.map(function (item) {
            if ((item) && item[0] && item[1] ) {
                return new google.maps.LatLng(item[0], item[1]);
            }
        });
        console.log('heatmap data', $scope.heatmapData);
        initHeatmap();
    };

    var initHeatmap = function (action) {
        NgMap.getMap({ id: 'big-map' }).then(function (map) {
            vm.map = map;
            if (action == 'remove') {
                $scope.heatmapData = null;
            } else {
                heatmap = vm.map.heatmapLayers.heatmap;
                heatmap.set('radius', 20);
            }
            
        });
    }

    $scope.toggleMarkers = function () {
        $scope.showMarkers = !$scope.showMarkers;
    }

    $scope.toggleHeatmap = function () {
        $scope.showHeatmap = !$scope.showHeatmap;
        heatmap.setMap(heatmap.getMap() ? null : vm.map);
    };
    //$scope.toggleHeatmap();

    var getTopics = function (domore) {
        searching = true;
        asmeFactory.getTopics(topicsPageNum).then(function (res) {
            console.log('got asme topics', res);
            searching = false;
            if (domore) {
                $scope.topicsPretty += JSON.stringify(res, null, 2);
                res.data.topics.forEach(function (item) {
                    $scope.topics.push(item);
                })
            } else {
                $scope.topicsPretty = JSON.stringify(res, null, 2);
                $scope.topics = res.data.topics;
            }
            
            $scope.topicCategories = [...new Set($scope.topics.map(item => item.LinkCalloutText))];
            
        }).catch(function (e) {
            console.log('error getting asme topic', e);
        });
    };

    getTopics(false);

    var getProducts = function (domore) {
        searching = true;
        asmeFactory.getProducts(productsPageNum).then(function (res) {
            console.log('got asme products', res);
            if (domore) {
                $scope.productsPretty += JSON.stringify(res, null, 2);
                res.data.products.ProductList.forEach(function (item) {
                    $scope.products.push(item);
                })
            } else {
                $scope.productsPretty = JSON.stringify(res, null, 2);
                $scope.products = res.data.products.ProductList;
            }
        }).catch(function (e) {
            console.log('error getting asme products', e);
        })
    }
    getProducts(false);

    var getEvents = function () {
        asmeFactory.getEvents().then(function (res) {
            console.log('got asme events', res);
            $scope.eventsPretty = JSON.stringify(res, null, 2);
            $scope.events = res.data.events;
            vm.selectedEvent = $scope.events[0];
            createHeatmapData($scope.events.map(a => a.Coordinates));
        }).catch(function (e) {
            console.log('error getting asme events', e);
        })
    }
    getEvents();

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

    angular.element($window).bind("resize", function () {
        var iw = $window.innerWidth;
        if (iw < 767) {
            $scope.isMobile = true;
        } else {
            $scope.isMobile = false;
        }
        $scope.onMapLoaded()
        $scope.$apply();
    })

    $scope.getMore = function () {
        switch ($scope.showcard) {
            case 1:
                topicsPageNum++;
                getTopics(true);
                break;
            case 2:
                productsPageNum++;
                getProducts(true);
                break;
        }
    }

    $scope.toggleExpanded = function(e, item) {
        e.stopPropagation();
        item.expanded = !item.expanded;
    }

    $scope.goToUrl = function (url, includesDomain) {
        if (!includesDomain) {
            url = 'https://www.asme.org' + url;
        }
        if (url.indexOf('http') != 0) url = 'https://' + url;
        $window.open(url);
    }

    $scope.catSelectionChanged = function () {
        //if All was selected deselect all others
        if (this.topicCategoryFilter.indexOf('All') !== -1) {
            this.topicCategoryFilter = undefined;
            $(".md-select-menu-container").hide();
        }
    }
    

    $scope.filterTopic = function (val, type) {
        //filter by first selected categories
        if (!$scope.topics) return;
        var returnData = $scope.topics;

        if ((type) && type.length > 0) {
            returnData = returnData.filter(function (item) {
                return type.indexOf(item.LinkCalloutText) !== -1;
            });
        }

        //filter by user entered search string and look for it in Title and Description
        if (val) {
            returnData = returnData.filter(x => x.BigHeader.toLowerCase().indexOf(val.toLowerCase()) > -1
                || x.Copy.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }

        $scope.showing = returnData.length;
        formatChart(returnData);
        return returnData;
    };

    
    $scope.showDetail = function (e, item) {
        console.log(item)
        vm.selectedEvent = item;
        console.log(vm.selectedEvent)
        vm.map.showInfoWindow('map-iw', this);
    }
    $scope.goTo = function (i) {
        $scope.showcard = i;
        if (i == 3) initHeatmap();
    }

    $scope.scrollTo = function (el) {
        $(el).goTo();
    };

    $scope.myTopicChartObject = {};

    $scope.myTopicChartObject.type = "ColumnChart";

    $scope.myTopicChartObject.data = {
        "cols": [
            { id: "t", label: "Category", type: "string" },
            { id: "s", label: "Articles", type: "number" },
            { role: "style", type: "string" },
            { role: "annotation", type: "string" }
        ], "rows": []            
    };

    $scope.myTopicChartObject.options = {
        'title': '# of Articles By Category',
        "vAxis": {
            showTextEvery: 1,
            textStyle: { fontSize: 9 },
            gridlines: { color: 'transparent' }
        },
        "hAxis": {
            showTextEvery: 1,
            textStyle: { fontSize: 10 }
        },
        "legend": { position: "none" },
        'chartArea': { 'width': '100%', 'height': '80%'},
        'backgroundColor': '#fafafa',
        'animation': {
            'duration': 1000,
            'easing': 'out',
            'startup': true
        }
    };

    $scope.onMapLoaded = function () {
        NgMap.getMap({ id: 'big-map' }).then(function (map) {
            //console.log('got map', map);
            map.setCenter({ lat: 10, lng: 0 });
            map.getCenter();
        });
    }
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