// Portal chief complaint values from CHIEF_COMPLAINT, observed 24 November 2026.
// The LOA form loads these through /getChiefComplain. Keep the demo offline.
export const CHIEF_COMPLAINTS = [
  {
    "value": "01",
    "label": "Gallstone or Gallbladder Stone"
  },
  {
    "value": "02",
    "label": "Abdominal Pain"
  },
  {
    "value": "03",
    "label": "Nausea"
  },
  {
    "value": "04",
    "label": "Vomiting"
  },
  {
    "value": "05",
    "label": "Bloatedness"
  },
  {
    "value": "06",
    "label": "High Cholesterol"
  },
  {
    "value": "07",
    "label": "Fever"
  },
  {
    "value": "08",
    "label": "Cough and Colds"
  },
  {
    "value": "09",
    "label": "Accidents and Trauma"
  },
  {
    "value": "10",
    "label": "High Blood Pressure"
  },
  {
    "value": "11",
    "label": "Chest Pain and Palpitations"
  },
  {
    "value": "12",
    "label": "Dizziness"
  },
  {
    "value": "13",
    "label": "Back Pain and Low Back Pain"
  },
  {
    "value": "14",
    "label": "Rashes, Allergy and Itchiness"
  },
  {
    "value": "15",
    "label": "Headache"
  },
  {
    "value": "16",
    "label": "Dysmenorrhea"
  },
  {
    "value": "17",
    "label": "Others"
  }
];
export const chiefComplaintLabel = (value) => CHIEF_COMPLAINTS.find((option) => option.value === value)?.label ?? "Not provided";
export const chiefComplaintRequired = (type) => ["OPCON", "IP", "EMERG"].includes(type);
export function chiefComplaintError({ complaint, type }) {
  if (!complaint) return chiefComplaintRequired(type) ? "Select a chief complaint." : null;
  return CHIEF_COMPLAINTS.some((option) => option.value === complaint) ? null : "Select a chief complaint from the list.";
}

// Copied from the portal's utils/philippineMobileNumber.js.
export const PHILIPPINE_MOBILE_NUMBER_REGEX = /^(?:09\d{9}|\+639\d{9})$/;
export const normalizePhilippineMobileNumber = (value) =>
  String(value || "").replace(/[\s-]+/g, "").trim();

export const isValidPhilippineMobileNumber = (value) =>
  PHILIPPINE_MOBILE_NUMBER_REGEX.test(normalizePhilippineMobileNumber(value));

export const PHILIPPINE_MOBILE_NUMBER_MESSAGE =
  "Enter a valid Philippine mobile number starting with 0 or +63 (e.g. 09171234567 or +639171234567)";

// Pure validator from modules/registration/emailValidation.js; no Yup dependency.
export const MAX_EMAIL_LENGTH = 50;

export const validateEmailAddress = (value) => {
  const email = String(value || "").trim();
  if (!email) {
    return "Email is required";
  }

  if (email.length > MAX_EMAIL_LENGTH) {
    return `Email cannot exceed ${MAX_EMAIL_LENGTH} characters`;
  }

  const atParts = email.split("@");
  if (atParts.length !== 2) {
    return "Email must contain a single @ symbol";
  }

  const [localPart, domainPart] = atParts;
  if (!localPart) {
    return "Email must include text before @";
  }

  if (!domainPart) {
    return "Email must include a domain after @";
  }

  if (localPart.startsWith(".") || localPart.endsWith(".")) {
    return "Email cannot start or end with a dot before @";
  }

  if (localPart.includes("..")) {
    return "Email cannot contain consecutive dots before @";
  }

  if (/[._%+-]{2,}/.test(localPart)) {
    return "Email cannot contain repeated special characters before @";
  }

  if (!/^[A-Za-z0-9._%+-]+$/.test(localPart)) {
    return "Email contains invalid characters before @";
  }

  if (domainPart.includes("..")) {
    return "Email domain cannot contain consecutive dots";
  }

  const domainLabels = domainPart.split(".");
  if (domainLabels.length < 2) {
    return "Email domain must include a valid extension";
  }

  const hasEmptyDomainLabel = domainLabels.some((label) => !label);
  if (hasEmptyDomainLabel) {
    return "Email domain contains an empty section";
  }

  const hasInvalidDomainLabel = domainLabels.some(
    (label) =>
      !/^[A-Za-z0-9-]+$/.test(label)
      || label.startsWith("-")
      || label.endsWith("-"),
  );
  if (hasInvalidDomainLabel) {
    return "Email domain contains an invalid section";
  }

  const nonTldLabels = domainLabels.slice(0, -1);
  let consecutiveSingleCharacterLabels = 0;
  for (const label of nonTldLabels) {
    if (label.length === 1) {
      consecutiveSingleCharacterLabels += 1;
      if (consecutiveSingleCharacterLabels >= 3) {
        return "Email domain format is invalid";
      }
      continue;
    }
    consecutiveSingleCharacterLabels = 0;
  }

  const topLevelDomain = domainLabels[domainLabels.length - 1];
  if (!/^[A-Za-z]{2,}$/.test(topLevelDomain)) {
    return "Email domain extension must contain at least 2 letters";
  }

  return null;
};


// Requester contacts remain optional in this demo; validate supplied values.
export function contactErrors({ mobile, email }) {
  return {
    mobile: String(mobile ?? "").trim() && !isValidPhilippineMobileNumber(mobile) ? PHILIPPINE_MOBILE_NUMBER_MESSAGE : null,
    email: String(email ?? "").trim() ? validateEmailAddress(email) : null,
  };
}
