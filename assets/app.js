const input = document.getElementById("searchInput");
const results = document.getElementById("searchResults");

let debounceTimer;

input.addEventListener("input", () => {
	const query = input.value.trim();
	clearTimeout(debounceTimer);
	results.innerHTML = "";

	if (!query) {
		results.classList.remove("active");
		return;
	}

	debounceTimer = setTimeout(() => {
		fetch(
			`/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=6`,
		)
			.then((res) => res.json())
			.then((data) => {
				results.innerHTML = "";
				const products = data.resources.results.products;

				if (!products || products.length === 0) {
					results.innerHTML = `<div class="result-item result-empty">No results found</div>`;
				} else {
					products.forEach((p) => {
						const available = p.available_for_sale !== false;
						const price =
							p.price_min !== undefined
								? p.price_min + " USD"
								: "";
						// const price = p.price
						// 	? (parseInt(p.price) / 100).toFixed(0) + " USD"
						// 	: "";
						results.innerHTML += `
                            <a href="${p.url}" class="result-item">
                                <span class="result-name">${p.title}</span>
                                <span class="result-meta">
                                    ${!available ? `<span class="result-status">[sold out]</span>` : ""}
                                    ${price}
                                </span>
                            </a>`;
					});
				}

				results.classList.add("active");
			})
			.catch(() => {
				results.innerHTML = `<div class="result-item result-empty">Something went wrong</div>`;
				results.classList.add("active");
			});
	}, 250);
});

document.addEventListener("click", (e) => {
	if (!e.target.closest(".search-wrapper")) {
		results.classList.remove("active");
	}
});

// Accordion
document.querySelectorAll(".accordion-header").forEach((btn) => {
	btn.addEventListener("click", () => {
		btn.closest(".accordion").classList.toggle("open");
	});
});

// Variant selector
document.querySelectorAll(".size-btn, .color-swatch").forEach((btn) => {
	btn.addEventListener("click", () => {
		document.getElementById("variantId").value = btn.dataset.variantId;
		window.history.replaceState({}, "", btn.dataset.variantUrl);
		document
			.querySelectorAll(".size-btn")
			.forEach((b) => b.classList.remove("active"));
		btn.classList.add("active");
	});
});

// Hamburger menu
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");

if (hamburger && mobileMenu) {
	hamburger.addEventListener("click", () => {
		mobileMenu.classList.toggle("open");
		hamburger.querySelector("i").classList.toggle("fa-bars");
		hamburger.querySelector("i").classList.toggle("fa-x");
	});
}

// Mobile search
const mobileInput = document.getElementById("searchInputMobile");
const mobileResults = document.getElementById("searchResultsMobile");

if (mobileInput && mobileResults) {
	let mobileDebounce;
	mobileInput.addEventListener("input", () => {
		const query = mobileInput.value.trim();
		clearTimeout(mobileDebounce);
		mobileResults.innerHTML = "";

		if (!query) {
			mobileResults.classList.remove("active");
			return;
		}

		mobileDebounce = setTimeout(() => {
			fetch(
				`/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=6`,
			)
				.then((res) => res.json())
				.then((data) => {
					mobileResults.innerHTML = "";
					const products = data.resources.results.products;

					if (!products || products.length === 0) {
						mobileResults.innerHTML = `<div class="result-item result-empty">No results found</div>`;
					} else {
						products.forEach((p) => {
							const available = p.available_for_sale !== false;
							const price =
								p.price_min !== undefined
									? p.price_min + " USD"
									: "";
							mobileResults.innerHTML += `
                <a href="${p.url}" class="result-item">
                  <span class="result-name">${p.title}</span>
                  <span class="result-meta">
                    ${!available ? `<span class="result-status">[sold out]</span>` : ""}
                    ${price}
                  </span>
                </a>`;
						});
					}
					mobileResults.classList.add("active");
				});
		}, 250);
	});

	document.addEventListener("click", (e) => {
		if (!e.target.closest(".search-wrapper")) {
			mobileResults.classList.remove("active");
		}
	});
}
