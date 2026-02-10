// Team name shortening utility for mobile displays
export const shortenTeamName = (teamName: string, isMobile: boolean = false): string => {
  if (!isMobile) return teamName;

  // Common team name abbreviations for mobile
  const abbreviations: Record<string, string> = {
    // Premier League
    'Manchester United': 'Man Utd',
    'Manchester City': 'Man City',
    'Tottenham Hotspur': 'Tottenham',
    'Leicester City': 'Leicester',
    'Newcastle United': 'Newcastle',
    'Sheffield United': 'Sheffield Utd',
    'West Ham United': 'West Ham',
    'Wolverhampton Wanderers': 'Wolves',
    'Brighton & Hove Albion': 'Brighton',
    'Crystal Palace': 'Palace',
    
    // La Liga
    'Real Madrid': 'Real Madrid',
    'FC Barcelona': 'Barcelona',
    'Barcelona': 'Barcelona',
    'Atletico Madrid': 'Atletico',
    'Athletic Bilbao': 'Athletic',
    'Real Sociedad': 'Sociedad',
    'Real Betis': 'Betis',
    'Villarreal CF': 'Villarreal',
    
    // Serie A
    'Juventus': 'Juventus',
    'AC Milan': 'Milan',
    'Inter Milan': 'Inter',
    'AS Roma': 'Roma',
    'SSC Napoli': 'Napoli',
    'Atalanta BC': 'Atalanta',
    'Hellas Verona': 'Verona',
    
    // Bundesliga
    'Bayern Munich': 'Bayern',
    'Borussia Dortmund': 'Dortmund',
    'Borussia Monchengladbach': 'Gladbach',
    'Bayer Leverkusen': 'Leverkusen',
    'Eintracht Frankfurt': 'Frankfurt',
    'FC Schalke 04': 'Schalke',
    'TSG Hoffenheim': 'Hoffenheim',
    
    // Ligue 1
    'Paris Saint-Germain': 'PSG',
    'Olympique Marseille': 'Marseille',
    'Olympique Lyon': 'Lyon',
    'AS Monaco': 'Monaco',
    'Stade Rennais': 'Rennes',
    
    // Other common patterns
    'Football Club': 'FC',
    'Association Sportive': 'AS',
    'Club de Foot': 'CF',
    'Sporting Club': 'SC',
  };

  // Check for exact match first
  if (abbreviations[teamName]) {
    return abbreviations[teamName];
  }

  // Apply pattern-based shortening
  let shortened = teamName;

  // Remove common suffixes
  shortened = shortened.replace(/\s+(FC|CF|SC|AC|AS|United|City|Town|Rovers|Wanderers|Athletic|Sporting)$/i, '');
  
  // Shorten specific patterns
  shortened = shortened.replace(/^FC\s+/, '');
  shortened = shortened.replace(/^AC\s+/, '');
  shortened = shortened.replace(/^AS\s+/, '');
  shortened = shortened.replace(/^SC\s+/, '');
  
  // If still too long (>12 characters), truncate intelligently
  if (shortened.length > 12) {
    const words = shortened.split(' ');
    if (words.length > 1) {
      // Take first word if it's meaningful, otherwise first two words
      shortened = words[0].length >= 4 ? words[0] : words.slice(0, 2).join(' ');
    }
    
    // Final truncation if still too long
    if (shortened.length > 12) {
      shortened = shortened.substring(0, 10) + '...';
    }
  }

  return shortened || teamName; // Fallback to original if something went wrong
};
