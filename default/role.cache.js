let roleCache = {

    reusePathValue: 50,

    storeObjects: function(objVar) {
        let cacheVar = [];
        for(let _ in objVar) {
            let object = objVar[_];
            if(object == null) {
                continue;
            }
            cacheVar.push(object.id);
        }
        return cacheVar;
    },

    retrieveObjects: function(cacheVar) {
        let objVar = [];
        for(let _ in cacheVar) {
            let object = Game.getObjectById(cacheVar[_]);
            if(object == null) {
                continue;
            }
            objVar.push(object);
        }
        return objVar;
    }

};

module.exports = roleCache;