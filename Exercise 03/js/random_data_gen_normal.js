function random_data(n, mu, sigma){
    let rnd = d3.randomNormal()
    return d3.map(d3.range(0,n),
    function (){
        return {
            value:parseInt(d3.randomNormal(mu, sigma) ())
        }
    })
}

function gen_bins(min, max, numBins){
    var bins = [];
    let range = max - min + 1;
    let binSize = range / numBins;
    binMin = min;

    for(var i = 0; i < numBins; i++){
        bins.push({
            min: binMin,
            max: binMin + binSize - 1,
            count: 0,
            label: binMin + ' - ' + (binMin + binSize - 1)
        });
        binMin += binSize;
    }
    return bins;
}