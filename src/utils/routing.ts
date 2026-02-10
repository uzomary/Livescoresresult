export const createMatchUrl = (homeTeam: string, awayTeam: string, matchId: string) => {
    const createSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = `${createSlug(homeTeam)}-vs-${createSlug(awayTeam)}`;
    return `/match/${slug}/${matchId}`;
};
