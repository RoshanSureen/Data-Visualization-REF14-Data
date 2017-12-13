/*
// File: main_IC.js
// Author: Roshan Sureen
// Date: 13/11/17
//
// Purpose: read all the data files, render the map, tree and pie charts based on Impact quality
// handle the click callbacks for interactions between all three layouts.
*/

'use strict';

var url1 = "../data//REF2014_Results.csv",
    url2 = "../data/learning-providers-plus.csv",
    url3 = "../data/Towns_List.csv",
    url4 = "../data/uk.json";

var ref14Data = [], learningProviders = [], townsList = [], uk = [];
var mapDataset, treeDataset, pieDataset, columns, profile;

var mapRender = mapRender('#map');
var treeRender = treeRender('#treeDiv');
var pieRender = pieRender('#pieDiv1', '#pieDiv2');

function startApplicationForIC(Profile) {
    d3.csv(url1, function (ref14) {
        d3.csv(url2, function (lp) {
            d3.csv(url3, function (towns) {
                d3.json(url4, function (error, uk) {
                    processData(ref14, lp, towns, uk, Profile);
                });
            });
        });
    });
}

function processData(ref14_data, learning_Providers, towns_list, unitedKingdom, Profile) {
    ref14Data = ref14_data;
    columns = [ref14_data.columns[4], ref14_data.columns[11], ref14_data.columns[12], ref14_data.columns[13], ref14_data.columns[14]];
    learningProviders = learning_Providers;
    townsList = towns_list;
    uk = unitedKingdom;
    profile = Profile;

    mapDataset = { ref14Data, learningProviders, uk };
    treeDataset = { ref14Data, learningProviders, townsList };
    pieDataset = ref14Data;

    render();
}

function render() {

    mapRender.loadDataset(mapDataset)
        .combineCSV()
        .filterProfile(profile)
        .ComputeRadius(profile)
        .FilterOutRandomUni()
        .makeUKOutline()
        .renderMap();

    treeRender.loadDataset(treeDataset)
        .combineLPAndTown()
        .combineREFAndLP()
        .filterOutput('10007764', profile)
        .makeJSONHierarchy("Heriot-Watt University")
        .renderTree();

    pieRender.loadDataset1(pieDataset, columns)
        .filterOutput('10007764', 'Heriot-Watt University', profile)
        .insertColor()
        .renderPieSubjects();

}
mapRender.mapClickCallBack(handleMapClick);
treeRender.clickCallBackTree(handleTreeClick);
pieRender.pieClickCallback(handlePieClick);

function handleMapClick(d, i) {
    console.log(d);
    updateTree(d);
    updatePie(d);

}
function handleTreeClick(d) {
    if (d.height == 1 && d.depth == 2) {
        console.log("leaf node clicked, d=", d.data.values);
        pieRender.loadDataset2(d.data.values[0])
            .makeDataInLayers()
            .returnArray()
            .renderPieStars();
        document.getElementById("uoa").innerHTML = d.data.values[0]['Unit of assessment number'];
        document.getElementById("uoa_name").innerHTML = d.data.values[0]['Unit of assessment name'];
        document.getElementById("fte").innerHTML = d.data.values[0]['FTE Category A staff submitted'];
    }
}
function handlePieClick(d, i) {
    document.getElementById("uoa").innerHTML = d.data['Unit of assessment number'];
    document.getElementById("uoa_name").innerHTML = d.data['Unit of assessment name'];
    document.getElementById("fte").innerHTML = d.data['FTE Category A staff submitted'];
    makePie2(d);

    updateTreePie(d);
}
function makePie2(data) {
    console.log(data);
    pieRender.loadDataset2(data.data)
        .makeDataInLayers()
        .returnArray()
        .renderPieStars();
}

function updateTree(data) {
    treeRender.filterOutput(data['Institution code (UKPRN)'], profile)
        .makeJSONHierarchy(data['Institution name'])
        .renderTree();
}
function updateTreePie(data) {
    treeRender.filterSubject(data.data['Unit of assessment number'], profile)
        .makeJSONHierarchySub(data.data['Unit of assessment number'])
        .renderTree();

}

function updatePie(data) {
    pieRender.filterOutput(data['Institution code (UKPRN)'], data['Institution name'], profile)
        .insertColor()
        .renderPieSubjects();
}







