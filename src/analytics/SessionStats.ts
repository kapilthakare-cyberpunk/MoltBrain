/**
 * Session Statistics
 * 
 * Provides analytics and insights about sessions.
 */

export interface SessionMetrics {
  id: string;
  project: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  promptCount: number;
  observationCount: number;
  filesRead: Set<string>;
  filesModified: Set<string>;
  concepts: Set<string>;
  tokensUsed: number;
}

export interface ProjectStats {
  project: string;
  sessionCount: number;
  totalObservations: number;
  totalPrompts: number;
  totalTokens: number;
  averageSessionDuration: number;
  topConcepts: Array<{ concept: string; count: number }>;
  filesModified: number;
  lastActivity: number;
}

export interface ActivityPattern {
  hourOfDay: number[];  // 24 slots
  dayOfWeek: number[];  // 7 slots
  weeklyTrend: Array<{ week: string; sessions: number }>;
}

export class SessionStats {
  private sessions: Map<string, SessionMetrics> = new Map();
  private conceptCounts: Map<string, number> = new Map();
  private projectConcepts: Map<string, Map<string, number>> = new Map();

  /**
   * Start tracking a new session
   */
  startSession(id: string, project: string): void {
    this.sessions.set(id, {
      id,
      project,
      startTime: Date.now(),
      promptCount: 0,
      observationCount: 0,
      filesRead: new Set(),
      filesModified: new Set(),
      concepts: new Set(),
      tokensUsed: 0,
    });
  }

  /**
   * End a session
   */
  endSession(id: string): void {
    const session = this.sessions.get(id);
    if (session) {
      session.endTime = Date.now();
      session.duration = session.endTime - session.startTime;
    }
  }

