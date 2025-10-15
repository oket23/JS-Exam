export class FilterService {
    constructor(options) {
        this.onFilterChange = options.onFilterChange;

        this.categorySelect = document.querySelector(options.categorySelector);
        this.searchInput = document.querySelector(options.searchSelector);
        this.sortSelect = document.querySelector(options.sortSelector);

        this._initListeners();
    }

    _initListeners() {
        this.categorySelect.addEventListener('change', () => this._handleFilterChange());
        this.searchInput.addEventListener('input', () => this._handleFilterChange());
        this.sortSelect.addEventListener('change', () => this._handleFilterChange());
    }

    _handleFilterChange() {
        const filters = {
            category: this.categorySelect.value,
            searchTerm: this.searchInput.value,
            sortMode: this.sortSelect.value
        };

        if (this.onFilterChange) {
            this.onFilterChange(filters);
        }
    }

    apply(products, filters) {
        let filteredProducts = [...products];

        if (filters.category) {
            filteredProducts = filteredProducts.filter(product =>
                product.productCategory === filters.category
            );
        }

        if (filters.searchTerm) {
            const searchTerm = filters.searchTerm.toLowerCase();
            filteredProducts = filteredProducts.filter(product =>
                product.productTitle.toLowerCase().includes(searchTerm) ||
                product.productDescription.toLowerCase().includes(searchTerm)
            );
        }

        switch (filters.sortMode) {
            case 'increasingPrice':
                filteredProducts.sort((a, b) => a.productPrice - b.productPrice);
                break;
            case 'decreasingPrice':
                filteredProducts.sort((a, b) => b.productPrice - a.productPrice);
                break;
            case 'newest':
                filteredProducts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
                break;
            case 'oldest':
                filteredProducts.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
                break;
        }

        return filteredProducts;
    }
}