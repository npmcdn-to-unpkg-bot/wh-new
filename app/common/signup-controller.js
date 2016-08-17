/*global define*/
'use strict';

define([], function () {

  function SignUpController($scope, $stateParams, $state, $modal, $aside, $q, $http, Identify3D){

    var self = this;

    self.dummyPromise = null;

    self.loginForm = {};

    self.loginError = null;

    self.login = function (form){

      self.loginError = null;

      if(!form.$invalid) {

        Identify3D.doBureauRegister(self.loginForm).then(function (m) {

          Identify3D.doBureauLogin({username: self.loginForm.user, password: self.loginForm.pass}).then(function (m) {

            $state.go("identify3D.statistics", {}, { reload:true, location:'replace' });

          }, function (m) {
   					 //  self.loginError = m.error;
              self.loginError = "Failed to create a session.";
   			  });


        }, function (m) {
 					 //  self.loginError = m.error;
            self.loginError = "Failed to create new user. Try with a different username.";
 			  });

      } else {
        self.loginError = "Please fill in all required fields.";

      }

    }

  }

  return {'SignUpController': ['$scope', '$stateParams', '$state', '$modal', '$aside', '$q', '$http', 'Identify3DObject', SignUpController]};
});
