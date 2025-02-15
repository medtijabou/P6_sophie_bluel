// Configuration
const API_URL = 'http://localhost:5678/api';
const WORKS_URL = `${API_URL}/works`;
const CATEGORIES_URL = `${API_URL}/categories`;
const API_DElete =`http://localhost:5678/api/works/1`

// Éléments du DOM
const editButtons = document.querySelectorAll(".edit");
const closeModalButtons = document.querySelectorAll(".close-modal, .close-select, .go-back");
const ajoutPhotoBtn = document.querySelector("#btn-ajout-photo");
const fileInput = document.querySelector("#fileInput");
const validerBtn = document.querySelector("#valider-modal");
const previewDiv = document.querySelector(".ajout-image");
const titleInput = document.querySelector("#title");
const categoryInput = document.querySelector("#category");
const modal = document.querySelector(".select-modal");
const imgModal = document.querySelector(".img-modal");
const gallery = document.querySelector(".gallery");
const filtersContainer = document.querySelector(".fonction");
const modalgalrie = document.querySelector("#modalgalrie");
const selectModal = document.querySelector(".select-modal");
// token
const token = sessionStorage.getItem("authToken");
const edit = document.querySelector(".edit");
const modif = document.querySelector(".modif");
const logout = document.querySelector(".logout");
const login = document.querySelector(".login");
const filtre = document.querySelector(".fonction");
  
/* ===========================
   1. INITIALISATION
=========================== */


// Fonction principale
function main() {
   getCategories(); // Charge les catégories
   getWorks(); // Charge les travaux
   checkAuth(); // Vérifie l'authentification
   displayModal(); // Affiche les travaux dans la modale
   setupEventListeners(); // Configure les écouteurs d'événements
}

// Lancement de l'application
main();
// Gestion des événements

function setupEventListeners() {
   // Gestion des modales
   document.addEventListener("click", (event) => {
       if (logout) {
           logout.addEventListener("click", (e) => {
               e.preventDefault();
               sessionStorage.removeItem("authToken");
               checkAuth();
               window.location.href = "index.html";
           });
       }
       if (event.target.closest(".edit")) {
           toggleModal("#modalgalrie");
       } else if (event.target.closest(".close-modal")) {
           toggleModal(null, "#modalgalrie");
       } else if (event.target.closest(".ajoute-modal")) {
           toggleModal(".select-modal", "#modalgalrie");
       } else if (event.target.closest(".close-select")) {
           toggleModal(null, ".select-modal");
       } else if (event.target.closest(".go-back")) {
           toggleModal("#modalgalrie", ".select-modal");
       }

       // Fermer la modale #modalgalrie si on clique à l'extérieur de celle-ci
       if (event.target === modalgalrie) {
           modalgalrie.style.display = "none";
       }
       if (event.target === selectModal) {
           selectModal.style.display = "none";
       }
   });

   // Gestion de l'ajout d'image
   if (ajoutPhotoBtn && fileInput && titleInput && categoryInput && validerBtn) {
       ajoutPhotoBtn.addEventListener("click", () => {
           const modal = document.querySelector(".select-modal");
           if (modal) {
               modal.style.display = "block";
               fileInput.click();
           }
       });

       fileInput.addEventListener("change", handleImageUpload);
       titleInput.addEventListener("input", validateForm);
       categoryInput.addEventListener("change", validateForm);
       validerBtn.addEventListener("click", handleFormSubmit);
   } else {
       console.error("Un ou plusieurs éléments du formulaire sont introuvables.");
   }
}


// Fonction pour basculer entre les modales
function toggleModal(openModalSelector, closeModalSelector) {
   if (openModalSelector) {
       const openModal = document.querySelector(openModalSelector);
       if (openModal) {
           openModal.style.display = "block";
       }
   }
   if (closeModalSelector) {
       const closeModal = document.querySelector(closeModalSelector);
       if (closeModal) {
           closeModal.style.display = "none";
       }
   }
}


/* ===========================
   2. GESTION DES DONNÉES
=========================== */


