document.addEventListener("DOMContentLoaded", function () {
    fetch('https://raw.githubusercontent.com/thomasthomsen16/dataset-p2/refs/heads/main/30000_spotify_songs.csv')
        .then(response => response.text())
        .then(csvData => {
            const parsedData = parseCSV(csvData);
            const sampleData = getRandomSample(parsedData, 100);
            renderChart(sampleData, "chart1");
        })
        .catch(error => console.error("Error loading CSV data: ", error));
});

function renderChart(sampleData, chartId) {
    const chartContainer = document.getElementById(chartId);
    chartContainer.innerHTML = ""; // Clear existing content

    const spec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Parallel coordinates plot for Spotify songs showing audio features, color-coded by genre.",
        "data": {
            "values": sampleData  // Data passed from JavaScript (after parsing CSV)
        },
        "width": 800,
        "height": 500,
        params: [
            {
                name: "edm",
                value: 1,
                bind: { input: "checkbox" }
            },
            {
                name: "latin",
                value: 1,
                bind: { input: "checkbox" }
            },
            {
                name: "pop",
                value: 1,
                bind: { input: "checkbox" }
            },
            {
                name: "rnb",
                value: 1,
                bind: { input: "checkbox" }
            },
            {
                name: "rap",
                value: 1,
                bind: { input: "checkbox" }
            },
            {
                name: "rock",
                value: 1,
                bind: { input: "checkbox" }
            },

        ],
        "transform": [
            {
                "filter": "datum['danceability'] != null && datum['energy'] != null && datum['valence'] != null && datum['tempo'] != null"
            },
            {
                "window": [{ "op": "count", "as": "index" }]
            },
            {
                "fold": ["tempo", "danceability", "energy", "valence"],  // Only the selected features
                "as": ["key", "value"]
            },
            {
                "joinaggregate": [
                    { "op": "min", "field": "value", "as": "min" },
                    { "op": "max", "field": "value", "as": "max" }
                ],
                "groupby": ["key"]
            },
            {
                "calculate": "(datum.value - datum.min) / (datum.max - datum.min)",
                "as": "norm_val"
            },
            {
                "calculate": "(datum.min + datum.max) / 2",
                "as": "mid"
            }
        ],
        "layer": [
            {
                "mark": { "type": "rule", "color": "#ccc" },
                "encoding": {
                    "detail": { "aggregate": "count" },
                    "x": {
                        "type": "nominal",
                        "field": "key",
                        "sort": ["tempo", "danceability", "energy", "valence"]
                    }
                }
            },
            {
                "mark": "line",
                "encoding": {
                    "color": { "type": "nominal", "field": "playlist_genre" },
                    "detail": { "type": "nominal", "field": "index" },
                    "opacity": {
                        "condition": {
                            "test": {
                                "or": [
                                    { "and": ["datum.playlist_genre == 'edm'", "edm"] },
                                    { "and": ["datum.playlist_genre == 'latin'", "latin"] },
                                    { "and": ["datum.playlist_genre == 'pop'", "pop"] },
                                    { "and": ["datum.playlist_genre == 'r&b'", "rnb"] },
                                    { "and": ["datum.playlist_genre == 'rap'", "rap"] },
                                    { "and": ["datum.playlist_genre == 'rock'", "rock"] }
                                ]
                            },
                            "value": 1
                        },
                        "value": 0
                    },
                    "x": {
                        "type": "nominal",
                        "field": "key",
                        "sort": ["tempo", "danceability", "energy", "valence"]
                    },
                    "y": { "type": "quantitative", "field": "norm_val", "axis": null },
                    "tooltip": [
                        { "type": "quantitative", "field": "tempo" },
                        { "type": "quantitative", "field": "danceability" },
                        { "type": "quantitative", "field": "energy" },
                        { "type": "quantitative", "field": "valence" }
                    ]
                }
            },
            {
                "encoding": {
                    "x": {
                        "type": "nominal",
                        "field": "key",
                        "sort": ["tempo", "danceability", "energy", "valence"]
                    },
                    "y": { "value": 0 }
                },
                "layer": [
                    {
                        "mark": { "type": "text", "style": "label" },
                        "encoding": {
                            "text": { "aggregate": "max", "field": "max" }
                        }
                    },
                    {
                        "mark": { "type": "tick", "style": "tick", "size": 8, "color": "#ccc" }
                    }
                ]
            },
            {
                "encoding": {
                    "x": {
                        "type": "nominal",
                        "field": "key",
                        "sort": ["tempo", "danceability", "energy", "valence"]
                    },
                    "y": { "value": 250 } // Halfway down the chart
                },
                "layer": [
                    {
                        "mark": { "type": "text", "style": "label" },
                        "encoding": {
                            "text": { "aggregate": "min", "field": "mid" }
                        }
                    },
                    {
                        "mark": { "type": "tick", "style": "tick", "size": 8, "color": "#ccc" }
                    }
                ]
            },
            {
                "encoding": {
                    "x": {
                        "type": "nominal",
                        "field": "key",
                        "sort": ["tempo", "danceability", "energy", "valence"]
                    },
                    "y": { "value": 500 } // Height of the chart
                },
                "layer": [
                    {
                        "mark": { "type": "text", "style": "label" },
                        "encoding": {
                            "text": { "aggregate": "min", "field": "min" }
                        }
                    },
                    {
                        "mark": { "type": "tick", "style": "tick", "size": 8, "color": "#ccc" }
                    }
                ]
            }
        ],
        "config": {
            "axisX": { "domain": false, "labelAngle": 0, "tickColor": "#ccc", "title": null },
            "view": { "stroke": null },
            "style": {
                "label": { "baseline": "middle", "align": "right", "dx": -5 },
                "tick": { "orient": "horizontal" }
            }
        }
    };

    vegaEmbed(`#${chartId}`, spec);
}

