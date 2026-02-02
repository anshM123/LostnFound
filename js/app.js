
// Initial sample items if none in storage
let items = JSON.parse(localStorage.getItem("items")) || [
    { id: 1, title: "Black Backpack", claimed: false },
    { id: 2, title: "AirPods Case", claimed: false },
    { id: 3, title: "Calculator", claimed: false }
];

let claims = JSON.parse(localStorage.getItem("claims")) || [];

function saveState() {
    localStorage.setItem("items", JSON.stringify(items));
    localStorage.setItem("claims", JSON.stringify(claims));
}

// ---------------------------
// DOM references
// ---------------------------

const views = {
    home: document.getElementById("home"),
    file: document.getElementById("file"),
    admin: document.getElementById("admin")
};

const navLinks = document.querySelectorAll("nav a[data-view]");
const itemsListEl = document.getElementById("itemsList");
const itemSelectEl = document.getElementById("itemSelect");
const claimFormEl = document.getElementById("claimForm");
const cancelFileBtn = document.getElementById("cancelFile");
const adminBtn = document.getElementById("adminBtn");
const pendingClaimsEl = document.getElementById("pendingClaims");
const adminItemsEl = document.getElementById("adminItems");
const refreshBtn = document.getElementById("refreshBtn");
const claimStatusEl = document.getElementById("claimStatus");

// Claim type fields
const foundFieldsEl = document.getElementById("foundFields");
const lostFieldsEl = document.getElementById("lostFields");

// Form inputs
const lostTitleEl = document.getElementById("lostTitle");
const lostLocationEl = document.getElementById("lostLocation");
const lostDateEl = document.getElementById("lostDate");
const studentNameEl = document.getElementById("studentName");
const contactEl = document.getElementById("contact");
const messageEl = document.getElementById("message");

// ---------------------------
// View handling
// ---------------------------

function setActiveNav(viewName) {
    navLinks.forEach(link => {
        link.classList.toggle("active", link.dataset.view === viewName);
    });
}

function showView(viewName) {
    Object.entries(views).forEach(([name, section]) => {
        section.style.display = name === viewName ? "block" : "none";
    });
    setActiveNav(viewName);
}

// ---------------------------
// Rendering functions
// ---------------------------

function renderItems() {
    itemsListEl.innerHTML = "";

    if (items.length === 0) {
        itemsListEl.innerHTML = `<p class="muted small">No items currently in the lost & found.</p>`;
        return;
    }

    items.forEach(item => {
        const wrapper = document.createElement("div");
        wrapper.className = "item";

        const label = document.createElement("div");
        label.textContent = item.title + (item.claimed ? " (claimed)" : "");

        const btn = document.createElement("button");
        btn.className = "btn";
        btn.textContent = "Claim";
        btn.disabled = item.claimed;
        btn.addEventListener("click", () => startClaimForItem(item.id));

        wrapper.appendChild(label);
        wrapper.appendChild(btn);
        itemsListEl.appendChild(wrapper);
    });

    // Populate select dropdown
    itemSelectEl.innerHTML = "";
    items.forEach(item => {
        const opt = document.createElement("option");
        opt.value = item.id;
        opt.textContent = item.title + (item.claimed ? " (claimed)" : "");
        itemSelectEl.appendChild(opt);
    });
}

function renderClaimStatus() {
    if (claims.length === 0) {
        claimStatusEl.textContent = "No recent claims.";
        return;
    }

    const latest = claims[claims.length - 1];
    let text = "";

    if (latest.type === "found") {
        const item = items.find(i => i.id == latest.itemId);
        const itemTitle = item ? item.title : `Item #${latest.itemId}`;
        text = `${latest.name} submitted a claim for "${itemTitle}" — status: ${latest.status || "pending"}.`;
    } else {
        text = `${latest.name} reported a lost item "${latest.title}" — status: ${latest.status || "pending"}.`;
    }

    claimStatusEl.textContent = text;
}

function renderAdminClaims() {
    pendingClaimsEl.innerHTML = "<h3>Pending Claims</h3>";

    const pending = claims.filter(c => !c.status || c.status === "pending");

    if (pending.length === 0) {
        const empty = document.createElement("p");
        empty.className = "muted small";
        empty.textContent = "No pending claims at the moment.";
        pendingClaimsEl.appendChild(empty);
        return;
    }

    pending.forEach((c, index) => {
        const wrapper = document.createElement("div");
        wrapper.className = "item";

        const info = document.createElement("div");

        if (c.type === "lost") {
            info.innerHTML = `
                <strong>${c.name}</strong> reported <em>lost</em>: "${c.title}"
                <div class="muted small">${c.location || "Location not specified"} · ${c.dateLost || "Date not specified"}</div>
                <div class="muted small">${c.message || ""}</div>
            `;
        } else {
            const item = items.find(i => i.id == c.itemId);
            const itemTitle = item ? item.title : `Item #${c.itemId}`;
            info.innerHTML = `
                <strong>${c.name}</strong> claims: "${itemTitle}"
                <div class="muted small">${c.message || ""}</div>
            `;
        }

        const actions = document.createElement("div");
        actions.className = "actions";

        const approveBtn = document.createElement("button");
        approveBtn.className = "btn";
        approveBtn.textContent = c.type === "lost" ? "Mark Found" : "Approve";
        approveBtn.addEventListener("click", () => approveClaim(index));

        const rejectBtn = document.createElement("button");
        rejectBtn.className = "btn gray";
        rejectBtn.textContent = "Reject";
        rejectBtn.addEventListener("click", () => rejectClaim(index));

        actions.appendChild(approveBtn);
        actions.appendChild(rejectBtn);

        wrapper.appendChild(info);
        wrapper.appendChild(actions);
        pendingClaimsEl.appendChild(wrapper);
    });
}

