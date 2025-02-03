 // Register Vega-Lite
 vl.register(vega, vegaLite);

document.addEventListener("DOMContentLoaded", function () {
    fetch('https://raw.githubusercontent.com/thomasthomsen16/dataset-p2/refs/heads/main/30000_spotify_songs.csv')
        .then(response => response.text())
        .then(csvData => {
            const parsedData = parseCSV(csvData);
            const sampledData = getRandomSample(parsedData, 1000); //Might be used later to reduce complexity of dataset

            // Render chart
            renderCharts(parsedData,chart1);
        })
        .catch(error => console.error("Error loading CSV data: ", error));
});

function renderChart(parsedData,chartId) {
    const chartContainer = document.getElementById(chartId);
    chartContainer.innerHTML = ""; // Clear existing content

    const spec {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        width: 700,
        height: 600,
        data: { values: parsedData },
    }
  vegaEmbed(`#${chartId}`, spec);
}

// Function to parse CSV data into an array of objects
function parseCSV(csvData) {
    const rows = csvData.split("\n").filter(row => row.trim() !== ""); // Remove empty rows
    const header = rows[0].split(",").map(column => column.trim()); // Trim headers

    return rows.slice(1).map(row => {
        const values = row.split(",");

        if (values.length !== header.length) {
            return null; // Skip rows with mismatched columns
        }

        let parsedRow = {};
        header.forEach((column, index) => {
            parsedRow[column] = values[index].trim();
        });

        // Convert danceability and tempo to numbers
        parsedRow.danceability = isNaN(parsedRow.danceability) ? null : parseFloat(parsedRow.danceability);
        parsedRow.tempo = isNaN(parsedRow.tempo) ? null : parseFloat(parsedRow.tempo);

        return parsedRow.danceability !== null && parsedRow.tempo !== null ? parsedRow : null;
    }).filter(row => row !== null);
}

// Function to get a random sample of data points
function getRandomSample(data, sampleSize) {
    const validData = data.filter(row => row.danceability !== null && row.tempo !== null);

    if (validData.length <= sampleSize) {
        return validData;
    }

    const sampledData = [];
    const seenIndexes = new Set();

    while (sampledData.length < sampleSize) {
        const randomIndex = Math.floor(Math.random() * validData.length);

        if (!seenIndexes.has(randomIndex)) {
            sampledData.push(validData[randomIndex]);
            seenIndexes.add(randomIndex);
        }
    }

    return sampledData;
}