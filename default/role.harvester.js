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
  let structs = creep.room.find(FIND_MY_STRUCTURES);
  let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] < s.storeCapacity
  });

  for(let x in structs) {
      let structure = structs[x];
      if(structure.energyCapacity > structure.energy) {
          if(creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
              creep.moveTo(structure);
          }
          return true;
      }
  }
  if(container == null) {
      console.log("No container.");
  } else {
      console.log("Transferring to container.")
      if(creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(container);
      }
  }



};

let retrieveEnergyFromContainer = function(creep) {
    let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0
    });

    /** If there arent containers or are empty  **/
    if(container == null) {
        return false;
    }

    if(creep.withdraw(container) == ERR_NOT_IN_RANGE) {
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
            creep.moveTo(target);
        } else {
            creep.say("Building")
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

/**  *
 * @param struct
 */
let checkRepair = function (struct) {
    if (struct.hits < struct.hitsMax / 2) {
        return true;
    } else {
        return false;
    }
};

/** @param creep **/
let repairProcedure = function (creep) {
    let repairs = creep.room.find(FIND_MY_STRUCTURES);
    for (let i in repairs) {
        let target = repairs[i];
        if (checkRepair(target)) {
            if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
            return true;
        }
    }
    return false;
};


var roleHarvester = {
    /** @param creep Object
     * @param totalEnergy Integer
     * @param minimumCost Integer
     */
    parts: [WORK, WORK, MOVE, MOVE, CARRY, CARRY],

    run: function(creep, totalEnergy, minimumCost)
    {

      /** Define a working state **/
      if(creep.memory.working && creep.carry.energy == 0) {
          creep.memory.working = false;
      }

      if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
          creep.memory.working = true;
      }


      if(!creep.memory.working) {

          /** This ensures survival of Harvesters using stored energy into spawning **/
          if(totalEnergy < minimumCost) {
              if(!retrieveEnergyFromContainer(creep)) {
                  console.log("[!] Containers are empty.");
              }
          }
          /** Gets all sources from ROOM **/
          let sources = creep.room.find(FIND_SOURCES_ACTIVE);
          let target = quickestRoute(creep, sources);

          /** Priority to NEAR decaying energy **/
          let dropped = creep.room.find(FIND_DROPPED_ENERGY);
          let dropped_isNear = (creep.pos.getRangeTo(dropped[0]) < creep.pos.getRangeTo(target));

          if(dropped.length > 0  && dropped_isNear) {
              let dropped_source = dropped[0];

              creep.say("Picking");
              if(creep.pickup(dropped_source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(dropped_source);
              }

              return 0;
          }


          /** Moving and harvesting code **/

          if(creep.harvest(target) == ERR_NOT_IN_RANGE) {
              goTo(creep, target);
              //creep.say("Moving");
          } else {
              creep.say("Harvesting");
          }

          return 0;

      } else {

          /** Code giving priority to repairing procedures **/
          if(repairProcedure(creep)) {
              return 0;
          }

          /** Construction code **/
          if(buildConstructions(creep, totalEnergy, minimumCost)) {
              return 0;

          } else {

              /** If nothing above, deposit energy. **/
              if(depositEnergy(creep)) {
                  return 0;
              }
          }



          /** To drop the energy instead of returning it. **/
          //creep.drop(RESOURCE_ENERGY, creep.carry.energy);

      }
    }

};

module.exports = roleHarvester;
