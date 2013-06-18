// Based on http://bl.ocks.org/benzguo/4370043
/// <reference path="d3.d.ts" />
var width = 960, height = 500, fill = d3.scale.category20();
// mouse event vars
var mousedown_link = null, mousedown_node = null, mouseup_node = null;
// init svg
var outer = d3.select("#game").append("svg:svg").attr("width", width).attr("height", height).attr("pointer-events", "all");
var vis = outer.append('svg:g').append('svg:g').on("mousemove", mousemove).on("mouseup", mouseup);
vis.append('svg:rect').attr('width', width).attr('height', height).attr('fill', 'white');
// init force layout
var force = d3.layout.force().size([
    width, 
    height
]).nodes([
    {
    }, 
    {
    }, 
    {
    }, 
    
]).linkDistance(// initialize with a single node
50).charge(-200).on("tick", tick);
// line displayed when dragging new nodes
var drag_line = vis.append("line").attr("class", "drag_line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 0);
// get layout properties
var nodes = force.nodes(), links = force.links(), node = vis.selectAll(".node"), link = vis.selectAll(".link");
redraw();
function mousemove() {
    if(!mousedown_node) {
        return;
    }
    // update drag line
    drag_line.attr("x1", mousedown_node.x).attr("y1", mousedown_node.y).attr("x2", d3.mouse(this)[0]).attr("y2", d3.mouse(this)[1]);
}
function mouseup() {
    if(mousedown_node) {
        // hide drag line
        drag_line.attr("class", "drag_line_hidden");
        if(!mouseup_node) {
            // Get the links involving this node:
            var count = links.filter(function (x) {
                return (x.source.index == mousedown_node.index) || (x.target.index == mousedown_node.index);
            }).length;
            if(count > 1) {
                window.alert('Illegal move, this would cause the node to have more than three vertices.');
                return;
            }
            // add node
            var point = d3.mouse(this);
            // Create two fake nodes:
            var fakeNode1 = {
                x: point[0],
                y: point[1],
                invisible: true
            };
            var fakeNode2 = {
                x: point[0],
                y: point[1],
                invisible: true
            };
            var node = {
                x: point[0],
                y: point[1]
            };
            nodes.push(fakeNode1);
            nodes.push(fakeNode2);
            nodes.push(node);
            // add link to mousedown node
            links.push({
                source: mousedown_node,
                target: fakeNode1
            });
            links.push({
                source: mousedown_node,
                target: fakeNode2
            });
            links.push({
                source: fakeNode1,
                target: node
            });
            links.push({
                source: fakeNode2,
                target: node
            });
        }
        redraw();
    }
    // clear mouse event vars
    resetMouseVars();
}
function resetMouseVars() {
    mousedown_node = null;
    mouseup_node = null;
    mousedown_link = null;
}
function tick() {
    link.attr("x1", function (d) {
        return d.source.x;
    }).attr("y1", function (d) {
        return d.source.y;
    }).attr("x2", function (d) {
        return d.target.x;
    }).attr("y2", function (d) {
        return d.target.y;
    });
    node.attr("cx", function (d) {
        return d.x;
    }).attr("cy", function (d) {
        return d.y;
    });
}
// rescale g
function rescale() {
    var trans = d3.event.translate;
    var scale = d3.event.scale;
    vis.attr("transform", "translate(" + trans + ")" + " scale(" + scale + ")");
}
// redraw force layout
function redraw() {
    link = link.data(links);
    link.enter().insert("line", ".node").attr("class", "link").on("mousedown", function (d) {
        mousedown_link = d;
        redraw();
    });
    link.exit().remove();
    node = node.data(nodes);
    node.enter().insert("circle").attr("class", function (d) {
        return d.invisible ? "node invisible" : "node";
    }).attr("r", 5).on("mousedown", function (d) {
        mousedown_node = d;
        // reposition drag line
        drag_line.attr("class", "link").attr("x1", mousedown_node.x).attr("y1", mousedown_node.y).attr("x2", mousedown_node.x).attr("y2", mousedown_node.y);
        redraw();
    }).on("mouseup", function (d) {
        if(mousedown_node) {
            mouseup_node = d;
            // Get the links involving this node:
            var outgoingCount = links.filter(function (x) {
                return (x.source.index == mousedown_node.index) || (x.target.index == mousedown_node.index);
            }).length;
            var incomingCount = links.filter(function (x) {
                return (x.source.index == mouseup_node.index) || (x.target.index == mouseup_node.index);
            }).length;
            if(outgoingCount > 2) {
                window.alert('Illegal move. This would cause the start node to have more than three vertices.');
                return;
            }
            if(incomingCount > 2) {
                window.alert('Illegal move. This would cause the end node to have more than three vertices.');
                return;
            }
            if(mouseup_node == mousedown_node) {
                return;
            }
            var node = {
            };
            nodes.push(node);
            // add link
            var link1 = {
                source: mousedown_node,
                target: node
            };
            var link2 = {
                source: node,
                target: mouseup_node
            };
            links.push(link1);
            links.push(link2);
            redraw();
        }
    }).transition().duration(750).ease("elastic").attr("r", 6.5);
    if(d3.event) {
        // prevent browser's default behavior
        d3.event.preventDefault();
    }
    force.start();
}
function spliceLinksForNode(node) {
    var toSplice = links.filter(function (l) {
        return (l.source === node) || (l.target === node);
    });
    toSplice.map(function (l) {
        links.splice(links.indexOf(l), 1);
    });
}
//@ sourceMappingURL=sprou.js.map
