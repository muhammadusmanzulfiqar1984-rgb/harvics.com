import urllib.request
url = "https://raw.githubusercontent.com/d3/d3-geo/main/test/data/world-50m.json"
# Actually, just fetching an SVG world map is easier.
url = "https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as response:
    svg = response.read().decode('utf-8')
    # write to a file in src/features/geo/WorldMapSvg.tsx
    with open("src/features/geo/WorldMapSvg.tsx", "w") as f:
        # We need to wrap it in a React component
        # Simplest is just exporting it as a raw string and dangerouslySetInnerHTML, or parsing it.
        # Let's just write the raw SVG out to public to be safe.
        pass

with open("public/world-map-svg.svg", "w") as f:
    f.write(svg)
print("Downloaded SVG")
