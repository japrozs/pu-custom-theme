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
		hamburger.querySelector("i").classList.toggle("fa-xmark");
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

// Cart drawer
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartClose = document.getElementById("cartClose");

function openCart() {
	cartDrawer.classList.add("active");
	cartOverlay.classList.add("active");
	document.body.style.overflow = "hidden";
}

function closeCart() {
	cartDrawer.classList.remove("active");
	cartOverlay.classList.remove("active");
	document.body.style.overflow = "";
}

document.querySelectorAll(".cart-toggle").forEach((btn) => {
	btn.addEventListener("click", openCart);
});
if (cartClose) cartClose.addEventListener("click", closeCart);
if (cartOverlay) cartOverlay.addEventListener("click", closeCart);

function updateCart() {
	fetch("/cart.js")
		.then((res) => res.json())
		.then((cart) => {
			document.getElementById("cartCount").textContent = cart.item_count;
			document.getElementById("cartSubtotal").textContent =
				(cart.total_price / 100).toFixed(0) + " USD";

			const itemsEl = document.getElementById("cartItems");

			if (cart.item_count === 0) {
				itemsEl.innerHTML = `<p class="cart-empty">YOUR BAG IS EMPTY</p>`;
				return;
			}

			itemsEl.innerHTML = cart.items
				.map(
					(item) => `
        <div class="cart-item" data-key="${item.key}">
          <div class="cart-item-image">
            <img src="${item.image}" alt="${item.title}" />
          </div>
          <div class="cart-item-info">
            <div class="cart-item-name">${item.product_title}</div>
            ${
				item.variant_title && item.variant_title !== "Default Title"
					? `<div class="cart-item-variant">${item.variant_title}</div>`
					: ""
			}
            <div class="cart-item-price">${(item.price / 100).toFixed(0)} USD</div>
            <div class="cart-item-qty">
              <button class="qty-btn" data-key="${item.key}" data-qty="${item.quantity - 1}">−</button>
              <span>${item.quantity}</span>
              <button class="qty-btn" data-key="${item.key}" data-qty="${item.quantity + 1}">+</button>
            </div>
          </div>
          <button class="cart-item-remove" data-key="${item.key}"><i class="fa-solid fa-xmark"></i></button>
        </div>
      `,
				)
				.join("");

			bindCartEvents();
		});
}

function bindCartEvents() {
	document.querySelectorAll(".qty-btn").forEach((btn) => {
		btn.addEventListener("click", () => {
			const key = btn.dataset.key;
			const qty = parseInt(btn.dataset.qty);
			fetch("/cart/change.js", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id: key, quantity: qty }),
			}).then(() => updateCart());
		});
	});

	document.querySelectorAll(".cart-item-remove").forEach((btn) => {
		btn.addEventListener("click", () => {
			fetch("/cart/change.js", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id: btn.dataset.key, quantity: 0 }),
			}).then(() => updateCart());
		});
	});
}

bindCartEvents();

// Open cart automatically when item added
document.querySelectorAll(".btn-add-to-cart").forEach((btn) => {
	btn.addEventListener("click", () => {
		setTimeout(() => {
			updateCart();
			openCart();
		}, 500);
	});
});

// Add to cart
const productForm = document.querySelector(".product-actions form");
if (productForm) {
	productForm.addEventListener("submit", (e) => {
		e.preventDefault();
		const variantId = document.getElementById("variantId").value;

		fetch("/cart/add.js", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id: parseInt(variantId), quantity: 1 }),
		})
			.then((res) => {
				if (!res.ok) throw new Error("Failed to add to cart");
				return res.json();
			})
			.then(() => {
				updateCart();
				openCart();
			})
			.catch((err) => console.error("Error adding to cart:", err));
	});
}
