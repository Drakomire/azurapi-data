from abc import ABC, abstractmethod
from typing import Tuple
from PIL import Image

class SimulatedObject(ABC):
    def __init__(self, image: Image, coordnates: Tuple[int,int]) -> None:
        self.image = image
        self.x = coordnates[0]
        self.y = coordnates[1]

        super().__init__()

    @abstractmethod
    def step(self, time) -> None:
        pass