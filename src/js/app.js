import '../css/tutorial-configurator.css';
 
// Application logic will begin once DOM content is loaded
window.onload = () => {
    const app = new main();
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
            },
            selectionArray: (selectionEvents) => {
                   // Reserved for later use
            }
        }); // End Callbacks
        this.setEventListeners();
     } // End main constructor
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
        console.log("event listeners called");
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
    }
} // End main class