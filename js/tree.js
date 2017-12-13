/*
// File: tree.js
// Author: Roshan Sureen
// Date: 13/11/17
//
// Purpose: combines the learning providers and towns data, then combines it to REF 2014 data
// filter output based on specific profile (Outputs, Overall, Impact), 
// create JSON hierarchy of the data and render the tree
*/

function treeRender(targetDOMElement) {
    var treeObj = {};

    // ********************************************************************************
    // Public functions
    // ********************************************************************************
    treeObj.loadDataset = function (data) {
        dataset = data;
        return treeObj;
    }
    treeObj.combineLPAndTown = function () {
        combineLPwithTownData(dataset.learningProviders, dataset.townsList);
        return treeObj;
    }
    treeObj.combineREFAndLP = function () {
        combineREFwithLPdata(dataset.ref14Data, lp_towns);
        return treeObj;
    }
    
    treeObj.filterOutput = function (data,profile) {
        refFiltered = ref_lp.filter(function (e) { return (e['Institution code (UKPRN)'] === data && e.Profile == profile) });
        return treeObj;
    }
    treeObj.filterSubject = function (data, profile) {
        refFilteredSub = ref_lp.filter(function (e) { return (e['Unit of assessment number'] === data && e.Profile == profile) });
        return treeObj;
    }
    
    treeObj.makeJSONHierarchy = function (university) {
        createJSONhierarchy(refFiltered, university, ["Main panel", "Unit of assessment number"]);
        return treeObj;
    }
    treeObj.makeJSONHierarchySub = function (subject) {
        createJSONhierarchy(refFilteredSub, subject, ["Country", "County", "Institution name"]);
        return treeObj;
    }
    treeObj.renderTree = function () {
        render();
        return treeObj;
    }
    treeObj.clickCallBackTree = function (callback) {
        sendClickToCallBack = callback;
        return treeObj;
    }

    // ********************************************************************************
    // Private Variables
    // ********************************************************************************

    var dataset = [], lp_towns = [], ref_lp = [], refFiltered = [], refFilteredSub = [];
    var hierarchyJSON;

    //Instantiate the tree
    var tr1 = tree(targetDOMElement);

    // ********************************************************************************
    // Private Functions
    // ********************************************************************************

    function combineLPwithTownData(learningProviders, townsCSV) {

        learningProviders.forEach(addTownDetailsToProvider);
        function addTownDetailsToProvider(provider) {
            provider.townInfo = townsCSV.find(function (townDetails) {
                return townDetails.Town.toLowerCase() == provider.TOWN.toLowerCase();
            });
            if (provider.townInfo) {
                lp_towns.push(provider);
            }
        }
    }

    function combineREFwithLPdata(ref14data, learningProviders) {

        ref14data.forEach(addLP);
        function addLP(refEntry) {
            refEntry.lp = learningProviders.find(function (provider) {
                return provider.UKPRN == refEntry["Institution code (UKPRN)"]
            });
            if (refEntry.lp) {
                refEntry.County = refEntry.lp.townInfo.County;
                refEntry.Country = refEntry.lp.townInfo.Country;
                ref_lp.push(refEntry);
            }
        }
    }

    function createJSONhierarchy(flatDataset, rootKey, keys) {
        var hierarchy = d3.nest();
        keys.forEach(applyKey);

        function applyKey(key, i) {
            hierarchy = hierarchy
                .key(function (d) {
                    return d[key];
                });
        }

        hierarchy = hierarchy.entries(flatDataset);
        //Return single top node called the value of rootKey
        // return { "key": rootKey, "values": hierarchy }
        console.log("hierarchy", hierarchy);
        hierarchyJSON = { "key": rootKey, "values": hierarchy };
    }

    function render() {
        //Set the labels of the leaf nodes
        tr1.leafLabelFn(function (d) {
            return d.data["FTE Category A staff submitted"]
                + " " + d.data["Unit of assessment name"];
        }).appendToClick(function (d) {
            sendClickToCallBack(d);
        }).loadAndRenderDataset(hierarchyJSON);
    }

    return treeObj;
}




