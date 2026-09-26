/* =========================================================
   BILLIARD & KTV MANAGEMENT SYSTEM
   script.js \u2014 PART 1 OF 3
   Vanilla JavaScript Only
========================================================= */

/* =========================================================
   SYSTEM CONFIGURATION
========================================================= */

const RATE = {
    Billiard: 150,
    KTV: 300
};

const BUSINESS_NAME = "Billiard & KTV Store";

/* =========================================================
   DATA
========================================================= */

/* ---------- ACCOUNTS ---------- */


/* =========================================================
   EMAILJS — APPROVAL EMAIL NOTIFICATION
   External notification service; not part of the DSA algorithm.
========================================================= */

const EMAILJS_SERVICE_ID =
    "service_lqu7xwk";

const EMAILJS_TEMPLATE_ID =
    "template_4dj106t";

const EMAILJS_PUBLIC_KEY =
    "afD6TYlJtjWd0CJiI";


function sendApprovalEmail(
    account
) {

    if (
        typeof emailjs === "undefined"
    ) {

        return Promise.reject(
            new Error(
                "EmailJS library is not available."
            )
        );

    }


    return emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
            staff_email:
                account.email,

            staff_name:
                account.name,

            username:
                account.username
        },
        {
            publicKey:
                EMAILJS_PUBLIC_KEY
        }
    );

}

let accounts = [
    {
        staffId: "A001",
        username: "admin",
        password: "admin123",
        name: "Store Admin",
        email: "admin@local",
        role: "Admin",
        status: "Approved",
        mustChangePassword: false
    }
];

let loggedInUser = null;
let nextStaffId = 1;

/* ---------- LOGIN SECURITY ---------- */
/*
   DSA:
   - loginAttempts is an Array of Objects.
   - Manual Linear Search is used to locate an attempt record.
   - Maximum of 3 failed attempts.
   - Account is temporarily locked for 30 seconds.
*/
let loginAttempts = [];
const MAX_LOGIN_ATTEMPTS = 3;
const LOGIN_LOCK_MS = 30000;
let loginLockCountdown = null;


/* ---------- FACILITIES ---------- */

let facilities = [
    {
        id: "B1",
        name: "Billiard Table 1",
        type: "Billiard",
        manualStatus: null
    },
    {
        id: "B2",
        name: "Billiard Table 2",
        type: "Billiard",
        manualStatus: null
    },
    {
        id: "B3",
        name: "Billiard Table 3",
        type: "Billiard",
        manualStatus: null
    },
    {
        id: "K1",
        name: "KTV Room 1",
        type: "KTV",
        manualStatus: null
    }
];


/* ---------- RESERVATIONS ---------- */

let reservations = [];

let nextResId = 1;


/* ---------- WALK-IN ---------- */

let walkIns = [];

let nextWalkInId = 1;
let nextQueueNumber = 1;


/* ---------- ACTIVE SESSIONS ---------- */

let sessions = {};


/* ---------- DRINK CATEGORIES ---------- */

const CATEGORY_NOTES = {

    "Buckets":
        "Includes 1 Free Snack (Choose 1: Fishball, Crackers, or French Fries)",

    "Liquor":
        "Includes Free 1.5L Coke + 1 Snack Choice (Sisig, Sizzling Squid, or Calamares)",

    "Bottled Beer": "",

    "Soft Drinks": "",

    "Other": ""
};


const DRINK_CATEGORIES = [
    "Buckets",
    "Liquor",
    "Bottled Beer",
    "Soft Drinks",
    "Other"
];

const SNACK_CATALOG = {
    "Fishball": 45,
    "Crackers": 45,
    "French Fries": 45,
    "Sisig": 130,
    "Sizzling Squid": 130,
    "Calamares": 75
};

const DEFAULT_SNACKS_BY_CATEGORY = {
    "Buckets": ["Fishball", "Crackers", "French Fries"],
    "Liquor": ["Sisig", "Sizzling Squid", "Calamares"]
};

let expenses = [];
let nextExpenseId = 1;

function categoryHasFreeSnack(category) { return category === "Buckets" || category === "Liquor"; }
function getDrinkSnackChoices(drink) {
    if (!drink || !categoryHasFreeSnack(drink.category)) return [];
    return Array.isArray(drink.freeSnacks) && drink.freeSnacks.length
        ? drink.freeSnacks
        : [...(DEFAULT_SNACKS_BY_CATEGORY[drink.category] || [])];
}

/* ---------- DRINK INVENTORY ---------- */

let drinks = [

    {
        id: "D1",
        category: "Buckets",
        freeSnacks: [...DEFAULT_SNACKS_BY_CATEGORY["Buckets"]],
        name: "SMB Pilsen (Bucket)",
        price: 420,
        stock: 10,
        status: "Available"
    },

    {
        id: "D2",
        category: "Buckets",
        freeSnacks: [...DEFAULT_SNACKS_BY_CATEGORY["Buckets"]],
        name: "SM Light (Bucket)",
        price: 480,
        stock: 10,
        status: "Available"
    },

    {
        id: "D3",
        category: "Buckets",
        freeSnacks: [...DEFAULT_SNACKS_BY_CATEGORY["Buckets"]],
        name: "SM Apple (Bucket)",
        price: 480,
        stock: 10,
        status: "Available"
    },

    {
        id: "D4",
        category: "Buckets",
        freeSnacks: [...DEFAULT_SNACKS_BY_CATEGORY["Buckets"]],
        name: "RH Stallion (Bucket)",
        price: 480,
        stock: 10,
        status: "Available"
    },

    {
        id: "D5",
        category: "Liquor",
        freeSnacks: [...DEFAULT_SNACKS_BY_CATEGORY["Liquor"]],
        name: "Alfonso Light",
        price: 800,
        stock: 8,
        status: "Available"
    },

    {
        id: "D6",
        category: "Liquor",
        freeSnacks: [...DEFAULT_SNACKS_BY_CATEGORY["Liquor"]],
        name: "Escobar Light",
        price: 700,
        stock: 8,
        status: "Available"
    },

    {
        id: "D7",
        category: "Liquor",
        freeSnacks: [...DEFAULT_SNACKS_BY_CATEGORY["Liquor"]],
        name: "Fundador Light",
        price: 800,
        stock: 8,
        status: "Available"
    },

    {
        id: "D8",
        category: "Bottled Beer",
        name: "Tanduay Ice Blue Fresh",
        price: 80,
        stock: 24,
        status: "Available"
    },

    {
        id: "D9",
        category: "Bottled Beer",
        name: "Tanduay Ice Red Energy",
        price: 80,
        stock: 24,
        status: "Available"
    },

    {
        id: "D10",
        category: "Bottled Beer",
        name: "Tanduay Ice Light",
        price: 80,
        stock: 24,
        status: "Available"
    },

    {
        id: "D11",
        category: "Bottled Beer",
        name: "SMB Pilsen",
        price: 70,
        stock: 24,
        status: "Available"
    },

    {
        id: "D12",
        category: "Bottled Beer",
        name: "SM Light",
        price: 80,
        stock: 24,
        status: "Available"
    },

    {
        id: "D13",
        category: "Bottled Beer",
        name: "SM Apple",
        price: 80,
        stock: 24,
        status: "Available"
    },

    {
        id: "D14",
        category: "Bottled Beer",
        name: "RH Stallion",
        price: 80,
        stock: 24,
        status: "Available"
    },

    {
        id: "D15",
        category: "Bottled Beer",
        name: "Soju",
        price: 150,
        stock: 20,
        status: "Available"
    },

    {
        id: "D16",
        category: "Soft Drinks",
        name: "Coca Cola",
        price: 25,
        stock: 40,
        status: "Available"
    },

    {
        id: "D17",
        category: "Soft Drinks",
        name: "RC Cola",
        price: 20,
        stock: 40,
        status: "Available"
    },

    {
        id: "D18",
        category: "Soft Drinks",
        name: "Refresh Water",
        price: 15,
        stock: 40,
        status: "Available"
    },

    {
        id: "D19",
        category: "Soft Drinks",
        name: "Mountain Dew",
        price: 25,
        stock: 40,
        status: "Available"
    },

    {
        id: "D20",
        category: "Soft Drinks",
        name: "Sprite",
        price: 25,
        stock: 40,
        status: "Available"
    },

    {
        id: "D21",
        category: "Soft Drinks",
        name: "1.5L Coke",
        price: 100,
        stock: 20,
        status: "Available"
    }

];

let nextDrinkId = 22;


/* ---------- DRINK ONLY ORDERS ---------- */

let drinkOnlyOrders = [];

let nextDrinkOnlyId = 1;


/* ---------- TRANSACTIONS ---------- */

let transactions = [];

let nextTransId = 1;


/* ---------- DASHBOARD TIMER ---------- */

let dashboardInterval = null;


/* =========================================================
   BASIC HELPERS
========================================================= */

function pad2(number) {

    return String(number).padStart(2, "0");

}


function fmtHMS(milliseconds) {

    const totalSeconds =
        Math.max(
            0,
            Math.floor(milliseconds / 1000)
        );

    const hours =
        Math.floor(totalSeconds / 3600);

    const minutes =
        Math.floor(
            (totalSeconds % 3600) / 60
        );

    const seconds =
        totalSeconds % 60;

    return (
        pad2(hours) +
        ":" +
        pad2(minutes) +
        ":" +
        pad2(seconds)
    );

}