// Function to parse CSV data into an array of objects
function parseCSV(csvData) {
    const rows = csvData.split("\n").filter(row => row.trim() !== "");
    const header = rows[0].split(",").map(column => column.trim());

    return rows.slice(1).map(row => {
        const values = row.split(",");

        if (values.length !== header.length) {
            return null;
        }

        let parsedRow = {};
        header.forEach((column, index) => {
            let value = values[index].trim();
            parsedRow[column] = isNaN(value) ? value : parseFloat(value);
        });

        return parsedRow;
    }).filter(row => row !== null);
}

function getRandomSample(data, sampleSize) {
    const requiredFields = ["tempo", "danceability", "energy", "valence", "speechiness", "instrumentalness", "duration_ms", "liveness", "release_year"];
    const validData = data.filter(row => requiredFields.every(field => row[field] !== null));
  
    // Group songs by playlist_genre
    const groupedByGenre = validData.reduce((acc, row) => {
      const genre = row.playlist_genre; // Updated to use playlist_genre
      if (!acc[genre]) acc[genre] = [];
      acc[genre].push(row);
      return acc;
    }, {});
  
    // Determine how many songs to take from each genre
    const genres = Object.keys(groupedByGenre);
    const genreSampleSize = Math.floor(sampleSize / genres.length);
  
    // Select a random sample from each genre
    const sampleFromEachGenre = genres.map(genre => {
      const genreSongs = groupedByGenre[genre];
      const selectedSongs = genreSongs
        .sort(() => 0.5 - Math.random()) // Randomize order
        .slice(0, genreSampleSize); // Take a random sample
      return selectedSongs;
    });
  
    // Flatten the array of samples
    const allSelectedSongs = sampleFromEachGenre.flat();
  
    // If we still need more songs due to rounding, fill up the remaining spots randomly
    if (allSelectedSongs.length < sampleSize) {
      const remainingSongs = validData
        .filter(song => !allSelectedSongs.includes(song)) // Exclude already selected songs
        .sort(() => 0.5 - Math.random())
        .slice(0, sampleSize - allSelectedSongs.length);
      allSelectedSongs.push(...remainingSongs);
    }
  
    // Shuffle the final list to avoid any bias
    return allSelectedSongs
      .sort(() => 0.5 - Math.random()) // Shuffle
      .map((row, i) => ({ ...row, index: i })); // Assign index
  }
