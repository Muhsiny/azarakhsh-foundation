export type SearchFilters = { q: string; type: string; topic: string; language: string };
export const emptyFilters: SearchFilters = { q: "", type: "all", topic: "", language: "all" };
export const typeLabels: Record<string, string> = { article: "مقالات و پژوهش‌ها", book: "کتاب‌ها", document: "اسناد", biography: "زندگی‌نامه", "oral-history": "تاریخ شفاهی", image: "تصاویر", video: "ویدیو", audio: "صوت", news: "اخبار بنیاد", page: "صفحات پژوهشی" };
export function normalizeSearch(value: string) { return value.normalize("NFKC").replace(/ي|ى/g, "ی").replace(/ك/g, "ک").replace(/[\u064B-\u065F\u0670\u0640\u200C\u200D]/g, "").replace(/\s+/g, " ").trim().toLowerCase(); }
export function readFilters(params: URLSearchParams): SearchFilters {
  const type = params.get("type") || "all";
  const language = params.get("language") || "all";
  return { q: params.get("q") || "", topic: params.get("topic") || "", type: type in typeLabels ? type : "all", language: ["fa", "ps", "en"].includes(language) ? language : "all" };
}
export function matchesFilters(post: { title: string; excerpt: string; category: string; tags: string; contentType: string; language: string }, filters: SearchFilters) {
  const haystack = normalizeSearch(`${post.title} ${post.excerpt} ${post.category} ${post.tags}`);
  const terms = normalizeSearch(filters.q).split(" ").filter(Boolean);
  const aliases: Record<string, string[]> = { council: ["شورای اتفاق", "شوراى اتفاق", "council"], beheshti: ["بهشتی", "beheshti"], history: ["تاریخ", "معاصر", "history"] };
  const topics = aliases[filters.topic] || (filters.topic ? [filters.topic] : []);
  return terms.every(term => haystack.includes(term)) && (!topics.length || topics.some(term => haystack.includes(normalizeSearch(term)))) && (filters.type === "all" || filters.type === post.contentType) && (filters.language === "all" || filters.language === post.language);
}
