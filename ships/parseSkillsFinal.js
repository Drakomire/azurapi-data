const fs = require('fs');
const path = require('path');

let ships = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "dist","ships","ships.json")).toString());
let buffs = JSON.parse(fs.readFileSync(path.join(__dirname, "..","dist","ships","buffs.json")).toString());
let skills = JSON.parse(fs.readFileSync(path.join(__dirname, "..","dist","ships","skillsVerbose.json")).toString());

class Skill{
  constructor(ship,number){
    this.skillID = ships[ship].skill_ids[number];
    this.buff = buffs[this.skillID];
  }

  getSkill(level){
    //Levels are inputted as 1-10 but are expected as 1-9
    level-=1;
    let buff = this.buff[level];
    let out = [];
    this.effects = [];
    for (let effect of buff){
      out.push(this.getSkillEffect(effect,level));
    }
    return [].concat(...out);
  }

  //Test if the effect has a skill in it
  getSkillEffect(effect,level){
    effect.arg_list.loop_time = effect.arg_list.time;
    switch (effect.type){
      case "BattleBuffCastSkill":
        return this.parseSkill(skills[effect.arg_list.skill_id],level,effect.trigger,effect.arg_list);
      break;
      case "BattleBuffAddBuff":
        return this.addBuff(buffs[effect.arg_list.buff_id],level,effect.trigger,effect.arg_list);
      break;

      default:
        //Unhandled for now.
        //This is an error
        return "ERR";
      break;
    }

  }

  parseSkill(skill,level,trigger,args){
    let out = [];
    for (let effect of skill[level]){
      let finalArgs = Object.assign({}, args, effect.arg_list);
      if (effect.type == "BattleSkillAddBuff"){
        //Regular skill
        out.push(this.getFinalBuff(buffs[effect.arg_list.buff_id],level,trigger,effect.target_choise,finalArgs));
      }
      else if (effect.type == "BattleSkillFire"){
        //Barrages
        out.push(this.parseBarrage(effect,finalArgs));

      }

    }


    return [].concat(...out);

  }

  addBuff(buff,level,trigger,args){
    let effects = buff[level];
    let out = [];
    for (let effect of effects){
      let skill_id = effect.arg_list.skill_id;
      let finalArgs = Object.assign({}, args, effect.arg_list);
      let res = this.parseSkill(skills[skill_id],level,effect.trigger,finalArgs);
      out.push(res);
    }

    return [].concat(...out);
  }

  getFinalBuff(buff,level,trigger,target,args){
    //Remove skill and buff keys
    delete args.skill_id
    delete args.buff_id

    //Incase time is in a higher level, delete it.
    //Lower level time is the one you want.
    delete args.time

    let final = buff[level]
    for (let key in final){
      let effect = final[key];
      effect["trigger"] = trigger;
      effect["target"] = target;


      //Assign the higher level args to the lower level args
      Object.assign(effect.arg_list,args);
      effect.arg_list.duration = effect.arg_list.time;

      //Replace "rant" argument with "chance"
      //I think this is a lot more readable
      if (effect.arg_list.rant !== undefined){
        effect.arg_list.chance = effect.arg_list.rant;
        delete effect.arg_list.rant;
      }

      //Delete second occourance of target since it should show up twice
      delete effect.arg_list.target;

      if (typeof effect.target == "string"){
          effect.target = [effect.target];
      }

      //Delete time
      delete effect.arg_list.time;

      //Devide by 10000 to put ratios into percent
      //This is for readability
      if (effect.type == "BattleBuffAddAttrRatio"){
        effect.arg_list.number/=10000;
      }
    }

    return final;




  }

  parseBarrage(effect,args){

    let barrage = {
      "target" : effect.target_choise,
      "arg_list" : Object.assign(effect.arg_list,args),
      "type" : "BattleSkillFire",
    };

    //Rename weapon_id
    barrage.arg_list.barrage_id = barrage.arg_list.weapon_id;
    delete barrage.arg_list.weapon_id;

    //Rename rant
    if (effect.arg_list.rant !== undefined){
      barrage.arg_list.chance = barrage.arg_list.rant;
      delete barrage.arg_list.rant;
    }

    if (typeof barrage.target == "string"){
      barrage.target = [barrage.target];
    }


    return barrage;


  }


}


// // let s = new Skill(10517,0);
// let s = new Skill(10517,3);
// // let s = new Skill(39904,2);
//
// // let s = new Skill(20509,1);.
// // s.getSkill(10)
// console.log(JSON.stringify(s.getSkill(10),null,'  '))


function run(){
  let compiled = {};
  for (ship in ships){
    ship = ships[ship];

    let skills = ship.skill_ids;


    shipSkills = [];

    for (let i in skills){
      let s = new Skill(ship.id,i);
      levels = [];
      for (let i = 0; i<10; i++){
        try{
          levels.push(s.getSkill(i+1));

        }catch{
          levels.push("");
        }
      }
      shipSkills.push(levels);
    }
    compiled[ship.id] = shipSkills;
  }

  fs.writeFileSync(path.join(__dirname, "../dist/ships/skills.json"), JSON.stringify(compiled,null,'\t'));
  fs.unlinkSync(path.join(__dirname, "..","dist","ships","buffs.json"))
  fs.unlinkSync(path.join(__dirname, "..","dist","ships","skillsVerbose.json"))

}

module.exports = {run};


//Nagato
//30505
