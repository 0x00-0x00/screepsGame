var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleAssist = require('role.assist');
var roleTransporter = require('role.transporter');

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
    TRANSPORTER_LIST = [];
    HARVESTER_LIST = [];

    /** Harvester's generation **/
    for(var i=0; i < 8; i++)
    {
        HARVESTER_LIST[i] = "Harvester" + i;
    }

    /** Upgraders Generation **/
    for(var i=0; i < 10; i++)
    {
        UPGRADER_LIST[i] = "Upgrader" + i;
    }

    TOTAL_WORKERS_LIST = HARVESTER_LIST.concat(UPGRADER_LIST);
    TOTAL_WORKERS_LIST = TOTAL_WORKERS_LIST.concat(TRANSPORTER_LIST);
    TOTAL_WORKERS = TOTAL_WORKERS_LIST.length;

    //console.log("#######################################################################")
    //console.log("Total workers planned ...: " + TOTAL_WORKERS);
    //console.log("Total workers alive .....: " + WORKERS_LIST.length);
    //console.log("Current workers .........: " + WORKERS_LIST);

    var minimum_cost = 300;
    if(num_creeps < TOTAL_WORKERS) {
        if(SPAWN_POINT.energy >= minimum_cost) {
        /** Checks the difference and spawn it **/
            var diff = TOTAL_WORKERS - WORKERS_LIST.length;
            var set_diff = TOTAL_WORKERS_LIST.filter(function(x) { return WORKERS_LIST.indexOf(x) < 0})
            console.log("It is missing " + diff + " workers from your reign. This is inadmissible.");
            for(var deserter in set_diff) {

                /** Declare the deserter name **/
                deserter = set_diff[deserter];

                /** Priority for spawning:
                 * 1. Harvesters,
                 * 2. Transporters,
                 * 3. Upgraders
                 * **/


                if(roleAssist.spawnProcedure(HARVESTER_LIST, deserter, "harvester", [WORK, WORK, MOVE, CARRY], SPAWN_POINT) == 0) {
                    break;
                }

                if(roleAssist.spawnProcedure(TRANSPORTER_LIST, deserter, "transporter", [WORK, MOVE, CARRY, CARRY], SPAWN_POINT) == 0) {
                    break;
                }

                if(roleAssist.spawnProcedure(UPGRADER_LIST, deserter, "upgrader", [WORK, MOVE, MOVE, CARRY, CARRY], SPAWN_POINT) == 0) {
                    break;
                }


            }
        } else {
            console.log("[+] Everything is okay.");
        }
    }


    for(var name in Game.creeps) {
        var creep = Game.creeps[name];

        if(~name.indexOf("Harvester")) {
            roleHarvester.run(creep);
        }

        if(~name.indexOf("Upgrader")) {
            roleUpgrader.run(creep);
            //creep.suicide();
        }

        if(~name.indexOf("Transporter")) {
            //roleTransporter.run(creep);
            creep.suicide();
        }
    }
}
