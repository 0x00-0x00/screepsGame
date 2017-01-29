var cache = require('role.cache');

/** @param {Array} array **/
Array.min = function( array )
{
    return Math.min.apply(Math, array);
};

/** *
 * @param struct
 */
let checkRepair = function(struct)
{
    if(struct.hits < struct.hitsMax / 2) {
        return true;
    } else {
        return false;
    }
};

let roleBuilder = {

    parts: [WORK, WORK, CARRY, CARRY, MOVE, MOVE],

    refillTurret: function() {
        let turrets = this.creep.room.find(FIND_MY_STRUCTURES, {
            filter: (s) => (s.structureType == STRUCTURE_TOWER && s.energy < (s.energyCapacity - this.creep.carryCapacity * 2))
        });

        if(turrets.length == 0) {
            return false;
        }

        let turret = this.creep.pos.findClosestByPath(turrets);
        if(this.creep.transfer(turret, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(turret, {reusePath: cache.reusePathValue});
        }
        return true;
    },

    getEnergy: function() {
      let container = this.creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: (s) => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE) && s.store[RESOURCE_ENERGY] > this.creep.carryCapacity
      });


      if(this.creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          this.creep.moveTo(container, {reusePath: cache.reusePathValue});
      }

    },

    repair: function() {
        /** Static variables **/
        let maximumHits = 100000;

        if(this.creep.memory.my_structures == undefined || this.creep.room.memory.cache_timeout % 64 == 0) {
            let my_structures = this.creep.room.find(FIND_MY_STRUCTURES);
            this.creep.memory.my_structures = cache.storeObjects(my_structures);
        }
        let my_structures = cache.retrieveObjects(this.creep.memory.my_structures);

        if(this.creep.memory.structures == undefined || this.creep.room.memory.cache_timeout % 64 == 0) {
            let structures = this.creep.room.find(FIND_STRUCTURES);
            this.creep.memory.structures = cache.storeObjects(structures);
        }
        let structures = cache.retrieveObjects(this.creep.memory.structures);

        /** Join them **/
        let repair_strutures = my_structures.concat(structures);

        for(let i in repair_strutures) {
            let repair_struct = repair_strutures[i];

            /** Set a maximum hitpoints for Walls and Ramparts **/
            if(repair_struct.structureType == STRUCTURE_WALL || repair_struct.structureType == STRUCTURE_RAMPART) {
                if(repair_struct.hits > maximumHits) {
                    continue;
                }
            }


            if(checkRepair(repair_struct)) {
                if(this.creep.repair(repair_struct) == ERR_NOT_IN_RANGE) {
                    this.creep.moveTo(repair_struct, {reusePath: cache.reusePathValue});
                }
                return true;
            }
        }
        return false;

    },

    build: function() {
      if(this.creep.memory.construction_sites == undefined || this.creep.room.memory.cache_timeout % 8 == 0) {
          let construction_sites = this.creep.room.find(FIND_CONSTRUCTION_SITES);
          this.creep.memory.construction_sites = cache.storeObjects(construction_sites);
      }
      let construction_sites = cache.retrieveObjects(this.creep.memory.construction_sites);

      if(construction_sites.length > 0) {
          let target = this.creep.pos.findClosestByPath(construction_sites);
          if(this.creep.build(target) == ERR_NOT_IN_RANGE) {
              this.creep.moveTo(target, {reusePath: cache.reusePathValue});
          }
          return true;
      } else {
          return false;
      }
    },

    /** @param creep **/
    run: function (creep)
    {
        this.creep = creep;
        /** Define a working state **/
        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
        }

        if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if(!creep.memory.working) {

            this.getEnergy();
            return 0;

        } else {

            if(!this.repair()) {
                this.build();
            }


        }

    },
};

module.exports = roleBuilder;