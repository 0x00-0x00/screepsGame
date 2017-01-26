
let roleWarrior = {
    parts: [ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH],


    getMaximumHits: function () {
        let maximumHealth = 0;
        for(let _part in this.parts) {
            let part = this.parts[_part];
            if(part == TOUGH) {
                maximumHealth += 10;
            }
        }
        return (this.parts.length * 100) + maximumHealth;
    },

    killBandits: function() {
        let hostiles = this.creep.room.find(FIND_HOSTILE_CREEPS);
        if(hostiles.length == 0) {
            return false;
        }

        let nearest = this.creep.pos.findClosestByPath(hostiles);
        let range = this.creep.pos.getRangeTo(nearest);
        if(range > 1) {
            /** Pursue this fuckers **/
            if(hostiles.length > 0 ) {
                this.creep.moveTo(nearest);
            }

        }

        /** Physical hits are harder **/
        if(this.creep.pos.inRangeTo(nearest, 1)) {
            if(this.creep.attack(nearest) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(nearest);
            }
        }

        if(hostiles.length > 3) {
            if(this.creep.pos.inRangeTo(nearest, 3)) {
                if(this.creep.rangedMassAttack(nearest) == ERR_NOT_IN_RANGE) {
                    this.creep.moveTo(nearest);
                }
                return true;
            }
        }

        if(this.creep.pos.inRangeTo(nearest, 3)) {
            if(this.creep.rangedAttack(nearest) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(nearest);
            }
            return true;
        }

        return false;
    },

    run: function (creep) {
      this.creep = creep;
      if(!this.killBandits()) {
          console.log("[+] No enemies spotted in the base.");
      }

    },
};


module.exports = roleWarrior;