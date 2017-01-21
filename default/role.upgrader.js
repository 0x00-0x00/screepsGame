var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function (creep)
    {
        if(creep.carry.energy < creep.carry.carryCapacity)
        {
            //var sources = creep.room.find(FIND_SOURCES);
            var source = creep.pos.findInRange(Game.SOURCES, 3);
            console.log("Upgrader source: " + source);
            creep.moveTo(source);
            creep.harvest(source);
        }
        else {
            var target = creep.room.controller;
            if(creep.upgradeController(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
    }

}

module.exports = roleUpgrader;