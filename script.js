/* =========================================================
   BILLIARD & KTV MANAGEMENT SYSTEM
   Partial Functional Build
========================================================= */

const RATE = { Billiard: 150, KTV: 300 };

let facilities = [
    { id: "B1", name: "Billiard Table 1", type: "Billiard" },
    { id: "B2", name: "Billiard Table 2", type: "Billiard" },
    { id: "B3", name: "Billiard Table 3", type: "Billiard" },
    { id: "K1", name: "KTV Room 1", type: "KTV" }
];

let reservations = [];
let sessions = {};
let nextResId = 1;
let transactions = [];
let nextTransactionId = 1;
let pendingBills = [];
let lastReceiptTransaction = null;

/* Two inventory records taken from the original file. */
let drinks = [
    {
        id: "D1",
        category: "Buckets",
        name: "SMB Pilsen (Bucket)",
        price: 420,
        stock: 10,
        status: "Available"
    },
    {
        id: "D2",
        category: "Buckets",
        name: "SM Light (Bucket)",
        price: 480,
        stock: 10,
        status: "Available"
    }
];

const DRINK_CATEGORIES = [
    "Buckets",
    "Liquor",
    "Bottled Beer",
    "Soft Drinks",
    "Other"
];

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("loginScreen").style.display = "flex";
    document.getElementById("app").style.display = "none";
    populateCategorySelect();
    populateDrinkSelect();
    renderInventory();
});

function showMsg(id, text, type = "success") {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className = "msg " + type;
}

function handleLogin() {
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!username || !password) {
        showMsg("msgLogin", "Enter username and password.", "warn");
        return;
    }

    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("app").style.display = "block";
    document.getElementById("whoText").textContent = "Staff";
    showTab("dashboard");
    renderDashboard();
}

function handleLogout() {
    document.getElementById("app").style.display = "none";
    document.getElementById("loginScreen").style.display = "flex";
}

function showTab(tabName) {
    document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active");
    });

    document.querySelectorAll("#sidebar button[data-tab]").forEach(button => {
        button.classList.toggle("active", button.dataset.tab === tabName);
    });

    const section = document.getElementById("tab-" + tabName);
    if (section) section.classList.add("active");

    if (tabName === "dashboard") renderDashboard();
    if (tabName === "billiard-reservations") renderReservations("Billiard");
    if (tabName === "ktv-reservations") renderReservations("KTV");
    if (tabName === "drinks") {
        populateDrinkSelect();
        populateDrinkOrderChoices();
        renderInventory();
    }
    if (tabName === "billing") {
        populateBillTargets();
        renderBillPreview();
    }
    if (tabName === "history") renderHistory();
    if (tabName === "sales-report") renderSalesReport();
}

function toggleSidebar(force) {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    if (!sidebar || !overlay) return;

    const open = typeof force === "boolean"
        ? force
        : !sidebar.classList.contains("open");

    sidebar.classList.toggle("open", open);
    overlay.classList.toggle("open", open);
}

