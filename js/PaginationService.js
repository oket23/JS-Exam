export class PaginationService {
    constructor(options) {
        this.container = document.querySelector(options.containerSelector);
        this.onPageChange = options.onPageChange;
        this.currentPage = 1;
    }

    render(totalItems, itemsPerPage, currentPage) {
        this.currentPage = currentPage;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        this.container.innerHTML = '';

        if (totalPages <= 1) return;

        this.container.appendChild(
            this._createButton('« Prev', this.currentPage - 1, this.currentPage === 1)
        );

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                this.container.appendChild(this._createButton(i, i));
            }
        } 
        else {
            this.container.appendChild(this._createButton(1, 1));
            if (currentPage > 3) this.container.appendChild(this._createDots());

            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            if (currentPage <= 2) end = 3;
            if (currentPage >= totalPages - 1) start = totalPages - 2;

            for (let i = start; i <= end; i++) {
                this.container.appendChild(this._createButton(i, i));
            }

            if (currentPage < totalPages - 2) this.container.appendChild(this._createDots());
            this.container.appendChild(this._createButton(totalPages, totalPages));
        }

        this.container.appendChild(
            this._createButton('Next »', this.currentPage + 1, this.currentPage === totalPages)
        );
    }

    _createButton(text, page, isDisabled = false) {
        const btn = document.createElement('button');
        btn.className = 'page-btn';
        btn.textContent = text;
        if (page === this.currentPage) btn.classList.add('active');
        if (isDisabled) btn.classList.add('disabled');
        
        btn.addEventListener('click', () => {
            if (!isDisabled && page !== this.currentPage && this.onPageChange) {
                this.onPageChange(page);
            }
        });
        return btn;
    }

    _createDots() {
        const dots = document.createElement('span');
        dots.className = 'dots';
        dots.textContent = '...';
        return dots;
    }
}