import { UserProfile, Interaction } from '../types';

const STORAGE_KEY = 'ai_tarot_user_profile';

export const memoryService = {
  getProfile(): UserProfile {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error('Failed to parse profile', e);
      }
    }
    return {
      history: [],
    };
  },

  saveProfile(profile: UserProfile) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  },

  updateSummary(summary: string) {
    const profile = this.getProfile();
    profile.summary = (profile.summary || '') + '\n' + summary;
    this.saveProfile(profile);
  },

  addInteraction(interaction: Interaction) {
    const profile = this.getProfile();
    profile.history.push(interaction);
    profile.lastVisit = Date.now();
    
    // Simple summary update logic (could be improved by AI periodically)
    // For now, just save.
    this.saveProfile(profile);
  },

  clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
  }
};
