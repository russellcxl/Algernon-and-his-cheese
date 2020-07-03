
let rows = 5;
let cols = 5;
let grid = [];

let uiBoard = document.querySelector(".board");
let btnStart = document.querySelector(".button__start");
let btnEnd = document.querySelector(".button__end");
let btnWall = document.querySelector(".button__wall");
let btnFind = document.querySelector(".button__find");

//openset will contain unevaluated neighbouring nodes, closedset will contain evaluated nodes
let openSet = [];
let closedSet = [];
let path = [];

let startNode;
let endNode;



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
        newBox.style.border = "5px solid black"
        newRow.appendChild(newBox);
    }
    uiBoard.appendChild(newRow);
}


let boxes = document.querySelectorAll("td");


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
endNode = grid[rows - 1][cols - 1];


//set h values
for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
        grid[i][j].getH(endNode);
    }
}


//color boxes in closed and open sets -- these should be inside search function
for (let i = 0; i < openSet.length; i++) {
    openSet[i].colorBox("green");
}

for (let i = 0; i < closedSet.length; i++) {
    closedSet[i].colorBox("red");
}


// ------------------------------------ SEARCH FUNCTION ------------------------------------ //


//push startnode into openset
//let current = startnode
//push neighbours into openset
//fill .g and .previous of neighbours
//push neighbour with best f into closed set; remove from openset
//current = neighbour with best f
//...



function findCheese() {

    //start by pushing the startnode into the openset
    openSet.push(startNode)
    let currentNode;

    while (openSet.length > 0) {

        //find the node in openset with the lowest f cost
        let indexBest = 0;
        for (let i = 0; i < openSet.length; i++) {
            if (openSet[i].f < openSet[indexBest].f) {
                indexBest = i;
            }
        }

        //set current node as node with lowest f cost, move it to closedset, empty openset
        currentNode = openSet[indexBest];
        closedSet.push(openSet.splice(indexBest,1)[0]);
        openSet = [];

        //push current node neighbours into the openset, fill g cost for neighbours
        for (let i = 0; i < currentNode.neighbours.length; i++) {

            //only push neighbours that are not in the closedset
            if (!closedSet.includes(currentNode.neighbours[i])) {
                openSet.push(currentNode.neighbours[i]);

                //before passing on g cost, check if g costs of (closed) neighbours of current neighbours are lower; take the lower
                for (let j = 0; j < currentNode.neighbours[i].neighbours.length; j++) {

                    let neighbour2 = currentNode.neighbours[i].neighbours[j];

                    if (closedSet.includes(neighbour2) && neighbour2.g < currentNode.g) {
                        currentNode.neighbours[i].g = neighbour2.g;
                        currentNode.neighbours[i].previous = neighbour2;
                    }

                    else {
                        currentNode.neighbours[i].g = currentNode.g + 1;
                        currentNode.neighbours[i].previous = currentNode;
                    }
                }
            }
        }

        //break
        if (currentNode === endNode || openSet.length == 0) {
            break;
        }
    }
}


//color endnode and all previous nodes
let nodeToColor = endNode;

function mapPath() {
    nodeToColor.colorBox("blue");
    if (nodeToColor.previous) {
        nodeToColor = nodeToColor.previous;
        mapPath();
    }
    else {
        return false;
    }
}


$(".button__find").click(function() {
    findCheese();
    mapPath();
})