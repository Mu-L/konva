import { assert } from 'chai';
import { addStage, isNode, Konva } from './test-utils.ts';

describe('native event batching', function () {
  // These tests exercise browser dispatch, which the Node backends do not have.
  if (isNode) return;

  it('runs mouseup and click synchronously inside one stage callback', function () {
    const calls: string[] = [];
    const stage = addStage({
      eventBatchFunc: (run) => {
        calls.push('begin');
        try {
          run();
        } finally {
          calls.push('end');
        }
      },
    });
    stage.on('mouseup', () => calls.push('up'));
    stage.on('click', () => calls.push('click'));
    const bounds = stage.content.getBoundingClientRect();
    const at = {
      clientX: bounds.left + 10,
      clientY: bounds.top + 10,
      bubbles: true,
    };
    stage.content.dispatchEvent(new MouseEvent('mousedown', at));
    calls.length = 0;
    stage.content.dispatchEvent(new MouseEvent('mouseup', at));
    assert.deepEqual(calls, ['begin', 'up', 'click', 'end']);
  });

  it('batches every dragged node and its constraint in one native step', function () {
    let batches = 0;
    let inside = false;
    const stage = addStage({
      eventBatchFunc: (run) => {
        batches++;
        inside = true;
        try {
          run();
        } finally {
          inside = false;
        }
      },
    });
    const layer = new Konva.Layer();
    stage.add(layer);
    const nodes = [0, 30].map(
      (x) => new Konva.Rect({ x, width: 10, height: 10, draggable: true })
    );
    layer.add(...nodes);
    const bounds = stage.content.getBoundingClientRect();
    const at = (x) => ({ clientX: bounds.left + x, clientY: bounds.top + 5 });
    stage.setPointersPositions(at(5));
    nodes.forEach((node) => node.startDrag({ evt: at(5) }));
    nodes.forEach((node) =>
      node.dragBoundFunc((pos) => {
        assert.isTrue(inside, 'constraint runs inside the batch');
        return pos;
      })
    );
    const calls: number[] = [];
    nodes.forEach((node, index) =>
      node.on('dragmove', () => {
        assert.isTrue(inside);
        assert.deepEqual(
          nodes.map((node) => node.x()),
          [10, 40]
        );
        calls.push(index);
      })
    );
    window.dispatchEvent(new MouseEvent('mousemove', at(15)));
    assert.equal(batches, 1);
    assert.deepEqual(calls, [0, 1]);
    window.dispatchEvent(new MouseEvent('mouseup', at(15)));
  });

  it('does not batch direct fire calls or idle window movement', function () {
    let batches = 0;
    let events = 0;
    const stage = addStage({
      eventBatchFunc: (run) => {
        batches++;
        run();
      },
    });
    stage.on('mousemove', () => events++);
    stage.fire('mousemove');
    window.dispatchEvent(new MouseEvent('mousemove'));
    assert.equal(events, 1);
    assert.equal(batches, 0);
    stage.content.dispatchEvent(new MouseEvent('mousemove'));
    assert.equal(batches, 1);
    stage.eventBatchFunc(undefined);
    stage.content.dispatchEvent(new MouseEvent('mousemove'));
    assert.equal(batches, 1);
    assert.equal(events, 3);
  });

  it('deduplicates a shared callback across stages during drag', function () {
    let batches = 0;
    const batch = (run) => {
      batches++;
      run();
    };
    const stages = [
      addStage({ eventBatchFunc: batch }),
      addStage({ eventBatchFunc: batch }),
    ];
    const nodes = stages.map((stage) => {
      const node = new Konva.Rect({ width: 10, height: 10, draggable: true });
      stage.add(new Konva.Layer().add(node));
      const bounds = stage.content.getBoundingClientRect();
      const evt = { clientX: bounds.left + 5, clientY: bounds.top + 5 };
      stage.setPointersPositions(evt);
      node.startDrag({ evt });
      return node;
    });
    const bounds = stages[0].content.getBoundingClientRect();
    window.dispatchEvent(
      new MouseEvent('mousemove', {
        clientX: bounds.left + 15,
        clientY: bounds.top + 5,
      })
    );
    assert.equal(batches, 1);
    assert.deepEqual(
      nodes.map((node) => node.x()),
      [10, 10]
    );
    window.dispatchEvent(new MouseEvent('mouseup'));
  });

  it('includes Transformer constraints and every transform handler in the batch', function () {
    let batches = 0;
    let inside = false;
    const stage = addStage({
      eventBatchFunc: (run) => {
        batches++;
        inside = true;
        try {
          run();
        } finally {
          inside = false;
        }
      },
    });
    const layer = new Konva.Layer();
    stage.add(layer);
    const nodes = [0, 30].map(
      (x) => new Konva.Rect({ x, width: 160, height: 100 })
    );
    const transformer = new Konva.Transformer({ nodes, keepRatio: false });
    layer.add(...nodes, transformer);
    transformer.anchorDragBoundFunc((old, next) => {
      assert.isTrue(inside, 'anchor constraint runs inside the batch');
      return next;
    });
    let handlers = 0;
    nodes.forEach((node) =>
      node.on('transform', () => {
        assert.isTrue(inside);
        handlers++;
      })
    );
    const anchor = transformer.findOne('.bottom-right')!;
    const position = anchor.getAbsolutePosition();
    const bounds = stage.content.getBoundingClientRect();
    const at = (dx) => ({
      clientX: bounds.left + position.x + dx,
      clientY: bounds.top + position.y,
    });
    stage.setPointersPositions(at(0));
    anchor.fire('mousedown', { evt: at(0) });
    window.dispatchEvent(new MouseEvent('mousemove', at(40)));
    // Preserve the existing anchor drag start/cancel callback before the
    // Transformer callback. They are separate native listeners.
    assert.equal(batches, 2);
    assert.equal(handlers, 2);
    assert.closeTo(transformer.width(), 230, 0.001);
    window.dispatchEvent(new MouseEvent('mouseup', at(40)));
  });
  it('emits cancellation and preserves the legacy pointerup notification in one batch', function () {
    const calls: string[] = [];
    const stage = addStage({
      eventBatchFunc: (run) => {
        calls.push('begin');
        run();
        calls.push('end');
      },
    });
    const shape = new Konva.Rect({ width: 100, height: 100, fill: 'red' });
    stage.add(new Konva.Layer().add(shape));
    shape.on('pointercancel', () => calls.push('cancel'));
    shape.on('pointerup', () => calls.push('up'));
    stage.draw();
    const bounds = stage.content.getBoundingClientRect();
    stage.content.dispatchEvent(
      new PointerEvent('pointercancel', {
        pointerId: 1,
        clientX: bounds.left + 20,
        clientY: bounds.top + 20,
        bubbles: true,
      })
    );
    assert.deepEqual(calls, ['begin', 'cancel', 'up', 'end']);
  });
});

