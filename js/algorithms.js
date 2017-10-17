var jsonDataInitial,GAP;
var EPS = 0.00001;

/*Costruttore iniziale*/
function construct(val){
	GAP={
		n: val.numcustomers,
		m: val.numfacilities,
		cap: val.cap,
		req: val.req,
		c: val.cost
	};
	console.log(GAP);
	console.log("-----");
	return true;
}

/*funzioni di supporto*/
function opt10rnd(){
	//estraggo casulamente cliente e magazzino e ne effettuo il riassegnamento, se la capacità residua lo permette
	cliente = Math.floor(Math.random() * (GAP.n-1));
	var isol = GAP.sol[cliente];
	magazzino = Math.floor(Math.random() * (GAP.m-1));
	//se è lo stesso, prendo il prossimo
	if (magazzino == isol){
		magazzino = (magazzino + 1) % GAP.m;
	}
	return opt10rndsingle(cliente,magazzino);
}

function opt10rndsingle(c,m){
	var solTemp=GAP.sol
	//devo vedere quali sono i residui
	capres=calcolaCapRes();
	var soltemp=GAP.sol.slice();
	if(capres[m]>=GAP.req[m][c]){
		soltemp[c]=m;
	}
	return soltemp;
}

function opt10(matcosti) {
	// Ad ogni cliente scambio un magazzino con un altro e se il nuovo assegnamento ha un costo minore lo aggiungo alle soluzioni
	if(matcosti==undefined){
		matcosti=GAP.c;
	}
	var z = 0, zcheck = 0;
	var i, isol, j;
	var capres = new Array(GAP.m); // array delle capacità residue
	capres=calcolaCapRes();
	z=calcolaCosto(GAP.sol);
	
	// per ogni cliente prendo il magazzino a cui è associato e lo cambio con tutti gli altri
	zub=opt10single(capres,z,matcosti);
	
	if(Math.abs(zub - checkSolution(GAP.solbest)) > EPS){
		console.log("ERRORE: soluzione non ammissibile");
		println("ERRORE: soluzione non ammissibile");
	}
	
	return zub;
}

function opt10single(capres,z,matcosti){
	//per ogni cliente
	for (j = 0; j < GAP.n; j++) {
		isol = GAP.sol[j];
		for (i = 0; i < GAP.m; i++) {
			// se è lo stesso magazzino
			if (i == isol) continue;
			if (matcosti[i][j] < matcosti[isol][j] && capres[i] >= GAP.req[i][j]) {
				// costo minore, faccio il nuovo assegnamento
				GAP.sol[j] = i;
				capres[i] -= GAP.req[i, j];
				capres[isol] += GAP.req[isol][j];
				// avendo fatto l'assegnamento il costo della soluzione viene decrementato fra la soluzione iniziale e quella attuale
				z -= (matcosti[isol][j] - matcosti[i][j]);
				zcheck = checkSolution(GAP.sol);
				// se la soluzione migliore attuale è migliore della "migliore di sempre" me la salvo
				if (z < zub && (Math.abs(z - zcheck) <= EPS)) {
					zub = z;
					GAP.solbest=GAP.sol.slice();
				}
				
				opt10single(capres,z,matcosti);
			}
		}
	}
	return zub;
}

function opt11(){
	// scambio i magazzini tra due clienti
	var j, j1, j2, temp, cap1, cap2;
	var capres = new Array(GAP.m); // array delle capacità residue
	var delta, z = 0, zcheck;

	capres=GAP.cap.slice();

	capres = calcolaCapRes()
	z=calcolaCosto(GAP.sol);

	zub=opt11single(capres,z);
	
	if(Math.abs(zub - checkSolution(GAP.sol)) > EPS){
		console.log("ERRORE: soluzione non ammissibile");
		println("ERRORE: soluzione non ammissibile");
	}

	
	return zub;
}
	
