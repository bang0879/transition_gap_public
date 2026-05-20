"""Static content endpoint tests."""
from __future__ import annotations


def test_get_schema(client):
    response = client.get("/api/schema")

    assert response.status_code == 200
    data = response.json()

    assert "version" in data
    assert "layers" in data
    assert "L0" in data["layers"]
    assert "L1" in data["layers"]
    assert "L2" in data["layers"]

    l0_vars = data["layers"]["L0"]["variables"]
    assert len(l0_vars) == 3
    assert l0_vars[0]["id"] == "L0-1"

    l1_vars = data["layers"]["L1"]["variables"]
    assert len(l1_vars) == 5

    l2_vars = data["layers"]["L2"]["variables"]
    assert len(l2_vars) >= 18

    assert "pain_points" in data
    assert len(data["pain_points"]) == 8

    assert "visibility" in data
    assert len(data["visibility"]["base_items"]) == 8


def test_get_scenarios(client):
    response = client.get("/api/scenarios")

    assert response.status_code == 200
    data = response.json()

    assert "performance" in data
    assert "community" in data
    assert "elite" in data

    for scenario_id in ("performance", "community", "elite"):
        scenario = data[scenario_id]
        assert "name" in scenario
        assert "package" in scenario
        assert "impact" in scenario
        assert "financial_impact" in scenario
        assert "warnings" in scenario
        assert "next_steps" in scenario

        for financial_impact in scenario["financial_impact"]:
            assert "rationale" in financial_impact


def test_get_options(client):
    response = client.get("/api/options")

    assert response.status_code == 200
    data = response.json()

    assert "compensation_options" in data
    assert "evaluation_options" in data
    assert "recruitment_options" in data
    assert "retention_options" in data
    assert "leadership_options" in data
    assert "benchmarks" in data

    for area in ("compensation", "evaluation", "recruitment", "retention", "leadership"):
        assert area in data["benchmarks"]
        assert "title" in data["benchmarks"][area]
        assert "items" in data["benchmarks"][area]
