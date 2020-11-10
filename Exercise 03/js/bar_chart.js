// draw the chart - full and zoomed chart both use this function
function bar_chart_zoom(values, bins, svg_elem, is_zoomed, data){
    let barMargin = 10;

    // if full chart then calculate the bin totals
    // if zoomed chart the use data passed to function from brushed
    if(!is_zoomed){
        data = binify(values, bins);
    }
    
    // get the chart svg to draw - either full or zoomed
    let svg = d3.select('#' + `${svg_elem}`);
    let margins = {x:100, y:100};

    // update the select variable to the display value
    svg.selectAll('g')
        .remove();
    
    // get the data and svg element extent (range and domain)
    // viewbox - range
    let rng = svg.attr('viewBox').split(' ');
    rng = d3.map(rng, function(d){return parseInt(d)});
    let xRng = [rng[0] + margins.x, rng[2] - margins.x];
    let yRng = [rng[3] - margins.y, rng[1] + margins.y];
    let height = parseInt(rng[3]);
    let width = parseInt(rng[2]);
    
    // number of bins and number - domain
    let name_extent = d3.extent(data,
        function (d){
            return d.min + ' - ' + d.max;
        })
    let count_extent = d3.extent(data,
        function (d){
                return d.count;
        })
    count_extent[0] = 0;

    // set title of ful, or zoomed data
    let chart_title = 'All data';
    if(is_zoomed){
        chart_title = 'Zoomed Data'
    }

    // make the X and Y scale
    let xScaleLabels = d3.scaleBand()
                .domain(data.map(function(d,i){return d.label}))
                .range(xRng)
    let xScale = d3.scaleLinear()
        .domain([0,data.length])
        .range(xRng)
    let yScale  = d3.scaleLinear().domain(count_extent).range(yRng)
    let bandwidth = ((width - 2*margins.x)  / data.length) - barMargin;

    // bar chart canvas
    let barCanvas = svg.append('g')
                        .attr('id','barCanvas');
    let barCanvas_z = svg.append('g')
                        .attr('id','barCanvas_z');
                        
    
    // add the bars
    barCanvas.selectAll('rect')
        .data(data)
        .enter()
            .append("rect")
            .attr("x", function(d,i) {return xScale(i) })
            .attr("y", function(d) { return yScale(d.count); })
            .attr("width", function(d,i) { return bandwidth})
            .transition()
                .delay(1)
                .duration(500)
            .attr("x", function(d,i) {return xScale(i) })
            .attr("y", function(d) { return yScale(d.count); })
            .attr("width", function(d,i) { return bandwidth})
            .attr("height", function(d) { return height - yScale(d.count) - margins.y })
            .attr('fill', 'steelblue')
            .attr("class",'bars')

    // add value labels to bars
    barCanvas.selectAll('text')
        .data(data)
        .enter()
            .append("text")
            .text(function(d){return(d.count)})
            .style('font-size','18px')
            .attr("x", function(d,i) { return xScale(i) + bandwidth/2; })
            .attr("y", function(d) { return height })
            .transition()
                .delay(1)
                .duration(750)
            .attr("x", function(d,i) { return xScale(i) + bandwidth/2; })
            .attr("y", function(d) { return yScale(d.count) - 2; })
            .attr('fill', 'black')
            .style("text-anchor", "middle") 

    // add the axis
    let xAxis = svg.append('g')
        .attr('class',"axisStyle")
        .attr('transform', 'translate('+(0)+','+(yRng[0])+")")
        .call(d3.axisBottom(xScaleLabels))
        .selectAll('text')
            .attr("dx", "-0.4em")
            .attr("dy", "1.24em")
            .attr("transform", "rotate(-16)" )
    let yAxis = svg.append('g')
        .attr('class',"axisStyle")
        .attr('transform', 'translate('+(margins.x)+','+(0)+")")
        .call(d3.axisLeft(yScale));

    // add the axis labels
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 + margins.y /8)
        .attr("x",0 - height / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style('font-size','20px')
        .style('font-weight','bold')
        .style('fill','steelblue')
        .text("Count");
    svg.append("text")             
        .attr("y", height - margins.y /8)
        .attr("x", width / 2)
        .style("text-anchor", "middle")
        .style('font-size','20px')
        .style('font-weight','bold')
        .style('fill','steelblue')
        .text("Bins");
    
    // add the title
    svg.append('text')
        .attr('y',30)
        .attr('x', width / 2)
        .style("text-anchor", "middle")
        .style('font-size','26px')
        .style('font-weight','bold')
        .style('fill','steelblue')
        .text(chart_title);

    // only add the brush to the full bar chart
    if(!is_zoomed){
        // declare brush
        let brush = d3
            .brushX()
            .on("start",  brushStart)
            .on("brush", brushed)
            .extent([
                [margins.x, margins.y],
                [1000-margins.x,1000-300]
            ]);

        svg.call(brush);


        function brushed() {
            let data_z = [];
            // use d3.brushSelection to get bounds of the brush
            let selected_items = d3.brushSelection(this); // these are values on the screen
            // where is brushed?
            let X1 = xScale.invert(selected_items[0])
            let X2 = xScale.invert(selected_items[1])
            // let us select elements that are between the brush area
            d3.selectAll(".bars").classed("selected",function (d,i){
                // data between the scaled brush coordinates
                if(+i >= X1 &&
                    +i <=X2)
                {
                    data_z.push(d);
                    return 'true'
                }
            })
            console.log(data_z);
            // now that zoomed data is 'captured' - update zoomed chart
            bar_chart_zoom(values,bins, 'bar_svg_zoom', true, data_z)
        }

        function brushStart() {
            // if no selection already exists, remove selected class
            console.log(d3.brushSelection(this)[0]);
            console.log(d3.brushSelection(this)[1])
            if (d3.brushSelection(this)[0] == d3.brushSelection(this)[1]) {
                d3.selectAll(".bars").classed("selected",false)
            }
        }
    }
}

// puts the values into bins
function binify(values, bins){


    for(var i = 0; i < values.length; i++){
        bins.forEach(binElement => {
            if(values[i].value >= binElement.min && values[i].value <= binElement.max){
                binElement.count++;
                
            }
        

        });
    }
    return bins;
}