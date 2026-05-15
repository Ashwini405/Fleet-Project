// Derives flat axle position arrays from the single source of truth in axleLayouts.js
import { getPositions } from './Tyres/data/axleLayouts';

export function generateAxlePositions(wheelConfiguration) {
  return getPositions(wheelConfiguration);
}
