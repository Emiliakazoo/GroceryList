
var app = angular.module('groceryListApp', ['ngRoute']);

app.config(function($routeProvider,$locationProvider){
	 $locationProvider.hashPrefix('');
	$routeProvider

	.when("/", {
		templateUrl: "views/groceryList.html",
		controller:  "HomeController"
	})
	.when("/addItem", {
		templateUrl: "views/inputForm.html",
		controller:  "GroceryListItemController"
	})
	.when("/additem/edit/:id", {
		templateUrl: "views/inputForm.html",
		controller:  "GroceryListItemController"
	})
	.otherwise({redirectTo: "/"});
	
// $locationProvider.html5Mode(true);

});

app.service("GroceryService", function($http){

    var groceryService = {};

    groceryService.groceryItems = [];


    $http({
        method: 'GET',
        url: 'data/server_data.json'
    }).then(function successCallback(response) {
        // this callback will be called asynchronously
        // when the response is available
        console.log(response);
        groceryService.groceryItems = response.data;

        for(var item in groceryService.groceryItems){
            groceryService.groceryItems[item].date = new Date(groceryService.groceryItems[item].date);
        }
    }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
        alert("Things went wrong!!");
    });

 
    groceryService.findById = function(id){
        for(var item in groceryService.groceryItems){
            if(groceryService.groceryItems[item].id === id) {
                console.log(groceryService.groceryItems[item]);
                return groceryService.groceryItems[item];
            }
        }
    };

    groceryService.getNewId = function(){

        if(groceryService.newId){
            groceryService.newId++;
            return groceryService.newId;
        }else{
            var maxId = _.max(groceryService.groceryItems, function(entry){ return entry.id;})
            groceryService.newId = maxId.id + 1;
            return groceryService.newId;
        }
    };

    groceryService.removeItem = function(entry){
    	var index = groceryService.groceryItems.indexOf(entry);
    	groceryService.groceryItems.splice(index, 1);
    };

    groceryService.markCompleted = function(entry){
    	entry.completed = !entry.completed;
    }

    groceryService.save = function(entry) {

        var updatedItem = groceryService.findById(entry.id);

        if(updatedItem){
            
            updatedItem.completed = entry.completed;
            updatedItem.itemName = entry.itemName;
            updatedItem.date = entry.date;

        }else {

            // $http.post("data/added_item.json", entry)
            //     .success(function(data){
            //         entry.id = data.newId;
            //     })
            //     .error(function(data, status){

            //     });


            $http({
                method: 'post',
                url: 'data/added_item.json',
            }).then(function successCallback(response) {
                entry.id = response.data.newId; 
                console.log(entry.id);
            }, function errorCallback(response, status) {

            });

            console.log(entry);


            groceryService.groceryItems.push(entry);
        }

    };

    return groceryService;

});

app.controller("HomeController", ["$scope", "GroceryService", function($scope, GroceryService) {

    $scope.groceryItems = GroceryService.groceryItems;

    $scope.removeItem = function(entry) {
    	GroceryService.removeItem(entry);
    };

    $scope.markCompleted = function(entry) {
    	GroceryService.markCompleted(entry);
    }

    $scope.$watch( function(){ return GroceryService.groceryItems; }, function(groceryItems) {
        $scope.groceryItems = groceryItems;
    })

}]);

app.controller("GroceryListItemController", ["$scope", "$routeParams", "$location", "GroceryService", function($scope, $routeParams, $location, GroceryService){

    if(!$routeParams.id) {
        $scope.groceryItem = {id: "", completed: false, itemName: "", date: new Date()};
    }else{
        $scope.groceryItem = _.clone(GroceryService.findById(parseInt($routeParams.id)));
    }

    $scope.save = function(){
        GroceryService.save( $scope.groceryItem );
        $location.path("/");
    };

}]);

app.directive("eaGroceryItem", function(){
	return {
		restrict: "E",
		templateUrl: "js/templates/groceryItem.html"
	};
});
