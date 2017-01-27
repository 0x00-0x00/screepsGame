let roleVoyager = {
    //parts: [WORK, MOVE, CARRY],
    parts: [WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY],

    coming_from: "W2N5",
    destination: "W3N5",

    harvest: function (target) {
        if(this.creep.harvest(target) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(target);
        }
    },

    voyage: function(room_name) {
        if(this.creep.room.name != room_name) {
            this.creep.say("Travel!");
            this.creep.moveTo(this.creep.pos.findClosestByPath(this.creep.room.findExitTo(room_name)));
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
          this.creep.moveTo(storage[0]);
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

            if(this.voyage(this.destination)) {
                return 0;
            }
            let sources = this.creep.room.find(FIND_SOURCES_ACTIVE);
            let nearbySource = this.creep.pos.findClosestByPath(sources);
            this.harvest(nearbySource);
        } else {

            if(this.voyage(this.coming_from)) {
                return 0;
            }

            if(!this.storeEnergy()) {
                console.log("@Voyager error: No storage.");
            }
        }


    },


};

module.exports = roleVoyager;