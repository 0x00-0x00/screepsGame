var roleTransporter = {
    run: function (creep) {

        var spawnPoint = Game.spawns['Spawn1'];

        /** Define a working state **/
        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
        }

        if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        /** If not full **/
        if( !creep.memory.working ) {

            /** Gets all sources from ROOM and creates a set for distances **/
            var sources = creep.room.find(FIND_DROPPED_ENERGY);
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
                    if(creep.pickup(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }

                }

            }


        } else {
            /** If full **/
            if(creep.transfer(spawnPoint, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(spawnPoint);
            }
        }

    }
}

module.exports = roleTransporter;