// User
export interface UserResponse {
  id: string;
  username: string;
  email: string;
  roles: string[];
  emailVerified: boolean;
  createdAt: string;
}

// Pokemon
export interface PokemonResponse {
  id: string;
  number: string;
  name: string;
  idealHabitat: string | null;
  litterDrop: string | null;
  rarity: string | null;
  isEvent: boolean;
  isDitto: boolean;
  spritePath: string;
  types: string[];
  regions: string[];
  timeOfDay: string[];
  specialties: SpecialtyResponse[];
  favourites: FavouriteResponse[];
}

// Favourite
export interface FavouriteResponse {
  id: string;
  name: string;
  isFlavour: boolean;
}

// Item
export interface ItemResponse {
  id: string;
  name: string;
  description: string;
  category: string;
  obtainMethod: string;
  obtainDetails: string;
  type: string;
  colour: string;
  imagePath: string;
  favourites: FavouriteResponse[];
}

// Specialty
export interface SpecialtyResponse {
  id: string;
  name: string;
  description: string;
  imagePath: string;
}

// Habitat
export interface HabitatResponse {
  id: string;
  name: string;
  isEvent: boolean;
  imagePath: string;
  pokemonNumbers: string[];
}

// Housing Kit
export interface HousingKitResponse {
  id: string;
  name: string;
  floors: number;
  size: number;
  width: number;
  depth: number;
  height: number;
  imagePath: string;
}

// User Pokemon
export interface UserPokemonResponse {
  id: string;
  pokemonId: string;
  pokemonName: string;
  pokemonNumber: string;
  spritePath: string;
  houseId: string | null;
  houseName: string | null;
  homeless: boolean;
  warning: boolean;
}

// House
export interface HouseResponse {
  id: string;
  name: string;
  description: string;
  region: string;
  houseType: string;
  idealHabitat: string | null;
  width: number | null;
  depth: number | null;
  height: number | null;
  capacity: number;
  occupancy: number;
  housingKit: HousingKitResponse | null;
  habitatRef: HabitatResponse | null;
  items: ItemResponse[];
  assignedPokemon: UserPokemonResponse[];
  createdAt: string;
  updatedAt: string;
}

// House Suggestions
export interface HouseSuggestionsResponse {
  suggestions: PokemonResponse[];
  availableSlots: number;
}

// Dashboard
export interface DashboardResponse {
  totalPokemon: number;
  registeredPokemon: number;
  homelessPokemon: number;
  totalHouses: number;
  housesAtCapacity: number;
  pokemonWithWarnings: number;
  recentRegistrations: UserPokemonResponse[];
}

// Page
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

// Error
export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

// Requests
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface CreateHouseRequest {
  name: string;
  description?: string;
  region: string;
  houseType: string;
  idealHabitat?: string;
  width?: number;
  depth?: number;
  height?: number;
  housingKitId?: string;
  habitatRefId?: string;
}

export interface UpdateHouseRequest {
  name?: string;
  description?: string;
  idealHabitat?: string;
  width?: number;
  depth?: number;
  height?: number;
  habitatRefId?: string;
}

export interface ChangeHouseRegionRequest {
  newRegion: string;
  pokemonIdsToMove: string[];
}

export interface UpdateHouseItemsRequest {
  itemIds: string[];
}

// Enums as string arrays
export const REGIONS = [
  'Bleak Beach', 'Cloud Island', 'Palette Town',
  'Rocky Ridges', 'Sparkling Skylands', 'Withered Wastelands'
] as const;

export const IDEAL_HABITATS = [
  'BRIGHT', 'COOL', 'DARK', 'DRY', 'HUMID', 'WARM'
] as const;

export const HOUSE_TYPES = ['HABITAT', 'CUSTOM', 'KIT'] as const;

export const POKEMON_TYPES = [
  'Bug', 'Dark', 'Dragon', 'Electric', 'Fairy', 'Fighting', 'Fire', 'Flying',
  'Ghost', 'Grass', 'Ground', 'Ice', 'Normal', 'Poison', 'Psychic', 'Rock', 'Steel', 'Water'
] as const;

export const RARITIES = ['Common', 'Rare', 'Very Rare'] as const;

export const ITEM_TYPES = ['Decoration', 'Food', 'Relaxation', 'Road', 'Toy', 'None'] as const;
