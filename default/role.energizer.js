let roleEnergizer = {
    parts: [WORK, WORK, WORK, WORK, WORK, WORK, MOVE, CARRY],

    harvest: function (target) {
        if(this.creep.harvest(target) == ERR_NOT_IN_RANGE) {
           this.creep.moveTo(target);
        }
    },

    checkNear: function() {
        let energyMines = this.creep.room.find(FIND_SOURCES_ACTIVE);
        let nearbyMine = this.creep.pos.findClosestByPath(energyMines);
        let nearbyMineRange = this.creep.pos.getRangeTo(nearbyMine);
        if(nearbyMineRange != 1) {
            console.log(this.creep.name + ": I am not near a energy mine!");
            return false;
        }

        let energizers = this.creep.room.find(FIND_MY_CREEPS, {
          filter: (c) => (~c.name.indexOf("Energizer"))
        });

        let nearbyEnergizer = this.creep.pos.findClosestByPath(energizers);
        let nearbyEnergizerRange = this.creep.pos.getRangeTo(nearbyEnergizer);

        if(nearbyEnergizerRange == 0) {
            console.log(this.creep.name + ": I am very close to my partner!");
            return true;
        } else {
            console.log(this.creep.name + ": Finally, a mine for my own.");
            return false;
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

    individual: function(sources) {
        if(sources.length == 1) {
            return sources[0];
        } else {
            if(~this.creep.name.indexOf("Energizer0")) {
                return sources[0];
            } else {
                return sources[1];
            }
        }

    },

    run: function (creep) {
        this.creep = creep;
        let energy_sources = creep.room.find(FIND_SOURCES_ACTIVE);
        let target = this.individual(energy_sources);

        if(creep.carry.energy < (creep.carryCapacity - this.oneTake())) {
            this.harvest(target);
        } else {
            this.drop();
        }
    }
};

module.exports = roleEnergizer;