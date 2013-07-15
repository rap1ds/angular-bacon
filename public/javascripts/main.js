/* **************** SERVICES *************************** */
var services = angular.module('myServices', []);

services.factory('colorService', ['$rootScope', '$http', '$timeout', function($rootScope, $http, $timeout) {

  var color = {
    r: 150,
    g: 150, 
    b: 150
  }

  function load() {
    $http.get('/api/color')
      .success(function(response) {
        color = response;
      });
  }

  function getColor() {
    return color;
  }

  function setColor(newColor) {
    var oldColor = angular.copy(color);
    color = newColor; // Change the color immediately to make the UI super responsive
    $http.post('/api/color', newColor)
      .success(function(response) {
        // Ok
      })
      .error(function() {
        // Change the color back
        color = oldColor;
      });
  }

  // Load immediately
  load();

  return {
    setColor: setColor,
    getColor: getColor
  };
}]);

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

      scope.$watch('red', function(val) {
        updateColor(scope.red, scope.green, scope.blue);
      });
      scope.$watch('green', function(val) {
        updateColor(scope.red, scope.green, scope.blue);
      });
      scope.$watch('blue', function(val) {
        updateColor(scope.red, scope.green, scope.blue);
      });
    }
  } 
});

/* **************** CONTROLLERS *************************** */

function ColorPickerCtrl ($scope, colorService) {
  $scope.colorService = colorService;

  function changeColor(color, newValue) {
    var numValue = Number(newValue);
    var oldColor = colorService.getColor();
    var newColor = {
      r: color === "red" ? numValue : oldColor.r,
      g: color === "green" ? numValue : oldColor.g,
      b: color === "blue" ? numValue : oldColor.b
    };

    colorService.setColor(newColor);
  }

  $scope.$watch('colorService.getColor().r', function(val) { $scope.r = val; });
  $scope.$watch('colorService.getColor().g', function(val) { $scope.g = val; });
  $scope.$watch('colorService.getColor().b', function(val) { $scope.b = val; });

  $scope.changeRed = function(val) {
    changeColor("red", $scope.r);
  }
  $scope.changeGreen = function(val) {
    changeColor("green", $scope.g);
  }
  $scope.changeBlue = function(val) {
    changeColor("blue", $scope.b);
  }
};

ColorPickerCtrl.$inject = ['$scope', 'colorService'];

function GrayScalerCtrl($scope, colorService) {
  $scope.colorService = colorService;

  $scope.makeItGrayscale = function() {
    var color = colorService.getColor();
    var avg = Math.round((color.r + color.g + color.b) / 3);
    colorService.setColor({r: avg, g: avg, b: avg});
  }

  function updateIsItGrayscale() {
    var color = colorService.getColor();
    var yesItIs = (color.r === color.g) && (color.g === color.b);
    $scope.isItGrayscale = yesItIs ? "Yes it is!" : "No";
  }

  $scope.$watch('colorService.getColor().r', function(r) {
    updateIsItGrayscale();
  });
  $scope.$watch('colorService.getColor().g', function(r) {
    updateIsItGrayscale();
  });
  $scope.$watch('colorService.getColor().b', function(r) {
    updateIsItGrayscale();
  });
};

GrayScalerCtrl.$inject = ['$scope', 'colorService'];

/* **************** BOOTSTRAPPING *************************** */

angular.module('angularBacon', ['myServices', 'myDirectives']);