function fmtClock(date) {

    return date.toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


function fmtDateTime(date) {

    return date.toLocaleString();

}


function minutesToHM(minutes) {

    const hours =
        Math.floor(minutes / 60);

    const remainingMinutes =
        minutes % 60;

    const parts = [];

    if (hours) {

        parts.push(
            hours +
            " hour" +
            (hours > 1 ? "s" : "")
        );

    }

    if (remainingMinutes) {

        parts.push(
            remainingMinutes +
            " minute" +
            (remainingMinutes > 1 ? "s" : "")
        );

    }

    return parts.length
        ? parts.join(" ")
        : "0 minutes";

}


function timeToMinutes(time) {

    const parts =
        time.split(":").map(Number);

    return (
        parts[0] * 60 +
        parts[1]
    );

}



/* =========================================================
   BUSINESS HOURS
   Snooker's Billiard Hall: 2:00 PM to 12:00 AM
========================================================= */

const OPENING_MINUTES = 14 * 60;
const CLOSING_MINUTES = 24 * 60;

function validateBusinessHours(startTime, durationMinutes) {

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + Number(durationMinutes || 0);

    if (startMinutes < OPENING_MINUTES) {
        return {
            valid: false,
            message: "Reservations and sessions can only start from 2:00 PM onwards."
        };
    }

    if (startMinutes >= CLOSING_MINUTES) {
        return {
            valid: false,
            message: "The hall closes at 12:00 AM. A session cannot start at or after closing time."
        };
    }

    if (endMinutes > CLOSING_MINUTES) {
        return {
            valid: false,
            message: "This duration goes beyond the 12:00 AM closing time. Please choose a shorter duration."
        };
    }

    return { valid: true };
}

function getTodayClockTime() {
    const now = new Date();
    return pad2(now.getHours()) + ":" + pad2(now.getMinutes());
}

function getSessionClosingTime(session) {
    const closing = new Date(session.actualStart);
    closing.setDate(closing.getDate() + 1);
    closing.setHours(0, 0, 0, 0);
    return closing;
}

function overlaps(
    firstStart,
    firstEnd,
    secondStart,
    secondEnd
) {

    return (
        firstStart < secondEnd &&
        secondStart < firstEnd
    );

}


function computeEndTimeStr(
    dateString,
    timeString,
    minutes
) {

    const start =
        new Date(
            `${dateString}T${timeString}`
        );

    const end =
        new Date(
            start.getTime() +
            minutes * 60000
        );

    return (
        pad2(end.getHours()) +
        ":" +
        pad2(end.getMinutes())
    );

}


function computePrice(
    facilityType,
    minutes
) {

    return Math.round(
        (minutes / 60) *
        RATE[facilityType]
    );

}


/* =========================================================
   DURATION
   Manual duration input was intentionally removed.
========================================================= */

function getDuration(selectId) {

    const select =
        document.getElementById(selectId);

    if (!select) {

        return null;

    }

    const duration =
        parseInt(select.value);

    if (
        isNaN(duration) ||
        duration <= 0
    ) {

        return null;

    }

    return duration;

}


/* =========================================================
   MESSAGE HELPER
========================================================= */

function showMsg(
    elementId,
    message,
    type
) {

    const element =
        document.getElementById(elementId);

    if (!element) {

        return;

    }

    element.textContent = message;

    element.className =
        "msg " + (type || "");

}


/* =========================================================
   LOGIN / AUTHENTICATION
   Linear Search
========================================================= */

function linearSearchAuthenticate(
    records,
    username,
    password
) {

    for (
        let i = 0;
        i < records.length;
        i++
    ) {

        if (
            records[i].username === username &&
            records[i].password === password
        ) {

            return records[i];

        }

    }

    return null;

}


function findAccountIndexByUsername(
    username
) {

    for (
        let i = 0;
        i < accounts.length;
        i++
    ) {

        if (
            accounts[i].username === username
        ) {

            return i;

        }

    }

    return -1;

}


function findAccountIndexByEmail(
    email
) {

    for (
        let i = 0;
        i < accounts.length;
        i++
    ) {

        if (
            String(accounts[i].email || "")
                .toLowerCase() ===
            email.toLowerCase()
        ) {

            return i;

        }

    }

    return -1;

}




/* =========================================================
   STAFF SIGN UP + ADMIN APPROVAL
   DSA: Array of Objects + Manual Linear Search
========================================================= */

function openSignUpModal() {

    document
        .getElementById("signUpOverlay")
        .style
        .display = "flex";

    showMsg(
        "signUpMsg",
        "Your account must be approved by an administrator before login.",
        "warn"
    );

}


function closeSignUpModal() {

    document
        .getElementById("signUpOverlay")
        .style
        .display = "none";

}


function handleSignUp() {

    const name =
        document
            .getElementById("signUpName")
            .value
            .trim();

    const email =
        document
            .getElementById("signUpEmail")
            .value
            .trim()
            .toLowerCase();

    const username =
        document
            .getElementById("signUpUsername")
            .value
            .trim();

    const password =
        document
            .getElementById("signUpPassword")
            .value;

    const confirmPassword =
        document
            .getElementById("signUpConfirmPassword")
            .value;


    if (
        !name ||
        !email ||
        !username ||
        !password ||
        !confirmPassword
    ) {

        showMsg(
            "signUpMsg",
            "Please fill in all fields.",
            "warn"
        );

        return;

    }


    if (
        !email.endsWith("@gmail.com")
    ) {

        showMsg(
            "signUpMsg",
            "Please enter a valid Gmail address.",
            "warn"
        );

        return;

    }


    if (
        password.length < 8
    ) {

        showMsg(
            "signUpMsg",
            "Password must contain at least 8 characters.",
            "warn"
        );

        return;

    }


    if (
        password !==
        confirmPassword
    ) {

        showMsg(
            "signUpMsg",
            "Passwords do not match.",
            "error"
        );

        return;

    }


    if (
        findAccountIndexByUsername(
            username
        ) !== -1
    ) {

        showMsg(
            "signUpMsg",
            "That username is already registered.",
            "warn"
        );

        return;

    }


    if (
        findAccountIndexByEmail(
            email
        ) !== -1
    ) {

        showMsg(
            "signUpMsg",
            "That Gmail address is already registered.",
            "warn"
        );

        return;

    }


    accounts.push({

        staffId:
            `S${String(nextStaffId)
                .padStart(3, "0")}`,

        username: username,
        password: password,
        name: name,
        email: email,
        role: "Staff",
        status: "Pending",
        mustChangePassword: false

    });


    nextStaffId++;


    document
        .getElementById("signUpName")
        .value = "";

    document
        .getElementById("signUpEmail")
        .value = "";

    document
        .getElementById("signUpUsername")
        .value = "";

    document
        .getElementById("signUpPassword")
        .value = "";

    document
        .getElementById("signUpConfirmPassword")
        .value = "";


    showMsg(
        "signUpMsg",
        "Sign up submitted. Please wait for administrator approval before logging in.",
        "success"
    );


    renderStaff();

}


async function handleApproveStaff(
    username
) {

    if (!requireAdmin()) {

        return;

    }


    const index =
        findAccountIndexByUsername(
            username
        );


    if (index === -1) {

        return;

    }


    accounts[index].status =
        "Approved";


    renderStaff();


    try {

        await sendApprovalEmail(
            accounts[index]
        );


        showMsg(
            "staffMsg",
            `Approved ${accounts[index].name}. Approval email sent to ${accounts[index].email}.`,
            "success"
        );

    } catch (error) {

        console.error(
            "Approval email failed:",
            error
        );


        showMsg(
            "staffMsg",
            `Account approved, but the email notification could not be sent to ${accounts[index].email}.`,
            "warn"
        );

    }

}

function handleRejectStaff(
    username
) {

    if (!requireAdmin()) {

        return;

    }


    const index =
        findAccountIndexByUsername(
            username
        );


    if (index === -1) {

        return;

    }


    if (
        accounts[index].role === "Admin"
    ) {

        return;

    }


    const name =
        accounts[index].name;


    accounts.splice(
        index,
        1
    );


    showMsg(
        "staffMsg",
        `Rejected sign-up request: ${name}`,
        "warn"
    );


    renderStaff();

}


/* =========================================================
   LOGIN SECURITY — MANUAL DSA IMPLEMENTATION
========================================================= */

function findLoginAttemptIndex(username) {

    for (
        let i = 0;
        i < loginAttempts.length;
        i++
    ) {

        if (
            loginAttempts[i].username === username
        ) {

            return i;

        }

    }

    return -1;

}


function getOrCreateLoginAttempt(username) {

    let index =
        findLoginAttemptIndex(username);


    if (index !== -1) {

        return loginAttempts[index];

    }


    const record = {
        username: username,
        attempts: 0,
        lockedUntil: 0
    };


    loginAttempts.push(record);

    return record;

}


function resetLoginAttempts(username) {

    const index =
        findLoginAttemptIndex(username);


    if (index === -1) {

        return;

    }


    loginAttempts[index].attempts = 0;
    loginAttempts[index].lockedUntil = 0;

}


function getRemainingLockSeconds(record) {

    const remaining =
        record.lockedUntil - Date.now();


    if (remaining <= 0) {

        return 0;

    }


    return Math.ceil(
        remaining / 1000
    );

}


function showLoginLockCountdown(username) {

    if (loginLockCountdown) {

        clearInterval(
            loginLockCountdown
        );

    }


    loginLockCountdown =
        setInterval(
            function () {

                const index =
                    findLoginAttemptIndex(
                        username
                    );


                if (index === -1) {

                    clearInterval(
                        loginLockCountdown
                    );

                    loginLockCountdown = null;

                    return;

                }


                const record =
                    loginAttempts[index];


                const seconds =
                    getRemainingLockSeconds(
                        record
                    );


                if (seconds <= 0) {

                    record.attempts = 0;
                    record.lockedUntil = 0;

                    clearInterval(
                        loginLockCountdown
                    );

                    loginLockCountdown = null;


                    showMsg(
                        "msgLogin",
                        "You may try logging in again.",
                        "success"
                    );

                    return;

                }


                showMsg(
                    "msgLogin",
                    `Too many failed attempts. Try again in ${seconds} second${seconds === 1 ? "" : "s"}.`,
                    "error"
                );

            },
            1000
        );

}


function generateTemporaryPassword() {

    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

    let temporaryPassword = "";


    for (
        let i = 0;
        i < 8;
        i++
    ) {

        const index =
            Math.floor(
                Math.random() *
                chars.length
            );


        temporaryPassword +=
            chars[index];

    }


    return temporaryPassword;

}


function handleAdminResetPassword(
    username
) {

    if (!requireAdmin()) {

        return;

    }


    const index =
        findAccountIndexByUsername(
            username
        );


    if (index === -1) {

        showMsg(
            "staffMsg",
            "Staff account not found.",
            "error"
        );

        return;

    }


    if (
        accounts[index].role === "Admin"
    ) {

        showMsg(
            "staffMsg",
            "Use a separate administrator recovery process for the admin account.",
            "warn"
        );

        return;

    }


    const confirmReset =
        confirm(
            `Reset the password for ${accounts[index].name}? The old password will NOT be shown.`
        );


    if (!confirmReset) {

        return;

    }


    const temporaryPassword =
        generateTemporaryPassword();


    accounts[index].password =
        temporaryPassword;

    accounts[index].mustChangePassword =
        true;


    resetLoginAttempts(
        accounts[index].username
    );


    showMsg(
        "staffMsg",
        `Temporary password for ${accounts[index].username}: ${temporaryPassword} — give this to the staff privately. It is shown here only after reset and must be changed after login.`,
        "success"
    );


    renderStaff();

}


function openForcedPasswordChange() {

    const overlay =
        document.getElementById(
            "forcePasswordOverlay"
        );


    if (!overlay) {

        return;

    }


    overlay.style.display =
        "flex";


    document
        .getElementById(
            "forcedNewPassword"
        )
        .value = "";


    document
        .getElementById(
            "forcedConfirmPassword"
        )
        .value = "";


    showMsg(
        "forcePasswordMsg",
        "For privacy, the administrator cannot see your new password.",
        "warn"
    );

}


function handleForcedPasswordChange() {

    if (!loggedInUser) {

        return;

    }


    const newPassword =
        document
            .getElementById(
                "forcedNewPassword"
            )
            .value;


    const confirmPassword =
        document
            .getElementById(
                "forcedConfirmPassword"
            )
            .value;


    if (
        newPassword.length < 8
    ) {

        showMsg(
            "forcePasswordMsg",
            "Password must contain at least 8 characters.",
            "warn"
        );

        return;

    }


    if (
        newPassword !==
        confirmPassword
    ) {

        showMsg(
            "forcePasswordMsg",
            "Passwords do not match.",
            "error"
        );

        return;

    }


    if (
        newPassword ===
        loggedInUser.password
    ) {

        showMsg(
            "forcePasswordMsg",
            "Choose a password different from the temporary password.",
            "warn"
        );

        return;

    }


    const accountIndex =
        findAccountIndexByUsername(
            loggedInUser.username
        );


    if (accountIndex === -1) {

        showMsg(
            "forcePasswordMsg",
            "Account could not be found.",
            "error"
        );

        return;

    }


    accounts[accountIndex].password =
        newPassword;

    accounts[accountIndex].mustChangePassword =
        false;

    loggedInUser =
        accounts[accountIndex];


    document
        .getElementById(
            "forcePasswordOverlay"
        )
        .style
        .display = "none";


    showTab("dashboard");

}


/* =========================================================
   LOGIN
========================================================= */

function handleLogin() {

    const username =
        document
            .getElementById("loginUsername")
            .value
            .trim();

    const password =
        document
            .getElementById("loginPassword")
            .value;


    if (
        !username ||
        !password
    ) {

        showMsg(
            "msgLogin",
            "Please enter your username and password.",
            "warn"
        );

        return;

    }


    const attemptRecord =
        getOrCreateLoginAttempt(
            username
        );


    const remainingSeconds =
        getRemainingLockSeconds(
            attemptRecord
        );


    if (remainingSeconds > 0) {

        showMsg(
            "msgLogin",
            `Account temporarily locked. Try again in ${remainingSeconds} second${remainingSeconds === 1 ? "" : "s"}.`,
            "error"
        );

        showLoginLockCountdown(
            username
        );

        return;

    }


    if (
        attemptRecord.lockedUntil > 0
    ) {

        attemptRecord.attempts = 0;
        attemptRecord.lockedUntil = 0;

    }


    const match =
        linearSearchAuthenticate(
            accounts,
            username,
            password
        );


    if (!match) {

        attemptRecord.attempts++;


        const attemptsRemaining =
            MAX_LOGIN_ATTEMPTS -
            attemptRecord.attempts;


        if (
            attemptRecord.attempts >=
            MAX_LOGIN_ATTEMPTS
        ) {

            attemptRecord.lockedUntil =
                Date.now() +
                LOGIN_LOCK_MS;


            showMsg(
                "msgLogin",
                "Too many failed attempts. Account locked for 30 seconds.",
                "error"
            );


            showLoginLockCountdown(
                username
            );

        } else {

            showMsg(
                "msgLogin",
                `Access Denied: Invalid username or password. ${attemptsRemaining} attempt${attemptsRemaining === 1 ? "" : "s"} remaining.`,
                "error"
            );

        }


        return;

    }


    if (
        match.status !== "Approved"
    ) {

        showMsg(
            "msgLogin",
            "Your account is still pending administrator approval.",
            "warn"
        );

        return;

    }


    resetLoginAttempts(
        username
    );


    loggedInUser = match;


    document
        .getElementById("loginScreen")
        .style
        .display = "none";


    document
        .getElementById("app")
        .style
        .display = "flex";


    document
        .getElementById("whoText")
        .textContent =
        `${loggedInUser.name} (${loggedInUser.role})`;


    document
        .querySelectorAll(".adminOnly")
        .forEach(element => {

            element.style.display =
                loggedInUser.role === "Admin"
                    ? "block"
                    : "none";

        });


    setReservationDefaultDates();

    populateAllSelects();

    renderAll();

    showTab("dashboard");


    if (dashboardInterval) {

        clearInterval(
            dashboardInterval
        );

    }


    dashboardInterval =
        setInterval(
            renderDashboard,
            1000
        );


    if (
        loggedInUser.mustChangePassword === true
    ) {

        openForcedPasswordChange();

    }

}


/* =========================================================
   LOGOUT
========================================================= */

function handleLogout() {

    loggedInUser = null;


    if (dashboardInterval) {

        clearInterval(
            dashboardInterval
        );

    }


    const usernameInput =
        document.getElementById(
            "loginUsername"
        );

    const passwordInput =
        document.getElementById(
            "loginPassword"
        );


    if (usernameInput) {

        usernameInput.value = "";

    }


    if (passwordInput) {

        passwordInput.value = "";

    }


    document
        .getElementById("app")
        .style
        .display = "none";


    document
        .getElementById("loginScreen")
        .style
        .display = "flex";


    showMsg(
        "msgLogin",
        "Logged out.",
        "warn"
    );

}


/* =========================================================
   ADMIN CHECK
========================================================= */

function requireAdmin() {

    return (
        loggedInUser &&
        loggedInUser.role === "Admin"
    );

}


/* =========================================================
   DELETE STAFF
========================================================= */

function handleDeleteStaff(
    username
) {

    if (!requireAdmin()) {

        return;

    }


    const index =
        findAccountIndexByUsername(
            username
        );


    if (index === -1) {

        return;

    }


    if (
        accounts[index].role === "Admin"
    ) {

        showMsg(
            "staffMsg",
            "Admin account cannot be deleted.",
            "error"
        );

        return;

    }


    const confirmDelete =
        confirm(
            `Delete staff account "${accounts[index].name}"?`
        );


    if (!confirmDelete) {

        return;

    }


    const removed =
        accounts.splice(
            index,
            1
        )[0];


    showMsg(
        "staffMsg",
        `Deleted staff account: ${removed.name}`,
        "warn"
    );


    renderStaff();

}


/* =========================================================
   RENDER STAFF
========================================================= */

function renderStaff() {

    const tbody =
        document.getElementById(
            "staffBody"
        );


    if (!tbody) {

        return;

    }


    tbody.innerHTML = "";


    for (
        let i = 0;
        i < accounts.length;
        i++
    ) {

        const account =
            accounts[i];

        const row =
            document.createElement("tr");


        let actions =
            "Protected";


        if (
            account.role !== "Admin"
        ) {

            if (
                account.status === "Pending"
            ) {

                actions = `
                    <button
                        class="small"
                        onclick="handleApproveStaff('${account.username}')">
                        Approve
                    </button>

                    <button
                        class="small danger"
                        onclick="handleRejectStaff('${account.username}')">
                        Reject
                    </button>
                `;

            } else {

                actions = `
                    <button
                        class="small secondary"
                        onclick="handleAdminResetPassword('${account.username}')">
                        Reset Password
                    </button>

                    <button
                        class="small danger"
                        onclick="handleDeleteStaff('${account.username}')">
                        Delete
                    </button>
                `;

            }

        }


        row.innerHTML = `
            <td>${account.staffId}</td>
            <td>${account.username}</td>
            <td>${account.name}</td>
            <td>${account.email || "—"}</td>
            <td>${account.role}</td>
            <td>
                <span class="accountStatus ${String(account.status || "Approved").toLowerCase()}">
                    ${account.status || "Approved"}
                </span>
            </td>
            <td>${actions}</td>
        `;


        tbody.appendChild(row);

    }

}

/* =========================================================
   NAVIGATION
========================================================= */

function showTab(tabName) {

    if (
        tabName === "staff" &&
        !requireAdmin()
    ) {

        return;

    }


    document
        .querySelectorAll(".section")
        .forEach(section => {

            section.classList.remove(
                "active"
            );

        });


    document
        .querySelectorAll(
            "#sidebar button[data-tab]"
        )
        .forEach(button => {

            button.classList.remove(
                "active"
            );

        });


    const target =
        document.getElementById(
            "tab-" + tabName
        );


    if (target) {

        target.classList.add(
            "active"
        );

    }


    const navButton =
        document.querySelector(
            `#sidebar button[data-tab="${tabName}"]`
        );


    if (navButton) {

        navButton.classList.add(
            "active"
        );

    }


    if (tabName === "home") {

        renderDashboard();

    }


    if (
        tabName === "billiard-reservation"
    ) {

        renderBilliardReservations();

    }


    if (
        tabName === "ktv-reservation"
    ) {

        renderKTVReservations();

    }


    if (tabName === "walkin") {

        renderWalkIns();

    }


    if (tabName === "drinks") {

        renderInventory();

        populateAllSelects();

    }


    if (tabName === "billing") {

        populateBillingSelect();

        renderBillPreview();

    }


    if (tabName === "history") {

        renderHistory();

    }


    if (tabName === "staff") {

        renderStaff();

    }


    if (
        window.innerWidth <= 820
    ) {

        toggleSidebar(false);

    }

}


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

function toggleSidebar(forceState) {

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    const overlay =
        document.getElementById(
            "sidebarOverlay"
        );


    if (
        !sidebar ||
        !overlay
    ) {

        return;

    }


    let shouldOpen;


    if (
        typeof forceState === "boolean"
    ) {

        shouldOpen =
            forceState;

    }

    else {

        shouldOpen =
            !sidebar.classList.contains(
                "open"
            );

    }


    sidebar.classList.toggle(
        "open",
        shouldOpen
    );


    overlay.classList.toggle(
        "open",
        shouldOpen
    );

}



/* =========================================================
   TRANSIENT NOTIFICATIONS
========================================================= */
let pendingActionConfirmation = null;


function showActionConfirmation(
    title,
    message,
    confirmText = "Confirm"
) {

    return new Promise(
        function (resolve) {

            pendingActionConfirmation =
                resolve;


            let overlay =
                document.getElementById(
                    "actionConfirmOverlay"
                );


            if (!overlay) {

                overlay =
                    document.createElement(
                        "div"
                    );

                overlay.id =
                    "actionConfirmOverlay";

                overlay.className =
                    "actionConfirmOverlay";

                overlay.innerHTML = `
                    <div class="actionConfirmModal">
                        <div class="actionConfirmIcon">?</div>

                        <h3 id="actionConfirmTitle"></h3>

                        <p id="actionConfirmMessage"></p>

                        <div class="actionConfirmButtons">
                            <button
                                type="button"
                                class="secondary"
                                onclick="closeActionConfirmation(false)"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                id="actionConfirmButton"
                                onclick="closeActionConfirmation(true)"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                `;

                document.body.appendChild(
                    overlay
                );

            }


            document.getElementById(
                "actionConfirmTitle"
            ).textContent =
                title;


            document.getElementById(
                "actionConfirmMessage"
            ).textContent =
                message;


            document.getElementById(
                "actionConfirmButton"
            ).textContent =
                confirmText;


            overlay.classList.add(
                "show"
            );

        }
    );

}


function closeActionConfirmation(
    confirmed
) {

    const overlay =
        document.getElementById(
            "actionConfirmOverlay"
        );


    if (overlay) {

        overlay.classList.remove(
            "show"
        );

    }


    if (
        pendingActionConfirmation
    ) {

        const resolve =
            pendingActionConfirmation;

        pendingActionConfirmation =
            null;

        resolve(
            confirmed
        );

    }

}



/* =========================================================
   FACILITY STATUS
========================================================= */

function getFacilityStatus(
    facilityId
) {

    if (
        sessions[facilityId]
    ) {

        return sessions[facilityId].actualEnd

            ? "Ended - Awaiting Payment"

            : "Occupied";

    }


    const facility =
        facilities.find(
            item =>
                item.id === facilityId
        );


    if (
        facility &&
        facility.manualStatus
    ) {

        return facility.manualStatus;

    }


    const now =
        new Date();


    const upcoming =
        reservations.find(
            reservation => {

                if (
                    reservation.facilityId
                    !== facilityId
                ) {

                    return false;

                }


                if (
                    reservation.status
                    !== "Reserved"
                ) {

                    return false;

                }


                const reservationStart =
                    new Date(
                        `${reservation.date}T${reservation.scheduledStart}`
                    );


                const difference =
                    reservationStart - now;


                return (
                    difference <
                    2 * 60 * 60 * 1000
                    &&
                    difference >
                    -30 * 60 * 1000
                );

            }
        );


    if (upcoming) {

        return "Reserved";

    }


    return "Available";

}


/* =========================================================
   CLEANING / UNAVAILABLE
========================================================= */

function toggleCleaning(
    facilityId
) {

    if (!requireAdmin()) {

        return;

    }


    const facility =
        facilities.find(
            item =>
                item.id === facilityId
        );


    if (!facility) {

        return;

    }


    if (sessions[facilityId]) {

        alert(
            "This facility currently has an active session."
        );

        return;

    }


    facility.manualStatus =
        facility.manualStatus
            ? null
            : "Cleaning/Unavailable";


    renderDashboard();

}


/* =========================================================
   SESSION HELPERS
========================================================= */

function getTotalMinutes(
    session
) {

    return (

        session.bookedDurationMinutes

        +

        session.extensions.reduce(
            (total, extension) =>
                total +
                extension.minutes,
            0
        )

    );

}


function getExtensionTotal(
    session
) {

    return session.extensions.reduce(
        (total, extension) =>
            total +
            extension.price,
        0
    );

}


/* =========================================================
   PRORATED EXTENSION BILLING
========================================================= */

function getProratedExtensionBilling(
    session,
    totalPlayingMinutes
) {

    const ratePerMinute =
        RATE[session.facilityType] / 60;


    let remainingUsed =
        Math.max(
            0,
            totalPlayingMinutes -
            session.bookedDurationMinutes
        );


    const items = [];

    let totalExtensionCost = 0;


    session.extensions.forEach(
        extension => {

            const usedMinutes =
                Math.min(
                    extension.minutes,
                    remainingUsed
                );


            remainingUsed -=
                usedMinutes;


            const chargedPrice =
                Math.round(
                    usedMinutes *
                    ratePerMinute
                );


            items.push({

                minutes:
                    extension.minutes,

                fullPrice:
                    extension.price,

                usedMinutes:
                    usedMinutes,

                price:
                    chargedPrice,

                prorated:
                    usedMinutes <
                    extension.minutes

            });


            totalExtensionCost +=
                chargedPrice;

        }
    );


    return {

        items:
            items,

        totalExtensionCost:
            totalExtensionCost

    };

}


/* =========================================================
   SESSION FEE
========================================================= */

function getSessionFeeTotal(
    session,
    totalPlayingMinutesOverride
) {

    let totalPlayingMinutes =
        totalPlayingMinutesOverride;


    if (
        totalPlayingMinutes == null
    ) {

        const now =
            new Date();


        const elapsed =
            (
                session.actualEnd ||
                now
            )
            -
            session.actualStart;


        totalPlayingMinutes =
            Math.max(
                0,
                Math.round(
                    elapsed / 60000
                )
            );

    }


    const extensionBilling =
        getProratedExtensionBilling(
            session,
            totalPlayingMinutes
        );


    return (

        session.baseSessionPrice

        +

        extensionBilling
            .totalExtensionCost

    );

}


/* =========================================================
   HOME DASHBOARD
========================================================= */


function getFacilityIcon(
    facilityType
) {

    if (
        facilityType === "KTV"
    ) {

        return `
            <div class="facilityIcon ktvFacilityIcon" aria-hidden="true">
                <svg viewBox="0 0 160 88" role="img">
                    <rect class="iconStroke" x="91" y="13" width="50" height="32" rx="4"></rect>
                    <line class="iconStroke" x1="116" y1="45" x2="116" y2="53"></line>
                    <line class="iconStroke" x1="105" y1="53" x2="127" y2="53"></line>

                    <path class="iconStroke" d="M25 57V45c0-6 4-10 10-10h9c5 0 9 4 9 9v4h35v-4c0-5 4-9 9-9h9c6 0 10 4 10 10v12"></path>
                    <path class="iconStroke" d="M22 55c0-4 3-7 7-7h7v12h69V48h7c4 0 7 3 7 7v16H22V55Z"></path>
                    <line class="iconStroke" x1="31" y1="71" x2="31" y2="78"></line>
                    <line class="iconStroke" x1="110" y1="71" x2="110" y2="78"></line>

                    <path class="musicNote" d="M137 58v13c0 4-3 7-7 7-3 0-6-2-6-5s3-5 7-5c1 0 2 0 3 .4V56l13-3v12c0 4-3 7-7 7-3 0-6-2-6-5s3-5 7-5c1 0 2 0 3 .4v-6.1l-7 1.7Z"></path>
                    <path class="musicNote smallMusicNote" d="M151 24v10c0 3-2 5-5 5-2 0-4-1-4-3.5s2-3.5 5-3.5h1V22l9-2v5l-6 1.3Z"></path>
                </svg>
            </div>
        `;

    }


    return `
        <div class="facilityIcon billiardFacilityIcon" aria-hidden="true">
            <svg viewBox="0 0 160 88" role="img">
                <path class="iconFill" d="M31 25h98l14 39H17l14-39Z"></path>
                <path class="iconStroke" d="M31 25h98l14 39H17l14-39Z"></path>
                <line class="iconStroke" x1="29" y1="64" x2="24" y2="79"></line>
                <line class="iconStroke" x1="131" y1="64" x2="136" y2="79"></line>
                <circle class="ball" cx="65" cy="43" r="5"></circle>
                <circle class="ball" cx="82" cy="49" r="5"></circle>
                <circle class="ball" cx="99" cy="39" r="5"></circle>
                <line class="cue" x1="117" y1="21" x2="76" y2="55"></line>
            </svg>
        </div>
    `;

}


function renderDashboard() {

    const grid =
        document.getElementById(
            "dashboardGrid"
        );


    if (!grid) {

        return;

    }


    grid.innerHTML = "";


    facilities.forEach(
        facility => {

            const session =
                sessions[facility.id];


            const status =
                getFacilityStatus(
                    facility.id
                );


            const card =
                document.createElement(
                    "div"
                );


            let cardClass =
                "available";


            if (
                status === "Occupied" ||
                status ===
                "Ended - Awaiting Payment"
            ) {

                cardClass =
                    "occupied";

            }

            else if (
                status === "Reserved"
            ) {

                cardClass =
                    "reserved";

            }


            card.className =
                "dashCard " +
                cardClass;


            /* =============================================
               FACILITY WITH SESSION
            ============================================= */

            if (session) {

                const now =
                    new Date();


                const elapsedMs =
                    (
                        session.actualEnd ||
                        now
                    )
                    -
                    session.actualStart;


                const totalMinutes =
                    getTotalMinutes(
                        session
                    );


                const remainingMs =
                    totalMinutes *
                    60000 -
                    elapsedMs;


                const expired =
                    remainingMs <= 0;


                let timerClass =
                    "timerBig";


                let warningText =
                    "";


                if (
                    !session.actualEnd
                ) {

                    if (expired) {

                        timerClass +=
                            " dangerT";

                        warningText =
                            "TIME EXPIRED";

                    }

                    else if (
                        remainingMs <=
                        5 * 60000
                    ) {

                        timerClass +=
                            " dangerT";

                        warningText =
                            "5 minutes remaining";

                    }

                    else if (
                        remainingMs <=
                        15 * 60000
                    ) {

                        timerClass +=
                            " warnT";

                        warningText =
                            "15 minutes remaining";

                    }

                }


                const expectedEnd =
                    new Date(

                        session
                            .actualStart
                            .getTime()

                        +

                        totalMinutes *
                        60000

                    );


                card.innerHTML = `

                    ${getFacilityIcon(facility.type)}

                    <b>
                        ${facility.name}
                    </b>

                    <span class="badge occupied">
                        ${status}
                    </span>

                    <br>

                    <span class="small-note">
                        Customer:
                        ${session.customerName}
                    </span>

                    <div class="${timerClass}">
                        ${fmtHMS(elapsedMs)}
                    </div>

                    <span class="small-note">

                        Booked:
                        ${minutesToHM(totalMinutes)}

                        <br>

                        Remaining:
                        ${
                            expired

                            ? "00:00:00"

                            : fmtHMS(
                                remainingMs
                            )
                        }

                        <br>

                        Start:
                        ${fmtClock(
                            session.actualStart
                        )}

                        <br>

                        Expected End:
                        ${fmtClock(
                            expectedEnd
                        )}

                        <br>

                        Current Session Charge:
                        \u20B1${getSessionFeeTotal(
                            session
                        )}

                    </span>


                    ${
                        warningText

                        ?

                        `
                        <div class="msg warn">
                            ${warningText}
                        </div>
                        `

                        :

                        ""
                    }


                    <div
                        class="actions"
                        style="margin-top:10px;"
                    >

                        ${
                            !session.actualEnd

                            ?

                            `

                            <button
                                class="small secondary"
                                onclick="handleExtendSession('${facility.id}', 30)">
                                +30 min
                            </button>

                            <button
                                class="small secondary"
                                onclick="handleExtendSession('${facility.id}', 60)">
                                +1 hour
                            </button>

                            <button
                                class="small danger"
                                onclick="handleEndSession('${facility.id}')">
                                End Session
                            </button>

                            `

                            :

                            `

                            <button
                                class="small"
                                onclick="openSessionBilling('${facility.id}')">
                                Go to Billing
                            </button>

                            `
                        }

                    </div>

                `;

            }

            /* =============================================
               FACILITY WITHOUT SESSION
            ============================================= */

            else {

                let badgeClass =
                    "free";


                if (
                    status === "Reserved"
                ) {

                    badgeClass =
                        "reserved";

                }

                else if (
                    status !== "Available"
                ) {

                    badgeClass =
                        "occupied";

                }


                const upcoming =
                    getNextFacilityReservation(
                        facility.id
                    );


                card.innerHTML = `

                    ${getFacilityIcon(facility.type)}

                    <b>
                        ${facility.name}
                    </b>

                    <span
                        class="badge ${badgeClass}"
                    >
                        ${status}
                    </span>

                    <br>

                    <span class="small-note">

                        ${facility.type}

                        \u2014

                        \u20B1${RATE[facility.type]}/hour

                    </span>


                    ${
                        upcoming

                        ?

                        `

                        <div
                            class="small-note"
                            style="margin-top:8px;"
                        >

                            Next reservation:

                            <b>
                                ${upcoming.customerName}
                            </b>

                            <br>

                            ${upcoming.date}

                            ${upcoming.scheduledStart}

                            -

                            ${upcoming.scheduledEnd}

                        </div>

                        `

                        :

                        `

                        <div
                            class="small-note"
                            style="margin-top:8px;"
                        >
                            No upcoming reservation.
                        </div>

                        `
                    }


                    ${
                        requireAdmin()

                        ?

                        `

                        <div
                            class="actions"
                            style="margin-top:10px;"
                        >

                            <button
                                class="small secondary"
                                onclick="toggleCleaning('${facility.id}')"
                            >

                                ${
                                    facility.manualStatus

                                    ? "Mark Available"

                                    : "Mark Unavailable"
                                }

                            </button>

                        </div>

                        `

                        :

                        ""
                    }

                `;

            }


            grid.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   NEXT FACILITY RESERVATION
========================================================= */

function getNextFacilityReservation(
    facilityId
) {

    const now =
        new Date();


    const upcoming =
        reservations

            .filter(
                reservation =>
                    reservation.facilityId ===
                        facilityId
                    &&
                    reservation.status ===
                        "Reserved"
                    &&
                    new Date(
                        `${reservation.date}T${reservation.scheduledStart}`
                    ) >= now
            )

            .sort(
                (first, second) =>

                    new Date(
                        `${first.date}T${first.scheduledStart}`
                    )

                    -

                    new Date(
                        `${second.date}T${second.scheduledStart}`
                    )
            );


    return (
        upcoming[0] ||
        null
    );

}


/* =========================================================
   RESERVATION DEFAULT DATES
========================================================= */

function setReservationDefaultDates() {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const billiardDate =
        document.getElementById(
            "bResDate"
        );


    const ktvDate =
        document.getElementById(
            "kResDate"
        );


    if (
        billiardDate &&
        !billiardDate.value
    ) {

        billiardDate.value =
            today;

    }


    if (
        ktvDate &&
        !ktvDate.value
    ) {

        ktvDate.value =
            today;

    }

}


/* =========================================================
   POPULATE FACILITY SELECT
========================================================= */

function populateFacilitySelect(
    selectId,
    type
) {

    const select =
        document.getElementById(
            selectId
        );


    if (!select) {

        return;

    }


    const previousValue =
        select.value;


    select.innerHTML =
        "";


    facilities

        .filter(
            facility =>
                facility.type === type
        )

        .forEach(
            facility => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    facility.id;


                option.textContent =
                    facility.name;


                select.appendChild(
                    option
                );

            }
        );


    if (
        [...select.options]
            .some(
                option =>
                    option.value ===
                    previousValue
            )
    ) {

        select.value =
            previousValue;

    }

}


/* =========================================================
   RESERVATION CONFLICT CHECKING
========================================================= */

function reservationConflict(
    facilityId,
    date,
    startTime,
    endTime,
    excludeId
) {

    const newStart =
        timeToMinutes(
            startTime
        );


    const newEnd =
        timeToMinutes(
            endTime
        );


    return reservations.find(
        reservation =>

            reservation.id !==
                excludeId

            &&

            reservation.facilityId ===
                facilityId

            &&

            reservation.date ===
                date

            &&

            (
                reservation.status ===
                    "Reserved"

                ||

                reservation.status ===
                    "Started"
            )

            &&

            overlaps(

                newStart,

                newEnd,

                timeToMinutes(
                    reservation
                        .scheduledStart
                ),

                timeToMinutes(
                    reservation
                        .scheduledEnd
                )

            )

    );

}


/* =========================================================
   GENERIC RESERVATION CREATION
========================================================= */

function createReservation(
    options
) {

    const customerInput =
        document.getElementById(
            options.customerId
        );


    const contactInput =
        document.getElementById(
            options.contactId
        );


    const facilityInput =
        document.getElementById(
            options.facilityId
        );


    const dateInput =
        document.getElementById(
            options.dateId
        );


    const timeInput =
        document.getElementById(
            options.timeId
        );


    const durationInput =
        document.getElementById(
            options.durationId
        );


    if (
        !customerInput ||
        !contactInput ||
        !facilityInput ||
        !dateInput ||
        !timeInput ||
        !durationInput
    ) {

        console.error(
            "Reservation form element is missing."
        );

        return;

    }


    const customer =
        customerInput.value.trim();


    const contact =
        contactInput.value.trim();


    const facilityId =
        facilityInput.value;


    const date =
        dateInput.value;


    const startTime =
        timeInput.value;


    const duration =
        getDuration(
            options.durationId
        );


    if (
        !customer ||
        !facilityId ||
        !date ||
        !startTime ||
        !duration
    ) {

        showMsg(
            options.messageId,
            "Please complete the required reservation fields.",
            "warn"
        );

        return;

    }


    const facility =
        facilities.find(
            item =>
                item.id === facilityId
        );


    if (!facility) {

        showMsg(
            options.messageId,
            "Selected facility was not found.",
            "error"
        );

        return;

    }


    if (
        facility.type !==
        options.type
    ) {

        showMsg(
            options.messageId,
            "Invalid facility selection.",
            "error"
        );

        return;

    }


    const businessHoursCheck =
        validateBusinessHours(
            startTime,
            duration
        );

    if (!businessHoursCheck.valid) {

        showMsg(
            options.messageId,
            businessHoursCheck.message,
            "warn"
        );

        return;
    }


    const endTime =
        computeEndTimeStr(
            date,
            startTime,
            duration
        );


    const conflict =
        reservationConflict(
            facilityId,
            date,
            startTime,
            endTime,
            null
        );


    if (conflict) {

        showMsg(

            options.messageId,

            `Time conflict with ${conflict.id}. ` +
            `${facility.name} is already reserved ` +
            `${conflict.scheduledStart}-${conflict.scheduledEnd}.`,

            "error"

        );

        return;

    }


    const price =
        computePrice(
            options.type,
            duration
        );


    const reservation = {

        id:
            `RES${String(nextResId)
                .padStart(3, "0")}`,

        customerName:
            customer,

        contact:
            contact,

        facilityId:
            facility.id,

        facilityName:
            facility.name,

        facilityType:
            options.type,

        date:
            date,

        scheduledStart:
            startTime,

        scheduledEnd:
            endTime,

        durationMinutes:
            duration,

        price:
            price,

        status:
            "Reserved",

        actualStart:
            null

    };


    nextResId++;


    reservations.push(
        reservation
    );


    customerInput.value =
        "";


    contactInput.value =
        "";


    renderBilliardReservations();

    renderKTVReservations();

    renderDashboard();

    populateAllSelects();

    clearFormMessage(
        options.messageId
    );

}


/* =========================================================
   CREATE RESERVATION BUTTON DISPATCHER
   Matches current HTML onclick="handleCreateReservation(...)"
========================================================= */

function handleCreateReservation(type) {

    if (type === "Billiard") {
        handleCreateBilliardReservation();
        return;
    }

    if (type === "KTV") {
        handleCreateKTVReservation();
    }

}


/* =========================================================
   CREATE BILLIARD RESERVATION
========================================================= */

function handleCreateBilliardReservation() {

    createReservation({

        type:
            "Billiard",

        customerId:
            "bResCustomer",

        contactId:
            "bResContact",

        facilityId:
            "bResFacilitySelect",

        dateId:
            "bResDate",

        timeId:
            "bResStartTime",

        durationId:
            "bResDurationSelect",

        messageId:
            "bResMsg"

    });


    renderBilliardReservations();

}


/* =========================================================
   CREATE KTV RESERVATION
========================================================= */

function handleCreateKTVReservation() {

    createReservation({

        type:
            "KTV",

        customerId:
            "kResCustomer",

        contactId:
            "kResContact",

        facilityId:
            "kResFacilitySelect",

        dateId:
            "kResDate",

        timeId:
            "kResStartTime",

        durationId:
            "kResDurationSelect",

        messageId:
            "kResMsg"

    });


    renderKTVReservations();

}


/* =========================================================
   START RESERVATION SESSION
========================================================= */

function handleStartReservationEarly(
    reservationId
) {

    const reservation =
        reservations.find(
            item =>
                item.id ===
                reservationId
        );


    if (
        !reservation ||
        reservation.status !==
            "Reserved"
    ) {

        return;

    }


    const messageId =
        reservation.facilityType ===
            "Billiard"

        ? "bResMsg"

        : "kResMsg";


    if (
        sessions[
            reservation.facilityId
        ]
    ) {

        showMsg(

            messageId,

            `${reservation.facilityName} is currently occupied.`,

            "error"

        );

        return;

    }


    const facility =
        facilities.find(
            item =>
                item.id ===
                reservation.facilityId
        );


    if (
        facility &&
        facility.manualStatus
    ) {

        showMsg(

            messageId,

            `${reservation.facilityName} is currently unavailable.`,

            "error"

        );

        return;

    }


    const actualStart =
        new Date();

    const actualStartTime =
        pad2(actualStart.getHours()) +
        ":" +
        pad2(actualStart.getMinutes());

    const reservationStartCheck =
        validateBusinessHours(
            actualStartTime,
            reservation.durationMinutes
        );

    if (!reservationStartCheck.valid) {

        showMsg(
            messageId,
            reservationStartCheck.message,
            "warn"
        );

        return;
    }


    sessions[
        reservation.facilityId
    ] = {

        sourceType:
            "Reservation",

        sourceId:
            reservation.id,

        customerName:
            reservation.customerName,

        facilityId:
            reservation.facilityId,

        facilityName:
            reservation.facilityName,

        facilityType:
            reservation.facilityType,

        scheduledStart:
            reservation.scheduledStart,

        scheduledEnd:
            reservation.scheduledEnd,

        actualStart:
            actualStart,

        actualEnd:
            null,

        bookedDurationMinutes:
            reservation.durationMinutes,

        baseSessionPrice:
            reservation.price,

        extensions:
            [],

        drinks:
            []

    };


    reservation.status =
        "Started";


    reservation.actualStart =
        actualStart;

    renderBilliardReservations();

    renderKTVReservations();

    renderDashboard();

    populateAllSelects();

    showTab("dashboard");

}


/* =========================================================
   CANCEL RESERVATION
========================================================= */

function handleCancelReservation(
    reservationId
) {

    const reservation =
        reservations.find(
            item =>
                item.id ===
                reservationId
        );


    if (!reservation) {

        return;

    }


    if (
        reservation.status ===
        "Started"
    ) {

        alert(
            "A started reservation cannot be cancelled. End the active session instead."
        );

        return;

    }


    if (
        reservation.status !==
        "Reserved"
    ) {

        return;

    }


    const confirmed =
        confirm(
            `Cancel reservation ${reservation.id} for ${reservation.customerName}?`
        );


    if (!confirmed) {

        return;

    }


    reservation.status =
        "Cancelled";


    const messageId =
        reservation.facilityType ===
            "Billiard"

        ? "bResMsg"

        : "kResMsg";


    showMsg(

        messageId,

        `${reservation.id} has been cancelled.`,

        "warn"

    );


    renderBilliardReservations();

    renderKTVReservations();

    renderDashboard();

}


/* =========================================================
   RESERVATION SEARCH
   Linear Search
========================================================= */

function linearSearchReservation(
    query,
    facilityType
) {

    const search =
        query
            .trim()
            .toLowerCase();


    for (
        let i = 0;
        i < reservations.length;
        i++
    ) {

        const reservation =
            reservations[i];


        if (
            facilityType &&
            reservation.facilityType !==
                facilityType
        ) {

            continue;

        }


        if (

            reservation
                .customerName
                .toLowerCase()
                .includes(search)

            ||

            reservation
                .id
                .toLowerCase() ===
                search

        ) {

            return reservation;

        }

    }


    return null;

}


/* =========================================================
   BILLIARD RESERVATION SEARCH
========================================================= */

function handleBilliardReservationSearch() {
    const input = document.getElementById("bResSearchInput");
    if (!input) return;

    const query = input.value.trim();
    renderBilliardReservations(query);

    const msg = document.getElementById("bResSearchMsg");
    if (msg) {
        msg.textContent = "";
        msg.className = "msg";
    }
}

function handleKTVReservationSearch() {
    const input = document.getElementById("kResSearchInput");
    if (!input) return;

    const query = input.value.trim();
    renderKTVReservations(query);

    const msg = document.getElementById("kResSearchMsg");
    if (msg) {
        msg.textContent = "";
        msg.className = "msg";
    }
}

function handleReservationSearch(type) {
    if (type === "Billiard") {
        handleBilliardReservationSearch();
        return;
    }

    if (type === "KTV") {
        handleKTVReservationSearch();
    }
}

function renderBilliardReservations(searchQuery = "") {

    const tbody =
        document.getElementById(
            "bResReservationsBody"
        );

    if (!tbody) {
        return;
    }

    tbody.innerHTML = "";

    const search = searchQuery.trim().toLowerCase();

    const list =
        reservations.filter(
            reservation =>
                reservation.facilityType === "Billiard"
                &&
                (
                    !search
                    ||
                    reservation.customerName.toLowerCase().includes(search)
                    ||
                    reservation.id.toLowerCase().includes(search)
                )
        );

    if (list.length === 0) {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td colspan="10" class="emptyState">
                No billiard reservations yet.
            </td>
        `;

        tbody.appendChild(row);

        return;
    }

    list.forEach(
        reservation => {

            const row =
                document.createElement("tr");

            let badgeClass =
                "reserved";

            if (
                reservation.status === "Started"
            ) {
                badgeClass = "occupied";
            }

            else if (
                reservation.status === "Cancelled"
            ) {
                badgeClass = "expired";
            }

            row.innerHTML = `

                <td>
                    ${reservation.id}
                </td>

                <td>
                    ${reservation.customerName}
                </td>

                <td>
                    ${reservation.facilityName}
                </td>

                <td>
                    ${reservation.date}
                </td>

                <td>
                    ${reservation.scheduledStart}
                </td>

                <td>
                    ${reservation.scheduledEnd}
                </td>

                <td>
                    ${minutesToHM(
                        reservation.durationMinutes
                    )}
                </td>

                <td>
                    \u20B1${reservation.price}
                </td>

                <td>
                    <span
                        class="badge ${badgeClass}"
                    >
                        ${reservation.status}
                    </span>
                </td>

                <td>
                    <div class="actions">
                        ${
                            reservation.status ===
                            "Reserved"

                            ?

                            `

                            <button
                                class="small"
                                onclick="handleStartReservationEarly('${reservation.id}')"
                            >
                                Start Session
                            </button>

                            <button
                                class="small danger"
                                onclick="handleCancelReservation('${reservation.id}')"
                            >
                                Cancel
                            </button>

                            `

                            :

                            ""
                        }
                    </div>
                </td>

            `;

            tbody.appendChild(row);

        }
    );

}


/* =========================================================
   RENDER KTV RESERVATIONS
========================================================= */

function renderKTVReservations(searchQuery = "") {

    const tbody =
        document.getElementById(
            "kResReservationsBody"
        );

    if (!tbody) {
        return;
    }

    tbody.innerHTML = "";

    const search = searchQuery.trim().toLowerCase();

    const list =
        reservations.filter(
            reservation =>
                reservation.facilityType === "KTV"
                &&
                (
                    !search
                    ||
                    reservation.customerName.toLowerCase().includes(search)
                    ||
                    reservation.id.toLowerCase().includes(search)
                )
        );

    if (list.length === 0) {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td colspan="10" class="emptyState">
                No KTV reservations yet.
            </td>
        `;

        tbody.appendChild(row);

        return;
    }

    list.forEach(
        reservation => {

            const row =
                document.createElement("tr");

            let badgeClass =
                "reserved";

            if (
                reservation.status === "Started"
            ) {
                badgeClass = "occupied";
            }

            else if (
                reservation.status === "Cancelled"
            ) {
                badgeClass = "expired";
            }

            row.innerHTML = `

                <td>
                    ${reservation.id}
                </td>

                <td>
                    ${reservation.customerName}
                </td>

                <td>
                    ${reservation.facilityName}
                </td>

                <td>
                    ${reservation.date}
                </td>

                <td>
                    ${reservation.scheduledStart}
                </td>

                <td>
                    ${reservation.scheduledEnd}
                </td>

                <td>
                    ${minutesToHM(
                        reservation.durationMinutes
                    )}
                </td>

                <td>
                    \u20B1${reservation.price}
                </td>

                <td>
                    <span
                        class="badge ${badgeClass}"
                    >
                        ${reservation.status}
                    </span>
                </td>

                <td>
                    <div class="actions">
                        ${
                            reservation.status ===
                            "Reserved"

                            ?

                            `

                            <button
                                class="small"
                                onclick="handleStartReservationEarly('${reservation.id}')"
                            >
                                Start Session
                            </button>

                            <button
                                class="small danger"
                                onclick="handleCancelReservation('${reservation.id}')"
                            >
                                Cancel
                            </button>

                            `

                            :

                            ""
                        }
                    </div>
                </td>

            `;

            tbody.appendChild(row);

        }
    );

}


/* =========================================================
   WALK-IN QUEUE
========================================================= */

function handleAddWalkIn() {

    const customerInput =
        document.getElementById(
            "wiCustomer"
        );

    const typeInput =
        document.getElementById(
            "wiFacilityType"
        );

    const durationInput =
        document.getElementById(
            "wiDurationSelect"
        );

    if (
        !customerInput ||
        !typeInput ||
        !durationInput
    ) {
        return;
    }

    const customer =
        customerInput.value.trim();

    const facilityType =
        typeInput.value;

    const duration =
        getDuration(
            "wiDurationSelect"
        );

    if (
        !customer ||
        !duration
    ) {

        showMsg(
            "wiMsg",
            "Enter the customer name and select a duration.",
            "warn"
        );

        return;
    }

    const walkInHoursCheck =
        validateBusinessHours(
            getTodayClockTime(),
            duration
        );

    if (!walkInHoursCheck.valid) {

        showMsg(
            "wiMsg",
            walkInHoursCheck.message,
            "warn"
        );

        return;
    }

    const walkIn = {

        id:
            `WI${String(nextWalkInId)
                .padStart(3, "0")}`,

        customerName:
            customer,

        facilityType:
            facilityType,

        durationMinutes:
            duration,

        timeAdded:
            new Date(),

        status:
            "Waiting",

        queueNumber:
            nextQueueNumber++,

        assignedFacilityId:
            null

    };

    nextWalkInId++;

    walkIns.push(
        walkIn
    );

    customerInput.value = "";

    showMsg(

        "wiMsg",

        `${customer} added to the queue as #${walkIn.queueNumber}.`,

        "success"

    );

    renderWalkIns();

}


/* =========================================================
   START WALK-IN
========================================================= */

function handleStartWalkIn(
    walkInId
) {

    const walkIn =
        walkIns.find(
            item =>
                item.id === walkInId
        );

    if (
        !walkIn ||
        walkIn.status !== "Waiting"
    ) {
        return;
    }

    const walkInStartCheck =
        validateBusinessHours(
            getTodayClockTime(),
            walkIn.durationMinutes
        );

    if (!walkInStartCheck.valid) {

        showMsg(
            "wiMsg",
            walkInStartCheck.message,
            "warn"
        );

        return;
    }

    const freeFacility =
        facilities.find(
            facility =>

                facility.id ===
                    walkIn.facilityType

                &&

                !sessions[
                    facility.id
                ]

                &&

                !facility.manualStatus

                &&

                getFacilityStatus(
                    facility.id
                ) !== "Reserved"
        );

    if (!freeFacility) {

        showMsg(

            "wiMsg",

            `${walkIn.customerName}'s selected facility (${walkIn.facilityType}) is not available right now. The customer remains in the queue.`,

            "warn"

        );

        return;
    }

    const actualStart =
        new Date();

    sessions[
        freeFacility.id
    ] = {

        sourceType:
            "Walk-In",

        sourceId:
            walkIn.id,

        customerName:
            walkIn.customerName,

        facilityId:
            freeFacility.id,

        facilityName:
            freeFacility.name,

        facilityType:
            freeFacility.type,

        scheduledStart:
            null,

        scheduledEnd:
            null,

        actualStart:
            actualStart,

        actualEnd:
            null,

        bookedDurationMinutes:
            walkIn.durationMinutes,

        baseSessionPrice:
            computePrice(
                freeFacility.type,
                walkIn.durationMinutes
            ),

        extensions:
            [],

        drinks:
            []

    };

    walkIn.status =
        "Playing";

    walkIn.assignedFacilityId =
        freeFacility.id;

    renderWalkIns();

    renderDashboard();

    populateAllSelects();

    showTab("dashboard");

}


/* =========================================================
   CANCEL WALK-IN
========================================================= */

function handleCancelWalkIn(
    walkInId
) {

    const walkIn =
        walkIns.find(
            item =>
                item.id === walkInId
        );

    if (
        !walkIn ||
        walkIn.status !== "Waiting"
    ) {
        return;
    }

    const confirmed =
        confirm(
            `Cancel the queue entry for ${walkIn.customerName}?`
        );

    if (!confirmed) {
        return;
    }

    walkIn.status =
        "Cancelled";

    showMsg(

        "wiMsg",

        `${walkIn.customerName}'s queue entry was cancelled.`,

        "warn"

    );

    renderWalkIns();

}


/* =========================================================
   RENDER WALK-IN QUEUE
========================================================= */

function renderWalkIns() {

    const tbody =
        document.getElementById(
            "walkinBody"
        );

    if (!tbody) {
        return;
    }

    tbody.innerHTML = "";

    const visibleWalkIns =
        walkIns.filter(
            walkIn =>
                walkIn.status === "Waiting" ||
                walkIn.status === "Playing"
        );

    if (
        visibleWalkIns.length === 0
    ) {

        const row =
            document.createElement("tr");

        row.innerHTML = `

            <td
                colspan="7"
                class="emptyState"
            >
                No customers in the walk-in queue.
            </td>

        `;

        tbody.appendChild(row);

        return;
    }

    visibleWalkIns.forEach(
        walkIn => {

            const row =
                document.createElement("tr");

            const badgeClass =
                walkIn.status === "Playing"
                    ? "occupied"
                    : "reserved";

            const facility =
                walkIn.assignedFacilityId

                ?

                facilities.find(
                    item =>
                        item.id ===
                        walkIn.assignedFacilityId
                )

                :

                null;

            row.innerHTML = `

                <td>
                    #${walkIn.queueNumber}
                </td>

                <td>
                    ${walkIn.customerName}
                </td>

                <td>
                    ${walkIn.facilityType}
                </td>

                <td>
                    ${minutesToHM(
                        walkIn.durationMinutes
                    )}
                </td>

                <td>
                    ${fmtClock(
                        walkIn.timeAdded
                    )}
                </td>

                <td>

                    <span
                        class="badge ${badgeClass}"
                    >
                        ${walkIn.status}
                    </span>

                    ${
                        facility

                        ?

                        `<div class="small-note">
                            ${facility.name}
                        </div>`

                        :

                        ""
                    }

                </td>

                <td>

                    ${
                        walkIn.status === "Waiting"

                        ?

                        `

                        <button
                            class="small"
                            onclick="handleStartWalkIn('${walkIn.id}')"
                        >
                            Start Session
                        </button>

                        <button
                            class="small danger"
                            onclick="handleCancelWalkIn('${walkIn.id}')"
                        >
                            Cancel
                        </button>

                        `

                        :

                        "-"
                    }

                </td>

            `;

            tbody.appendChild(row);

        }
    );

}


/* =========================================================
   EXTEND SESSION
========================================================= */

function handleExtendSession(
    facilityId,
    minutes
) {

    const session =
        sessions[facilityId];

    if (
        !session ||
        session.actualEnd
    ) {
        return;
    }

    const currentEnd =
        new Date(

            session.actualStart.getTime()

            +

            getTotalMinutes(session) *
            60000

        );

    const newEnd =
        new Date(

            currentEnd.getTime()

            +

            minutes * 60000

        );

    const closingTime =
        getSessionClosingTime(session);

    if (newEnd > closingTime) {

        alert(
            "Cannot extend this session. Snooker's Billiard Hall closes at 12:00 AM."
        );

        return;
    }

    const conflict =
        reservations.find(
            reservation => {

                if (
                    reservation.facilityId !==
                    facilityId
                ) {
                    return false;
                }

                if (
                    reservation.status !==
                    "Reserved"
                ) {
                    return false;
                }

                const reservationStart =
                    new Date(
                        `${reservation.date}T${reservation.scheduledStart}`
                    );

                return (

                    reservationStart >
                    session.actualStart

                    &&

                    reservationStart <
                    newEnd

                );

            }
        );

    if (conflict) {

        alert(

            `Cannot extend this session. ` +
            `${conflict.id} is reserved for ` +
            `${conflict.customerName} at ` +
            `${conflict.scheduledStart}.`

        );

        return;
    }

    const price =
        computePrice(
            session.facilityType,
            minutes
        );

    session.extensions.push({

        minutes:
            minutes,

        price:
            price

    });

    renderDashboard();

    populateBillingSelect();

    renderBillPreview();

}


/* =========================================================
   END SESSION
========================================================= */

function handleEndSession(
    facilityId
) {

    const session =
        sessions[facilityId];

    if (!session) {
        return;
    }

    if (session.actualEnd) {

        openSessionBilling(
            facilityId
        );

        return;
    }

    const confirmed =
        confirm(
            `End the session for ${session.customerName}?`
        );

    if (!confirmed) {
        return;
    }

    session.actualEnd =
        new Date();

    renderDashboard();

    populateAllSelects();

    resetBillingFormState();

    showTab(
        "billing"
    );

    const billTarget =
        document.getElementById(
            "billTarget"
        );

    if (billTarget) {

        billTarget.value =
            "session:" +
            facilityId;

    }

    renderBillPreview();

}


/* =========================================================
   OPEN SESSION BILLING
========================================================= */

function openSessionBilling(
    facilityId
) {

    resetBillingFormState();

    showTab(
        "billing"
    );

    populateBillingSelect();

    const billTarget =
        document.getElementById(
            "billTarget"
        );

    if (billTarget) {

        billTarget.value =
            "session:" +
            facilityId;

    }

    renderBillPreview();

}


/* =========================================================
   DRINK STATUS
========================================================= */

function syncDrinkStatus(
    drink
) {

    drink.status =
        drink.stock > 0
            ? "Available"
            : "Out of Stock";

}


/* =========================================================
   POPULATE DRINK CATEGORY SELECTS
========================================================= */

function populateCategorySelects() {

    const ids = [
        "newDrinkCategory",
        "editDrinkCategory"
    ];

    ids.forEach(
        id => {

            const select =
                document.getElementById(
                    id
                );

            if (!select) {
                return;
            }

            const previous =
                select.value;

            select.innerHTML = "";

            DRINK_CATEGORIES.forEach(
                category => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        category;

                    option.textContent =
                        category;

                    select.appendChild(
                        option
                    );

                }
            );

            if (
                [...select.options]
                    .some(
                        option =>
                            option.value ===
                            previous
                    )
            ) {

                select.value =
                    previous;

            }

        }
    );

}


function populateSnackSelect(selectId, category, selected = []) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select free snack";
    select.appendChild(placeholder);

    const choices = DEFAULT_SNACKS_BY_CATEGORY[category] || [];
    const selectedValue = Array.isArray(selected) && selected.length ? selected[0] : "";

    choices.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        option.selected = name === selectedValue;
        select.appendChild(option);
    });
}

