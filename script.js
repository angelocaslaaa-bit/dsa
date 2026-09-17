/* =========================================================
   BILLIARD & KTV MANAGEMENT SYSTEM
========================================================= */

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
});

function handleLogin() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    document.getElementById('whoText').textContent = 'Staff';
    showTab('dashboard');
    renderDashboardMockup();
}

function handleLogout() {
    document.getElementById('app').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
}

function showTab(tabName) {
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
    document.querySelectorAll('#sidebar button[data-tab]').forEach(button => button.classList.remove('active'));

    const section = document.getElementById(`tab-${tabName}`);
    const button = document.querySelector(`#sidebar button[data-tab="${tabName}"]`);
    if (section) section.classList.add('active');
    if (button) button.classList.add('active');
    toggleSidebar(false);
}

function toggleSidebar(force) {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const shouldOpen = typeof force === 'boolean' ? force : !sidebar.classList.contains('open');
    sidebar.classList.toggle('open', shouldOpen);
    overlay.classList.toggle('open', shouldOpen);
}

function renderDashboardMockup() {
    const grid = document.getElementById('dashboardGrid');
    if (!grid || grid.children.length) return;
    const items = [
        ['Billiard Table 1', 'Available'],
        ['Billiard Table 2', 'Occupied'],
        ['Billiard Table 3', 'Reserved'],
        ['KTV Room 1', 'Available']
    ];
    grid.innerHTML = items.map(([name, status]) => `
        <div class="dashCard ${status.toLowerCase()}">
            <h3>${name}</h3>
            <div class="timerBig">--:--:--</div>
            <span class="badge ${status === 'Available' ? 'free' : status.toLowerCase()}">${status}</span>
        </div>`).join('');
}

// Functions reserved for later system implementation.
function handleCreateReservation(type) {}
function handleReservationSearch(type) {}
function handleAddWalkIn() {}
function handleDrinkOrder() {}
function handleAddDrink() {}
function handleRestock() {}
function handleEditDrink() {}
function handleDeleteDrink() {}
function loadDrinkForEdit() {}
function renderInventory() {}
function handleDrinkSearch() {}
function renderBillPreview() {}
function handleCompletePayment() {}
function renderHistory() {}
function renderSalesReport() {}
function exportSalesReportPDF() {}
function handleCreateStaff() {}
