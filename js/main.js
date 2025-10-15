import { CardService } from './CardService.js';
import { ProductService } from './ProductService.js';
import { ProductValidator } from './ProductValidator.js';
import { ConfirmationService } from './ConfirmationService.js';
import { FilterService } from './FilterService.js';
import { PaginationService } from './PaginationService.js';

let currentPage = 1;
const ITEMS_PER_PAGE = 10; 

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

const paginationService = new PaginationService({
    containerSelector: '#pagination-container',
    onPageChange: (newPage) => {
        currentPage = newPage;
        updateView(); 
    }
});

function updateView() {
    const allProducts = productService.getProducts();
    
    const currentFilters = {
        category: document.querySelector('select[name="sortCategory"]').value,
        searchTerm: document.querySelector('input[name="searchProduct"]').value,
        sortMode: document.querySelector('select[name="sortModes"]').value
    };
    
    const filteredProducts = filterService.apply(allProducts, currentFilters);

    paginationService.render(filteredProducts.length, ITEMS_PER_PAGE, currentPage);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    cardService.render(paginatedProducts);
}

filterService.onFilterChange = (filters) => {
    currentPage = 1;
    updateView();
};

productService.onProductsChange = () => {
    updateView(); 
};

updateView();

