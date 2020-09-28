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
  
     } // End main constructor
} // End main class 