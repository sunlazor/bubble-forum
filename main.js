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
    let data = dataAsync instanceof Promise ? await dataAsync : dataAsync;
    let root = d3.hierarchy(data);

    let dx = 10;
    let dy = width / (root.height + 1);

// Create a tree layout.
    let treeLayout = d3.tree().nodeSize([dx, dy]);
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

    let link = svg.select(".links")
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

    let node = svg.select(".nodes")
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
        async (event) => {
            // console.debug(event.currentTarget.__data__.data.id);
            // console.debug(root);

            const filter = node => node.data.id === event.currentTarget.__data__.data.id;
            let findings = root.find(filter);

            const path = root.path(findings);
            // path.forEach((elem) => {})
            let cursor = data;
            for (let i = 0; i < path.length; i++) {
                // console.debug(cursor);
                // console.debug(path[i]);
                // if (cursor.id === path[i].data.id) {
                //     continue;
                // }
                if (findings.data.id === path[i].data.id) {
                    cursor = cursor.children.filter(function(item) {
                        console.debug("item " + item.id);
                        console.debug("pathid " + path[i].data.id);
                        return item.id === path[i].data.id;
                    })[0];
                    const name = "New child" + Math.random();
                    if (cursor.children === undefined) {
                        console.debug("cursor children undefinde");
                        console.debug(cursor);
                        cursor.children = [{"name": name, "id": name, "value": 1212}];
                    } else {
                        console.debug("cursor children exists");
                        console.debug(cursor);
                        cursor.children.push({"name": name, "id": name, "value": 1212});
                    }
                } else {
                    // cursor = cursor.children.filter(item => item.id === path[i].data.id)[0];
                    console.debug("path is");
                    console.debug(path[i]);
                    if (cursor.id === path[i].data.id) {
                        console.debug("cursor equal path");
                    } else {
                        console.debug("cursor pre filtered");
                        console.debug(cursor);
                        cursor = cursor.children.filter(function(item) {
                            console.debug("item " + item.id);
                            console.debug("pathid " + path[i].data.id);
                            return item.id === path[i].data.id;
                        })[0];
                        console.debug("cursor post filtered");
                        console.debug(cursor);

                    }

                }
                // cursor = cursor.filter(item => item.data.id === path[i].data.id);
                // if (i === path.length - 1) {
                //     if (cursor.children !== undefined) {
                //         cursor.children.push({"name": "New child", "id": "ADDSLFJ", "value": 1212});
                //     } else {
                //         cursor.children = [{"name": "New child", "id": "ADDSLFJ", "value": 1212}];
                //     }
                // }
                // if (i === path.length - 1) {
                //     if (path[i].children !== undefined) {
                //         path[i].children.push({"name": "New child", "id": "ADDSLFJ", "value": 1212});
                //     } else {
                //         path[i].children = [{"name": "New child", "id": "ADDSLFJ", "value": 1212}];
                //     }
                // }
            }

            // console.debug(findings);
            // console.debug(findings.data.id);
            // findings.data.name = "I WAS CHANGED";
            // кажется что подход должен быть другим
            // нужно вносить изменения в данные
            // и уже перерисовывать на их основе
            // const newChildRaw = {"name": "New child", "id": "ADDSLFJ", "value": 1212};
            // let newChild = d3.hierarchy(newChildRaw);
            // console.debug(newChild);

            // console.debug(findings);
            // findings - отдельный объект, который имеет ссылки на другие объекты,
            // но на него никто не ссылается
            // if (findings.children !== undefined) {
            //     findings.children.push({"name": "New child", "id": "ADDSLFJ", "value": 1212});
            // } else {
            //     findings.children = [{"name": "New child", "id": "ADDSLFJ", "value": 1212}];
            // }

            // console.debug(findings);
            // console.debug(root.path(findings));
            //
            // data

            // console.debug(data);
            await mainDrawing(data);
            // data.
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