describe('native event batching contract', function () {
  if (isNode) return;

  let warnings: string[];
  let warn: typeof Konva.Util.warn;
  beforeEach(function () {
    warnings = [];
    warn = Konva.Util.warn;
    Konva.Util.warn = (message) => warnings.push(message);
  });
  afterEach(function () {
    Konva.Util.warn = warn;
  });

  it('warns when the callback omits native input processing', function () {
    const stage = addStage({ eventBatchFunc: () => {} });
    let moves = 0;
    stage.on('mousemove', () => moves++);
    stage.content.dispatchEvent(new MouseEvent('mousemove'));
    assert.equal(moves, 0);
    assert.lengthOf(warnings, 1);
    assert.include(warnings[0], 'eventBatchFunc');
    assert.include(warnings[0], 'synchronously');
  });

  it('warns and ignores a second call instead of dispatching input twice', function () {
    const stage = addStage({
      eventBatchFunc: (run) => {
        run();
        run();
      },
    });
    let moves = 0;
    stage.on('mousemove', () => moves++);
    stage.content.dispatchEvent(new MouseEvent('mousemove'));
    assert.equal(moves, 1);
    assert.lengthOf(warnings, 1);
    assert.include(warnings[0], 'eventBatchFunc');
  });

  it('rejects input processing after the batching callback returns', function () {
    let deferred: () => void;
    const stage = addStage({ eventBatchFunc: (run) => (deferred = run) });
    let moves = 0;
    stage.on('mousemove', () => moves++);
    stage.content.dispatchEvent(new MouseEvent('mousemove'));
    assert.equal(moves, 0);
    assert.lengthOf(warnings, 1);
    deferred!();
    assert.equal(moves, 0, 'late calls must not mutate input state');
    assert.lengthOf(warnings, 2);
  });

  it('also checks the callback around window drag processing', function () {
    const stage = addStage({
      eventBatchFunc: (run) => {
        run();
        run();
      },
    });
    const node = new Konva.Rect({ width: 10, height: 10, draggable: true });
    stage.add(new Konva.Layer().add(node));
    const bounds = stage.content.getBoundingClientRect();
    const at = (x) => ({ clientX: bounds.left + x, clientY: bounds.top + 5 });
    stage.setPointersPositions(at(5));
    node.startDrag({ evt: at(5) });
    let moves = 0;
    node.on('dragmove', () => moves++);
    try {
      window.dispatchEvent(new MouseEvent('mousemove', at(15)));
      assert.equal(moves, 1);
      assert.equal(node.x(), 10);
      assert.lengthOf(warnings, 1);
    } finally {
      window.dispatchEvent(new MouseEvent('mouseup', at(15)));
    }
  });

  it('warns when a callback skips dragend without replaying skipped input', function () {
    const stage = addStage({ eventBatchFunc: () => {} });
    const node = new Konva.Rect({ width: 10, height: 10, draggable: true });
    stage.add(new Konva.Layer().add(node));
    stage.setPointersPositions({ clientX: 5, clientY: 5 });
    node.startDrag();
    let ends = 0;
    node.on('dragend', () => ends++);
    try {
      window.dispatchEvent(new MouseEvent('mouseup'));
      assert.lengthOf(warnings, 1);
      assert.equal(ends, 0);
      assert.isFalse(node.isDragging());
    } finally {
      node.stopDrag();
    }
    assert.equal(ends, 1, 'programmatic cleanup still works');
  });

  for (const source of ['before', 'after', 'handler']) {
    it(`preserves an exception thrown ${source} input processing`, function () {
      const error = new Error('expected batch failure');
      const errors: unknown[] = [];
      const onError = window.onerror;
      // Assert this expected browser error without sending it to Mocha's
      // uncaught-error handler. Unexpected errors still reach that handler.
      window.onerror = (message, url, line, column, thrown) => {
        if (thrown !== error) {
          return onError?.call(window, message, url, line, column, thrown);
        }
        errors.push(thrown);
        return true;
      };
      const stage = addStage({
        eventBatchFunc: (run) => {
          if (source === 'before') throw error;
          run();
          if (source === 'after') throw error;
        },
      });
      let moves = 0;
      const onMove = () => {
        moves++;
        if (source === 'handler') throw error;
      };
      stage.on('mousemove', onMove);
      try {
        stage.content.dispatchEvent(new MouseEvent('mousemove'));
        assert.deepEqual(errors, [error]);
        assert.equal(moves, source === 'before' ? 0 : 1);
        assert.lengthOf(warnings, source === 'before' ? 1 : 0);
        // A failed scope must not poison later input.
        stage.eventBatchFunc((run) => run());
        stage.off('mousemove', onMove);
        stage.on('mousemove', () => moves++);
        moves = 0;
        stage.content.dispatchEvent(new MouseEvent('mousemove'));
        assert.equal(moves, 1);
      } finally {
        window.onerror = onError;
      }
    });
  }
});
