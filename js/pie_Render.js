/*
// File: pie_Render.js
// Author: Roshan Sureen
// Date: 13/11/17
//
// Purpose: loads and render the dataset sent from pie.js, computes the angle and creates the arcs
// Provides certain callbacks for handling interactions
*/


function piechart(targetDOMelement) {
    var piechartObject = {};

    //=================== PUBLIC FUNCTIONS =========================
    //

    piechartObject.overrideOnClickFunction = function (callbackFunction) {
        onClickFunction = callbackFunction;
        return piechartObject;
    }

    piechartObject.overrideDataFieldFunction = function (dataFieldFunction) {
        dataField = dataFieldFunction;
        return piechartObject;
    }

    piechartObject.overrideMouseOverFunction = function (callbackFunction) {
        mouseOverFunction = callbackFunction;
        return piechartObject;
    }

    piechartObject.overrideMouseOutFunction = function (callbackFunction) {
        mouseOutFunction = callbackFunction;
        return piechartObject;
    }

    piechartObject.render = function (callbackFunction) {
        layoutAndRender();
        return piechartObject;
    }

    piechartObject.loadAndRenderDataset = function (data) {
        dataset = data;
        layoutAndRender();
        return piechartObject;
    }

    piechartObject.sort = function () {
        dataset.sort(function (a, b) {
            return dataField(a) - dataField(b)
        })
        layoutAndRender();
        return piechartObject;
    }

    piechartObject.sortR = function () {
        dataset.sort(function (a, b) { return dataField(b) - dataField(a) })
        layoutAndRender();
        return piechartObject;
    }

    piechartObject.sortKey = function () {
        dataset.sort(function (a, b) {
            if (a.keyField < b.keyField) return -1;
            if (a.keyField > b.keyField) return 1;
            return 0;
        });
        layoutAndRender();
        return piechartObject;
    }

    //=================== PRIVATE VARIABLES ====================================
    //Width and height of svg canvas
    var svgWidth = 400;
    var svgHeight = 200;
    var width = 400,
        height = 250;
    var pieColour = "steelBlue"
    var dataset = [];



    //Declare and append SVG element
    var svg = d3.select(targetDOMelement)
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);


    //Declare and append group that we will use tp center the piechart within the svg
    var grp = svg.append("g");


    //=================== PRIVATE FUNCTIONS ====================================

    var dataField = function (d) {
        if (d.hasOwnProperty("FTE Category A staff submitted"))
            return d['FTE Category A staff submitted']
        else
            return d['stars'];
    };


    //Set up shape generator
    var arcShapeGenerator = d3.arc()
        .outerRadius(svgHeight / 2.5)
        .innerRadius(svgHeight / 7)
        .padAngle(0.03)
        .cornerRadius(8);

    function layoutAndRender() {

        //Generate the layout 
        var arcsLayout = d3.pie()
            .value(dataField)
            .sort(null)
            (dataset);

        // console.log("Layout=", JSON.stringify(arcsLayout))
        console.log(arcsLayout);

        //center the group within the svg
        grp.attr("transform", "translate(" + [width / 1.8, height / 2.7] + ")")

        GUP_pies(arcsLayout, arcShapeGenerator);

    }


    function GUP_pies(arcsLayout, arcShapeGenerator) {

        //GUP = General Update Pattern to render pies 

        //GUP: BIND DATA to DOM placeholders
        var selection = grp.selectAll("path")
            // .data(arcsLayout, function (d){return d.data.x});
            .data(arcsLayout, function (d) { return d.data['Unit of assessment number'] });

        //GUP: ENTER SELECTION
        var enterSel = selection
            .enter()
            .append("path")
            .each(function (d) { this.dPrevious = d; }); // store d for use in tweening


        //GUP ENTER AND UPDATE selection
        var mergedSel = enterSel.merge(selection)

        mergedSel
            .style("stroke", "gray")
            .style("opacity", 0.5)
            .style("fill", function (d) { return d.data.color })
            .on("mouseover", mouseOverFunction)
            .on("mouseout", mouseOutFunction)
            .on('click', onClickFunction)
            .style("opacity", 0.5)
            .style("fill", function (d) { return d.data.color })
            .append("svg:title")
            .text(function (d, i) { return JSON.stringify(d.data) });

        mergedSel
            .transition()
            .duration(1500)
            .attrTween("d", arcTween); //Use custom tween to draw arcs

        //GUP EXIT selection 
        selection.exit()
            .transition()
            .duration(750)
            .remove();

    };


    var mouseOverFunction = function (d, i) {
        d3.select(this).style("opacity", 1.0);

        if (d.data.hasOwnProperty('stars')) {
            console.log(d.data);
            document.getElementById('star').innerHTML = "Quality: " + d.data.stars;
        }

    }
    var mouseOutFunction = function (d, i) {
        d3.select(this).style("opacity", 0.5);
        document.getElementById('star').innerHTML = "";
    }
    var onClickFunction = function (d, i) {
        // console.log(d);
    }

    function arcTween(dNew) {
        //Create the linear interpolator function
        //this provides a linear interpolation of the start and end angles 
        //stored 'd' (starting at the previous values in 'd' and ending at the new values in 'd')
        var interpolateAngles = d3.interpolate(this.dPrevious, dNew);
        //Now store new d for next interpoloation
        this.dPrevious = dNew;
        //Return shape (path for the arc) for time t (t goes from 0 ... 1)
        return function (t) { return arcShapeGenerator(interpolateAngles(t)) };
    }

    return piechartObject; 

}