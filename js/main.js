var Page = (function() {
    return {
        hideOfflineWarning: function() {
            // caricamento live data
            document.querySelector("#main").classList.remove('loading')
            document.getElementById("offline").remove();
        },
        showOfflineWarning: function() {
            document.querySelector("#main").classList.add('loading')
			// mostro template offline
            var request = new XMLHttpRequest();
            request.open('GET', './offline.html', true);

            request.onload = function() {
                if (request.status === 200) {
                    // creo elemento HTML con info su offline
                    var offlineMessageElement = document.createElement("div");
                    offlineMessageElement.setAttribute("id", "offline");
                    offlineMessageElement.innerHTML = request.responseText;
                    document.getElementById("main").appendChild(offlineMessageElement);
                } else {
                    console.log('Error retrieving offline.html');
                }
            };

            request.onerror = function() {
                // network errors
                console.log('Connection error');
            };
            request.send();
        }
    }
})();


var API = (function() {

    function apiService() {
        var self = this;

        // retrieves all arrivals from the API
        self.getAll = function() {
            return new Promise(function(resolve, reject) {
                var request = new XMLHttpRequest();
                //request.open('GET', './api/data.json');
				//request.open('GET', 'http://localhost:52811Read/');
				request.open('GET', 'https://progettossd.azurewebsites.net/Read');

                request.onload = function() {
                    // success
                    if (request.status === 200) {
                        // resolve the promise with the parsed response text (assumes JSON)
						console.log(JSON.parse(request.response));
                        resolve(JSON.parse(request.response));
                    } else {
                        // error retrieving file
                        reject(Error(request.statusText));
                    }
                };

                request.onerror = function() {
                    // network errors
                    reject(Error("Network Error"));
                };

                request.send();
            });
        };
    
	
		//SALVATAGGIO DELLA SOLUZIONE
		self.salvataggioDb = function(algorithm){
			return new Promise(function(resolve, reject) {
				console.log("Salvataggio su db...");
				var request = new XMLHttpRequest();
				request.onload = function(){
				if (request.status === 200) {
					console.log(JSON.parse(request.response));
					resolve(JSON.parse(request.response));
				}else{
					reject(Error("network error"));
				}
				

				};
				request.open("POST", "http://localhost:52811/Update", true);
				request.setRequestHeader("Content-Type", "application/json");
				var editGAP=JSON.parse(JSON.stringify(GAP));
				
				editGAP.numcustomers=GAP.n;
				editGAP.numfacilities=GAP.m;
				editGAP.cost=GAP.c;
				editGAP.sol=GAP.solbest;
				editGAP.algorithm=algorithm;

				request.send(JSON.stringify(editGAP));
			});
		};
	}

    // initialize the services and adapters
    var apiService = new apiService();

    return {
        loadData: function() {
            // retrieve all routes
            document.querySelector("#main").classList.add('loading');
			apiService.getAll().then(function(response) {
				console.log("Dati ricevuti dal server");
				if(construct(response)){
					document.querySelector("#main").classList.remove('loading');
				}
            });
        }, 
		saveData: function(){
			document.querySelector("#main").classList.add('saving');
			console.log(document.querySelector("#main"));
			apiService.salvataggioDb().then(function(response){
				if(response.result==true){
					console.log("Salvataggio eseguito correttamente");
				}
				else{
					console.log("Errore nel salvataggio");
				}
				document.querySelector("#main").classList.remove('saving');
			});
		}
    }

})();

// register the service worker if available
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(function(reg) {
        console.log('Successfully registered service worker', reg);
    }).catch(function(err) {
        console.warn('Error whilst registering service worker', err);
    });
}

window.addEventListener('online', function(e) {
    // re-sync data with server
    console.log("Sei online");
    Page.hideOfflineWarning();
    API.loadData();
}, false);

window.addEventListener('offline', function(e) {
    // queue up events for server
    console.log("Sei offline");
    Page.showOfflineWarning();
}, false);

// check if the user is connected
if (navigator.onLine) {
    API.loadData();
} else {
    // show offline message
    Page.showOfflineWarning();
}

function println(value){
	document.getElementById("txt_console").value += value + "\r";
}
