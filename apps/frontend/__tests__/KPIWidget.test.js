import React from 'react';
import { render, screen } from '@testing-library/react';
import KPIWidget from '../src/libs/shared/ui/KPIWidget';

describe('KPIWidget', () => {
  it('renders label and value', () => {
    render(<KPIWidget label="Active Fleet" value={42} />);
    expect(screen.getByText('Active Fleet')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });
});
