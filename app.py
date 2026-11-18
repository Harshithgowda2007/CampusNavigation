from flask import Flask, render_template, request, jsonify
from pathlib import Path
import json, heapq

app = Flask(__name__)
DATA_FILE = Path(__file__).parent / "data" / "campus.json"

def load_campus():
    with DATA_FILE.open(encoding="utf-8") as f:
        return json.load(f)

def shortest_path(campus, start, end):
    graph = {}
    for loc in campus["locations"]:
        graph[loc["id"]] = []
    for edge in campus["paths"]:
        a, b, w = edge["from"], edge["to"], float(edge["distance"])
        graph[a].append((b, w))
        graph[b].append((a, w))

    distances = {node: float("inf") for node in graph}
    previous = {}
    distances[start] = 0
    queue = [(0, start)]

    while queue:
        distance, current = heapq.heappop(queue)
        if distance != distances[current]:
            continue
        if current == end:
            break
        for neighbour, weight in graph[current]:
            candidate = distance + weight
            if candidate < distances[neighbour]:
                distances[neighbour] = candidate
                previous[neighbour] = current
                heapq.heappush(queue, (candidate, neighbour))

    if distances[end] == float("inf"):
        return None, None

    route = []
    current = end
    while current != start:
        route.append(current)
        current = previous[current]
    route.append(start)
    route.reverse()
    return route, distances[end]

@app.get("/")
def home():
    return render_template("index.html")

@app.get("/api/campus")
def campus_data():
    return jsonify(load_campus())

@app.post("/api/route")
def route():
    payload = request.get_json(silent=True) or {}
    start, end = payload.get("start"), payload.get("end")
    campus = load_campus()
    ids = {loc["id"] for loc in campus["locations"]}
    if start not in ids or end not in ids:
        return jsonify({"error": "Please select valid start and destination locations."}), 400
    if start == end:
        return jsonify({"error": "Starting point and destination must be different."}), 400

    route_ids, distance = shortest_path(campus, start, end)
    if route_ids is None:
        return jsonify({"error": "No walkable route found between these locations."}), 404

    by_id = {loc["id"]: loc for loc in campus["locations"]}
    route_locations = [by_id[node] for node in route_ids]
    return jsonify({
        "route": route_locations,
        "distance_m": round(distance),
        "walking_minutes": max(1, round(distance / 80)),
        "message": "Shortest route calculated using Dijkstra's algorithm."
    })

if __name__ == "__main__":
    app.run(debug=True)
