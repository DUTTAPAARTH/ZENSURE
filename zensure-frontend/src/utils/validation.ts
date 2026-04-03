type FieldValidation = {
  valid: boolean;
  error: string;
};

type ValidatorMessages = {
  required?: string;
  invalid?: string;
};

type OnboardingInput = {
  name: string;
  mobile: string;
  partnerId: string;
  city: string;
  zone: string;
  upiId: string;
};

type OnboardingValidation = {
  valid: boolean;
  errors: Record<string, string>;
};

type OnboardingValidationMessages = {
  nameRequired?: string;
  mobileRequired?: string;
  mobileInvalid?: string;
  partnerRequired?: string;
  partnerInvalid?: string;
  cityRequired?: string;
  zoneRequired?: string;
  upiRequired?: string;
  upiInvalid?: string;
};

export function validateUPI(value: string, messages: ValidatorMessages = {}): FieldValidation {
  const input = value.trim();
  if (!input) {
    return {
      valid: false,
      error: messages.required || 'UPI ID is required',
    };
  }

  const upiRegex = /^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/;
  if (!upiRegex.test(input)) {
    return {
      valid: false,
      error: messages.invalid || 'Enter a valid UPI ID (e.g. ravi.kumar@upi)',
    };
  }

  return { valid: true, error: '' };
}

export function validateMobile(value: string, messages: ValidatorMessages = {}): FieldValidation {
  const input = value.trim();
  if (!input) {
    return {
      valid: false,
      error: messages.required || 'Mobile number is required',
    };
  }

  const mobileRegex = /^\d{10}$/;
  if (!mobileRegex.test(input)) {
    return {
      valid: false,
      error: messages.invalid || 'Enter a valid 10-digit mobile number',
    };
  }

  return { valid: true, error: '' };
}

export function validatePartnerId(value: string, messages: ValidatorMessages = {}): FieldValidation {
  const input = value.trim();
  if (!input) {
    return {
      valid: false,
      error: messages.required || 'Partner ID is required',
    };
  }

  const partnerRegex = /^[A-Z0-9]{4,20}$/;
  if (!partnerRegex.test(input.toUpperCase())) {
    return {
      valid: false,
      error: messages.invalid || 'Partner ID must be 4-20 letters/numbers',
    };
  }

  return { valid: true, error: '' };
}

export function validateOnboardingForm(
  values: OnboardingInput,
  messages: OnboardingValidationMessages = {}
): OnboardingValidation {
  const errors: Record<string, string> = {};

  if (!values.name.trim()) {
    errors.name = messages.nameRequired || 'Name is required';
  }

  const mobileValidation = validateMobile(values.mobile, {
    required: messages.mobileRequired,
    invalid: messages.mobileInvalid,
  });
  if (!mobileValidation.valid) {
    errors.mobile = mobileValidation.error;
  }

  const partnerValidation = validatePartnerId(values.partnerId, {
    required: messages.partnerRequired,
    invalid: messages.partnerInvalid,
  });
  if (!partnerValidation.valid) {
    errors.partnerId = partnerValidation.error;
  }

  if (!values.city.trim()) {
    errors.city = messages.cityRequired || 'Select a city';
  }

  if (!values.zone.trim()) {
    errors.zone = messages.zoneRequired || 'Enter your delivery zone';
  }

  const upiValidation = validateUPI(values.upiId, {
    required: messages.upiRequired,
    invalid: messages.upiInvalid,
  });
  if (!upiValidation.valid) {
    errors.upiId = upiValidation.error;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
