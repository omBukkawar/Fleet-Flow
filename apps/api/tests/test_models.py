import pytest
from apps.api.models import Vehicle, Driver, Trip

@pytest.mark.django_db
def test_vehicle_unique_license_plate():
    Vehicle.objects.create(license_plate='ABC123', make='Toyota', model='Corolla', status='Available')
    with pytest.raises(Exception):
        Vehicle.objects.create(license_plate='ABC123', make='Honda', model='Civic', status='Available')

@pytest.mark.django_db
def test_driver_license_expiry():
    driver = Driver.objects.create(name='John Doe', license_number='D123', license_expiry_date='2020-01-01', status='On Duty')
    assert driver.license_expiry_date < '2021-01-01'

@pytest.mark.django_db
def test_trip_capacity_validation():
    vehicle = Vehicle.objects.create(license_plate='XYZ789', make='Ford', model='F150', status='Available', max_capacity=1000)
    driver = Driver.objects.create(name='Jane Smith', license_number='D456', license_expiry_date='2030-01-01', status='On Duty')
    trip = Trip(vehicle=vehicle, driver=driver, cargo_weight=1200, origin='A', destination='B')
    with pytest.raises(Exception):
        trip.full_clean()
