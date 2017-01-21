var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');

/** Function to unite two sets **/
function union_arrays (x, y) {
    var obj = {};
    for (var i = x.length-1; i >= 0; -- i)
        obj[x[i]] = x[i];
    for (var i = y.length-1; i >= 0; -- i)
        obj[y[i]] = y[i];
    var res = []
    for (var k in obj) {
        if (obj.hasOwnProperty(k))  // <-- optional
            res.push(obj[k]);
    }
    return res;
}


module.exports.loop = function () {

    /** Count creeps **/
    var num_creeps = 0
    WORKERS_LIST = [];
    for(var name in Game.creeps) {
        WORKERS_LIST[num_creeps] = name;
        num_creeps++;
    }

    HARVESTER_LIST = ["Harvester1", "Harvester2"];
    UPGRADER_LIST = ["Upgrader1", "Upgrader2", "Upgrader3"];

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
            console.log("The deserter is: " + deserter);
            /** Checks its caste and spawn it. **/

            if(HARVESTER_LIST.includes(deserter)) {
                Game.spawns['Spawn1'].createCreep([WORK, MOVE, CARRY], deserter);
            }

            if(UPGRADER_LIST.includes(deserter)) {
                Game.spawns['Spawn1'].createCreep([WORK, MOVE, CARRY], deserter);
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
