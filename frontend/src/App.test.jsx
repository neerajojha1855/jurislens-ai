import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from './App';

// Mock the API services so tests run fast and without a real backend
vi.mock('./services/api', () => ({
  checkBackendHealth: vi.fn(() => Promise.resolve(true)),
  uploadAndAnalyzeDocument: vi.fn(),
  askDocumentQuestion: vi.fn()
}));

describe('App Component', () => {
  it('renders the main landing page properly', () => {
    render(<App />);
    
    // Check if the main heading is present
    expect(screen.getByText(/Decipher Complex Legal Agreements/i)).toBeDefined();
    
    // Check if the dropzone is accessible and rendered
    const dropzone = screen.getByLabelText(/Upload document dropzone/i);
    expect(dropzone).toBeDefined();
  });
});
