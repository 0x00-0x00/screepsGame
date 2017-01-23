
/** @param {Array} array **/
Array.min = function( array )
{
    return Math.min.apply(Math, array);
}

/** @param {Creep} {Sources} **/
var quickestRoute(creep, sources)
{
    let distances = [];
    for(var i in sources) {
        let target = sources[i];
        let distance = creep.pos.getRangeTo(target);
        distances[i] = distance;
    }

    let quickest = Array.min(distances);
    for(var i in sources) {
        var target = sources[i];
        let distance = creep.pos.getRangeTo(target);
        if(distance == quickest) {
            return target;
        }
    }


}

/** @param {Structure} structure**/
var checkRepair(struct)
{
    if(struct.hits < struct.hitsMax / 2) {
        return true;
    } else {
        return false;
    }
}

/** @param {Creep} creep **/
var repairProcedure(creep) {
    var repairs = creep.room.find(FIND_MY_STRUCTURES);
    for(var i in repairs) {
        var target = repairs[i];
        if(checkRepair) {
            if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
    }
}

var roleBuilder = {

    getEnergy: function() {
      let container = this.creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0
      });

      if(this.creep.withdraw(container) == ERR_NOT_IN_RANGE) {
          this.creep.moveTo(container);
      }

    },

    repair: function() {
        let my_structures = this.creep.room.find(FIND_MY_STRUCTURES);
        let structures = this.creep.room.find(FIND_STRUCTURES);
        let repair_strutures = my_structures.concat(structures);

        for(let i in repair_strutures) {
            let repair_struct = repair_strutures[i];
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
          let target = creep.pos.findClosestByPath(construction_sites);
          if(this.creep.build(target) == ERR_NOT_IN_RANGE) {
              this.creep.moveTo(target);
          }
          return true;
      } else {
          return false;
      }
    },

    /** @param {Creep} creep **/
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
}

module.exports = roleBuilder;