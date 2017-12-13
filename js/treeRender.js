/*
// File: treeRender.js
// Author: Roshan Sureen
// Date: 13/11/17
//
// Purpose: Renders a tree hierarchy using the GUP,
// input is JSON hierarcy sent from tree.js,
// 1.'children' denoted by a 'values[]' array
// 2. a single root node
*/


function tree(targetDOMelement) { 

	var treeObject = {};
	
	//=================== PUBLIC FUNCTIONS =========================
	//
	
 	
	treeObject.loadAndRenderDataset = function (data) {
		jsonTreeData=data;
		layoutAndRender();
		return treeObject;
	}
	
	treeObject.leafLabelFn = function (fn) {
		leafLabel=fn;
		return treeObject;
	}
	
	treeObject.appendToClick = function (fn) {
		appendedClickFunction=fn;
		return treeObject;
	}
	
	
	//=================== PRIVATE VARIABLES ====================================
	
	//Declare and append SVG element
	var margin = {top: 30, right: 180, bottom: 20, left: 80},
	width = 555 - margin.right - margin.left,
	height = 450 - margin.top - margin.bottom;

	//Set up SVG and append group to act as container for tree graph
	var grp = d3.select(targetDOMelement).append("svg")
		.attr("width", width + margin.right + margin.left)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
 
	var hierarchyGraph, 
		sourceNode, 
		listOfLinksByDescendants,
		listOfNodes;


	//=================== PRIVATE FUNCTIONS ====================================
	
	function layoutAndRender(){
		//GENERATE THE DOUBLY LINKED HIERARCHY GRAPH
		hierarchyGraph = d3.hierarchy(jsonTreeData, function(d){return d.values});
		//Hide all grandchildren nodes at start to produce compact layout
		//BETTER TO DO THIS WITH A RECURSIVE FUNCTION!!!!
		hierarchyGraph.children.forEach(function (child){			
			child.children.forEach(function(grandchild){
				grandchild.children.forEach(hideUnhideChildren)
				hideUnhideChildren(grandchild)
			});
			hideUnhideChildren(child)
		});
		//hierarchyGraph.children.forEach(hideUnhideChildren);
		//Set source node to root of hierarchy to start
		sourceNode = hierarchyGraph;
		//And set it's 'old' position to (0,0) as we'll 
		//start drawing the tree from here
		sourceNode.xOld=sourceNode.yOld=0;
		//Add (x,y) positions and render
		calculateXYpositionsAndRender(sourceNode);
	}
	
	
	function calculateXYpositionsAndRender(sourceNode){
		//Note that the 'sourceNode' is the clicked node in a collapse or
		//uncollapse animation
		
		//get and setup the tree layout generator and generate (x,y,) data
		var myTreeLayoutGenerator = d3.tree().size([height, width]);
		var treeLayout = myTreeLayoutGenerator(hierarchyGraph);
		
		//Get lists of nodes and links
		listOfLinksByDescendants = treeLayout.descendants().slice(1);
		listOfNodes = treeLayout.descendants();
		
		//RENDER
		renderLinks(listOfLinksByDescendants, sourceNode);
		renderNodes(listOfNodes, sourceNode);		
		
		// Store the old positions for collapsable transition.
		listOfNodes.forEach(function(d){
			d.xOld = d.x;
			d.yOld = d.y;
		});
	}
	
	function renderLinksAndNodes(){
		renderLinks(listOfLinksByDescendants, sourceNode);
		renderNodes(listOfNodes, sourceNode);	
	}

	function renderNodes(listOfNodes, sourceNode){
		
		//DATA BIND
		var selection = grp
			.selectAll("g.classNode")
			.data(listOfNodes, generateUniqueKey);		

		//ENTER  
		var enterSelection = selection.enter()
			.append("g")
			.on("click", onClick)
			.classed("classNode", true);
			
		//transitions
		enterSelection			
			.attr("transform", function(d) { 
				return "translate(" + sourceNode.yOld + "," + sourceNode.xOld + ")"; 
			})
			//Transition to final entry positions
			.transition()
			.duration(2000)
			.attr("transform", function(d) { 
				return "translate(" + d.y + "," + d.x + ")"; 
			});	
			
		//Append nodes
		enterSelection.append("circle")
			.attr("r", 5);
			
		//Append associated node labels
		enterSelection
			.filter(function(d){return !(d.height == 0)})
			.append("text")
			.attr("y", -8)
			.attr("text-anchor", "middle")
			.text(function(d) {return d.data.key;});

		//Append associated leaf node labels
		enterSelection
			.filter(function(d){return (d.height == 0)})
			.append("text")
			.attr("x", 13)
			.attr("text-anchor", "start")
			.text(leafLabel);

		//UPDATE 
		selection
			.on("click", onClick)
			.transition()
			.duration(2000)
			.attr("transform", function(d) { 
				return "translate(" + d.y + "," + d.x + ")"; 
			});

		// EXIT 
		selection
			.exit()
			.transition()
			.duration(2000)
			.attr("transform", function(d) {
				return "translate(" + sourceNode.y + "," + sourceNode.x + ")";
			})
			.remove();
	}
	
	function renderLinks(listOfLinksByDescendants, sourceNode){
		
		// DATA JOIN
		var selection = grp
			.selectAll("path.classLink")
			.data(listOfLinksByDescendants, generateUniqueKey);
			
		//ENTER 
		var enterSel = selection
			.enter()
			.append('path')
			.classed("classLink", true);
			
		enterSel
			.attr('d', function(d){
				var o = {x:sourceNode.xOld, y:sourceNode.yOld}
				return diagonalShapeGenerator2(o, o);
			})
			.transition()
			.duration(2000)
			.attr("d", diagonalShapeGenerator1);
			
		// UPDATE
		selection
			.transition()
			.duration(2000)
			.attr("d", diagonalShapeGenerator1);
		
		// EXIT 
		selection
			.exit()
			.transition()
			.duration(2000)
			.attr('d', function(d){
				return diagonalShapeGenerator2(sourceNode, sourceNode);
			})
			.remove();
			
	}
	
	//Click callback
	var onClick = function (d,i){
		hideUnhideChildren(d);
		calculateXYpositionsAndRender(d);
		appendedClickFunction(d);
	}
	
	//Additional click callback functionality
	var appendedClickFunction = function(){
		//it's intended that this is defined by  
	};
	
	var leafLabel = function(d) {return "leafLabel"}

	// Toggle children on click.
	function hideUnhideChildren(d) {
		if (d.children) {
			d._children = d.children;
			d.children = null;
		} else {
			d.children = d._children;
			d._children = null;
		}
	}

	//Diagonal path shape generator function
	function diagonalShapeGenerator1(d){
		source = d.parent;
		descendant = d;
		return diagonalShapeGenerator2(source, descendant);
	}	
	
	//Diagonal path shape generator function
	function diagonalShapeGenerator2(source, descendant){
		return "M" + source.y + "," + source.x
			+ "C" + (source.y + descendant.y) / 2 + "," + source.x
			+ " " + (source.y + descendant.y) / 2 + "," + descendant.x
			+ " " + descendant.y + "," + descendant.x;
	}	
	
	//Define key generator
	var lastKey=0; // for keeping track of unique key
	function generateUniqueKey(d) {
		if(!d.hasOwnProperty("key")) d.key = ++lastKey;
		return d.key;
	}
	
	
	return treeObject; 
	
} 	