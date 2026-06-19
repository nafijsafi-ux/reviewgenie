export interface HistoryEntry {
  id: string;
  date: string;
  reviewText: string;
  reply: string;
  tone: string;
  sentiment: "positive" | "neutral" | "negative";
  starRating: number;
  businessName?: string;
  platform?: "Google" | "Facebook" | "Neither";
}

export interface BusinessProfile {
  businessName: string;
  industry: string;
  defaultPlatform: "Google" | "Facebook" | "Neither";
  defaultTone: string;
}

const HISTORY_KEY = "rg_history";
const PROFILE_KEY = "rg_business_profile";

export function getHistory(): HistoryEntry[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function saveToHistory(entry: Omit<HistoryEntry, "id" | "date">): HistoryEntry {
  const history = getHistory();
  const newEntry: HistoryEntry = {
    ...entry,
    id: Math.random().toString(36).substring(2, 9),
    date: new Date().toISOString(),
  };
  history.unshift(newEntry);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  return newEntry;
}

export function deleteFromHistory(id: string): void {
  const history = getHistory();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.filter((e) => e.id !== id)));
}

export function getProfile(): BusinessProfile {
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    return data ? JSON.parse(data) : {
      businessName: "",
      industry: "Retail",
      defaultPlatform: "Google",
      defaultTone: "Professional",
    };
  } catch (e) {
    return {
      businessName: "",
      industry: "Retail",
      defaultPlatform: "Google",
      defaultTone: "Professional",
    };
  }
}

export function saveProfile(profile: BusinessProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}
