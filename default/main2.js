let roleHarvester = require('role.harvester');
let roleUpgrader = require('role.upgrader');
let roleAssis = require('role.assist');
let roleTransporter = require('role.transporter');

/** Function to get the total number of energy available through all structures present in the room.
 * @param Game Object
 * @param roomName String
 * **/
let getTotalEnergy = function (Game, roomName) {
    let totalEnergy = 0;
    var structs = Game.rooms[roomName].find(FIND_MY_STRUCTURES);
    for (var name in structs) {
        var structure = structs[name];
        if (structure.energy != undefined && structure.energy > 0) {
            totalEnergy += structure.energy;
        }
    }
    return totalEnergy;
};

/** Function to generate a enumerated list of creeps
 * @param list Array
 * @param num Integer
 * @param job String
 *  **/
let generateCreeps = function(list, num, job) {
    for(let i = 0; i < num; i++) {
        list[i] = job + i;
    }
};

/** Executes creeps routines **/
/** @param Game **/
let runCreeps = function(Game, roomName) {

    /** Total energy from room **/
    let totalEnergy = getTotalEnergy(Game, roomName);
    let harvesterCost = roleAssist.calculate_creep_cost(roleHarvester.parts);

    for(let name in Game.creeps) {
        let creep = Game.creeps[name];


        /** Run based on classes **/
        if(~name.indexOf("Harvester")) {
            roleHarvester.run(creep, totalEnergy, harvesterCost);
        }

        if(~name.indexOf("Upgrader")) {
            roleUpgrader.run(creep);
        }

        if(~name.indexOf("Transporter")) {
            roleTransporter.run(creep);
        }

    }
};

module.exports.loop = function() {

    /** Iterate over controlled game rooms **/
    for(let room_name in Game.rooms) {

        /** Execute creep routine **/
        runCreeps(Game, room_name);

        /** Count creeps from ROom **/


    }



};