function toggleSnackConfig(mode) {
    const categoryEl = document.getElementById(mode === "new" ? "newDrinkCategory" : "editDrinkCategory");
    const group = document.getElementById(mode === "new" ? "newSnackGroup" : "editSnackGroup");
    const selectId = mode === "new" ? "newDrinkSnacks" : "editDrinkSnacks";
    if (!categoryEl || !group) return;
    const show = categoryHasFreeSnack(categoryEl.value);
    group.style.display = show ? "block" : "none";
    if (show) {
        let selected = [];
        if (mode === "edit") {
            const drink = drinks.find(d => d.id === document.getElementById("editDrinkSelect")?.value);
            selected = getDrinkSnackChoices(drink);
        } else selected = [];
        populateSnackSelect(selectId, categoryEl.value, selected);
    }
}

function selectedSnackValues(selectId) {
    const el = document.getElementById(selectId);
    if (!el || !el.value) return [];
    return [el.value];
}

function updateOrderSnackChoices() {
    const drink = drinks.find(d => d.id === document.getElementById("drinkSelect")?.value);
    const group = document.getElementById("orderSnackGroup");
    const select = document.getElementById("orderSnackSelect");
    if (!group || !select) return;
    const choices = getDrinkSnackChoices(drink);
    group.style.display = choices.length ? "block" : "none";
    select.innerHTML = "";
    choices.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = `Free Snack: ${name}`;
        select.appendChild(option);
    });
}