// Récupère les travaux
async function getWorks(categoryId = null) {
   const works = await fetchData(WORKS_URL);
   const filteredWorks = categoryId ? works.filter(work => work.categoryId === parseInt(categoryId)) : works;
   displayWorks(filteredWorks);
}


// Affiche les travaux dans la galerie
function displayWorks(works) {
    gallery.innerHTML = works.map(work => `
        <figure data-id="${work.id}">
            <img src="${work.imageUrl}" alt="${work.title}">
            <figcaption>${work.title}</figcaption>
        </figure>
    `).join("");
 }


// Récupère les catégories
async function getCategories() {
   const categories = await fetchData(CATEGORIES_URL);
   filtersContainer.innerHTML = `
       <button class="active">Tous</button>
       ${categories.map(category => `
           <button data-id="${category.id}">${category.name}</button>
       `).join("")}
   `;

   filtersContainer.addEventListener("click", (event) => {
       if (event.target.tagName === "BUTTON") {
           document.querySelectorAll(".fonction button").forEach(btn => btn.classList.remove("active"));
           event.target.classList.add("active");
           getWorks(event.target.dataset.id);
       }
   });
}


// Affiche les travaux dans la modale
async function displayModal() {
    const works = await fetchData(WORKS_URL);
    imgModal.innerHTML = works.map(work => `
        <figure data-id="${work.id}">
            <img src="${work.imageUrl}" alt="${work.title}">
            <button class="delete" aria-label="Supprimer ${work.title}">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </figure>
    `).join("");
 
    imgModal.querySelectorAll(".delete").forEach(button => {
        button.addEventListener("click", (event) => {
            const workId = button.closest("figure").dataset.id;  // On récupère l'ID à partir de l'élément
            deleteWork(workId);  // Appel de la fonction de suppression avec l'ID
        });
    });
 }
 
// Fonction pour récupérer des données
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erreur: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Erreur:', error);
        return [];
    }
 }
 

// Supprime une image de la galerie
function removeImageFromGallery(workId) {
    const imageToRemove = gallery.querySelector(`[data-id="${workId}"]`);
    if (imageToRemove) {
     imageToRemove.remove();
 }
 
 
 // Supprime aussi l'image de la modale
 const imageToRemoveFromModal = imgModal.querySelector(`[data-id="${workId}"]`);
 if (imageToRemoveFromModal) {
     imageToRemoveFromModal.remove();
 }
 }
 




/* ===========================
   3. AUTHENTIFICATION
=========================== */


// Vérifie l'authentification
function checkAuth() {
   if (token) {
       if (edit) edit.style.display = "block";
       if (modif) modif.style.display = "flex";
       if (logout) logout.style.display = "block";
       if (login) login.style.display = "none";
       if (filtre) filtre.style.display = "none";
   } else {
       if (edit) edit.style.display = "none";
       if (modif) modif.style.display = "none";
       if (logout) logout.style.display = "none";
       if (login) login.style.display = "block";
       if (filtre) filtre.style.display = "flex";
   }
}


// Déconnexion
document.addEventListener("DOMContentLoaded", () => {
   const logout = document.querySelector(".logout");
   if (logout) {
       logout.addEventListener("click", (e) => {
           e.preventDefault();
           sessionStorage.removeItem("authToken");
           checkAuth();
           window.location.href = "index.html";
       });
   }
});


/* ===========================
   4. AJOUT D'IMAGES
=========================== */


// Gestion de l'upload d'image
function handleImageUpload(event) {
   const file = event.target.files[0];
   if (file && file.type.startsWith("image/")) {
       const reader = new FileReader();
       reader.onload = (e) => {
           previewDiv.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
           selectedImage = e.target.result;
           validateForm();
       };
       reader.readAsDataURL(file);
}
}

// Validation du formulaire
function validateForm() {
   const isFormValid = titleInput.value.trim() && categoryInput.value !== "0" && selectedImage;
   validerBtn.disabled = !isFormValid;
   validerBtn.classList.toggle("active", isFormValid);
}


