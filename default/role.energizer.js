var roleEnergizer = {
    parts: [WORK, WORK, WORK, WORK, MOVE, CARRY],

    harvest: function (target) {
        if(this.creep.harvest(target) == ERR_NOT_IN_RANGE) {
           this.creep.moveTo(target);
        }
    },

    drop: function() {
      this.creep.drop(RESOURCE_ENERGY, this.creep.carry.energy);
    },

    run: function (creep) {
        this.creep = creep;
        let energy_sources = creep.room.find(FIND_SOURCES_ACTIVE);
        let target = creep.pos.findClosestByPath(energy_sources);

        if(creep.carry.energy < creep.carryCapacity) {
            this.harvest(target);
        } else {
            this.drop();
        }

    }
};

module.exports = roleEnergizer;