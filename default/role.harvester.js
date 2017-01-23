/**
 * Created by shemhazai on 1/21/17.
 */


Array.min = function ( array ) {
    return Math.min.apply(Math, array );
}

Array.max = function( array ) {
    return Math.max.apply(Math, array);
}

/** @param {Source} active sources**/
var quickestRoute = function(creep, sources)
{
    /** If only one source, go to it. **/
    let num_sources = sources.length;
    if(num_sources == 1) {
        return sources[0];
    }

    /** Check distances **/
    var distance_1 = creep.pos.getRangeTo(sources[0]);
    var distance_2 = creep.pos.getRangeTo(sources[1]);

    /** Check energy amount of sources **/
    var full_source_01 = sources[0].energy < sources[0].energyCapacity;
    var full_source_02 = sources[1].energy < sources[1].energyCapacity;

    /** This ensures all sources are going to be harvested! **/
    if(full_source_01 && !full_source_02) {
        return sources[1];
    }

    /** Choose another energy source to balance consumption of energy resources **/
    if(sources[1].energy > sources[0].energy && distance_1 != 1) {
        return sources[1];
    }


    if(distance_1 < distance_2) {
        return sources[0];
    } else {
        return sources[1];
    }
}

var goTo = function(creep, target) {
    var path = creep.pos.findPathTo(target, {maxOps: 200});
    if(path.length) {
        creep.move(path[0].direction);
    }
}

/** @param {Structure} structure **/
var checkRepair = function(struct)
{
    if(struct.hits < struct.hitsMax / 2) {
        return true;
    } else {
        return false;
    }
}

/** @param {Creep} creep **/
var repairProcedure = function(creep) {
    var repairs = creep.room.find(FIND_MY_STRUCTURES);
    for(var i in repairs) {
        var target = repairs[i];
        if(checkRepair(target)) {
            if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        return true;
        }
    }
    return false;
}


var roleHarvester = {
  /** @param {Creep} creep **/

  run: function(creep)
  {
      /** Defines the spawn point **/
      var spawnPoint = Game.spawns['Spawn1'];
      if(spawnPoint == undefined) {
          console.log("[!] Error @harvester.js: could not set spawn point.");
      }

      /** Define a variable to contain spawnPoint energy **/
      var total_energy = spawnPoint.energy;


      /** Define a working state **/
      if(creep.memory.working && creep.carry.energy == 0) {
          creep.memory.working = false;
      }

      if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
          creep.memory.working = true;
      }


      if(!creep.memory.working) {

          /** Gets all sources from ROOM **/
          var sources = creep.room.find(FIND_SOURCES_ACTIVE);
          var target = quickestRoute(creep, sources);

          /** Priority to NEAR decaying energy **/
          var dropped = creep.room.find(FIND_DROPPED_ENERGY);
          var dropped_isNear = (creep.pos.getRangeTo(dropped[0]) < creep.pos.getRangeTo(target))

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

      } else {

          /** Code giving priority to repairing procedures **/
          if(repairProcedure(creep)) {
              return 0;
          }

          /** If there are not any constructions sites **/
          var constructs = creep.room.find(FIND_CONSTRUCTION_SITES);
          let num_constructs = constructs.length;

          /** Only build when spawnPoint is full of energy **/
          if(num_constructs > 0 && total_energy == spawnPoint.energyCapacity) {
              let target = constructs[0];
              if(creep.pos.inRangeTo(target, 1)) {
                  creep.build(target);
              } else {
                  goTo(creep, target);
              }
          } else {

              /** Priority to deposits like Extensions, Storages and Containers **/
              var structs = creep.room.find(FIND_MY_STRUCTURES);
              for(var x in structs) {
                  var structure = structs[x];
                  if(structure.energyCapacity > structure.energy) {
                      if(creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                          goTo(creep, structure);
                      }
                      return 0;
                  }

              }

              /** Move and deposit energy **/
              if(creep.transfer(spawnPoint, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                  //creep.say("Returning ...")
                  goTo(creep, spawnPoint);
                  //creep.moveTo(target);
              }
          }



          /** To drop the energy instead of returning it. **/
          //creep.drop(RESOURCE_ENERGY, creep.carry.energy);

      }
  }

};

module.exports = roleHarvester;

/**let sources = creep.room.find(FIND_SOURCES_ACTIVE);

 let target;
 let switchSource = _.random(0, 4) == 0;
 if(Source.sourcePriority(sources[1]) > Source.sourcePriority(sources[0])) {
              if(switchSource) {
                  target = sources[0];
              } else {
                  target = sources[1];
              }
          } else {
              if(switchSource) {
                  target = sources[1];
              } else {
                  target = sources[0];
              }
          }

 if(creep.harvest(target) == ERR_NOT_IN_RANGE) {
              creep.moveTo(target);
              creep.say("Moving to target ...")
          } else {
              creep.say("Mining ...")
          }**/