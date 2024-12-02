import numpy as np


def rand_range(a, b, size=None):
    return np.random.random(size=size) * (b - a) + a
