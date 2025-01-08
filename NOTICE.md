This project uses the following open source projects and follows their respective license terms:

frontend:
- [Fabric](https://github.com/fabric/fabric)：Custom License
- [fuzzysort](https://github.com/farzher/fuzzysort): MIT License

backend:
- [numpy](https://numpy.org/): Custom License
- [scipy](https://scipy.org/): BSD 3-Clause License
- [fastapi](https://fastapi.tiangolo.com/): MIT License
- [uvicorn](https://www.uvicorn.org/): BSD 3-Clause license
- [python-multipart](https://github.com/Kludex/python-multipart): Apache-2.0 License
- [astronomy-engine](https://github.com/astronomy/astronomy)：MIT License
- [httpx](https://github.com/projectdiscovery/httpx): MIT License
- [async-lru](https://github.com/aio-libs/async-lru): MIT License
- [slowapi](https://github.com/laurents/slowapi): MIT License
- [sep](http://github.com/kbarbary/sep): LGPL-3.0 License
- [astropy](https://www.astropy.org/): BSD 3-Clause License
- [astrometry.net](https://astrometry.net): Custom License. The [client.py](./prototype/core/star_recognition/client.py) file of this project contains some content from astrometry and has been modified based on it, mainly integrating the star recognition function.

data:
- [SIMBAD](https://simbad.u-strasbg.fr/simbad/): This project has made use of the SIMBAD database, operated at CDS, Strasbourg, France
- [stellarium](https://github.com/Stellarium/stellarium): GPL-2.0 license. The [data.py](./prototype/core/astro_coord/data.py) and [starZH2EN.js](./src/interface/starZH2EN.js) files of this project contains some content from stellarium and has been modified based on it, mainly integrating the Chinese and English star name tables.