function opt11single(capres,z){
	// scambio 2 clienti
	for (j1 = 0; j1 < GAP.n; j1++) {
		for (j2 = j1 + 1; j2 < GAP.n; j2++) {
			//controllo se lo scambio porta ad un miglioramento in termini di costo
			delta = (GAP.c[GAP.sol[j1]][j1] + GAP.c[GAP.sol[j2]][j2]) - (GAP.c[GAP.sol[j1]][j2] + GAP.c[GAP.sol[j2]][j1]);
			if (delta > 0) {
				//controllo se le capacità permettono lo scambio
				cap1 = capres[GAP.sol[j1]] + GAP.req[GAP.sol[j1]][j1] - GAP.req[GAP.sol[j2]][j2];
				cap2 = capres[GAP.sol[j2]] + GAP.req[GAP.sol[j2]][j2] - GAP.req[GAP.sol[j1]][j1];
				if (cap1 >= 0 && cap2 >= 0) {
					// modifico le capacità residue aggiungendo la richiesta del cliente che tolgo e togliendo quella del cliente aggiunto
					capres[GAP.sol[j1]] += GAP.req[GAP.sol[j1]][j1];
					capres[GAP.sol[j1]] -= GAP.req[GAP.sol[j2]][j2];

					capres[GAP.sol[j2]] += GAP.req[GAP.sol[j2]][j2];
					capres[GAP.sol[j2]] -= GAP.req[GAP.sol[j1]][j1];
					// scambio i due magazzini
					temp = GAP.sol[j1];
					GAP.sol[j1] = GAP.sol[j2];
					GAP.sol[j2] = temp;

					z -= delta;
					zub = z;
					
					opt11single(capres,z);
				}
			}
		}
	}
	return zub;
}

function neigh21() {
	// scambio due clienti aventi lo stesso magazzino con un altro magazzino
	var i1 = 0, i2 = 0, j = 0, j11 = 0, j12 = 0, j21 = 0, iter = 0;
	var lst1 = [], lst2=[];
	var capres = new Array(GAP.m);
	var zcheck = 0;

	capres=GAP.cap.slice();
	capres=calcolaCapRes();

	i1 = Math.floor(Math.random()* (GAP.m-1));
	i2 = Math.floor(Math.random()* (GAP.m-1));
	if (i1 == i2)
		i2 = (i2 + 1) % GAP.m;

	for (j = 0; j < GAP.n; j++) {
		if (GAP.sol[j] == i1)
			lst1.push(j);
		if (GAP.sol[j] == i2)
			lst2.push(j);
	}

	// scelgo 2 magazzini a caso in i1 e uno a caso in i2
	iter = 0;
	neigh21single(lst1,lst2,capres,i1,i2,iter);
}

function neigh21single(lst1,lst2,capres,i1,i2,iter){
	j11 = Math.floor(Math.random()* (lst1.length-1));
	j12 = Math.random()* (lst1.length-1);
	if (j12 == j11)
		j12 = (j12 + 1) % lst1.Count;
	j11 = lst1[j11]; //primo cliente casuale magazzino A
	j12 = lst1[j12]; //secondo cliente casuale magazzino A
	j21 = lst2[Math.random()*(lst2.length-1)]; //primo cliente casuale magazzino B
	if (((capres[i1] + GAP.req[i1][j11] + GAP.req[i1][j12] - GAP.req[i2][j21]) >= 0) &&
		((capres[i2] - GAP.req[i2][j11] - GAP.req[i2][j12] + GAP.req[i1][j21]) >= 0)) {
		//se non è ammissibile ripristino i precedenti valori
		var a11 = GAP.sol[j11];
		var a12 = GAP.sol[j12];
		var a21 = GAP.sol[j21];
		// aggiorno la soluzione (scambio)
		GAP.sol[j11] = i2;
		GAP.sol[j12] = i2;
		GAP.sol[j21] = i1;
		zcheck = checkSolution(GAP.sol);
		if (zcheck == Number.MAX_VALUE) {
			//ripristino i valori precedenti
			GAP.sol[j11] = a11;
			GAP.sol[j12] = a12;
			GAP.sol[j21] = a21;
		}
	} else {
		iter++;
		if (iter < 50){
			neigh21single(lst1,lst2,capres,i1,i2,iter);
		}
	}
}

function calcolaCosto(matsoluz){
	var z=0;
	for (j = 0; j < GAP.n; j++) {
		z += GAP.c[matsoluz[j]][j];
	}
	return z;
}

function calcolaCapRes(){
		var capres = GAP.cap.slice();

		for (j = 0; j < GAP.n; j++) {
			capres[GAP.sol[j]] -= GAP.req[GAP.sol[j]][j];
		}
		return capres;
	}
	
function checkSolution(sol){
	var cost = 0;
	var j;
	var capused=new Array(GAP.m);

	// controllo assegnamenti
	for (j = 0; j < GAP.n; j++)
		if (sol[j] < 0 ||  sol[j] >=  GAP.m) {
			cost = Number.MAX_VALUE;
			return cost;
		} else{
			cost += GAP.c[sol[j]][j];
		}

	// controllo capacità
	for (j = 0; j < GAP.n; j++) {
		capused[sol[j]] += GAP.req[sol[j]][j];
		if (capused[sol[j]] > GAP.cap[sol[j]]) {
			cost = Number.MAX_VALUE;
			return cost;
		}
	}
	return cost;
}


