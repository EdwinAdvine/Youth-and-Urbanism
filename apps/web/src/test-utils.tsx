/**
 * Custom test utilities for rendering components with providers.
 *
 * Wraps @testing-library/react's render with BrowserRouter and
 * other providers needed across the app.
 */

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

function AllProviders({ children }: { children: React.ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>;
}

function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render with the wrapped version
export { customRender as render };
