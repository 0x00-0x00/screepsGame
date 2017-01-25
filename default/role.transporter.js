/** Function to get the total number of energy available through all structures present in the room.
 * @param Game Object
 * @param roomName String
 * **/
let getTotalEnergy = function (Game, roomName) {
    let totalEnergy = 0;
    let structs = Game.rooms[roomName].find(FIND_MY_STRUCTURES);
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
        console.log("Transporter error: There are no energy containers available.");
        return false;
    }


    if(creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(container);
    }

    return true;

};



var roleTransporter = {
    parts: [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY],

    saveSpawn: function() {
        let energyAvailable = getTotalEnergy(Game, "W2N5");
        let level = 4;
        let minimumEnergy = 200 * level;
        let enemies = this.creep.room.find(FIND_HOSTILE_CREEPS);

        if(energyAvailable < minimumEnergy && enemies.length > 0) {
            retrieveEnergyFromContainer(this.creep);
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
            return false;
        }

        if(this.creep.pickup(target) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(target);
        }
        return true;
    },

    storeEnergy: function() {

        let structs = this.creep.room.find(FIND_MY_STRUCTURES, {
            filter:  (s) => s.energy < s.energyCapacity
        });

        let container = this.creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] < s.storeCapacity
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

        /** Check if there are any containers able to receive energy**/
        if(container == null) {
            console.log("Transporter error: No containers to store energy.");
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
        /** Define a working state **/
        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
        }

        if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        /** The core priority is to save the spawn **/
        if(this.saveSpawn()) {
            console.log("[+] Transpoter saving spawn");
        }

        /** If not full of energy **/
        if( !creep.memory.working ) {
            this.pickEnergy();
        } else {
            this.storeEnergy();
        }

    }
};

module.exports = roleTransporter;