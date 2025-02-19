const url = "http://localhost:5678/api/users/login";

document
  .getElementById("loginform")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Empêche le rechargement de la page

    const submitButton = document.getElementById("submit-button");

    // Récupération des données du formulaire
    const user = {
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value,
    };

    // Validation des champs
    if (!user.email || !user.password) {
      showError("Veuillez remplir tous les champs.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      showError("Veuillez entrer une adresse email valide.");
      return;
    }

    try {
      // Désactiver le bouton pendant la soumission
      submitButton.disabled = true;
      submitButton.value = "Connexion...";

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        showError("Erreur dans l’identifiant ou le mot de passe.");
      } else {
        const result = await response.json();
        const token = result.token;

        // Stocke le token et redirige l'utilisateur
        sessionStorage.setItem("authToken", token);
        window.location.href = "index.html";
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
      showError("Impossible de se connecter. Vérifiez votre connexion réseau.");
    } finally {
      submitButton.disabled = false;
      submitButton.value = "Se connecter";
    }
  });

function showError(message) {
  let errorMessage = document.getElementById("error-message");

  // Supprime l'ancien message d'erreur s'il existe
  if (errorMessage) {
    errorMessage.remove();
  }

  // Crée un nouveau message d'erreur
  errorMessage = document.createElement("div");
  errorMessage.id = "error-message";

  // Crée un bouton pour fermer l'erreur
  const closeButton = document.createElement("button");
  closeButton.textContent = "X";
  closeButton.classList.add("close-btn");
  closeButton.addEventListener("click", () => {
    errorMessage.remove();
  });

  // Ajoute le texte du message et le bouton dans la div
  const errorText = document.createElement("span");
  errorText.textContent = message;

  errorMessage.appendChild(errorText);
  errorMessage.appendChild(closeButton);

  // Insère le message avant le formulaire
  document
    .getElementById("loginform")
    .parentNode.insertBefore(
      errorMessage,
      document.getElementById("loginform"),
    );

  // Appliquer l'effet de réduction après 0.5s
  setTimeout(() => {
    errorMessage.classList.add("shrink");
  }, 500);

  // Supprime le message après 3 secondes avec effet de fondu
  setTimeout(() => {
    if (errorMessage) {
      errorMessage.style.opacity = "0";
      setTimeout(() => errorMessage.remove(), 500);
    }
  }, 3000);
}
