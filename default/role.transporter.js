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
    let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0
    });

    /** If there arent containers or are empty  **/
    if(container == null) {
        //console.log("[!] Low demand for transporters!");
        return false;
    }


    if(creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(container);
    }

    return true;

};

let retrierEnergyFromAll = function(creep) {
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
    parts: [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],

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
            retrierEnergyFromAll(this.creep);
            this.storeEnergy();
            return true;
        } else {
            return false;
        }
    },

    pickEnergy: function() {
        let dropped_energies = this.creep.room.find(FIND_DROPPED_ENERGY);
        let target = this.creep.pos.findClosestByPath(dropped_energies);

        /** Check if there is dropped energy on the ground **/
        if(target == null) {
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
            //console.log("Transporter moving resources to " + target);
            if(this.creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(target);
            }
            return true;
        }

        /** Check if there are towers in need of energy **/
        if(towers[0] != null || towers.length > 0) {
            let target = this.creep.pos.findClosestByPath(towers);
            if(this.creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(target);
            }
            return true;
        }

        /** Check if there are any containers able to receive energy**/
        if(container == null) {
            //console.log("Low demand for transporters!");
            //console.log("Transporter error: No containers to store energy.");
            return false;
        } else {
            //console.log("Transporter moving resources to " + container);
            if(this.creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(container);
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
        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
        }

        if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
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