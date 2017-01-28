let cache = require('role.cache');
let roleEnergizer = require('role.energizer');
let roleHarvester = require('role.harvester');
let roleUpgrader = require('role.upgrader');
let roleBuilder = require('role.builder');
let roleTransporter = require('role.transporter');
let roleAssist = require('role.assist');
let roleWarrior = require('role.warrior');
let roleVoyager = require('role.voyager');
let roleConqueror = require('role.conqueror');
var roleRemoteBuilder = require('role.remote.builder');

/** Function to get the total number of energy available through all structures present in the room.
 * @param Game Object
 * @param roomName String
 * **/
let getTotalEnergy = function (Game, roomName) {
    let cacheTimeout = 8;
    let totalEnergy = 0;
    let roomObject = Game.rooms[roomName];
    if(roomObject == null) {
        return false;
    }

    /** Store energy storage information into cache **/
    if(roomObject.memory.cached_structures == undefined || roomObject.memory.cache_timeout % cacheTimeout == 0) {
        let energyStores = Game.rooms[roomName].find(FIND_MY_STRUCTURES, {
            filter: (s) => s.structureType != STRUCTURE_TOWER && s.energy > 0
        });
        roomObject.memory.cached_structures = cache.storeObjects(energyStores);
    }

    let structs = cache.retrieveObjects(roomObject.memory.cached_structures);

    for (let name in structs) {
        let structure = structs[name];
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

/** Executes creeps routines and returns the number of creeps **/
/** @param Game **/
runCreeps = function (Game, roomName) {

    /** Total energy from room **/

    let WORKERS = [];
    let totalEnergy = getTotalEnergy(Game, roomName);
    let harvesterCost = roleAssist.calculate_creep_cost(roleHarvester.parts);
    let number_of_creeps = 0;

    for (let name in Game.creeps) {
        let creep = Game.creeps[name];
        WORKERS[number_of_creeps] = name;
        if(creep.room.name == roomName) {
            number_of_creeps++;
        }


        /** Run based on classes **/
        if (~name.indexOf("Transporter")) {
            roleTransporter.run(creep);
        }

        if (~name.indexOf("Harvester")) {
            roleHarvester.run(creep, totalEnergy, harvesterCost);
        }

        if (~name.indexOf("Upgrader")) {
            roleUpgrader.run(creep);
        }

        if(~name.indexOf("Energizer")) {
            roleEnergizer.run(creep);
        }

        if(~name.indexOf("Builder")) {
            roleBuilder.run(creep);
        }

        if(~name.indexOf("Warrior")) {
            roleWarrior.run(creep);
        }

        if(~name.indexOf("Voyager")) {
            roleVoyager.run(creep);
        }

        if(~name.indexOf("Conqueror")) {
            roleConqueror.run(creep);
        }

        if(~name.indexOf("RemoteBuild")) {
            roleRemoteBuilder.run(creep);
        }

    }

    return [number_of_creeps, WORKERS];
};

let concatenateLists = function(listOfLists) {
    MASTER_LIST = [];
    for(let list in listOfLists) {
        let content = listOfLists[list];
        MASTER_LIST = MASTER_LIST.concat(content);
    }
    return MASTER_LIST;
};

let planDefense = function (room) {
  let hostiles = room.find(FIND_HOSTILE_CREEPS);
  let numUnits = 0;
  if(hostiles.length == 0) {
      return false;
  }


  /** Defend the base attacking invaders with turrets **/
  let turrets = room.find(FIND_MY_STRUCTURES, {
      filter: (s) => s.structureType == STRUCTURE_TOWER && s.energy > 0
  });




  for(let _t in turrets) {
      let turret = turrets[_t];
      let nearestEnemy = turret.pos.findClosestByPath(hostiles);
      if(turret.attack(nearestEnemy)) {
          console.log("[+] Turret is attacking invaders!");
      }
  }


  /** Issue warriors to defend the base **/
  for(let host in hostiles) {
      let hostile = hostiles[host];

      if(hostile.hits > roleWarrior.getMaximumHits()) {
          numUnits += (hostile.hits / roleWarrior.getMaximumHits()) - 1;
      } else {
          numUnits += 1
      }


  }


  return generateCreeps(WARRIOR_LIST, numUnits, "Warrior");
};

let getWorkerBlueprint = function(room) {
    BUILDER_LIST = [];
    ENERGIZER_LIST = [];
    HARVESTER_LIST = [];
    UPGRADER_LIST = [];
    TRANSPORTER_LIST = [];
    WARRIOR_LIST = [];
    VOYAGER_LIST = [];
    CONQUEROR_LIST = [];
    REMOTEB_LIST = [];
    ALL_LISTS = [BUILDER_LIST, ENERGIZER_LIST, HARVESTER_LIST, UPGRADER_LIST, TRANSPORTER_LIST, WARRIOR_LIST, VOYAGER_LIST, CONQUEROR_LIST, REMOTEB_LIST];

    /** Control your room workers here **/
    if(room == "W2N5") {
        generateCreeps(ENERGIZER_LIST, 2, 'Energizer');
        generateCreeps(BUILDER_LIST, 1, 'Builder');
        generateCreeps(TRANSPORTER_LIST, 2, "Transporter");
        generateCreeps(UPGRADER_LIST, 2, 'Upgrader');
        //generateCreeps(VOYAGER_LIST, 1, "Voyager");
        generateCreeps(REMOTEB_LIST, 1, "RemoteBuild");
        planDefense(Game.rooms[room]);
    }

    /** Another room working blueprint here **/
    return concatenateLists(ALL_LISTS);

};

let differenceOfSets = function(set1, set2) {
  return set1.filter(function(x) { return set2.indexOf(x) < 0});;
};


let spawnMissing = function(MASTER_LIST, creepName, spawnPoint) {


    if(~creepName.indexOf("Energizer")) {
        return roleAssist.spawnProcedure(MASTER_LIST, creepName, "energizer", roleEnergizer.parts, spawnPoint);
    }

    if(~creepName.indexOf("Harvester")) {
        return roleAssist.spawnProcedure(MASTER_LIST, creepName, "harvester", roleHarvester.parts, spawnPoint);
    }

    if(~creepName.indexOf("Transporter")) {
        return roleAssist.spawnProcedure(MASTER_LIST, creepName, "transporter", roleTransporter.parts, spawnPoint);
    }

    if(~creepName.indexOf("Upgrader")) {
        return roleAssist.spawnProcedure(MASTER_LIST, creepName, "upgrader", roleUpgrader.parts, spawnPoint);
    }

    if(~creepName.indexOf("Builder")) {
        return roleAssist.spawnProcedure(MASTER_LIST, creepName, "builder", roleBuilder.parts, spawnPoint);
    }

    if(~creepName.indexOf("Warrior")) {
        return roleAssist.spawnProcedure(MASTER_LIST, creepName, "warrior", roleWarrior.parts, spawnPoint);
    }

    if(~creepName.indexOf("Voyager")) {
        return roleAssist.spawnProcedure(MASTER_LIST, creepName, "voyager", roleVoyager.parts, spawnPoint);
    }

    if(~creepName.indexOf("RemoteBuild")) {
        return roleAssist.spawnProcedure(MASTER_LIST, creepName, "remote builder", roleRemoteBuilder.parts, spawnPoint);
    }


    return true;
};

let towerRepair = function(room) {

  let cacheTimeout = 8;
  /** Defend only if there are no threats **/
  let hostiles = room.find(FIND_HOSTILE_CREEPS);
  if(hostiles.length > 0) {
      return false;
  }

  /** Wall / Rampart hitpoints **/
  let maximumHitPoints = 120000;

  /** Cache turrets id into Memory **/
  if(room.memory.cached_turrets == null || room.memory.cache_timeout % 32 == 0) {
      room.memory.cached_turrets = [];
      let turrets = room.find(FIND_MY_STRUCTURES, {
          filter: s => s.structureType == STRUCTURE_TOWER && s.energy > s.energyCapacity / 2
      });
      for(let i = 0; i < turrets.length; i++) {
          room.memory.cached_turrets[i] = turrets[i].id;
      }
  }

  let turrets = [];
  for(let i = 0; i < room.memory.cached_turrets.length; i++) {
      turrets[i] = Game.getObjectById(room.memory.cached_turrets[i]);
  }


  /** No available turrets to repairing jobs **/
  if(turrets.length == 0) {
      return false;
  }

  /** Store objects ID into cache **/
  if(room.memory.cached_damagedBuildings.length == null || room.memory.cache_timeout % cacheTimeout == 0) {
      room.memory.cached_damagedBuildings = [];
      let damagedBuildings = room.find(FIND_STRUCTURES, {
          filter: (s) => (s.hits < s.hitsMax / 2) && s.hits < maximumHitPoints
      });

      for(let i = 0; i < damagedBuildings.length; i++) {
          room.memory.cached_damagedBuildings[i] = damagedBuildings[i].id;
      }

  }

  /** Load objects using cache **/
  let damagedBuildings = [];
  for(let i = 0; i < room.memory.cached_damagedBuildings.length; i++) {
      damagedBuildings[i] = Game.getObjectById(room.memory.cached_damagedBuildings[i]);
  }

  /** There are no damaged buildings to repair! **/
  if(damagedBuildings[0] == null || damagedBuildings[0].hits > maximumHitPoints) {
      return false;
  }


  for(let _t in turrets) {
      let turret = turrets[_t];
      if(turret.repair(damagedBuildings[0]) != OK) {
          console.log("[!] Tower could not repair building " + damagedBuildings[0]);
      }
  }

  return true;
};

module.exports.loop = function() {

    Memory.report_index += 1;
    /** Iterate over controlled game rooms **/
    for(let room_name in Game.rooms) {

        /** Define the room Object and set a Cache-timeout **/
        let roomObject = Game.rooms[room_name];
        roomObject.memory.cache_timeout += 1;

        let roomEnergy = getTotalEnergy(Game, room_name);
        let spawnPoint = Game.spawns['Spawn1'];
        let number_of_creeps = 0;

        let MASTER_LIST = [];
        let WORKERS = [];
        let INFO_LIST = [];

        /** Get the number of creeps and current creeps alive **/
        INFO_LIST = runCreeps(Game, room_name);
        number_of_creeps = INFO_LIST[0];

        /** As it is and should be list **/
        WORKERS = INFO_LIST[1];

        /** Cache MASTER LIST into memory **/
        if(roomObject.memory.MASTER_LIST == undefined || roomObject.memory.cache_timeout % 2 == 0) {
            roomObject.memory.MASTER_LIST = getWorkerBlueprint(room_name);
        }
        MASTER_LIST = roomObject.memory.MASTER_LIST;

        /** Save the kingdom! **/
        if(WORKERS.length == 0) {
            let minimalParts = [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY];
            if(spawnPoint.canCreateCreep(minimalParts)) {
                spawnPoint.createCreep(minimalParts, "TransporterSavior");
            }
        }

        /** Calculate missing **/
        let missingWorkers = differenceOfSets(MASTER_LIST, WORKERS);

        /** Remote repairing **/
        towerRepair(Game.rooms[room_name]);

        /** Log information to the console from time to time**/
        roomObject.memory.report_index += 1;
        if(roomObject.memory.report_index % 16 == 0) {
            console.log("Room " + room_name + " have " + WORKERS.length + "/" + MASTER_LIST.length + " workers and " + roomEnergy + " energy.");
        }


        //If is okay, continue to next room
        if(missingWorkers.length == 0) {
            continue;
        }


        for(let name in missingWorkers) {
            let creepName = missingWorkers[name];
            if(spawnMissing(MASTER_LIST, creepName, spawnPoint)) {
                console.log("spawnMissing: Error spawning " + creepName);
            }
        }

    }


    if(Memory.report_index % 16 == 0) {
        console.log("CPU Bucket: " + Game.cpu.bucket);
    }




};