export class ProductService {
    constructor(options) {
        this.form = document.querySelector(options.formSelector);
        this.modalOverlay = document.querySelector(options.modalOverlaySelector);
        this.createBtn = document.querySelector(options.createBtnSelector);
        this.submitBtn = document.querySelector(options.submitBtnSelector);

        this.validator = options.validator;
        this.onProductsChange = options.onProductsChange;

        this.editingProductId = null;
        this.submitBtn.disabled = true;

        const savedProductsJSON = localStorage.getItem("products");
        this.products = savedProductsJSON ? JSON.parse(savedProductsJSON) : [];

        this._initListeners();
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

    _handleSubmit(e) {
        e.preventDefault();

        let isValid = true;
        this.form.querySelectorAll("input, textarea, select").forEach((el) => {
            this.validator(el);
            if (!el.checkValidity()) {
                isValid = false;
            }
        });

        if (isValid) {
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData.entries());

            if (data.productPrice !== undefined) data.productPrice = parseFloat(data.productPrice);
            if (data.productDiscount !== undefined) data.productDiscount = parseFloat(data.productDiscount);

            if (this.editingProductId) {
                const productIndex = this.products.findIndex(p => p.id === this.editingProductId);
                if (productIndex !== -1) {
                    this.products[productIndex] = { ...data, id: this.editingProductId };
                }
            } 
            else {
                data.id = crypto.randomUUID();
                this.products.push(data);
            }

            localStorage.setItem("products", JSON.stringify(this.products));
            if (this.onProductsChange) {
                this.onProductsChange(this.products);
            }

            this.closeModal();
        } 
        else {
            this.toggleSubmitBtn();
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
    
    deleteProduct(id) {
        const productIndex = this.products.findIndex(p => p.id === id);

        if (productIndex !== -1) {
            this.products.splice(productIndex, 1);

            localStorage.setItem("products", JSON.stringify(this.products));

            if (this.onProductsChange) {
                this.onProductsChange(this.products);
            }
        }
    }

}
