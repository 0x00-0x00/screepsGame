/** @param {Source} active sources**/
var quickestRoute = function(creep, sources)
{
    /** If only one source, go to it. **/
    let num_sources = sources.length;
    if(num_sources == 1) {
        return sources[0];
    }

    /** Check distances **/
    var distance_1 = creep.pos.getRangeTo(sources[0]);
    var distance_2 = creep.pos.getRangeTo(sources[1]);

    /** Check energy amount of sources **/
    var full_source_01 = sources[0].energy < sources[0].energyCapacity;
    var full_source_02 = sources[1].energy < sources[1].energyCapacity;

    /** This ensures all sources are going to be harvested! **/
    if(full_source_01 && !full_source_02) {
        return sources[1];
    }

    /** Choose another energy source to balance consumption of energy resources **/
    if(sources[1].energy > sources[0].energy && distance_1 != 1) {
        return sources[1];
    }


    if(distance_1 < distance_2) {
        return sources[0];
    } else {
        return sources[1];
    }
}


var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function (creep)
    {

        /** carryCapacity => Units able to move by the Creep **/

        /** Define a working state **/
        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
        }

        if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if( !creep.memory.working ) {


            /** Gets all sources from ROOM **/
            var sources = creep.room.find(FIND_SOURCES_ACTIVE);
            var target = quickestRoute(creep, sources);

            /** Moving and harvesting code **/
            if(creep.harvest(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);

            }

        } else {
            var target = creep.room.controller;
            if(creep.upgradeController(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }

        }
    }

}

module.exports = roleUpgrader;