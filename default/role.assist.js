
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
    }
}


module.exports = roleAssist;