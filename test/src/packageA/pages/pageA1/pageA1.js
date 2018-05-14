const testUtil = require('util/test-util');
Page({
    data:{
        text:'in packageA pageA1'
    },
    onLoad(){
        testUtil.f(this.data.text);
    }
});