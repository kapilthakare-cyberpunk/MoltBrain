/**
 * Observation Validator
 * 
 * Validates observation data before storage.
 */

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface ObservationInput {
  type?: string;
  title?: string;
  subtitle?: string;
  narrative?: string;
  facts?: string[];
  concepts?: string[];
  files_read?: string[];
  files_modified?: string[];
  project?: string;
  prompt_number?: number;
}

export class ObservationValidator {
  private errors: ValidationError[] = [];
  private warnings: ValidationError[] = [];

  private static readonly VALID_TYPES = [
    'discovery',
    'decision',
    'implementation',
    'issue',
    'learning',
    'reference',
  ];

  private static readonly MAX_TITLE_LENGTH = 200;
  private static readonly MAX_SUBTITLE_LENGTH = 500;
  private static readonly MAX_NARRATIVE_LENGTH = 10000;
  private static readonly MAX_FACTS = 20;
  private static readonly MAX_CONCEPTS = 20;
  private static readonly MAX_FILES = 100;

  /**
   * Validate observation input
   */
  validate(input: ObservationInput): ValidationResult {
    this.errors = [];
    this.warnings = [];

    this.validateType(input.type);
    this.validateTitle(input.title);
    this.validateSubtitle(input.subtitle);
    this.validateNarrative(input.narrative);
    this.validateFacts(input.facts);
    this.validateConcepts(input.concepts);
    this.validateFiles('files_read', input.files_read);
    this.validateFiles('files_modified', input.files_modified);
    this.validateProject(input.project);
    this.validatePromptNumber(input.prompt_number);

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
    };
  }

  /**
   * Validate and sanitize input
   */
  sanitize(input: ObservationInput): ObservationInput {
    return {
      type: this.sanitizeType(input.type),
      title: this.sanitizeString(input.title, ObservationValidator.MAX_TITLE_LENGTH),
      subtitle: this.sanitizeString(input.subtitle, ObservationValidator.MAX_SUBTITLE_LENGTH),
      narrative: this.sanitizeString(input.narrative, ObservationValidator.MAX_NARRATIVE_LENGTH),
      facts: this.sanitizeArray(input.facts, ObservationValidator.MAX_FACTS),
      concepts: this.sanitizeConcepts(input.concepts),
      files_read: this.sanitizeArray(input.files_read, ObservationValidator.MAX_FILES),
      files_modified: this.sanitizeArray(input.files_modified, ObservationValidator.MAX_FILES),
      project: input.project?.trim(),
      prompt_number: input.prompt_number,
    };
  }

  private validateType(type?: string): void {
    if (!type) {
      this.addError('type', 'Type is required');
      return;
    }

    if (!ObservationValidator.VALID_TYPES.includes(type)) {
      this.addError('type', `Invalid type. Must be one of: ${ObservationValidator.VALID_TYPES.join(', ')}`, type);
    }
  }

  private validateTitle(title?: string): void {
    if (!title || title.trim().length === 0) {
      this.addError('title', 'Title is required');
      return;
    }

    if (title.length > ObservationValidator.MAX_TITLE_LENGTH) {
      this.addWarning('title', `Title exceeds ${ObservationValidator.MAX_TITLE_LENGTH} characters, will be truncated`);
    }
  }

  private validateSubtitle(subtitle?: string): void {
    if (subtitle && subtitle.length > ObservationValidator.MAX_SUBTITLE_LENGTH) {
      this.addWarning('subtitle', `Subtitle exceeds ${ObservationValidator.MAX_SUBTITLE_LENGTH} characters, will be truncated`);
    }
  }

  private validateNarrative(narrative?: string): void {
    if (narrative && narrative.length > ObservationValidator.MAX_NARRATIVE_LENGTH) {
      this.addWarning('narrative', `Narrative exceeds ${ObservationValidator.MAX_NARRATIVE_LENGTH} characters, will be truncated`);
    }
  }

  private validateFacts(facts?: string[]): void {
    if (!facts) return;

    if (!Array.isArray(facts)) {
      this.addError('facts', 'Facts must be an array');
      return;
    }

    if (facts.length > ObservationValidator.MAX_FACTS) {
      this.addWarning('facts', `Too many facts (${facts.length}), will be limited to ${ObservationValidator.MAX_FACTS}`);
    }

    for (let i = 0; i < facts.length; i++) {
      if (typeof facts[i] !== 'string') {
        this.addError('facts', `Fact at index ${i} must be a string`);
      }
    }
  }

  private validateConcepts(concepts?: string[]): void {
    if (!concepts) return;

    if (!Array.isArray(concepts)) {
      this.addError('concepts', 'Concepts must be an array');
      return;
    }

    if (concepts.length > ObservationValidator.MAX_CONCEPTS) {
      this.addWarning('concepts', `Too many concepts (${concepts.length}), will be limited to ${ObservationValidator.MAX_CONCEPTS}`);
    }

    for (let i = 0; i < concepts.length; i++) {
      if (typeof concepts[i] !== 'string') {
        this.addError('concepts', `Concept at index ${i} must be a string`);
      }
    }
  }

  private validateFiles(field: string, files?: string[]): void {
    if (!files) return;

    if (!Array.isArray(files)) {
      this.addError(field, `${field} must be an array`);
      return;
    }

    if (files.length > ObservationValidator.MAX_FILES) {
      this.addWarning(field, `Too many files (${files.length}), will be limited to ${ObservationValidator.MAX_FILES}`);
    }
  }

  private validateProject(project?: string): void {
    if (!project || project.trim().length === 0) {
      this.addError('project', 'Project is required');
    }
  }

  private validatePromptNumber(promptNumber?: number): void {
    if (promptNumber !== undefined && (typeof promptNumber !== 'number' || promptNumber < 1)) {
      this.addError('prompt_number', 'Prompt number must be a positive integer');
    }
  }

  private sanitizeType(type?: string): string {
    if (!type || !ObservationValidator.VALID_TYPES.includes(type)) {
      return 'discovery';
    }
    return type;
  }

  private sanitizeString(value?: string, maxLength?: number): string | undefined {
    if (!value) return undefined;
    const trimmed = value.trim();
    if (maxLength && trimmed.length > maxLength) {
      return trimmed.slice(0, maxLength);
    }
    return trimmed;
  }

  private sanitizeArray(arr?: string[], maxLength?: number): string[] | undefined {
    if (!arr || !Array.isArray(arr)) return undefined;
    const filtered = arr.filter(item => typeof item === 'string' && item.trim().length > 0);
    if (maxLength && filtered.length > maxLength) {
      return filtered.slice(0, maxLength);
    }
    return filtered;
  }

  private sanitizeConcepts(concepts?: string[]): string[] | undefined {
    if (!concepts) return undefined;
    return this.sanitizeArray(
      concepts.map(c => c.toLowerCase().trim().replace(/\s+/g, '-')),
      ObservationValidator.MAX_CONCEPTS
    );
  }

  private addError(field: string, message: string, value?: any): void {
    this.errors.push({ field, message, value });
  }

  private addWarning(field: string, message: string, value?: any): void {
    this.warnings.push({ field, message, value });
  }
}
