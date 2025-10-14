import { CardService } from './CardService.js';
import { ProductService } from './ProductService.js';
import { ProductValidator } from './ProductValidator.js';
import { ConfirmationService } from './ConfirmationService.js';

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

cardService.render(productService.getProducts());