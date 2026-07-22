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
		if (btn.classList.contains("unavailable")) return;

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

			document.querySelectorAll(".cart-count").forEach((el) => {
				el.textContent = cart.item_count;
			});

			document.getElementById("cartSubtotal").textContent =
				(cart.total_price / 100).toFixed(0) + " USD";

			const itemsEl = document.getElementById("cartItems");
			// document.getElementById("cartCount").textContent = cart.item_count;
			// document.getElementById("cartSubtotal").textContent =
			// 	(cart.total_price / 100).toFixed(0) + " USD";

			// const itemsEl = document.getElementById("cartItems");

			if (cart.item_count === 0) {
				itemsEl.innerHTML = `<div class="cart-empty-images">
			<img src="https://cdn.shopify.com/s/files/1/0968/9579/5505/files/cart-one.png?v=1781759168" alt="" />
			<img src="https://cdn.shopify.com/s/files/1/0968/9579/5505/files/cart-two.png?v=1781759168" alt="" />
			<img src="https://cdn.shopify.com/s/files/1/0968/9579/5505/files/cart-three.png?v=1781759168" alt="" />
			<img src="https://cdn.shopify.com/s/files/1/0968/9579/5505/files/cart-four.png?v=1781759168" alt="" />
		</div`;
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
          <button class="cart-item-remove" data-key="${item.key}">[REMOVE]</button>
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

const MORSE = {
	a: ".-",
	b: "-...",
	c: "-.-.",
	d: "-..",
	e: ".",
	f: "..-.",
	g: "--.",
	h: "....",
	i: "..",
	j: ".---",
	k: "-.-",
	l: ".-..",
	m: "--",
	n: "-.",
	o: "---",
	p: ".--.",
	q: "--.-",
	r: ".-.",
	s: "...",
	t: "-",
	u: "..-",
	v: "...-",
	w: ".--",
	x: "-..-",
	y: "-.--",
	z: "--..",
	" ": " ",
};

// morse code display settings
const dot = 2; // size of a dot
const dash = 4; // size of a dash
const symbolGap = 3; // gap between symbols within a letter
const letterGap = 8; // gap between letters
const wordGap = 8; // gap between words
const strokeWidth = 2.5; // thickness of the line
const strokeColor = encodeURIComponent("#ddd"); // just change #111 to any color

function nameToStrokeDasharray(name) {
	let pattern = [];

	for (const char of name.toLowerCase().replace(/\s+/g, "")) {
		if (char === " ") {
			if (pattern.length > 0) {
				pattern[pattern.length - 1] += wordGap;
			}
			continue;
		}
		const morse = MORSE[char];
		if (!morse) continue;
		for (let i = 0; i < morse.length; i++) {
			pattern.push(morse[i] === "." ? dot : dash);
			pattern.push(i < morse.length - 1 ? symbolGap : letterGap);
		}
	}

	return pattern.join(",");
}

document.querySelectorAll(".card").forEach((card) => {
	const name = card
		.querySelector(".product-name")
		.childNodes[0].textContent.trim();
	const dasharray = nameToStrokeDasharray(name + " * FUCK THE RULES");
	const svg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Crect width='100%25' height='100%25' fill='none' stroke='${strokeColor}' stroke-width='${strokeWidth}' stroke-dasharray='${dasharray}'/%3E%3C/svg%3E")`;
	console.log(svg);
	card.querySelector(".image-box").style.backgroundImage = svg;
});

document.querySelectorAll("li").forEach((li) => {
	if (li.textContent.trim() === "FTR") {
		li.style.color = "#ff1b4d";
	}
});

const sizeGuideBtn = document.getElementById("sizeGuideBtn");
const sizeGuideOverlay = document.getElementById("sizeGuideOverlay");
const sizeGuideClose = document.getElementById("sizeGuideClose");

if (sizeGuideBtn && sizeGuideOverlay) {
	sizeGuideBtn.addEventListener("click", (e) => {
		e.preventDefault();
		sizeGuideOverlay.classList.add("active");
		document.body.style.overflow = "hidden";
	});

	sizeGuideClose.addEventListener("click", () => {
		sizeGuideOverlay.classList.remove("active");
		document.body.style.overflow = "";
	});

	sizeGuideOverlay.addEventListener("click", (e) => {
		if (e.target === sizeGuideOverlay) {
			sizeGuideOverlay.classList.remove("active");
			document.body.style.overflow = "";
		}
	});
}

const mainImage = document.getElementById("mainImage");
const thumbs = document.querySelectorAll(".thumb-box");
const carouselPrev = document.getElementById("carouselPrev");
const carouselNext = document.getElementById("carouselNext");
let currentIndex = 0;

function setActiveImage(index) {
	if (!thumbs[index]) return;
	currentIndex = index;
	mainImage.src = thumbs[index].dataset.imageUrl;
	thumbs.forEach((t) => t.classList.remove("active"));
	thumbs[index].classList.add("active");
}

thumbs.forEach((thumb) => {
	thumb.addEventListener("click", () => {
		setActiveImage(parseInt(thumb.dataset.index));
	});
});

if (carouselPrev && carouselNext) {
	carouselPrev.addEventListener("click", () => {
		const newIndex = (currentIndex - 1 + thumbs.length) % thumbs.length;
		setActiveImage(newIndex);
	});

	carouselNext.addEventListener("click", () => {
		const newIndex = (currentIndex + 1) % thumbs.length;
		setActiveImage(newIndex);
	});
}

async function updateSidebarInfo() {
	// Time
	const now = new Date();
	const time = now.toLocaleTimeString("en-US", {
		timeZone: "America/New_York",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
	const timeEl = document.getElementById("sidebarTime");
	if (timeEl) timeEl.textContent = time;

	// Temperature — Atlanta coordinates
	try {
		const res = await fetch(
			"https://api.open-meteo.com/v1/forecast?latitude=33.749&longitude=-84.388&current=temperature_2m&temperature_unit=fahrenheit&timezone=America%2FNew_York",
		);
		const data = await res.json();
		const temp = Math.round(data.current.temperature_2m);
		const tempEl = document.getElementById("sidebarTemp");
		if (tempEl) tempEl.textContent = temp + "°F";
	} catch {
		const tempEl = document.getElementById("sidebarTemp");
		if (tempEl) tempEl.textContent = "--°F";
	}
}

updateSidebarInfo();
setInterval(updateSidebarInfo, 60000);

document.addEventListener("DOMContentLoaded", () => {
	const titleHighlight = document.querySelector(".product-title-highlight");
	if (!titleHighlight) return;

	titleHighlight.innerHTML = titleHighlight.innerHTML.replace(
		/(\[[A-Z\s]+\])(?=\])/,
		(match) => `<span class="product-title-color">${match}</span>`,
	);
});
