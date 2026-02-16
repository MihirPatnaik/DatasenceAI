// Pattern-based storage system

class PatternStorage {
  constructor() {
    this.patterns = new Map();
    this.loadPatterns();
  }
  
  async loadPatterns() {
    const data = await chrome.storage.local.get(['patterns']);
    if (data.patterns) {
      this.patterns = new Map(data.patterns.map(p => [p.id, p]));
    }
    console.log(`Loaded ${this.patterns.size} patterns`);
  }
  
  async savePatterns() {
    const patternsArray = Array.from(this.patterns.values());
    await chrome.storage.local.set({ patterns: patternsArray });
  }
  
  addPattern(pattern) {
    const id = `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    pattern.id = id;
    pattern.createdAt = new Date().toISOString();
    pattern.confidence = pattern.confidence || 0.5;
    
    this.patterns.set(id, pattern);
    this.savePatterns();
    
    return id;
  }
  
  // Extract patterns from a successful post
  extractPatternsFromPost(post, performance) {
    const patterns = [];
    
    // Timing pattern
    if (post.scheduledTime && performance.engagement > 50) {
      const hour = new Date(post.scheduledTime).getHours();
      patterns.push({
        type: 'timing',
        insight: `Posts at ${hour}:00 get good engagement`,
        platform: post.platform,
        confidence: 0.7
      });
    }
    
    // Content type pattern
    const contentTypes = this.detectContentType(post.caption);
    contentTypes.forEach(type => {
      patterns.push({
        type: 'content',
        insight: `${type} content works well`,
        platform: post.platform,
        confidence: 0.6
      });
    });
    
    // Hashtag pattern
    if (post.hashtags) {
      const hashtags = post.hashtags.split(' ').filter(h => h.startsWith('#'));
      if (hashtags.length > 0) {
        patterns.push({
          type: 'hashtag',
          insight: `${hashtags.length} hashtags optimal`,
          platform: post.platform,
          confidence: 0.5
        });
      }
    }
    
    // Add all patterns
    patterns.forEach(pattern => this.addPattern(pattern));
    
    return patterns;
  }
  
  detectContentType(text) {
    const types = [];
    
    if (text.includes('?') || text.includes('how to') || text.includes('why')) {
      types.push('question');
    }
    
    if (text.includes('announcing') || text.includes('launch') || text.includes('new')) {
      types.push('announcement');
    }
    
    if (text.includes('case study') || text.includes('success story') || text.includes('customer')) {
      types.push('case_study');
    }
    
    if (text.length > 200) {
      types.push('long_form');
    } else if (text.length < 100) {
      types.push('short_form');
    }
    
    return types;
  }
  
  // Get suggestions based on patterns
  getSuggestions(platform, context = {}) {
    const platformPatterns = Array.from(this.patterns.values())
      .filter(p => p.platform === platform)
      .sort((a, b) => b.confidence - a.confidence);
    
    const suggestions = [];
    
    // Timing suggestions
    const timingPatterns = platformPatterns.filter(p => p.type === 'timing');
    if (timingPatterns.length > 0) {
      suggestions.push({
        type: 'timing',
        message: `Best posting times: ${timingPatterns.slice(0, 3).map(p => p.insight).join(', ')}`,
        confidence: timingPatterns[0].confidence
      });
    }
    
    // Content suggestions
    const contentPatterns = platformPatterns.filter(p => p.type === 'content');
    if (contentPatterns.length > 0) {
      suggestions.push({
        type: 'content',
        message: `Content that works: ${contentPatterns.slice(0, 3).map(p => p.insight).join(', ')}`,
        confidence: contentPatterns[0].confidence
      });
    }
    
    return suggestions;
  }
  
  // Clean old patterns
  async cleanOldPatterns(days = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    let removed = 0;
    
    for (const [id, pattern] of this.patterns.entries()) {
      const created = new Date(pattern.createdAt);
      if (created < cutoff && pattern.confidence < 0.7) {
        this.patterns.delete(id);
        removed++;
      }
    }
    
    if (removed > 0) {
      await this.savePatterns();
      console.log(`Cleaned ${removed} old patterns`);
    }
    
    return removed;
  }
}

// Export singleton instance
const patternStorage = new PatternStorage();

// Auto-clean patterns weekly
setInterval(() => {
  patternStorage.cleanOldPatterns();
}, 7 * 24 * 60 * 60 * 1000); // 7 days

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = patternStorage;
} else {
  window.patternStorage = patternStorage;
}