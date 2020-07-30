
let directoryPath = '.';

// Application logic will begin once DOM content is loaded
window.onload = () => {
    const app = new main();
};
class main {
    constructor() {
        this._buildSelections = new Map();
        // Instantiate the viewers
        this._viewer = new Communicator.WebViewer({
            containerId: "viewer",
            empty: true
        });
        this._compViewer = new Communicator.WebViewer({
            containerId: "comp-viewer",
            empty: true
        });
        this._viewer.start();
        this._compViewer.start();
        this._compViewer.setCallbacks({
            modelStructureReady: () => {
                // Background color for viewers
                this._compViewer.view.setBackgroundColor(new Communicator.Color(33, 33, 33), new Communicator.Color(175, 175, 175));
                this._compViewer.view.setBackfacesVisible(true);
            },
        });
        this._viewer.setCallbacks({
            modelStructureReady: () => {
                // Background color for viewers
                this._viewer.view.setBackgroundColor(new Communicator.Color(33, 33, 33), new Communicator.Color(175, 175, 175));
                // Additional viewer options
                this._viewer.view.setBackfacesVisible(true);
                this._viewer.view.getAxisTriad().enable();
                this._viewer.view.getNavCube().enable();
                this._viewer.view.getNavCube().setAnchor(Communicator.OverlayAnchor.LowerRightCorner);
                this._viewer.model.setEnableAutomaticUnitScaling(false);
            },
            selectionArray: (selectionEvents) => {
                if (selectionEvents.length == 0) {
                    return;
                }
                let handleOp = this._viewer.operatorManager.getOperator(Communicator.OperatorId.Handle);
                handleOp.addHandles([selectionEvents[0].getSelection().getNodeId()]);
                handleOp.showHandles();
            }
        }); // End Callbacks
        // Gather attach point data and store in Map
        this._frameAttachPoints = new Map();
        fetch(directoryPath + '/data/attachPoints.json')
            .then((resp) => {
            if (resp.ok) {
                resp.json()
                    .then((data) => {
                    let nodeData = data.NodeData;
                    let numEntries = nodeData.length;
                    for (let i = 0; i < numEntries; ++i) {
                        this._frameAttachPoints.set(nodeData[i].modelName, nodeData[i]);
                    }
                    ;
                });
            }
            else {
                alert("Attach point data for this model was not found.");
            }
        });
        this.setEventListeners();
    } // End app Constructor
    // Function to load models
    loadModelPreview(modelName, transform = undefined) {
        this._compViewer.model.clear()
            .then(() => {
            const nodeName = "Model-" + modelName;
            const modelNodeId = this._compViewer.model.createNode(null, nodeName);
            this._compViewer.model.loadSubtreeFromScsFile(modelNodeId, directoryPath + "/data/scs/" + modelName + ".scs")
                .then(() => {
                this._compViewer.view.fitWorld();
            });
        });
    }
    setEventListeners() {
        let pills = document.getElementById("pills-tab");
        let pillsRefs = pills.getElementsByTagName("a");
        let pillsContent = document.getElementById("pills-tabContent");
        let contentPanes = pillsContent.getElementsByTagName("div");
        let modelThumbnails = pillsContent.getElementsByTagName("a");
        for (let ref of pillsRefs) {
            ref.onclick = (e) => {
                for (let ref of pillsRefs) {
                    ref.classList.remove("active", "show");
                }
                for (let pane of contentPanes) {
                    pane.classList.remove("active");
                }
                let elem = e.currentTarget;
                elem.classList.add("active");
                let tag = elem.getAttribute("content-id");
                document.getElementById(tag).classList.add("show", "active");
            };
        }
        for (let thumbnail of modelThumbnails) {
            let thumbnailElement = thumbnail;
            thumbnailElement.onclick = (e) => {
                e.preventDefault();
                let elem = e.currentTarget;
                let modelToLoad = elem.getAttribute("model");
                if (modelToLoad === null) {
                    alert("This component is currently unavailable. Please select another component.");
                }
                else {
                    let component = elem.parentElement.id;
                    // Load the model into the scene when clicked
                    this.loadModelPreview(modelToLoad);
                    this._componentType = component;
                    this._selectedComponent = modelToLoad;
                    this._selectedComponentName = elem.getAttribute("name");
                }
            };
        }
        document.getElementById("add-to-build-btn").onclick = () => {
            if (!this._componentType || !this._selectedComponent || !this._selectedComponentName) {
                alert("No component has been selected to add to build. Please select a component to add.");
                return;
            }
            let model = this._viewer.model;
            this._buildSelections.set(this._componentType, this._selectedComponent);
            let frameBase = this._buildSelections.get("frame");
            if (frameBase === undefined) {
                alert("Please select a frame before adding other components to your build.");
                return;
            }
            const nodeName = "Model-" + this._componentType;
            let componentSubtrees = model.getNodeChildren(model.getAbsoluteRootNode());
            // Build the transform matrix for the part to place it in the right spot when added
            let rawMatData = this._frameAttachPoints.get(frameBase)[this._componentType];
            let transformMatrix = this._componentType === "frame" ? null : Communicator.Matrix.createFromArray(Object.values(rawMatData));
            // First time frame is selected
            if (componentSubtrees.length === 0 && this._componentType === "frame") {
                const modelNodeId = model.createNode(null, nodeName);
                model.loadSubtreeFromScsFile(modelNodeId, directoryPath + `/data/scs/${this._selectedComponent}.scs`);
            }
            // For all other components, identify if the same type component has already been added.
            // If so, delete the existing node, and load the new node into the same nodeId and name.
            // Otherwise, create a new node off the absolute root
            else {
                let nodeExists = false;
                for (let nodeId of componentSubtrees) {
                    if (model.getNodeName(nodeId) === nodeName) {
                        nodeExists = true;
                        model.deleteNode(nodeId)
                            .then(() => {
                            let promiseArray = [];
                            const modelNodeId = model.createNode(null, nodeName, nodeId, transformMatrix);
                            promiseArray.push(model.loadSubtreeFromScsFile(modelNodeId, directoryPath + `/data/scs/${this._selectedComponent}.scs`));
                            if (this._componentType === "frame") {
                                promiseArray.push(model.setNodesVisibility([model.getAbsoluteRootNode()], false));
                                let componentSubtrees = model.getNodeChildren(model.getAbsoluteRootNode());
                                // Frame selection change - update the component attach points
                                for (let nodeId of componentSubtrees) {
                                    let nodeName = model.getNodeName(nodeId);
                                    let nodeType = nodeName.slice(6);
                                    if (nodeType === "frame")
                                        continue;
                                    let rawMatData = this._frameAttachPoints.get(frameBase)[nodeType];
                                    let transformMatrix = Communicator.Matrix.createFromArray(Object.values(rawMatData));
                                    promiseArray.push(model.setNodeMatrix(nodeId, transformMatrix));
                                }
                                Promise.all(promiseArray)
                                    .then(() => {
                                    this._viewer.view.setBoundingCalculationIgnoresInvisible(false);
                                    this._viewer.view.fitWorld(0)
                                        .then(() => model.setNodesVisibility([model.getAbsoluteRootNode()], true));
                                });
                            }
                            return;
                        });
                    }
                }
                if (!nodeExists) {
                    const modelNodeId = model.createNode(null, nodeName, null, transformMatrix);
                    this._viewer.model.loadSubtreeFromScsFile(modelNodeId, directoryPath + `/data/scs/${this._selectedComponent}.scs`);
                }
            }
            document.getElementById(`breakdown-${this._componentType}`).innerHTML = this._selectedComponentName;
        };
        document.getElementById("reset-build-btn").onclick = () => {
            let opt = confirm("Are you sure would you like to reset your build? (This will clear all current selections!)");
            if (opt) {
                this._viewer.model.clear();
                document.getElementById("breakdown-frame").innerHTML = "Not Selected";
                document.getElementById("breakdown-fork").innerHTML = "Not Selected";
                document.getElementById("breakdown-frontwheel").innerHTML = "Not Selected";
                document.getElementById("breakdown-rearwheel").innerHTML = "Not Selected";
                document.getElementById("breakdown-seat").innerHTML = "Not Selected";
                document.getElementById("breakdown-crankset").innerHTML = "Not Selected";
                document.getElementById("breakdown-handlebar").innerHTML = "Not Selected";
            }
            this._buildSelections.clear();
        };
        window.onresize = () => {
            this._viewer.resizeCanvas();
            this._compViewer.resizeCanvas();
        };
    } // End setting event handlers 
} // End app class 
