import { assert } from 'chai';
import {
  addStage,
  Konva,
  cloneAndCompareLayer,
  loadImage,
  compareLayers,
  assertAlmostDeepEqual,
} from '../unit/test-utils';

describe('Filter', function () {
  it('pixelRaio check', function () {
    Konva.pixelRatio = 2;
    var stage = addStage();
    var layer = new Konva.Layer();

    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      fill: 'red',
      stroke: 'green',
      radius: 15,
    });

    layer.add(circle);
    stage.add(layer);
    circle.cache();
    circle.filters([Konva.Filters.Blur]);
    circle.blurRadius(0);
    layer.draw();

    cloneAndCompareLayer(layer, 150);
    Konva.pixelRatio = 1;
  });

  // Blur filter comparison
  it('native CSS blur vs Konva blur comparison', function (done) {
    loadImage('darth-vader.jpg', (imageObj) => {
      const oldPixelRatio = Konva.pixelRatio;
      Konva.pixelRatio = 1;
      var stage = addStage();

      var layer1 = new Konva.Layer();
      var layer2 = new Konva.Layer();

      // Native CSS filter image
      var imageCSS = new Konva.Image({
        image: imageObj,
        draggable: true,
      });

      // Konva function filter image
      var imageKonva = new Konva.Image({
        image: imageObj,
        draggable: true,
      });

      layer1.add(imageCSS);
      layer2.add(imageKonva);
      stage.add(layer1);
      stage.add(layer2);

      // Apply CSS filter
      imageCSS.cache();
      imageCSS.filters(['blur(10px)']);

      // Apply equivalent Konva filter (CSS 10px = Konva 5 due to scaling)
      imageKonva.cache();
      imageKonva.filters([Konva.Filters.Blur]);
      imageKonva.blurRadius(5); // 10px * 0.5 scaling factor

      stage.draw();

      Konva.pixelRatio = oldPixelRatio;
      // Compare the results
      compareLayers(layer1, layer2, 150, 150);

      done();
    });
  });

  // Brightness filter comparison
  it('native CSS brightness vs Konva brightness comparison', function (done) {
    loadImage('darth-vader.jpg', (imageObj) => {
      const oldPixelRatio = Konva.pixelRatio;
      Konva.pixelRatio = 1;
      var stage = addStage();

      var layer1 = new Konva.Layer();
      var layer2 = new Konva.Layer();

      // Native CSS filter image
      var imageCSS = new Konva.Image({
        image: imageObj,
        draggable: true,
      });

      // Konva function filter image
      var imageKonva = new Konva.Image({
        image: imageObj,
        draggable: true,
      });

      layer1.add(imageCSS);
      layer2.add(imageKonva);
      stage.add(layer1);
      stage.add(layer2);

      // Apply CSS filter (1.3 = 30% brighter)
      imageCSS.cache();
      imageCSS.filters(['brightness(150%)']);

      // Apply equivalent Konva filter (CSS 1.5 = Konva 1.5 multiplier)
      imageKonva.cache();
      imageKonva.filters([Konva.Filters.Brightness]);
      imageKonva.brightness(1.5);

      stage.draw();

      Konva.pixelRatio = oldPixelRatio;
      // Compare the results
      compareLayers(layer1, layer2);

      done();
    });
  });

  // Contrast filter comparison
  it('native CSS contrast vs Konva contrast comparison', function (done) {
    loadImage('darth-vader.jpg', (imageObj) => {
      const oldPixelRatio = Konva.pixelRatio;
      Konva.pixelRatio = 1;
      var stage = addStage();

      var layer1 = new Konva.Layer();
      var layer2 = new Konva.Layer();

      // Native CSS filter image
      var imageCSS = new Konva.Image({
        image: imageObj,
        draggable: true,
      });

      // Konva function filter image
      var imageKonva = new Konva.Image({
        image: imageObj,
        draggable: true,
      });

      layer1.add(imageCSS);
      layer2.add(imageKonva);
      stage.add(layer1);
      stage.add(layer2);

      // Apply CSS filter (1.2 = 20% more contrast)
      imageCSS.cache();
      imageCSS.filters(['contrast(1.2)']);

      // Apply equivalent Konva filter (CSS 1.2 should now match with square root conversion)
      imageKonva.cache();
      imageKonva.filters([Konva.Filters.Contrast]);
      // Manual calculation: 100 * (√1.2 - 1) ≈ 100 * (1.095 - 1) = 9.54
      imageKonva.contrast(100 * (Math.sqrt(1.2) - 1));

      stage.draw();

      Konva.pixelRatio = oldPixelRatio;
      // Compare the results
      compareLayers(layer1, layer2);

      done();
    });
  });

  // Grayscale filter comparison
  it('native CSS grayscale vs Konva grayscale comparison', function (done) {
    loadImage('darth-vader.jpg', (imageObj) => {
      const oldPixelRatio = Konva.pixelRatio;
      Konva.pixelRatio = 1;
      var stage = addStage();

      var layer1 = new Konva.Layer();
      var layer2 = new Konva.Layer();

      // Native CSS filter image
      var imageCSS = new Konva.Image({
        image: imageObj,
        draggable: true,
      });

      // Konva function filter image
      var imageKonva = new Konva.Image({
        image: imageObj,
        draggable: true,
      });

      layer1.add(imageCSS);
      layer2.add(imageKonva);
      stage.add(layer1);
      stage.add(layer2);

      // Apply CSS filter
      imageCSS.cache();
      imageCSS.filters(['grayscale(1)']);

      // Apply equivalent Konva filter
      imageKonva.cache();
      imageKonva.filters([Konva.Filters.Grayscale]);

      stage.draw();

      Konva.pixelRatio = oldPixelRatio;
      // Compare the results
      compareLayers(layer1, layer2, 10);

      done();
    });
  });

  // Sepia filter comparison
  it('native CSS sepia vs Konva sepia comparison', function (done) {
    loadImage('darth-vader.jpg', (imageObj) => {
      const oldPixelRatio = Konva.pixelRatio;
      Konva.pixelRatio = 1;
      var stage = addStage();

      var layer1 = new Konva.Layer();
      var layer2 = new Konva.Layer();

      // Native CSS filter image
      var imageCSS = new Konva.Image({
        image: imageObj,
        draggable: true,
      });

      // Konva function filter image
      var imageKonva = new Konva.Image({
        image: imageObj,
        draggable: true,
      });

      layer1.add(imageCSS);
      layer2.add(imageKonva);
      stage.add(layer1);
      stage.add(layer2);

      // Apply CSS filter
      imageCSS.cache();
      imageCSS.filters(['sepia(1)']);

      // Apply equivalent Konva filter
      imageKonva.cache();
      imageKonva.filters([Konva.Filters.Sepia]);

      stage.draw();

      Konva.pixelRatio = oldPixelRatio;
      // Compare the results
      compareLayers(layer1, layer2);

      done();
    });
  });

  // Invert filter comparison
  it('native CSS invert vs Konva invert comparison', function (done) {
    loadImage('darth-vader.jpg', (imageObj) => {
      const oldPixelRatio = Konva.pixelRatio;
      Konva.pixelRatio = 1;
      var stage = addStage();

      var layer1 = new Konva.Layer();
      var layer2 = new Konva.Layer();

      // Native CSS filter image
      var imageCSS = new Konva.Image({
        image: imageObj,
        draggable: true,
      });

      // Konva function filter image
      var imageKonva = new Konva.Image({
        image: imageObj,
        draggable: true,
      });

      layer1.add(imageCSS);
      layer2.add(imageKonva);
      stage.add(layer1);
      stage.add(layer2);

      // Apply CSS filter
      imageCSS.cache();
      imageCSS.filters(['invert(1)']);

      // Apply equivalent Konva filter
      imageKonva.cache();
      imageKonva.filters([Konva.Filters.Invert]);

      stage.draw();

      Konva.pixelRatio = oldPixelRatio;
      // Compare the results
      compareLayers(layer1, layer2);

      done();
    });
  });

  // Multiple filters comparison (mixed CSS and function)
  it('multiple mixed filters comparison', function (done) {
    loadImage('darth-vader.jpg', (imageObj) => {
      const oldPixelRatio = Konva.pixelRatio;
      Konva.pixelRatio = 1;
      var stage = addStage();

      var layer1 = new Konva.Layer();
      var layer2 = new Konva.Layer();

      // Mixed CSS filters image
      var imageCSS = new Konva.Image({
        image: imageObj,
        draggable: true,
      });

      // Equivalent Konva function filters image
      var imageKonva = new Konva.Image({
        image: imageObj,
        draggable: true,
      });

      layer1.add(imageCSS);
      layer2.add(imageKonva);
      stage.add(layer1);
      stage.add(layer2);

      // Apply multiple CSS filters
      imageCSS.cache();
      imageCSS.filters([
        'blur(10px)',
        'brightness(1.2)',
        'contrast(1.1)',
        'sepia(1)',
      ]);

      // Apply equivalent Konva filters
      imageKonva.cache();
      imageKonva.filters([
        Konva.Filters.Blur,
        Konva.Filters.Brightness,
        Konva.Filters.Contrast,
        Konva.Filters.Sepia,
      ]);
      imageKonva.blurRadius(20); // 20px * 0.5 scaling factor
      imageKonva.brightness(1.2); // CSS 1.2 = Konva 1.2 multiplier
      imageKonva.contrast(100 * (Math.sqrt(1.1) - 1)); // CSS 1.1 = Konva 110 percentage

      stage.draw();

      Konva.pixelRatio = oldPixelRatio;
      // Compare the results
      compareLayers(layer1, layer2, 150, 200);

      done();
    });
  });

  it('a filter chain uploads the image data once', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var rect = new Konva.Rect({
      x: 10,
      y: 10,
      width: 50,
      height: 50,
      fill: 'red',
    });
    layer.add(rect);
    rect.cache();
    rect.filters([
      Konva.Filters.Invert,
      Konva.Filters.Grayscale,
      Konva.Filters.Brighten,
    ]);
    stage.add(layer);

    const trace = rect._getCanvasCache().filter.getContext().getTrace(true);
    assert.equal(trace.split('putImageData()').length - 1, 1);
  });

  function uniformImageData(rgba: number[]) {
    const context = Konva.Util.createCanvasElement().getContext('2d')!;
    const imageData = context.createImageData(20, 20);
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data.set(rgba, i);
    }
    return imageData;
  }
  function centerPixel(imageData) {
    const i = (10 * imageData.width + 10) * 4;
    return Array.from(imageData.data.slice(i, i + 4));
  }

  it('Blur keeps the colour of semi-transparent pixels', function () {
    const imageData = uniformImageData([200, 100, 50, 128]);

    Konva.Filters.Blur.call({ blurRadius: () => 5 }, imageData);

    assertAlmostDeepEqual(centerPixel(imageData), [200, 100, 50, 128], 3);
  });

  it('Blur keeps a 1 pixel tall image', function () {
    const context = Konva.Util.createCanvasElement().getContext('2d')!;
    const imageData = context.createImageData(5, 1);
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data.set([200, 100, 50, 255], i);
    }

    Konva.Filters.Blur.call({ blurRadius: () => 2 }, imageData);

    assertAlmostDeepEqual(
      Array.from(imageData.data.slice(8, 12)),
      [200, 100, 50, 255],
      3
    );
  });

  it('Blur with a huge radius does not blank the image', function () {
    const imageData = uniformImageData([255, 0, 0, 255]);

    Konva.Filters.Blur.call({ blurRadius: () => 200 }, imageData);

    assertAlmostDeepEqual(centerPixel(imageData), [255, 0, 0, 255], 3);
  });

  it('red, green and blue clamp, round and invalidate the filter', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var rect = new Konva.Rect({ width: 10, height: 10, fill: 'red' });
    layer.add(rect);
    rect.cache();
    rect.filters([Konva.Filters.RGBA]);
    layer.draw();
    assert.equal(rect._filterUpToDate, true);

    rect.red(300);
    assert.equal(rect.red(), 255);
    assert.equal(rect._filterUpToDate, false);
    layer.draw();
    rect.green(-5);
    assert.equal(rect.green(), 0);
    assert.equal(rect._filterUpToDate, false);
    layer.draw();
    rect.blue(10.6);
    assert.equal(rect.blue(), 11);
    assert.equal(rect._filterUpToDate, false);
  });
});
