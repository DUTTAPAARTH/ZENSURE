import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders insurer portal shell', () => {
  render(<App />);
  expect(screen.getByText(/Insurer Portal/i)).toBeInTheDocument();
});
