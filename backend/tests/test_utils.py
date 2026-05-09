import numpy as np
import pytest
from core.positioning.top_point.utils.plane import two_line_intersection_point


def test_two_line_intersection_point():
    case1 = {
        "l1": [[1, 1], [2, 2]],
        "l2": [[1, 2], [2, 1]],
        "has_intersection": True,
        "intersection": [1.5, 1.5],
    }

    case2 = {
        "l1": [[1, 1], [2, 2]],
        "l2": [[3, 3], [4, 4]],
        "has_intersection": False,
        "intersection": [0, 0],
    }

    cases = [case1, case2]

    for case in cases:
        has_intersection, point = two_line_intersection_point(case["l1"], case["l2"])
        assert has_intersection == case["has_intersection"]
        if has_intersection:
            pytest.approx(point, np.array(case["intersection"]))
