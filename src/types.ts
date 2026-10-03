export type UserRole = 'renter' | 'owner' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  verified: boolean;
  bio?: string;
  city?: string;
  memberSince: string;
}

export type PropertyType =
  | 'PG / Co-Living'
  | '1 RK'
  | '1 BHK'
  | '2 BHK'
  | '3 BHK'
  | '4+ BHK'
  | 'Independent House / Villa';

export type FurnishingStatus = 'Furnished' | 'Semi-Furnished' | 'Unfurnished';

export type PreferredTenant = 'All' | 'Family' | 'Bachelors' | 'Female Only' | 'Male Only' | 'Company Lease';

export type PropertyStatus = 'published' | 'in_review' | 'unavailable' | 'rejected' | 'draft';

export interface Property {
  id: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  rentMonthly: number; // in INR
  securityDeposit: number; // in INR
  maintenanceCharges: number; // in INR per month (0 if included)
  brokerageFee: number; // 0 - strictly zero brokerage
  electricityChargesNote: string;
  waterChargesNote: string;
  city: string;
  locality: string;
  address: string;
  landmark: string;
  state: string;
  pincode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  furnishing: FurnishingStatus;
  availableFrom: string; // 'Immediate' | date string
  preferredTenant: PreferredTenant;
  bedrooms: number;
  bathrooms: number;
  balconies: number;
  superBuiltUpArea: number; // in sq ft
  carpetArea: number; // in sq ft
  floorNumber: number;
  totalFloors: number;
  parking: 'Bike Only' | 'Car & Bike' | 'Covered Car' | 'No Parking';
  foodIncluded?: boolean; // for PGs
  genderPreference?: 'Female Only' | 'Male Only' | 'Co-ed / Any';
  images: string[];
  amenities: string[];
  rules: string[];
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerVerified: boolean;
  ownerResponseTime: string;
  status: PropertyStatus;
  rejectionReason?: string;
  viewsCount: number;
  enquiriesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryReply {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  timestamp: string;
}

export interface Enquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyCity: string;
  propertyLocality: string;
  propertyImage: string;
  propertyRent: number;
  renterId: string;
  renterName: string;
  renterEmail: string;
  renterPhone: string;
  ownerId: string;
  ownerName: string;
  message: string;
  preferredMoveInDate?: string;
  status: 'new' | 'replied' | 'closed';
  createdAt: string;
  replies: EnquiryReply[];
}

export interface VisitRequest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyCity: string;
  propertyAddress: string;
  propertyImage: string;
  renterId: string;
  renterName: string;
  renterPhone: string;
  renterEmail: string;
  ownerId: string;
  ownerName: string;
  visitDate: string;
  visitTimeSlot: 'Morning (10:00 AM - 12:00 PM)' | 'Afternoon (02:00 PM - 04:00 PM)' | 'Evening (05:00 PM - 07:00 PM)';
  notes?: string;
  status: 'pending' | 'confirmed' | 'rescheduled' | 'completed' | 'cancelled';
  ownerNotes?: string;
  createdAt: string;
}

export interface Report {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyCity: string;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  reason: 'misleading_photos' | 'broker_disguised' | 'incorrect_rent' | 'fake_property' | 'offensive_owner' | 'already_rented';
  details: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  adminNotes?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: 'property' | 'user' | 'report' | 'system';
  targetId: string;
  details: string;
  timestamp: string;
}

export interface SearchFilters {
  q?: string;
  city?: string;
  locality?: string;
  propertyType?: string;
  minRent?: number;
  maxRent?: number;
  furnishing?: string;
  preferredTenant?: string;
  amenities?: string[];
  availability?: string;
  sortBy?: 'recommended' | 'price_low' | 'price_high' | 'newest';
}
