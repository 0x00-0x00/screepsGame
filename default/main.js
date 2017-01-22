var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleAssist = require('role.assist');



module.exports.loop = function () {


    /** Count creeps **/
    var num_creeps = 0
    WORKERS_LIST = [];
    for(var name in Game.creeps) {
        WORKERS_LIST[num_creeps] = name;
        num_creeps++;
    }


    SPAWN_POINT = Game.spawns["Spawn1"];

    UPGRADER_LIST = [];
    HARVESTER_LIST = ["Harvester1", "Harvester2", "Harvester3", "Harvester4"];

    /** Upgraders Generation **/
    for(var i=0; i < 15; i++)
    {
        UPGRADER_LIST[i] = "Upgrader" + i;
    }

    TOTAL_WORKERS_LIST = HARVESTER_LIST.concat(UPGRADER_LIST);
    TOTAL_WORKERS = TOTAL_WORKERS_LIST.length;

    console.log("#######################################################################")
    console.log("Total workers on the system: " + TOTAL_WORKERS);
    console.log("Total workers registered under your command: " + WORKERS_LIST.length);

    /** Checks the difference and spawn it **/
    if(num_creeps < TOTAL_WORKERS) {
        var diff = TOTAL_WORKERS - WORKERS_LIST.length;
        var set_diff = TOTAL_WORKERS_LIST.filter(function(x) { return WORKERS_LIST.indexOf(x) < 0})
        console.log("It is missing " + diff + " workers from your reign. This is inadmissible.");
        for(var deserter in set_diff) {

            /** Declare the deserter name **/
            deserter = set_diff[deserter];

            /** Checks its caste and spawn it. **/
            if(HARVESTER_LIST.includes(deserter)) {
                var parts = [WORK, MOVE, CARRY, CARRY];
                var cost = roleAssist.calculate_creep_cost(parts);

                if(cost < SPAWN_POINT.energy ) {
                    console.log("[+] Spawning a new harvester named " + deserter + ".");
                    Game.spawns['Spawn1'].createCreep(parts, deserter);
                } else {
                    console.log("Cost to spawn a Harvester: " + cost);
                    console.log("[!] Not enough energy to spawn " + deserter + ".");
                }

            }

            if(UPGRADER_LIST.includes(deserter)) {
                var parts = [WORK, MOVE, MOVE, CARRY];
                var cost = roleAssist.calculate_creep_cost(parts);

                if(cost < SPAWN_POINT.energy) {
                    console.log("[+] Spawning a new upgrader named " + deserter + ".");
                    Game.spawns['Spawn1'].createCreep(parts, deserter);
                } else {
                    console.log("Cost to spawn a Upgrader: " + cost);
                    console.log("[!] Not enough energy to spawn " + deserter + ".");
                }

            }
        }
    } else {
        console.log("Everything is okay.")
    }


    for(var name in Game.creeps) {
        var creep = Game.creeps[name];

        if(~name.indexOf("Harvester")) {
            roleHarvester.run(creep);
        }

        if(~name.indexOf("Upgrader")) {
            roleUpgrader.run(creep);
        }
    }
}
