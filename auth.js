/* ==========================================================================
   TRIPMATE - Auth System (auth.js)
   Frontend-only: localStorage-based auth + simulated OTP bot
   Includes validation limits, OTP expiry, retry rate limits & state-city sync
   ========================================================================== */

// --- CONSTANTS & LIMITS ---
const TM_USER_KEY         = 'tm_user';
const TM_SESSION_KEY      = 'tm_session';
const TM_OTP_KEY          = 'tm_otp';
const TM_OTP_TARGET       = 'tm_otp_target';
const TM_OTP_TIMESTAMP    = 'tm_otp_timestamp';
const TM_OTP_ATTEMPTS_KEY = 'tm_otp_attempts';

// Validation Limits
const LIMITS = {
    PHONE_LENGTH: 10,
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 64,
    MIN_AGE: 13,
    MAX_AGE: 100,
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 50,
    MAX_OTP_ATTEMPTS: 3,
    OTP_EXPIRY_MS: 5 * 60 * 1000, // 5 minutes
    RESEND_COOLDOWN_SEC: 30
};

let resendTimerInterval = null;

// --- OTP UTILITIES ---
function generateOTP() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

function saveOTP(otp, target) {
    sessionStorage.setItem(TM_OTP_KEY, otp);
    sessionStorage.setItem(TM_OTP_TARGET, target);
    sessionStorage.setItem(TM_OTP_TIMESTAMP, String(Date.now()));
    sessionStorage.setItem(TM_OTP_ATTEMPTS_KEY, '0');
}

