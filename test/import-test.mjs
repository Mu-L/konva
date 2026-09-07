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

// the main entry has named exports too
import KonvaFull, { Konva as NamedKonva, Stage, Filters } from 'konva';
equal(KonvaFull, NamedKonva, 'default and named Konva are the same object');
equal(Stage, KonvaFull.Stage, 'Stage is a named export');
equal(Filters.Blur, KonvaFull.Filters.Blur, 'Filters is a named export');

// just do a simple action
const stage = new Konva.Stage();
stage.toDataURL();
