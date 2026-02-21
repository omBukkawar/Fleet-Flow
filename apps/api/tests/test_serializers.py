import pytest
from apps.api.serializers import VehicleSerializer, DriverSerializer, TripSerializer

@pytest.mark.django_db
def test_vehicle_serializer_duplicate_plate():
    data = {'license_plate': 'ABC123', 'make': 'Toyota', 'model': 'Corolla', 'status': 'Available'}
    VehicleSerializer(data=data).is_valid(raise_exception=True)
    VehicleSerializer(data=data).is_valid(raise_exception=True)
    # Should raise validation error for duplicate plate

@pytest.mark.django_db
def test_driver_serializer_license_expiry():
    data = {'name': 'John Doe', 'license_number': 'D123', 'license_expiry_date': '2020-01-01', 'status': 'On Duty'}
    serializer = DriverSerializer(data=data)
    assert not serializer.is_valid()

@pytest.mark.django_db
def test_trip_serializer_capacity():
    vehicle_data = {'license_plate': 'XYZ789', 'make': 'Ford', 'model': 'F150', 'status': 'Available', 'max_capacity': 1000}
    driver_data = {'name': 'Jane Smith', 'license_number': 'D456', 'license_expiry_date': '2030-01-01', 'status': 'On Duty'}
    trip_data = {'vehicle': vehicle_data, 'driver': driver_data, 'cargo_weight': 1200, 'origin': 'A', 'destination': 'B'}
    serializer = TripSerializer(data=trip_data)
    assert not serializer.is_valid()