/* =========================================================
   ADD NEW DRINK
========================================================= */

async function handleAddDrink() {

    const nameInput =
        document.getElementById(
            "newDrinkName"
        );

    const categoryInput =
        document.getElementById(
            "newDrinkCategory"
        );

    const stockInput =
        document.getElementById(
            "newDrinkStock"
        );

    const priceInput =
        document.getElementById(
            "newDrinkPrice"
        );

    if (
        !nameInput ||
        !categoryInput ||
        !stockInput ||
        !priceInput
    ) {
        return;
    }

    const name =
        nameInput.value.trim();

    const category =
        categoryInput.value ||
        "Other";

    const stock =
        parseInt(
            stockInput.value
        );

    const price =
        parseFloat(
            priceInput.value
        );

    if (
        !name ||
        isNaN(stock) ||
        isNaN(price) ||
        stock < 0 ||
        price < 0
    ) {

        showMsg(

            "addDrinkMsg",

            "Enter a valid drink name, stock quantity, and price.",

            "warn"

        );

        return;
    }

    if (categoryHasFreeSnack(category) && selectedSnackValues("newDrinkSnacks").length === 0) {
        showMsg("addDrinkMsg", "Select a free snack for this drink.", "warn");
        return;
    }

    const confirmed =
        await showActionConfirmation(
            "Add Drink?",
            `Add ${name} to the inventory?`,
            "Add Drink"
        );

    if (!confirmed) {
        return;
    }


    const drink = {

        id:
            `D${nextDrinkId}`,

        category:
            category,

        freeSnacks: categoryHasFreeSnack(category) ? selectedSnackValues("newDrinkSnacks") : [],

        name:
            name,

        price:
            price,

        stock:
            stock,

        status:
            stock > 0
                ? "Available"
                : "Out of Stock"

    };

    nextDrinkId++;

    drinks.push(
        drink
    );

    showMsg(
        "addDrinkMsg",
        `${name} was added to the inventory successfully.`,
        "success"
    );

    nameInput.value = "";

    stockInput.value = "10";

    priceInput.value = "50";

    showMsg(

        "addDrinkMsg",

        `${name} was added to the inventory.`,

        "success"

    );

    renderInventory();

    populateAllSelects();

}


