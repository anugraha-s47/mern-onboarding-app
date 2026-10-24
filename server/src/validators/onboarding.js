
export const STEP_COUNT = 8;

export function validateRegister({ name, email, password } = {}) {
  const errors = {};

  if (
    typeof name !== 'string' ||
    name.trim().length < 2 ||
    name.trim().length > 80
  ) {
    errors.name = 'Name must be between 2 and 80 characters.';
  }

  if (
    typeof email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    errors.email = 'Enter a valid email address.';
  }

  if (
    typeof password !== 'string' ||
    password.length < 8 ||
    password.length > 128
  ) {
    errors.password = 'Password must be at least 8 characters.';
  }

  return errors;
}

export function validateLogin({ email, password } = {}) {
  const errors = {};

  if (
    typeof email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    errors.email = 'Enter a valid email address.';
  }

  if (typeof password !== 'string' || !password.length) {
    errors.password = 'Password is required.';
  }

  return errors;
}

export function validateStep(step, data) {
  if (
    !Number.isInteger(Number(step)) ||
    Number(step) < 1 ||
    Number(step) > STEP_COUNT
  ) {
    return 'Step number must be between 1 and 8.';
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return 'Step data must be an object.';
  }

  const s = Number(step);

  if (
    s === 1 &&
    (
      !String(data.name || '').trim() ||
      !String(data.username || '').trim() ||
      !data.role ||
      !data.location ||
      !data.discovery
    )
  ) {
    return 'Complete your name, username, role, location, and discovery source.';
  }

  if (s === 2 && (!Array.isArray(data.goals) || data.goals.length < 1)) {
    return 'Select at least one goal.';
  }

  if (
    s === 4 &&
    (
      !Array.isArray(data.interests) ||
      data.interests.length < 1 ||
      data.interests.length > 5
    )
  ) {
    return 'Select between 1 and 5 interests.';
  }

  if (
    s === 5 &&
    (
      !Array.isArray(data.skills) ||
      data.skills.length < 1 ||
      data.skills.length > 5
    )
  ) {
    return 'Select between 1 and 5 skills.';
  }

  if (s === 6 && !['yes', 'no'].includes(data.jobSearch)) {
    return 'Choose whether you are actively looking for a job.';
  }

  if (s === 7 && Array.isArray(data.links) && data.links.length > 10) {
    return 'You can add up to 10 links.';
  }

  // Step 8 is retained for compatibility with previously saved records.
  // It is no longer required to complete the new onboarding flow.

  return null;
}

export function validateComplete(entry) {
  // Only validate the steps required by the new onboarding flow.
  for (const n of [1, 2, 4, 5, 6]) {
    const error = validateStep(n, entry?.[`step${n}`] || {});

    if (error) {
      return `Step ${n}: ${error}`;
    }
  }

  return null;
}
