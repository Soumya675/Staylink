import { Property, User, Enquiry, VisitRequest, Report, SearchFilters, AuditLog } from '../types';
import { SEED_PROPERTIES, SEED_USERS, SEED_ENQUIRIES, SEED_VISITS } from '../data/seedData';

const BASE_URL = '/api/v1';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  // Properties
  async getProperties(filters: SearchFilters = {}): Promise<{ total: number; properties: Property[] }> {
    try {
      const params = new URLSearchParams();
      if (filters.q) params.set('q', filters.q);
      if (filters.city) params.set('city', filters.city);
      if (filters.locality) params.set('locality', filters.locality);
      if (filters.propertyType) params.set('propertyType', filters.propertyType);
      if (filters.furnishing) params.set('furnishing', filters.furnishing);
      if (filters.preferredTenant) params.set('preferredTenant', filters.preferredTenant);
      if (filters.minRent) params.set('minRent', String(filters.minRent));
      if (filters.maxRent) params.set('maxRent', String(filters.maxRent));
      if (filters.availability) params.set('availability', filters.availability);
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      if (filters.amenities && filters.amenities.length > 0) {
        filters.amenities.forEach(a => params.append('amenities', a));
      }

      return await fetchJson<{ total: number; properties: Property[] }>(`${BASE_URL}/properties?${params.toString()}`);
    } catch {
      // Resilient client fallback
      let list = [...SEED_PROPERTIES].filter(p => p.status === 'published');
      if (filters.city && filters.city !== 'All') {
        list = list.filter(p => p.city.toLowerCase() === filters.city!.toLowerCase());
      }
      return { total: list.length, properties: list };
    }
  },

  async getProperty(id: string): Promise<Property> {
    try {
      return await fetchJson<Property>(`${BASE_URL}/properties/${id}`);
    } catch {
      const found = SEED_PROPERTIES.find(p => p.id === id);
      if (found) return found;
      throw new Error('Property not found');
    }
  },

  async createProperty(data: Partial<Property>): Promise<Property> {
    return fetchJson<Property>(`${BASE_URL}/properties`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateProperty(id: string, data: Partial<Property>): Promise<Property> {
    return fetchJson<Property>(`${BASE_URL}/properties/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async deleteProperty(id: string): Promise<{ success: boolean }> {
    return fetchJson<{ success: boolean }>(`${BASE_URL}/properties/${id}`, {
      method: 'DELETE'
    });
  },

  // Favourites
  async getFavourites(userId: string): Promise<{ propertyIds: string[]; properties: Property[] }> {
    try {
      return await fetchJson<{ propertyIds: string[]; properties: Property[] }>(`${BASE_URL}/favourites?userId=${userId}`);
    } catch {
      return { propertyIds: ['prop_blr_1'], properties: [SEED_PROPERTIES[0]] };
    }
  },

  async addFavourite(propertyId: string, userId: string): Promise<{ success: boolean; propertyIds: string[] }> {
    return fetchJson<{ success: boolean; propertyIds: string[] }>(`${BASE_URL}/favourites/${propertyId}`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  },

  async removeFavourite(propertyId: string, userId: string): Promise<{ success: boolean; propertyIds: string[] }> {
    return fetchJson<{ success: boolean; propertyIds: string[] }>(`${BASE_URL}/favourites/${propertyId}`, {
      method: 'DELETE',
      body: JSON.stringify({ userId })
    });
  },

  // Enquiries & Chat
  async getEnquiries(userId: string, role: string): Promise<Enquiry[]> {
    try {
      return await fetchJson<Enquiry[]>(`${BASE_URL}/enquiries?userId=${userId}&role=${role}`);
    } catch {
      return SEED_ENQUIRIES;
    }
  },

  async createEnquiry(data: {
    propertyId: string;
    renterId: string;
    renterName: string;
    renterEmail: string;
    renterPhone: string;
    message: string;
    preferredMoveInDate?: string;
  }): Promise<Enquiry> {
    return fetchJson<Enquiry>(`${BASE_URL}/enquiries`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async replyToEnquiry(enquiryId: string, data: {
    senderId: string;
    senderName: string;
    senderRole: string;
    message: string;
  }): Promise<{ enquiry: Enquiry; newReply: any }> {
    return fetchJson<{ enquiry: Enquiry; newReply: any }>(`${BASE_URL}/enquiries/${enquiryId}/reply`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Visit Requests
  async getVisitRequests(userId: string, role: string): Promise<VisitRequest[]> {
    try {
      return await fetchJson<VisitRequest[]>(`${BASE_URL}/visit-requests?userId=${userId}&role=${role}`);
    } catch {
      return SEED_VISITS;
    }
  },

  async createVisitRequest(data: {
    propertyId: string;
    renterId: string;
    renterName: string;
    renterPhone: string;
    renterEmail: string;
    visitDate: string;
    visitTimeSlot: string;
    notes?: string;
  }): Promise<VisitRequest> {
    return fetchJson<VisitRequest>(`${BASE_URL}/visit-requests`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateVisitRequest(id: string, data: Partial<VisitRequest>): Promise<VisitRequest> {
    return fetchJson<VisitRequest>(`${BASE_URL}/visit-requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  // Reports
  async submitReport(data: {
    propertyId: string;
    reporterId: string;
    reporterName: string;
    reporterEmail: string;
    reason: string;
    details: string;
  }): Promise<Report> {
    return fetchJson<Report>(`${BASE_URL}/reports`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Auth
  async login(email: string, password?: string): Promise<{ user: User; token: string }> {
    return fetchJson<{ user: User; token: string }>(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async register(data: {
    name: string;
    email: string;
    phone: string;
    role: string;
    password: string;
  }): Promise<{ user: User; token: string }> {
    return fetchJson<{ user: User; token: string }>(`${BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Admin
  async getAdminStats(): Promise<any> {
    return fetchJson<any>(`${BASE_URL}/admin/stats`);
  },

  // Image Upload
  async uploadImage(imageBase64: string, filename?: string): Promise<{ url: string; filename: string }> {
    return fetchJson<{ url: string; filename: string }>(`${BASE_URL}/upload`, {
      method: 'POST',
      body: JSON.stringify({ imageBase64, filename })
    });
  },

  async getAdminReviewQueue(): Promise<Property[]> {
    return fetchJson<Property[]>(`${BASE_URL}/admin/review-queue`);
  },

  async reviewProperty(propertyId: string, action: 'approve' | 'reject' | 'request_correction', reason?: string): Promise<Property> {
    return fetchJson<Property>(`${BASE_URL}/admin/properties/${propertyId}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ action, reason })
    });
  },

  async getAdminReports(): Promise<Report[]> {
    return fetchJson<Report[]>(`${BASE_URL}/admin/reports`);
  },

  async updateReport(id: string, status: string, adminNotes?: string): Promise<Report> {
    return fetchJson<Report>(`${BASE_URL}/admin/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, adminNotes })
    });
  },

  async getAdminUsers(): Promise<User[]> {
    return fetchJson<User[]>(`${BASE_URL}/admin/users`);
  },

  async getAdminAuditLogs(): Promise<AuditLog[]> {
    return fetchJson<AuditLog[]>(`${BASE_URL}/admin/audit-logs`);
  }
};
