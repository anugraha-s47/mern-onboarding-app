import test from 'node:test';
import assert from 'node:assert/strict';

import {
  validateRegister,
  validateLogin,
  validateStep,
  validateComplete
} from '../src/validators/onboarding.js';

test('registration requires valid name, email, and minimum password length', () => {
  assert.deepEqual(
    validateRegister({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'password123'
    }),
    {}
  );

  assert.ok(
    validateRegister({
      name: 'A',
      email: 'bad',
      password: 'short'
    }).password
  );
});

test('login rejects malformed credentials', () => {
  assert.ok(
    validateLogin({
      email: 'nope',
      password: ''
    }).email
  );
});

test('step validation rejects invalid step and missing required goals', () => {
  assert.match(validateStep(9, {}), /between 1 and 8/);
  assert.match(validateStep(2, { goals: [] }), /at least one goal/);
});

test('completion validation requires required persisted steps', () => {
  assert.match(validateComplete({}), /Step 1/);
});