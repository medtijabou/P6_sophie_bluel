// Configuration
const API_URL = 'http://localhost:5678/api';
const WORKS_URL = `${API_URL}/works`;
const CATEGORIES_URL = `${API_URL}/categories`;

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
//token
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
 // click deconnexion
    document.addEventListener("click", (event) => {
        const logout = document.querySelector(".logout");
        if (logout) {
            logout.addEventListener("click", (e) => {
                e.preventDefault();
                deconnecter();
            });
        }
           // Gestion des modales
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
//deconnexion

document.addEventListener("DOMContentLoaded", setupEventListeners);

function deconnecter() {
    sessionStorage.removeItem("authToken");
    checkAuth();
    window.location.href = "index.html";
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

/* ===========================
    3. MODAL DE SÉLECTION
=========================== */
// Affichage des images dans la modale avec bouton de suppression
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

    // Ajout des événements pour les boutons de suppression
    imgModal.querySelectorAll(".delete").forEach(button => {
        button.addEventListener("click", deleteWork);
    });
}


// Supprime l'image de la galerie
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


/* ===========================
    4. AJOUT D'IMAGES
=========================== */

// Gestion de l'upload d'image
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
        fileInput.value = ""; // Réinitialise le champ fileInput pour permettre une nouvelle sélection
        previewDiv.innerHTML = ""; // Efface l'aperçu de l'image
        selectedImage = null; // Réinitialise l'image sélectionnée
        validerBtn.disabled = true; // Désactive le bouton de validation
        validerBtn.classList.remove("active"); // Enlève la classe "active" du bouton de validation

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
        await updateSelectModal();

        // Réactive la validation du formulaire
        validateForm();

        // Réactive le bouton d'ajout d'image
        ajoutPhotoBtn.style.display = "block"; // Assure que le bouton reste visible après validation

    } else {
        alert("Veuillez remplir tous les champs avant de valider !");
    }
}


// Gestion de l'upload d'image et validation
function handleImageUpload(event) {
    const file = event.target.files[0];
    
    // Vérifier si c'est une image valide
    if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
            // Afficher l'image dans l'aperçu
            previewDiv.innerHTML = `<img src="${e.target.result}" alt="Preview" class="image-preview">`;
            selectedImage = e.target.result; // Sauvegarder l'image choisie

            // Mettre à jour la validation du formulaire
            validateForm();

            // Assurer que le bouton d'ajout d'image reste visible après un upload
            ajoutPhotoBtn.style.display = "block"; 

            // Réinitialiser le champ `fileInput` pour permettre une nouvelle sélection
            fileInput.value = "";
        };
        reader.readAsDataURL(file);
    } else {
        // Si ce n'est pas une image valide, cacher l'aperçu et permettre une nouvelle sélection
        previewDiv.style.display = "none";
        selectedImage = null;
        validateForm();

        // Garder le bouton d'ajout visible
        ajoutPhotoBtn.style.display = "block";
    }
}


// Validation du formulaire
function validateForm() {
    const isFormValid = titleInput.value.trim() && categoryInput.value !== "0" && selectedImage;
    validerBtn.disabled = !isFormValid;
    validerBtn.classList.toggle("active", isFormValid);
}




// Soumission du formulaire et mise à jour de la galerie
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




// Fonction pour supprimer un travail de la galerie et de l'API
async function deleteWork(event) {
    const workId = event.target.closest("figure").dataset.id; // Récupérer l'ID de l'image à supprimer
    if (!workId) {
        alert("ID du travail introuvable !");
        return;
    }

    if (!token) {
        alert("Vous devez être connecté pour supprimer une image.");
        return;
    }

    try {
        const response = await fetch(`${WORKS_URL}/${workId}`, {
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${token}`, // Envoi du token pour l'authentification
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            // Supprimer l'image du DOM après suppression réussie
            removeImageFromGallery(workId);
            updateSelectModal();  // Mise à jour de la modale des travaux
        } else if (response.status === 401) {
            alert("Vous devez être connecté pour effectuer cette action.");
        } else if (response.status === 403) {
            alert("Vous n'avez pas les droits pour supprimer cette image.");
        } else {
            alert("Une erreur est survenue lors de la suppression de l'image.");
        }
    } catch (error) {
        console.error("Erreur lors de la suppression de l'image:", error);
        alert("Une erreur s'est produite. Veuillez réessayer plus tard.");
    }
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