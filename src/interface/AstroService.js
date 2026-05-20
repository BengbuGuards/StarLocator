import { MakeTime, Body, Equator, HourAngle, DefineStar, Observer } from 'astronomy-engine';
import { starZH2EN } from './starZH2EN.js';

const solarBodies = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

export function dot(v1, v2) {
    return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
}

export function norm(v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

export function vectorAngle(v1, v2) {
    const cosTheta = dot(v1, v2) / (norm(v1) * norm(v2));
    return Math.acos(Math.max(-1, Math.min(1, cosTheta)));
}

export function sph2cart(az, elev, r = 1) {
    const rcos = r * Math.cos(elev);
    const x = rcos * Math.cos(az);
    const y = rcos * Math.sin(az);
    const z = r * Math.sin(elev);
    return [x, y, z];
}

export function wrapAngleInDeg(deg) {
    while (deg > 180) deg -= 360;
    while (deg < -180) deg += 360;
    return deg;
}

function s2SiderealDays(s) {
    const sInSiderealDay = 86164.0905;
    return s / sInSiderealDay;
}

// 1. Resolve star name and fetch J2000 coordinates (RA/Dec) using Simbad API
export async function getRaDecByName(starName) {
    let operateName = starName;
    if (starZH2EN[operateName]) {
        operateName = starZH2EN[operateName];
    }
    operateName = operateName.toLowerCase();

    if (solarBodies.includes(operateName)) {
        return { isSolar: true, name: operateName };
    }

    const starNameBase64 = operateName.replace(/\s+/g, '+');
    const url = `https://simbad.u-strasbg.fr/simbad/sim-nameresolver?ident=${starNameBase64}&output=json&data=J&option=strict`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data && data.length > 0 && data[0].ra !== undefined) {
            const ra = data[0].ra / 15; // Convert RA from degrees to hours
            const dec = data[0].dec;
            return { isSolar: false, ra, dec };
        }
    } catch (e) {
        console.error('Simbad query failed:', starName, e);
    }
    return null;
}

// 2. Get Hour Angle and Declination by J2000 RA and Dec
export function getHaDecByRaDec(ra, dec, astTime, observer) {
    if (!observer) {
        observer = new Observer(0, 0, 0);
    }
    DefineStar(Body.Star1, ra, dec, 1000);
    const equOfDate = Equator(Body.Star1, astTime, observer, true, true);
    const hourAngle = HourAngle(Body.Star1, astTime, observer);
    return [hourAngle, equOfDate.dec];
}

// 3. Get Hour Angle and Declination for Solar System Bodies
export function getHaDecInSolar(starName, astTime, observer) {
    if (!observer) {
        observer = new Observer(0, 0, 0);
    }
    const bodyKey = starName.charAt(0).toUpperCase() + starName.slice(1).toLowerCase();
    const starBody = Body[bodyKey];
    const equOfDate = Equator(starBody, astTime, observer, true, true);
    const hourAngle = HourAngle(starBody, astTime, observer);
    return [hourAngle, equOfDate.dec];
}

// 4. Synchronous coordinate calculator (similar to Python's get_HaDecs_sync)
export function getHaDecsSync(starNames, timestamp, observer, preFetchedRaDecs) {
    const haDecs = {};
    const astTime = MakeTime(new Date(timestamp * 1000));

    for (const name of starNames) {
        let operateName = name;
        if (starZH2EN[operateName]) {
            operateName = starZH2EN[operateName];
        }
        operateName = operateName.toLowerCase();

        if (solarBodies.includes(operateName)) {
            haDecs[name] = getHaDecInSolar(operateName, astTime, observer);
        } else {
            const info = preFetchedRaDecs[name];
            if (info && info.ra !== undefined) {
                haDecs[name] = getHaDecByRaDec(info.ra, info.dec, astTime, observer);
            } else {
                haDecs[name] = [null, null];
            }
        }
    }

    let detail = 'success';
    for (const name of starNames) {
        if (haDecs[name][0] === null || haDecs[name][1] === null) {
            detail = `未能获取天体 '${name}' 的坐标信息，请检查拼写或稍后重试`;
            break;
        }
    }

    return [haDecs, detail];
}

// 5. One-dimensional optimization function using ternary search
function minimize(func, lowerBound, upperBound, tolerance = 1e-6, maxIter = 100) {
    let lower = lowerBound;
    let upper = upperBound;
    for (let i = 0; i < maxIter; i++) {
        const delta = (upper - lower) / 3;
        const midLeft = lower + delta;
        const midRight = upper - delta;

        const sum1 = func(midLeft);
        const sum2 = func(midRight);

        if (sum1 < sum2) {
            upper = midRight;
        } else {
            lower = midLeft;
        }

        if (Math.abs(upper - lower) < tolerance) break;
    }
    return (lower + upper) / 2;
}

// 6. Calculate total angular error for a candidate timestamp (corresponds to Python's angle_error)
function angleError(timestamp, approxTimestamp, starNames, geoEstimate, moonIdx, targetAngles, preFetchedRaDecs) {
    const elapsedSeconds = timestamp - approxTimestamp;
    let observerLon = (geoEstimate.lon * 180) / Math.PI - s2SiderealDays(elapsedSeconds) * 360;
    observerLon = wrapAngleInDeg(observerLon);

    const observer = new Observer((geoEstimate.lat * 180) / Math.PI, observerLon, 0);
    const [starHaDecs] = getHaDecsSync(starNames, timestamp, observer, preFetchedRaDecs);

    const moonHaDec = starHaDecs[starNames[moonIdx]];
    if (!moonHaDec || moonHaDec[0] === null || moonHaDec[1] === null) return Infinity;

    const moonVec = sph2cart((moonHaDec[0] * 15 * Math.PI) / 180, (moonHaDec[1] * Math.PI) / 180);

    let error = 0;
    for (let i = 0; i < starNames.length; i++) {
        if (i === moonIdx) continue;
        const starHaDec = starHaDecs[starNames[i]];
        if (!starHaDec || starHaDec[0] === null || starHaDec[1] === null) return Infinity;

        const starVec = sph2cart((starHaDec[0] * 15 * Math.PI) / 180, (starHaDec[1] * Math.PI) / 180);
        const angle = vectorAngle(starVec, moonVec);
        const diffInDeg = ((angle - targetAngles[i]) * 180) / Math.PI;
        error += diffInDeg * diffInDeg;
    }
    return error;
}

// 7. Find best capture time by optimization
export async function optimizeMoonTime(
    approxTimestamp,
    scopeDays,
    starNames,
    geoEstimate,
    moonIdx,
    targetAngles,
    preFetchedRaDecs
) {
    const sPerDay = 86400;
    const minTime = approxTimestamp - (scopeDays * sPerDay) / 2;
    const maxTime = approxTimestamp + (scopeDays * sPerDay) / 2;
    let minError = Infinity;
    let optTime = approxTimestamp;

    const optFunc = (ts) =>
        angleError(ts, approxTimestamp, starNames, geoEstimate, moonIdx, targetAngles, preFetchedRaDecs);

    const interval = 20 * sPerDay;
    for (let leftI = minTime; leftI < maxTime; leftI += interval) {
        const rightI = Math.min(leftI + interval, maxTime);
        const optTimeSingle = minimize(optFunc, leftI, rightI, 1, 100);
        const timeError = optFunc(optTimeSingle);
        if (timeError < minError) {
            minError = timeError;
            optTime = optTimeSingle;
        }
    }
    return optTime;
}
