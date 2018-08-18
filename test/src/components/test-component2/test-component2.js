const testUtil = require('util/test-util');
const liba = require('../components-libs/liba');
Component({
    properties: {
      // 这里定义了innerText属性，属性值可以在组件使用时指定
      innerText: {
        type: String,
        value: 'default value in component2',
      }
    },
    data: {
      // 这里是一些组件内部数据
      someData: {}
    },
    ready(){
      testUtil.f('test-component2');
      testLib.print();
    },
    methods: {
      // 这里是一个自定义方法
      customMethod: function(){}
    }
  })