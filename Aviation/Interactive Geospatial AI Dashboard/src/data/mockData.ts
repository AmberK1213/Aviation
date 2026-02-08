// Constants for filter options and styling
// These are still used by FilterControls and other components

export const SPECIES = [
  'Brown Pelican',
  'Royal Tern',
  'Sandwich Tern',
  'Black Skimmer',
  'Laughing Gull',
  'Reddish Egret',
  'White Ibis',
  'Roseate Spoonbill',
  'Unidentified Bird', // Added for YOLO generic detections
];

export const HABITATS = [
  'Barrier Island',
  'Coastal Marsh',
  'Mangrove',
  'Sandy Beach',
  'Oyster Reef',
  'Tidal Flat',
  'Coastal Habitat', // Added as default from API
];

export const getSpeciesColor = (species: string): string => {
  const colors: Record<string, string> = {
    'Brown Pelican': '#8B4513',
    'Royal Tern': '#4169E1',
    'Sandwich Tern': '#87CEEB',
    'Black Skimmer': '#2F4F4F',
    'Laughing Gull': '#708090',
    'Reddish Egret': '#CD5C5C',
    'White Ibis': '#F0F8FF',
    'Roseate Spoonbill': '#FF69B4',
    'Unidentified Bird': '#9CA3AF',
  };
  return colors[species] || '#666666';
};

export const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    'high': '#EF4444',
    'medium': '#F59E0B',
    'low': '#10B981',
  };
  return colors[priority] || '#6B7280';
};
