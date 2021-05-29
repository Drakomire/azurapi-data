const fs = require("fs");
const path = require("path");
const stringify = require("json-stringify-pretty-compact");

function readFilesFromLanguage(lang = "EN"){

  // let ships = JSON.parse(fs.readFileSync(path.join(".","dist", "ships.json")).toString());
  // for (let key in ships){
  //   let ship = ships[key];
  //   for (let skillID in ship.skill_ids){
  //     skillID = ship.skill_ids[skillID];
  //     try{
  //       compiled[`${skillID}`] = getBuff(skillID,lang);
  //
  //
  //     }catch(err){
  //       //Catch skills that aren't real
  //       //0 and 3 shows up for some reason
  //     }
  //   }
  // }

  fs.readdir(path.join(__dirname, "..", "AzurLaneSourceJson", lang, "buff"), (err, files) => {
    let compiled = {};
    for (let file of files){
      skillID = parseInt(file.replace("buff_","").replace(".json",""));
      try{
        compiled[skillID] = getBuff(skillID,lang);
      }catch(err){
      }
    };
    fs.writeFileSync(path.join(__dirname, "../dist/buffs.json"), stringify(compiled));
  });

  fs.readdir(path.join(__dirname, "..", "AzurLaneSourceJson", lang, "skill"), (err, files) => {
    let compiled = {};
    for (let file of files){
      skillID = parseInt(file.replace("skill_","").replace(".json",""));
      try{
        // console.log(skillID);
        compiled[skillID] = getSkill(skillID,lang);
      }catch(err){
        console.log(err);
      }
    };
    fs.writeFileSync(path.join(__dirname, "../dist/skillsVerbose.json"), stringify(compiled));
  });


}

function flatten(dict){
  //Generate the output Dictionary
  let arr = [];

  for (let key in dict){
    let skill = dict[key];
    if (parseInt(key) >= 1 && parseInt(key) <= 10){
      if (dict[key].length == 0){
        break;
      }

      //Skip if there isn't a skill type
      // if (dict[key].effect_list === undefined){
      //   break;
      // }

      arr.push(dict[key].effect_list);
    }
  }

  if (arr.length == 0){
    arr = new Array(10).fill(dict.effect_list);
  }

  //Add time to the skill if possible
  for (level of arr){
    for (effect of level){
      if (effect.arg_list.time === undefined && dict.time !== undefined){
        if (dict.time != 0){
          effect.arg_list.time = dict.time;
        }
      }
    }
  }

  return arr;
}

function getBuff(id,lang){
  out = {};
  let buff = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "AzurLaneSourceJson", lang, "buff", `buff_${id}.json`)).toString());

  var effects = flatten(buff);

  // console.log("here")
  //
  // //Buffs can either show up as final effects or starting things
  // //If they show up as a starter they will link to a skill
  // //Final effects will NOT link to a skill
  //
  // //Effect Dictionary
  // var effects = [];
  //
  // //@param effectList - "effect_list" section of buff JSON
  // //@param repeat - Whether or not fields should be repeated 10 times. Used for skills that don't
  // //Change with skill level.
  // var parseEffect = (effectList,repeat) => {
  //   for (i in effectList){
  //     effect = effectList[i];
  //     try{
  //       //The ID of the effect can be longer than the array
  //       if (i >= effects.length){
  //         effects.push({});
  //       }
  //
  //       //Add random chance argument if it exists
  //       if (effect.arg_list.rant != null){
  //         //Devide by 100% to get percent. This is how its shown in game
  //         //So I thought it would be better.
  //         if (repeat){
  //           try{
  //             effects[i].chance.push(effect.arg_list.rant/100);
  //           }catch{
  //             effects[i]['chance'] = [effect.arg_list.rant/100];
  //           }
  //         }else{
  //           effects[i]['chance'] = new Array(10).fill(effect.arg_list.rant/100);
  //         }
  //       }
  //
  //
  //       effectSwitch = (effect,lang) => {
  //         switch (effect.type){
  //           case "BattleBuffAddBuff":
  //             return getBuff(effect.arg_list.buff_id,lang);
  //           case "BattleBuffField":
  //             return getBuff(effect.arg_list.buff_id,lang);
  //           case "BattleBuffCastSkill":
  //             return getSkill(effect.arg_list.skill_id,lang);
  //           default:
  //             return effect.type;
  //         }
  //       }
  //
  //       // effects[i]['effects'] = effectSwitch(effect,lang);
  //       effects[i]['effects'] = effect;
  //
  //
  //       if (effect.trigger !== undefined)
  //         effects[i]['triggers'] = effect.trigger;
  //
  //
  //
  //
  //     }catch(err){
  //       // console.log(err);
  //
  //     }
  //   }
  // }
  //
  // //Check if skill has "rant" attribute. If it does, random
  // //Chance will be added to the output
  //
  //
  //
  // var parsed = false;
  // for (let key in buff){
  //   if (parseInt(key) >= 1 && parseInt(key) <= 10){
  //     //Check if the devs put an empty array in.
  //     //Skip and go to backup reading where it assumes
  //     //everything is at the bottom
  //     if (buff[key].length == 0){
  //       break;
  //     }
  //
  //     //Skip if there isn't a skill type
  //     if (buff[key].effect_list === undefined){
  //       break;
  //     }
  //
  //     parseEffect(buff[key].effect_list,true);
  //     parsed = true;
  //   }
  // }
  //
  // if (!parsed){
  //   parseEffect(buff.effect_list,false);
  // }

  return effects;

}

function getSkill(id,lang){
  effects = [];
  //Open the skill file
  let skill = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "AzurLaneSourceJson", lang, "skill", `skill_${id}.json`)).toString());


  var effects = flatten(skill);

  return effects;
}

function parseSkills() {
    readFilesFromLanguage("EN");
}

module.exports = {parseSkills};
