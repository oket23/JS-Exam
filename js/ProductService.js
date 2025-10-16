export class ProductService {
    constructor(options) {
        this.form = document.querySelector(options.formSelector);
        this.modalOverlay = document.querySelector(options.modalOverlaySelector);
        this.createBtn = document.querySelector(options.createBtnSelector);
        this.submitBtn = document.querySelector(options.submitBtnSelector);

        this.validator = options.validator;
        this.onProductsChange = options.onProductsChange;

        this.apiUrl = options.apiUrl;

        this.editingProductId = null;
        this.submitBtn.disabled = true;
        this.products = [];

        this._initListeners();
    }

    async init() {
        const savedProductsJSON = localStorage.getItem("products");
        const lastFetchTime = localStorage.getItem("products_last_fetch");
        const CACHE_DURATION = 10 * 60 * 1000;

        if (savedProductsJSON && lastFetchTime && (Date.now() - lastFetchTime < CACHE_DURATION)) {
            this.products = JSON.parse(savedProductsJSON);
        } else {
            try {
                const response = await fetch(this.apiUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const productsFromApi = await response.json();

                this.products = productsFromApi;

                localStorage.setItem("products", JSON.stringify(this.products));
                localStorage.setItem("products_last_fetch", Date.now());
            } catch (error) {
                console.error("Could not fetch products from API:", error);
                if (savedProductsJSON) this.products = JSON.parse(savedProductsJSON);
            }
        }
    }

    _initListeners() {
        this.createBtn.addEventListener("click", () => this.openModal());
        this.modalOverlay.addEventListener("click", (e) => {
            if (e.target.dataset.close || e.target === this.modalOverlay) {
                this.closeModal();
            }
        });
        this.form.addEventListener("submit", (e) => this._handleSubmit(e));
        this.form.querySelectorAll("input, textarea, select").forEach((el) => {
            el.addEventListener("input", (event) => this._handleFieldValidation(event));
            el.addEventListener("blur", (event) => this._handleFieldValidation(event));
        });
    }

    openModal() {
        this.modalOverlay.style.display = "grid";
        const first = this.form.querySelector("input, textarea, select");
        if (first) {
            first.focus();
        }
        document.body.style.overflow = "hidden";
        this.toggleSubmitBtn();
    }

    closeModal() {
        this.modalOverlay.style.display = "none";
        document.body.style.overflow = "";
        this.submitBtn.disabled = true;
        this.form.reset();
        this.form.querySelectorAll(".error").forEach((el) => (el.textContent = ""));
        this.editingProductId = null;
        this.modalOverlay.querySelector('.modal-title').textContent = 'Create product';
        this.submitBtn.textContent = 'Save product';
    }

    toggleSubmitBtn() {
        this.submitBtn.disabled = !this.form.checkValidity();
    }

    _handleFieldValidation(event) {
        const field = event.target;
        this.validator(field);
        this.toggleSubmitBtn();
    }


    async _handleSubmit(e) {
        e.preventDefault();
        let isValid = true;
        this.form.querySelectorAll("input, textarea, select").forEach((el) => {
            this.validator(el);
            if (!el.checkValidity()) isValid = false;
        });

        if (isValid) {
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData.entries());
            data.productPrice = parseFloat(data.productPrice);
            data.productDiscount = parseFloat(data.productDiscount);

            try {
                if (this.editingProductId) {
                    const response = await fetch(`${this.apiUrl}/${this.editingProductId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    const updatedProduct = await response.json();

                    const productIndex = this.products.findIndex(p => p.id === this.editingProductId);
                    if (productIndex !== -1) {
                        this.products[productIndex] = updatedProduct;
                    }
                } else {
                    const response = await fetch(this.apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    const newProduct = await response.json();
                    this.products.push(newProduct);
                }

                localStorage.setItem("products", JSON.stringify(this.products));
                if (this.onProductsChange) {
                    this.onProductsChange();
                }
                this.closeModal();

            } catch (error) {
                console.error("Failed to save product:", error);
                alert("Не вдалося зберегти продукт. Спробуйте пізніше.");
            }
        }
    }

    async deleteProduct(id) {
        try {
            await fetch(`${this.apiUrl}/${id}`, { method: 'DELETE' });

            const productIndex = this.products.findIndex(p => p.id === id);
            if (productIndex !== -1) {
                this.products.splice(productIndex, 1);
                localStorage.setItem("products", JSON.stringify(this.products));
                if (this.onProductsChange) {
                    this.onProductsChange();
                }
            }
        } catch (error) {
            console.error("Failed to delete product:", error);
            alert("Не вдалося видалити продукт. Спробуйте пізніше.");
        }
    }
    
    getProducts() {
        return this.products;
    }

    editProduct(id) {
        const productToEdit = this.products.find(p => p.id === id);
        if (!productToEdit) return;
        this.editingProductId = id;
        this.form.productTitle.value = productToEdit.productTitle;
        this.form.productDescription.value = productToEdit.productDescription;
        this.form.productPrice.value = productToEdit.productPrice;
        this.form.productDiscount.value = productToEdit.productDiscount;
        this.form.productCategory.value = productToEdit.productCategory;
        this.form.productImgLink.value = productToEdit.productImgLink;
        this.modalOverlay.querySelector('.modal-title').textContent = 'Edit product';
        this.submitBtn.textContent = 'Save changes';
        this.openModal();
    }
}