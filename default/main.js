var roleHarvester = require('role.harvester');

module.exports.loop = function () {

    /** Count creeps **/
    var num_creeps = 0
    for(var c in Game.creeps) {
        num_creeps++;
    }

    if(num_creeps == 0)
    {
        Game.spawns['Spawn1'].createCreep([WORK, MOVE, CARRY], 'Harvester');
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        roleHarvester.run(creep);
    }
}
