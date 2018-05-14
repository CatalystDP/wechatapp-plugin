const testUtil = require('util/test-util');
Page({
    data:{
        text:'in packageA pageA2'
    },
    onLoad(){
        testUtil.f(this.data.text);
    }
});