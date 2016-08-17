/*global define*/
'use strict';

define([], function () {

  function DistributorsController($scope, $stateParams, $state, $modal, $aside, $q, $http, Identify3D, distributorsData){

    var self = this;

    self.dummyPromise = null;

    self.keyword = $stateParams.keyword;
    self.createdAfter_jsdate = $stateParams.createdAfter ? new Date(parseInt($stateParams.createdAfter)) : null;
    self.createdBefore_jsdate = $stateParams.createdBefore ? new Date(parseInt($stateParams.createdBefore)) : null;

    console.log("prayers:", distributorsData);

    self.orders = distributorsData.entries;

    self.noneFound = self.orders.length === 0;

    // self.prescriptionStatus = $stateParams.prescriptionStatus;

    self.totalFound = 1 //,distributorsData.total_items || 0;

    self.pager = {
      totalItems: distributorsData.total_pages * distributorsData.max_items_per_page,
      itemPerPage: distributorsData.max_items_per_page,
      currentPage: $stateParams.pageNum,
      maxSize: 100
    };

    self.navigateToPage = function(){

      var blockingUI = $q.defer();
      self.myPromise = blockingUI.promise;



     $state.go(".", {pageNum: self.pager.currentPage}, {reload: false});
    }


    self.filterBy = function() {

      self.noneFound = false;
      self.orders = null;

      var blockingUI = $q.defer();
      self.myPromise = blockingUI.promise;

      console.log(self.prescriptionStatus);
      $state.go(".", {pageNum: 1, keyword: "", createdAfter:0, createdBefore:0, prescriptionStatus: self.prescriptionStatus}, {reload: false});
    }

    // self.searchPrayers = function(){
    //
    //   var createdAfter = self.createdAfter_jsdate ? self.createdAfter_jsdate.getTime() : null;
    //   var createdBefore = self.createdBefore_jsdate ? self.createdBefore_jsdate.getTime() : null;
    //
    //   $state.go(".", {pageNum: 1, keyword: self.keyword, createdAfter: createdAfter, createdBefore: createdBefore}, {reload: true});
    // }
    //
    // self.resetSearchPrayers = function(){
    //   $state.go(".", {pageNum: 1, keyword: "", createdAfter:0, createdBefore:0}, {reload: false});
    // }

    self.syncPrayerStatus = function(prayer){

      console.log(prayer);

      Identify3D.changePrayerStatus(prayer.unique_id, prayer.prayer_status);

    }

    self.openAfterCal = function($event) {
     $event.preventDefault();
     $event.stopPropagation();

     self.isAfterCalOpen = true;
    };


    self.openBeforeCal = function($event) {
     $event.preventDefault();
     $event.stopPropagation();

     self.isBeforeCalOpen = true;
    };
  }

  return {'DistributorsController': ['$scope', '$stateParams', '$state', '$modal', '$aside', '$q', '$http', 'Identify3DObject', 'distributorsData', DistributorsController]};
});
