export class CardService {
    constructor(options) {
        this.container = document.querySelector(options.containerSelector);
        this.onEdit = options.onEdit;
        this.onDelete = options.onDelete;
    }

    render(products) {
        this.container.innerHTML = '';

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'card';

            card.innerHTML = `
                <div class="card-img">
                    <img src="${product.productImgLink}" alt="${product.productTitle}" />
                </div>
                <div class="discount">${parseFloat(product.productDiscount).toFixed(2)}%</div>
                <div class="category">${product.productCategory}</div>
                <div class="card-content">
                    <h3>${product.productTitle}</h3>
                    <p>${product.productDescription}</p>
                    <div class="price-cart">
                        <span class="price">${parseFloat(product.productPrice).toFixed(2)} $</span>
                        <div class="card-actions">
                            <span class="action-btn edit-btn fa fa-edit"></span>      <span class="action-btn delete-btn fa fa-trash"></span>    </div>
                        </div>
                    </div>
                </div>`;

            const editBtn = card.querySelector('.edit-btn');
            const deleteBtn = card.querySelector('.delete-btn');

            editBtn.addEventListener('click', () => {
                if (this.onEdit) {
                    this.onEdit(product.id);
                }
            });
            deleteBtn.addEventListener('click', () => {
                if (this.onDelete) {
                    this.onDelete(product.id);
                }
            });

            this.container.appendChild(card);
        });
    }
}