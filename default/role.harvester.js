var cache = require('role.cache');
var lo = require('lodash');
/**
 * Created by shemhazai on 1/21/17.
 */


Array.min = function ( array ) {
    return Math.min.apply(Math, array );
};

Array.max = function( array ) {
    return Math.max.apply(Math, array);
};

let depositEnergy = function(creep)
{

    let structs = creep.room.find(FIND_MY_STRUCTURES, {
        filter: (s) => s.energy < s.energyCapacity
    });

    if(structs.length == 0) {
        creep.memory.full_energy = 1;
        return false;
    } else {
        creep.memory.full_energy = 0;
    }

    for(let x in structs) {
        let structure = structs[x];
        if(structure.energyCapacity > structure.energy) {
            if(creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(structure, {reusePath: cache.reusePathValue});
            }
            return true;
        }
    }
};

let retrieveEnergyFromContainer = function(creep) {
    let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE) && s.store[RESOURCE_ENERGY] > 0
    });

    /** If there arent containers or are empty  **/
    if(container == null) {
        //console.log("Harvester error: There are no energy containers available.");
        return false;
    }


    if(creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(container);
    }

    return true;

};

/** Function to deposit energy into empty extensions
 * Returns true if going to or transferred energy
 * Returns false if all are full
 * @param creep Object
 * **/
let depositIntoExtension = function(creep) {
  let extensions = creep.room.find(FIND_MY_STRUCTURES, {
      filter: { structureType: STRUCTURE_EXTENSION }
    });

  for(let i in extensions) {
      let extension = extensions[i];
      if(extension.energy < extension.energyCapacity) {
          if(creep.transfer(extesion, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
              creep.moveTo(extension);
          }
          return true;
      }
  }
  return false;
};

let buildConstructions = function(creep, totalEnergy, minimumCost) {
    let constructs = creep.room.find(FIND_CONSTRUCTION_SITES);

    if(constructs.length > 0 && (totalEnergy > minimumCost)) {
        let target = creep.pos.findClosestByPath(constructs);
        if(creep.build(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {reusePath: 15});
        } else {
            creep.say("Building");
        }
        return true;

    } else {
        return false;
    }

};

/**  Quickest route or cycle through energy sources *
 * @param creep
 * @param sources
 */
let quickestRoute = function (creep, sources) {
    /** If only one source, go to it. **/
    let num_sources = sources.length;
    if (num_sources == 1) {
        return sources[0];
    }

    /** Check distances **/
    let distance_1 = creep.pos.getRangeTo(sources[0]);
    let distance_2 = creep.pos.getRangeTo(sources[1]);

    /** Check energy amount of sources **/
    let full_source_01 = sources[0].energy < sources[0].energyCapacity;
    let full_source_02 = sources[1].energy < sources[1].energyCapacity;

    /** This ensures all sources are going to be harvested! **/
    if (full_source_01 && !full_source_02) {
        return sources[1];
    }

    /** Choose another energy source to balance consumption of energy resources **/
    if (sources[1].energy > sources[0].energy && distance_1 != 1) {
        return sources[1];
    }


    if (distance_1 < distance_2) {
        return sources[0];
    } else {
        return sources[1];
    }
};

let goTo = function (creep, target) {
    let path = creep.pos.findPathTo(target, {maxOps: 200});
    if (path.length) {
        creep.move(path[0].direction);
    }
};

/** @param creep **/
let repairProcedure = function (creep) {
    let repairs = creep.room.find(FIND_STRUCTURES, {
        filter: (s) => s.hits < s.hitsMax / 2
    });

    if(repairs.length == 0) {
        return false;
    }

    for(let i in repairs) {
        let target = repairs[i];
        if (creep.repair(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {reusePath: cache.reusePathValue});
            return true;
        }
    }
    return false;
};


let roleHarvester = {
    /** @param creep Object
     * @param totalEnergy Integer
     * @param minimumCost Integer
     */
    parts: [WORK, MOVE, MOVE, CARRY, CARRY],

    getEnergy: function() {
      //etrieveEnergyFromContainer(this.creep);
        let sources = this.creep.room.find(FIND_SOURCES_ACTIVE);
        if(sources.length < 1) {
            console.log("[!] There is no eligible source to harvest.");
            return false;
        }
        let source = sources[0];

        if(this.creep.harvest(source) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(source, {reusePath: 15});
        }
        return true;

    },

    upgrade: function() {
        let spawnPoint = Game.spawns['Spawn2'];
        if(spawnPoint.energy < spawnPoint.energyCapacity) {
            return false;
        }

        if (this.creep.upgradeController(this.creep.room.controller) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(this.creep.room.controller, {reusePath: 15});
        }
        return true;
    },

    drop: function() {
        if(this.creep.memory.full_energy == 1) {
            this.creep.drop(RESOURCE_ENERGY, this.creep.carry.energy);
            return true;
        } else {
            return false;
        }

    },

    run: function(creep, totalEnergy, minimumCost)
    {
        this.creep = creep;

      /** Define a working state **/
      if(creep.memory.working && creep.carry.energy == 0) {
          creep.memory.working = false;
      }

      if(!creep.memory.working && lo.sum(creep.carry) == creep.carryCapacity) {
          creep.memory.working = true;
      }

      this.creep = creep;


      if(!creep.memory.working) {

         this.getEnergy();

      } else {

          if(depositEnergy(creep)) {
              return 0;
          }

          /** Code giving priority to repairing procedures **/
          if(repairProcedure(creep)) {
              return 0;
          }


          if(this.creep.room.controller.ticksToDowngrade > 4000 && !this.creep.memory.controller_dying) {
              /** Construction code **/
              if(buildConstructions(creep, totalEnergy, minimumCost)) {
                  return 0;
              }
              return 0;
          } else {
              this.creep.memory.controller_dying = true;
          }


          if(this.upgrade()) {
              if(this.creep.room.controller.ticksToDowngrade > 4900) {
                  this.creep.memory.controller_dying = false;
              }
              return 0;
          }
      }
    }

};

module.exports = roleHarvester;
