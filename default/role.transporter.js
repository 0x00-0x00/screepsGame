var roleTransporter = {
    parts: [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY],

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
        if(structs == null) {
            console.log("Transporter error: No structures to store energy.");
            return false;
        } else {
            let target = this.creep.pos.findClosestByPath(structs);
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
            if(this.creep.transfer(container) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(target);
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

        /** If not full of energy **/
        if( !creep.memory.working ) {
            this.pickEnergy();
        } else {
            this.storeEnergy();
        }

    }
};

module.exports = roleTransporter;