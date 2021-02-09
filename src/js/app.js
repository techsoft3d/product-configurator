
// Application logic will begin once DOM content is loaded
window.onload = () => {
    app = new main();
};


class main {

    constructor() {

        // Instantiate the assembly viewer
        this._viewer = new Communicator.WebViewer({
            containerId: "viewer",
            empty: true
        });

        // Instantiate the component viewer
        this._compViewer = new Communicator.WebViewer({
            containerId: "comp-viewer",
            empty: true
        });

        this._viewer.start();
        this._compViewer.start();

        this._buildSelections = new Map();

        this.setViewerCallbacks();

        this.setEventListeners();

    } // End app Constructor

    setViewerCallbacks() {
        this._viewer.setCallbacks({
            sceneReady: () => {
                // Enable backfaces
                this._viewer.view.setBackfacesVisible(true);

                // Set Background color for viewer
                this._viewer.view.setBackgroundColor(new Communicator.Color(33, 33, 33), new Communicator.Color(175, 175, 175));

                // Enable nav cube and axis triad
                this._viewer.view.getAxisTriad().enable();
                this._viewer.view.getNavCube().enable();
                this._viewer.view.getNavCube().setAnchor(Communicator.OverlayAnchor.LowerRightCorner);
                
            },
            selectionArray: (selectionEvents) => {
                   // Reserved for later use
            }
        }); // End Callbacks

        this._compViewer.setCallbacks({
            sceneReady: () => {
                this._compViewer.view.setBackgroundColor(new Communicator.Color(33, 33, 33), new Communicator.Color(175, 175, 175));
                this._compViewer.view.setBackfacesVisible(true);
            }
        })
    }

    // Function to load models
    loadModelPreview(modelName, transform = undefined) {
        this._compViewer.model.clear()
            .then(() => {
            const nodeName = "Model-" + modelName;
            const modelNodeId = this._compViewer.model.createNode(null, nodeName);
            this._compViewer.model.loadSubtreeFromScsFile(modelNodeId, "/data/scs/" + modelName + ".scs")
                .then(() => {
                this._compViewer.view.fitWorld();
            });
        });
    }
   
    setEventListeners() {

        // Attach loading models to the model image thumbnails
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
                let component = elem.parentElement.id;
                // Load the model into the scene when clicked
                this.loadModelPreview(modelToLoad);
                this._componentType = component;
                this._selectedComponent = modelToLoad;
                this._selectedComponentName = elem.getAttribute("name");
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
            // First time frame is selected
            if (componentSubtrees.length === 0 && this._componentType === "frame") {
                const modelNodeId = model.createNode(null, nodeName);
                model.loadSubtreeFromScsFile(modelNodeId, `/data/scs/${this._selectedComponent}.scs`);
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
                            let promiseArray = []
                            const modelNodeId = model.createNode(null, nodeName, nodeId);
                            promiseArray.push(model.loadSubtreeFromScsFile(modelNodeId, `/data/scs/${this._selectedComponent}.scs`));
                            return;
                        })
                    }
                }
                if (!nodeExists) {
                    const modelNodeId = model.createNode(null, nodeName);
                    this._viewer.model.loadSubtreeFromScsFile(modelNodeId, `/data/scs/${this._selectedComponent}.scs`);
                }
            }
            document.getElementById(`breakdown-${this._componentType}`).innerHTML = this._selectedComponentName;

        };

        document.getElementById("reset-build-btn").onclick = () => {

        };

    } // End setting event handlers 
    
} // End app class 
