const fs = require('fs');
const path = require('path');

let ships = JSON.parse(fs.readFileSync(path.join(__dirname, "dist","ships.json")).toString());
let buffs = JSON.parse(fs.readFileSync(path.join(__dirname, "dist","buffs.json")).toString());
let skills = JSON.parse(fs.readFileSync(path.join(__dirname, "dist","skills.json")).toString());

class Skill{
  constructor(ship,number){
    this.skillID = ships[`${ship}`].skill_ids[number];
    this.buff = buffs[this.skillID];
  }

  getSkill(level){
    //Levels are inputted as 1-10 but are expected as 1-9
    level-=1;
    let buff = this.buff[level-1];
    let out = [];
    this.effects = [];
    for (let effect of buff){
      out.push(this.getSkillEffect(effect,level));
    }
    return out;
  }

  //Test if the effect has a skill in it
  getSkillEffect(effect,level){

    switch (effect.type){
      case "BattleBuffCastSkill":
        return this.parseSkill(skills[effect.arg_list.skill_id],level,effect.trigger);
      break;
      case "BattleBuffAddBuff":

      break;
    }

  }

  parseSkill(skill,level,trigger){
    let out = [];
    for (let effect of skill[level]){
      out.push(this.getFinalBuff(buffs[effect.arg_list.buff_id],level,trigger,effect.target_choise));
    }

    return [].concat(...out);

  }

  getFinalBuff(buff,level,trigger,target){

    let final = buff[level]
    for (let key in final){
      let effect = final[key];
      effect["trigger"] = trigger;
      effect["target"] = target;

      //Devide by 10000 to put ratios into percent
      //This is for readability
      if (effect.type == "BattleBuffAddAttrRatio"){
        effect.arg_list.number/=10000;
      }
    }

    return final;




  }
}


let s = new Skill(30505,0);
// s.getSkill(10)
console.log(JSON.stringify(s.getSkill(10),null,'  '))
