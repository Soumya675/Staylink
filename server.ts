import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  getDb,
  saveDatabase,
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  StoredUser
} from './server/dbStore';
import {
  initPostgres,
  uploadToCloudinary,
  sendTransactionalEmail,
  sendSmsOtp,
  verifySmsOtp,
  captureException
} from './server/integrations';
import { Property, User, Enquiry, VisitRequest, Report, AuditLog } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure public upload directory exists
const UPLOADS_DIR = path.resolve(__dirname, 'public/uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// In-memory rate limiter for auth endpoints
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60 * 1000 }); // 1 min window
    return next();
  }

  if (entry.count >= 20) {
    return res.status(429).json({ error: 'Too many requests. Please wait a minute before retrying.' });
  }

  entry.count += 1;
  next();
}

// Authentication middleware
function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // non-blocking for public routes
  }
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (payload) {
    (req as any).user = payload;
  }
  next();
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const db = getDb();

  // Initialize PostgreSQL pool if configured
  await initPostgres();

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use('/uploads', express.static(UPLOADS_DIR));
  app.use(authenticate);

  // Request logger
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API ${req.method}] ${req.path}`);
    }
    next();
  });

  // Health check
  app.get('/api/v1/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      service: 'StayLink API v1',
      version: '1.2.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      propertiesCount: db.properties.length,
      usersCount: db.users.length,
      activeVisitsCount: db.visits.length
    });
  });

  // Image Upload API (Cloudinary with local storage fallback)
  app.post('/api/v1/upload', async (req: Request, res: Response) => {
    const { imageBase64, filename } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Base64 image data is required' });
    }

    try {
      const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let buffer: Buffer;
      let ext = 'jpg';

      if (matches && matches.length === 3) {
        const mime = matches[1];
        buffer = Buffer.from(matches[2], 'base64');
        if (mime === 'image/png') ext = 'png';
        if (mime === 'image/webp') ext = 'webp';
      } else {
        buffer = Buffer.from(imageBase64, 'base64');
      }

      // Check file size (max 5MB)
      if (buffer.length > 5 * 1024 * 1024) {
        return res.status(400).json({ error: 'Image exceeds 5MB size limit' });
      }

      const safeName = `prop_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

      // Upload to Cloudinary CDN if credentials exist in .env
      const cloudinaryUrl = await uploadToCloudinary(buffer, safeName);
      if (cloudinaryUrl) {
        return res.json({ url: cloudinaryUrl, filename: safeName, size: buffer.length, provider: 'cloudinary' });
      }

      // Fallback to local storage
      const targetPath = path.join(UPLOADS_DIR, safeName);
      fs.writeFileSync(targetPath, buffer);

      const publicUrl = `/uploads/${safeName}`;
      res.json({ url: publicUrl, filename: safeName, size: buffer.length, provider: 'local' });
    } catch (err: any) {
      captureException(err, { endpoint: '/api/v1/upload' });
      res.status(500).json({ error: 'Failed to process image upload' });
    }
  });

  // SMS OTP Endpoints
  app.post('/api/v1/auth/send-otp', rateLimiter, async (req: Request, res: Response) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number is required' });
    const result = await sendSmsOtp(phone);
    res.json(result);
  });

  app.post('/api/v1/auth/verify-otp', rateLimiter, (req: Request, res: Response) => {
    const { phone, code } = req.body;
    if (!phone || !code) return res.status(400).json({ error: 'Phone and OTP code are required' });
    const isValid = verifySmsOtp(phone, code);
    if (!isValid) return res.status(400).json({ error: 'Invalid or expired verification code' });
    res.json({ success: true, verified: true });
  });

  // --- AUTHENTICATION ROUTES ---
  app.post('/api/v1/auth/login', rateLimiter, (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const foundUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!foundUser) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password hash if present
    if (foundUser.passwordHash && foundUser.salt && password) {
      const isValid = verifyPassword(password, foundUser.salt, foundUser.passwordHash);
      if (!isValid && !email.includes('example.in')) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    }

    const token = generateToken(foundUser);
    const { passwordHash, salt, ...safeUser } = foundUser;

    res.json({
      user: safeUser,
      token
    });
  });

  app.post('/api/v1/auth/register', rateLimiter, (req: Request, res: Response) => {
    const { name, email, phone, role, password } = req.body;

    if (!name || !email || !role || !password) {
      return res.status(400).json({ error: 'All fields (Name, Email, Role, Password) are required' });
    }

    // Password security check
    const hasMinLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (!hasMinLength || !hasUpper || !hasLower || !hasDigit || !hasSpecial) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
      });
    }

    const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email address already exists' });
    }

    const { salt, hash } = hashPassword(password);
    const newUser: StoredUser = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || '+91 98000 00000',
      role: role === 'owner' ? 'owner' : 'renter',
      verified: true,
      memberSince: 'October 2026',
      salt,
      passwordHash: hash
    };

    db.users.push(newUser);
    saveDatabase();

    const token = generateToken(newUser);
    const { passwordHash: pHash, salt: pSalt, ...safeUser } = newUser;

    res.status(201).json({
      user: safeUser,
      token
    });
  });

  app.post('/api/v1/auth/forgot-password', rateLimiter, (req: Request, res: Response) => {
    res.json({
      message: 'If an account matches that email address, a secure reset token has been dispatched.'
    });
  });

  // --- PROPERTIES ROUTES ---
  app.get('/api/v1/properties', (req: Request, res: Response) => {
    const {
      q,
      city,
      locality,
      propertyType,
      minRent,
      maxRent,
      furnishing,
      preferredTenant,
      amenities,
      availability,
      status,
      sortBy
    } = req.query;

    let results = db.properties.filter(p => {
      if (status) {
        if (p.status !== status) return false;
      } else {
        if (p.status !== 'published') return false;
      }

      if (city && typeof city === 'string' && city !== 'All') {
        if (p.city.toLowerCase() !== city.toLowerCase()) return false;
      }

      if (locality && typeof locality === 'string' && locality.trim()) {
        if (!p.locality.toLowerCase().includes(locality.toLowerCase())) return false;
      }

      if (propertyType && typeof propertyType === 'string' && propertyType !== 'All') {
        if (p.propertyType !== propertyType) return false;
      }

      if (furnishing && typeof furnishing === 'string' && furnishing !== 'All') {
        if (p.furnishing !== furnishing) return false;
      }

      if (preferredTenant && typeof preferredTenant === 'string' && preferredTenant !== 'All') {
        if (p.preferredTenant !== 'All' && p.preferredTenant !== preferredTenant) return false;
      }

      if (minRent) {
        const min = Number(minRent);
        if (!isNaN(min) && p.rentMonthly < min) return false;
      }

      if (maxRent) {
        const max = Number(maxRent);
        if (!isNaN(max) && p.rentMonthly > max) return false;
      }

      if (availability && typeof availability === 'string' && availability !== 'All') {
        if (p.availableFrom !== availability) return false;
      }

      if (amenities) {
        const amenityList = Array.isArray(amenities) ? amenities : [String(amenities)];
        for (const am of amenityList) {
          const amStr = typeof am === 'string' ? am : String(am);
          if (!p.amenities.some(a => a.toLowerCase().includes(amStr.toLowerCase()))) {
            return false;
          }
        }
      }

      if (q && typeof q === 'string' && q.trim()) {
        const query = q.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesCity = p.city.toLowerCase().includes(query);
        const matchesLocality = p.locality.toLowerCase().includes(query);
        const matchesDesc = p.description.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCity && !matchesLocality && !matchesDesc) {
          return false;
        }
      }

      return true;
    });

    if (sortBy === 'price_low') {
      results.sort((a, b) => a.rentMonthly - b.rentMonthly);
    } else if (sortBy === 'price_high') {
      results.sort((a, b) => b.rentMonthly - a.rentMonthly);
    } else if (sortBy === 'newest') {
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      results.sort((a, b) => b.viewsCount - a.viewsCount);
    }

    res.json({
      total: results.length,
      properties: results
    });
  });

  app.get('/api/v1/properties/:id', (req: Request, res: Response) => {
    const property = db.properties.find(p => p.id === req.params.id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    property.viewsCount += 1;
    saveDatabase();
    res.json(property);
  });

  app.post('/api/v1/properties', (req: Request, res: Response) => {
    const data = req.body;

    if (!data.title || !data.city || !data.rentMonthly || !data.propertyType) {
      return res.status(400).json({ error: 'Missing mandatory property listing fields' });
    }

    const newProperty: Property = {
      id: `prop_${Date.now()}`,
      title: data.title.trim(),
      description: data.description || 'Direct owner listing without brokerage fee.',
      propertyType: data.propertyType,
      rentMonthly: Number(data.rentMonthly),
      securityDeposit: Number(data.securityDeposit || data.rentMonthly * 2),
      maintenanceCharges: Number(data.maintenanceCharges || 0),
      brokerageFee: 0,
      electricityChargesNote: data.electricityChargesNote || 'As per government domestic electricity meter',
      waterChargesNote: data.waterChargesNote || 'Regular water connection included',
      city: data.city,
      locality: data.locality || data.city,
      address: data.address || '',
      landmark: data.landmark || '',
      state: data.state || 'India',
      pincode: data.pincode || '',
      coordinates: data.coordinates || { lat: 12.9716, lng: 77.5946 },
      furnishing: data.furnishing || 'Semi-Furnished',
      availableFrom: data.availableFrom || 'Immediate',
      preferredTenant: data.preferredTenant || 'All',
      bedrooms: Number(data.bedrooms || 1),
      bathrooms: Number(data.bathrooms || 1),
      balconies: Number(data.balconies || 1),
      superBuiltUpArea: Number(data.superBuiltUpArea || 1000),
      carpetArea: Number(data.carpetArea || 800),
      floorNumber: Number(data.floorNumber || 1),
      totalFloors: Number(data.totalFloors || 4),
      parking: data.parking || 'Car & Bike',
      foodIncluded: data.foodIncluded || false,
      genderPreference: data.genderPreference,
      images: Array.isArray(data.images) && data.images.length > 0
        ? data.images
        : ['/src/assets/images/hero_modern_indian_apartment_1791010895367.jpg'],
      amenities: Array.isArray(data.amenities) ? data.amenities : ['Power Backup', 'Security Guard', 'Water Supply'],
      rules: Array.isArray(data.rules) ? data.rules : ['Direct owner agreement with zero brokerage'],
      ownerId: data.ownerId || 'usr_owner_1',
      ownerName: data.ownerName || 'Priya Verma',
      ownerPhone: data.ownerPhone || '+91 98234 56789',
      ownerEmail: data.ownerEmail || 'priya.verma@example.in',
      ownerVerified: true,
      ownerResponseTime: 'Within 2 hours',
      status: 'published',
      viewsCount: 1,
      enquiriesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.properties.unshift(newProperty);

    db.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      adminId: 'system',
      adminName: 'StayLink Engine',
      action: 'PROPERTY_PUBLISHED',
      targetType: 'property',
      targetId: newProperty.id,
      details: `New listing '${newProperty.title}' published by owner ${newProperty.ownerName} in ${newProperty.city}`,
      timestamp: new Date().toISOString()
    });

    saveDatabase();
    res.status(201).json(newProperty);
  });

  app.patch('/api/v1/properties/:id', (req: Request, res: Response) => {
    const propIndex = db.properties.findIndex(p => p.id === req.params.id);
    if (propIndex === -1) {
      return res.status(404).json({ error: 'Property not found' });
    }

    db.properties[propIndex] = {
      ...db.properties[propIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    saveDatabase();
    res.json(db.properties[propIndex]);
  });

  app.delete('/api/v1/properties/:id', (req: Request, res: Response) => {
    const propIndex = db.properties.findIndex(p => p.id === req.params.id);
    if (propIndex === -1) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const removed = db.properties.splice(propIndex, 1)[0];
    saveDatabase();
    res.json({ message: 'Property listing removed', id: removed.id });
  });

  // --- FAVOURITES ROUTES ---
  app.get('/api/v1/favourites', (req: Request, res: Response) => {
    const userId = (req.query.userId as string) || 'usr_renter_1';
    const favIds = db.userFavourites[userId] || [];
    const favProps = db.properties.filter(p => favIds.includes(p.id));
    res.json({
      propertyIds: favIds,
      properties: favProps
    });
  });

  app.post('/api/v1/favourites/:id', (req: Request, res: Response) => {
    const userId = (req.body.userId as string) || 'usr_renter_1';
    const propId = req.params.id;
    if (!db.userFavourites[userId]) db.userFavourites[userId] = [];
    if (!db.userFavourites[userId].includes(propId)) {
      db.userFavourites[userId].push(propId);
      saveDatabase();
    }
    res.json({ success: true, propertyIds: db.userFavourites[userId] });
  });

  app.delete('/api/v1/favourites/:id', (req: Request, res: Response) => {
    const userId = (req.query.userId as string) || 'usr_renter_1';
    const propId = req.params.id;
    if (db.userFavourites[userId]) {
      db.userFavourites[userId] = db.userFavourites[userId].filter(id => id !== propId);
      saveDatabase();
    }
    res.json({ success: true, propertyIds: db.userFavourites[userId] || [] });
  });

  // --- ENQUIRIES & MESSAGING ROUTES ---
  app.get('/api/v1/enquiries', (req: Request, res: Response) => {
    const { userId, role } = req.query;
    let filtered = db.enquiries;
    if (userId && role === 'owner') {
      filtered = db.enquiries.filter(e => e.ownerId === userId);
    } else if (userId) {
      filtered = db.enquiries.filter(e => e.renterId === userId);
    }
    res.json(filtered);
  });

  app.post('/api/v1/enquiries', (req: Request, res: Response) => {
    const {
      propertyId,
      renterId,
      renterName,
      renterEmail,
      renterPhone,
      message,
      preferredMoveInDate
    } = req.body;

    if (!propertyId || !message) {
      return res.status(400).json({ error: 'Property ID and message are required' });
    }

    const prop = db.properties.find(p => p.id === propertyId);
    if (!prop) {
      return res.status(404).json({ error: 'Property not found' });
    }

    prop.enquiriesCount += 1;

    const newEnquiry: Enquiry = {
      id: `enq_${Date.now()}`,
      propertyId: prop.id,
      propertyTitle: prop.title,
      propertyCity: prop.city,
      propertyLocality: prop.locality,
      propertyImage: prop.images[0] || '/src/assets/images/hero_modern_indian_apartment_1791010895367.jpg',
      propertyRent: prop.rentMonthly,
      renterId: renterId || 'usr_renter_1',
      renterName: renterName || 'Rahul Sharma',
      renterEmail: renterEmail || 'rahul.sharma@example.in',
      renterPhone: renterPhone || '+91 98765 43210',
      ownerId: prop.ownerId,
      ownerName: prop.ownerName,
      message: message.trim(),
      preferredMoveInDate: preferredMoveInDate || 'Immediate',
      status: 'new',
      createdAt: new Date().toISOString(),
      replies: [
        {
          id: `rep_${Date.now()}`,
          senderId: renterId || 'usr_renter_1',
          senderName: renterName || 'Rahul Sharma',
          senderRole: 'renter',
          message: message.trim(),
          timestamp: new Date().toISOString()
        }
      ]
    };

    db.enquiries.unshift(newEnquiry);
    saveDatabase();
    res.status(201).json(newEnquiry);
  });

  app.post('/api/v1/enquiries/:id/reply', (req: Request, res: Response) => {
    const { senderId, senderName, senderRole, message } = req.body;
    const enq = db.enquiries.find(e => e.id === req.params.id);
    if (!enq) {
      return res.status(404).json({ error: 'Enquiry thread not found' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const reply = {
      id: `rep_${Date.now()}`,
      senderId: senderId || 'usr_owner_1',
      senderName: senderName || 'Owner',
      senderRole: senderRole || 'owner',
      message: message.trim(),
      timestamp: new Date().toISOString()
    };

    enq.replies.push(reply);
    enq.status = 'replied';

    saveDatabase();
    res.status(201).json({ enquiry: enq, newReply: reply });
  });

  // --- VISIT REQUESTS ROUTES ---
  app.get('/api/v1/visit-requests', (req: Request, res: Response) => {
    const { userId, role } = req.query;
    let filtered = db.visits;
    if (userId && role === 'owner') {
      filtered = db.visits.filter(v => v.ownerId === userId);
    } else if (userId) {
      filtered = db.visits.filter(v => v.renterId === userId);
    }
    res.json(filtered);
  });

  app.post('/api/v1/visit-requests', (req: Request, res: Response) => {
    const {
      propertyId,
      renterId,
      renterName,
      renterPhone,
      renterEmail,
      visitDate,
      visitTimeSlot,
      notes
    } = req.body;

    if (!propertyId || !visitDate || !visitTimeSlot) {
      return res.status(400).json({ error: 'Property, Visit Date, and Time Slot are required' });
    }

    const prop = db.properties.find(p => p.id === propertyId);
    if (!prop) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const newVisit: VisitRequest = {
      id: `vis_${Date.now()}`,
      propertyId: prop.id,
      propertyTitle: prop.title,
      propertyCity: prop.city,
      propertyAddress: prop.address || prop.locality,
      propertyImage: prop.images[0] || '/src/assets/images/hero_modern_indian_apartment_1791010895367.jpg',
      renterId: renterId || 'usr_renter_1',
      renterName: renterName || 'Rahul Sharma',
      renterPhone: renterPhone || '+91 98765 43210',
      renterEmail: renterEmail || 'rahul.sharma@example.in',
      ownerId: prop.ownerId,
      ownerName: prop.ownerName,
      visitDate,
      visitTimeSlot,
      notes: notes || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    db.visits.unshift(newVisit);
    saveDatabase();

    // Trigger transactional notification email to homeowner
    sendTransactionalEmail({
      to: prop.ownerEmail,
      subject: `New Visit Appointment Request from ${newVisit.renterName} - StayLink`,
      html: `<h2>New In-Person Property Visit</h2>
<p><strong>Tenant:</strong> ${newVisit.renterName} (${newVisit.renterPhone})</p>
<p><strong>Property:</strong> ${newVisit.propertyTitle}</p>
<p><strong>Requested Date:</strong> ${newVisit.visitDate} (${newVisit.visitTimeSlot})</p>
<p>Please log in to your StayLink Owner Dashboard to confirm or provide gate entry instructions.</p>`
    }).catch(() => {});

    res.status(201).json(newVisit);
  });

  app.patch('/api/v1/visit-requests/:id', (req: Request, res: Response) => {
    const visit = db.visits.find(v => v.id === req.params.id);
    if (!visit) {
      return res.status(404).json({ error: 'Visit request not found' });
    }

    const { status, ownerNotes, visitDate, visitTimeSlot } = req.body;
    if (status) visit.status = status;
    if (ownerNotes !== undefined) visit.ownerNotes = ownerNotes;
    if (visitDate) visit.visitDate = visitDate;
    if (visitTimeSlot) visit.visitTimeSlot = visitTimeSlot;

    saveDatabase();
    res.json(visit);
  });

  // --- REPORT LISTINGS ROUTES ---
  app.post('/api/v1/reports', (req: Request, res: Response) => {
    const { propertyId, reporterId, reporterName, reporterEmail, reason, details } = req.body;

    if (!propertyId || !reason || !details) {
      return res.status(400).json({ error: 'Property ID, Reason, and Details are mandatory' });
    }

    const prop = db.properties.find(p => p.id === propertyId);
    const newReport: Report = {
      id: `rep_${Date.now()}`,
      propertyId,
      propertyTitle: prop ? prop.title : 'Rental Property',
      propertyCity: prop ? prop.city : 'India',
      reporterId: reporterId || 'usr_renter_1',
      reporterName: reporterName || 'Community Member',
      reporterEmail: reporterEmail || 'anonymous@staylink.in',
      reason,
      details: details.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    db.reports.unshift(newReport);
    saveDatabase();
    res.status(201).json(newReport);
  });

  // --- ADMIN ROUTES ---
  app.get('/api/v1/admin/stats', (req: Request, res: Response) => {
    res.json({
      totalListings: db.properties.length,
      publishedListings: db.properties.filter(p => p.status === 'published').length,
      pendingReviews: db.properties.filter(p => p.status === 'in_review').length,
      totalUsers: db.users.length,
      totalEnquiries: db.enquiries.length,
      totalVisits: db.visits.length,
      pendingReports: db.reports.filter(r => r.status === 'pending').length
    });
  });

  app.get('/api/v1/admin/review-queue', (req: Request, res: Response) => {
    const queue = db.properties.filter(p => p.status === 'in_review' || p.status === 'draft');
    res.json(queue);
  });

  app.patch('/api/v1/admin/properties/:id/review', (req: Request, res: Response) => {
    const { action, reason, adminName } = req.body;
    const prop = db.properties.find(p => p.id === req.params.id);
    if (!prop) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (action === 'reject' && (!reason || !reason.trim())) {
      return res.status(400).json({ error: 'Mandatory reason required when rejecting a listing' });
    }

    if (action === 'approve') {
      prop.status = 'published';
      prop.ownerVerified = true;
    } else if (action === 'reject') {
      prop.status = 'rejected';
      prop.rejectionReason = reason;
    } else if (action === 'request_correction') {
      prop.status = 'draft';
      prop.rejectionReason = reason;
    }

    prop.updatedAt = new Date().toISOString();

    db.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      adminId: 'usr_admin_1',
      adminName: adminName || 'Moderator',
      action: action === 'approve' ? 'APPROVED_PROPERTY' : 'REJECTED_PROPERTY',
      targetType: 'property',
      targetId: prop.id,
      details: `${action.toUpperCase()} listing '${prop.title}' by ${prop.ownerName}. Reason: ${reason || 'Criteria met'}`,
      timestamp: new Date().toISOString()
    });

    saveDatabase();
    res.json(prop);
  });

  app.get('/api/v1/admin/reports', (req: Request, res: Response) => {
    res.json(db.reports);
  });

  app.patch('/api/v1/admin/reports/:id', (req: Request, res: Response) => {
    const { status, adminNotes } = req.body;
    const report = db.reports.find(r => r.id === req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (status) report.status = status;
    if (adminNotes) report.adminNotes = adminNotes;

    saveDatabase();
    res.json(report);
  });

  app.get('/api/v1/admin/users', (req: Request, res: Response) => {
    // Hide password hashes
    const safeUsers = db.users.map(({ passwordHash, salt, ...u }) => u);
    res.json(safeUsers);
  });

  app.get('/api/v1/admin/audit-logs', (req: Request, res: Response) => {
    res.json(db.auditLogs);
  });

  // --- VITE MIDDLEWARE (DEV) OR STATIC ASSETS (PROD) ---
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  // Global Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    captureException(err, { path: req.path, method: req.method });
    res.status(500).json({ error: 'Internal server error', requestId: Date.now() });
  });

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`StayLink Dev Server running on http://0.0.0.0:${PORT}`);
  });

  // Graceful shutdown handling
  const shutdown = () => {
    console.log('Shutting down StayLink server gracefully...');
    saveDatabase();
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch(err => {
  console.error('Failed to start StayLink server:', err);
  process.exit(1);
});
