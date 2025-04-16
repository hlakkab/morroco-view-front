import { countryCodes } from './countryCodes';

export const getFlagUrl = (team: string): string => {
  const countryCode = countryCodes[team.toLowerCase().replace(/ /g, '-')] || 'dz';
  return `https://flagpedia.net/data/flags/h160/${countryCode}.webp`;
}; 