  /**
   * Record a prompt in a session
   */
  recordPrompt(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.promptCount++;
    }
  }

  /**
   * Record an observation in a session
   */
  recordObservation(
    sessionId: string,
    concepts: string[],
    filesRead: string[],
    filesModified: string[],
    tokens: number
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.observationCount++;
    session.tokensUsed += tokens;

    for (const file of filesRead) {
      session.filesRead.add(file);
    }

    for (const file of filesModified) {
      session.filesModified.add(file);
    }

    for (const concept of concepts) {
      session.concepts.add(concept);
      
      // Global concept count
      const count = this.conceptCounts.get(concept) || 0;
      this.conceptCounts.set(concept, count + 1);

      // Project concept count
      if (!this.projectConcepts.has(session.project)) {
        this.projectConcepts.set(session.project, new Map());
      }
      const projectMap = this.projectConcepts.get(session.project)!;
      const projectCount = projectMap.get(concept) || 0;
      projectMap.set(concept, projectCount + 1);
    }
  }

  /**
   * Get session metrics
   */
  getSession(id: string): SessionMetrics | undefined {
    return this.sessions.get(id);
  }

  /**
   * Get all sessions for a project
   */
  getProjectSessions(project: string): SessionMetrics[] {
    return Array.from(this.sessions.values())
      .filter(s => s.project === project);
  }

  /**
   * Get project statistics
   */
  getProjectStats(project: string): ProjectStats {
    const sessions = this.getProjectSessions(project);
    
    const totalObservations = sessions.reduce((sum, s) => sum + s.observationCount, 0);
    const totalPrompts = sessions.reduce((sum, s) => sum + s.promptCount, 0);
    const totalTokens = sessions.reduce((sum, s) => sum + s.tokensUsed, 0);
    
    const completedSessions = sessions.filter(s => s.duration !== undefined);
    const averageSessionDuration = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / completedSessions.length
      : 0;

    const filesModified = new Set<string>();
    for (const session of sessions) {
      for (const file of session.filesModified) {
        filesModified.add(file);
      }
    }

    const lastActivity = sessions.length > 0
      ? Math.max(...sessions.map(s => s.endTime || s.startTime))
      : 0;

    // Top concepts for project
    const projectConceptMap = this.projectConcepts.get(project) || new Map();
    const topConcepts = Array.from(projectConceptMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([concept, count]) => ({ concept, count }));

    return {
      project,
      sessionCount: sessions.length,
      totalObservations,
      totalPrompts,
      totalTokens,
      averageSessionDuration,
      topConcepts,
      filesModified: filesModified.size,
      lastActivity,
    };
  }

  /**
   * Get global top concepts
   */
  getTopConcepts(limit: number = 20): Array<{ concept: string; count: number }> {
    return Array.from(this.conceptCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([concept, count]) => ({ concept, count }));
  }

  /**
   * Get activity patterns
   */
  getActivityPatterns(): ActivityPattern {
    const hourOfDay = new Array(24).fill(0);
    const dayOfWeek = new Array(7).fill(0);
    const weeklyMap = new Map<string, number>();

    for (const session of this.sessions.values()) {
      const date = new Date(session.startTime);
      
      // Hour of day
      hourOfDay[date.getHours()]++;
      
      // Day of week (0 = Sunday)
      dayOfWeek[date.getDay()]++;
      
      // Weekly trend
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      const weekCount = weeklyMap.get(weekKey) || 0;
      weeklyMap.set(weekKey, weekCount + 1);
    }

    const weeklyTrend = Array.from(weeklyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12) // Last 12 weeks
      .map(([week, sessions]) => ({ week, sessions }));

    return { hourOfDay, dayOfWeek, weeklyTrend };
  }

  /**
   * Get productivity insights
   */
  getProductivityInsights(): {
    mostProductiveHour: number;
    mostProductiveDay: string;
    averageSessionLength: number;
    averageObservationsPerSession: number;
  } {
    const patterns = this.getActivityPatterns();
    
    // Most productive hour
    let mostProductiveHour = 0;
    let maxHourActivity = 0;
    for (let i = 0; i < 24; i++) {
      if (patterns.hourOfDay[i] > maxHourActivity) {
        maxHourActivity = patterns.hourOfDay[i];
        mostProductiveHour = i;
      }
    }

    // Most productive day
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let mostProductiveDayIndex = 0;
    let maxDayActivity = 0;
    for (let i = 0; i < 7; i++) {
      if (patterns.dayOfWeek[i] > maxDayActivity) {
        maxDayActivity = patterns.dayOfWeek[i];
        mostProductiveDayIndex = i;
      }
    }

    // Average session length
    const completedSessions = Array.from(this.sessions.values())
      .filter(s => s.duration !== undefined);
    const averageSessionLength = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / completedSessions.length
      : 0;

    // Average observations per session
    const allSessions = Array.from(this.sessions.values());
    const averageObservationsPerSession = allSessions.length > 0
      ? allSessions.reduce((sum, s) => sum + s.observationCount, 0) / allSessions.length
      : 0;

    return {
      mostProductiveHour,
      mostProductiveDay: days[mostProductiveDayIndex],
      averageSessionLength,
      averageObservationsPerSession,
    };
  }

  /**
   * Get summary statistics
   */
  getSummary(): {
    totalSessions: number;
    totalObservations: number;
    totalProjects: number;
    totalTokens: number;
    uniqueConcepts: number;
  } {
    const sessions = Array.from(this.sessions.values());
    const projects = new Set(sessions.map(s => s.project));

    return {
      totalSessions: sessions.length,
      totalObservations: sessions.reduce((sum, s) => sum + s.observationCount, 0),
      totalProjects: projects.size,
      totalTokens: sessions.reduce((sum, s) => sum + s.tokensUsed, 0),
      uniqueConcepts: this.conceptCounts.size,
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.sessions.clear();
    this.conceptCounts.clear();
    this.projectConcepts.clear();
  }
}

// Singleton instance
let instance: SessionStats | null = null;

export function getSessionStats(): SessionStats {
  if (!instance) {
    instance = new SessionStats();
  }
  return instance;
}
