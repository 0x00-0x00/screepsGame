/**
 * Created by shemhazai on 1/21/17.
 */


Array.min = function ( array ) {
    return Math.min.apply(Math, array );
}

var roleHarvester = {
  /** @param {Creep} creep **/

  run: function(creep)
  {
      var spawnPoint = Game.spawns['Spawn1'];
      if(spawnPoint == undefined) {
          console.log("[!] Error @harvester.js: could not set spawn point.");
      }
      if(creep.carry.energy < creep.carryCapacity) {

          /** Gets all sources from ROOM and creates a set for distances **/
          var sources = creep.room.find(FIND_SOURCES);
          var distance = [];

          /** Calculate all the distances **/
          for(var x in sources) {
              var target = sources[x];
              var range = creep.pos.getRangeTo(target);
              distance[x] = range;
          }

          /** Identify the quickest source available **/
          var shortest_distance = Array.min(distance);
          for(var x in sources) {
              var target = sources[x];
              var range = creep.pos.getRangeTo(target);
              if(range == shortest_distance) {

                  /** Moving and harvesting code **/
                  if(creep.harvest(target) == ERR_NOT_IN_RANGE) {
                      creep.moveTo(target);
                  }

              }

          }
      } else {

          /** Move and deposit energy **/
          if(creep.transfer(spawnPoint, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
              creep.moveTo(spawnPoint);
          }
      }
  }

};

module.exports = roleHarvester;