var cache = require('role.cache');

let roleVoyager = {
    //parts: [WORK, MOVE, CARRY],
    parts: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],

    coming_from: "W2N5",
    destination: "W3N5",

    harvest: function (target) {
        if(this.creep.harvest(target) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(target, {reusePath: cache.reusePathValue});
        }
    },

    voyage: function(room_name) {
        if(this.creep.room.name != room_name) {
            this.creep.say("Travel!");
            let target = this.creep.pos.findClosestByPath(this.creep.room.findExitTo(room_name));
            this.creep.moveTo(target, {reusePath: cache.reusePathValue});
            return true;
        }
        return false;
    },

    storeEnergy: function() {
      let storage = this.creep.room.find(FIND_STRUCTURES, {
          filter: (s) => s.structureType == STRUCTURE_STORAGE
      });

      if(storage == null || storage.length == 0) {
          return false;
      }

      /** Store it !**/
      if(this.creep.transfer(storage[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          this.creep.moveTo(storage[0], {reusePath: cache.reusePathValue});
      }

      return true;

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

            /** Enemy run away algorithm **/
            let hostiles = this.creep.room.find(FIND_HOSTILE_CREEPS);
            if(hostiles.length > 0) {
                this.creep.memory.seen_enemy = 1;
                let controller = this.creep.memory.source_room.controller;

                /** Run away from enemy creeps **/
                if(!this.voyage(this.creep.memory.source_room)) {
                    this.creep.moveTo(controller, {reusePath: cache.reusePathValue});
                }
                return 0;
            }

            /** Freeze the creep with fear from the enemy **/
            if(this.creep.memory.seen_enemy == 1) {
                this.creep.memory.seen_enemy_index += 1;
                if(this.creep.memory.seen_enemy_index % 64 == 0) {
                    this.creep.memory.seen_enemy = 0;
                }
                return 0;
            }


            /** Voyage algorithm **/
            if(this.voyage(this.destination) && this.creep.memory.seen_enemy == 0) {
                return 0;
            }

            /** Harvesting algorithm **/
            let sources = this.creep.room.find(FIND_SOURCES_ACTIVE);
            let nearbySource = this.creep.pos.findClosestByPath(sources);
            this.harvest(nearbySource);
        } else {

            if(this.voyage(this.creep.memory.source_room)) {
                return 0;
            }

            if(!this.storeEnergy()) {
                console.log("@Voyager error: No storage.");
            }
        }


    },


};

module.exports = roleVoyager;