/* =========================================================
   LOAD DRINK FOR EDITING
========================================================= */

function loadDrinkForEdit() {

    const select =
        document.getElementById(
            "editDrinkSelect"
        );

    if (!select) {
        return;
    }

    const drink =
        drinks.find(
            item =>
                item.id ===
                select.value
        );

    if (!drink) {
        return;
    }

    const nameInput =
        document.getElementById(
            "editDrinkName"
        );

    const categoryInput =
        document.getElementById(
            "editDrinkCategory"
        );

    const priceInput =
        document.getElementById(
            "editDrinkPrice"
        );

    const stockInput =
        document.getElementById(
            "editDrinkStock"
        );

    if (nameInput) {
        nameInput.value =
            drink.name;
    }

    if (categoryInput) {
        categoryInput.value =
            drink.category ||
            "Other";
    }

    if (priceInput) {
        priceInput.value =
            drink.price;
    }

    if (stockInput) {
        stockInput.value =
            drink.stock;
    }

    toggleSnackConfig("edit");

}


/* =========================================================
   EDIT DRINK
========================================================= */

async function handleEditDrink() {

    const select =
        document.getElementById(
            "editDrinkSelect"
        );

    if (!select) {
        return;
    }

    const drink =
        drinks.find(
            item =>
                item.id ===
                select.value
        );

    if (!drink) {

        showMsg(

            "editDrinkMsg",

            "Select a drink to restock or edit.",

            "warn"

        );

        return;
    }

    const name =
        document
            .getElementById(
                "editDrinkName"
            )
            .value
            .trim();

    const category =
        document
            .getElementById(
                "editDrinkCategory"
            )
            .value ||
        "Other";

    const price =
        parseFloat(
            document
                .getElementById(
                    "editDrinkPrice"
                )
                .value
        );

    const stock =
        parseInt(
            document
                .getElementById(
                    "editDrinkStock"
                )
                .value
        );

    if (
        !name ||
        isNaN(price) ||
        isNaN(stock) ||
        price < 0 ||
        stock < 0
    ) {

        showMsg(

            "editDrinkMsg",

            "Enter valid drink information and stock quantity.",

            "warn"

        );

        return;
    }

    if (categoryHasFreeSnack(category) && selectedSnackValues("editDrinkSnacks").length === 0) {
        showMsg("editDrinkMsg", "Select a free snack for this drink.", "warn");
        return;
    }

    const confirmed =
        await showActionConfirmation(
            "Save Changes?",
            `Apply the changes to ${drink.name}?`,
            "Save Changes"
        );

    if (!confirmed) {
        return;
    }


    drink.name =
        name;

    drink.category =
        category;

    drink.freeSnacks = categoryHasFreeSnack(category) ? selectedSnackValues("editDrinkSnacks") : [];

    drink.price =
        price;

    drink.stock =
        stock;

    syncDrinkStatus(
        drink
    );

    renderInventory();

    populateAllSelects();

    showMsg(
        "editDrinkMsg",
        `${drink.name} was updated successfully.`,
        "success"
    );

}


/* =========================================================
   DELETE DRINK
========================================================= */

async function handleDeleteDrink() {

    const select =
        document.getElementById(
            "editDrinkSelect"
        );

    if (!select) {
        return;
    }

    const index =
        drinks.findIndex(
            drink =>
                drink.id ===
                select.value
        );

    if (index === -1) {

        showMsg(

            "editDrinkMsg",

            "Select a drink to delete.",

            "warn"

        );

        return;
    }

    const drink =
        drinks[index];

    const confirmed =
        await showActionConfirmation(
            "Delete Drink?",
            `Delete "${drink.name}" from the inventory? This action cannot be undone.`,
            "Delete"
        );

    if (!confirmed) {
        return;
    }

    drinks.splice(
        index,
        1
    );

    showMsg(
        "editDrinkMsg",
        `${drink.name} was deleted from the inventory.`,
        "success"
    );

    renderInventory();

    populateAllSelects();

}


/* =========================================================
   POPULATE DRINK SELECTS
========================================================= */

function populateDrinkSelect() {

    const ids = [
        "drinkSelect",
        "editDrinkSelect"
    ];

    ids.forEach(
        id => {

            const select =
                document.getElementById(
                    id
                );

            if (!select) {
                return;
            }

            const previous =
                select.value;

            select.innerHTML =
                "";

            const list =
                id === "drinkSelect"

                ?

                drinks.filter(
                    drink =>
                        drink.status ===
                            "Available"
                        &&
                        drink.stock > 0
                )

                :

                drinks;

            list.forEach(
                drink => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        drink.id;

                    if (
                        id ===
                        "drinkSelect"
                    ) {

                        option.textContent =
                            `${drink.name} \u2014 \u20B1${drink.price} \u2014 Stock: ${drink.stock}`;

                    }

                    else {

                        option.textContent =
                            `${drink.name} \u2014 Stock: ${drink.stock}`;

                    }

                    select.appendChild(
                        option
                    );

                }
            );

            if (
                [...select.options]
                    .some(
                        option =>
                            option.value ===
                            previous
                    )
            ) {

                select.value =
                    previous;

            }

        }
    );

    loadDrinkForEdit();
    updateOrderSnackChoices();

}


/* =========================================================
   POPULATE DRINK ORDER TARGET
========================================================= */

function populateDrinkOrderTargetSelect() {

    const select =
        document.getElementById(
            "drinkOrderTarget"
        );

    if (!select) {
        return;
    }

    const previous =
        select.value;

    select.innerHTML = "";

    const newOrderOption =
        document.createElement(
            "option"
        );

    newOrderOption.value =
        "new_drinkonly";

    newOrderOption.textContent =
        "New Drink-Only Order";

    select.appendChild(
        newOrderOption
    );


    Object.values(
        sessions
    ).forEach(
        session => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                "session:" +
                session.facilityId;

            option.textContent =
                `${session.facilityName} \u2014 ${session.customerName}`;

            select.appendChild(
                option
            );

        }
    );


    drinkOnlyOrders.forEach(
        order => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                "do:" +
                order.id;

            option.textContent =
                `Drink-Only ${order.id} (${order.drinks.length} item lines)`;

            select.appendChild(
                option
            );

        }
    );


    if (
        [...select.options]
            .some(
                option =>
                    option.value ===
                    previous
            )
    ) {

        select.value =
            previous;

    }

}


/* =========================================================
   PLACE DRINK ORDER
========================================================= */

async function handleDrinkOrder() {

    const targetInput =
        document.getElementById(
            "drinkOrderTarget"
        );

    const drinkInput =
        document.getElementById(
            "drinkSelect"
        );

    const quantityInput =
        document.getElementById(
            "drinkQty"
        );

    if (
        !targetInput ||
        !drinkInput ||
        !quantityInput
    ) {
        return;
    }

    const target =
        targetInput.value;

    const drinkId =
        drinkInput.value;

    const quantity =
        parseInt(
            quantityInput.value
        );

    const drink =
        drinks.find(
            item =>
                item.id === drinkId
        );

    if (
        !drink ||
        isNaN(quantity) ||
        quantity <= 0
    ) {

        showMsg(

            "drinkOrderMsg",

            "Select a drink and enter a valid quantity.",

            "warn"

        );

        return;
    }

    if (
        drink.status ===
            "Out of Stock"

        ||

        drink.stock <
            quantity
    ) {

        showMsg(

            "drinkOrderMsg",

            `Not enough stock for ${drink.name}. Available stock: ${drink.stock}.`,

            "error"

        );

        return;
    }

    const snackName = categoryHasFreeSnack(drink.category)
        ? document.getElementById("orderSnackSelect")?.value
        : "";

    if (categoryHasFreeSnack(drink.category) && !snackName) {
        showMsg("drinkOrderMsg", "Select the free snack before placing this order.", "warn");
        return;
    }

    const confirmed =
        await showActionConfirmation(
            "Confirm Order",
            `Place ${quantity}x ${drink.name} for the selected order?`,
            "Place Order"
        );

    if (!confirmed) {
        return;
    }


    drink.stock -=
        quantity;

    syncDrinkStatus(
        drink
    );

    const line = {

        drinkId:
            drink.id,

        name:
            drink.name,

        qty:
            quantity,

        price:
            drink.price,

        freeSnack: snackName || null
    };


    /* ---------- NEW DRINK-ONLY ORDER ---------- */

    if (
        target ===
        "new_drinkonly"
    ) {

        const order = {

            id:
                `DO${String(nextDrinkOnlyId)
                    .padStart(3, "0")}`,

            drinks: [
                line
            ],

            createdAt:
                new Date()

        };

        nextDrinkOnlyId++;

        drinkOnlyOrders.push(
            order
        );

        showMsg(
            "drinkOrderMsg",
            `${quantity}x ${drink.name} was added to new drink-only order ${order.id}.`,
            "success"
        );

    }


    /* ---------- EXISTING DRINK-ONLY ORDER ---------- */

    else if (
        target.startsWith(
            "do:"
        )
    ) {

        const orderId =
            target.slice(3);

        const order =
            drinkOnlyOrders.find(
                item =>
                    item.id ===
                    orderId
            );

        if (!order) {

            drink.stock +=
                quantity;

            syncDrinkStatus(
                drink
            );

            showMsg(

                "drinkOrderMsg",

                "Drink-only order was not found.",

                "error"

            );

            return;
        }

        order.drinks.push(
            line
        );

        showMsg(
            "drinkOrderMsg",
            `${quantity}x ${drink.name} was added to ${order.id}.`,
            "success"
        );

    }


    /* ---------- ACTIVE SESSION ---------- */

    else if (
        target.startsWith(
            "session:"
        )
    ) {

        const facilityId =
            target.slice(8);

        const session =
            sessions[
                facilityId
            ];

        if (!session) {

            drink.stock +=
                quantity;

            syncDrinkStatus(
                drink
            );

            showMsg(

                "drinkOrderMsg",

                "Selected session no longer exists.",

                "error"

            );

            return;
        }

        session.drinks.push(
            line
        );

        showMsg(
            "drinkOrderMsg",
            `${quantity}x ${drink.name} was added to ${session.customerName}'s bill.`,
            "success"
        );

    }

    else {

        drink.stock +=
            quantity;

        syncDrinkStatus(
            drink
        );

        showMsg(

            "drinkOrderMsg",

            "Invalid order target.",

            "error"

        );

        return;
    }


    if (snackName) {
        expenses.push({
            id: `EXP${String(nextExpenseId++).padStart(3, "0")}`,
            createdAt: new Date(),
            source: drink.name,
            snack: snackName,
            qty: quantity,
            unitCost: Number(SNACK_CATALOG[snackName] || 0),
            total: Number(SNACK_CATALOG[snackName] || 0) * quantity,
            status: "Unpaid",
            paidAt: null
        });
        renderExpenses();
    }

    quantityInput.value =
        "1";

    renderInventory();

    populateAllSelects();

    renderBillPreview();

}


/* =========================================================
   DRINK SEARCH
========================================================= */

function handleDrinkSearch() {

    const input =
        document.getElementById(
            "drinkSearchInput"
        );

    if (!input) {
        return;
    }

    const query =
        input
            .value
            .trim()
            .toLowerCase();

    if (!query) {

        renderInventory();

        return;
    }

    const found =
        drinks.filter(
            drink =>

                drink.name
                    .toLowerCase()
                    .includes(query)

                ||

                drink.category
                    .toLowerCase()
                    .includes(query)
        );

    if (
        found.length > 0
    ) {

    }

    else {

        showMsg(

            "drinkSearchMsg",

            "No matching drinks found.",

            "error"

        );

    }

    renderInventory();

}


/* =========================================================
   RENDER INVENTORY
========================================================= */

