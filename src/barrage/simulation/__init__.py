from typing import Tuple
from enum import Enum, auto

from PIL import Image
import copy


from objects import SimulatedObject
from spawner import Spawner, Barrage

SCALE = 15

class Sim:
    def __init__(self) -> None:
        self.objects = []
        self.spawners = []

    def add_weapon(self, weapon: Spawner) -> None:
        for barrage,bullet in weapon.weapons:
            self.spawn_barrage(Barrage(barrage,bullet))

    def spawn_bullet(self,obj: SimulatedObject) -> None:
        self.objects += [obj]

    def spawn_barrage(self, obj: Barrage) -> None:
        self.spawners += [obj]

    def timestep(self,time: int):
        for obj in self.spawners:
            obj.step(self, time)

        for obj in self.objects:
            obj.step(time)

    def render_simulation(self, img: Image):
        width, height = img.size

        out_img = copy.deepcopy(img)

        for obj in self.objects:
            obj_w, obj_h = obj.image.size

            out_img.alpha_composite(obj.image,(int(obj.x*SCALE),int(obj.y*SCALE + height/2 - obj_h/2)))

        return out_img