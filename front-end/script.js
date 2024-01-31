class Canvas {
	constructor(width, height) {
		// Récupérer le canvas et son contexte
		this.canvas = document.getElementById("myCanvas");
		this.ctx = this.canvas.getContext("2d");
		this.canvas.width = width;
		this.canvas.height = height;
		// Variables pour garder une trace du dessin
		this.isDrawing = false;
		this.lastX = 0;
		this.lastY = 0;
		this.handleCanvasActions();
	}
	handleCanvasActions = () => {
		// Événements pour dessiner
		this.canvas.addEventListener("mousedown", (e) => {
			this.isDrawing = true;
			[this.lastX, this.lastY] = [e.clientX, e.clientY];
		});

		this.canvas.addEventListener("mousemove", this.draw);
		this.canvas.addEventListener("mouseup", () => (this.isDrawing = false));
		this.canvas.addEventListener(
			"mouseout",
			() => (this.isDrawing = false)
		);
	};
	draw = (e) => {
		if (!this.isDrawing) return; // S'assurer que le clic est enfoncé
		this.ctx.lineWidth = 30; // Largeur du trait
		this.ctx.lineCap = "round"; // Extrémité arrondie du trait

		// Dessiner une ligne depuis la dernière position enregistrée
		this.ctx.beginPath();
		this.ctx.moveTo(this.lastX, this.lastY);
		this.ctx.lineTo(e.clientX, e.clientY);
		this.ctx.stroke();

		// Mettre à jour les coordonnées de la dernière position
		[this.lastX, this.lastY] = [e.clientX, e.clientY];
	};
}

const myCanvas = new Canvas(512, 512);

handleButtonsEvents(myCanvas);

function handleButtonsEvents(myCanvas) {
	// Écouter le clic sur le bouton "Exporter en 28x28"
	const exportButton = document.getElementById("exportButton");
	exportButton.addEventListener("click", () => exportTo28x28(myCanvas));

	// effacer le canvas et l'image de 28x28 pixels lors du clic sur le bouton clear
	const clearButton = document.getElementById("clear");
	clearButton.addEventListener("click", () => clearCanvas(myCanvas));
}

// Fonction pour exporter le dessin en tant qu'image de 28x28 pixels
function exportTo28x28(myCanvas) {
	console.log("export");
	// const myCanvas = document.getElementById("myCanvas");
	const exportCanvas = document.createElement("canvas");
	const exportCtx = exportCanvas.getContext("2d");

	exportCanvas.width = 28;
	exportCanvas.height = 28;

	// Dessiner le contenu du canvas principal sur le canvas d'exportation avec la taille 28x28
	exportCtx.drawImage(myCanvas.canvas, 0, 0, 28, 28);

	// Obtenir les données des pixels de la zone 28x28 du canvas
	const imageData = exportCtx.getImageData(0, 0, 28, 28);
	const pixelData = imageData.data;
	console.log(pixelData);
	// Créer un tableau à 2 dimensions pour stocker les valeurs de niveaux de gris
	const grayscaleArray = [];
	for (let y = 0; y < 28; y++) {
		grayscaleArray[y] = [];

		for (let x = 0; x < 28; x++) {
			const offset = y == 0 ? 0 : (y * 28 + x) * 4 - 1;
			const grayscaleValue = pixelData[offset];
			grayscaleArray[y][x] = grayscaleValue;
		}
	}

	// Afficher le tableau des valeurs de niveaux de gris dans la console
	console.log(grayscaleArray);

	getValueFromModel(grayscaleArray);

	// Convertir le canvas en une image
	const image = exportCanvas.toDataURL("image/png");

	// Mettre à jour l'élément img avec l'image générée
	exportedImage.src = image;
}

function getValueFromModel(dataToSend) {
	// Configuration de la requête POST
	fetch("http://127.0.0.1:8000/process_data", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(dataToSend), // Encodage du tableau en JSON
	})
		.then((response) => response.json())
		.then((data) => {
			console.log("Réponse de l'API :", data);
			// Traitez la réponse de l'API ici
			const h1 = document.querySelector("h1");
			h1.innerHTML = data;
		})
		.catch((error) => {
			console.error("Erreur lors de la requête :", error);
		});
}

function clearCanvas(myCanvas) {
	myCanvas.ctx.clearRect(0, 0, myCanvas.canvas.width, myCanvas.canvas.height);
	document.getElementById("exportedImage").src = "";
}
