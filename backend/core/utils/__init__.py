def wrap_angle_in_deg(deg: float) -> float:
    """
    Make the angle in [-180, 180].
    """
    while deg > 180:
        deg -= 360
    while deg < -180:
        deg += 360
    return deg
