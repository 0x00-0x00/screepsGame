var cache = require('role.cache');

let roleConqueror = {
    parts: [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, CLAIM],

    destination: "W2N4",

    voyage: function (roomName) {
      if(this.creep.room.name != roomName) {
          this.creep.say("Travel!");
          let target = this.creep.pos.findClosestByPath(this.creep.room.findExitTo(roomName));
          this.creep.moveTo(target, {reusePath: cache.reusePathValue});
          return true;
      }
      return false;
    },

    controlController: function() {
        let controller = this.creep.room.controller;
        this.creep.say("Conquer!");
        if(this.creep.claimController(controller) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(controller, {reusePath: cache.reusePathValue});
        }
    },

    run: function(creep) {
        this.creep = creep;
        if(!this.voyage(this.destination)) {
            this.controlController();
        }
        return 0;
    }


};

module.exports = roleConqueror;