/*AREA INIZIO FUNZIONE SPECIFICHE*/
/* EURISTICA COSTRUTTIVA (per soluzione iniziale)*/
function euristicaCostruttiva(){

	//ad ogni cliente assegno un magazzino, in base alle richieste crescenti
	var req=new Array(GAP.m);
	var ind=new Array(GAP.m);
	GAP.sol=new Array(GAP.n);
	GAP.solbest=new Array(GAP.n);
	capleft=GAP.cap.slice();
	
	zub = 0;
	// per ogni cliente
	for (j = 0; j < GAP.n; j++) {
		// per ogni magazzino
		var cli_requests = [];
		for (i = 0; i < GAP.m; i++) {
			req[i] = GAP.req[i][j];
			ind[i] = i; // array di supporto per l'ordinamento
			cli_requests.push({'req':req[i],'ind':ind[i]});
		}
		// ordina in base alle richieste crescenti
		ind.sort(function(a,b){return req[a]-req[b]});
		ii = 0;
		while (ii < GAP.m) {
			i = ind[ii];
			if (capleft[i] >= GAP.req[i][j]) {
				GAP.sol[j] = i; // soluzione: a sol[j] è associato il cliente j
				GAP.solbest[j] = i; // soluzione migliore
				capleft[i] -= GAP.req[i][j]; // riduco la capacità
				zub += GAP.c[i][j]; // aumento zub per incrementare il costo totale
				break;
			}
			//se questo magazzino non ha abbastanza capacità, allora provo col successivo
			ii++;
		}
		if (ii == GAP.m)
			alert("Errore nella creazione della soluzione iniziale");
	}
	
	if(Math.abs(zub - checkSolution(GAP.sol)) > EPS){
		console.log("ERRORE: soluzione non ammissibile");
		println("ERRORE: soluzione non ammissibile");
		zub = Number.MAX_VALUE;
	}
	else{
		console.log("Terminata la costruzione della soluzione iniziale, costo " + zub);
		println("Terminata la costruzione della soluzione iniziale, costo " + zub);
		println("----------");
		console.log(GAP.sol);
		console.log("---------------------");
	}

	return zub;
}

/*SIMULATED ANNEALING*/
function simulatedAnnealing(){
	document.querySelector("#main").classList.add('doing');
	zub=euristicaCostruttiva();
	
	var k=10; //costante di Boltzmann
	var maxT=1000;
	var maxIter=1000;
	var alpha=0.95; //aggiornamento della temperatura
	
	var z = 0, p = 0, rand = 0, T = 0;
	var i, isol, j, iter;

	
	console.log("Starting simulated annealing, costo iniziale " + zub);
	println("Starting simulated annealing, costo iniziale " + zub);
	T = maxT;
	iter = 0;
	
	ob=anneal(iter,T,alpha,k,zub);
			
	var end=true;
	while(end){
		// end condition
		if (ob.T > 0.001){
			//alta temperatura: diversifica esplorazione
		}
		else if (ob.iter < maxIter) {
			//bassa temperatura: intensifica esplorazione
			ob.T = maxT;
		}
		else{
			end=false;
		}
		ob=anneal(ob.iter,ob.T,ob.alpha,ob.k,ob.zub);
	}	

	if(Math.abs(ob.zub - checkSolution(GAP.solbest)) > EPS){
		console.log("ERRORE: soluzione non ammissibile");
		println("ERRORE: soluzione non ammissibile");
	}
	
	console.log("Terminata Simulated annealing, costo migliore trovato " + ob.zub);
	println("Terminata Simulated annealing, costo migliore trovato " + ob.zub);
	println("----------");
	console.log(GAP.solbest);
	console.log("---------------------");
	API.saveData("simulated_annealing");
	document.querySelector("#main").classList.remove('doing');
}

