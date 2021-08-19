from typing import Tuple
from .simulated_object import SimulatedObject
from PIL import Image
import json

class Projectile(SimulatedObject):
    def __init__(self, image: Image, coordnates: Tuple[int,int], velocity: int) -> None:
        self.velocity = velocity

        super().__init__(image,coordnates)

    def step(self, time) -> None:
        self.x += self.velocity * time * 10

class Bullet(Projectile):
    bullet_template = json.loads(open("AzurLaneSourceJson/EN/sharecfg/bullet_template.json").read())
    BULLET_MAP = {
        "Bullet1" : "bullet1",
        "BulletUK" : "bullet_uk"
    }

    def get_bullet_name(name):
        if name in Bullet.BULLET_MAP:
            return Bullet.BULLET_MAP[name]
        else:
            return name

    def __init__(self, bullet_id: int, coordnates: Tuple[int, int]) -> None:
        bullet = Bullet.bullet_template[str(bullet_id)]
        bullet_modle = Bullet.get_bullet_name(bullet["modle_ID"])

        img = Image.open(f"AzurLaneImages/assets/artresource/item/bulletcommon/{bullet_modle}.png")

        super().__init__(img, coordnates, bullet["velocity"])