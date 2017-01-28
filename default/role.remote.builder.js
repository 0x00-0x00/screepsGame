var cache = require('role.cache');

let roleRemoteBuilder = {
    parts: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK],

    source_room: "W2N5",

    /** Hard-coded destination **/
    destination: "W2N4",

    voyage: function(roomName) {
        if(this.creep.room.name != roomName) {
            this.creep.say("Travel!");
            let target = this.creep.pos.findClosestByPath(this.creep.room.findExitTo(roomName));
            this.creep.moveTo(target, {reusePath: cache.reusePathValue});
            return true;
        }
        return false;
    },

    build: function() {
        if(this.creep.memory.structures == undefined || this.creep.room.memory.cache_timeout % 32 == 0) {
            let constructions = this.creep.room.find(FIND_CONSTRUCTION_SITES);
            if(constructions.length < 1) {
                this.creep.memory.structures = null;
            } else {
                this.creep.memory.structures = cache.storeObjects(constructions);
            }
        }

        let constructions = cache.retrieveObjects(this.creep.memory.structures);
        if(constructions == null) {
            this.creep.say("No constructions!");
            return false;
        }
        if(this.creep.memory.targetBuilding == undefined || this.creep.room.memory.cache_timeout % 32 == 0) {
            let target = this.creep.pos.findClosestByPath(constructions);
            if(target == null) {
                this.creep.memory.targetBuilding = null;
            } else {
                this.creep.memory.targetBuilding = target.id;
            }
        }

        let target = Game.getObjectById(this.creep.memory.targetBuilding);
        if(target == null) {
            this.creep.say("No target!");
            return false;
        }

        /** Building code **/
        if(this.creep.build(target) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(target, {reusePath: cache.reusePathValue});
        }
        this.creep.say("Building!");
        return true;
    },

    storeEnergy: function() {
        let storage = null;

        if(this.creep.memory.storage == undefined || this.creep.room.memory.cache_timeout % 32 == 0) {
            let storage = this.creep.room.find(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_STORAGE
            });
            if(storage == null) {
                this.creep.memory.storage = null;
            }
            if(storage.length == 1) {
                this.creep.memory.storage = storage.id;
            } else {
                this.creep.memory.storage = cache.storeObjects(storage);
            }
        }

        if(this.creep.memory.storage.lenght == 1) {
            let storage = Game.getObjectById(this.creep.memory.storage);
        } else {
            let storage = cache.retrieveObjects(this.creep.memory.storage);
        }


        if(storage == null || storage.length == 0) {
            console.log("[!] Remote builder: Storage error!");
            return false;
        }

        /** Store it !**/
        if(this.creep.transfer(storage[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(storage[0], {reusePath: cache.reusePathValue});
        }

        return true;

    },

    getEnergy: function() {
        if(this.creep.memory.container == undefined || this.creep.room.memory.cache_timeout % 32 == 0) {
            let container = this.creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE) && s.store[RESOURCE_ENERGY] > this.creep.carryCapacity
            });
            if(container == null) {
                this.creep.memory.container = null;
            } else {
                this.creep.memory.container = container.id;
            }

        }

        let container = Game.getObjectById(this.creep.memory.container);
        if(container == null) {
            return false;
        }

        if(this.creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(container, {reusePath: cache.reusePathValue});
        }

    },



    run: function(creep) {
        this.creep = creep;
        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
        }

        if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if(!creep.memory.working) {
            if(!this.voyage(this.source_room)) {
                this.getEnergy();
            }
        } else {
            if(!this.voyage(this.destination)) {
                this.build();
            }
        }


    },

};

module.exports = roleRemoteBuilder;