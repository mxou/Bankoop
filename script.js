document.addEventListener("DOMContentLoaded", () => {
  const new_account_button = document.querySelector(".new_account_button");
  const new_account_register = document.querySelector(".new_account_register");
  const close_account_register_button = document.querySelector(".close_account_register_button");
  const create_new_account_button = document.querySelector(".create_new_account_button");

  const input_titulaire = document.querySelector(".input_titulaire");
  const input_solde = document.querySelector(".input_solde");
  const input_interets = document.querySelector(".input_interets");
  const accountTypeSelect = document.querySelector(".account_type");

  const accountsContainer = document.querySelector(".accounts_container");

  // Form pour créer un compte
  new_account_button.addEventListener("click", () => new_account_register.classList.add("visible"));
  close_account_register_button.addEventListener("click", () => new_account_register.classList.remove("visible"));

  // Si epargne choisi enable input interet
  accountTypeSelect.addEventListener("change", () => {
    if (accountTypeSelect.value === "epargne") {
      input_interets.disabled = false;
    } else {
      input_interets.disabled = true;
      input_interets.value = "";
    }
  });

  class Courant {
    constructor(titulaire, solde = 0) {
      this.titulaire = titulaire;
      this.solde = solde;
    }
    deposer(montant) {
      this.solde += montant;
    }
    retirer(montant) {
      if (montant <= this.solde) {
        this.solde -= montant;
      } else {
        alert("Solde insuffisant !");
      }
    }
  }

  class Epargne extends Courant {
    constructor(titulaire, solde = 0, taux = 0) {
      super(titulaire, solde);
      this.taux = taux;
    }
    appliquerTaux() {
      this.solde += this.solde * (this.taux / 100);
    }
  }

  class Banque {
    constructor() {
      this.comptes = [];
    }
    ouvrirCompte(type, titulaire, solde, taux = 0) {
      let compte = type === "courant" ? new Courant(titulaire, solde) : new Epargne(titulaire, solde, taux);
      this.comptes.push(compte);
      return compte;
    }
    transferer(compteFrom, compteTo, montant) {
      if (montant <= compteFrom.solde) {
        compteFrom.retirer(montant);
        compteTo.deposer(montant);
      } else {
        alert("Solde insuffisant pour le transfert !");
      }
    }
  }

  const CIC = new Banque();

  function updateDashboard() {
    accountsContainer.innerHTML = "";
    CIC.comptes.forEach((c, index) => {
      const div = document.createElement("div");
      div.classList.add("account_card");

      let tauxDisplay = c instanceof Epargne ? c.taux + "%" : "-";

      div.innerHTML = `
        <p>${c.titulaire}</p>
        <p class="solde_display">${c.solde.toFixed(2)}€</p>
        <p>${tauxDisplay}</p>
      `;

      // Déposer method
      const depositInput = document.createElement("input");
      depositInput.type = "number";
      depositInput.placeholder = "Déposer €";
      const depositBtn = document.createElement("button");
      depositBtn.textContent = "OK";
      depositBtn.addEventListener("click", () => {
        const montant = parseFloat(depositInput.value);
        if (!isNaN(montant)) c.deposer(montant);
        updateDashboard();
      });

      // Retirer method
      const withdrawInput = document.createElement("input");
      withdrawInput.type = "number";
      withdrawInput.placeholder = "Retirer €";
      const withdrawBtn = document.createElement("button");
      withdrawBtn.textContent = "OK";
      withdrawBtn.addEventListener("click", () => {
        const montant = parseFloat(withdrawInput.value);
        if (!isNaN(montant)) c.retirer(montant);
        updateDashboard();
      });

      // Transférer method
      const transferInput = document.createElement("input");
      transferInput.type = "number";
      transferInput.placeholder = "Transférer €";
      const transferSelect = document.createElement("select");
      CIC.comptes.forEach((other, i) => {
        if (i !== index) {
          const option = document.createElement("option");
          option.value = i;
          option.textContent = other.titulaire;
          transferSelect.appendChild(option);
        }
      });
      const transferBtn = document.createElement("button");
      transferBtn.textContent = "OK";
      transferBtn.addEventListener("click", () => {
        const montant = parseFloat(transferInput.value);
        const cible = CIC.comptes[parseInt(transferSelect.value)];
        if (!isNaN(montant) && cible) CIC.transferer(c, cible, montant);
        updateDashboard();
      });

      // Ajouter tous les éléments
      div.appendChild(depositInput);
      div.appendChild(depositBtn);
      div.appendChild(withdrawInput);
      div.appendChild(withdrawBtn);
      div.appendChild(transferInput);
      div.appendChild(transferSelect);
      div.appendChild(transferBtn);

      // Button taux si compte epargne
      if (c instanceof Epargne) {
        const tauxBtn = document.createElement("button");
        tauxBtn.textContent = "Appliquer intérêts";
        tauxBtn.addEventListener("click", () => {
          c.appliquerTaux();
          updateDashboard();
        });
        div.appendChild(tauxBtn);
      }
      accountsContainer.appendChild(div);
    });
  }

  // Creer compte si tout est bon
  create_new_account_button.addEventListener("click", () => {
    const titulaire = input_titulaire.value.trim();
    const solde = Number(input_solde.value);
    const type = accountTypeSelect.value;
    const taux = Number(input_interets.value);

    if (!titulaire || isNaN(solde)) return alert("Veuillez remplir les champs obligatoires.");

    CIC.ouvrirCompte(type, titulaire, solde, taux);
    updateDashboard();

    new_account_register.classList.remove("visible");
    input_titulaire.value = input_solde.value = input_interets.value = "";
    input_interets.disabled = true;
  });
});