function renderInventory() {

    const tbody =
        document.getElementById(
            "inventoryBody"
        );

    if (!tbody) {
        return;
    }

    const searchInput =
        document.getElementById(
            "drinkSearchInput"
        );

    const query =
        searchInput

        ?

        searchInput
            .value
            .trim()
            .toLowerCase()

        :

        "";

    let list =
        drinks;

    if (query) {

        list =
            drinks.filter(
                drink =>

                    drink.name
                        .toLowerCase()
                        .includes(query)

                    ||

                    drink.category
                        .toLowerCase()
                        .includes(query)
            );

    }

    tbody.innerHTML = "";

    if (
        list.length === 0
    ) {

        const row =
            document.createElement(
                "tr"
            );

        row.innerHTML = `

            <td
                colspan="5"
                class="emptyState"
            >
                No inventory items found.
            </td>

        `;

        tbody.appendChild(
            row
        );

        return;
    }

    list.forEach(
        drink => {

            syncDrinkStatus(
                drink
            );

            const row =
                document.createElement(
                    "tr"
                );

            let badgeClass =
                "free";

            if (
                drink.status ===
                "Out of Stock"
            ) {

                badgeClass =
                    "occupied";

            }

            else if (
                drink.stock <= 5
            ) {

                badgeClass =
                    "low";

            }

            row.innerHTML = `

                <td>
                    ${drink.category}
                </td>

                <td>

                    ${drink.name}

                    ${
                        CATEGORY_NOTES[
                            drink.category
                        ]

                        ?

                        `
                        <div class="small-note">
                            ${
                                CATEGORY_NOTES[
                                    drink.category
                                ]
                            }
                        </div>
                        `

                        :

                        ""
                    }

                </td>

                <td>
                    \u20B1${drink.price}
                </td>

                <td>
                    ${drink.stock}
                </td>

                <td>

                    <span
                        class="badge ${badgeClass}"
                    >
                        ${drink.status}
                    </span>

                </td>

            `;

            tbody.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   DRINK TOTAL HELPERS
========================================================= */

function calculateDrinkTotal(
    drinkLines
) {

    if (
        !Array.isArray(
            drinkLines
        )
    ) {

        return 0;

    }

    return drinkLines.reduce(
        (total, line) =>

            total +
            (
                Number(
                    line.price
                ) *
                Number(
                    line.qty
                )
            ),

        0
    );

}


/* =========================================================
   COMBINE SAME DRINK LINES
   Used for billing / receipt display.
========================================================= */

function combineDrinkLines(
    drinkLines
) {

    const combined = {};

    drinkLines.forEach(
        line => {

            const key =
                `${line.drinkId}-${line.price}`;

            if (
                !combined[key]
            ) {

                combined[key] = {

                    drinkId:
                        line.drinkId,

                    name:
                        line.name,

                    qty:
                        0,

                    price:
                        line.price

                };

            }

            combined[key].qty +=
                Number(
                    line.qty
                );

        }
    );

    return Object.values(
        combined
    );

}


/* =========================================================
   BILLING SELECT
========================================================= */

function populateBillingSelect() {

    const select =
        document.getElementById(
            "billTarget"
        );

    if (!select) {
        return;
    }

    const previous =
        select.value;

    select.innerHTML = "";


    const placeholder =
        document.createElement(
            "option"
        );

    placeholder.value = "";

    placeholder.textContent =
        "Select bill / order";

    select.appendChild(
        placeholder
    );


    Object.values(
        sessions
    ).forEach(
        session => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                "session:" +
                session.facilityId;

            option.textContent =
                `${session.facilityName} \u2014 ${session.customerName}` +
                (
                    session.actualEnd
                        ? " \u2014 Awaiting Payment"
                        : " \u2014 Active"
                );

            select.appendChild(
                option
            );

        }
    );


    drinkOnlyOrders.forEach(
        order => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                "do:" +
                order.id;

            option.textContent =
                `Drink-Only Order ${order.id}`;

            select.appendChild(
                option
            );

        }
    );


    if (
        [...select.options]
            .some(
                option =>
                    option.value ===
                    previous
            )
    ) {

        select.value =
            previous;

    }

}


/* =========================================================
   BILL PREVIEW
========================================================= */

function renderBillPreview() {

    const targetSelect =
        document.getElementById(
            "billTarget"
        );

    const preview =
        document.getElementById(
            "billPreview"
        );

    if (
        !targetSelect ||
        !preview
    ) {
        return;
    }

    const target =
        targetSelect.value;

    if (!target) {
    preview.innerHTML = "";
    return;
}


    /* =====================================================
       SESSION BILL
    ===================================================== */

    if (
        target.startsWith(
            "session:"
        )
    ) {

        const facilityId =
            target.slice(8);

        const session =
            sessions[
                facilityId
            ];

        if (!session) {

            preview.innerHTML = `

                <div class="msg error">
                    Session not found.
                </div>

            `;

            return;
        }

        const now =
            new Date();

        const end =
            session.actualEnd ||
            now;

        const elapsedMs =
            end -
            session.actualStart;

        const actualMinutes =
            Math.max(
                0,
                Math.round(
                    elapsedMs /
                    60000
                )
            );

        const extensionBilling =
            getProratedExtensionBilling(
                session,
                actualMinutes
            );

        const sessionFee =
            session.baseSessionPrice
            +
            extensionBilling
                .totalExtensionCost;

        const drinksCombined =
            combineDrinkLines(
                session.drinks
            );

        const drinksTotal =
            calculateDrinkTotal(
                session.drinks
            );

        const grandTotal =
            sessionFee +
            drinksTotal;


        let drinkRows = "";

        if (
            drinksCombined.length
            === 0
        ) {

            drinkRows = `

                <tr>

                    <td colspan="4">
                        No drink orders
                    </td>

                </tr>

            `;

        }

        else {

            drinksCombined.forEach(
                line => {

                    drinkRows += `

                        <tr>

                            <td>
                                ${line.name}
                            </td>

                            <td>
                                ${line.qty}
                            </td>

                            <td>
                                \u20B1${line.price}
                            </td>

                            <td>
                                \u20B1${line.qty * line.price}
                            </td>

                        </tr>

                    `;

                }
            );

        }


        let extensionText =
            "";

        if (
            session.extensions.length >
            0
        ) {

            extensionText =
                extensionBilling.items
                    .map(
                        item => {

                            if (
                                item.prorated
                            ) {

                                return (
                                    `${minutesToHM(item.minutes)} extension ` +
                                    `(${item.usedMinutes} min used) = \u20B1${item.price}`
                                );

                            }

                            return (
                                `${minutesToHM(item.minutes)} = \u20B1${item.price}`
                            );

                        }
                    )
                    .join("<br>");

        }

        else {

            extensionText =
                "No extensions";

        }


        preview.innerHTML = `

            <div class="card">

                <h3>
                    ${session.facilityName}
                    \u2014 ${session.customerName}
                </h3>

                <div class="small-note">

                    Source:
                    ${session.sourceType}

                    <br>

                    Start:
                    ${fmtDateTime(
                        session.actualStart
                    )}

                    <br>

                    ${
                        session.actualEnd

                        ?

                        `Ended:
                        ${fmtDateTime(
                            session.actualEnd
                        )}`

                        :

                        "Session is still active"
                    }

                    <br>

                    Actual Playing Time:
                    ${minutesToHM(
                        actualMinutes
                    )}

                </div>

                <hr>

                <table>

                    <tbody>

                        <tr>

                            <th>
                                Base Session
                            </th>

                            <td>
                                ${minutesToHM(
                                    session.bookedDurationMinutes
                                )}
                            </td>

                            <td>
                                \u20B1${session.baseSessionPrice}
                            </td>

                        </tr>

                        <tr>

                            <th>
                                Extensions
                            </th>

                            <td>
                                ${extensionText}
                            </td>

                            <td>
                                \u20B1${extensionBilling.totalExtensionCost}
                            </td>

                        </tr>

                        <tr>

                            <th>
                                Session Total
                            </th>

                            <td></td>

                            <td>
                                <b>
                                    \u20B1${sessionFee}
                                </b>
                            </td>

                        </tr>

                    </tbody>

                </table>

                <h3>
                    Drinks
                </h3>

                <table>

                    <thead>

                        <tr>

                            <th>
                                Item
                            </th>

                            <th>
                                Qty
                            </th>

                            <th>
                                Price
                            </th>

                            <th>
                                Total
                            </th>

                        </tr>

                    </thead>

                    <tbody>
                        ${drinkRows}
                    </tbody>

                </table>

                <div class="billingGrandTotal">
                    Grand Total:
                    \u20B1${grandTotal}

                </div>

            </div>

        `;

    }


    /* =====================================================
       DRINK-ONLY BILL
    ===================================================== */

    else if (
        target.startsWith(
            "do:"
        )
    ) {

        const orderId =
            target.slice(3);

        const order =
            drinkOnlyOrders.find(
                item =>
                    item.id ===
                    orderId
            );

        if (!order) {

            preview.innerHTML = `

                <div class="msg error">
                    Drink-only order not found.
                </div>

            `;

            return;
        }

        const combined =
            combineDrinkLines(
                order.drinks
            );

        const total =
            calculateDrinkTotal(
                order.drinks
            );

        let rows = "";

        combined.forEach(
            line => {

                rows += `

                    <tr>

                        <td>
                            ${line.name}
                        </td>

                        <td>
                            ${line.qty}
                        </td>

                        <td>
                            \u20B1${line.price}
                        </td>

                        <td>
                            \u20B1${line.qty * line.price}
                        </td>

                    </tr>

                `;

            }
        );


        preview.innerHTML = `

            <div class="card">

                <h3>
                    Drink-Only Order
                    ${order.id}
                </h3>

                <div class="small-note">

                    Created:
                    ${fmtDateTime(
                        order.createdAt
                    )}

                </div>

                <table>

                    <thead>

                        <tr>

                            <th>
                                Item
                            </th>

                            <th>
                                Qty
                            </th>

                            <th>
                                Price
                            </th>

                            <th>
                                Total
                            </th>

                        </tr>

                    </thead>

                    <tbody>
                        ${rows}
                    </tbody>

                </table>

                <div class="billingGrandTotal">
                    Grand Total:
                    \u20B1${total}

                </div>

            </div>

        `;

    }

}

/* =========================================================
   BILLIARD & KTV MANAGEMENT SYSTEM
   script.js \u2014 PART 3 OF 3
   Continue directly after Part 2
========================================================= */


/* =========================================================
   GET CURRENT BILL INFORMATION
========================================================= */

function getCurrentBillData() {

    const targetSelect =
        document.getElementById("billTarget");

    if (!targetSelect) {
        return null;
    }

    const target =
        targetSelect.value;

    if (!target) {
        return null;
    }


    /* =====================================================
       SESSION BILL
    ===================================================== */

    if (target.startsWith("session:")) {

        const facilityId =
            target.slice(8);

        const session =
            sessions[facilityId];

        if (!session) {
            return null;
        }

        const end =
            session.actualEnd ||
            new Date();

        const actualMinutes =
            Math.max(
                0,
                Math.round(
                    (
                        end -
                        session.actualStart
                    ) / 60000
                )
            );

        const extensionBilling =
            getProratedExtensionBilling(
                session,
                actualMinutes
            );

        const sessionTotal =
            session.baseSessionPrice +
            extensionBilling.totalExtensionCost;

        const drinksTotal =
            calculateDrinkTotal(
                session.drinks
            );

        const grandTotal =
            sessionTotal +
            drinksTotal;

        return {

            targetType:
                "Session",

            targetId:
                facilityId,

            customerName:
                session.customerName,

            facilityName:
                session.facilityName,

            facilityType:
                session.facilityType,

            sourceType:
                session.sourceType,

            sourceId:
                session.sourceId,

            actualStart:
                session.actualStart,

            actualEnd:
                session.actualEnd,

            actualMinutes:
                actualMinutes,

            bookedDurationMinutes:
                session.bookedDurationMinutes,

            baseSessionPrice:
                session.baseSessionPrice,

            extensions:
                extensionBilling.items,

            extensionTotal:
                extensionBilling.totalExtensionCost,

            sessionTotal:
                sessionTotal,

            drinks:
                combineDrinkLines(
                    session.drinks
                ),

            drinksTotal:
                drinksTotal,

            grandTotal:
                grandTotal,

            originalSession:
                session

        };

    }


    /* =====================================================
       DRINK-ONLY BILL
    ===================================================== */

    if (target.startsWith("do:")) {

        const orderId =
            target.slice(3);

        const order =
            drinkOnlyOrders.find(
                item =>
                    item.id === orderId
            );

        if (!order) {
            return null;
        }

        const drinks =
            combineDrinkLines(
                order.drinks
            );

        const drinksTotal =
            calculateDrinkTotal(
                order.drinks
            );

        return {

            targetType:
                "Drink-Only",

            targetId:
                order.id,

            customerName:
                "Walk-In Customer",

            facilityName:
                "Drink-Only Order",

            facilityType:
                "-",

            sourceType:
                "Drink-Only",

            sourceId:
                order.id,

            actualStart:
                order.createdAt,

            actualEnd:
                new Date(),

            actualMinutes:
                0,

            bookedDurationMinutes:
                0,

            baseSessionPrice:
                0,

            extensions:
                [],

            extensionTotal:
                0,

            sessionTotal:
                0,

            drinks:
                drinks,

            drinksTotal:
                drinksTotal,

            grandTotal:
                drinksTotal,

            originalOrder:
                order

        };

    }

    return null;

}


/* =========================================================
   COMPLETE PAYMENT
========================================================= */


function resetBillingFormState() {
    const amountPaidInput = document.getElementById("amountPaid");
    const paymentMethodInput = document.getElementById("paymentMethod");
    const billMsg = document.getElementById("billMsg");
    const receiptActions = document.getElementById("receiptActions");

    if (amountPaidInput) amountPaidInput.value = "";
    if (paymentMethodInput) paymentMethodInput.value = "Cash";
    if (billMsg) {
        billMsg.className = "msg";
        billMsg.innerHTML = "";
    }
    if (receiptActions) receiptActions.innerHTML = "";
}

function showPaymentChange(transaction) {
    const billMsg = document.getElementById("billMsg");

    if (!billMsg) {
        return;
    }

    billMsg.className = "paymentChangeBox";
    billMsg.innerHTML = `
        <div class="paymentChangeLabel">CHANGE</div>
        <div class="paymentChangeAmount">₱${Number(transaction.change).toFixed(2)}</div>
        <div class="paymentChangeDetails">Payment completed • ${transaction.id}</div>
    `;
}


function handleCompletePayment() {

    const billData =
        getCurrentBillData();

    if (!billData) {

        showMsg(
            "billMsg",
            "Select a bill before completing payment.",
            "warn"
        );

        return;
    }

    const paymentMethodInput =
        document.getElementById(
            "paymentMethod"
        );

    const amountPaidInput =
        document.getElementById(
            "amountPaid"
        );

    if (
        !paymentMethodInput ||
        !amountPaidInput
    ) {
        return;
    }

    const paymentMethod =
        paymentMethodInput.value;

    const amountPaid =
        parseFloat(
            amountPaidInput.value
        );

    if (
        isNaN(amountPaid) ||
        amountPaid < 0
    ) {

        showMsg(
            "billMsg",
            "Enter a valid payment amount.",
            "warn"
        );

        return;
    }

    if (
        amountPaid <
        billData.grandTotal
    ) {

        showMsg(

            "billMsg",

            `Insufficient payment. Total is \u20B1${billData.grandTotal}.`,

            "error"

        );

        return;
    }


    /* -----------------------------------------
       For session billing, require End Session
       before payment.
    ----------------------------------------- */

    if (
        billData.targetType ===
        "Session"
    ) {

        const session =
            billData.originalSession;

        if (!session.actualEnd) {

            showMsg(

                "billMsg",

                "Please end the session before completing payment.",

                "warn"

            );

            return;
        }

    }


    const change =
        amountPaid -
        billData.grandTotal;


    const transaction = {

        id:
            `TR${String(nextTransId)
                .padStart(4, "0")}`,

        type:
            billData.targetType,

        customerName:
            billData.customerName,

        facilityName:
            billData.facilityName,

        facilityType:
            billData.facilityType,

        sourceType:
            billData.sourceType,

        sourceId:
            billData.sourceId,

        actualStart:
            billData.actualStart,

        actualEnd:
            billData.actualEnd,

        actualMinutes:
            billData.actualMinutes,

        bookedDurationMinutes:
            billData.bookedDurationMinutes,

        baseSessionPrice:
            billData.baseSessionPrice,

        extensions:
            billData.extensions.map(
                extension => ({
                    ...extension
                })
            ),

        extensionTotal:
            billData.extensionTotal,

        sessionTotal:
            billData.sessionTotal,

        drinks:
            billData.drinks.map(
                drink => ({
                    ...drink
                })
            ),

        drinksTotal:
            billData.drinksTotal,

        grandTotal:
            billData.grandTotal,

        paymentMethod:
            paymentMethod,

        amountPaid:
            amountPaid,

        change:
            change,

        paidAt:
            new Date(),

        processedBy:
            loggedInUser
                ? loggedInUser.name
                : "Unknown"

    };


    nextTransId++;


    /* Stack behavior:
       newest transaction is stored first.
    */

    transactions.unshift(
        transaction
    );


    /* =====================================================
       REMOVE PAID ITEM FROM ACTIVE BILLING
    ===================================================== */

    if (
        billData.targetType ===
        "Session"
    ) {

        const facilityId =
            billData.targetId;

        const session =
            sessions[facilityId];


        /* Update reservation/walk-in source status */

        if (session) {

            if (
                session.sourceType ===
                "Reservation"
            ) {

                const reservation =
                    reservations.find(
                        item =>
                            item.id ===
                            session.sourceId
                    );

                if (reservation) {

                    reservation.status =
                        "Completed";

                }

            }


            if (
                session.sourceType ===
                "Walk-In"
            ) {

                const walkIn =
                    walkIns.find(
                        item =>
                            item.id ===
                            session.sourceId
                    );

                if (walkIn) {

                    walkIn.status =
                        "Completed";

                }

            }

        }


        delete sessions[
            facilityId
        ];

    }


    else if (
        billData.targetType ===
        "Drink-Only"
    ) {

        const index =
            drinkOnlyOrders.findIndex(
                order =>
                    order.id ===
                    billData.targetId
            );

        if (
            index !== -1
        ) {

            drinkOnlyOrders.splice(
                index,
                1
            );

        }

    }


    amountPaidInput.value =
        "";


    showPaymentChange(transaction);


    renderReceiptActions(
        transaction
    );

    populateAllSelects();

    renderDashboard();

    renderBilliardReservations();

    renderKTVReservations();

    renderWalkIns();

    renderHistory();

    renderSalesReport();

    renderBillPreview();

}


/* =========================================================
   RECEIPT ACTIONS
========================================================= */

function renderReceiptActions(
    transaction
) {

    const container =
        document.getElementById(
            "receiptActions"
        );

    if (!container) {
        return;
    }

    container.innerHTML = `

        <button
            class="secondary"
            onclick="generateReceiptPDF('${transaction.id}')"
        >
            Download Receipt PDF
        </button>

        <button
            class="secondary"
            onclick="openTransactionFromBilling('${transaction.id}')"
        >
            View Transaction
        </button>

    `;

}


/* =========================================================
   FIND TRANSACTION
========================================================= */


function openTransactionFromBilling(transactionId) {
    showTab("history");
    renderHistory();
    viewTransaction(transactionId);
}


function findTransactionById(
    transactionId
) {

    return transactions.find(
        transaction =>
            transaction.id ===
            transactionId
    );

}


/* =========================================================
   TRANSACTION HISTORY
========================================================= */

function renderHistory() {

    const tbody =
        document.getElementById(
            "historyBody"
        );

    if (!tbody) {
        return;
    }

    const searchInput =
        document.getElementById(
            "historySearchInput"
        );

    const query =
        searchInput

        ?

        searchInput
            .value
            .trim()
            .toLowerCase()

        :

        "";

    let list =
        transactions;


    if (query) {

        list =
            transactions.filter(
                transaction => {

                    const values = [

                        transaction.id,

                        transaction.type,

                        transaction.customerName,

                        transaction.facilityName,

                        transaction.facilityType,

                        transaction.paymentMethod,

                        transaction.sourceType

                    ];

                    return values.some(
                        value =>
                            String(
                                value || ""
                            )
                                .toLowerCase()
                                .includes(
                                    query
                                )
                    );

                }
            );

    }


    tbody.innerHTML =
        "";


    if (
        list.length === 0
    ) {

        const row =
            document.createElement(
                "tr"
            );

        row.innerHTML = `

            <td
                colspan="8"
                class="emptyState"
            >
                No transactions found.
            </td>

        `;

        tbody.appendChild(
            row
        );

        return;
    }


    list.forEach(
        transaction => {

            const row =
                document.createElement(
                    "tr"
                );

            row.innerHTML = `

                <td>
                    ${transaction.id}
                </td>

                <td>
                    ${transaction.type}
                </td>

                <td>
                    ${transaction.customerName}
                </td>

                <td>
                    ${transaction.facilityName}
                </td>

                <td>
                    \u20B1${transaction.grandTotal}
                </td>

                <td>
                    ${transaction.paymentMethod}
                </td>

                <td>
                    ${fmtDateTime(
                        transaction.paidAt
                    )}
                </td>

                <td>

                    <button
                            class="small secondary"
                            onclick="viewTransaction('${transaction.id}')"
                        >
                            View
                        </button>

                        <button
                        class="small secondary"
                        onclick="generateReceiptPDF('${transaction.id}')"
                    >
                        PDF
                    </button>

                </td>

            `;

            tbody.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   VIEW TRANSACTION DETAILS
========================================================= */

function viewTransaction(
    transactionId
) {

    const transaction =
        findTransactionById(
            transactionId
        );

    const detail =
        document.getElementById(
            "historyDetail"
        );

    if (
        !transaction ||
        !detail
    ) {
        return;
    }


    let drinkRows =
        "";


    if (
        transaction.drinks.length ===
        0
    ) {

        drinkRows = `

            <tr>

                <td colspan="4">
                    No drinks
                </td>

            </tr>

        `;

    }

    else {

        transaction.drinks.forEach(
            drink => {

                drinkRows += `

                    <tr>

                        <td>
                            ${drink.name}
                        </td>

                        <td>
                            ${drink.qty}
                        </td>

                        <td>
                            \u20B1${drink.price}
                        </td>

                        <td>
                            \u20B1${drink.qty * drink.price}
                        </td>

                    </tr>

                `;

            }
        );

    }


    let extensionRows =
        "";


    if (
        transaction.extensions.length ===
        0
    ) {

        extensionRows =
            "No extensions";

    }

    else {

        extensionRows =
            transaction.extensions
                .map(
                    extension => {

                        if (
                            extension.prorated
                        ) {

                            return (
                                `${minutesToHM(extension.minutes)} requested, ` +
                                `${extension.usedMinutes} minute(s) used \u2014 \u20B1${extension.price}`
                            );

                        }

                        return (
                            `${minutesToHM(extension.minutes)} \u2014 \u20B1${extension.price}`
                        );

                    }
                )
                .join("<br>");

    }


    detail.innerHTML = `

        <div class="card">

            <h3>
                Transaction
                ${transaction.id}
            </h3>

            <div class="small-note">

                Type:
                ${transaction.type}

                <br>

                Customer:
                ${transaction.customerName}

                <br>

                Facility:
                ${transaction.facilityName}

                <br>

                Source:
                ${transaction.sourceType}

                <br>

                Payment:
                ${transaction.paymentMethod}

                <br>

                Processed by:
                ${transaction.processedBy}

                <br>

                Paid:
                ${fmtDateTime(
                    transaction.paidAt
                )}

            </div>


            ${
                transaction.type ===
                "Session"

                ?

                `

                <hr>

                <b>
                    Session Details
                </b>

                <div
                    class="small-note"
                    style="margin-top:6px;"
                >

                    Start:
                    ${fmtDateTime(
                        transaction.actualStart
                    )}

                    <br>

                    End:
                    ${
                        transaction.actualEnd

                        ?

                        fmtDateTime(
                            transaction.actualEnd
                        )

                        :

                        "-"
                    }

                    <br>

                    Actual Playing Time:
                    ${minutesToHM(
                        transaction.actualMinutes
                    )}

                    <br>

                    Base Fee:
                    \u20B1${transaction.baseSessionPrice}

                    <br>

                    Extensions:
                    ${extensionRows}

                    <br>

                    Session Total:
                    \u20B1${transaction.sessionTotal}

                </div>

                `

                :

                ""
            }


            <h3>
                Drinks
            </h3>

            <table>

                <thead>

                    <tr>

                        <th>
                            Item
                        </th>

                        <th>
                            Qty
                        </th>

                        <th>
                            Price
                        </th>

                        <th>
                            Total
                        </th>

                    </tr>

                </thead>

                <tbody>
                    ${drinkRows}
                </tbody>

            </table>


            <div
                style="
                    margin-top:14px;
                    line-height:1.7;
                "
            >

                Drinks Total:
                <b>
                    \u20B1${transaction.drinksTotal}
                </b>

                <br>

                Grand Total:
                <b>
                    \u20B1${transaction.grandTotal}
                </b>

                <br>

                Amount Paid:
                \u20B1${transaction.amountPaid}

                <br>

                Change:
                \u20B1${transaction.change}

            </div>


            <div
                class="actions"
                style="margin-top:12px;"
            >

                <button
                    class="secondary"
                    onclick="generateReceiptPDF('${transaction.id}')"
                >
                    Download Receipt PDF
                </button>

            </div>

        </div>

    `;

}


/* =========================================================
   jsPDF HELPER
========================================================= */

function getPDFDocument() {

    if (
        !window.jspdf ||
        !window.jspdf.jsPDF
    ) {

        alert(
            "PDF library is not available. Make sure the jsPDF script is included in index.html."
        );

        return null;
    }

    const {
        jsPDF
    } = window.jspdf;

    return new jsPDF();

}


/* =========================================================
   SAFE PDF TEXT
========================================================= */

function pdfMoney(
    amount
) {

    return (
        "PHP " +
        Number(
            amount || 0
        ).toFixed(2)
    );

}


/* =========================================================
   GENERATE RECEIPT PDF
========================================================= */

function generateReceiptPDF(
    transactionId
) {

    const transaction =
        findTransactionById(
            transactionId
        );

    if (!transaction) {

        alert(
            "Transaction not found."
        );

        return;
    }

    const doc =
        getPDFDocument();

    if (!doc) {
        return;
    }

    let y =
        18;


    doc.setFontSize(
        16
    );

    doc.text(
        BUSINESS_NAME,
        14,
        y
    );


    y += 8;


    doc.setFontSize(
        12
    );

    doc.text(
        "Official Transaction Receipt",
        14,
        y
    );


    y += 10;


    doc.setFontSize(
        10
    );


    const addLine =
        text => {

            if (
                y > 275
            ) {

                doc.addPage();

                y = 18;

            }

            doc.text(
                String(text),
                14,
                y
            );

            y += 6;

        };


    addLine(
        `Transaction ID: ${transaction.id}`
    );

    addLine(
        `Type: ${transaction.type}`
    );

    addLine(
        `Customer: ${transaction.customerName}`
    );

    addLine(
        `Facility: ${transaction.facilityName}`
    );

    addLine(
        `Payment Method: ${transaction.paymentMethod}`
    );

    addLine(
        `Processed By: ${transaction.processedBy}`
    );

    addLine(
        `Paid At: ${fmtDateTime(transaction.paidAt)}`
    );


    if (
        transaction.type ===
        "Session"
    ) {

        y += 3;

        addLine(
            "SESSION"
        );

        addLine(
            `Start: ${fmtDateTime(transaction.actualStart)}`
        );

        addLine(
            `End: ${
                transaction.actualEnd
                    ? fmtDateTime(
                        transaction.actualEnd
                    )
                    : "-"
            }`
        );

        addLine(
            `Actual Time: ${minutesToHM(transaction.actualMinutes)}`
        );

        addLine(
            `Base Session: ${pdfMoney(transaction.baseSessionPrice)}`
        );


        transaction.extensions.forEach(
            (
                extension,
                index
            ) => {

                let description =
                    `Extension ${index + 1}: ` +
                    `${minutesToHM(extension.minutes)}`;

                if (
                    extension.prorated
                ) {

                    description +=
                        ` (${extension.usedMinutes} min used)`;

                }

                description +=
                    ` - ${pdfMoney(extension.price)}`;

                addLine(
                    description
                );

            }
        );


        addLine(
            `Session Total: ${pdfMoney(transaction.sessionTotal)}`
        );

    }


    y += 3;

    addLine(
        "DRINKS"
    );


    if (
        transaction.drinks.length ===
        0
    ) {

        addLine(
            "No drink orders."
        );

    }

    else {

        transaction.drinks.forEach(
            drink => {

                addLine(
                    `${drink.qty} x ${drink.name} @ ${pdfMoney(drink.price)} = ${pdfMoney(drink.qty * drink.price)}`
                );

            }
        );

    }


    y += 3;


    addLine(
        `Drinks Total: ${pdfMoney(transaction.drinksTotal)}`
    );

    addLine(
        `GRAND TOTAL: ${pdfMoney(transaction.grandTotal)}`
    );

    addLine(
        `Amount Paid: ${pdfMoney(transaction.amountPaid)}`
    );

    addLine(
        `Change: ${pdfMoney(transaction.change)}`
    );


    y += 5;


    addLine(
        "Thank you!"
    );


    doc.save(
        `${transaction.id}-receipt.pdf`
    );

}


/* =========================================================
   INVENTORY REPORT PDF
========================================================= */

function exportInventoryReportPDF() {

    const doc =
        getPDFDocument();

    if (!doc) {
        return;
    }

    let y =
        18;


    doc.setFontSize(
        16
    );

    doc.text(
        BUSINESS_NAME,
        14,
        y
    );


    y += 8;


    doc.setFontSize(
        12
    );

    doc.text(
        "Inventory Report",
        14,
        y
    );


    y += 7;


    doc.setFontSize(
        9
    );

    doc.text(
        `Generated: ${fmtDateTime(new Date())}`,
        14,
        y
    );


    y += 9;


    drinks.forEach(
        drink => {

            if (
                y > 275
            ) {

                doc.addPage();

                y = 18;

            }

            syncDrinkStatus(
                drink
            );

            const line =
                `${drink.id} | ${drink.category} | ${drink.name} | ` +
                `${pdfMoney(drink.price)} | Stock: ${drink.stock} | ${drink.status}`;

            const wrapped =
                doc.splitTextToSize(
                    line,
                    180
                );

            doc.text(
                wrapped,
                14,
                y
            );

            y +=
                wrapped.length * 5 +
                2;

        }
    );


    doc.save(
        "inventory-report.pdf"
    );

}


function getSnackCategoryLabel(name) {
    const inBuckets = DEFAULT_SNACKS_BY_CATEGORY.Buckets.includes(name);
    const inLiquor = DEFAULT_SNACKS_BY_CATEGORY.Liquor.includes(name);
    if (inBuckets && inLiquor) return "Both";
    if (inLiquor) return "Liquor";
    return "Buckets";
}

function setSnackCategory(name, category) {
    ["Buckets", "Liquor"].forEach(cat => {
        DEFAULT_SNACKS_BY_CATEGORY[cat] = DEFAULT_SNACKS_BY_CATEGORY[cat].filter(item => item !== name);
    });
    if (category === "Buckets" || category === "Both") DEFAULT_SNACKS_BY_CATEGORY.Buckets.push(name);
    if (category === "Liquor" || category === "Both") DEFAULT_SNACKS_BY_CATEGORY.Liquor.push(name);
}

function refreshSnackDependentUI() {
    drinks.forEach(drink => {
        if (!categoryHasFreeSnack(drink.category)) return;
        const allowed = new Set(DEFAULT_SNACKS_BY_CATEGORY[drink.category] || []);
        if (!Array.isArray(drink.freeSnacks)) drink.freeSnacks = [];
        drink.freeSnacks = drink.freeSnacks.filter(name => SNACK_CATALOG[name] !== undefined && allowed.has(name));
        if (!drink.freeSnacks.length) drink.freeSnacks = [...allowed];
    });
    toggleSnackConfig("new");
    if (document.getElementById("editDrinkSelect")?.value) toggleSnackConfig("edit");
    updateOrderSnackChoices();
}

function renderSnackCostSetup() {
    const box = document.getElementById("snackCostSetup");
    if (!box) return;
    box.innerHTML = "";
    const names = Object.keys(SNACK_CATALOG);
    if (!names.length) { box.innerHTML = `<div class="emptyState">No snacks configured yet.</div>`; return; }
    names.forEach(name => {
        const item = document.createElement("div");
        item.className = "snackCostItem";
        const safeName = name.replace(/'/g, "\\'");
        item.innerHTML = `<div class="snackSetupInfo"><strong>${name}</strong><span>${getSnackCategoryLabel(name)} • ₱${Number(SNACK_CATALOG[name]).toFixed(2)}</span></div><div class="snackSetupActions"><button class="secondary small" onclick="handleEditSnack('${safeName}')">Edit</button><button class="danger small" onclick="handleDeleteSnack('${safeName}')">Delete</button></div>`;
        box.appendChild(item);
    });
}

function handleAddSnack() {
    const nameEl=document.getElementById("newSnackName"), categoryEl=document.getElementById("newSnackCategory"), costEl=document.getElementById("newSnackCost");
    const name=(nameEl?.value||"").trim(), category=categoryEl?.value||"Buckets", cost=Number(costEl?.value);
    if(!name){showMsg("snackSetupMsg","Enter the snack name.","warn");return;}
    if(Object.keys(SNACK_CATALOG).some(x=>x.toLowerCase()===name.toLowerCase())){showMsg("snackSetupMsg","That snack already exists.","warn");return;}
    if(!Number.isFinite(cost)||cost<0){showMsg("snackSetupMsg","Enter a valid snack cost.","warn");return;}
    SNACK_CATALOG[name]=cost; setSnackCategory(name,category); nameEl.value=""; costEl.value="";
    renderSnackCostSetup(); refreshSnackDependentUI(); showMsg("snackSetupMsg",`${name} added successfully.`,"ok");
}

function handleEditSnack(oldName) {
    if(SNACK_CATALOG[oldName]===undefined)return;
    const currentCategory=getSnackCategoryLabel(oldName);
    const newName=(prompt("Snack name:",oldName)||"").trim(); if(!newName)return;
    if(Object.keys(SNACK_CATALOG).some(n=>n!==oldName&&n.toLowerCase()===newName.toLowerCase())){showMsg("snackSetupMsg","Another snack already uses that name.","warn");return;}
    const costInput=prompt("Snack cost:",String(SNACK_CATALOG[oldName])); if(costInput===null)return;
    const newCost=Number(costInput); if(!Number.isFinite(newCost)||newCost<0){showMsg("snackSetupMsg","Enter a valid snack cost.","warn");return;}
    const categoryInput=(prompt("Category: Buckets, Liquor, or Both",currentCategory)||"").trim().toLowerCase();
    const map={buckets:"Buckets",liquor:"Liquor",both:"Both","buckets & liquor":"Both"}; const newCategory=map[categoryInput];
    if(!newCategory){showMsg("snackSetupMsg","Category must be Buckets, Liquor, or Both.","warn");return;}
    if(newName!==oldName){
        delete SNACK_CATALOG[oldName]; SNACK_CATALOG[newName]=newCost;
        ["Buckets","Liquor"].forEach(cat=>DEFAULT_SNACKS_BY_CATEGORY[cat]=DEFAULT_SNACKS_BY_CATEGORY[cat].map(n=>n===oldName?newName:n));
        drinks.forEach(d=>{if(Array.isArray(d.freeSnacks))d.freeSnacks=d.freeSnacks.map(n=>n===oldName?newName:n);});
    } else SNACK_CATALOG[oldName]=newCost;
    setSnackCategory(newName,newCategory); renderSnackCostSetup(); refreshSnackDependentUI(); showMsg("snackSetupMsg",`${newName} updated successfully.`,"ok");
}

async function handleDeleteSnack(name) {
    if(SNACK_CATALOG[name]===undefined)return;
    const ok=await showActionConfirmation("Delete Snack?",`Delete ${name} from the snack setup and future drink choices? Existing expense records will stay unchanged.`,"Delete"); if(!ok)return;
    delete SNACK_CATALOG[name];
    ["Buckets","Liquor"].forEach(cat=>DEFAULT_SNACKS_BY_CATEGORY[cat]=DEFAULT_SNACKS_BY_CATEGORY[cat].filter(n=>n!==name));
    drinks.forEach(d=>{if(Array.isArray(d.freeSnacks))d.freeSnacks=d.freeSnacks.filter(n=>n!==name);});
    renderSnackCostSetup(); refreshSnackDependentUI(); showMsg("snackSetupMsg",`${name} deleted. Existing expense records were kept.`,"ok");
}

function renderExpenses() {
    const tbody = document.getElementById("expensesBody");
    if (!tbody) return;
    const status = document.getElementById("expenseStatusFilter")?.value || "All";
    const from = document.getElementById("expenseFrom")?.value || "";
    const to = document.getElementById("expenseTo")?.value || "";
    let list = expenses.filter(e => {
        const d = new Date(e.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
        return (status === "All" || e.status === status) && (!from || key >= from) && (!to || key <= to);
    });
    tbody.innerHTML = "";
    if (!list.length) tbody.innerHTML = `<tr><td colspan="9" class="emptyState">No expense records found.</td></tr>`;
    list.slice().reverse().forEach(e => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${e.id}</td><td>${fmtDateTime(e.createdAt)}</td><td>${e.source}</td><td>${e.snack}</td><td>${e.qty}</td><td>₱${Number(e.unitCost).toFixed(2)}</td><td>₱${Number(e.total).toFixed(2)}</td><td><span class="badge ${e.status === "Paid" ? "free" : "low"}">${e.status}</span></td><td>${e.status === "Unpaid" ? `<button class="small" onclick="markExpensePaid('${e.id}')">Mark Paid</button>` : `Paid ${e.paidAt ? fmtDateTime(e.paidAt) : ""}`}</td>`;
        tbody.appendChild(row);
    });
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    const startWeek = new Date(now); startWeek.setHours(0,0,0,0); startWeek.setDate(now.getDate() - now.getDay());
    const todayTotal = expenses.filter(e => { const d=new Date(e.createdAt); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`===todayKey; }).reduce((a,e)=>a+Number(e.total||0),0);
    const weekTotal = expenses.filter(e => new Date(e.createdAt) >= startWeek).reduce((a,e)=>a+Number(e.total||0),0);
    const unpaid = expenses.filter(e=>e.status==="Unpaid").reduce((a,e)=>a+Number(e.total||0),0);
    if(document.getElementById("expenseToday")) document.getElementById("expenseToday").textContent=`₱${todayTotal.toFixed(2)}`;
    if(document.getElementById("expenseWeek")) document.getElementById("expenseWeek").textContent=`₱${weekTotal.toFixed(2)}`;
    if(document.getElementById("expenseUnpaid")) document.getElementById("expenseUnpaid").textContent=`₱${unpaid.toFixed(2)}`;
}

async function markExpensePaid(id) {
    const expense = expenses.find(e=>e.id===id);
    if(!expense) return;
    const ok = await showActionConfirmation("Mark Expense Paid?", `Confirm payment of ₱${Number(expense.total).toFixed(2)} to the tapsilugan for ${expense.snack}.`, "Mark Paid");
    if(!ok) return;
    expense.status="Paid"; expense.paidAt=new Date();
    renderExpenses(); renderSalesReport();
}

/* =========================================================
   SALES REPORT PDF
========================================================= */

function renderSalesReport() {

    const tbody = document.getElementById("salesReportBody");

    if (!tbody) {
        return;
    }

    const searchInput = document.getElementById("salesReportSearchInput");
    const query = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    let list = transactions;

    if (query) {
        list = transactions.filter(transaction => {
            const values = [
                transaction.id,
                transaction.type,
                transaction.customerName,
                transaction.facilityName,
                transaction.facilityType,
                transaction.paymentMethod,
                transaction.sourceType
            ];

            return values.some(value =>
                String(value || "")
                    .toLowerCase()
                    .includes(query)
            );
        });
    }

    tbody.innerHTML = "";

    if (list.length === 0) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td colspan="7" class="emptyState">
                No completed transactions found.
            </td>
        `;

        tbody.appendChild(row);
    } else {
        list.forEach(transaction => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${transaction.id}</td>
                <td>${transaction.type}</td>
                <td>${transaction.customerName}</td>
                <td>${transaction.facilityName}</td>
                <td>₱${transaction.grandTotal}</td>
                <td>${transaction.paymentMethod}</td>
                <td>${fmtDateTime(transaction.paidAt)}</td>
            `;

            tbody.appendChild(row);
        });
    }

    // Manual accumulation for the Sales Report total.
    let totalSales = 0;

    for (let i = 0; i < list.length; i++) {
        totalSales += Number(list[i].grandTotal || 0);
    }

    const paidExpenses = expenses.filter(e => e.status === "Paid").reduce((sum, e) => sum + Number(e.total || 0), 0);
    const netSales = totalSales - paidExpenses;
    if (document.getElementById("salesSummaryTotal")) document.getElementById("salesSummaryTotal").textContent = `₱${totalSales.toFixed(2)}`;
    if (document.getElementById("salesSummaryExpenses")) document.getElementById("salesSummaryExpenses").textContent = `₱${paidExpenses.toFixed(2)}`;
    if (document.getElementById("salesSummaryNet")) document.getElementById("salesSummaryNet").textContent = `₱${netSales.toFixed(2)}`;

    const totalRow = document.createElement("tr");
    totalRow.className = "salesTotalRow";

    totalRow.innerHTML = `
        <td colspan="4">
            <strong>TOTAL (${list.length} Transaction${list.length === 1 ? "" : "s"})</strong>
        </td>
        <td colspan="3">
            <strong>₱${totalSales.toFixed(2)}</strong>
        </td>
    `;

    tbody.appendChild(totalRow);
}

function exportSalesReportPDF() {

    const fromInput =
        document.getElementById(
            "salesExportFrom"
        );

    const toInput =
        document.getElementById(
            "salesExportTo"
        );


    const fromValue =
        fromInput
            ? fromInput.value
            : "";

    const toValue =
        toInput
            ? toInput.value
            : "";


    if (
        !fromValue ||
        !toValue
    ) {

        showMsg(
            "salesExportMsg",
            "Please select both From and To dates before exporting.",
            "warn"
        );

        return;

    }


    if (
        fromValue >
        toValue
    ) {

        showMsg(
            "salesExportMsg",
            "The From date cannot be later than the To date.",
            "error"
        );

        return;

    }


    /*
       Manual traversal:
       Build the export list without using Array.filter().
       Only transactions inside the selected date range are included.
    */
    const exportTransactions = [];


    for (
        let i = 0;
        i < transactions.length;
        i++
    ) {

        const transaction =
            transactions[i];

        const paidDate =
            new Date(
                transaction.paidAt
            );


        if (
            Number.isNaN(
                paidDate.getTime()
            )
        ) {

            continue;

        }


        const year =
            paidDate.getFullYear();

        const month =
            String(
                paidDate.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                paidDate.getDate()
            ).padStart(2, "0");

        const transactionDate =
            `${year}-${month}-${day}`;


        if (
            transactionDate >= fromValue &&
            transactionDate <= toValue
        ) {

            exportTransactions.push(
                transaction
            );

        }

    }


    const doc =
        getPDFDocument();

    if (!doc) {
        return;
    }


    let y = 18;


    doc.setFontSize(16);

    doc.text(
        BUSINESS_NAME,
        14,
        y
    );


    y += 8;


    doc.setFontSize(12);

    doc.text(
        "Sales / Transaction Report",
        14,
        y
    );


    y += 7;


    doc.setFontSize(9);

    doc.text(
        `Period: ${fromValue} to ${toValue}`,
        14,
        y
    );


    y += 6;


    doc.text(
        `Generated: ${fmtDateTime(new Date())}`,
        14,
        y
    );


    y += 10;


    let totalSales = 0;


    for (
        let i = 0;
        i < exportTransactions.length;
        i++
    ) {

        totalSales +=
            Number(
                exportTransactions[i]
                    .grandTotal || 0
            );

    }


    doc.text(
        `Total Transactions: ${exportTransactions.length}`,
        14,
        y
    );


    y += 6;


    doc.text(
        `Total Sales: ${pdfMoney(totalSales)}`,
        14,
        y
    );


    y += 10;


    if (
        exportTransactions.length === 0
    ) {

        doc.text(
            "No transactions recorded for the selected date range.",
            14,
            y
        );

    } else {

        for (
            let i = 0;
            i < exportTransactions.length;
            i++
        ) {

            const transaction =
                exportTransactions[i];


            if (y > 270) {

                doc.addPage();

                y = 18;

            }


            const line =
                `${transaction.id} | ` +
                `${transaction.type} | ` +
                `${transaction.customerName} | ` +
                `${transaction.facilityName} | ` +
                `${pdfMoney(transaction.grandTotal)} | ` +
                `${transaction.paymentMethod} | ` +
                `${fmtDateTime(transaction.paidAt)}`;


            const wrapped =
                doc.splitTextToSize(
                    line,
                    180
                );


            doc.text(
                wrapped,
                14,
                y
            );


            y +=
                wrapped.length *
                5 +
                3;

        }

    }


    showMsg(
        "salesExportMsg",
        `Exported ${exportTransactions.length} transaction${exportTransactions.length === 1 ? "" : "s"} from ${fromValue} to ${toValue}.`,
        "success"
    );


    doc.save(
        `sales-report-${fromValue}-to-${toValue}.pdf`
    );

}

/* =========================================================
   POPULATE ALL SELECTS
========================================================= */

function populateAllSelects() {

    populateFacilitySelect(
        "bResFacilitySelect",
        "Billiard"
    );

    populateFacilitySelect(
        "kResFacilitySelect",
        "KTV"
    );

    populateCategorySelects();

    populateDrinkSelect();

    populateDrinkOrderTargetSelect();

    populateBillingSelect();

}


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

    renderDashboard();

    renderBilliardReservations();

    renderKTVReservations();

    renderWalkIns();

    renderInventory();

    renderHistory();

    renderSalesReport();

    renderStaff();

    populateAllSelects();

}


/* =========================================================
   ENTER KEY LOGIN
========================================================= */

function setupLoginEnterKey() {

    const username =
        document.getElementById(
            "loginUsername"
        );

    const password =
        document.getElementById(
            "loginPassword"
        );


    if (username) {

        username.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    handleLogin();

                }

            }
        );

    }


    if (password) {

        password.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    handleLogin();

                }

            }
        );

    }

}


