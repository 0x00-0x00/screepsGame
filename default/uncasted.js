/** This ensures survival of Harvesters using stored energy into spawning **/
if(totalEnergy < minimumCost) {
    if(!retrieveEnergyFromContainer(creep)) {
        console.log("[!] Containers are empty.");
    }
}
/** Gets all sources from ROOM **/
let sources = creep.room.find(FIND_SOURCES_ACTIVE);
let target = quickestRoute(creep, sources);

/** Priority to NEAR decaying energy **/
let dropped = creep.room.find(FIND_DROPPED_ENERGY);
let dropped_isNear = (creep.pos.getRangeTo(dropped[0]) < creep.pos.getRangeTo(target));

if(dropped.length > 0  && dropped_isNear) {
    let dropped_source = dropped[0];

    creep.say("Picking");
    if(creep.pickup(dropped_source) == ERR_NOT_IN_RANGE) {
        creep.moveTo(dropped_source);
    }

    return 0;
}


/** Moving and harvesting code **/

if(creep.harvest(target) == ERR_NOT_IN_RANGE) {
    goTo(creep, target);
    //creep.say("Moving");
} else {
    creep.say("Harvesting");
}

return 0;
