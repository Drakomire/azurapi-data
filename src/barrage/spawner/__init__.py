import json
from typing import Generator, Tuple
from objects import Bullet

class Spawner:
    weapon_property_list = json.loads(open("AzurLaneSourceJson/EN/sharecfg/weapon_property.json").read())

    weapon_property = {}

    for weapon in weapon_property_list["subList"]:
        weapon_property.update(json.loads(open(f"AzurLaneSourceJson/EN/sharecfg/weapon_property_sublist/{weapon}.json").read()))

    def __init__(self, weapon_id) -> None:
        self.weapon = Spawner.weapon_property[str(weapon_id)]

    @property
    def weapons(self) -> Generator[Tuple[int, int], Tuple[int, int], None]:
        """
        :return: barrage, bullet
        """
        return zip(self.weapon["barrage_ID"], self.weapon["bullet_ID"])

class Barrage:
    barrage_template = json.loads(open("AzurLaneSourceJson/EN/sharecfg/barrage_template.json").read())

    def __init__(self, barrage, bullet_id) -> None:
        self.spawner = Barrage.barrage_template[str(barrage)]
        self.barrage = barrage
        self.bullet_id = bullet_id

        self.spawn_itterations = 0
        self.max_generations = self.spawner["senior_repeat"] + 1
        self.timer = self.spawner["delay"]
        self.init_spawned = False

    def spawn_bullet_generation(self,sim):
        layers = self.spawner["primal_repeat"]+1
        offset_z = self.spawner["offset_z"]
        delta_offset_z = self.spawner["delta_offset_z"]

        for i in range(layers):
            sim.spawn_bullet(Bullet(self.bullet_id, (0,delta_offset_z + offset_z*i)))

    def step(self, sim: "Sim", time: float) -> None:
        if self.timer <= 0:
            if (self.spawn_itterations >= self.max_generations):
                return

            self.spawn_bullet_generation(sim)
            self.timer = self.spawner["senior_delay"] + self.spawn_itterations * self.spawner["delta_delay"]
            self.spawn_itterations += 1

        
        self.timer -= time