/* =========================================================
   RESERVATION PRICE PREVIEW
========================================================= */

function updateReservationPricePreview(
    type
) {

    let durationId;
    let outputId;


    if (
        type === "Billiard"
    ) {

        durationId =
            "bResDurationSelect";

        outputId =
            "billiardPricePreview";

    }

    else {

        durationId =
            "kResDurationSelect";

        outputId =
            "ktvPricePreview";

    }


    const durationElement =
        document.getElementById(
            durationId
        );

    const outputElement =
        document.getElementById(
            outputId
        );


    if (
        !durationElement ||
        !outputElement
    ) {
        return;
    }


    const duration =
        parseInt(
            durationElement.value
        );


    if (
        !duration ||
        isNaN(duration)
    ) {

        outputElement.textContent =
            "";

        return;
    }


    const price =
        computePrice(
            type,
            duration
        );


    outputElement.textContent =
        `Estimated Price: \u20B1${price}`;

}


/* =========================================================
   SETUP RESERVATION PRICE LISTENERS
========================================================= */

function setupReservationPriceListeners() {

    const billiardDuration =
        document.getElementById(
            "bResDurationSelect"
        );

    const ktvDuration =
        document.getElementById(
            "kResDurationSelect"
        );


    if (billiardDuration) {

        billiardDuration.addEventListener(
            "change",
            () => {

                updateReservationPricePreview(
                    "Billiard"
                );

            }
        );

    }


    if (ktvDuration) {

        ktvDuration.addEventListener(
            "change",
            () => {

                updateReservationPricePreview(
                    "KTV"
                );

            }
        );

    }


    updateReservationPricePreview(
        "Billiard"
    );

    updateReservationPricePreview(
        "KTV"
    );

}


