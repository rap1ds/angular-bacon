/* **************** SERVICES *************************** */
var services = angular.module('myServices', []);

services.factory('colorService', ['$rootScope', '$http', '$timeout', function($rootScope, $http, $timeout) {

  var color = {
    r: 150,
    g: 150, 
    b: 150
  }

  var colorBus = new Bacon.Bus();
  var colorProperty = colorBus.toProperty(color);

  /** FRP **/
  function mapTodos(f) { 
    return function (todos) { 
      return _.map(todos, f); 
    }; 
  }

  function modifyColor(updatedColor) {
    return function (oldColor) {
      return updatedColor; 
    };
  }

  var userModifications = new Bacon.Bus();

  /*
  var userModificationsProperty = colorChanges.scan(color, function(color, modificationFn) {
    return modificationFn(color);
  });
  */

  var initialServerLoad = Bacon.fromPromise($http.get('/api/color')).map(".data");

  var serverStateBus = new Bacon.Bus();

  var serverSave = userModifications.debounce(500).flatMapLatest((function(init) {
    var oldValue = init;
    return function(val) {
      return Bacon.fromPromise($http.post('/api/color', val))
        .map(function() {
          oldValue = val;
          return val;
        })
        .mapError(function() {
          return oldValue;
        });
    }
  })(color));

  var mappedServerSave = serverSave.map(modifyColor);

  var serverChanges = initialServerLoad.map(modifyColor)
    .merge(serverSave.map(modifyColor));

  var identity = function(i) { return i };

  var serverInteraction = serverChanges.scan(color, function(x, modificationFn) {
    debugger
    return modificationFn(x)
  });

  var colorChanges = userModifications.map(modifyColor)
    .merge(serverInteraction.changes().map(modifyColor));

  var colorBusProperty = colorChanges.scan(color, function(color, modificationFn) {
    debugger;
    return modificationFn(color);
  });

  /** FRP **/

  // TODO Remove me
  var previousColor = [];
  colorProperty.onValue(function(val) {
    previousColor[0] = previousColor[1];
    previousColor[1] = val;
  })

  function setColor(newColor) {
    colorBus.push(newColor); // Change the color immediately to make the UI super responsive

    $http.post('/api/color', newColor)
      .success(function(response) {
        // Ok
      })
      .error(function() {
        // Change the color back
        colorBus.push(previousColor[0]);
      });
  }

  return {
    userModifications: userModifications,
    setColor: setColor,
    getColor: colorBusProperty
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
  colorService.getColor.onValue(function(val) {
    $scope.r = val.r;
    $scope.g = val.g;
    $scope.b = val.b;
  });

  var userChanges = new Bacon.Bus();
  colorService.userModifications.plug(userChanges);

  function changeColor(color, newValue) {
    var numValue = Number(newValue);
    var newColor = {
      r: color === "red" ? numValue : $scope.r,
      g: color === "green" ? numValue : $scope.g,
      b: color === "blue" ? numValue : $scope.b
    };

    userChanges.push(newColor);
  }

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
  var userChanges = new Bacon.Bus();
  colorService.userModifications.plug(userChanges);

  $scope.makeItGrayscale = function() {
    var avg = Math.round(($scope.r + $scope.g + $scope.b) / 3);
    userChanges.push({r: avg, g: avg, b: avg});
  }

  function updateIsItGrayscale() {
    var yesItIs = ($scope.r === $scope.g) &&  ($scope.g === $scope.b);
    $scope.isItGrayscale = yesItIs ? "Yes it is!" : "No";
  }

  colorService.getColor.onValue(function(val) {
    $scope.r = val.r;
    $scope.g = val.g;
    $scope.b = val.b;
    updateIsItGrayscale();
  });
};

GrayScalerCtrl.$inject = ['$scope', 'colorService'];

/* **************** BOOTSTRAPPING *************************** */

angular.module('angularBacon', ['myServices', 'myDirectives']);