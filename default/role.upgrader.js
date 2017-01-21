var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function (creep)
    {
        /** Define a working state **/
        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
        }

        if(!creep.memory.working && creep.carry.energy == creep.carry.carryCapacity) {
            creep.memory.working = true;
        }

        if( !creep.memory.working ) {

            /** Gets all sources from ROOM and creates a set for distances **/
            var sources = creep.room.find(FIND_SOURCES);
            var distance = [];

            /** Calculate all the distances **/
            for(var x in sources) {
                var target = sources[x];
                var range = creep.pos.getRangeTo(target);
                distance[x] = range;
            }

            /** Identify the quickest source available **/
            var shortest_distance = Array.min(distance);
            for(var x in sources) {
                var target = sources[x];
                var range = creep.pos.getRangeTo(target);
                if(range == shortest_distance) {

                    /** Moving and harvesting code **/
                    if(creep.harvest(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }

                }

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