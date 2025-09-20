import L from 'leaflet'
import {
  AccessHazards,
  HazardousMaterials,
  HazardPointsDetailed,
  HumanCausedHazards,
  Incident,
  Infrastructure,
  Lifelines,
  NaturalHazards,
  NIMSPositions,
  Preplan,
  PublicAlert,
  Resources,
  USAR,
} from './hazardIconData'

// Hazard Icons Configuration
// This file loads and organizes hazard icons from the assets folder

// Import all SVG icons dynamically
const iconModules = import.meta.glob('/src/assets/icons/**/*.svg', { eager: true })

// Parse icon names from the readme files to get proper names
const hazardIconData = {
  AccessHazards,
  HazardousMaterials,
  HazardPointsDetailed,
  HumanCausedHazards,
  Incident,
  Infrastructure,
  Lifelines,
  NaturalHazards,
  NIMSPositions,
  Preplan,
  PublicAlert,
  Resources,
  USAR,
}

// Function to get icon URL by iconId
export const getIconUrl = (iconId) => {
  // Try to find the icon in the imported modules
  //   const iconPath = `/src/assets/icons/**/icon-${iconId}.svg`

  // Search through all imported modules to find the matching icon
  for (const path in iconModules) {
    if (path.includes(`icon-${iconId}.svg`)) {
      return iconModules[path].default
    }
  }

  // Return a default icon if not found
  return null
}

// Function to get all icons by category
export const getIconsByCategory = (category) => {
  return hazardIconData[category] || []
}

// Function to get all available categories
export const getAvailableCategories = () => {
  return Object.keys(hazardIconData)
}

// Function to get icon data by iconId
export const getIconData = (iconId) => {
  for (const category of Object.values(hazardIconData)) {
    const icon = category.find((icon) => icon.iconId === iconId)
    if (icon) {
      return icon
    }
  }
  return null
}

// Function to get all icons
export const getAllIcons = () => {
  return Object.values(hazardIconData).flat()
}

// Function to search icons by name
export const searchIcons = (searchTerm) => {
  const allIcons = getAllIcons()
  return allIcons.filter(
    (icon) =>
      icon.iconName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      icon.iconDesc.toLowerCase().includes(searchTerm.toLowerCase()),
  )
}

// Function to create Leaflet icon from SVG
export const createLeafletIcon = (iconId, size = 32) => {
  const iconUrl = getIconUrl(iconId)

  if (!iconUrl) {
    // Fallback to default icon
    return L.divIcon({
      className: 'hazard-icon',
      html: `<div style="
        width: ${size}px;
        height: ${size}px;
        background-color: #ff4444;
        border: 2px solid #ffffff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${size * 0.4}px;
      ">${iconId}</div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    })
  }

  return L.icon({
    iconUrl: iconUrl,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}