function renderAdminItems() {
    adminItemsEl.innerHTML = "<h3>All Items</h3>";

    if (items.length === 0) {
        adminItemsEl.innerHTML += `<p class="muted small">No items in the system.</p>`;
        return;
    }

    items.forEach(item => {
        const wrapper = document.createElement("div");
        wrapper.className = "item";

        const info = document.createElement("div");
        info.innerHTML = `
            <strong>${item.title}</strong>
            <div class="muted small">${item.claimed ? "Status: Claimed" : "Status: Available"}</div>
        `;

        wrapper.appendChild(info);
        adminItemsEl.appendChild(wrapper);
    });
}

function renderAll() {
    renderItems();
    renderClaimStatus();
}

// ---------------------------
// Claim flow
// ---------------------------

function startClaimForItem(itemId) {
    showView("file");
    const typeRadio = document.querySelector('input[name="claimType"][value="found"]');
    if (typeRadio) typeRadio.checked = true;
    toggleClaimTypeFields("found");
    itemSelectEl.value = itemId;
}

function toggleClaimTypeFields(type) {
    if (type === "found") {
        foundFieldsEl.style.display = "";
        lostFieldsEl.style.display = "none";
    } else {
        foundFieldsEl.style.display = "none";
        lostFieldsEl.style.display = "";
    }
}

function handleClaimTypeToggle() {
    const radios = document.querySelectorAll('input[name="claimType"]');
    radios.forEach(radio => {
        radio.addEventListener("change", () => {
            const selected = document.querySelector('input[name="claimType"]:checked')?.value || "found";
            toggleClaimTypeFields(selected);
        });
    });
}

function clearForm() {
    lostTitleEl.value = "";
    lostLocationEl.value = "";
    lostDateEl.value = "";
    studentNameEl.value = "";
    contactEl.value = "";
    messageEl.value = "";
}

function handleClaimSubmit(event) {
    event.preventDefault();

    const type = document.querySelector('input[name="claimType"]:checked')?.value || "found";
    const name = studentNameEl.value.trim();
    const contact = contactEl.value.trim();

    if (!name || !contact) {
        alert("Please enter your name and contact information.");
        return;
    }

    if (type === "found") {
        if (!itemSelectEl.value) {
            alert("Please select an item to claim.");
            return;
        }

        claims.push({
            type: "found",
            itemId: itemSelectEl.value,
            name,
            contact,
            message: messageEl.value.trim(),
            status: "pending",
            createdAt: new Date().toISOString()
        });
    } else {
        if (!lostTitleEl.value.trim()) {
            alert("Please enter the name of the lost item.");
            return;
        }

        claims.push({
            type: "lost",
            title: lostTitleEl.value.trim(),
            location: lostLocationEl.value.trim(),
            dateLost: lostDateEl.value,
            name,
            contact,
            message: messageEl.value.trim(),
            status: "pending",
            createdAt: new Date().toISOString()
        });
    }

    saveState();
    renderClaimStatus();
    clearForm();
    alert("Your claim has been submitted and is pending review.");
    showView("home");
}

// ---------------------------
// Admin actions
// ---------------------------

function approveClaim(index) {
    const claim = claims[index];
    if (!claim) return;

    if (claim.type === "found") {
        const item = items.find(i => i.id == claim.itemId);
        if (item) item.claimed = true;
        claim.status = "approved";
    } else if (claim.type === "lost") {
        claim.status = "resolved";
    } else {
        claim.status = "approved";
    }

    saveState();
    renderAll();
    renderAdminClaims();
    renderAdminItems();
}

function rejectClaim(index) {
    const claim = claims[index];
    if (!claim) return;

    claim.status = "rejected";
    saveState();
    renderClaimStatus();
    renderAdminClaims();
}

// ---------------------------
// Admin login
// ---------------------------

function handleAdminLogin() {
    const user = prompt("Admin username:");
    if (user === null) return;

    const pass = prompt("Admin password:");
    if (pass === null) return;

    if (user === "Admin" && pass === "12345678") {
        showView("admin");
        renderAdminClaims();
        renderAdminItems();
    } else {
        alert("Incorrect username or password.");
    }
}

// ---------------------------
// Misc / refresh
// ---------------------------

function handleRefresh() {
    // For now, just re-render from localStorage
    items = JSON.parse(localStorage.getItem("items")) || items;
    claims = JSON.parse(localStorage.getItem("claims")) || claims;
    renderAll();
    alert("Data refreshed.");
}

// ---------------------------
// Initialization
// ---------------------------

function initNav() {
    navLinks.forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            const view = link.dataset.view;
            showView(view);
        });
    });
}

function init() {
    initNav();
    handleClaimTypeToggle();

    claimFormEl.addEventListener("submit", handleClaimSubmit);
    cancelFileBtn.addEventListener("click", () => showView("home"));
    adminBtn.addEventListener("click", handleAdminLogin);
    refreshBtn.addEventListener("click", handleRefresh);

    showView("home");
    renderAll();
}

document.addEventListener("DOMContentLoaded", init);

