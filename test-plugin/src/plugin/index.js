var data = require('./api/data.js')
var testUtil = require('util/test-util');
module.exports = {
  getData: data.getData,
  setData: data.setData
}
testUtil.f('in plugin entry');
PLUGIN_EXPORT = module.exports;//必须加上这一句才能使小程序导出插件接口