// Soumission du formulaire
async function updateSelectModal() {
   const works = await fetchData(WORKS_URL);
   imgModal.innerHTML = works.map(work => `
       <figure data-id="${work.id}">
           <img src="${work.imageUrl}" alt="${work.title}">
           <button class="delete" aria-label="Supprimer ${work.title}">
               <i class="fa-solid fa-trash-can"></i>
           </button>
       </figure>
   `).join("");


   imgModal.querySelectorAll(".delete").forEach(button => {
       button.addEventListener("click", () => {
           const workId = button.closest("figure").dataset.id;
           removeImageFromGallery(workId);
           button.closest("figure").remove();
       });
   });
}


/* ===========================
   5. FONCTIONS UTILITAIRES
=========================== */
async function deleteWork(workId) {
    const url = `http://localhost:5678/api/works/${workId}`;
    const token = sessionStorage.getItem("authToken"); // Vérifier le token ici

    if (!token) {
        alert("Vous devez être connecté pour supprimer un élément.");
        return;
    }

    try {
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // Ajout du token ici
            },
        });

        if (response.ok) {
            console.log("Travail supprimé !");
            removeImageFromGallery(workId);
            await getWorks(); // Recharger la galerie
        } else if (response.status === 401) {
            alert("Accès non autorisé. Veuillez vous reconnecter.");
            sessionStorage.removeItem("authToken");
            window.location.href = "login.html"; // Rediriger vers la page de connexion
        } else {
            const errorDetails = await response.json();
            console.error("Erreur de suppression", errorDetails);
            alert(`Erreur lors de la suppression: ${errorDetails.message || 'Erreur interne du serveur'}`);
        }
    } catch (error) {
        console.error("Erreur lors de la suppression", error);
        alert('Une erreur est survenue. Veuillez réessayer.');
    }
}



// Soumission du formulaire
async function handleFormSubmit() {
    if (titleInput.value.trim() && categoryInput.value !== "0" && selectedImage) {
        const newWork = {
            title: titleInput.value,
            categoryId: parseInt(categoryInput.value),
            imageUrl: selectedImage,
        };

        // Réinitialisation du formulaire
        titleInput.value = "";
        categoryInput.value = "0";
        fileInput.value = "";
        selectedImage = null; // Réinitialiser l'image sélectionnée

        // Désactiver le bouton "valider"
        validerBtn.disabled = true;
        validerBtn.classList.remove("active");

        // Fermeture de la modale
        modal.style.display = "none";

        // Ajout du nouveau travail à la galerie
        const newWorkElement = `
            <figure data-id="${newWork.id}">
                <img src="${newWork.imageUrl}" alt="${newWork.title}">
                <figcaption>${newWork.title}</figcaption>
            </figure>
        `;
        gallery.insertAdjacentHTML("beforeend", newWorkElement);

        // Actualisation de la modal .select-modal
        await updateSelectModal(); // Appel de la fonction pour mettre à jour la modale

        // Réinitialisation de l'upload d'image pour permettre une nouvelle sélection
        resetImageUpload();
    } else {
        alert("Veuillez remplir tous les champs avant de valider !");
    }
}
// Réinitialiser l'upload pour permettre une nouvelle sélection
function resetImageUpload() {
    previewDiv.innerHTML = `
       <div class="ajout-image">
            <i class="fa-solid fa-image"></i>
            <button id="btn-ajout-photo">+ Ajouter une photo</button>
            <input type="file" id="fileInput" style="display: none;" accept="image/*">
            <p class="info-image">jpg, png : 4mo max</p>
        </div>
    `;
    selectedImage = null;
    validateForm(); // Re-valider le formulaire (si nécessaire)

    // Ajouter un événement pour ouvrir la boîte de dialogue de fichier quand on clique sur le bouton
    document.getElementById("btn-ajout-photo").addEventListener("click", function() {
        document.getElementById("fileInput").click(); // Simule le clic sur l'input type="file"
    });

    // Réattacher l'événement au nouvel input pour gérer l'upload de l'image
    document.getElementById("fileInput").addEventListener("change", handleImageUpload);
}
