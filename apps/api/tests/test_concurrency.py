import pytest
from django.db import transaction
from apps.api.models import Vehicle, Driver, Trip

@pytest.mark.django_db
def test_trip_concurrency():
    vehicle = Vehicle.objects.create(license_plate='CONC123', make='Tesla', model='Model X', status='Available', max_capacity=1000)
    driver1 = Driver.objects.create(name='Driver One', license_number='D1', license_expiry_date='2030-01-01', status='On Duty')
    driver2 = Driver.objects.create(name='Driver Two', license_number='D2', license_expiry_date='2030-01-01', status='On Duty')

    # Simulate two concurrent trip creations
    try:
        with transaction.atomic():
            trip1 = Trip.objects.create(vehicle=vehicle, driver=driver1, cargo_weight=900, origin='A', destination='B')
            trip1.full_clean()
        with transaction.atomic():
            trip2 = Trip.objects.create(vehicle=vehicle, driver=driver2, cargo_weight=900, origin='A', destination='C')
            trip2.full_clean()
    except Exception:
        pass
    trips = Trip.objects.filter(vehicle=vehicle)
    assert trips.count() == 1