/* =========================================================
   BILL TARGET CHANGE
========================================================= */

function setupBillingListener() {

    const billTarget =
        document.getElementById(
            "billTarget"
        );

    if (!billTarget) {
        return;
    }


    billTarget.addEventListener(
        "change",
        () => {

            resetBillingFormState();
            renderBillPreview();

            showMsg(
                "billMsg",
                "",
                ""
            );

            const receiptActions =
                document.getElementById(
                    "receiptActions"
                );

            if (receiptActions) {

                receiptActions.innerHTML =
                    "";

            }

        }
    );

}


/* =========================================================
   INVENTORY SEARCH LISTENER
========================================================= */

function setupInventorySearch() {

    const search =
        document.getElementById(
            "drinkSearchInput"
        );

    if (!search) {
        return;
    }


    search.addEventListener(
        "input",
        () => {

            renderInventory();

        }
    );


    search.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                handleDrinkSearch();

            }

        }
    );

}


/* =========================================================
   HISTORY SEARCH LISTENER
========================================================= */

function setupHistorySearch() {

    const search =
        document.getElementById(
            "historySearchInput"
        );

    if (!search) {
        return;
    }


    search.addEventListener(
        "input",
        () => {

            renderHistory();

        }
    );

}



/* =========================================================
   CLEAR FORM NOTIFICATIONS WHEN USER EDITS INPUTS
========================================================= */

function clearFormMessage(messageId) {

    const message =
        document.getElementById(messageId);

    if (!message) {
        return;
    }

    message.textContent = "";
    message.className = "msg";

}

function setupFormMessageReset() {

    const groups = [
        {
            messageId: "bResMsg",
            fieldIds: [
                "bResCustomer",
                "bResContact",
                "bResFacilitySelect",
                "bResDate",
                "bResStartTime",
                "bResDurationSelect"
            ]
        },
        {
            messageId: "kResMsg",
            fieldIds: [
                "kResCustomer",
                "kResContact",
                "kResFacilitySelect",
                "kResDate",
                "kResStartTime",
                "kResDurationSelect"
            ]
        },
        {
            messageId: "wiMsg",
            fieldIds: [
                "wiCustomer",
                "wiFacilityType",
                "wiDurationSelect"
            ]
        }
    ];

    groups.forEach(group => {

        group.fieldIds.forEach(fieldId => {

            const field =
                document.getElementById(fieldId);

            if (!field) {
                return;
            }

            const eventName =
                field.tagName === "SELECT" ||
                field.type === "date" ||
                field.type === "time"
                    ? "change"
                    : "input";

            field.addEventListener(
                eventName,
                () => clearFormMessage(group.messageId)
            );

        });

    });

}

/* =========================================================
   MOBILE WINDOW HANDLING
========================================================= */

function setupResponsiveSidebar() {

    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth >
                820
            ) {

                toggleSidebar(
                    false
                );

            }

        }
    );

}


/* =========================================================
   INITIALIZE SYSTEM
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* -----------------------------------------
           Default reservation dates
        ----------------------------------------- */

        setReservationDefaultDates();


        /* -----------------------------------------
           Populate billiard tables
        ----------------------------------------- */

        populateFacilitySelect(
            "bResFacilitySelect",
            "Billiard"
        );


        /* -----------------------------------------
           Populate KTV room
        ----------------------------------------- */

        populateFacilitySelect(
            "kResFacilitySelect",
            "KTV"
        );


        /* -----------------------------------------
           Populate other selects
        ----------------------------------------- */

        populateCategorySelects();
        toggleSnackConfig("new");
        renderSnackCostSetup();
        renderExpenses();

        populateDrinkSelect();

        populateDrinkOrderTargetSelect();

        populateBillingSelect();


        /* -----------------------------------------
           Event listeners
        ----------------------------------------- */

        setupLoginEnterKey();

        setupReservationPriceListeners();

        setupFormMessageReset();

        setupBillingListener();

        setupInventorySearch();

        setupHistorySearch();

        setupResponsiveSidebar();


        /* -----------------------------------------
           Initial UI rendering
        ----------------------------------------- */

        renderBilliardReservations();

        renderKTVReservations();

        renderWalkIns();

        renderInventory();

        renderHistory();
        renderSalesReport();
        renderExpenses();

        renderStaff();


        /* -----------------------------------------
           Keep login screen visible initially
        ----------------------------------------- */

        const loginScreen =
            document.getElementById(
                "loginScreen"
            );

        const app =
            document.getElementById(
                "app"
            );


        if (loginScreen) {

            loginScreen.style.display =
                "flex";

        }


        if (app) {

            app.style.display =
                "none";

        }

    }
);


/* =========================================================
   END OF BILLIARD & KTV MANAGEMENT SYSTEM
========================================================= */
