let roleEnergizer = {
    parts: [WORK, WORK, WORK, WORK, WORK, WORK, MOVE, CARRY],

    harvest: function (target) {
        if(this.creep.harvest(target) == ERR_NOT_IN_RANGE) {
           this.creep.moveTo(target);
        }
    },

    drop: function() {
      this.creep.drop(RESOURCE_ENERGY, this.creep.carry.energy);
    },

    oneTake: function() {
        let oneTake = 0;
        for(let _p in this.parts) {
            let part = this.parts[_p];
            if(part == WORK) {
                oneTake += 2;
            }
        }
        return oneTake;
    },

    run: function (creep) {
        this.creep = creep;
        let energy_sources = creep.room.find(FIND_SOURCES_ACTIVE);
        let target = creep.pos.findClosestByPath(energy_sources);
        if(creep.carry.energy < (creep.carryCapacity - this.oneTake())) {
            this.harvest(target);
        } else {
            this.drop();
        }
    }
};

module.exports = roleEnergizer;