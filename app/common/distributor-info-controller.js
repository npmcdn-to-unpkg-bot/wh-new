/*global define*/
'use strict';

define([], function () {

  function DistributorInfoController($q, $scope, $rootScope, $stateParams, $state, $modal, $aside, $modalInstance, Identify3D, distributorData, confirmationDialogService){

    var self = this;

    self.distributor = angular.extend({}, distributorData);

    self.ok = function(e) {
      $modalInstance.close();
      e.stopPropagation();
    };

    self.cancel = function(e) {
    };

    self.saveInspiration = function(Lform){

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

      Identify3D.fillPrescription(self.filledPrescription)
      .then(function(user){

        unblockAndNavigateToParentWithReload();

      },function(locationMeta){

        confirmationDialogService('md', locationMeta.error, false, true)
        .result
        .then(function (userResponse) {
          blockingUI.reject();
        }, function (userResponse) {
          //this should never happen i.e cancelButton=false
        });

      });
    }

  }

  return {'DistributorInfoController': ['$q','$scope', '$rootScope', '$stateParams', '$state', '$modal', '$aside', '$modalInstance', 'Identify3DObject', 'distributorData', 'confirmationDialogService', DistributorInfoController]};
});
