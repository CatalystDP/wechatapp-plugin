const BaseDevModule = require('./BaseDevModule');
const path = require('path');
const _ = require('lodash');
const fs = require('fs-extra');
const glob = require('glob');

class PluginDevModule extends BaseDevModule{
    constructor(...args){
        super(...args);
        this.attachPoint(); 
    }
    attachPoint(){
        super.attachPoint();
    }
}
module.exports = PluginDevModule;