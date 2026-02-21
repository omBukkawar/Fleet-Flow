import pytest
from rest_framework.test import APIClient

@pytest.mark.django_db
def test_vehicle_create_endpoint():
    client = APIClient()
    response = client.post('/api/vehicles', {'license_plate': 'ABC123', 'make': 'Toyota', 'model': 'Corolla', 'status': 'Available'})
    assert response.status_code == 201

@pytest.mark.django_db
def test_trip_create_capacity_validation():
    client = APIClient()
    # Setup vehicle and driver first
    vehicle = client.post('/api/vehicles', {'license_plate': 'XYZ789', 'make': 'Ford', 'model': 'F150', 'status': 'Available', 'max_capacity': 1000}).data
    driver = client.post('/api/drivers', {'name': 'Jane Smith', 'license_number': 'D456', 'license_expiry_date': '2030-01-01', 'status': 'On Duty'}).data
    response = client.post('/api/trips', {'vehicle': vehicle['id'], 'driver': driver['id'], 'cargo_weight': 1200, 'origin': 'A', 'destination': 'B'})
    assert response.status_code == 400
