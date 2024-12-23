import astronomy as ast
from datetime import datetime


def stamp2ast_time(timestamp):
    """
    Convert the timestamp to astropy time.
    """
    return ast.Time(
        (
            datetime.fromtimestamp(timestamp) - datetime.fromtimestamp(946728000)
        ).total_seconds()
        / 86400
    )