function anneal(iter,T,alpha,k,zub){
	iter++;
	
	//neighborhood 1-0 opt
	var costoprima=calcolaCosto(GAP.sol)
	soltemp=opt10rnd();
	var costodopo=calcolaCosto(soltemp);
	
	//se ho un miglioramento allora mantengo il cambio cliente/magazzino
	if(costodopo-costoprima<0){
		GAP.sol=soltemp;
		//se è la soluzione migliore globale, la salvo
		if(costodopo<zub){
			GAP.solbest=soltemp;
			zub=costodopo;
		}
	}
	else{
		// condizione di metropolis
		p = Math.exp(-(costoprima - costodopo) / (k * T));
		rand=Math.random();
		if (rand < p) {
			GAP.sol = soltemp;
		}
	}

	//stampo andamento
	if(iter % 20000==0){
		console.log("Costo: " +costodopo);
		println("Costo: " +costodopo);
	}
	
	// annealing condition
	if ((iter % 1000) == 0){
		T = alpha * T;
	}
	return {"iter":iter,"T":T,"alpha":alpha,"zub":zub,"k":k};
}

/*TABU SEARCH*/
function tabuSearch(){
	document.querySelector("#main").classList.add('doing');
	zub=euristicaCostruttiva();
	var tTenure=10; //tabu tenure
	var maxIter=1000;
	
	var z = 0, deltaMAx;
	var i, isol, j, iter, imax, jmax;
	var capres = GAP.cap.slice();
	var TL=new Array(GAP.m); //tabu list
	var memLongTerm=new Array(GAP.m); //tabu list
	var tempTL=new Array(GAP.m);
	for(i=0;i<GAP.m;i++){
		TL[i]=new Array(GAP.n);
		memLongTerm[i]=new Array(GAP.n);
	}
	capres=GAP.cap.slice();
	for (j = 0; j < GAP.n; j++) {
		// la capres del magazzino con cliente j viene decrementata della richiesta di j, sol[j] = cliente
		capres[GAP.sol[j]] -= GAP.req[GAP.sol[j]][j];
		z += GAP.c[GAP.sol[j]][j];
	}
	iter = 0;
	for (i = 0; i < GAP.m; i++) {
		for (j = 0; j < GAP.n; j++) {
			TL[i][j] = Number.MIN_VALUE;
			memLongTerm[i][j] = 0;
		}
	}
	console.log("Starting Tabu Search, costo iniziale " + zub);
	println("Starting Tabu Search, costo iniziale " + zub);
	tabuSearchStep(iter,capres,TL,memLongTerm,tTenure,z,maxIter,zub);
}

function tabuSearchStep(iter,capres,TL,memLongTerm,tTenure,z,maxIter,zub){
	deltaMAx = Number.MIN_VALUE;
	jmax = 0;
	imax = GAP.sol[jmax];
	iter++;
	isimproved=false;
	
	// per ogni cliente
	for (j = 0; j < GAP.n; j++) {
		// isol è il magazzino a cui attualmente è attaccato
		isol = GAP.sol[j];
		//per il cliente j scorro con i tutti i magazzini
		for (i = 0; i < GAP.m; i++) {
			if (i == isol) continue;
			// se il costo è più basso e posso servirlo (soluzione non in tabu list)
			if ((GAP.c[isol][j] - GAP.c[i][j]) > deltaMAx && capres[i] >= GAP.req[i][j] && (TL[i][j] + tTenure) < iter) {
				imax = i;
				jmax = j;
				deltaMAx = GAP.c[isol][j] - GAP.c[i][j];
				isimproved=true;
			}
		}
	}
	
	if(!isimproved){
		//se soluzioni non tabu sono peggiorative, cerco nella memoria storica, assegnando la meno frequente
		var available_tabu = [];
		for (var m = 0; m < GAP.m; m++){
			for (var c = 0; c < GAP.n; c++){
				if (TL[m][c] > 0){
					// seleziono solo gli elementi tabu'
					available_tabu.push({ mag: m, cli: c, memLongTerm: memLongTerm[m][c] });
				}
			}
		}
		// ordino la lista per frequenza crescente
		available_tabu.sort(function(a,b){ return a["memLongTerm"]-b["memLongTerm"] }); // ordino in maniera ascendente
		for(var k=0; k < available_tabu.length; k++){
			var tabu = available_tabu[k];
			jmax=tabu["cli"];
			imax=tabu["mag"];
			break;
		}
	}
			
	isol = GAP.sol[jmax];
	deltaMAx = GAP.c[isol][jmax] - GAP.c[imax][jmax];
	GAP.sol[jmax] = imax;

	capres[imax] -= GAP.req[imax][jmax];
	capres[isol] += GAP.req[isol][jmax];

	TL[imax][jmax] = iter;
	memLongTerm[imax][jmax]++;
	z -= deltaMAx;

	if (z < zub) {
		zub = z;
		GAP.solbest=GAP.sol.slice();
		console.log("Costo: " + zub);
		println("Costo: " + zub);
	}
	
	if (iter < maxIter) {
		tabuSearchStep(iter,capres,TL,memLongTerm,tTenure,z,maxIter,zub);
	}
	
	else{
		if(Math.abs(zub - checkSolution(GAP.solbest)) > EPS){
			console.log("ERRORE: soluzione non ammissibile");
			println("ERRORE: soluzione non ammissibile");
		}
		
		console.log("Terminata Tabu Search, costo migliore trovato " + zub);
		println("Terminata Tabu Search, costo migliore trovato " + zub);
		println("----------");
		console.log(GAP.solbest);
		console.log("---------------------");
		API.saveData("tabu_search");
		document.querySelector("#main").classList.remove('doing');
	}
	
	
}

