
/** @param {Array} array **/
Array.min = function( array )
{
    return Math.min.apply(Math, array);
}

/** @param {Creep} {Sources} **/
var quickestRoute(creep, sources)
{
    let distances = [];
    for(var i in sources) {
        let target = sources[i];
        let distance = creep.pos.getRangeTo(target);
        distances[i] = distance;
    }

    let quickest = Array.min(distances);
    for(var i in sources) {
        var target = sources[i];
        let distance = creep.pos.getRangeTo(target);
        if(distance == quickest) {
            return target;
        }
    }


}

/** @param {Structure} structure**/
var checkRepair(struct)
{
    if(struct.hits < struct.hitsMax / 2) {
        return true;
    } else {
        return false;
    }
}

/** @param {Creep} creep **/
var repairProcedure(creep) {
    var repairs = creep.room.find(FIND_MY_STRUCTURES);
    for(var i in repairs) {
        var target = repairs[i];
        if(checkRepair) {
            if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
    }
}

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function (creep)
    {
        /** Define a working state **/
        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
        }

        if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if(!creep.memory.working) {
            /** Gather energy **/
            var sources = creep.room.find(FIND_DROPPED_ENERGY);
            if(sources.length < 1) {
                console.log("[!] Not enough energy dropped for builders to work upon.");
            }
            var target = quickestRoute(creep, sources);
            if(creep.pickup(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }

        } else {

            /** Work **/
            repairProcedure(creep);


        }

    },
}

module.exports = roleBuilder;