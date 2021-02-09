
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
   
    setEventListeners() {
        
        document.getElementById("add-to-build-btn").onclick = () => {
            
        };
        document.getElementById("reset-build-btn").onclick = () => {

        };

    } // End setting event handlers 
    
} // End app class 
