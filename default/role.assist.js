var lo = require('lodash');

var roleAssist = {
    /** Function to calculate how much energy a creep costs **/
    calculate_creep_cost: function (parts) {
        var cost = 0;
        for (var part in parts) {
            var part = parts[part];
            switch (part) {
                case WORK:
                    cost += 100;
                    break;

                case MOVE:
                    cost += 50;
                    break;

                case CARRY:
                    cost += 50;
                    break;

                case ATTACK:
                    cost += 80;
                    break;

                case RANGED_ATTACK:
                    cost += 150;
                    break;

                case HEAL:
                    cost += 250;
                    break;

                case CLAIM:
                    cost += 600;
                    break;

                case TOUGH:
                    cost += 10;
                    break;
            }
        }
        return cost;
    },

    spawnProcedure: function(worker_list, worker_name, parts, spawnPoint)
    {
        let cost = this.calculate_creep_cost(parts);
        let total_energy = 0;
        let roomObject = spawnPoint.room;

        let structures = roomObject.find(FIND_MY_STRUCTURES);
        for(let name in structures) {
            let target = structures[name];
            if(target.energy != undefined && target.energy > 0) {
                total_energy += target.energy;
            }
        }

        /** Check costs **/
        if(cost > total_energy) {
            let missing_energy = cost - total_energy;
            console.log("[!] It is missing " + missing_energy + " energy to spawn one more creep.");
            return -1;
        }

        /** Check if in lists **/
        if(!worker_list.includes(worker_name)) {
            return -1;
        }

        /** Check if creation is possible **/
        if(spawnPoint.canCreateCreep(parts, worker_name) != 0) {
            return 0;
        }

        /** createCreep returns string if successful **/
        if(lo.isString(spawnPoint.createCreep(parts, worker_name))) {
            console.log("[+] Spawned a creep named " + worker_name);
            Game.creeps[worker_name].memory.source_room = roomObject.name;
            return 0;
        } else {
            return -1;
        }


    }
}


module.exports = roleAssist;