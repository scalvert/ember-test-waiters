import { module, test } from 'qunit';
import {
  register,
  unregister,
  hasPendingWaiters,
  getWaiters,
  reset,
  TestWaiter,
  getPendingWaiterState,
} from 'ember-test-waiters';
import MockStableError, { overrideError, resetError } from './utils/mock-stable-error';

module('test-watiers', function(hooks) {
  hooks.afterEach(function() {
    reset();
    resetError();
  });

  test('register will correctly add a waiter', function(assert) {
    let waiter = new TestWaiter('first');

    register(waiter);

    let waiters = getWaiters().map(w => w.name);
    assert.deepEqual(waiters, ['first']);
  });

  test('unregister will correctly remove a waiter', function(assert) {
    let waiter = new TestWaiter('first');

    register(waiter);

    let waiters = getWaiters().map(w => w.name);
    assert.deepEqual(waiters, ['first'], 'precond');

    unregister(waiter);

    waiters = getWaiters().map(w => w.name);
    assert.deepEqual(waiters, [], 'precond');
  });

  test('getWaiters returns all registered waiters', function(assert) {
    let waiter = new TestWaiter('first');

    assert.equal(getWaiters(), 0, 'No waiters are registered');

    register(waiter);

    assert.equal(getWaiters().length, 1, 'One waiter is registered');

    unregister(waiter);

    assert.equal(getWaiters(), 0, 'No waiters are registerd');
  });

  test('getPendingWaiterState returns information on pending waiters', function(assert) {
    let first = new TestWaiter('first');
    let second = new TestWaiter('second');
    let firstItem = {};
    let secondItem = {};

    overrideError(MockStableError);

    assert.equal(getPendingWaiterState().pending, 0, 'No waiters are pending');
    assert.deepEqual(getPendingWaiterState().waiters, {}, 'No waiters are pending');

    first.beginAsync(firstItem);
    assert.equal(getPendingWaiterState().pending, 1, 'First waiter is pending');
    assert.deepEqual(
      getPendingWaiterState().waiters,
      {
        first: [
          {
            label: undefined,
            stack: 'STACK',
          },
        ],
      },
      'First waiter is pending'
    );

    first.endAsync(firstItem);

    assert.equal(getPendingWaiterState().pending, 0, 'No waiters are pending');
    assert.deepEqual(getPendingWaiterState().waiters, {}, 'No waiters are pending');

    second.beginAsync(secondItem);

    assert.equal(getPendingWaiterState().pending, 1, 'Second waiter is pending');
    assert.deepEqual(
      getPendingWaiterState().waiters,
      {
        second: [
          {
            label: undefined,
            stack: 'STACK',
          },
        ],
      },
      'Second waiter is pending'
    );

    second.endAsync(secondItem);

    assert.equal(getPendingWaiterState().pending, 0, 'No waiters are pending');
    assert.deepEqual(getPendingWaiterState().waiters, {}, 'No waiters are pending');
  });

  test('hasPendingWaiters can check if waiting is required', function(assert) {
    let first = new TestWaiter('first');
    let second = new TestWaiter('second');
    let firstItem = {};
    let secondItem = {};

    assert.strictEqual(hasPendingWaiters(), false, 'No waiters are pending');

    first.beginAsync(firstItem);
    assert.strictEqual(hasPendingWaiters(), true, 'First waiter is pending');

    first.endAsync(firstItem);
    assert.strictEqual(hasPendingWaiters(), false, 'First waiter is not pending');

    second.beginAsync(secondItem);
    assert.strictEqual(hasPendingWaiters(), true, 'Second waiter is pending');

    second.endAsync(secondItem);
    assert.strictEqual(hasPendingWaiters(), false, 'Second waiter is not pending');
  });
});