function formatTime(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function renderDashboard() {
    const grid = document.getElementById("dashboardGrid");
    if (!grid) return;

    grid.innerHTML = facilities.map(facility => {
        const session = sessions[facility.id];

        if (!session) {
            return `
                <div class="dashCard available">
                    <h3>${facility.name}</h3>
                    <span class="badge free">Available</span>
                    <p class="small-note">Ready for a session.</p>
                </div>
            `;
        }

        const elapsed = Math.max(
            0,
            Math.floor((Date.now() - session.actualStart.getTime()) / 1000)
        );
        const h = String(Math.floor(elapsed / 3600)).padStart(2, "0");
        const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
        const s = String(elapsed % 60).padStart(2, "0");

        return `
            <div class="dashCard occupied">
                <h3>${facility.name}</h3>
                <span class="badge occupied">Occupied</span>
                <div class="timerBig">${h}:${m}:${s}</div>
                <div><b>Customer:</b> ${session.customerName}</div>
                <div class="small-note">Started: ${formatTime(session.actualStart)}</div>
                <div class="small-note">
                    Added time: ${session.addedMinutes || 0} min
                </div>
                <div class="buttonRow">
                    <button class="small" onclick="handleAddSessionTime('${facility.id}', 30)">
                        +30 mins
                    </button>
                    <button class="small" onclick="handleAddSessionTime('${facility.id}', 60)">
                        +1 hr
                    </button>
                    <button class="danger small" onclick="handleEndSession('${facility.id}')">
                        End Session
                    </button>
                </div>
            </div>
        `;
    }).join("");
}

setInterval(() => {
    if (document.getElementById("app").style.display !== "none") {
        renderDashboard();
    }
}, 1000);

function getReservationFields(type) {
    const p = type === "Billiard" ? "bRes" : "kRes";
    return {
        customer: document.getElementById(p + "Customer"),
        contact: document.getElementById(p + "Contact"),
        facility: document.getElementById(p + "FacilitySelect"),
        date: document.getElementById(p + "Date"),
        time: document.getElementById(p + "StartTime"),
        duration: document.getElementById(p + "DurationSelect"),
        messageId: p + "Msg"
    };
}

function handleCreateReservation(type) {
    const f = getReservationFields(type);

    if (!f.customer.value.trim() || !f.date.value || !f.time.value) {
        showMsg(f.messageId, "Complete the required reservation details.", "warn");
        return;
    }

    const facility = facilities.find(item => item.id === f.facility.value);
    const duration = Number(f.duration.value);
    const start = new Date(`${f.date.value}T${f.time.value}`);
    const end = new Date(start.getTime() + duration * 60000);

    const reservation = {
        id: "R" + String(nextResId++).padStart(3, "0"),
        type,
        customerName: f.customer.value.trim(),
        contact: f.contact.value.trim(),
        facilityId: facility.id,
        facilityName: facility.name,
        date: f.date.value,
        startTime: f.time.value,
        endTime: end.toTimeString().slice(0, 5),
        durationMinutes: duration,
        price: (RATE[type] / 60) * duration,
        status: "Reserved"
    };

    reservations.push(reservation);
    showMsg(f.messageId, `${reservation.id} created successfully.`, "success");
    renderReservations(type);
    renderDashboard();
}

function renderReservations(type) {
    const tbody = document.getElementById(
        type === "Billiard" ? "bResReservationsBody" : "kResReservationsBody"
    );
    if (!tbody) return;

    const list = reservations.filter(r => r.type === type);
    tbody.innerHTML = "";

    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="10">No reservations yet.</td></tr>`;
        return;
    }

    list.forEach(r => {
        const row = document.createElement("tr");
        let action = "";

        if (r.status === "Reserved") {
            action = `
                <button class="small" onclick="handleStartReservationEarly('${r.id}')">
                    Start Session
                </button>
                <button class="danger small" onclick="handleCancelReservation('${r.id}')">
                    Cancel
                </button>
            `;
        } else if (r.status === "Started") {
            action = `<span class="badge occupied">Started</span>`;
        } else {
            action = `<span class="badge expired">Cancelled</span>`;
        }

        row.innerHTML = `
            <td>${r.id}</td>
            <td>${r.customerName}</td>
            <td>${r.facilityName}</td>
            <td>${r.date}</td>
            <td>${r.startTime}</td>
            <td>${r.endTime}</td>
            <td>${r.durationMinutes} min</td>
            <td>₱${r.price.toFixed(2)}</td>
            <td>${r.status}</td>
            <td>${action}</td>
        `;
        tbody.appendChild(row);
    });
}

function handleReservationSearch(type) {
    renderReservations(type);
}

function handleCancelReservation(reservationId) {
    const reservation = reservations.find(r => r.id === reservationId);
    if (!reservation || reservation.status !== "Reserved") return;

    reservation.status = "Cancelled";

    const msgId = reservation.type === "Billiard" ? "bResMsg" : "kResMsg";
    showMsg(
        msgId,
        `${reservation.id} for ${reservation.customerName} was cancelled.`,
        "warn"
    );

    renderReservations(reservation.type);
}

function handleStartReservationEarly(reservationId) {
    const reservation = reservations.find(r => r.id === reservationId);
    if (!reservation || reservation.status !== "Reserved") return;

    if (sessions[reservation.facilityId]) {
        const msgId = reservation.type === "Billiard" ? "bResMsg" : "kResMsg";
        showMsg(msgId, `${reservation.facilityName} is currently occupied.`, "error");
        return;
    }

    sessions[reservation.facilityId] = {
        customerName: reservation.customerName,
        facilityId: reservation.facilityId,
        type: reservation.type,
        reservationId: reservation.id,
        baseMinutes: reservation.durationMinutes,
        basePrice: reservation.price,
        actualStart: new Date(),
        addedMinutes: 0,
        drinkOrders: []
    };

    reservation.status = "Started";

    const msgId = reservation.type === "Billiard" ? "bResMsg" : "kResMsg";
    showMsg(
        msgId,
        `Session started for ${reservation.customerName} on ${reservation.facilityName}.`,
        "success"
    );

    renderReservations(reservation.type);
    renderDashboard();
    populateDrinkOrderChoices();
}

function handleAddSessionTime(facilityId, minutes) {
    const session = sessions[facilityId];
    if (!session) return;

    session.addedMinutes = (session.addedMinutes || 0) + minutes;
    renderDashboard();
}

function handleEndSession(facilityId) {
    const session = sessions[facilityId];
    if (!session) return;

    const facility = facilities.find(item => item.id === facilityId);
    const rate = RATE[session.type] || 0;
    const extensionFee = (rate / 60) * (session.addedMinutes || 0);

    pendingBills.push({
        id: "S" + Date.now(),
        type: session.type + " Session",
        customerName: session.customerName,
        facilityId,
        facilityName: facility ? facility.name : facilityId,
        reservationId: session.reservationId || "",
        sessionFee: Number(session.basePrice || 0),
        extensionFee,
        drinkOrders: [...(session.drinkOrders || [])],
        startedAt: session.actualStart,
        endedAt: new Date()
    });

    delete sessions[facilityId];

    // Update data first.
    populateDrinkOrderChoices();
    populateBillTargets();

    // Force navigation after the End Session click finishes.
    setTimeout(() => {
        document.querySelectorAll(".section").forEach(section => {
            section.classList.remove("active");
        });

        const billingSection = document.getElementById("tab-billing");
        if (billingSection) {
            billingSection.classList.add("active");
        }

        document.querySelectorAll("#sidebar button[data-tab]").forEach(button => {
            button.classList.toggle("active", button.dataset.tab === "billing");
        });

        populateBillTargets();
        renderBillPreview();

        // Close mobile sidebar/overlay if open.
        const sidebar = document.getElementById("sidebar");
        const overlay = document.getElementById("sidebarOverlay");
        if (sidebar) sidebar.classList.remove("open");
        if (overlay) overlay.classList.remove("open");
    }, 0);
}

function syncDrinkStatus(drink) {
    drink.status = drink.stock > 0 ? "Available" : "Out of Stock";
}

function populateCategorySelect() {
    const select = document.getElementById("editDrinkCategory");
    if (!select) return;

    select.innerHTML = DRINK_CATEGORIES
        .map(category => `<option value="${category}">${category}</option>`)
        .join("");
}

function populateDrinkSelect() {
    const select = document.getElementById("editDrinkSelect");
    if (!select) return;

    const previous = select.value;
    select.innerHTML = drinks
        .map(drink => `<option value="${drink.id}">${drink.name} — Stock: ${drink.stock}</option>`)
        .join("");

    if (drinks.some(drink => drink.id === previous)) {
        select.value = previous;
    }

    loadDrinkForEdit();
}

function loadDrinkForEdit() {
    const select = document.getElementById("editDrinkSelect");
    if (!select) return;

    const drink = drinks.find(item => item.id === select.value);
    if (!drink) return;

    document.getElementById("editDrinkName").value = drink.name;
    document.getElementById("editDrinkCategory").value = drink.category;
    document.getElementById("editDrinkPrice").value = drink.price;
    document.getElementById("editDrinkStock").value = drink.stock;
}

function handleEditDrink() {
    const id = document.getElementById("editDrinkSelect").value;
    const drink = drinks.find(item => item.id === id);
    if (!drink) return;

    const name = document.getElementById("editDrinkName").value.trim();
    const category = document.getElementById("editDrinkCategory").value;
    const price = Number(document.getElementById("editDrinkPrice").value);
    const stock = Number(document.getElementById("editDrinkStock").value);

    if (!name || price < 0 || stock < 0 || Number.isNaN(price) || Number.isNaN(stock)) {
        showMsg("editDrinkMsg", "Enter valid drink information.", "warn");
        return;
    }

    drink.name = name;
    drink.category = category;
    drink.price = price;
    drink.stock = Math.floor(stock);
    syncDrinkStatus(drink);

    showMsg("editDrinkMsg", `${drink.name} was updated successfully.`, "success");
    renderInventory();
    populateDrinkSelect();
}

function renderInventory() {
    const tbody = document.getElementById("inventoryBody");
    if (!tbody) return;

    tbody.innerHTML = drinks.map(drink => {
        syncDrinkStatus(drink);
        const badge = drink.status === "Available" ? "free" : "occupied";

        return `
            <tr>
                <td>${drink.category}</td>
                <td>${drink.name}</td>
                <td>₱${drink.price}</td>
                <td>${drink.stock}</td>
                <td><span class="badge ${badge}">${drink.status}</span></td>
            </tr>
        `;
    }).join("");
}


/* =========================================================
   OTHER PANELS
   Kept visible in the interface for the current development stage.
========================================================= */

function handleAddWalkIn() {}

function populateDrinkOrderChoices() {
    const target = document.getElementById("drinkOrderTarget");
    const drinkSelect = document.getElementById("drinkSelect");
    if (!target || !drinkSelect) return;

    const currentTarget = target.value;
    const currentDrink = drinkSelect.value;

    // Original order choices: active session or drink-only order.
    target.innerHTML = `
        <option value="DRINK_ONLY">Drink-Only Order</option>
        ${Object.keys(sessions).map(facilityId => {
            const session = sessions[facilityId];
            const facility = facilities.find(f => f.id === facilityId);
            return `<option value="${facilityId}">
                ${facility ? facility.name : facilityId} — ${session.customerName}
            </option>`;
        }).join("")}
    `;

    // Only the two drinks currently available in this partial system.
    drinkSelect.innerHTML = drinks.map(drink => `
        <option value="${drink.id}">
            ${drink.name} — ₱${drink.price} (Stock: ${drink.stock})
        </option>
    `).join("");

    if ([...target.options].some(o => o.value === currentTarget)) {
        target.value = currentTarget;
    }
    if ([...drinkSelect.options].some(o => o.value === currentDrink)) {
        drinkSelect.value = currentDrink;
    }
}

function handleDrinkOrder() {
    const target = document.getElementById("drinkOrderTarget");
    const drinkSelect = document.getElementById("drinkSelect");
    const qtyInput = document.getElementById("drinkQty");

    if (!target || !drinkSelect || !qtyInput) return;

    const drink = drinks.find(d => d.id === drinkSelect.value);
    const qty = Math.floor(Number(qtyInput.value));

    if (!drink || !Number.isFinite(qty) || qty < 1) {
        showMsg("drinkOrderMsg", "Enter a valid quantity.", "warn");
        return;
    }

    if (drink.stock < qty) {
        showMsg("drinkOrderMsg", `Only ${drink.stock} stock available.`, "error");
        return;
    }

    drink.stock -= qty;
    syncDrinkStatus(drink);

    const targetName = target.value === "DRINK_ONLY"
        ? "Drink-Only Order"
        : (facilities.find(f => f.id === target.value)?.name || target.value);

    const order = {
        drinkId: drink.id,
        name: drink.name,
        qty,
        unitPrice: drink.price,
        total: drink.price * qty
    };

    if (target.value === "DRINK_ONLY") {
        pendingBills.push({
            id: "DO" + Date.now(),
            type: "Drink Only",
            customerName: "Walk-In Customer",
            facilityId: "",
            facilityName: "N/A",
            sessionFee: 0,
            extensionFee: 0,
            drinkOrders: [order]
        });
    } else if (sessions[target.value]) {
        sessions[target.value].drinkOrders.push(order);
    }

    showMsg(
        "drinkOrderMsg",
        `${qty} × ${drink.name} added to ${targetName}.`,
        "success"
    );

    renderInventory();
    populateDrinkSelect();
    populateDrinkOrderChoices();
}

function handleAddDrink() {}

function handleRestock() {}

function handleDeleteDrink() {}

function handleDrinkSearch() {
    renderInventory();
}











function handleCreateStaff() {}


/* =========================================================
   BILLING, TRANSACTION HISTORY & SALES REPORT
========================================================= */

function money(value) {
    return "₱" + Number(value || 0).toFixed(2);
}

function billDrinkTotal(bill) {
    return (bill.drinkOrders || []).reduce((sum, item) => sum + Number(item.total || 0), 0);
}

function billGrandTotal(bill) {
    return Number(bill.sessionFee || 0) +
           Number(bill.extensionFee || 0) +
           billDrinkTotal(bill);
}

function populateBillTargets() {
    const select = document.getElementById("billTarget");
    if (!select) return;

    const previous = select.value;

    if (!pendingBills.length) {
        select.innerHTML = `<option value="">No sessions ready for billing</option>`;
        renderBillPreview();
        return;
    }

    select.innerHTML = pendingBills.map(bill => `
        <option value="${bill.id}">
            ${bill.customerName} — ${bill.facilityName} — ${money(billGrandTotal(bill))}
        </option>
    `).join("");

    if (pendingBills.some(bill => bill.id === previous)) {
        select.value = previous;
    }

    renderBillPreview();
}

function renderBillPreview() {
    const select = document.getElementById("billTarget");
    const preview = document.getElementById("billPreview");
    if (!select || !preview) return;

    const bill = pendingBills.find(item => item.id === select.value);

    if (!bill) {
        preview.innerHTML = `<div class="small-note">End a session first to create a bill.</div>`;
        return;
    }

    const drinks = bill.drinkOrders || [];
    const drinkRows = drinks.length
        ? drinks.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>${money(item.unitPrice)}</td>
                <td>${money(item.total)}</td>
            </tr>
        `).join("")
        : `<tr><td colspan="4">No drink orders</td></tr>`;

    preview.innerHTML = `
        <div class="card">
            <h3>${bill.customerName} — ${bill.facilityName}</h3>
            <div class="row">
                <div><b>Session Fee:</b> ${money(bill.sessionFee)}</div>
                <div><b>Extension Fee:</b> ${money(bill.extensionFee)}</div>
                <div><b>Drinks:</b> ${money(billDrinkTotal(bill))}</div>
                <div><b>Grand Total:</b> ${money(billGrandTotal(bill))}</div>
            </div>
            <div class="tableWrap">
                <table>
                    <thead>
                        <tr>
                            <th>Drink</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>${drinkRows}</tbody>
                </table>
            </div>
        </div>
    `;
}

