/*global define*/
'use strict';

define([], function () {

  function DistributorRegistrationController($q, $scope, $rootScope, $stateParams, $state, $modal, $aside, $modalInstance, Identify3D, confirmationDialogService){

    var self = this;

    self.distributor = {}; //angular.extend({}, distributorData);

    self.ok = function(e) {
      $modalInstance.close();
      e.stopPropagation();
    };

    self.cancel = function(e) {
    };

    self.register = function(Lform){

      if(Lform.$invalid) {

        confirmationDialogService('md', 'Marked (*) fields are required.', false, true)
        .result
        .then(function (userResponse) {
        }, function (userResponse) {
          //this should never happen i.e cancelButton=false
        });
        return;
      }

      var blockingUI = $q.defer();
      self.myPromise = blockingUI.promise;

      function unblockAndNavigateToParentWithReload(){
        blockingUI.resolve();
        $state.go("^", $stateParams, {reload: true});
      }

      Identify3D.doBureauRegisterDistributor(self.url)
      .then(function(user){

        unblockAndNavigateToParentWithReload();

      },function(locationMeta){

        confirmationDialogService('md', "Failed to add " + self.url, false, true)
        .result
        .then(function (userResponse) {
          blockingUI.reject();
        }, function (userResponse) {
          //this should never happen i.e cancelButton=false
        });

      });
    }

  }

  return {'DistributorRegistrationController': ['$q','$scope', '$rootScope', '$stateParams', '$state', '$modal', '$aside', '$modalInstance', 'Identify3DObject', 'confirmationDialogService', DistributorRegistrationController]};
});
