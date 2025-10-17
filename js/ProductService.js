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

    _transformProductData(productFromApi) {
        return {
            id: productFromApi.id,
            productTitle: productFromApi.title,
            productDescription: productFromApi.description,
            productPrice: productFromApi.price,
            productDiscount: productFromApi.discountPercentage,
            productCategory: productFromApi.category,
            productImgLink: productFromApi.thumbnail,
            createdAt: productFromApi.meta.createdAt,
            updatedAt: productFromApi.meta.updatedAt
        };
    }

    async init() {
        const savedProductsJSON = localStorage.getItem("products");
        const lastFetchTime = localStorage.getItem("products_last_fetch");
        const CACHE_DURATION = 10 * 60 * 1000;

        if (savedProductsJSON && lastFetchTime && (Date.now() - lastFetchTime < CACHE_DURATION)) {
            this.products = JSON.parse(savedProductsJSON);
        } 
        else {
            try {
                const response = await fetch(this.apiUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const productsFromApi = await response.json();
                this.products = productsFromApi.map(p => this._transformProductData(p));
                localStorage.setItem("products", JSON.stringify(this.products));
                localStorage.setItem("products_last_fetch", Date.now());
            } 
            catch (error) {
                console.error("Could not fetch products from API:", error);
                this.products = savedProductsJSON ? JSON.parse(savedProductsJSON) : [];
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
        this.form.querySelector("input, textarea, select")?.focus();
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
        this.validator(event.target);
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

            const dataToSend = {
                title: data.productTitle,
                description: data.productDescription,
                price: parseFloat(data.productPrice),
                discountPercentage: parseFloat(data.productDiscount), 
                category: data.productCategory,
                thumbnail: data.productImgLink,
                meta: {}
            };

            try {
                let response;
                if (this.editingProductId) {
                    const originalProduct = this.products.find(p => p.id === this.editingProductId);
                    dataToSend.id = this.editingProductId;
                    dataToSend.meta = {
                        createdAt: originalProduct.createdAt,
                        updatedAt: new Date().toISOString()
                    };

                    response = await fetch(`${this.apiUrl}/${this.editingProductId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(dataToSend)
                    });
                } 
                else {
                    response = await fetch(this.apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(dataToSend)
                    });
                }

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Server error: ${response.status}. Details: ${errorText}`);
                }
                
                if (response.status === 204) {
                    const productIndex = this.products.findIndex(p => p.id === this.editingProductId);
                    if (productIndex !== -1) {
                        const originalProduct = this.products[productIndex];
                        this.products[productIndex] = {
                            ...originalProduct,
                            productTitle: data.productTitle,
                            productDescription: data.productDescription,
                            productPrice: parseFloat(data.productPrice),
                            productDiscount: parseFloat(data.productDiscount),
                            productCategory: data.productCategory,
                            productImgLink: data.productImgLink,
                        };
                    }
                } 
                else {
                    const resultProduct = await response.json();
                    if (this.editingProductId) {
                         const productIndex = this.products.findIndex(p => p.id === this.editingProductId);
                         if (productIndex !== -1) this.products[productIndex] = this._transformProductData(resultProduct);
                    } 
                    else {
                         this.products.push(this._transformProductData(resultProduct));
                    }
                }

                localStorage.setItem("products", JSON.stringify(this.products));
                this.onProductsChange?.();
                this.closeModal();

            } catch (error) {
                console.error("Failed to save product:", error);
                alert(`Не вдалося зберегти продукт. Перевірте консоль.`);
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
                this.onProductsChange?.();
            }
        } 
        catch (error) {
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