function handleCompletePayment() {
    const select = document.getElementById("billTarget");
    const method = document.getElementById("paymentMethod");
    const paidInput = document.getElementById("amountPaid");

    if (!select || !method || !paidInput) return;

    const billIndex = pendingBills.findIndex(item => item.id === select.value);
    if (billIndex < 0) {
        showMsg("billMsg", "No bill selected.", "warn");
        return;
    }

    const bill = pendingBills[billIndex];
    const total = billGrandTotal(bill);
    const amountPaid = Number(paidInput.value);

    if (!Number.isFinite(amountPaid) || amountPaid < total) {
        showMsg("billMsg", `Amount paid must be at least ${money(total)}.`, "error");
        return;
    }

    const transaction = {
        id: "T" + String(nextTransactionId++).padStart(4, "0"),
        type: bill.type,
        customerName: bill.customerName,
        facilityName: bill.facilityName,
        reservationId: bill.reservationId || "",
        sessionFee: Number(bill.sessionFee || 0),
        extensionFee: Number(bill.extensionFee || 0),
        drinkOrders: [...(bill.drinkOrders || [])],
        drinksTotal: billDrinkTotal(bill),
        grandTotal: total,
        paymentMethod: method.value,
        amountPaid,
        change: amountPaid - total,
        completedAt: new Date()
    };

    transactions.push(transaction);
    lastReceiptTransaction = transaction;
    pendingBills.splice(billIndex, 1);

    showMsg("billMsg", `Payment completed. Transaction ${transaction.id} saved.`, "success");

    const receiptActions = document.getElementById("receiptActions");
    if (receiptActions) {
        receiptActions.innerHTML = `
            <button class="secondary" onclick="showTransactionDetail('${transaction.id}')">
                View Transaction Details
            </button>
        `;
    }

    paidInput.value = "";
    populateBillTargets();
    renderHistory();
    renderSalesReport();
}

