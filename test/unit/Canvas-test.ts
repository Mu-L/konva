import { assert } from 'chai';
import { addStage, Konva, countCalls } from './test-utils.ts';
import { SceneCanvas } from '../../src/Canvas.ts';

describe('Canvas', function () {
  // ======================================================
  it('pixel ratio', function () {
    var stage = addStage();

    var layer = new Konva.Layer();

    var circle = new Konva.Circle({
      x: 100,
      y: 70,
      radius: 70,
      fill: 'green',
      stroke: 'blue',
      strokeWidth: 4,
      draggable: true,
    });

    layer.add(circle);
    stage.add(layer);

    stage.width(578 / 2);
    stage.height(100);

    stage.draw();
    assert.equal(layer.getCanvas().getPixelRatio(), Konva.pixelRatio);

    layer.getCanvas().setPixelRatio(1);
    assert.equal(layer.getCanvas().getPixelRatio(), 1);
    assert.equal(layer.getCanvas().width, 289);
    assert.equal(layer.getCanvas().height, 100);

    layer.getCanvas().setPixelRatio(2);
    assert.equal(layer.getCanvas().getPixelRatio(), 2);
    assert.equal(layer.getCanvas().width, 578);
    assert.equal(layer.getCanvas().height, 200);

    layer.draw();
  });

  it('setSize() sizes the bitmap and scales the context once', function () {
    var canvas = new SceneCanvas({ width: 10, height: 10, pixelRatio: 2 });
    const scales = countCalls(canvas.getContext()._context, 'scale', () => {
      canvas.setSize(100, 50);
    });

    assert.equal(canvas.width, 200);
    assert.equal(canvas.height, 100);
    assert.equal(canvas._canvas.width, 200);
    assert.equal(canvas._canvas.height, 100);
    assert.equal(canvas._canvas.style.width, '100px');
    assert.equal(canvas._canvas.style.height, '50px');
    assert.equal(scales, 1);
  });
});
