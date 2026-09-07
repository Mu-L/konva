function equal(val1, val2, message) {
  if (val1 !== val2) {
    throw new Error('Not passed: ' + message);
  }
}

// try to import only core from the built lib, through the exports map
import Konva from 'konva/lib/Core.js';
import 'konva/canvas-backend';
import { Rect } from 'konva/lib/shapes/Rect.js';

equal(Rect !== undefined, true, 'Rect is defined');

equal(Konva.Rect, Rect, 'Rect is injected');

// just do a simple action
const stage = new Konva.Stage();
stage.toDataURL();
