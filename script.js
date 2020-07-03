
let rows = 25;
let cols = 25;
let grid = [];

let uiBoard = document.querySelector(".board");
let btnStart = document.querySelector(".button__start");
let btnEnd = document.querySelector(".button__end");
let btnWall = document.querySelector(".button__wall");
let btnFind = document.querySelector(".button__find");

//openset will contain unevaluated neighbouring nodes, closedset will contain evaluated nodes
let openSet = [];
let closedSet = [];

//this is for mapping out the final (shortest) path when all nodes have been evaluated
let path = [];

let startNode;
let endNode;
let currentNode;


// ------------------------------------ SETTING UP UI ------------------------------------ //


for (let i = 0; i < rows; i++) {
    let tempArr = [];
    for (let j = 0; j < cols; j++) {
        tempArr.push('.');
    }
    grid.push(tempArr);
}


for (let i = 0; i < rows; i++) {
    newRow = document.createElement("tr");
    for (let j = 0; j < cols; j++) {
        let newBox = document.createElement("td");
        newBox.style.width = "1rem";
        newBox.style.height = "1rem";
        newBox.style.border = "2px solid black"
        newRow.appendChild(newBox);
    }
    uiBoard.appendChild(newRow);
}


let boxes = document.querySelectorAll("td");


//temp function to see nodes
// for (let i = 0; i < boxes.length; i++) {
//     boxes[i].addEventListener("click", function() {
//         console.log(grid[Math.floor(i / rows)][i % cols]);
//         boxes[i].style.background = "grey";
//     });
// }


// ------------------------------------ SETTING UP THE NODES ------------------------------------ //


//compute h and g for neighbours
//find neighbour with lowest f
//store neighbour as previous neighbour
//remove from openset, push into closedset
//at the endnode, push all previous neighbours into path[]
//color all nodes in path[] blue


//r, c for coordinates; g = distance from startNode, h = estimated distance from endNode, f=g+h
//only have to fill h for now, because g will change as the currentNode changes
class Node {
    constructor(r, c) {
        this.r = r;
        this.c = c;

        this.g = 0;
        this.h = 0;
        this.f = 0;

        this.neighbours = [];
        this.previous;
        
    }

    colorBox(color) {
        boxes[this.r * cols + this.c].style.background = `${color}`;
    }

    getNeighbours() {
        let r = this.r;
        let c = this.c;

        if (c < cols - 1) this.neighbours.push(grid[r][c + 1]);
        if (c > 0)   this.neighbours.push(grid[r][c - 1]);
        if (r < rows - 1)   this.neighbours.push(grid[r + 1][c]);
        if (r > 0)   this.neighbours.push(grid[r - 1][c]);
    }

    getH(end) {
        this.h = Math.abs(end.r - this.r) + Math.abs(end.c - this.c);
    }

    getF() {
        this.f = this.g + this.h;
    }

}


//create nodes and neighbours
for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
        grid[i][j] = new Node(i, j);
    }
}

for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
        grid[i][j].getNeighbours();
    }
}


//have to be initialised only after the nodes have been created
startNode = grid[0][0]; 
endNode = grid[24][24];

startNode.colorBox("green");
endNode.colorBox("blue");


// ------------------------------------ SETTING UP SET BUTTONS ------------------------------------ //


//this is so you can click once on the set-start/set-end buttons to 'toggle' them
//seems a bit chunky though
let inputType;

for (let i = 0; i < boxes.length; i++) {
    boxes[i].addEventListener("click", function() {
        
        if (inputType === 'start') {
            startNode.colorBox("");
            startNode = grid[Math.floor(i / rows)][i % cols];
            startNode.colorBox("green");
            openSet.splice(0, 1, startNode);
            inputType = "";
        }
        else if (inputType === 'end') {
            endNode.colorBox("");
            endNode = grid[Math.floor(i / rows)][i % cols];
            endNode.colorBox("blue");
            inputType = "";
        }
        else {
            boxes[i].style.background = "grey";
        }
    });
}


btnStart.addEventListener("click", function() {
    inputType = "start";
});


btnEnd.addEventListener("click", function() {
    inputType = "end";
});


// ------------------------------------ SEARCH FUNCTION ------------------------------------ //


//push startnode into openset
//let current = startnode
//push neighbours into openset
//fill .g and .previous of neighbours
//push neighbour with best f into closed set; remove from openset
//current = neighbour with best f
//...


//push default startNode into openset; can do without but user must always set board first
openSet.push(startNode);


//this is the main A* search algorithm
function findCheese() {

        if (openSet.length > 0) {

        //find the node in openset with the lowest f cost
        let indexBest = 0;
        for (let i = 0; i < openSet.length; i++) {
            if (openSet[i].f < openSet[indexBest].f) {
                indexBest = i;
            }
        }

        //set current node as node with lowest f cost, color it green, move it to closedset, empty openset
        currentNode = openSet[indexBest];
        currentNode.colorBox("maroon");
        closedSet.push(openSet.splice(indexBest,1)[0]);

        //push current node neighbours into the openset, fill g, h, f costs for neighbours
        for (let i = 0; i < currentNode.neighbours.length; i++) {

            let current = currentNode.neighbours[i];

            //only push neighbours that are not in the closedset
            if (!closedSet.includes(current) && !openSet.includes(current)) {
                openSet.push(current);
                current.colorBox("green");

                //before passing on g cost, check if g costs of (closed) neighbours of current neighbours are lower; take the lower
                for (let j = 0; j < current.neighbours.length; j++) {

                    let neighbour2 = current.neighbours[j];

                    if (closedSet.includes(neighbour2) && neighbour2.g < currentNode.g) {
                        current.g = neighbour2.g;
                        current.previous = neighbour2;
                    }

                    else {
                        current.g = currentNode.g + 1;
                        current.previous = currentNode;
                    }
                }

                current.getH(endNode);
                current.getF();

            }
        }
    }
}


//for visualising the pathfinding process
function start() {
    return new Promise((resolve) => {
        let mappingPath = setInterval(function() {
            if (currentNode === endNode || openSet.length == 0) {
                clearInterval(mappingPath);
                resolve();
            }
            else {
                findCheese();
            }
        }, 20);
    })
    .then(() => {
        let nodeToColor = endNode;
        let mappingColours = setInterval(function() {
            nodeToColor.colorBox("blue");
            if (nodeToColor.previous) {
                nodeToColor = nodeToColor.previous;
            }
            else {
                clearInterval(mappingColours);
            }
        }, 20);
    });
}


$(".button__find").click(function() {
    start();
})