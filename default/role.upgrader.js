/** @param creep Object
 *  @param sources  Object list **/
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
};

let retrieveEnergyFromContainer = function(creep) {
    let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE) && s.store[RESOURCE_ENERGY] > 0
    });

    /** If there arent containers or are empty  **/
    if(container == null) {
        console.log("Upgrader error: There are no energy containers available.");
        return false;
    }


    if(creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(container);
    }

    return true;

};



let roleUpgrader = {

    parts: [WORK, WORK, WORK, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY],

    getEnergy: function() {

        /** Priority 1: Container storage because it is free. **/
        retrieveEnergyFromContainer(this.creep);

        /** Priority 2: Dropped energy because it decay **/
        let droppedEnergy = this.creep.room.find(FIND_DROPPED_ENERGY);
        if(droppedEnergy.length > 0) {
            let nearest = this.creep.pos.findClosestByPath(droppedEnergy);
            if(this.creep.pickup(nearest) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(nearest);
            }
            return true;
        }


        /** Priority 3: Energy sources **/
        let energySources = this.creep.room.find(FIND_SOURCES_ACTIVE);
        let nearest = this.creep.pos.findClosestByPath(energySources);
        if(this.creep.harvest(nearest) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(nearest);
        }


    },

    /** @param creep **/
    run: function (creep)
    {

        /** carryCapacity => Units able to move by the Creep **/
        this.creep = creep;
        /** Define a working state **/
        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
        }

        if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if( !creep.memory.working ) {
            this.getEnergy();
        } else {
            var target = creep.room.controller;
            if(creep.upgradeController(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
    }

}

module.exports = roleUpgrader;