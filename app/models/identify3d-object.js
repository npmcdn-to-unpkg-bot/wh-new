/*global define*/
'use strict';

define(['angular', 'settings', 'lodash', 'jquery'], function (_angular, adminAppSettings, _, $) {

  function Identify3DSingleton($q, $rootScope, sessionStorageService, $http, FileUploader){

    var Identify3D = (function () {

      var hasSession = false;

      function Identify3D(adminAppSettings) {

        this.serverUri = adminAppSettings.apiEndpoint;

        console.log(this.serverUri)

        var hasSession = this.hasToken();

      };

      Identify3D.prototype.formEncode = function(obj) {
        var encodedString = '';
        for (var key in obj) {
          if (encodedString.length !== 0) {
            encodedString += '&';
          }

          encodedString += key + '=' + encodeURIComponent(obj[key]);
        }
        return encodedString.replace(/%20/g, '+');
      }

      Identify3D.prototype.logout = function(loginform) {

        var self = this;

        self.removeToken();
        self.hasSession = false;

        return true;
      }

      Identify3D.prototype.authToken = function(){
        return sessionStorageService.get("token");
      }

      Identify3D.prototype.removeToken = function(){
        sessionStorageService.unset("uid");
        sessionStorageService.unset("token");
        sessionStorageService.unset("user_obj");
        this.hasSession = true;
      }

      Identify3D.prototype.hasToken = function(){
        var token = sessionStorageService.get("token");
        return token && token.length > 0;
      }

      // Identify3D.prototype.getCurrentUser = function(clinicId){
      //
      //
      //   var deferred = $q.defer();
      //
      //   if(this.hasToken()) {
      //
      //     $http.get(this.serverUri + 'admin/user/me', {
      //       // withCredentials: false,
      //       params: {
      //         clinic_id: clinicId
      //       }
      //     }).success(function(data, status, headers, config, statusText){
      //
      //       if(data.success){
      //         deferred.resolve(data.user);
      //       } else {
      //         deferred.reject(data);
      //       }
      //
      //     }).error(function(data, status, headers, config, statusText){
      //     });
      //
      //   }
      //
      //   return deferred.promise;
      // }

      Identify3D.prototype.getUserReportDownloadUri = function(fileName){

      	var base = this.serverUri + "api/admin/userreport.xls";

        base = base + '?auth_token=' + sessionStorageService.get("token");

  			return base;
  		}


      Identify3D.prototype.doBureauLogin = function(loginform) {

        var fn = adminAppSettings.apiFunctions.login;

        var req = {
          method: 'POST',
          url: this.serverUri + fn.uri,
          data:  {
            "command" : "login",
            "user" : loginform.username,
            "pass" : loginform.password,
          },
          headers: {
            'Accept': 'application/json',
            // 'Authorization': 'Basic am9obkBqb2huLmNvbTpibGE=',
            // 'Access-Control-Request-Headers': 'X-Requested-With'
          },
          skiplogsOutUserOn401: true
        };


        var loginPromise = $http(req);

        var deferred = $q.defer();

        var self = this;

        loginPromise.success(function(data, status, headers, config, statusText){

          console.log(data);
          if(data.loggedIn){
            sessionStorageService.set("uid", data.sesson_token);
            sessionStorageService.set("token", data.sesson_token);
            sessionStorageService.set("user_obj", JSON.stringify(data.user));
            deferred.resolve(data);
          } else {
            deferred.reject(data);
          }

        }).error(function(data, status, headers, config, statusText){
          deferred.reject(data);
        });

        return deferred.promise;
      }


      Identify3D.prototype.doBureauRegister = function(form){

        var deferred = $q.defer();

        var fn = adminAppSettings.apiFunctions.login;

        var data = angular.extend({
          "command" : "register"
        }, form);

        // "firstName" : "Test",
        // "lastName" : "User",
        // "email" : "support@identify3d.com",
        // "company" : "Identify3D",
        // address : "4 Joost",
        // city : "San Francisco",
        // "state" : "CA",
        // "zip" : "94131"

        var req = {
          method: 'POST',
          url: this.serverUri + fn.uri,
          data:  data,
          headers: {
            'Accept': 'application/json',
          }
        };

        $http(req).success(function(data, status, headers, config, statusText){

          if(data.user){
            deferred.resolve(data);
          } else {
            deferred.reject(data);
          }

        }).error(function(data, status, headers, config, statusText){
          deferred.reject(data);
        });

        return deferred.promise;
      }

      // Identify3D.prototype.doBureauLogin = function(form){
      //
      //   var deferred = $q.defer();
      //
      //   var fn = adminAppSettings.apiFunctions.login;
      //
      //   var req = {
      //     method: 'POST',
      //     url: this.serverUri + fn.uri,
      //     data:  {
      //       "command" : "login",
      //       "user" : form.username,
      //       "pass" : form.password,
      //     },
      //     headers: {
      //       'Accept': 'application/json',
      //       // 'Authorization': 'Basic am9obkBqb2huLmNvbTpibGE=',
      //       // 'Access-Control-Request-Headers': 'X-Requested-With'
      //     }
      //   };
      //
      //   $http(req).success(function(data, status, headers, config, statusText){
      //
      //     if(data.user){
      //       deferred.resolve(data);
      //     } else {
      //       deferred.reject(data);
      //     }
      //
      //   }).error(function(data, status, headers, config, statusText){
      //     deferred.reject(data);
      //   });
      //
      //   return deferred.promise;
      // }


      Identify3D.prototype.getCurrentUser = function(){

        return JSON.parse(sessionStorageService.get("user_obj"));

        var fn = adminAppSettings.apiFunctions.login;

        var deferred = $q.defer();

        if(this.hasToken()) {

          var currentUserId = sessionStorageService.get("uid");

          $http.get(this.serverUri + fn.uri, {
            // withCredentials: false,
            params: {
              user_id: currentUserId
            }
          }).success(function(data, status, headers, config, statusText){

            if(data.success){
              deferred.resolve(data.user);
            } else {
              deferred.reject(data);
            }

          }).error(function(data, status, headers, config, statusText){
            deferred.reject(data);
          });

        }

        return deferred.promise;
      }

      Identify3D.prototype.get3DDevices = function(uiPage){

        var deferred = $q.defer();
        var serverPage = uiPage - 1;

        var fn = adminAppSettings.apiFunctions.devices;

        var req = {
          method: 'GET',
          url: this.serverUri + fn.uri,
          params: {
            // page: serverPage
          },
          headers: {
            'Accept': 'application/json',
            // 'Authorization': 'Basic am9obkBqb2huLmNvbTpibGE=',
            // 'Access-Control-Request-Headers': 'X-Requested-With'
          }
        };

        var serverUri = this.serverUri;

        $http(req).success(function(data, status, headers, config, statusText){
          if(data.entries){

            data.serverUri = serverUri;

            _.map(data.entries, function(device) {
              device.image = data.serverUri + device.image;
              return device;
            });

            deferred.resolve(data);
          } else {
            deferred.reject(data);
          }

        }).error(function(data, status, headers, config, statusText){
          deferred.reject(data);
        });

        return deferred.promise;
      }

      Identify3D.prototype.get3DDistributors = function(uiPage){

        var deferred = $q.defer();
        var serverPage = uiPage - 1;

        var fn = adminAppSettings.apiFunctions.distributors;

        var req = {
          method: 'GET',
          url: this.serverUri + fn.uri,
          params: {
            // page: serverPage
          },
          headers: {
            'Accept': 'application/json',
            // 'Authorization': 'Basic am9obkBqb2huLmNvbTpibGE=',
            // 'Access-Control-Request-Headers': 'X-Requested-With'
          }
        };

        var serverUri = this.serverUri;

        $http(req).success(function(data, status, headers, config, statusText){
          if(data.entries){

            // data.serverUri = serverUri;

            // _.map(data.entries, function(device) {
            //   device.image = data.serverUri + device.image;
            //   return device;
            // });

            deferred.resolve(data);
          } else {
            deferred.reject(data);
          }

        }).error(function(data, status, headers, config, statusText){
          deferred.reject(data);
        });

        return deferred.promise;
      }

      Identify3D.prototype.get3DDevice = function(uiPage, deviceID){

        var deferred = $q.defer();
        var serverPage = uiPage - 1;

        var fn = adminAppSettings.apiFunctions.devices;

        var req = {
          method: 'GET',
          url: this.serverUri + fn.uri + "/" + deviceID,
          params: {
            // page: serverPage
          },
          headers: {
            'Accept': 'application/json',
            // 'Authorization': 'Basic am9obkBqb2huLmNvbTpibGE=',
            // 'Access-Control-Request-Headers': 'X-Requested-With'
          }
        };

        $http(req).success(function(data, status, headers, config, statusText){
          if(status === 200){
            deferred.resolve(data);
          } else {
            deferred.reject(data);
          }

        }).error(function(data, status, headers, config, statusText){
          deferred.reject(data);
        });

        return deferred.promise;
      }


      Identify3D.prototype.get3DStats = function(uiPage){

        var deferred = $q.defer();
        var serverPage = uiPage - 1;

        var fn = adminAppSettings.apiFunctions.stats;

        var req = {
          method: 'GET',
          url: this.serverUri + fn.uri,
          params: {
            // page: serverPage
          },
          headers: {
            'Accept': 'application/json',
            // 'Authorization': 'Basic am9obkBqb2huLmNvbTpibGE=',
            // 'Access-Control-Request-Headers': 'X-Requested-With'
          }
        };

        $http(req).success(function(data, status, headers, config, statusText){

          if(data){
            deferred.resolve(data);
          } else {
            deferred.reject(data);
          }

        }).error(function(data, status, headers, config, statusText){
          deferred.reject(data);
        });

        return deferred.promise;
      }

      Identify3D.prototype.get3DOrders = function(uiPage){

        var deferred = $q.defer();
        var serverPage = uiPage - 1;

        var fn = adminAppSettings.apiFunctions.orders;

        var req = {
          method: 'GET',
          url: this.serverUri + fn.uri,
          params: {
            // page: serverPage
          },
          headers: {
            'Accept': 'application/json',
            // 'Authorization': 'Basic am9obkBqb2huLmNvbTpibGE=',
            // 'Access-Control-Request-Headers': 'X-Requested-With'
          }
        };

        var serverUri = this.serverUri;


        $http(req).success(function(data, status, headers, config, statusText){

          if(data.entries){

            data.serverUri = serverUri;

            _.map(data.entries, function(order) {
              order.imageUrl = data.serverUri + order.imageUrl.substr(1);
              return order;
            });

            deferred.resolve(data);
          } else {
            deferred.reject(data);
          }

        }).error(function(data, status, headers, config, statusText){
          deferred.reject(data);
        });

        return deferred.promise;
      }

      Identify3D.prototype.doBureauJobEndpoint = function(data){

        var deferred = $q.defer();

        var fn = adminAppSettings.apiFunctions.orders;

        var req = {
          method: 'POST',
          url: this.serverUri + fn.uri,
          data:  data,
          headers: {
            'Accept': 'application/json',
          }
        };

        console.log('req', req);

        $http(req).success(function(data, status, headers, config, statusText){

          if(status === 200){
            deferred.resolve(data);
          } else {
            deferred.reject(data);
          }

        }).error(function(data, status, headers, config, statusText){
          deferred.reject(data);
        });

        return deferred.promise;
      }

      Identify3D.prototype.doBureauArchiveJob = function(designId){
        return this.doBureauJobEndpoint({
          command: 'archive',
          designId: designId
        })
      }

      Identify3D.prototype.doBureauCancelJob = function(designId){
        return this.doBureauJobEndpoint({
          command: 'cancel',
          designId: designId
        })
      }

      Identify3D.prototype.doBureauSaveJob = function(designId, deviceId, deviceUrl, data){
        return this.doBureauJobEndpoint(angular.extend({
          command: 'save',
          designId: designId,
          printer: {
            deviceId: deviceId,
            url: deviceUrl
          }
        }, data))
      }

      Identify3D.prototype.doBureauSubmitJob = function(designId, deviceId, deviceUrl, data){
        return this.doBureauJobEndpoint(angular.extend({
          command: 'submit',
          designId: designId,
          printer: {
            deviceId: deviceId,
            url: deviceUrl
          }
        }, data));
      }

      Identify3D.prototype.doBureauSubmitJobToVendor = function(designId, distributorId, distributorName, distributorUrl, data){
        return this.doBureauJobEndpoint(angular.extend({
          command: 'submit',
          designId: designId,
          distributor: {
            distributorId: distributorId,
            name: distributorName,
            url: distributorUrl
          }
        }, data));
      }

      Identify3D.prototype.doBureauSaveJobToVendor = function(designId, distributorId, distributorName, distributorUrl, data){
        return this.doBureauJobEndpoint(angular.extend({
          command: 'save',
          designId: designId,
          distributor: {
            distributorId: distributorId,
            name: distributorName,
            url: distributorUrl
          }
        }, data))
      }


      Identify3D.prototype.get3DOrderForm = function(designId){

        var deferred = $q.defer();

        var fn = adminAppSettings.apiFunctions.orders;

        var req = {
          method: 'GET',
          url: this.serverUri + fn.uri + '/' + designId,
          params: {
            // page: serverPage
          },
          headers: {
            'Accept': 'application/json',
            // 'Authorization': 'Basic am9obkBqb2huLmNvbTpibGE=',
            // 'Access-Control-Request-Headers': 'X-Requested-With'
          }
        };

        $http(req).success(function(data, status, headers, config, statusText){

          if(data.DesignRules){
            deferred.resolve(data);
          } else {
            deferred.reject(data);
          }

        }).error(function(data, status, headers, config, statusText){
          deferred.reject(data);
        });

        return deferred.promise;
      }

      Identify3D.prototype.doBureauRegisterDistributor = function(url){

        var deferred = $q.defer();

        var fn = adminAppSettings.apiFunctions.distributorRgistration;

        var data = {
          "command" : "register",
          "url" : url
        };

        var req = {
          method: 'POST',
          url: this.serverUri + fn.uri,
          data:  data,
          headers: {
            'Accept': 'application/json',
          }
        };

        $http(req).success(function(data, status, headers, config, statusText){

          if(status === 200){
            deferred.resolve(data);
          } else {
            deferred.reject(data);
          }

        }).error(function(data, status, headers, config, statusText){
          deferred.reject(data);
        });

        return deferred.promise;
      }


      function getFormData (object) {

        var fd = new FormData();

        for (var p in object) { // eslint-disable-line
           if (Object.prototype.hasOwnProperty.call(object, p)) {
             fd.append(p, object[p]);
           }
         }

         return fd;
      }

      function formEncode(obj) {
        var encodedString = '';
        for (var key in obj) {
          if (encodedString.length !== 0) {
            encodedString += '&';
          }

          encodedString += key + '=' + encodeURIComponent(obj[key]);
        }
        return encodedString.replace(/%20/g, '+');
      }

      return Identify3D;

    })();

    // singleton
    return new Identify3D(adminAppSettings);
  }

  // This return value is cached in the internal registry of RequireJS.
  return {'Identify3DObject': ['$q', '$rootScope', 'sessionStorageService', '$http', 'FileUploader', Identify3DSingleton]};
});
