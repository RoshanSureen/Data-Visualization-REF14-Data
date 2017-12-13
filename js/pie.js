/*
// File: pie.js
// Author: Roshan Sureen
// Date: 13/11/17
//
// Purpose: since 2 pie charts are being made we have 2 instances of pie_render objects created here,
// for the first pie chart, loading the REF2014 dataset, filter the dataset against specific profile
// (Outputs, Overall, Impact), adds color each dataum and renders the pir chart
//
// For the second pie chart, which is rendered from the first pie chart, load new data object returned
// transpose the new data in to layers, then add color and render the second pie.
*/


function pieRender(targetDOMElement1, targetDOMElement2) {
    var pieObj = {};

    // ********************************************************************************
    // Public functions
    // ********************************************************************************

    pieObj.loadDataset1 = function (data, columns) {
        dataset1 = data;
        myColumns = columns;
        return pieObj;
    }
    pieObj.loadDataset2 = function (data) {
        console.log(data);
        dataset2 = data;
        return pieObj;
    }
    pieObj.filterOutput = function (university, name, profile) {
        document.getElementById('uni').innerHTML = name;
        ref14data = dataset1.filter(function (e) { return (e['Institution code (UKPRN)'] === university && e.Profile === profile) });
        console.log(ref14Data);
        return pieObj;
    }
    pieObj.insertColor = function () {
        combineREFColor(ref14data, setSubjectColorArray());
        return pieObj;
    }
    pieObj.renderPieSubjects = function () {
        renderSubjects();
        return pieObj;
    }
    pieObj.renderPieStars = function () {
        renderStars();
        return pieObj;
    }
    pieObj.makeDataInLayers = function () {
        transposeDataToLayers();
        return pieObj;
    }
    pieObj.returnArray = function (uoa_no) {
        filterArray(uoa_no);
        return pieObj;
    }
    pieObj.pieClickCallback = function (callback) {
        pie1.overrideOnClickFunction(callback);
        return pieObj;
    }

    // ********************************************************************************
    // Private Variables
    // ********************************************************************************

    var pie1 = piechart(targetDOMElement1);
    var pie2 = piechart(targetDOMElement2);
    var dataset1 = [], dataset2 = [], subjectColorDataset = [], starsColorDataset = [];
    var myColumns, ref14data, filteredData, dataLayers;

    var colors = ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd",
        "#ccebc5", "#bfdbdb", "#67c063", "#240c12", "#34ee30", "#35bab2", "#345496", "#e69941", "#cc73e2", "#ad4b50",
        "#984024", "#94fd2e", "#f98cac", "#8abd16", "#17e866", "#abf63d", "#78658c", "#3d63f7", "#e87af9", "#1edcb2",
        "#3351fa", "#aa19df", "#919772", "#3dbd0a", "#6b29f9", "#d0b214", "#d10550", "#7b2943", "#845ec6", "#f4a7cf",
        "#cd6e57", "#67d4bf"];

    // ********************************************************************************
    // Private Functions
    // ********************************************************************************

    function setSubjectColorArray() {
        var subjectColor = [];
        for (i = 1; i < 37; i++) {
            subjectColor.push({ 'key': i.toString(), 'value': returnSubjectColor() });
        }
        return subjectColor;
    }
    function returnSubjectColor() {
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function combineREFColor(ref14, subColorArray) {
        console.log(ref14);
        var array1 = new Array();
        subColorArray.forEach(addColor);
        function addColor(colorentry) {
            ref14.forEach(function (ref14entry) {
                if (ref14entry['Unit of assessment number'] === colorentry.key) {
                    ref14entry.color = colorentry.value;
                    array1.push(ref14entry);
                }
            });
        }
        subjectColorDataset = array1;
    }

    function transposeDataToLayers() {
        console.log(dataset2);
        var keys = myColumns.slice(1);
        dataLayers = keys.map(function(c) {
            return { 'Unit of assessment number': dataset2['Unit of assessment number'], 'stars': dataset2[c] };
        });
    }

    function filterArray(uoa_no) {
        console.log(dataLayers);
        var array2 = new Array();
        dataLayers.forEach(function (d) {
            d.color = returnSubjectColor();
            array2.push(d);
        });
        starsColorDataset = array2;
    }

    function renderSubjects() {
        console.log(subjectColorDataset);
        pie1.loadAndRenderDataset(subjectColorDataset);
    }

    function renderStars() {
        pie2.loadAndRenderDataset(starsColorDataset);
    }

    return pieObj;
}
