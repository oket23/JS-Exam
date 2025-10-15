import { CardService } from './CardService.js';
import { ProductService } from './ProductService.js';
import { ProductValidator } from './ProductValidator.js';
import { ConfirmationService } from './ConfirmationService.js';
import { FilterService } from './FilterService.js';

const productService = new ProductService({ 
    submitBtnSelector: "#submitBtn",
    createBtnSelector: "#createBtn",
    modalOverlaySelector: ".modal-overlay",
    formSelector: "#productForm",
    validator: ProductValidator.validateField,
    onProductsChange: (products) => {
        cardService.render(products);
    }
});

const confirmationService = new ConfirmationService({
    overlaySelector: '#confirmOverlay',
    messageSelector: '#confirmMessage',
    yesBtnSelector: '#confirmBtnYes',
    noBtnSelector: '#confirmBtnNo'
});

const cardService = new CardService({
    containerSelector: ".products-container",
    onEdit: (id) => {
        productService.editProduct(id);
    },
    onDelete: async (id) => {
        const message = "Ви впевнені, що хочете видалити цей продукт?";
        const isConfirmed = await confirmationService.confirm(message);

        if (isConfirmed) {
            productService.deleteProduct(id);
        }
    }
});

const filterService = new FilterService({
    categorySelector: 'select[name="sortCategory"]',
    searchSelector: 'input[name="searchProduct"]',
    sortSelector: 'select[name="sortModes"]',
    onFilterChange: (filters) => {
        updateView(filters);
    }
});

function updateView(filters = {}) {
    const allProducts = productService.getProducts();
    const productsToRender = filterService.apply(allProducts, filters);
    cardService.render(productsToRender);
}

productService.onProductsChange = () => {
    const currentFilters = {
        category: document.querySelector('select[name="sortCategory"]').value,
        searchTerm: document.querySelector('input[name="searchProduct"]').value,
        sortMode: document.querySelector('select[name="sortModes"]').value
    };
    updateView(currentFilters);
};

updateView();

