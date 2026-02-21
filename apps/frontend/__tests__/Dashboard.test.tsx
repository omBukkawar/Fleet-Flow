import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Dashboard } from '../src/pages/Dashboard';

// Mock the api client calls
jest.mock('../src/lib/api', () => ({
    api: {
        get: jest.fn().mockResolvedValue({
            data: {
                totalActiveVehicles: 15,
                utilizationPercent: 88.5,
                downtimePercent: 5.2,
                fuelEfficiencyKmL: 14.5
            }
        })
    }
}));

describe('Dashboard Insights API Load', () => {
    it('renders dashboard heading properly', async () => {
        render(<Dashboard />);

        expect(screen.getByText('Global Fleet Dashboard')).toBeInTheDocument();

        // Let effects fire
        await waitFor(() => {
            expect(screen.getByText('15 vehicles active')).toBeInTheDocument();
            expect(screen.getByText('88.5%')).toBeInTheDocument();
            expect(screen.getByText('5.2%')).toBeInTheDocument();
        });
    });
});
