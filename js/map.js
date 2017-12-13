/*
// File: map.js
// Author: Roshan Sureen
// Date: 13/11/17
//
// Purpose: loadDataset, combine REF2014 data with learning providers, filter the dataset for 
// having only rows with specific Profile (Outputs, Overall, Impact), creates the circle on the map,
// draws the UK map
// renders the university on the map
*/

function mapRender(targetDOMElement) {
    var mapObj = {};

    // ********************************************************************************
    // Public functions
    // ********************************************************************************
    mapObj.loadDataset = function (data) {
        dataset = data;
        return mapObj;
    }
    mapObj.combineCSV = function () {
        combineCSVdata(dataset.ref14Data, dataset.learningProviders);
        return mapObj;
    }
    mapObj.filterProfile = function (profile) {
        getSelectedProfile(new_ref14data, profile);
        return mapObj;
    }
    mapObj.ComputeRadius = function (profile) {
        combineProfileOutput(new_ref14data, outputArray, profile);
        return mapObj;
    }
    mapObj.FilterOutRandomUni = function () {
        getNumberOfRandomUniversities(ref14_outputData, 50);
        return mapObj;
    }
    mapObj.makeUKOutline = function () {
        countries = topojson.feature(dataset.uk, dataset.uk.objects.subunits).features;
        return mapObj;
    }
    mapObj.renderMap = function () {
        render();
        return mapObj;
    }
    mapObj.mapClickCallBack = function(callback) {
        clickMap = callback;
        return mapObj;
    }

    // ********************************************************************************
    // Private Variables
    // ********************************************************************************

    var dataset = [], new_ref14data = [], ref14_outputData = [], finaltowns = [], countries = [];

    var width = 400,
        height = 600;

    var outputArray;

    //Create SVG
    var svg = d3.select(targetDOMElement).append("svg")
        .attr("width", width)
        .attr("height", height);

    //define projection of spherical coordinates to the Cartesian plane
    var projection = d3.geoAlbers()
        .center([1.6, 54.3])
        .rotate([4.4, 0])
        .parallels([50, 60])
        .scale(650 * 4)
        .translate([width / 2, height / 2]);


    //Define path generator (takes projected 2D geometry and formats for SVG)
    var pathGen = d3.geoPath().projection(projection).pointRadius(2);

    // Define Tooltip for map
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // ********************************************************************************
    // Private Functions
    // ********************************************************************************

    var clickMap = function (d,i) {
        console.log(d);
    }

    function combineCSVdata(ref14data, learningProviders) {
        // For each learning provider university - add learning provider entry as field
        // 'lp' in relevant REF14 table entry
        learningProviders.forEach(processUniversity);
        function processUniversity(learningProvider) {
            ref14data.forEach(function (ref14entry) {
                if (ref14entry["Institution code (UKPRN)"] == learningProvider.UKPRN) {
                    ref14entry.lp = learningProvider;
                    ref14entry.lp.coordinates = [learningProvider.LONGITUDE, learningProvider.LATITUDE];
                    ref14entry.lp.town = learningProvider.TOWN.toLowerCase();
                    new_ref14data.push(ref14entry);
                }
            });
        }
    }

    function getSelectedProfile(newRefData, profile) {
        var nestedData = d3.nest()
            .key(function (d) { return d["Institution code (UKPRN)"]; })
            .rollup(function (v) { return d3.mean(v, function (d) { return d['FTE Category A staff submitted'] }) })
            .sortValues(d3.ascending)
            .entries(getOnlySelectedRows(newRefData, profile));
        console.log(nestedData);
        outputArray = nestedData;
    }
    function getOnlySelectedRows(newRefData, profile) {
        return newRefData.filter(function (entry) {
            return entry.Profile === profile;
        });
    }

    function combineProfileOutput(ref, output, profile) {
        output.forEach(processUniversity);
        function processUniversity(outputProvider) {
            ref.forEach(function (refentry) {
                if (refentry['Institution code (UKPRN)'] === outputProvider.key && refentry.Profile === profile) {
                    refentry.radius = outputProvider.value;
                    ref14_outputData.push(refentry);
                }
            });
        }
    }

    function getNumberOfRandomUniversities(arr, n) {
        var result = new Array(n),
            len = arr.length,
            taken = new Array(len);
        if (n > len)
            throw new RangeError("getRandom: more elements taken than available");
        while (n--) {
            var x = Math.floor(Math.random() * len);
            result[n] = arr[x in taken ? taken[x] : x];
            taken[x] = --len;
        }
        finaltowns = result;
    }

    function render() {
        console.log(finaltowns);
        GUP_countries(svg, countries);
        GUP_towns(svg, finaltowns);
    }

    function GUP_countries(svg, countries) {
        //Draw the five unit outlines (ENG, IRL, NIR, SCT, WLS)

        //DATA BIND
        var selection = svg
            .selectAll(".classCountry")
            .data(countries);

        //ENTER
        var enterSel = selection
            .enter()
            .append("path")
            .attr("class", function (d) { return d.id; })
            .classed("classCountry", true)
            .attr("d", pathGen);
    }

    function GUP_towns(svg, towns) {
        console.log(towns);
        //DATA BIND
        var selection = svg
            .selectAll("g.classTown")
            .data(towns);

        //ENTER  
        var enterSelection = selection.enter()
            .append("g")
            .classed("classTown", true)
            .attr("transform", function (d) {
                return "translate(" + projection(d.lp.coordinates) + ")";
            });

        //Append circles
        enterSelection.append("circle")
            .attr("r", function (d) {
                return returnRadius(d.radius);
            })
            .on("mouseover", function (d) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html(
                    d['Institution name'] +
                    "<br/>" + "FTE: " + d['FTE Category A staff submitted'] +
                    "<br/>" + "Profile: " + d['Profile'])
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function (d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on('click', clickMap);
    }

    // Function works on the formula to scale the radius
    /*
        (b-a) * (x - min)
        ------------------ + a
            (max - min)
        
        Here a & b are the min & max values you want the radius to be scaled in
        x is the data value
        max & min are the smallest and greatest value in your dataset
    */
    function returnRadius(x) {
        return (((80 - 3) * (x - 1.2)) / (449.74 - 1.2)) + 3;
    }

    return mapObj;
}





