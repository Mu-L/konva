// the package resolves itself through its exports map, like a consumer would
const Konva = require('konva').default;
require('konva/canvas-backend');

// just do a simple action
const stage = new Konva.Stage();
stage.toDataURL();
