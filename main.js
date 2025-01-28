 // Register Vega-Lite
 vl.register(vega, vegaLite);

 // Dataset URL
 const dataSet = "https://raw.githubusercontent.com/vega/vega-datasets/refs/heads/main/data/movies.json";

 function renderChart() {
    document.getElementById("chart1").innerHTML = ""; // Clear previous chart

//Initial setup of data viz
    vl.markCircle({clip:true})
        .data(dataSet)
        .encode(
            vl.x().fieldQ('Rotten Tomatoes Rating')
                .scale({ domain: [0, 100] }), // Fixed X-axis range
            vl.y().fieldQ('IMDB Rating')
                .scale({ domain: [0, 10] }), // Dynamic Y-axis range
            vl.color().count()
        )
        .width(600)
        .height(400)
        .render()
        .then(viewElement => {
            document.getElementById("chart1").appendChild(viewElement);
        });
}

// Initial render
renderChart();