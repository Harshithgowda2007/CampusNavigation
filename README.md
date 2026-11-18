# CampusWay — Campus Navigation System

A small, runnable campus-navigation prototype built with Python Flask, HTML/CSS/JavaScript and Dijkstra's shortest-path algorithm.

## Features
- Schematic campus map with clickable location markers
- Start and destination selection
- Shortest walking route using Dijkstra's algorithm
- Route distance and estimated walking time
- Editable campus data stored in `data/campus.json`

## Run on Windows

1. Install Python 3.10 or newer.
2. Open this folder in VS Code.
3. Open Terminal in VS Code and run:

```bash
py -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
py app.py
```

4. Open `http://127.0.0.1:5000` in your browser.

## Customize it for your college

Edit `data/campus.json`.

- `locations`: each place has a unique `id`, display `name`, `type`, and schematic `x`/`y` position (percentages from 0 to 100).
- `paths`: each walkable connection has `from`, `to`, and `distance` in metres.
- Every path is treated as two-way.

**Important:** The included campus layout, paths and distances are demonstration data, not a surveyed map of BIT or any other campus. Replace them with verified locations and walkable connections before presenting it as real-world navigation.

## Project structure

```text
CampusNavigation/
├── app.py
├── requirements.txt
├── data/campus.json
├── algorithms/             # reserved for expanding algorithms
├── templates/index.html
└── static/
    ├── css/style.css
    └── js/map.js
```

## Current limitations
- Map is schematic and not geographically accurate.
- No live GPS or indoor positioning.
- Walking time is estimated at 80 metres/minute.
- Data is stored in JSON; MySQL can be added after the MVP works.
