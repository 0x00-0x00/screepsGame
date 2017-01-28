var lo = require('lodash');
var cache = require('role.cache');

/** Function to get the total number of energy available through all structures present in the room.
 * @param Game Object
 * @param roomName String
 * **/
let getTotalEnergy = function (Game, roomName) {
    let totalEnergy = 0;
    let structs = Game.rooms[roomName].find(FIND_MY_STRUCTURES, {
        filter: (s) => s.structureType != STRUCTURE_TOWER
    });

    for (let name in structs) {
        let structure = structs[name];
        if (structure.energy != undefined && structure.energy > 0) {
            totalEnergy += structure.energy;
        }
    }
    return totalEnergy;
};

let retrieveEnergyFromContainer = function(creep) {

    if(creep.memory.container == undefined || creep.room.memory.cache_timeout % 8 == 0) {
        let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0
        });
        if(container == null) {
            creep.memory.container = null;
        } else {
            creep.memory.container = container.id;
        }

    }

    let container = Game.getObjectById(creep.memory.container);

    /** As of cache, maybe the cached object has not energy any more. So, we check it. **/


    /** If there arent containers or are empty  **/
    if(container == null || container == "") {
        if(creep.memory.report_index % 8 == 0) {
            console.log("[!] Low demand for transporters!");
        }
        creep.memory.report_index += 1;
        return false;
    }

    if(creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(container, {reusePath: cache.reusePathValue});
    }

    return true;

};


let retrieveEnergyFromAll = function(creep) {
  let storages = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: (s) => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE) && (s.store[RESOURCE_ENERGY] > 0)
  });

  if(storages == null) {
      console.log("[+] OH FUCK NO ENERGY ON CONTAINERS OR STORAGE. YOU ARE DOOMED.");
      return false;
  }

  creep.say("Saving");
  if(creep.withdraw(storages, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(storages);
  }

  return true;
};


let roleTransporter = {
    parts: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],

    refillTurret: function() {
        if(this.creep.memory.turrets == undefined || this.creep.room.memory.cache_timeout % 32 == 0) {
            let turrets = this.creep.room.find(FIND_MY_STRUCTURES, {
                filter: (s) => (s.structureType == STRUCTURE_TOWER && s.energy < (s.energyCapacity - this.creep.carryCapacity))
            });
            if(turrets = null) {
                this.creep.memory.turrets = null;
            } else {
                this.creep.memory.turrets = cache.storeObjects(turrets);
            }

        }

        let turrets = cache.retrieveObjects(this.creep.memory.turrets);


        if(turrets.length == 0 || turrets == null) {
            return false;
        }

        let turret = this.creep.pos.findClosestByPath(turrets);

        /** In case the creep have resources **/
        if(this.creep.carry[RESOURCE_ENERGY] < 1) {
            return false;
        }

        if(this.creep.transfer(turret, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(turret);
        }
        return true;
    },


    renew: function() {
        if(this.creep.ticksToLive < 100) {
            let spawnPoints = this.creep.room.find(FIND_MY_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_SPAWN
            });
            let nearSpawnPoint = this.creep.pos.findClosestByPath(spawnPoints);
            if(nearSpawnPoint.renewCreep(this.creep) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(nearSpawnPoint);
            }
            this.creep.say("Renewal");
            return true;
        }

        return false;
    },

    saveSpawn: function() {
        let energyAvailable = getTotalEnergy(Game, "W2N5");
        let level = 5;
        let minimumEnergy = 200 * level;
        let enemies = this.creep.room.find(FIND_HOSTILE_CREEPS);

        if(energyAvailable < minimumEnergy) {
            retrieveEnergyFromAll(this.creep);
            this.storeEnergy();
            return true;
        } else {
            return false;
        }
    },

    pickEnergy: function() {

        /** Store dropped energies location ID's into cache **/
        if(this.creep.memory.dropped_energies == undefined || this.creep.room.memory.cache_timeout % 8 == 0) {
            this.creep.memory.dropped_energies = cache.storeObjects(this.creep.room.find(FIND_DROPPED_ENERGY));
        }

        let dropped_energies = cache.retrieveObjects(this.creep.memory.dropped_energies);
        if(this.creep.memory.target == undefined || this.creep.room.memory.cache_timeout % 8 == 0) {
            let target = this.creep.pos.findClosestByPath(dropped_energies);
            if(target == null) {
                this.creep.memory.target = null;
            } else {
                this.creep.memory.target = target.id;
            }
        }

        let target = Game.getObjectById(this.creep.memory.target);


        /** Check if there is dropped energy on the ground **/
        if(target == null || target == "") {
            retrieveEnergyFromContainer(this.creep);
            return true;
        }

        if(this.creep.pickup(target) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(target);
        }
        return true;
    },

    storeEnergy: function() {

        let structs = this.creep.room.find(FIND_MY_STRUCTURES, {
            filter:  (s) => (s.energy < s.energyCapacity) && s.structureType != STRUCTURE_TOWER
        });

        /** This is used when you dont have a freaking huge STORAGE and do not want to use the containers as energy dropping boxes
         * let container = this.creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (s) => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE) && s.store[RESOURCE_ENERGY] < s.storeCapacity
        });**/

        let container = this.creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (s) => (s.structureType == STRUCTURE_STORAGE && s.store[RESOURCE_ENERGY] < s.storeCapacity)
        });

        let towers = this.creep.room.find(FIND_MY_STRUCTURES, {
            filter: (s) => (s.energy < (s.energyCapacity - this.creep.carryCapacity)) && s.structureType == STRUCTURE_TOWER
        });

        /** Check if there are extensions/spawns with storage capacity **/
        if(structs[0] != null || structs.length > 0) {
            let target = this.creep.pos.findClosestByPath(structs);
            if(this.creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(target, {reusePath: 50});
            }
            return true;
        }


        /** Check if there are towers in need of energy **/
        if((towers[0] != null || towers.length > 0) && this.creep.carry[RESOURCE_ENERGY] > 0) {
            let target = this.creep.pos.findClosestByPath(towers);
            if(this.creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(target, {reusePath: 50});
            }
            return true;
        }


        /** Check if there are any containers able to receive energy**/
        if(container == null) {
            return false;
        } else {
            for(let _ in this.creep.carry) {
                if(this.creep.transfer(container, _) == ERR_NOT_IN_RANGE) {
                    this.creep.moveTo(container, {reusePath: 50});
                    break;
                }
            }

            return true;
        }



    },

    run: function (creep) {

        this.creep = creep;

        /** Renewing is not worth it. **/
        //if(this.renew()) {
        //    return 0;
        //}

        /** Define a working state **/
        if(creep.memory.working && lo.sum(creep.carry) == 0) {
            creep.memory.working = false;
        }

        if(!creep.memory.working && lo.sum(creep.carry) == creep.carryCapacity) {
            creep.memory.working = true;
        }

        /** The core priority is to save the spawn **/
        if(this.saveSpawn()) {
            return 0;
        }


        /** If not full of energy **/
        if( !creep.memory.working ) {
            this.pickEnergy();
        } else {
            this.storeEnergy();

        }

        return 0;

    }
};

module.exports = roleTransporter;