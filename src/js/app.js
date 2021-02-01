
// Application logic will begin once DOM content is loaded
window.onload = () => {
    app = new main();
};


class main {

    constructor() {

        this.setEventListeners();

    } // End app Constructor
   
    setEventListeners() {
        
        document.getElementById("add-to-build-btn").onclick = () => {
            
        };
        document.getElementById("reset-build-btn").onclick = () => {

        };

    } // End setting event handlers 
    
} // End app class 
