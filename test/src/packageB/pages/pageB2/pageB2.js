const testUtil = require('util/test-util');
Page({
    data:{
        text:'in packageB pageB2'
    },
    onLoad(){
        testUtil.f(this.data.text);
    }
});