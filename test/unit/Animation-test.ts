import { assert } from 'chai';

import { addStage, Konva } from './test-utils.ts';

describe('Animation', function () {
  // ======================================================
  it('test start and stop', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var rect = new Konva.Rect({
      x: 200,
      y: 100,
      width: 100,
      height: 50,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
    });

    layer.add(rect);
    stage.add(layer);

    var amplitude = 150;
    var period = 1000;
    // in ms
    var centerX = stage.width() / 2 - 100 / 2;

    var anim = new Konva.Animation(function (frame) {
      rect.x(
        amplitude * Math.sin((frame.time * 2 * Math.PI) / period) + centerX
      );
    }, layer);
    var a = Konva.Animation.animations;
    var startLen = a.size;

    assert.equal(a.size, startLen, '1should be no animations running');

    anim.start();
    assert.equal(a.size, startLen + 1, '2should be 1 animation running');

    anim.stop();
    assert.equal(a.size, startLen, '3should be no animations running');

    anim.start();
    assert.equal(a.size, startLen + 1, '4should be 1 animation running');

    anim.start();
    assert.equal(a.size, startLen + 1, '5should be 1 animation runningg');

    anim.stop();
    assert.equal(a.size, startLen, '6should be no animations running');

    anim.stop();
    assert.equal(a.size, startLen, '7should be no animations running');
  });

  // ======================================================
  it('layer batch draw', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var rect = new Konva.Rect({
      x: 200,
      y: 100,
      width: 100,
      height: 50,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
    });

    layer.add(rect);
    stage.add(layer);

    var draws = 0;

    layer.on('draw', function () {
      //console.log('draw')
      draws++;
    });

    layer.draw();
    layer.draw();
    layer.draw();

    assert.equal(draws, 3, 'draw count should be 3');

    layer.batchDraw();
    layer.batchDraw();
    layer.batchDraw();

    assert.notEqual(draws, 6, 'should not be 6 draws');
  });

  // ======================================================
  it('stage batch draw', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var rect = new Konva.Rect({
      x: 200,
      y: 100,
      width: 100,
      height: 50,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
    });

    layer.add(rect);
    stage.add(layer);

    var draws = 0;

    layer.on('draw', function () {
      //console.log('draw')
      draws++;
    });

    stage.draw();
    stage.draw();
    stage.draw();

    assert.equal(draws, 3, 'draw count should be 3');

    stage.batchDraw();
    stage.batchDraw();
    stage.batchDraw();

    assert.notEqual(draws, 6, 'should not be 6 draws');
  });

  it('an animation that stops itself in its frame does not skip the next animation', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var secondFrames = 0;
    var first = new Konva.Animation(function () {
      first.stop();
    }, layer);
    var second = new Konva.Animation(function () {
      secondFrames += 1;
    }, layer);
    first.start();
    second.start();
    Konva.Animation._runFrames();
    second.stop();

    assert.equal(first.isRunning(), false);
    assert.equal(secondFrames, 1);
  });

  it('setLayers() copies the given array', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var anim = new Konva.Animation(function () {}, stage.getLayers());
    anim.addLayer(new Konva.Layer());

    assert.equal(stage.getLayers().length, 1);
    assert.equal(anim.getLayers().length, 2);
  });

  it('an animation that restarts itself in its frame runs once per frame', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var calls = 0;
    var anim = new Konva.Animation(function () {
      calls += 1;
      anim.start();
    }, layer);
    anim.start();
    Konva.Animation._runFrames();
    anim.stop();

    assert.equal(calls, 1);
  });
});
