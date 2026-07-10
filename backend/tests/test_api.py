def test_list_exceptions(client):
    resp = client.get("/exceptions")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 3
    assert len(data["exceptions"]) == 3


def test_list_exceptions_sorted_by_date_desc(client):
    resp = client.get("/exceptions")
    data = resp.json()
    dates = [e["date"] for e in data["exceptions"]]
    assert dates == sorted(dates, reverse=True)


def test_list_exceptions_sorted_by_deficit_desc_within_day(client):
    resp = client.get("/exceptions")
    data = resp.json()
    day_excs = [e for e in data["exceptions"] if e["date"] == "2017-01-05"]
    deficits = [e["deficit_pct"] for e in day_excs]
    assert deficits == sorted(deficits, reverse=True), (
        "Worst deficit should be first within the same day"
    )


def test_filter_by_product_code(client):
    resp = client.get("/exceptions?product_code=FG-001")
    data = resp.json()
    assert data["total"] == 2
    assert all(e["product_code"] == "FG-001" for e in data["exceptions"])


def test_filter_by_severity(client):
    resp = client.get("/exceptions?severity=high")
    data = resp.json()
    assert data["total"] == 1
    assert data["exceptions"][0]["severity"] == "high"


def test_filter_by_severity_medium(client):
    resp = client.get("/exceptions?severity=medium")
    data = resp.json()
    assert data["total"] == 2
    assert all(e["severity"] == "medium" for e in data["exceptions"])


def test_filter_by_product_and_severity(client):
    resp = client.get("/exceptions?product_code=FG-001&severity=medium")
    data = resp.json()
    assert data["total"] == 1
    assert data["exceptions"][0]["product_code"] == "FG-001"
    assert data["exceptions"][0]["severity"] == "medium"


def test_get_exception_detail(client):
    resp = client.get("/exceptions/1")
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == 1
    assert data["product_code"] == "FG-001"
    assert data["severity"] == "high"
    assert data["status"] == "open"
    assert "trend" in data


def test_get_exception_detail_returns_trend(client):
    resp = client.get("/exceptions/1")
    data = resp.json()
    assert len(data["trend"]) == 4
    for point in data["trend"]:
        assert "date" in point
        assert "planned_units" in point
        assert "units_produced" in point


def test_trend_excludes_exception_date(client):
    resp = client.get("/exceptions/1")
    data = resp.json()
    assert data["date"] == "2017-01-05"
    trend_dates = [p["date"] for p in data["trend"]]
    assert "2017-01-05" not in trend_dates


def test_get_exception_detail_not_found(client):
    resp = client.get("/exceptions/999")
    assert resp.status_code == 404
    assert resp.json()["detail"] == "Exception not found"


def test_patch_exception_to_acknowledged(client):
    resp = client.patch("/exceptions/1", json={"status": "acknowledged"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "acknowledged"

    resp = client.get("/exceptions/1")
    assert resp.json()["status"] == "acknowledged"


def test_patch_exception_to_resolved(client):
    client.patch("/exceptions/1", json={"status": "acknowledged"})
    resp = client.patch("/exceptions/1", json={"status": "resolved"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "resolved"


def test_patch_invalid_status_returns_400(client):
    resp = client.patch("/exceptions/1", json={"status": "invalid"})
    assert resp.status_code == 400
    assert "must be" in resp.json()["detail"].lower()


def test_patch_nonexistent_exception_returns_404(client):
    resp = client.patch("/exceptions/999", json={"status": "resolved"})
    assert resp.status_code == 404


def test_list_products(client):
    resp = client.get("/products")
    assert resp.status_code == 200
    data = resp.json()
    assert "products" in data
    assert "FG-001" in data["products"]
    assert "FG-002" in data["products"]


def test_pagination_offset(client):
    resp = client.get("/exceptions?offset=0&limit=1")
    data = resp.json()
    assert len(data["exceptions"]) == 1
    assert data["total"] == 3
    first = data["exceptions"][0]["id"]

    resp = client.get("/exceptions?offset=1&limit=1")
    data = resp.json()
    assert len(data["exceptions"]) == 1
    assert data["exceptions"][0]["id"] != first


def test_pagination_default_limit_50(client):
    resp = client.get("/exceptions")
    data = resp.json()
    assert len(data["exceptions"]) == 3
    assert data["total"] == 3


def test_pagination_limit_exceeds_total(client):
    resp = client.get("/exceptions?offset=0&limit=200")
    data = resp.json()
    assert len(data["exceptions"]) == 3


def test_pagination_negative_offset_returns_422(client):
    resp = client.get("/exceptions?offset=-1")
    assert resp.status_code == 422


def test_pagination_limit_over_max_returns_422(client):
    resp = client.get("/exceptions?limit=201")
    assert resp.status_code == 422


def test_exception_fields(client):
    resp = client.get("/exceptions/1")
    data = resp.json()
    assert "id" in data
    assert "product_code" in data
    assert "plant" in data
    assert "date" in data
    assert "planned_units" in data
    assert "units_produced" in data
    assert "deficit_pct" in data
    assert "severity" in data
    assert "status" in data