/*ITERATED LOCAL SEARCH*/
function IteratedLocalSearch(){
	document.querySelector("#main").classList.add('doing');
	zub=euristicaCostruttiva();
	var maxIter=1000;
	console.log("Starting Iterated Local Search, costo iniziale " + zub);
	println("Starting Iterated Local Search, costo iniziale " + zub);
	for (iter = 0; iter < maxIter; iter++) {
		//condizione di accetazione implicita in opt10: continuo dalla minore delle 2
		zub = opt10();
		if(iter % 100 ==0){
			console.log("Costo (S*): "+ zub);
			println("Costo (S*): "+ zub);
		}
		zub=dataPerturbation();
		if(iter % 100 ==0){
			console.log("Costo (S'*): "+zub);
			println("Costo (S'*): "+zub);
		}
	}
	if(Math.abs(zub - checkSolution(GAP.solbest)) > EPS){
		console.log("ERRORE: soluzione non ammissibile");
		println("ERRORE: soluzione non ammissibile");
	}
	
	console.log("Terminata Iterated Local Search, costo migliore trovato " + zub);
	println("Terminata Iterated Local Search, costo migliore trovato " + zub);
	println("----------");
	console.log(GAP.solbest);
	console.log("---------------------");
	API.saveData("iterated_local_search");
	document.querySelector("#main").classList.remove('doing');
}

function dataPerturbation(){
	var i, j;
	var matricePerturbata = new Array(GAP.m);
	for (j = 0; j < GAP.m; j++) {
		matricePerturbata[j]=new Array(GAP.n);
	}
	
	for (i = 0; i < GAP.m; i++) {
		for (j = 0; j < GAP.n; j++) {
			matricePerturbata[i][j] =GAP.c[i][j] + GAP.c[i][j] * 0.7 * Math.random();
		}
	}
	//ricerca locale
	zub=opt10(matricePerturbata);
	return zub;
}

/*VARIABLE NEIGHBORHOOD SEARCH*/
function variableNeighborhoodSearch(){
	document.querySelector("#main").classList.add('doing');
	zub=euristicaCostruttiva();
	var maxIter=1000;
	var iter=0;
	var z1, z2;
	console.log("Starting Variable Neighborhood Search, costo iniziale " + zub);
	println("Starting Variable Neighborhood Search, costo iniziale " + zub);
	ob=variableNeighborhoodSearchStep(iter,maxIter);
	while (ob.iter < ob.maxIter) {
		ob=variableNeighborhoodSearchStep(ob.iter,ob.maxIter);
	}
	if(Math.abs(ob.zub - checkSolution(GAP.solbest)) > EPS){
		console.log("ERRORE: soluzione non ammissibile");
		println("ERRORE: soluzione non ammissibile");
	}
	
	console.log("Terminata Variable Neighborhood Search, costo migliore trovato " + ob.zub);
	println("Terminata Variable Neighborhood Search, costo migliore trovato " + ob.zub);
	println("----------");
	console.log(GAP.solbest);
	console.log("---------------------");
	API.saveData("variable_neighborhood_search");
	document.querySelector("#main").classList.remove('doing');
}

function variableNeighborhoodSearchStep(iter,maxIter){
	z1 = opt10();
	z2 = opt11();
	if (z2 < z1) {
		iter = 0;
		variableNeighborhoodSearchStep(iter,maxIter);
	} else {
		neigh21();
	}
	if(iter % 100 ==0){
		console.log("Costo: "+ z2);
		println("Costo: "+ z2);
	}
	iter++;
	
	return {"iter":iter,"maxIter":maxIter,"zub":z2};
}
	