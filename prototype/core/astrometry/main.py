from config import ASTROMETRY_API_KEY
from .client import ClientRunnerOptions, run_client


class AstrometryClient:
    def get_session():
        opts = ClientRunnerOptions(
            apikey=ASTROMETRY_API_KEY,
        )

    # python client.py -k kzcnelqxozglultq -u ../../../examples/examples.csv -w --image-width 3024 --image-height 4032 -p --scale-units degwidth --scale-lower 0.1 --scale-upper 180 --wcs result.wcs
