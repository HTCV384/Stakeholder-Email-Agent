import { describe, it, expect } from 'vitest';
import { validateAndFixTemplate, getAvailableVariables } from './templateValidator';

describe('Template Validator', () => {
  describe('validateAndFixTemplate', () => {
    it('should add JSON format instruction when missing', () => {
      const template = `Write a professional email to {stakeholder_name} at {company_name}.
Mention their role as {stakeholder_title}.`;
      
      const result = validateAndFixTemplate(template);
      
      expect(result.changes).toContain('Added JSON format instruction with subject/body structure');
      expect(result.fixedTemplate).toContain('Generate the email as JSON');
      expect(result.fixedTemplate).toContain('"subject"');
      expect(result.fixedTemplate).toContain('"body"');
    });

    it('should convert $variable to {variable}', () => {
      const template = `Write to $stakeholder_name at $company_name.

Generate the email as JSON:
{
  "subject": "Test",
  "body": "Body"
}`;
      
      const result = validateAndFixTemplate(template);
      
      expect(result.changes).toContain('Converted $variable syntax to {variable}');
      expect(result.fixedTemplate).toContain('{stakeholder_name}');
      expect(result.fixedTemplate).toContain('{company_name}');
      expect(result.fixedTemplate).not.toContain('$stakeholder_name');
    });

    it('should convert {{variable}} to {variable}', () => {
      const template = `Write to {{stakeholder_name}} at {{company_name}}.

Generate the email as JSON:
{
  "subject": "Test",
  "body": "Body"
}`;
      
      const result = validateAndFixTemplate(template);
      
      expect(result.changes).toContain('Converted {{variable}} syntax to {variable}');
      expect(result.fixedTemplate).toContain('{stakeholder_name}');
      expect(result.fixedTemplate).toContain('{company_name}');
      expect(result.fixedTemplate).not.toContain('{{stakeholder_name}}');
    });

    it('should warn about invalid variable names', () => {
      const template = `Write to {stakeholder_name} and mention {invalid_var}.

Generate the email as JSON:
{
  "subject": "Test",
  "body": "Body"
}`;
      
      const result = validateAndFixTemplate(template);
      
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('invalid_var'))).toBe(true);
    });

    it('should accept valid template without changes', () => {
      const template = `Write a professional email to {stakeholder_name} at {company_name}.
Mention their role as {stakeholder_title} and reference {relevant_context}.

Generate the email as JSON:
{
  "subject": "Brief subject line",
  "body": "Email body"
}

Return ONLY the JSON, no additional text.`;
      
      const result = validateAndFixTemplate(template);
      
      expect(result.isValid).toBe(true);
      expect(result.changes.length).toBe(0);
      expect(result.fixedTemplate).toBeUndefined();
    });

    it('should return error for empty template', () => {
      const result = validateAndFixTemplate('');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Template cannot be empty');
    });

    it('should warn about missing healthcare context', () => {
      const template = `Write to {stakeholder_name}.

Generate the email as JSON:
{
  "subject": "Test",
  "body": "Body"
}`;
      
      const result = validateAndFixTemplate(template);
      
      expect(result.warnings.some(w => w.includes('healthcare'))).toBe(true);
    });

    it('should handle multiple fixes at once', () => {
      const template = `Write to $stakeholder_name and {{company_name}}.`;
      
      const result = validateAndFixTemplate(template);
      
      expect(result.changes.length).toBeGreaterThan(1);
      expect(result.fixedTemplate).toContain('{stakeholder_name}');
      expect(result.fixedTemplate).toContain('{company_name}');
      expect(result.fixedTemplate).toContain('Generate the email as JSON');
    });
  });

  describe('getAvailableVariables', () => {
    it('should return list of available variables', () => {
      const variables = getAvailableVariables();
      
      expect(variables.length).toBeGreaterThan(0);
      expect(variables.every(v => v.name && v.description)).toBe(true);
      expect(variables.some(v => v.name === '{stakeholder_name}')).toBe(true);
      expect(variables.some(v => v.name === '{company_name}')).toBe(true);
    });
  });
});
