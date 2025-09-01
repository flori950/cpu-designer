// Test setup file
import { beforeEach } from 'vitest';

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

beforeEach(() => {
  // Reset all mocks
  vi.clearAllMocks();
  
  // Setup DOM
  document.body.innerHTML = '';
  
  // Mock sessionStorage
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
    writable: true
  });
  
  // Mock URL.createObjectURL
  global.URL.createObjectURL = vi.fn(() => 'mocked-url');
  global.URL.revokeObjectURL = vi.fn();
  
  // Mock Blob
  global.Blob = vi.fn(() => ({}));
});