function transactionMatches(transaction, query) {
    if (!query) return true;

    const haystack = [
        transaction.id,
        transaction.type,
        transaction.customerName,
        transaction.facilityName,
        transaction.paymentMethod
    ].join(" ").toLowerCase();

    return haystack.includes(query.toLowerCase());
}

function renderHistory() {
    const tbody = document.getElementById("historyBody");
    if (!tbody) return;

    const input = document.getElementById("historySearchInput");
    const query = input ? input.value.trim() : "";
    const list = transactions.filter(transaction => transactionMatches(transaction, query));

    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="8">No completed transactions yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = [...list].reverse().map(transaction => `
        <tr>
            <td>${transaction.id}</td>
            <td>${transaction.type}</td>
            <td>${transaction.customerName}</td>
            <td>${transaction.facilityName}</td>
            <td>${money(transaction.grandTotal)}</td>
            <td>${transaction.paymentMethod}</td>
            <td>${transaction.completedAt.toLocaleString()}</td>
            <td>
                <button class="small secondary"
                    onclick="showTransactionDetail('${transaction.id}')">
                    View
                </button>
            </td>
        </tr>
    `).join("");
}

function showTransactionDetail(transactionId) {
    const transaction = transactions.find(item => item.id === transactionId);
    if (!transaction) return;

    const detail = document.getElementById("historyDetail");
    if (!detail) {
        showTab("history");
        setTimeout(() => showTransactionDetail(transactionId), 0);
        return;
    }

    showTab("history");

    const drinks = transaction.drinkOrders || [];
    const drinkDetails = drinks.length
        ? drinks.map(item =>
            `<li>${item.qty} × ${item.name} — ${money(item.total)}</li>`
          ).join("")
        : "<li>No drink orders</li>";

    detail.innerHTML = `
        <div class="card">
            <h3>${transaction.id}</h3>
            <p><b>Customer:</b> ${transaction.customerName}</p>
            <p><b>Type:</b> ${transaction.type}</p>
            <p><b>Facility:</b> ${transaction.facilityName}</p>
            <p><b>Session Fee:</b> ${money(transaction.sessionFee)}</p>
            <p><b>Extension Fee:</b> ${money(transaction.extensionFee)}</p>
            <p><b>Drink Orders:</b></p>
            <ul>${drinkDetails}</ul>
            <p><b>Drinks Total:</b> ${money(transaction.drinksTotal)}</p>
            <p><b>Grand Total:</b> ${money(transaction.grandTotal)}</p>
            <p><b>Payment Method:</b> ${transaction.paymentMethod}</p>
            <p><b>Amount Paid:</b> ${money(transaction.amountPaid)}</p>
            <p><b>Change:</b> ${money(transaction.change)}</p>
            <p><b>Completed:</b> ${transaction.completedAt.toLocaleString()}</p>
        </div>
    `;
}

