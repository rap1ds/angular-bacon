/* **************** SERVICES *************************** */
var services = angular.module('myServices', []);

services.factory('colorService', function() {

  var color = {
    r: 150,
    g: 150, 
    b: 150
  }

  return color;
});

/* **************** DIRECTIVES *************************** */

var directives = angular.module('myDirectives', []);

directives.directive('colorpreview', function() {
  return {
    restrict: 'E',
    scope: {
      red: '@',
      green: '@',
      blue: '@'
    },

    link: function(scope, element, attrs) {

      function updateColor(r, g, b) {
        var val = 'rgb(' + [r, g, b].join(',') + ')';
        element.css('backgroundColor', val);
      }

      scope.$watch('red || green || blue', function(val) {
        updateColor(scope.red, scope.green, scope.blue);
      });
    }
  } 
});

/* **************** CONTROLLERS *************************** */

function ColorPickerCtrl ($scope, colorService) {
  $scope.colorService = colorService;
};

ColorPickerCtrl.$inject = ['$scope', 'colorService'];

function GrayScalerCtrl($scope, colorService) {
  $scope.colorService = colorService;

  $scope.makeItGrayscale = function() {
    var avg = Math.round((colorService.r + colorService.g + colorService.b) / 3);
    colorService.r = avg;
    colorService.g = avg;
    colorService.b = avg;
  }

  $scope.$watch('colorService.r || colorService.g || colorService.b', function(r) {
    var yesItIs = (colorService.r === colorService.g) && (colorService.g === colorService.b);
    $scope.isItGrayscale = yesItIs ? "Yes it is!" : "No";
  });
};

GrayScalerCtrl.$inject = ['$scope', 'colorService'];

/* **************** BOOTSTRAPPING *************************** */

angular.module('angularBacon', ['myServices', 'myDirectives']);