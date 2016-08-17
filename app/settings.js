/*global define*/
define({
  appName: 'Identify3D Admin App',
  defaultRoutePath: '/',
  version: "0.1.0",
  debug: true,
  apiEndpoint: 'http://demo1.identify3d.net:3000/',
  apiFunctions: {
    login: {uri: "api/login" },
    ping: {uri: "api/ping" },
    stats: {uri: "api/dash" },
    orders: {uri: "api/job" },
    devices: {uri: "api/devices" },
    distributors: {uri: "api/distributors" },
    distributorRgistration: {uri: "api/registration" },
  }
});
