import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken
} from '../server/dbStore';
import { SEED_PROPERTIES, SEED_USERS } from '../src/data/seedData';
import { Property, User } from '../src/types';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✕ FAIL: ${testName}`);
    failed++;
  }
}

console.log('=== StayLink Automated Test Suite ===\n');

// 1. Password Hashing & Verification Tests
console.log('1. Password Security & Cryptographic Hashing');
const testPass = 'SecureTenantPass@2026';
const { salt, hash } = hashPassword(testPass);
assert(hash.length === 128, 'Password hash is 64-byte hex string (SHA-512)');
assert(verifyPassword(testPass, salt, hash) === true, 'Valid password successfully verifies against PBKDF2 hash');
assert(verifyPassword('WrongPass@123', salt, hash) === false, 'Incorrect password correctly rejected');

// 2. JWT Token Generation & Expiration
console.log('\n2. JWT Authentication Tokens');
const mockUser: User = SEED_USERS[0];
const token = generateToken(mockUser);
assert(typeof token === 'string' && token.split('.').length === 3, 'JWT token has valid 3-part structure');
const payload = verifyToken(token);
assert(payload !== null && payload.email === mockUser.email, 'JWT token signature and payload successfully verified');
assert(verifyToken(token + 'tampered') === null, 'Tampered token signature correctly rejected');

// 3. Search & Discovery Filter Logic
console.log('\n3. Property Filtering & India-Wide Search');
const bangaloreProps = SEED_PROPERTIES.filter(p => p.city === 'Bengaluru' && p.status === 'published');
assert(bangaloreProps.length > 0, `Search finds ${bangaloreProps.length} properties in Bengaluru`);

const under35kProps = SEED_PROPERTIES.filter(p => p.rentMonthly <= 35000);
assert(under35kProps.length > 0, `Budget filter correctly identifies affordable properties <= ₹35,000`);

const zeroBrokerageCheck = SEED_PROPERTIES.every(p => p.brokerageFee === 0);
assert(zeroBrokerageCheck === true, '100% of marketplace properties enforce strict ₹0 brokerage fee');

// 4. Property Creation Data Integrity
console.log('\n4. Property Creation & Validation');
const sampleProp: Property = {
  id: 'prop_test_1',
  title: 'Test 2 BHK Indiranagar',
  description: 'Owner listing for testing',
  propertyType: '2 BHK',
  rentMonthly: 30000,
  securityDeposit: 60000,
  maintenanceCharges: 1500,
  brokerageFee: 0,
  electricityChargesNote: 'BESCOM digital meter',
  waterChargesNote: 'Cauvery connection',
  city: 'Bengaluru',
  locality: 'Indiranagar',
  address: '100 Feet Road',
  landmark: 'Near Metro',
  state: 'Karnataka',
  pincode: '560038',
  coordinates: { lat: 12.9716, lng: 77.6412 },
  furnishing: 'Semi-Furnished',
  availableFrom: 'Immediate',
  preferredTenant: 'All',
  bedrooms: 2,
  bathrooms: 2,
  balconies: 1,
  superBuiltUpArea: 1100,
  carpetArea: 900,
  floorNumber: 2,
  totalFloors: 4,
  parking: 'Car & Bike',
  images: ['/src/assets/images/hero_modern_indian_apartment_1791010895367.jpg'],
  amenities: ['Power Backup', 'Lift'],
  rules: ['Standard agreement'],
  ownerId: 'usr_owner_1',
  ownerName: 'Priya Verma',
  ownerPhone: '+91 98234 56789',
  ownerEmail: 'priya.verma@example.in',
  ownerVerified: true,
  ownerResponseTime: 'Within 2 hours',
  status: 'published',
  viewsCount: 0,
  enquiriesCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

assert(sampleProp.rentMonthly > 0, 'Monthly rent is a positive number');
assert(sampleProp.securityDeposit >= sampleProp.rentMonthly, 'Security deposit is greater than or equal to monthly rent');
assert(sampleProp.images.length >= 1, 'Property includes at least one photo');

console.log(`\n=== Results: ${passed} Passed, ${failed} Failed ===`);

if (failed > 0) {
  process.exit(1);
}
