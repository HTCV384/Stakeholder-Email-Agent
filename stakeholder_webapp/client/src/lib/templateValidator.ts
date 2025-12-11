/**
 * Template Auto-Fix Utility
 * Automatically detects and fixes common template prompt errors
 */

const VALID_VARIABLES = [
  'stakeholder_name',
  'stakeholder_title', 
  'stakeholder_details',
  'company_name',
  'company_summary',
  'relevant_context',
  'stakeholder_first_name'
];

const JSON_FORMAT_INSTRUCTION = `

Generate the email as JSON:
{
  "subject": "Email subject line",
  "body": "Email body"
}

Return ONLY the JSON, no additional text.`;

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fixedTemplate?: string;
  changes: string[];
}

/**
 * Validate and auto-fix a template prompt
 */
export function validateAndFixTemplate(template: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const changes: string[] = [];
  let fixedTemplate = template;

  // Check if template is empty
  if (!template || template.trim().length === 0) {
    errors.push("Template cannot be empty");
    return { isValid: false, errors, warnings, changes };
  }

  // Check 1: Has JSON format instruction
  const hasJSONInstruction = /generate.*json|return.*json|format.*json/i.test(template);
  const hasJSONExample = /{\s*["']subject["']\s*:|{\s*["']body["']\s*:/i.test(template);
  
  if (!hasJSONInstruction || !hasJSONExample) {
    changes.push("Added JSON format instruction with subject/body structure");
    fixedTemplate = fixedTemplate.trim() + JSON_FORMAT_INSTRUCTION;
  }

  // Check 2: Validate variable syntax - should be {variable_name}
  const variablePattern = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
  const foundVariables = new Set<string>();
  let match;
  
  while ((match = variablePattern.exec(template)) !== null) {
    foundVariables.add(match[1]);
  }

  // Check for invalid variables
  const invalidVars: string[] = [];
  foundVariables.forEach(varName => {
    if (!VALID_VARIABLES.includes(varName)) {
      invalidVars.push(varName);
    }
  });

  if (invalidVars.length > 0) {
    warnings.push(`Found potentially invalid variables: ${invalidVars.join(', ')}`);
    warnings.push(`Valid variables are: ${VALID_VARIABLES.join(', ')}`);
  }

  // Check 3: Fix common variable mistakes
  // Replace $variable or {{variable}} with {variable}
  const dollarVarPattern = /\$([a-zA-Z_][a-zA-Z0-9_]*)/g;
  if (dollarVarPattern.test(fixedTemplate)) {
    fixedTemplate = fixedTemplate.replace(dollarVarPattern, '{$1}');
    changes.push("Converted $variable syntax to {variable}");
  }

  const doubleBracePattern = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;
  if (doubleBracePattern.test(fixedTemplate)) {
    fixedTemplate = fixedTemplate.replace(doubleBracePattern, '{$1}');
    changes.push("Converted {{variable}} syntax to {variable}");
  }

  // Check 4: Ensure "Return ONLY the JSON" instruction
  if (!/return\s+only\s+the\s+json/i.test(fixedTemplate)) {
    // Already added in JSON_FORMAT_INSTRUCTION
  }

  // Check 5: Validate JSON example structure
  const jsonExampleMatch = fixedTemplate.match(/\{[^}]*["']subject["'][^}]*["']body["'][^}]*\}/);
  if (jsonExampleMatch) {
    const jsonExample = jsonExampleMatch[0];
    // Check if it's valid JSON structure
    try {
      // Try to parse a cleaned version
      const cleaned = jsonExample
        .replace(/["']subject["']\s*:/g, '"subject":')
        .replace(/["']body["']\s*:/g, '"body":')
        .replace(/:\s*["'][^"']*["']/g, ': "value"');
      JSON.parse(cleaned);
    } catch (e) {
      warnings.push("JSON example structure may be malformed");
    }
  }

  // Check 6: Ensure template mentions healthcare context
  const hasHealthcareContext = /healthcare|hospital|patient|clinical|medical/i.test(template);
  if (!hasHealthcareContext) {
    warnings.push("Template doesn't mention healthcare context - consider adding healthcare-specific guidance");
  }

  const isValid = errors.length === 0;
  
  return {
    isValid,
    errors,
    warnings,
    fixedTemplate: changes.length > 0 ? fixedTemplate : undefined,
    changes
  };
}

/**
 * Get a list of available template variables with descriptions
 */
export function getAvailableVariables() {
  return [
    { name: '{stakeholder_name}', description: 'Full name of the stakeholder (e.g., "Dr. Sarah Johnson")' },
    { name: '{stakeholder_title}', description: 'Job title (e.g., "Chief Quality Officer")' },
    { name: '{stakeholder_details}', description: 'Background and responsibilities' },
    { name: '{company_name}', description: 'Hospital/organization name' },
    { name: '{company_summary}', description: 'Hospital overview and context' },
    { name: '{relevant_context}', description: 'Specific insights from research report' },
    { name: '{stakeholder_first_name}', description: 'First name only (e.g., "Sarah")' },
  ];
}
