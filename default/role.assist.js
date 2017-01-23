
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

    spawnProcedure: function(worker_list, worker_name, role, parts, spawnPoint)
    {
        var cost = this.calculate_creep_cost(parts);
        var total_energy = 0;

        var structures = Game.rooms['W2N5'].find(FIND_MY_STRUCTURES);
        for(var name in structures) {
            var target = structures[name];
            if(target.energy > 0) {
                total_energy += target.energy;
            }
        }

        /** Check costs **/
        if(cost > total_energy) {
            var missing_energy = cost - spawnPoint.energy;
            console.log("[!] It is missing " + missing_energy + " energy to spawn one more " + role + ".");
            return -1;
        }

        /** Check if in lists **/
        if(!worker_list.includes(worker_name)) {
            return -1;
        }

        spawnPoint.createCreep(parts, worker_name);
        console.log("[+] Spawned a " + role + " named " + worker_name);
        return 0;
    }
}


module.exports = roleAssist;