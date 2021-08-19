from simulation import Sim
from objects import Bullet
from spawner import Spawner

from PIL import Image


sim = Sim()

sim.add_weapon(Spawner(21600))

backdrop = Image.new(mode="RGBA",size=(1500,300),color=(15,15,15))

for i in range(20):
    sim.timestep(.02)


out = sim.render_simulation(backdrop)

out.show()