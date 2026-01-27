/**
 * Type Filter
 * 
 * Filter observations by type.
 */

export type ObservationType = 
  | 'discovery' 
  | 'decision' 
  | 'implementation' 
  | 'issue' 
  | 'learning' 
  | 'reference';

export class TypeFilter {
  private selectedTypes: Set<ObservationType> = new Set();
  private excludedTypes: Set<ObservationType> = new Set();

  /**
   * Select a type
   */
  select(type: ObservationType): void {
    this.selectedTypes.add(type);
    this.excludedTypes.delete(type);
  }

  /**
   * Select multiple types
   */
  selectMultiple(types: ObservationType[]): void {
    for (const type of types) {
      this.select(type);
    }
  }

  /**
   * Deselect a type
   */
  deselect(type: ObservationType): void {
    this.selectedTypes.delete(type);
  }

  /**
   * Exclude a type
   */
  exclude(type: ObservationType): void {
    this.excludedTypes.add(type);
    this.selectedTypes.delete(type);
  }

  /**
   * Toggle a type
   */
  toggle(type: ObservationType): boolean {
    if (this.selectedTypes.has(type)) {
      this.deselect(type);
      return false;
    } else {
      this.select(type);
      return true;
    }
  }

  /**
   * Check if a type is selected
   */
  isSelected(type: ObservationType): boolean {
    return this.selectedTypes.has(type);
  }

  /**
   * Check if a type is excluded
   */
  isExcluded(type: ObservationType): boolean {
    return this.excludedTypes.has(type);
  }

  /**
   * Get selected types
   */
  getSelected(): ObservationType[] {
    return Array.from(this.selectedTypes);
  }

  /**
   * Get excluded types
   */
  getExcluded(): ObservationType[] {
    return Array.from(this.excludedTypes);
  }

  /**
   * Clear filter
   */
  clear(): void {
    this.selectedTypes.clear();
    this.excludedTypes.clear();
  }

  /**
   * Check if a type matches the filter
   */
  matches(type: string): boolean {
    // If excluded, always false
    if (this.excludedTypes.has(type as ObservationType)) {
      return false;
    }

    // If no selection, match all (except excluded)
    if (this.selectedTypes.size === 0) {
      return true;
    }

    // Otherwise, must be in selection
    return this.selectedTypes.has(type as ObservationType);
  }

  /**
   * Filter an array of items
   */
  filter<T>(items: T[], getType: (item: T) => string): T[] {
    return items.filter(item => this.matches(getType(item)));
  }

  /**
   * Check if filter is active
   */
  isActive(): boolean {
    return this.selectedTypes.size > 0 || this.excludedTypes.size > 0;
  }

  /**
   * Get description
   */
  getDescription(): string {
    if (!this.isActive()) return 'All types';

    if (this.selectedTypes.size > 0) {
      const types = this.getSelected();
      if (types.length === 1) {
        return types[0];
      }
      return `${types.length} types`;
    }

    if (this.excludedTypes.size > 0) {
      return `Excluding ${this.excludedTypes.size} types`;
    }

    return 'All types';
  }

  /**
   * Select only one type
   */
  selectOnly(type: ObservationType): void {
    this.clear();
    this.select(type);
  }

  /**
   * Get all available types
   */
  static getAllTypes(): ObservationType[] {
    return ['discovery', 'decision', 'implementation', 'issue', 'learning', 'reference'];
  }

  /**
   * Get type display info
   */
  static getTypeInfo(type: ObservationType): { label: string; icon: string; color: string } {
    const info: Record<ObservationType, { label: string; icon: string; color: string }> = {
      discovery: { label: 'Discovery', icon: '🔍', color: '#58a6ff' },
      decision: { label: 'Decision', icon: '⚖️', color: '#a371f7' },
      implementation: { label: 'Implementation', icon: '🔧', color: '#3fb950' },
      issue: { label: 'Issue', icon: '🐛', color: '#f85149' },
      learning: { label: 'Learning', icon: '📚', color: '#d29922' },
      reference: { label: 'Reference', icon: '🔗', color: '#79c0ff' },
    };
    return info[type];
  }
}