function validateOTP(entered) {
    const storedOtp = sessionStorage.getItem(TM_OTP_KEY);
    const storedTimestamp = parseInt(sessionStorage.getItem(TM_OTP_TIMESTAMP) || '0', 10);
    const attempts = parseInt(sessionStorage.getItem(TM_OTP_ATTEMPTS_KEY) || '0', 10);

    // 1. Check if OTP is expired (5 min limit)
    if (!storedTimestamp || (Date.now() - storedTimestamp > LIMITS.OTP_EXPIRY_MS)) {
        return { valid: false, error: '⏳ OTP has expired (5 minute limit). Please resend a new OTP.' };
    }

    // 2. Check maximum retry attempts limit (3 attempts)
    if (attempts >= LIMITS.MAX_OTP_ATTEMPTS) {
        return { valid: false, error: '⛔ Maximum attempts exceeded. Please click Resend OTP for a new code.' };
    }

    // 3. Match check
    if (entered.trim() === storedOtp) {
        return { valid: true };
    } else {
        const nextAttempts = attempts + 1;
        sessionStorage.setItem(TM_OTP_ATTEMPTS_KEY, String(nextAttempts));
        const remaining = LIMITS.MAX_OTP_ATTEMPTS - nextAttempts;
        const msg = remaining > 0 
            ? `❌ Incorrect OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
            : '⛔ Maximum attempts exceeded. Please request a new OTP.';
        return { valid: false, error: msg };
    }
}

// --- USER PERSISTENCE ---
function saveUser(profileObj) {
    localStorage.setItem(TM_USER_KEY, JSON.stringify(profileObj));
}

function loadUser() {
    const raw = localStorage.getItem(TM_USER_KEY);
    return raw ? JSON.parse(raw) : null;
}

function isLoggedIn() {
    const s = localStorage.getItem(TM_SESSION_KEY);
    return s ? JSON.parse(s).active === true : false;
}

function startSession() {
    localStorage.setItem(TM_SESSION_KEY, JSON.stringify({ active: true, loginAt: Date.now() }));
}

function logout() {
    localStorage.removeItem(TM_SESSION_KEY);
    updateNavAuth();
    showToast('👋 You have been logged out.', 'info');
}

// --- TOAST NOTIFICATION ---
function showToast(msg, type = 'success') {
    let toast = document.getElementById('tm-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'tm-toast';
        document.body.appendChild(toast);
    }
    toast.className = `tm-toast tm-toast--${type} show`;
    toast.innerHTML = msg;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 4000);
}

// --- NAVBAR AUTH DISPLAY ---
function updateNavAuth() {
    const loggedIn = isLoggedIn();
    const user = loadUser();
    const loggedOutArea = document.getElementById('auth-logged-out');
    const loggedInArea  = document.getElementById('auth-logged-in');
    const userDisplayName = document.getElementById('user-display-name');
    const userInitials = document.getElementById('user-initials');

    if (loggedIn && user) {
        if (loggedOutArea) loggedOutArea.classList.add('hidden');
        if (loggedInArea)  loggedInArea.classList.remove('hidden');
        const firstName = (user.name || 'User').split(' ')[0];
        if (userDisplayName) userDisplayName.textContent = firstName;
        if (userInitials) {
            const parts = (user.name || 'U').split(' ');
            userInitials.textContent = (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
        }
    } else {
        if (loggedOutArea) loggedOutArea.classList.remove('hidden');
        if (loggedInArea)  loggedInArea.classList.add('hidden');
    }
}

// --- MODAL CONTROLS ---
const authModal = () => document.getElementById('auth-modal');

function openAuthModal(initialTab = 'login') {
    const modal = authModal();
    if (!modal) return;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    resetAuthModal();
    switchAuthTab(initialTab);
}

function closeAuthModal() {
    const modal = authModal();
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    resetAuthModal();
}

function resetStepPanels() {
    // Hide non-initial steps
    document.querySelectorAll('#login-otp-step, #login-success-step, #signup-otp-step, #signup-profile-step, #signup-success-step')
        .forEach(s => s.classList.remove('active'));
    // Activate credential steps
    document.getElementById('login-creds-step')?.classList.add('active');
    document.getElementById('signup-creds-step')?.classList.add('active');
}

function resetAuthModal() {
    // Clear form inputs
    document.querySelectorAll('#auth-modal input:not([readonly])').forEach(inp => {
        if (inp.type !== 'radio') inp.value = '';
    });
    // Clear select dropdowns
    document.querySelectorAll('#auth-modal select').forEach(sel => sel.selectedIndex = 0);
    // Hide error messages
    document.querySelectorAll('.auth-error').forEach(el => el.textContent = '');
    // Reset OTP boxes
    document.querySelectorAll('.otp-digit').forEach(inp => inp.value = '');
    // Reset step panels
    resetStepPanels();
    // Reset payment selection
    document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
    // Reset contact radio
    const phoneRadio = document.querySelector('input[name="contact-method"][value="phone"]');
    if (phoneRadio) phoneRadio.checked = true;
    toggleContactFields();
    // Clear temporary OTP state
    sessionStorage.removeItem(TM_OTP_KEY);
    sessionStorage.removeItem(TM_OTP_TARGET);
    sessionStorage.removeItem(TM_OTP_TIMESTAMP);
    sessionStorage.removeItem(TM_OTP_ATTEMPTS_KEY);
    // Hide bot bubbles
    document.querySelectorAll('.otp-bot-bubble').forEach(b => b.style.display = 'none');
    // Clear resend countdown
    if (resendTimerInterval) clearInterval(resendTimerInterval);
}

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    document.querySelectorAll('.auth-tab-panel').forEach(panel => {
        panel.classList.toggle('active', panel.dataset.tabPanel === tab);
    });
    resetStepPanels();
}

// --- OTP BOT BUBBLE RENDERER ---
function renderOTPBubble(channel, target, otp, panelType = 'signup') {
    const bubbleId = panelType === 'login' ? 'login-otp-bubble' : 'signup-otp-bubble';
    const bubble = document.getElementById(bubbleId);
    if (!bubble) return;
    const channelIcon = channel === 'email' ? '📧' : '📱';
    const channelLabel = channel === 'email' ? 'email' : 'phone number';

    bubble.style.display = 'block';
    bubble.innerHTML = `
        <div class="otp-bot-avatar"><i class="fa-solid fa-robot"></i></div>
        <div class="otp-bot-msg">
            <div class="otp-bot-sender">TripMate Bot <span class="otp-bot-badge">AI BOT</span></div>
            <div class="otp-bot-text">
                Hi there! ${channelIcon} I've sent a <strong>6-digit OTP verification code</strong> to your ${channelLabel} 
                <strong>${target}</strong>.<br><br>
                🔐 Your verification code is:
            </div>
            <div class="otp-code-display">${otp}</div>
            <div class="otp-bot-note">⏱️ Expires in <strong>5 minutes</strong>. Max <strong>3 attempts</strong> allowed.</div>
        </div>
    `;
    // Animate in
    bubble.style.opacity = '0';
    bubble.style.transform = 'translateY(10px)';
    setTimeout(() => {
        bubble.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        bubble.style.opacity = '1';
        bubble.style.transform = 'translateY(0)';
    }, 50);

    // Start 30s resend cooldown timer
    startResendCooldown();
}

function startResendCooldown() {
    const btns = document.querySelectorAll('.resend-otp-btn');
    let timeLeft = LIMITS.RESEND_COOLDOWN_SEC;
    btns.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.textContent = `Resend in ${timeLeft}s`;
    });

    if (resendTimerInterval) clearInterval(resendTimerInterval);
    resendTimerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            clearInterval(resendTimerInterval);
            btns.forEach(btn => {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.textContent = 'Resend OTP';
            });
        } else {
            btns.forEach(btn => {
                btn.textContent = `Resend in ${timeLeft}s`;
            });
        }
    }, 1000);
}

// --- OTP DIGIT INPUT NAVIGATION ---
function initOTPInputs() {
    const panels = ['login-otp-step', 'signup-otp-step'];
    panels.forEach(stepId => {
        const step = document.getElementById(stepId);
        if (!step) return;
        const digits = step.querySelectorAll('.otp-digit');
        digits.forEach((inp, i) => {
            inp.addEventListener('input', () => {
                inp.value = inp.value.replace(/\D/g, '').slice(-1);
                if (inp.value && i < digits.length - 1) digits[i + 1].focus();
            });
            inp.addEventListener('keydown', e => {
                if (e.key === 'Backspace' && !inp.value && i > 0) digits[i - 1].focus();
            });
            inp.addEventListener('paste', e => {
                e.preventDefault();
                const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
                digits.forEach((d, idx) => { d.value = text[idx] || ''; });
                if (digits[text.length - 1]) digits[text.length - 1].focus();
            });
        });
    });
}

function getEnteredOTP(panelId) {
    const container = document.getElementById(panelId);
    if (!container) return '';
    return Array.from(container.querySelectorAll('.otp-digit')).map(d => d.value).join('');
}

// --- CONTACT METHOD TOGGLE ---
function toggleContactFields() {
    const method = document.querySelector('input[name="contact-method"]:checked')?.value || 'phone';
    const phoneWrap = document.getElementById('signup-phone-wrap');
    const emailWrap = document.getElementById('signup-email-wrap');
    if (phoneWrap) phoneWrap.style.display = method === 'phone' ? 'block' : 'none';
    if (emailWrap) emailWrap.style.display = method === 'email' ? 'block' : 'none';
}

// --- VALIDATION HELPERS & LIMIT CHECKS ---
function isValidPhone(p) {
    const clean = p.replace(/\s+/g, '');
    return /^[6-9]\d{9}$/.test(clean);
}

function isValidEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());
}

function showError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
}

function clearError(id) {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
}

// =============================================================================
// --- SIGNUP FLOW ---
// =============================================================================
function handleSignupProceed() {
    clearError('signup-creds-error');
    const method = document.querySelector('input[name="contact-method"]:checked')?.value || 'phone';
    const phoneVal = document.getElementById('signup-phone')?.value.trim() || '';
    const emailVal = document.getElementById('signup-email')?.value.trim() || '';
    const pass = document.getElementById('signup-password')?.value || '';
    const pass2 = document.getElementById('signup-confirm-password')?.value || '';

    // Contact Limits
    if (method === 'phone') {
        if (!phoneVal) return showError('signup-creds-error', '❌ Please enter your mobile number.');
        if (!isValidPhone(phoneVal)) return showError('signup-creds-error', `❌ Phone must be exactly 10 digits starting with 6, 7, 8, or 9.`);
    }
    if (method === 'email') {
        if (!emailVal) return showError('signup-creds-error', '❌ Please enter your email address.');
        if (!isValidEmail(emailVal)) return showError('signup-creds-error', '❌ Please enter a valid email address (e.g. name@domain.com).');
    }

    // Password Limits
    if (pass.length < LIMITS.MIN_PASSWORD_LENGTH) {
        return showError('signup-creds-error', `❌ Password must be at least ${LIMITS.MIN_PASSWORD_LENGTH} characters.`);
    }
    if (pass.length > LIMITS.MAX_PASSWORD_LENGTH) {
        return showError('signup-creds-error', `❌ Password cannot exceed ${LIMITS.MAX_PASSWORD_LENGTH} characters.`);
    }
    if (pass !== pass2) {
        return showError('signup-creds-error', '❌ Passwords do not match. Please retype to confirm.');
    }

    // Check duplicate user
    const existing = loadUser();
    if (existing) {
        if (method === 'phone' && existing.phone === phoneVal) {
            return showError('signup-creds-error', '❌ This phone number is already registered. Please Login.');
        }
        if (method === 'email' && existing.email === emailVal) {
            return showError('signup-creds-error', '❌ This email is already registered. Please Login.');
        }
    }

    // Save temporary signup state
    const target = method === 'phone' ? phoneVal : emailVal;
    const otp = generateOTP();
    saveOTP(otp, target);
    sessionStorage.setItem('tm_signup_method', method);
    sessionStorage.setItem('tm_signup_phone', phoneVal);
    sessionStorage.setItem('tm_signup_email', emailVal);
    sessionStorage.setItem('tm_signup_pass', pass);

    // Transition to OTP step
    const panel = document.querySelector('[data-tab-panel="signup"]');
    if (!panel) return;
    panel.querySelectorAll('.auth-step').forEach(s => s.classList.remove('active'));
    const otpStep = document.getElementById('signup-otp-step');
    if (otpStep) otpStep.classList.add('active');

    // Render bot bubble
    renderOTPBubble(method, target, otp, 'signup');
    setTimeout(() => {
        const first = otpStep?.querySelector('.otp-digit');
        if (first) first.focus();
    }, 400);
}

function handleSignupVerifyOTP() {
    clearError('signup-otp-error');
    const entered = getEnteredOTP('signup-otp-step');
    if (entered.length < 6) return showError('signup-otp-error', '❌ Please enter all 6 digits of the OTP.');

    const res = validateOTP(entered);
    if (!res.valid) {
        document.querySelectorAll('#signup-otp-step .otp-digit').forEach(d => {
            d.value = '';
            d.classList.add('shake');
            setTimeout(() => d.classList.remove('shake'), 500);
        });
        return showError('signup-otp-error', res.error);
    }

    // Move to Profile step
    const panel = document.querySelector('[data-tab-panel="signup"]');
    panel?.querySelectorAll('.auth-step').forEach(s => s.classList.remove('active'));
    const profileStep = document.getElementById('signup-profile-step');
    if (profileStep) profileStep.classList.add('active');

    // Pre-populate known contact info
    const method = sessionStorage.getItem('tm_signup_method');
    if (method === 'phone') {
        const pfPhone = document.getElementById('profile-phone');
        if (pfPhone) pfPhone.value = sessionStorage.getItem('tm_signup_phone') || '';
    } else {
        const pfEmail = document.getElementById('profile-email');
        if (pfEmail) pfEmail.value = sessionStorage.getItem('tm_signup_email') || '';
    }
}

function handleSignupComplete() {
    clearError('signup-profile-error');
    const name   = document.getElementById('profile-name')?.value.trim() || '';
    const age    = parseInt(document.getElementById('profile-age')?.value || '0', 10);
    const phone  = document.getElementById('profile-phone')?.value.trim() || '';
    const email  = document.getElementById('profile-email')?.value.trim() || '';
    const city   = document.getElementById('profile-city')?.value.trim() || '';
    const state  = document.getElementById('profile-state')?.value || '';
    const selectedPayment = document.querySelector('.payment-option.selected');

    // Validation with limits
    if (!name || name.length < LIMITS.MIN_NAME_LENGTH) {
        return showError('signup-profile-error', `❌ Full name must be at least ${LIMITS.MIN_NAME_LENGTH} characters.`);
    }
    if (name.length > LIMITS.MAX_NAME_LENGTH) {
        return showError('signup-profile-error', `❌ Name cannot exceed ${LIMITS.MAX_NAME_LENGTH} characters.`);
    }
    if (isNaN(age) || age < LIMITS.MIN_AGE || age > LIMITS.MAX_AGE) {
        return showError('signup-profile-error', `❌ Age limit: must be between ${LIMITS.MIN_AGE} and ${LIMITS.MAX_AGE} years.`);
    }
    if (!isValidPhone(phone)) {
        return showError('signup-profile-error', '❌ Enter a valid 10-digit Indian mobile number.');
    }
    if (!isValidEmail(email)) {
        return showError('signup-profile-error', '❌ Enter a valid email address.');
    }
    if (!city || city.length < 2) {
        return showError('signup-profile-error', '❌ Please enter your city.');
    }
    if (!state) {
        return showError('signup-profile-error', '❌ Please select your state.');
    }
    if (!selectedPayment) {
        return showError('signup-profile-error', '❌ Please select your preferred payment method.');
    }

    const user = {
        name,
        age,
        phone,
        email,
        city,
        state,
        country: 'India',
        password: sessionStorage.getItem('tm_signup_pass'),
        paymentMethod: selectedPayment.dataset.method,
        createdAt: new Date().toISOString()
    };

    saveUser(user);
    startSession();

    // Success Screen
    const panel = document.querySelector('[data-tab-panel="signup"]');
    panel?.querySelectorAll('.auth-step').forEach(s => s.classList.remove('active'));
    const successStep = document.getElementById('signup-success-step');
    if (successStep) {
        successStep.classList.add('active');
        const parts = name.split(' ');
        const initials = (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
        const avatarEl = successStep.querySelector('.success-avatar');
        if (avatarEl) avatarEl.textContent = initials;
        const nameEl = successStep.querySelector('.success-name');
        if (nameEl) nameEl.textContent = name.split(' ')[0];
    }

    updateNavAuth();
    showToast(`🎉 Welcome to TripMate, ${name.split(' ')[0]}!`, 'success');

    // Cleanup session temporary data
    ['tm_signup_method', 'tm_signup_phone', 'tm_signup_email', 'tm_signup_pass', TM_OTP_KEY, TM_OTP_TARGET, TM_OTP_TIMESTAMP, TM_OTP_ATTEMPTS_KEY]
        .forEach(k => sessionStorage.removeItem(k));
}

// =============================================================================
// --- LOGIN FLOW ---
// =============================================================================
function handleLoginProceed() {
    clearError('login-creds-error');
    const identifier = document.getElementById('login-identifier')?.value.trim() || '';
    const pass = document.getElementById('login-password')?.value || '';

    if (!identifier) return showError('login-creds-error', '❌ Enter your phone number or email.');
    if (!pass) return showError('login-creds-error', '❌ Password is required.');

    const user = loadUser();
    if (!user) return showError('login-creds-error', '❌ No account found on this browser. Please Sign Up first.');

    const matchPhone = isValidPhone(identifier) && user.phone === identifier;
    const matchEmail = isValidEmail(identifier) && user.email.toLowerCase() === identifier.toLowerCase();

    if (!matchPhone && !matchEmail) {
        return showError('login-creds-error', '❌ Phone or email does not match any registered account.');
    }
    if (user.password !== pass) {
        return showError('login-creds-error', '❌ Incorrect password.');
    }

    // Generate & save OTP
    const target = matchPhone ? user.phone : user.email;
    const channel = matchPhone ? 'phone' : 'email';
    const otp = generateOTP();
    saveOTP(otp, target);

    // Transition to OTP step
    const panel = document.querySelector('[data-tab-panel="login"]');
    panel?.querySelectorAll('.auth-step').forEach(s => s.classList.remove('active'));
    const otpStep = document.getElementById('login-otp-step');
    if (otpStep) otpStep.classList.add('active');

    // Render bot bubble
    renderOTPBubble(channel, target, otp, 'login');
    setTimeout(() => {
        const first = otpStep?.querySelector('.otp-digit');
        if (first) first.focus();
    }, 400);
}

function handleLoginVerifyOTP() {
    clearError('login-otp-error');
    const entered = getEnteredOTP('login-otp-step');
    if (entered.length < 6) return showError('login-otp-error', '❌ Please enter all 6 digits.');

    const res = validateOTP(entered);
    if (!res.valid) {
        document.querySelectorAll('#login-otp-step .otp-digit').forEach(d => {
            d.value = '';
            d.classList.add('shake');
            setTimeout(() => d.classList.remove('shake'), 500);
        });
        return showError('login-otp-error', res.error);
    }

    startSession();
    const user = loadUser();

    // Success Screen
    const panel = document.querySelector('[data-tab-panel="login"]');
    panel?.querySelectorAll('.auth-step').forEach(s => s.classList.remove('active'));
    const successStep = document.getElementById('login-success-step');
    if (successStep) {
        successStep.classList.add('active');
        const parts = (user?.name || 'User').split(' ');
        const initials = (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
        const avatarEl = successStep.querySelector('.success-avatar');
        if (avatarEl) avatarEl.textContent = initials;
        const nameEl = successStep.querySelector('.success-name');
        if (nameEl) nameEl.textContent = (user?.name || 'Traveller').split(' ')[0];
    }

    updateNavAuth();
    showToast(`✨ Welcome back, ${(user?.name || 'Traveller').split(' ')[0]}!`, 'success');

    sessionStorage.removeItem(TM_OTP_KEY);
    sessionStorage.removeItem(TM_OTP_TARGET);
    sessionStorage.removeItem(TM_OTP_TIMESTAMP);
    sessionStorage.removeItem(TM_OTP_ATTEMPTS_KEY);
}

// --- RESEND OTP HANDLER ---
function handleResendOTP() {
    const target = sessionStorage.getItem(TM_OTP_TARGET);
    if (!target) {
        showToast('⚠️ Session expired. Please restart login/signup.', 'info');
        return;
    }
    const otp = generateOTP();
    saveOTP(otp, target);
    const channel = isValidEmail(target) ? 'email' : 'phone';

    const activePanel = document.querySelector('.auth-tab-panel.active')?.dataset.tabPanel || 'signup';
    renderOTPBubble(channel, target, otp, activePanel);

    // Clear digit inputs
    document.querySelectorAll('.otp-digit').forEach(d => d.value = '');
    clearError('login-otp-error');
    clearError('signup-otp-error');
    showToast('🔁 New OTP generated by TripMate Bot!', 'info');
}

// =============================================================================
// --- STATE & CITY DATASET INTEGRATION ---
// =============================================================================
function populateProfileStateDropdown() {
    const stateSelect = document.getElementById('profile-state');
    if (!stateSelect || typeof indianCitiesData === 'undefined') return;
    stateSelect.innerHTML = '<option value="">— Select State —</option>';
    Object.keys(indianCitiesData).sort().forEach(state => {
        const opt = document.createElement('option');
        opt.value = state;
        opt.textContent = state;
        stateSelect.appendChild(opt);
    });

    // When state changes, filter cities in datalist
    stateSelect.addEventListener('change', () => {
        const selectedState = stateSelect.value;
        populateProfileCityDatalist(selectedState);
    });
}

function populateProfileCityDatalist(filterState = null) {
    const datalist = document.getElementById('profile-city-list');
    if (!datalist || typeof indianCitiesData === 'undefined') return;
    datalist.innerHTML = '';

    if (filterState && indianCitiesData[filterState]) {
        indianCitiesData[filterState].forEach(c => {
            const opt = document.createElement('option');
            opt.value = typeof c === 'string' ? c : c.name;
            datalist.appendChild(opt);
        });
    } else {
        // All cities across India
        Object.values(indianCitiesData).forEach(cities => {
            cities.forEach(c => {
                const opt = document.createElement('option');
                opt.value = typeof c === 'string' ? c : c.name;
                datalist.appendChild(opt);
            });
        });
    }
}

// =============================================================================
// --- EVENT LISTENERS & INITIALIZATION ---
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar buttons
    document.getElementById('nav-login-btn')?.addEventListener('click', () => openAuthModal('login'));
    document.getElementById('nav-signup-btn')?.addEventListener('click', () => openAuthModal('signup'));
    document.getElementById('nav-logout-btn')?.addEventListener('click', logout);

    // 2. Modal close
    document.getElementById('auth-modal-close')?.addEventListener('click', closeAuthModal);
    document.getElementById('auth-modal')?.addEventListener('click', e => {
        if (e.target.id === 'auth-modal') closeAuthModal();
    });

    // 3. Tab switching
    document.querySelectorAll('.auth-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchAuthTab(btn.dataset.tab));
    });

    // 4. Contact method radio toggle
    document.querySelectorAll('input[name="contact-method"]').forEach(radio => {
        radio.addEventListener('change', toggleContactFields);
    });
    toggleContactFields();

    // 5. Password toggle show/hide buttons
    document.querySelectorAll('.toggle-pw-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (!input) return;
            const icon = btn.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                if (icon) { icon.classList.remove('fa-eye'); icon.classList.add('fa-eye-slash'); }
            } else {
                input.type = 'password';
                if (icon) { icon.classList.remove('fa-eye-slash'); icon.classList.add('fa-eye'); }
            }
        });
    });

    // 6. Signup flow triggers
    document.getElementById('signup-proceed-btn')?.addEventListener('click', handleSignupProceed);
    document.getElementById('signup-verify-otp-btn')?.addEventListener('click', handleSignupVerifyOTP);
    document.getElementById('signup-complete-btn')?.addEventListener('click', handleSignupComplete);
    document.getElementById('signup-done-btn')?.addEventListener('click', closeAuthModal);

    // 7. Login flow triggers
    document.getElementById('login-proceed-btn')?.addEventListener('click', handleLoginProceed);
    document.getElementById('login-verify-otp-btn')?.addEventListener('click', handleLoginVerifyOTP);
    document.getElementById('login-done-btn')?.addEventListener('click', closeAuthModal);

    // 8. Resend OTP buttons
    document.querySelectorAll('.resend-otp-btn').forEach(btn => {
        btn.addEventListener('click', handleResendOTP);
    });

    // 9. Payment method options
    document.querySelectorAll('.payment-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
        });
    });

    // 10. OTP 6-box input handling
    initOTPInputs();

    // 11. Profile State dropdown & City datalist
    populateProfileStateDropdown();
    populateProfileCityDatalist();

    // 12. Enter key & Escape shortcuts
    document.getElementById('auth-modal')?.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeAuthModal();
        if (e.key === 'Enter') {
            const activePanel = document.querySelector('.auth-tab-panel.active');
            const activeStep  = activePanel?.querySelector('.auth-step.active');
            if (!activeStep) return;
            if (activeStep.id === 'signup-creds-step') document.getElementById('signup-proceed-btn')?.click();
            if (activeStep.id === 'signup-otp-step')   document.getElementById('signup-verify-otp-btn')?.click();
            if (activeStep.id === 'signup-profile-step') document.getElementById('signup-complete-btn')?.click();
            if (activeStep.id === 'login-creds-step')  document.getElementById('login-proceed-btn')?.click();
            if (activeStep.id === 'login-otp-step')    document.getElementById('login-verify-otp-btn')?.click();
        }
    });

    // 13. Sync Navbar on startup
    updateNavAuth();
});
