import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
// import * as d3 from "./d3.v7.js";

async function getData() {
    const response = await fetch('./treedata.json');
    const data = await response.json();

    return data;
}
async function getDataExt() {
    const response = await fetch('./treedata.ext.json');
    const data = await response.json();

    return data;
}

async function mainDrawing(dataAsync) {
    // d3.select('#container').html(""); // for cleaning cases
    // d3.selectAll('svg').remove(); // for cleaning cases

    const width = 1000;

// Form HierarhyNodes
    const data = await dataAsync;
    const root = d3.hierarchy(data);

    const dx = 10;
    const dy = width / (root.height + 1);

// Create a tree layout.
    const treeLayout = d3.tree().nodeSize([dx, dy]);
// Sort the tree and apply the layout.
    root.sort((a, b) => d3.ascending(a.data.name, b.data.name));
    treeLayout(root);

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

    const svg = d3.select("#container")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-dy / 3, x0 - dx, width, height])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;")
    ;

// console.debug(root.links());

    const link = svg.select(".links")
        .selectAll("path")
        .data(root.links(), (d) => d)
        .join("path")
        // .join(
        //     function(enter) {
        //         return enter
        //             .append('path');
        //     },
        //     function(update) {
        //         return update;
        //     },
        //     function(exit) {
        //         return exit.remove();
        //     }
        // )
        .attr("d", d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x)
        )
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5)
    ;

    const node = svg.select(".nodes")
        .selectAll("g")
        .data(root.descendants(), (d) => d)
        .join("g")
        .attr("transform", d => `translate(${d.y},${d.x})`)
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3)
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

    node.on("click",
        (event) => {
            console.debug(event.currentTarget.__data__.data.id);
            console.debug(root);

            const filter = node => node.data.id === event.currentTarget.__data__.data.id;
            let findings = root.find(filter);
            console.debug(findings);
            findings.data.name = "I WAS CHANGED";
            // кажется что подход должен быть другим
            // нужно вносить изменения в данные
            // и уже перерисовывать на их основе
            findings.children.push({"name": "New child", "id": "ADDSLFJ", "value": 1212})
            console.debug(data);
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
//     container.append(svg.node());
}

// await mainDrawing(getData());
// await mainDrawing(getData());
// await mainDrawing(getData());
// await mainDrawing(getData());
await mainDrawing(getData());
// await mainDrawing(getDataExt());

async function randomDrawing() {
    let res;
    if(Math.random() > 0.5) {
        res = getData();
    } else {
        res = getDataExt();
    }

    await mainDrawing(res);
}

d3.select("button")
    .on("click", randomDrawing);