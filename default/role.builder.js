
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

    parts: [WORK, WORK, MOVE, MOVE, CARRY, CARRY],

    getEnergy: function() {
      let container = this.creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0
      });

      if(this.creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          this.creep.moveTo(container);
      }

    },

    repair: function() {
        /** Static variables **/
        let maximumHits = 100000;

        let my_structures = this.creep.room.find(FIND_MY_STRUCTURES);
        let structures = this.creep.room.find(FIND_STRUCTURES);
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
                    this.creep.moveTo(repair_struct);
                }
                return true;
            }
        }
        return false;

    },

    build: function() {
      let construction_sites = this.creep.room.find(FIND_CONSTRUCTION_SITES);
      if(construction_sites.length > 0) {
          let target = this.creep.pos.findClosestByPath(construction_sites);
          if(this.creep.build(target) == ERR_NOT_IN_RANGE) {
              this.creep.moveTo(target);
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

            /** Repairs first **/
            if(this.repair()) {
               return 0;
            }


            /** Building later **/
            if(this.build()) {
                return 0;
            }
        }

    },
};

module.exports = roleBuilder;