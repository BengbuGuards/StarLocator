import './css/site.css';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
/* This code is needed to properly load the images in the Leaflet CSS */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

import { InteractPhoto } from './interface/classes/interact.js';
import { EventManager } from './interface/classes/EventManager.js';

let interactPhoto = new InteractPhoto();
let eventManager = new EventManager(interactPhoto);
