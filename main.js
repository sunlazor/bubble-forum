import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
// import * as d3 from "./d3.v7.js";

const response = await fetch('./treedata.json');
const data = await response.json();

const width = 1000;

// Form HierarhyNodes
const root = d3.hierarchy(data);

const dx = 10;
const dy = width / (root.height + 1);

// Create a tree layout.
const tree = d3.tree().nodeSize([dx, dy]);
// Sort the tree and apply the layout.
root.sort((a, b) => d3.ascending(a.data.name, b.data.name));
tree(root);

// Compute the extent of the tree. Note that x and y are swapped here
// because in the tree layout, x is the breadth, but when displayed, the
// tree extends right rather than down.
let x0 = Infinity;
let x1 = -x0;
root.each(d => {
    if (d.x > x1) x1 = d.x;
    if (d.x < x0) x0 = d.x;
});

// console.debug(root);

// Compute the adjusted height of the tree.
const height = x1 - x0 + dx * 2;

const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-dy / 3, x0 - dx, width, height])
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;")
;

// console.debug(root.links());

const link = svg.append("g")
    .attr("fill", "none")
    .attr("stroke", "#555")
    .attr("stroke-opacity", 0.4)
    .attr("stroke-width", 1.5)
    .selectAll()
    .data(root.links())
    .join("path")
    .attr("d", d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x)
    )
;

// console.debug(root.links());

const node = svg.append("g")
    .attr("stroke-linejoin", "round")
    .attr("stroke-width", 3)
    .selectAll()
    .data(root.descendants())
    .join("g")
    .attr("transform", d => `translate(${d.y},${d.x})`)
;

node.append("circle")
    .attr("fill", d => d.children ? "#555" : "#999")
    .attr("r", 2.5)
;

node.append("text")
    .attr("dy", "0.31em")
    .attr("x", d => d.children ? -6 : 6)
    .attr("text-anchor", d => d.children ? "end" : "start")
    .text(d => d.data.name)
    .attr("stroke", "white")
    .attr("paint-order", "stroke")
    .attr("id", d => d.data.id)
;

node.on("click", function () {
    // console.debug(this);
    console.debug(this.__data__.data.id);
})
;

// console.debug(root.descendants());
//
// function handleItem(e) {
//     console.log(e)
//     return e.parentNode.insertBefore(e.cloneNode(e), e.nextSibling);
//
// }



// return svg.node();

// Append the SVG element.
// console.debug(svg.node());
container.append(svg.node());