function renderSalesReport() {
    const tbody = document.getElementById("salesReportBody");
    if (!tbody) return;

    const input = document.getElementById("salesReportSearchInput");
    const query = input ? input.value.trim() : "";
    const list = transactions.filter(transaction => transactionMatches(transaction, query));

    tbody.innerHTML = list.length
        ? [...list].reverse().map(transaction => `
            <tr>
                <td>${transaction.id}</td>
                <td>${transaction.type}</td>
                <td>${transaction.customerName}</td>
                <td>${transaction.facilityName}</td>
                <td>${money(transaction.grandTotal)}</td>
                <td>${transaction.paymentMethod}</td>
                <td>${transaction.completedAt.toLocaleString()}</td>
            </tr>
        `).join("")
        : `<tr><td colspan="7">No completed transactions yet.</td></tr>`;

    const summary = document.getElementById("salesReportSummary");
    if (summary) {
        const totalSales = list.reduce((sum, transaction) => sum + transaction.grandTotal, 0);
        summary.textContent = `Transactions: ${list.length} | Total Sales: ${money(totalSales)}`;
        summary.className = "msg success";
    }
}

function exportSalesReportPDF() {
    if (!transactions.length) {
        alert("No completed transactions to export.");
        return;
    }

    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("PDF library is not available.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Billiard & KTV Store - Sales Report", 14, 18);

    doc.setFontSize(10);
    let y = 30;

    transactions.forEach(transaction => {
        if (y > 275) {
            doc.addPage();
            y = 20;
        }

        doc.text(
            `${transaction.id} | ${transaction.customerName} | ${transaction.facilityName} | ` +
            `${transaction.paymentMethod} | ${money(transaction.grandTotal)}`,
            14,
            y
        );
        y += 7;
    });

    const totalSales = transactions.reduce((sum, transaction) => sum + transaction.grandTotal, 0);
    y += 5;
    if (y > 275) {
        doc.addPage();
        y = 20;
    }
    doc.text(`Total Sales: ${money(totalSales)}`, 14, y);
    doc.save("sales-report.pdf");
}
