(function(window){
    function Promise(excute){
        var _that = this;
        this.status = "pending";
        this.data = undefined;
        this.callback = [];
        if(this.status == "pending"){
            function resolve(value){
                _that.status = "resolved";
                _that.data = value;
                if(_that.callback.length>0){
                    setTimeout(function(){
                        _that.callback.forEach(function(item){
                            item.onResolve(_that.data);
                        })
                    },0)
                }
            }
        }
        if(this.status == "pending"){
            function reject(reason){
                _that.status = "rejected";
                _that.data = reason;
                if(_that.callback.length>0){
                    setTimeout(function(){
                        _that.callback.forEach(function(item){
                            item.onReject(this.data);
                        })
                    })
                }
            }
        }
        excute(resolve,reject);
    }
    Promise.prototype.then = function(onResolve,onReject){
        var _that = this;
        return new Promise(function(resolve,reject){
            function handle(callback){
                try{
                    var data = callback(_that.data);
                    //返回是否为promise对象
                    if(data instanceof Promise){
                        data.then(function(value){
                            resolve(value)
                        },function(reason){
                            reject(reason)
                        })
                    }else{
                        resolve(data);
                    }
                }
                catch(error){
                    reject(error)
                }
            }
            if(_that.status == "pending"){
                _that.callback.push({
                    "onResolve":function(value){
                        handle(onResolve)
                    },
                    "onReject":function(reason){
                        handle(onReject);
                    }
                })
            }
            if(_that.status == "resolved"){
                setTimeout(function(){
                    handle(onResolve)
                })
            }
            if(_that.status == "rejected"){
                setTimeout(function(){
                    handle(onReject);
                })
            }
        })
    }
    Promise.prototype.catch = function(onRejected){
        return this.then(null,onRejected)
    }
    Promise.resolve = function(value){
        return new Promise(function(resolve,reject){
            if(value instanceof Promise){
                value.then(resolve,reject)
            }else{
                resolve(value)
            }
        })
    }
    Promise.reject = function(reason){
        return new Promise(function(resolve,reject){
            reject(reason)
        })
    }
    Promise.all = function(res){
        var values = [];
        var idx = 0;
        return new Promise(function(resolve,reject){
            res.forEach(function(item,index){
                item.then(function(value){
                    idx++;
                    values[index] = value;
                    if(idx==res.length){
                        resolve(values)
                    }  
                },function(reason){
                    reject(reason)
                })
            })
        })
    }
    Promise.race = function(res){
        return new Promise(function(resolve,reject){
            res.forEach(function(item){
                item.then(function(value){
                    resolve(value)
                },function(reason){
                    reject(reason)
                })
            })
        })   
    }
    window.Promise = Promise;
})(window)