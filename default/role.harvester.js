/**
 * Created by shemhazai on 1/21/17.
 */

var roleHarvester = {
  /** @param {Creep} creep **/

  run: function(creep)
  {
      var spawnPoint = Game.spawns['Spawn1'];
      if(spawnPoint == undefined) {
          console.log("[!] Error @harvester.js: could not set spawn point.");
      }
      if(creep.carry.energy < creep.carryCapacity) {
          var sources = creep.room.find(FIND_SOURCES);
          if (creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
              creep.moveTo(sources[1]);
          }
      } else {
          if(creep.transfer(spawnPoint, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
              creep.moveTo(spawnPoint);
        }
      }
  }

};

module.exports = roleHarvester;