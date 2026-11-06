// ==========================================================================
// TRIPMATE - Frontend Logic, Dataset Explorer & Live Transit Calculator
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // --------------------------------------------------------------------------
    // 1. Theme Switcher (Sunset Horizon vs Midnight Luxury)
    // --------------------------------------------------------------------------
    const themeButtons = document.querySelectorAll('.theme-toggle-btn');
    const savedTheme = localStorage.getItem('tripmate_theme') || 'sunset';

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('tripmate_theme', theme);

        themeButtons.forEach(btn => {
            if (btn.getAttribute('data-set-theme') === theme) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    applyTheme(savedTheme);

    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const chosenTheme = btn.getAttribute('data-set-theme');
            applyTheme(chosenTheme);
        });
    });

    // --------------------------------------------------------------------------
    // 2. Dataset Management & Dynamic Rendering (Kaggle 335 Places)
    // --------------------------------------------------------------------------
    const dataset = typeof PLACES_DATA !== 'undefined' ? PLACES_DATA : [];
    const locationsData = typeof INDIAN_LOCATIONS !== 'undefined' ? INDIAN_LOCATIONS : {};
    
    // ==========================================================================
    // 2. EXPLORE DESTINATIONS, PARTY SPOTS & ACCOMMODATIONS ENGINE
    // ==========================================================================

    // UI Elements for Explore
    const grid = document.getElementById('destinations-grid');
    const zoneFilter = document.getElementById('zone-filter');
    const citySelect = document.getElementById('explore-city-select');
    const searchInput = document.getElementById('city-search-input');
    const resultsCount = document.getElementById('results-count');
    const resetBtn = document.getElementById('reset-filters-btn');
    const loadMoreBtn = document.getElementById('load-more-btn');

    // Experience Tabs
    const expTabBtns = document.querySelectorAll('.exp-tab-btn');
    const sightseeingPillsGroup = document.getElementById('sightseeing-pills');
    const staysPillsGroup = document.getElementById('stays-pills');
    const sightseeingPills = document.querySelectorAll('#sightseeing-pills .pill-btn');
    const stayPills = document.querySelectorAll('#stays-pills .pill-stay-btn');

    // Budget Controller Elements
    const budgetSlider = document.getElementById('explore-budget-slider');
    const budgetValDisplay = document.getElementById('budget-value-display');
    const resetBudgetBtn = document.getElementById('reset-budget-btn');
    const budgetPills = document.querySelectorAll('.budget-pill');

    // Filter State
    let activeFilters = {
        zone: 'all',
        city: 'all',
        experience: 'all',   // 'all' | 'sightseeing' | 'party' | 'stays'
        category: 'all',     // heritage, spiritual, mountains, beaches, nature
        staySubType: 'all',  // all, airbnb, single_room, villa, homestay, resort, house
        maxBudget: Infinity, // Infinity or number (e.g. 1000, 3000, 6000) or 'luxury'
        query: ''
    };
    
    const BATCH_SIZE = 18;
    let visibleCount = BATCH_SIZE;
    let currentRenderItems = []; // Flat list or categorized

    // Populate Explore City Selector
    function initializeExploreCityDropdown() {
        if (!dataset.length || !citySelect) return;

        const cityMap = {};
        dataset.forEach(p => {
            if (!cityMap[p.city]) {
                cityMap[p.city] = { count: 0, state: p.state };
            }
            cityMap[p.city].count++;
        });

        // Ensure Goa is highlighted prominently
        const sortedCities = Object.keys(cityMap).sort();
        citySelect.innerHTML = '<option value="all">🌟 All Cities & Destinations Across India (218 Cities • 3,000+ Spots)</option>';
        sortedCities.forEach(city => {
            const opt = document.createElement('option');
            opt.value = city;
            opt.textContent = `${city} (${cityMap[city].count} attractions • ${cityMap[city].state})`;
            citySelect.appendChild(opt);
        });
    }

    // Update Subfilter Visibility depending on Experience Tab
    function updateSubfilterVisibility() {
        if (!sightseeingPillsGroup || !staysPillsGroup) return;
        if (activeFilters.experience === 'all') {
            sightseeingPillsGroup.style.display = 'flex';
            staysPillsGroup.style.display = 'flex';
        } else if (activeFilters.experience === 'sightseeing') {
            sightseeingPillsGroup.style.display = 'flex';
            staysPillsGroup.style.display = 'none';
        } else if (activeFilters.experience === 'stays') {
            sightseeingPillsGroup.style.display = 'none';
            staysPillsGroup.style.display = 'flex';
        } else if (activeFilters.experience === 'party') {
            sightseeingPillsGroup.style.display = 'none';
            staysPillsGroup.style.display = 'none';
        }
    }

    const ZONE_STATES_MAP = {
        'Northern': ['Delhi (NCT)', 'Delhi', 'Himachal Pradesh', 'Jammu and Kashmir', 'Ladakh', 'Punjab', 'Rajasthan', 'Haryana', 'Chandigarh'],
        'Southern': ['Goa', 'Karnataka', 'Kerala', 'Tamil Nadu', 'Telangana', 'Andhra Pradesh', 'Puducherry'],
        'Western': ['Maharashtra', 'Gujarat', 'Daman and Diu'],
        'Central': ['Uttar Pradesh', 'Madhya Pradesh', 'Chhattisgarh', 'Uttarakhand'],
        'Eastern': ['West Bengal', 'Odisha', 'Bihar', 'Jharkhand', 'Sikkim', 'Andaman and Nicobar Islands'],
        'North Eastern': ['Assam', 'Meghalaya', 'Arunachal Pradesh', 'Manipur', 'Mizoram', 'Nagaland', 'Tripura']
    };

    function stateMatchesZone(stateName, zone) {
        if (!zone || zone === 'all') return true;
        const validStates = ZONE_STATES_MAP[zone] || [];
        return validStates.some(s => s.toLowerCase() === (stateName || '').toLowerCase());
    }

    // Helper: matches budget
    function matchesBudgetFilter(itemCost) {
        if (activeFilters.maxBudget === Infinity || activeFilters.maxBudget === 'all') return true;
        if (activeFilters.maxBudget === 'luxury') return itemCost >= 10000;
        return (itemCost || 0) <= activeFilters.maxBudget;
    }

    // Helper: matches text search
    function matchesQuery(item) {
        if (!activeFilters.query) return true;
        const q = activeFilters.query.toLowerCase();
        const nameMatch = (item.name || '').toLowerCase().includes(q);
        const cityMatch = (item.city || '').toLowerCase().includes(q);
        const stateMatch = (item.state || '').toLowerCase().includes(q);
        const typeMatch = (item.type || item.sub_type_label || '').toLowerCase().includes(q);
        const vibeMatch = (item.vibe || item.room_info || '').toLowerCase().includes(q);
        return nameMatch || cityMatch || stateMatch || typeMatch || vibeMatch;
    }

    // Main Filtering Function
    function applyFiltering() {
        const isCitySpecific = activeFilters.city !== 'all';
        const cityName = activeFilters.city;

        // 1. Filter Places with alias resilience
        let filteredPlaces = dataset.filter(place => {
            if (activeFilters.zone !== 'all' && place.zone !== activeFilters.zone) return false;
            if (isCitySpecific) {
                const cLower = cityName.toLowerCase();
                const pCity = place.city.toLowerCase();
                const matchCity = pCity === cLower || pCity.includes(cLower) || cLower.includes(pCity) ||
                    (cLower === 'alleppey' && pCity === 'alappuzha') || (cLower === 'alappuzha' && pCity === 'alleppey') ||
                    (cLower === 'bengaluru' && pCity === 'bangalore') || (cLower === 'bangalore' && pCity === 'bengaluru') ||
                    (cLower === 'mysuru' && pCity === 'mysore') || (cLower === 'mysore' && pCity === 'mysuru') ||
                    (cLower === 'panaji' && pCity === 'goa') || (cLower === 'goa' && pCity === 'panaji') ||
                    (cLower === 'new delhi' && pCity === 'delhi') || (cLower === 'delhi' && pCity.includes('delhi')) ||
                    (cLower === 'kochi' && pCity === 'cochin') || (cLower === 'cochin' && pCity === 'kochi') ||
                    (cLower === 'varanasi' && (pCity === 'banaras' || pCity === 'kashi')) ||
                    (cLower === 'mumbai' && pCity === 'bombay') ||
                    (cLower === 'kolkata' && pCity === 'calcutta') ||
                    (cLower === 'chennai' && pCity === 'madras');
                if (!matchCity) return false;
            }
            if (activeFilters.category !== 'all' && place.category !== activeFilters.category) return false;
            if (!matchesBudgetFilter(place.fee_raw || 0)) return false;
            return matchesQuery(place);
        });

        // 2. Fetch Party & Stays via city-experiences-data.js
        let rawParty = [];
        let rawStays = [];

        if (typeof generateExperiencesForCity === 'function') {
            if (isCitySpecific) {
                const exp = generateExperiencesForCity(cityName);
                rawParty = exp.party || [];
                rawStays = exp.accommodations || [];
            } else {
                if (typeof CITY_EXPERIENCES !== 'undefined') {
                    Object.keys(CITY_EXPERIENCES).forEach(c => {
                        rawParty.push(...(CITY_EXPERIENCES[c].party || []));
                        rawStays.push(...(CITY_EXPERIENCES[c].accommodations || []));
                    });
                }
            }
        }

        // Filter Party spots
        let filteredParty = rawParty.filter(pt => {
            if (activeFilters.zone !== 'all' && !stateMatchesZone(pt.state, activeFilters.zone)) return false;
            if (!matchesBudgetFilter(pt.cost_raw || 0)) return false;
            return matchesQuery(pt);
        });

        // Filter Stays
        let filteredStays = rawStays.filter(st => {
            if (activeFilters.zone !== 'all' && !stateMatchesZone(st.state, activeFilters.zone)) return false;
            if (!matchesBudgetFilter(st.price_raw || 0)) return false;
            if (activeFilters.staySubType !== 'all' && st.sub_type !== activeFilters.staySubType) return false;
            return matchesQuery(st);
        });

        visibleCount = BATCH_SIZE;
        renderUnifiedView(filteredPlaces, filteredParty, filteredStays);
    }

    // Render HTML card for Sightseeing Place
    function createPlaceCardHTML(place) {
        return `
            <div class="destination-card" data-exp-type="place" data-id="${place.id}">
                <div class="card-img-wrapper">
                    <img src="${place.image}" alt="${place.name}" loading="lazy">
                    <span class="card-badge badge-sightseeing"><i class="fa-solid fa-landmark"></i> ${place.type}</span>
                </div>
                <div class="card-body">
                    <div class="card-meta-row">
                        <span class="rating-badge"><i class="fa-solid fa-star"></i> ${place.rating}</span>
                        <span class="fee-badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; font-weight: 700; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 6px; padding: 0.2rem 0.5rem; font-size: 0.78rem;">
                            <i class="fa-solid fa-ticket"></i> ${place.fee}
                        </span>
                    </div>
                    <h3>${place.name}</h3>
                    <p><i class="fa-solid fa-location-dot" style="color: var(--primary-color);"></i> ${place.city}, ${place.state}</p>
                    <div class="card-specs">
                        <span><i class="fa-regular fa-clock"></i> ${place.time}</span>
                        <span><i class="fa-solid fa-sun"></i> ${place.best_time}</span>
                        <span><i class="fa-solid fa-calendar-check"></i> ${place.weekly_off}</span>
                    </div>
                    <button class="card-btn-view" data-action="view-place" data-id="${place.id}">
                        <span>View Details & Timings</span>
                        <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // Render HTML card for Party / Nightlife Spot
    function createPartyCardHTML(pt) {
        return `
            <div class="destination-card" data-exp-type="party" data-id="${pt.id}">
                <div class="card-img-wrapper">
                    <img src="${pt.image}" alt="${pt.name}" loading="lazy">
                    <span class="card-badge badge-party"><i class="fa-solid fa-martini-glass-citrus"></i> ${pt.type}</span>
                </div>
                <div class="card-body">
                    <div class="card-meta-row">
                        <span class="rating-badge" style="background: rgba(168, 85, 247, 0.15); color: #a855f7;"><i class="fa-solid fa-star"></i> ${pt.rating}</span>
                        <span class="fee-badge" style="background: rgba(236, 72, 153, 0.15); color: #ec4899; font-weight: 700; border: 1px solid rgba(236, 72, 153, 0.3); border-radius: 6px; padding: 0.2rem 0.5rem; font-size: 0.78rem;">
                            <i class="fa-solid fa-champagne-glasses"></i> ${pt.cost}
                        </span>
                    </div>
                    <h3>${pt.name}</h3>
                    <p><i class="fa-solid fa-map-pin" style="color: #ec4899;"></i> ${pt.location}</p>
                    <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.4; margin: 0.4rem 0;">
                        <i class="fa-solid fa-music" style="color: #a855f7;"></i> ${pt.vibe}
                    </p>
                    <div class="card-specs">
                        <span><i class="fa-regular fa-clock"></i> ${pt.timing}</span>
                        <span><i class="fa-solid fa-users"></i> ${pt.stags_allowed}</span>
                    </div>
                    <button class="card-btn-view" data-action="view-party" data-id="${pt.id}" style="background: linear-gradient(135deg, #a855f7, #ec4899); color: #fff;">
                        <span>View Vibe & Entry Info</span>
                        <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // Render HTML card for Accommodation / Stay
    function createStayCardHTML(st) {
        const amenityTagsHTML = (st.amenities || []).slice(0, 3)
            .map(a => `<span class="amenity-tag">${a}</span>`).join('');

        return `
            <div class="destination-card" data-exp-type="stay" data-id="${st.id}">
                <div class="card-img-wrapper">
                    <img src="${st.image}" alt="${st.name}" loading="lazy">
                    <span class="card-badge badge-stay">${st.sub_type_label}</span>
                </div>
                <div class="card-body">
                    <div class="card-meta-row">
                        <span class="rating-badge" style="background: rgba(2, 132, 199, 0.15); color: #0284c7;"><i class="fa-solid fa-star"></i> ${st.rating}</span>
                        <span class="fee-badge" style="background: rgba(14, 165, 233, 0.15); color: #0284c7; font-weight: 800; border: 1px solid rgba(14, 165, 233, 0.3); border-radius: 6px; padding: 0.2rem 0.5rem; font-size: 0.82rem;">
                            <i class="fa-solid fa-tag"></i> ${st.price}
                        </span>
                    </div>
                    <h3>${st.name}</h3>
                    <p><i class="fa-solid fa-location-dot" style="color: #0284c7;"></i> ${st.location}</p>
                    <p style="font-size: 0.8rem; font-weight: 600; color: var(--text-main); margin: 0.3rem 0;">
                        <i class="fa-solid fa-bed" style="color: #0284c7;"></i> ${st.room_info}
                    </p>
                    <div class="card-amenities-tags">
                        ${amenityTagsHTML}
                    </div>
                    <button class="card-btn-view" data-action="view-stay" data-id="${st.id}" style="background: linear-gradient(135deg, #0284c7, #0d9488); color: #fff;">
                        <span>View Stay & Amenities</span>
                        <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // Render Unified Grid / Multi-Section View
    function renderUnifiedView(places, party, stays) {
        if (!grid) return;
        grid.innerHTML = '';

        const isCitySpecific = activeFilters.city !== 'all';
        const cityName = activeFilters.city;
        const totalItemsCount = places.length + party.length + stays.length;

        // Handle completely empty results
        if (totalItemsCount === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1.5rem; background: var(--bg-card); border-radius: 16px; border: 1px dashed var(--border-color);">
                    <i class="fa-solid fa-filter-circle-xmark" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--secondary-color); margin-bottom: 0.5rem;">No places, party spots, or stays found within this budget</h3>
                    <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Try sliding the budget limit higher, resetting your filters, or picking another city.</p>
                    <button id="empty-reset-btn" class="btn btn-primary"><i class="fa-solid fa-rotate-left"></i> Reset All Filters</button>
                </div>
            `;
            const emptyReset = document.getElementById('empty-reset-btn');
            if (emptyReset) emptyReset.addEventListener('click', resetAllFilters);
            if (resultsCount) resultsCount.innerHTML = `<i class="fa-solid fa-compass"></i> Showing 0 results within budget.`;
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            return;
        }

        // SCENARIO 1: Specific City Selected & "All Highlights" Tab Active
        // Renders distinct sections: 1. Places to Visit -> 2. Party & Nightlife -> 3. Accommodations & Stays
        if (isCitySpecific && activeFilters.experience === 'all') {
            let htmlBuffer = '';

            // Section 1: Places to Visit
            if (places.length > 0) {
                htmlBuffer += `
                    <div class="multi-section-header">
                        <h3 class="multi-section-title"><i class="fa-solid fa-landmark" style="color: var(--primary-color);"></i> 1. Top Places to Visit in ${cityName}</h3>
                        <span class="multi-section-count">${places.length} Attractions</span>
                    </div>
                `;
                htmlBuffer += places.map(p => createPlaceCardHTML(p)).join('');
            }

            // Section 2: Party & Nightlife
            if (party.length > 0) {
                htmlBuffer += `
                    <div class="multi-section-header">
                        <h3 class="multi-section-title"><i class="fa-solid fa-martini-glass-citrus" style="color: #ec4899;"></i> 2. Party & Nightlife in ${cityName}</h3>
                        <span class="multi-section-count" style="background: rgba(236, 72, 153, 0.15); color: #ec4899;">${party.length} Clubs & Pubs</span>
                    </div>
                `;
                htmlBuffer += party.map(pt => createPartyCardHTML(pt)).join('');
            }

            // Section 3: Accommodations & Stays
            if (stays.length > 0) {
                htmlBuffer += `
                    <div class="multi-section-header">
                        <h3 class="multi-section-title"><i class="fa-solid fa-bed" style="color: #0284c7;"></i> 3. Accommodations & Stays in ${cityName}</h3>
                        <span class="multi-section-count" style="background: rgba(2, 132, 199, 0.15); color: #0284c7;">${stays.length} Stays & Villas</span>
                    </div>
                `;
                htmlBuffer += stays.map(st => createStayCardHTML(st)).join('');
            }

            grid.innerHTML = htmlBuffer;
            if (resultsCount) {
                const budgetText = activeFilters.maxBudget === Infinity ? 'Any Budget' : `Max ₹${Number(activeFilters.maxBudget).toLocaleString('en-IN')}`;
                resultsCount.innerHTML = `<i class="fa-solid fa-compass"></i> Showing <strong>${totalItemsCount}</strong> total spots in <strong>${cityName}</strong> (${places.length} Places • ${party.length} Party • ${stays.length} Stays) • Budget: <strong>${budgetText}</strong>`;
            }
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            return;
        }

        // SCENARIO 2: Dedicated Experience Tab is selected
        let cardsToRender = [];
        if (activeFilters.experience === 'sightseeing') {
            cardsToRender = places.map(p => createPlaceCardHTML(p));
        } else if (activeFilters.experience === 'party') {
            cardsToRender = party.map(pt => createPartyCardHTML(pt));
        } else if (activeFilters.experience === 'stays') {
            cardsToRender = stays.map(st => createStayCardHTML(st));
        } else {
            // All cities feed
            cardsToRender = [
                ...places.slice(0, 12).map(p => createPlaceCardHTML(p)),
                ...party.slice(0, 4).map(pt => createPartyCardHTML(pt)),
                ...stays.slice(0, 6).map(st => createStayCardHTML(st))
            ];
        }

        const toDisplay = cardsToRender.slice(0, visibleCount);
        grid.innerHTML = toDisplay.join('');

        if (resultsCount) {
            const budgetText = activeFilters.maxBudget === Infinity ? 'All Budgets' : `Max ₹${Number(activeFilters.maxBudget).toLocaleString('en-IN')}`;
            resultsCount.innerHTML = `<i class="fa-solid fa-compass"></i> Showing <strong>${toDisplay.length}</strong> of <strong>${cardsToRender.length}</strong> items • Budget: <strong>${budgetText}</strong>`;
        }

        if (loadMoreBtn) {
            loadMoreBtn.style.display = (visibleCount >= cardsToRender.length) ? 'none' : 'inline-flex';
        }
    }

    // Reset All Filters
    function resetAllFilters() {
        activeFilters = {
            zone: 'all',
            city: 'all',
            experience: 'all',
            category: 'all',
            staySubType: 'all',
            maxBudget: Infinity,
            query: ''
        };

        if (zoneFilter) zoneFilter.value = 'all';
        if (citySelect) citySelect.value = 'all';
        if (searchInput) searchInput.value = '';
        if (budgetSlider) budgetSlider.value = 25000;
        if (budgetValDisplay) budgetValDisplay.textContent = 'All Budgets (No Limit)';

        expTabBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-exp') === 'all'));
        sightseeingPills.forEach(b => b.classList.toggle('active', b.getAttribute('data-filter') === 'all'));
        stayPills.forEach(b => b.classList.toggle('active', b.getAttribute('data-stay') === 'all'));
        budgetPills.forEach(b => b.classList.toggle('active', b.getAttribute('data-budget') === 'all'));

        updateSubfilterVisibility();
        applyFiltering();
    }

    // Event Listeners for Filters
    if (zoneFilter) zoneFilter.addEventListener('change', (e) => { activeFilters.zone = e.target.value; applyFiltering(); });
    if (citySelect) citySelect.addEventListener('change', (e) => { activeFilters.city = e.target.value; applyFiltering(); });

    // Live Search
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                activeFilters.query = e.target.value.trim();
                applyFiltering();
            }, 200);
        });
    }

    // Experience Tabs Click
    expTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            expTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilters.experience = btn.getAttribute('data-exp');
            updateSubfilterVisibility();
            applyFiltering();
        });
    });

    // Sightseeing Category Pills Click
    sightseeingPills.forEach(pill => {
        pill.addEventListener('click', () => {
            sightseeingPills.forEach(b => b.classList.remove('active'));
            pill.classList.add('active');
            activeFilters.category = pill.getAttribute('data-filter');
            applyFiltering();
        });
    });

    // Stay Sub-type Pills Click
    stayPills.forEach(pill => {
        pill.addEventListener('click', () => {
            stayPills.forEach(b => b.classList.remove('active'));
            pill.classList.add('active');
            activeFilters.staySubType = pill.getAttribute('data-stay');
            applyFiltering();
        });
    });

    // Dynamic Budget Slider Input
    if (budgetSlider) {
        budgetSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            budgetPills.forEach(b => b.classList.remove('active'));
            if (val >= 25000) {
                activeFilters.maxBudget = Infinity;
                if (budgetValDisplay) budgetValDisplay.textContent = 'All Budgets (No Limit)';
                const allPill = document.querySelector('.budget-pill[data-budget="all"]');
                if (allPill) allPill.classList.add('active');
            } else {
                activeFilters.maxBudget = val;
                if (budgetValDisplay) budgetValDisplay.textContent = `Max: ₹${val.toLocaleString('en-IN')}`;
            }
            applyFiltering();
        });
    }

    // Quick Budget Preset Pills
    budgetPills.forEach(pill => {
        pill.addEventListener('click', () => {
            budgetPills.forEach(b => b.classList.remove('active'));
            pill.classList.add('active');
            const bVal = pill.getAttribute('data-budget');
            if (bVal === 'all') {
                activeFilters.maxBudget = Infinity;
                if (budgetSlider) budgetSlider.value = 25000;
                if (budgetValDisplay) budgetValDisplay.textContent = 'All Budgets (No Limit)';
            } else if (bVal === 'luxury') {
                activeFilters.maxBudget = 'luxury';
                if (budgetSlider) budgetSlider.value = 25000;
                if (budgetValDisplay) budgetValDisplay.textContent = 'Luxury Tiers (₹15,000+)';
            } else {
                const numeric = parseInt(bVal, 10);
                activeFilters.maxBudget = numeric;
                if (budgetSlider) budgetSlider.value = numeric;
                if (budgetValDisplay) budgetValDisplay.textContent = `Max: ₹${numeric.toLocaleString('en-IN')}`;
            }
            applyFiltering();
        });
    });

    // Clear Budget Filter Button
    if (resetBudgetBtn) {
        resetBudgetBtn.addEventListener('click', () => {
            activeFilters.maxBudget = Infinity;
            if (budgetSlider) budgetSlider.value = 25000;
            if (budgetValDisplay) budgetValDisplay.textContent = 'All Budgets (No Limit)';
            budgetPills.forEach(b => b.classList.toggle('active', b.getAttribute('data-budget') === 'all'));
            applyFiltering();
        });
    }

    if (resetBtn) resetBtn.addEventListener('click', resetAllFilters);
    if (loadMoreBtn) loadMoreBtn.addEventListener('click', () => { visibleCount += BATCH_SIZE; applyFiltering(); });

    // --------------------------------------------------------------------------
    // 3. UNIVERSAL DETAIL MODAL (Places, Party Spots & Stays)
    // --------------------------------------------------------------------------
    const modal = document.getElementById('place-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalPlanTripBtn = document.getElementById('modal-plan-trip-btn');
    let currentSelectedItem = null;

    function openItemModal(item, expType) {
        if (!modal || !item) return;
        currentSelectedItem = item;

        const imgEl = document.getElementById('modal-img');
        const badgeEl = document.getElementById('modal-badge');
        const zoneEl = document.getElementById('modal-zone');
        const titleEl = document.getElementById('modal-title');
        const locEl = document.getElementById('modal-location');
        const ratingEl = document.getElementById('modal-rating');
        const reviewsEl = document.getElementById('modal-reviews');
        const feeEl = document.getElementById('modal-fee');
        const timeEl = document.getElementById('modal-time');
        const bestTimeEl = document.getElementById('modal-best-time');
        const typeSigEl = document.getElementById('modal-type-sig');
        const weeklyOffEl = document.getElementById('modal-weekly-off');
        const airportEl = document.getElementById('modal-airport');
        const dslrEl = document.getElementById('modal-dslr');

        imgEl.src = item.image;
        imgEl.alt = item.name;
        titleEl.textContent = item.name;
        ratingEl.textContent = `${item.rating} / 5.0`;
        reviewsEl.textContent = `${item.reviews || '4.5+'} verified reviews`;

        if (expType === 'party') {
            badgeEl.className = 'card-badge badge-party';
            badgeEl.innerHTML = `<i class="fa-solid fa-martini-glass-citrus"></i> ${item.type}`;
            zoneEl.textContent = `Party & Nightlife • ${item.city}`;
            locEl.innerHTML = `<i class="fa-solid fa-location-dot" style="color: #ec4899;"></i> ${item.location || item.city + ', ' + item.state}`;
            
            feeEl.textContent = item.cost;
            timeEl.textContent = item.timing || '8 PM – 3 AM';
            bestTimeEl.textContent = item.music || 'EDM & Commercial';

            typeSigEl.textContent = item.vibe || 'Party Vibe';
            weeklyOffEl.textContent = item.stags_allowed || 'Allowed';
            airportEl.textContent = 'Yes (Party City Hub)';
            dslrEl.textContent = 'Smartphones Allowed';

            if (modalPlanTripBtn) {
                modalPlanTripBtn.innerHTML = `<i class="fa-solid fa-champagne-glasses"></i> Add to Party Itinerary`;
                modalPlanTripBtn.style.background = 'linear-gradient(135deg, #a855f7, #ec4899)';
            }
        } else if (expType === 'stay') {
            badgeEl.className = 'card-badge badge-stay';
            badgeEl.innerHTML = item.sub_type_label;
            zoneEl.textContent = `Accommodation & Stay • ${item.city}`;
            locEl.innerHTML = `<i class="fa-solid fa-location-dot" style="color: #0284c7;"></i> ${item.location || item.city + ', ' + item.state}`;

            feeEl.textContent = item.price;
            timeEl.textContent = item.room_info || '1-2 Guests';
            bestTimeEl.textContent = '2:00 PM Check-In';

            typeSigEl.textContent = (item.amenities || []).join(' • ');
            weeklyOffEl.textContent = 'Open 365 Days';
            airportEl.textContent = 'Airport Pickup Available';
            dslrEl.textContent = 'Allowed';

            if (modalPlanTripBtn) {
                modalPlanTripBtn.innerHTML = `<i class="fa-solid fa-bed"></i> Book / Reserve This Stay`;
                modalPlanTripBtn.style.background = 'linear-gradient(135deg, #0284c7, #0d9488)';
            }
        } else {
            // Standard Sightseeing Place
            badgeEl.className = 'card-badge badge-sightseeing';
            badgeEl.textContent = item.type;
            zoneEl.textContent = `${item.zone || 'Verified'} Zone • Built ${item.year || 'Historic'}`;
            locEl.innerHTML = `<i class="fa-solid fa-location-dot" style="color: var(--primary-color);"></i> ${item.city}, ${item.state}, India`;

            feeEl.textContent = item.fee;
            timeEl.textContent = item.time;
            bestTimeEl.textContent = item.best_time;

            typeSigEl.textContent = `${item.type} (${item.significance || 'Cultural'})`;
            weeklyOffEl.textContent = item.weekly_off || 'Open All Days';
            airportEl.textContent = item.airport === 'Yes' ? 'Yes (Within 50km)' : 'No (Requires transit)';
            dslrEl.textContent = item.dslr === 'Yes' ? 'Allowed' : 'Not Allowed / Restricted';

            if (modalPlanTripBtn) {
                modalPlanTripBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Plan Trip To This City`;
                modalPlanTripBtn.style.background = 'var(--primary-color)';
            }
        }

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closePlaceModal() {
        if (!modal) return;
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', closePlaceModal);
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closePlaceModal(); });
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) closePlaceModal();
    });

    // Card Click Delegator
    if (grid) {
        grid.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            const card = e.target.closest('.destination-card');
            if (btn || card) {
                const targetCard = card || btn.closest('.destination-card');
                const id = targetCard.getAttribute('data-id');
                const expType = targetCard.getAttribute('data-exp-type');

                if (expType === 'place') {
                    const place = dataset.find(p => String(p.id) === String(id));
                    if (place) openItemModal(place, 'place');
                } else if (expType === 'party') {
                    let partyItem = null;
                    if (typeof CITY_EXPERIENCES !== 'undefined') {
                        Object.values(CITY_EXPERIENCES).forEach(c => {
                            const found = (c.party || []).find(pt => pt.id === id);
                            if (found) partyItem = found;
                        });
                    }
                    if (!partyItem && typeof generateExperiencesForCity === 'function') {
                        const cityName = targetCard.querySelector('p')?.textContent || '';
                        const exp = generateExperiencesForCity(cityName);
                        partyItem = (exp.party || []).find(pt => pt.id === id);
                    }
                    if (partyItem) openItemModal(partyItem, 'party');
                } else if (expType === 'stay') {
                    let stayItem = null;
                    if (typeof CITY_EXPERIENCES !== 'undefined') {
                        Object.values(CITY_EXPERIENCES).forEach(c => {
                            const found = (c.accommodations || []).find(st => st.id === id);
                            if (found) stayItem = found;
                        });
                    }
                    if (!stayItem && typeof generateExperiencesForCity === 'function') {
                        const cityName = targetCard.querySelector('p')?.textContent || '';
                        const exp = generateExperiencesForCity(cityName);
                        stayItem = (exp.accommodations || []).find(st => st.id === id);
                    }
                    if (stayItem) openItemModal(stayItem, 'stay');
                }
            }
        });
    }

    // Modal action button click handler
    if (modalPlanTripBtn) {
        modalPlanTripBtn.addEventListener('click', () => {
            if (!currentSelectedItem) return;
            closePlaceModal();

            if (currentSelectedItem.category === 'party') {
                if (typeof showToast === 'function') {
                    showToast(`🍸 Added ${currentSelectedItem.name} to your Nightlife Plan!`, 'success');
                }
            } else if (currentSelectedItem.category === 'accommodation') {
                if (typeof showToast === 'function') {
                    showToast(`🏨 Reserved ${currentSelectedItem.name} (${currentSelectedItem.price})! Added to budget.`, 'success');
                }
                const budgetInput = document.getElementById('trip-budget');
                if (budgetInput && currentSelectedItem.price_raw) {
                    const currentVal = parseInt(budgetInput.value || '0', 10);
                    budgetInput.value = currentVal + currentSelectedItem.price_raw;
                }
            } else {
                // Sightseeing place
                const plannerSection = document.getElementById('planner');
                if (plannerSection) plannerSection.scrollIntoView({ behavior: 'smooth' });
                if (destStateSelect) {
                    destStateSelect.value = currentSelectedItem.state;
                    destStateSelect.dispatchEvent(new Event('change'));
                    setTimeout(() => {
                        if (destCitySelect) {
                            destCitySelect.value = currentSelectedItem.city;
                            destCitySelect.dispatchEvent(new Event('change'));
                        }
                    }, 100);
                }
            }
        });
    }

    // --------------------------------------------------------------------------
    // 4. Hierarchical Location Selectors & Live Transit Engine
    // --------------------------------------------------------------------------
    const startStateSelect = document.getElementById('start-state');
    const startCitySelect = document.getElementById('start-city');
    const destStateSelect = document.getElementById('dest-state');
    const destCitySelect = document.getElementById('dest-city');
    const transportBtns = document.querySelectorAll('.transport-btn');
    const hiddenTransport = document.getElementById('selected-transport');
    const applyBudgetBtn = document.getElementById('apply-budget-btn');

    // Live Route Display Elements
    const routeFrom = document.getElementById('route-from');
    const routeTo = document.getElementById('route-to');
    const routeModeBadge = document.getElementById('route-mode-badge');
    const liveDistance = document.getElementById('live-distance');
    const liveDuration = document.getElementById('live-duration');
    const liveTransportCost = document.getElementById('live-transport-cost');
    const durationDetail = document.getElementById('duration-detail');

    let currentCalculatedCost = 0;

    // Populate State Dropdowns
    function populateStateDropdowns() {
        const states = Object.keys(locationsData).sort();
        
        if (startStateSelect) {
            startStateSelect.innerHTML = '<option value="">Select Origin State / UT</option>';
            states.forEach(state => {
                const opt = document.createElement('option');
                opt.value = state;
                opt.textContent = state;
                startStateSelect.appendChild(opt);
            });
        }

        if (destStateSelect) {
            destStateSelect.innerHTML = '<option value="">Select Destination State / UT</option>';
            states.forEach(state => {
                const opt = document.createElement('option');
                opt.value = state;
                opt.textContent = state;
                destStateSelect.appendChild(opt);
            });
        }
    }

    // Populate City Dropdown for a given State
    function populateCitySelect(stateSelect, citySelectElement, promptText) {
        const selectedState = stateSelect.value;
        citySelectElement.innerHTML = `<option value="">${promptText}</option>`;

        if (!selectedState || !locationsData[selectedState]) {
            citySelectElement.disabled = true;
            return;
        }

        citySelectElement.disabled = false;
        const cities = locationsData[selectedState];
        cities.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.name;
            opt.textContent = c.name;
            opt.dataset.lat = c.lat;
            opt.dataset.lon = c.lon;
            citySelectElement.appendChild(opt);
        });
    }

    // State change event listeners
    if (startStateSelect && startCitySelect) {
        startStateSelect.addEventListener('change', () => {
            populateCitySelect(startStateSelect, startCitySelect, 'Choose Starting City / District');
            calculateLiveTransit();
        });
        startCitySelect.addEventListener('change', calculateLiveTransit);
    }

    if (destStateSelect && destCitySelect) {
        destStateSelect.addEventListener('change', () => {
            populateCitySelect(destStateSelect, destCitySelect, 'Choose Destination City / District');
            calculateLiveTransit();
        });
        destCitySelect.addEventListener('change', calculateLiveTransit);
    }

    // Mode of Transport Buttons
    if (transportBtns.length > 0) {
        transportBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                transportBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const mode = btn.getAttribute('data-mode');
                if (hiddenTransport) hiddenTransport.value = mode;

                // Update badge
                const modeIcons = {
                    car: '🚗 Car (Own Vehicle)',
                    bike: '🏍️ Bike (Own Vehicle)',
                    bus: '🚌 Intercity Bus',
                    train: '🚆 Express Train',
                    flight: '✈️ Air Flight'
                };
                if (routeModeBadge) routeModeBadge.textContent = modeIcons[mode] || mode;

                calculateLiveTransit();
            });
        });
    }

    // Haversine formula for exact distance between coordinates
    function getCrowDistanceKm(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // Find city coordinates in INDIAN_LOCATIONS
    function findCityCoords(stateName, cityName) {
        if (!stateName || !cityName || !locationsData[stateName]) return null;
        const match = locationsData[stateName].find(c => c.name.toLowerCase() === cityName.toLowerCase());
        return match ? { lat: match.lat, lon: match.lon } : null;
    }

    // Format hours & mins
    function formatHoursMins(totalHours) {
        const hrs = Math.floor(totalHours);
        const mins = Math.round((totalHours - hrs) * 60);
        if (hrs === 0) return `${mins} mins`;
        if (mins === 0) return `${hrs} hrs`;
        return `${hrs} hrs ${mins} mins`;
    }

    // Live Transit Calculator
    function calculateLiveTransit() {
        const startState = startStateSelect ? startStateSelect.value : '';
        const startCity = startCitySelect ? startCitySelect.value : '';
        const destState = destStateSelect ? destStateSelect.value : '';
        const destCity = destCitySelect ? destCitySelect.value : '';
        const mode = hiddenTransport ? hiddenTransport.value : 'car';

        // Update header route indicators
        if (routeFrom) {
            routeFrom.innerHTML = startCity ? 
                `<i class="fa-solid fa-circle-dot" style="color: #10b981;"></i> ${startCity} (${startState})` : 
                `<i class="fa-solid fa-circle-dot" style="color: #10b981;"></i> Select Starting Point`;
        }

        if (routeTo) {
            routeTo.innerHTML = destCity ? 
                `<i class="fa-solid fa-location-dot" style="color: #ef4444;"></i> ${destCity} (${destState})` : 
                `<i class="fa-solid fa-location-dot" style="color: #ef4444;"></i> Select Destination`;
        }

        if (!startState || !startCity || !destState || !destCity) {
            if (liveDistance) liveDistance.textContent = '-- km';
            if (liveDuration) liveDuration.textContent = '-- hrs -- mins';
            if (liveTransportCost) liveTransportCost.textContent = '₹0';
            if (durationDetail) durationDetail.textContent = 'Select start and destination';
            currentCalculatedCost = 0;
            return;
        }

        // If same city
        if (startCity.toLowerCase() === destCity.toLowerCase()) {
            if (liveDistance) liveDistance.textContent = '0 km';
            if (liveDuration) liveDuration.textContent = 'Local Trip (< 30 mins)';
            if (liveTransportCost) liveTransportCost.textContent = '₹150';
            if (durationDetail) durationDetail.textContent = 'Within same city / district';
            currentCalculatedCost = 150;
            return;
        }

        const startCoords = findCityCoords(startState, startCity);
        const destCoords = findCityCoords(destState, destCity);

        if (!startCoords || !destCoords) {
            if (liveDistance) liveDistance.textContent = 'Coords N/A';
            return;
        }

        // Great circle distance & realistic Indian road factor (x1.25)
        const crowKm = getCrowDistanceKm(startCoords.lat, startCoords.lon, destCoords.lat, destCoords.lon);
        const roadKm = Math.round(crowKm * 1.25);

        let durationHours = 0;
        let estimatedCost = 0;
        let detailText = '';

        if (mode === 'car') {
            // Avg speed 65 km/h + 30 min break every 250 km
            const breaks = Math.floor(roadKm / 250) * 0.5;
            durationHours = (roadKm / 65) + breaks;
            // Fuel estimate: ~14 km/L, petrol ₹100/L (~₹7.2/km) + ₹350 toll per 300km
            const fuel = roadKm * 7.2;
            const toll = Math.floor(roadKm / 300) * 350;
            estimatedCost = Math.round(fuel + toll);
            detailText = `Avg ~65 km/h highway speed incl. fuel/tolls`;
            if (liveDistance) liveDistance.textContent = `${roadKm} km (Road)`;
        } else if (mode === 'bike') {
            // Avg speed 50 km/h + rest break every 150 km
            const breaks = Math.floor(roadKm / 150) * 0.5;
            durationHours = (roadKm / 50) + breaks;
            // Fuel estimate: ~38 km/L (~₹2.8/km)
            estimatedCost = Math.round(roadKm * 2.8);
            detailText = `Scenic motorcycle ride, ~50 km/h avg pace`;
            if (liveDistance) liveDistance.textContent = `${roadKm} km (Road)`;
        } else if (mode === 'bus') {
            // Intercity bus ~48 km/h + 1 hr bus station/boarding buffer
            durationHours = (roadKm / 48) + 1.0;
            // Bus ticket ~₹1.7 per km (AC Sleeper / Semi-sleeper)
            estimatedCost = Math.round(Math.max(250, roadKm * 1.75));
            detailText = `Intercity AC bus fare & depot transit`;
            if (liveDistance) liveDistance.textContent = `${roadKm} km (Highway)`;
        } else if (mode === 'train') {
            // Express / Vande Bharat ~75 km/h + 45 min station buffer
            durationHours = (roadKm / 75) + 0.75;
            // Train fare ~₹1.35 per km (3AC / Chair Car avg)
            estimatedCost = Math.round(Math.max(180, roadKm * 1.35));
            detailText = `Indian Railways Express/Superfast route`;
            if (liveDistance) liveDistance.textContent = `${roadKm} km (Rail track)`;
        } else if (mode === 'flight') {
            if (crowKm < 140) {
                // Short distance
                durationHours = (roadKm / 65) + 0.5;
                estimatedCost = Math.round(roadKm * 7);
                detailText = `Flight not practical (<150km); Road is faster`;
                if (liveDistance) liveDistance.textContent = `${roadKm} km (Road)`;
            } else {
                // 700 km/h flight speed + 2.25 hrs (airport security, check-in, boarding)
                const airHours = (crowKm / 700);
                durationHours = airHours + 2.25;
                estimatedCost = Math.round(Math.max(2800, crowKm * 4.8));
                detailText = `Air travel (~${formatHoursMins(airHours)} in air + airport transit)`;
                if (liveDistance) liveDistance.textContent = `${Math.round(crowKm)} km (Air direct)`;
            }
        }

        currentCalculatedCost = estimatedCost;

        if (liveDuration) liveDuration.textContent = formatHoursMins(durationHours);
        if (liveTransportCost) liveTransportCost.textContent = `₹${estimatedCost.toLocaleString('en-IN')}`;
        if (durationDetail) durationDetail.textContent = detailText;
    }

    // Auto-apply transit cost into Total Budget
    if (applyBudgetBtn) {
        applyBudgetBtn.addEventListener('click', () => {
            const budgetInput = document.getElementById('trip-budget');
            const travellersInput = document.getElementById('travellers');
            const numTravellers = travellersInput ? (parseInt(travellersInput.value) || 1) : 1;

            if (budgetInput && currentCalculatedCost > 0) {
                // Total budget includes estimated transit for travellers + baseline stay/food
                const mode = hiddenTransport ? hiddenTransport.value : 'car';
                let totalEstimatedTransit = currentCalculatedCost;
                
                // If public transport, multiply by travellers
                if (['bus', 'train', 'flight'].includes(mode)) {
                    totalEstimatedTransit = currentCalculatedCost * numTravellers;
                }

                // Add a realistic 3-day basic stay & food allocation (₹2,500/person)
                const recommendedTotal = totalEstimatedTransit + (numTravellers * 4000);
                budgetInput.value = recommendedTotal;

                alert(`✨ Applied recommended budget of ₹${recommendedTotal.toLocaleString('en-IN')} (includes ₹${totalEstimatedTransit.toLocaleString('en-IN')} transit for ${numTravellers} traveller(s) + lodging/meals estimate)!`);
            } else {
                alert('Please select both a Starting Point and Destination first to calculate transit costs.');
            }
        });
    }

    // Modal "Plan Trip To This City" Action — Auto-selects Destination
    if (modalPlanTripBtn) {
        modalPlanTripBtn.addEventListener('click', () => {
            if (!currentSelectedPlace) return;
            const targetCity = currentSelectedPlace.city;
            const targetState = currentSelectedPlace.state;
            closePlaceModal();

            // Set destination state
            if (destStateSelect) {
                for (let i = 0; i < destStateSelect.options.length; i++) {
                    if (destStateSelect.options[i].value.toLowerCase() === targetState.toLowerCase()) {
                        destStateSelect.selectedIndex = i;
                        populateCitySelect(destStateSelect, destCitySelect, 'Choose Destination City');
                        break;
                    }
                }
            }

            // Set destination city
            if (destCitySelect) {
                setTimeout(() => {
                    for (let j = 0; j < destCitySelect.options.length; j++) {
                        if (destCitySelect.options[j].value.toLowerCase().includes(targetCity.toLowerCase())) {
                            destCitySelect.selectedIndex = j;
                            break;
                        }
                    }
                    calculateLiveTransit();
                }, 50);
            }

            window.location.hash = '#planner';
        });
    }

    // Initialize Dropdowns
    populateStateDropdowns();
    initializeExploreCityDropdown();
    applyFiltering();

    // --------------------------------------------------------------------------
    // 5. Dynamic Spotlight Section
    // --------------------------------------------------------------------------
    const spotlightContainer = document.getElementById('destination-spotlight-container');
    if (spotlightContainer && dataset.length > 0) {
        const spotlightPlaces = dataset.filter(p => ["Taj Mahal", "Pangong Lake", "India Gate"].includes(p.name));
        const spotsToRender = spotlightPlaces.length === 3 ? spotlightPlaces : dataset.slice(0, 3);

        spotlightContainer.innerHTML = spotsToRender.map(place => `
            <article class="detail-card">
                <div class="detail-img">
                    <img src="${place.image}" alt="${place.name}">
                </div>
                <div class="detail-content">
                    <span class="card-badge" style="position: static; width: fit-content; margin-bottom: 0.75rem; background: var(--primary-color);">${place.type} • ${place.zone} Zone</span>
                    <h3>${place.name} (${place.city}, ${place.state})</h3>
                    <p>Celebrated ${place.significance.toLowerCase()} landmark established around ${place.year}. Rated ${place.rating} ⭐ based on ${place.reviews} reviews.</p>
                    <h4><i class="fa-solid fa-circle-info"></i> Visitor Essentials</h4>
                    <ul class="attractions-list">
                        <li><i class="fa-solid fa-clock"></i> Visit Time: ${place.time}</li>
                        <li><i class="fa-solid fa-ticket"></i> Entry Fee: ${place.fee}</li>
                        <li><i class="fa-solid fa-sun"></i> Best Hour: ${place.best_time}</li>
                        <li><i class="fa-solid fa-calendar-xmark"></i> Weekly Off: ${place.weekly_off}</li>
                    </ul>
                </div>
            </article>
        `).join('');
    }

    // --------------------------------------------------------------------------
    // 6. Minimum Date Validation
    // --------------------------------------------------------------------------
    const departureInput = document.getElementById('departure');
    const returnInput = document.getElementById('return');
    const today = new Date().toISOString().split('T')[0];

    if (departureInput) departureInput.min = today;
    if (returnInput) returnInput.min = today;

    if (departureInput && returnInput) {
        departureInput.addEventListener('change', () => {
            returnInput.min = departureInput.value;
            if (returnInput.value && returnInput.value < departureInput.value) {
                returnInput.value = departureInput.value;
            }
        });
    }

    // --------------------------------------------------------------------------
    // 7. Active Nav Link on Scroll
    // --------------------------------------------------------------------------
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navbar a');

    window.addEventListener('scroll', () => {
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    });

    // --------------------------------------------------------------------------
    // 8. Handle Trip Planner Form Submission
    // --------------------------------------------------------------------------
    const tripForm = document.getElementById('trip-form');
    const upcomingTripsList = document.getElementById('upcoming-trips-list');
    const summaryTotal = document.getElementById('summary-total');
    const summaryBalance = document.getElementById('summary-balance');

    if (tripForm) {
        tripForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const startCity = startCitySelect ? startCitySelect.value : '';
            const startState = startStateSelect ? startStateSelect.value : '';
            const destCity = destCitySelect ? destCitySelect.value : '';
            const destState = destStateSelect ? destStateSelect.value : '';
            const departureDate = document.getElementById('departure').value;
            const returnDate = document.getElementById('return').value;
            const travellers = document.getElementById('travellers').value;
            const budget = document.getElementById('trip-budget').value;
            const mode = hiddenTransport ? hiddenTransport.value.toUpperCase() : 'CAR';

            const distText = liveDistance ? liveDistance.textContent : '-- km';
            const durText = liveDuration ? liveDuration.textContent : '--';

            if (summaryTotal && summaryBalance) {
                const formattedBudget = Number(budget).toLocaleString('en-IN');
                summaryTotal.textContent = `₹${formattedBudget}`;
                summaryBalance.textContent = `₹${formattedBudget}`;
            }

            if (upcomingTripsList) {
                const tripCard = document.createElement('div');
                tripCard.className = 'saved-trip-item';
                tripCard.innerHTML = `
                    <div class="saved-trip-info">
                        <h4><i class="fa-solid fa-location-dot" style="color: var(--primary-color);"></i> ${destCity}, ${destState}</h4>
                        <span>${startCity} (${startState}) ➔ ${destCity} • ${travellers} Traveller(s) via <strong>${mode}</strong></span><br>
                        <small style="color: var(--text-muted);"><i class="fa-regular fa-calendar"></i> ${departureDate} to ${returnDate} • Route: ${distText} (${durText}) • Budget: ₹${Number(budget).toLocaleString('en-IN')}</small>
                    </div>
                    <span class="card-badge" style="position: static; background: var(--primary-color);">Planned</span>
                `;

                if (upcomingTripsList.classList.contains('trip-empty-state')) {
                    upcomingTripsList.classList.remove('trip-empty-state');
                    upcomingTripsList.innerHTML = '';
                    upcomingTripsList.style.border = 'none';
                    upcomingTripsList.style.padding = '0';
                }

                upcomingTripsList.prepend(tripCard);
            }

            alert(`🎉 Great! Your trip from ${startCity} to ${destCity} via ${mode} (${distText}) has been planned successfully!`);
            window.location.hash = '#trips';
        });
    }
});
