const testUtil = require('util/test-util');
Page({
    data:{
        text:'in packageB pageB1'
    },
    onLoad(){
        testUtil.f(this.data.text);
    }
});