export class ConfirmationService {
    constructor(options) {
        this.overlay = document.querySelector(options.overlaySelector);
        this.messageEl = document.querySelector(options.messageSelector);
        this.yesBtn = document.querySelector(options.yesBtnSelector);
        this.noBtn = document.querySelector(options.noBtnSelector);
    }

    confirm(message = "Are you sure?") {
        return new Promise((resolve) => {
            this.messageEl.textContent = message;
            this.overlay.style.display = 'grid';

            const handleYes = () => {
                cleanup();
                resolve(true);
            };

            const handleNo = () => {
                cleanup();
                resolve(false);
            };

            const cleanup = () => {
                this.overlay.style.display = 'none';
                this.yesBtn.removeEventListener('click', handleYes);
                this.noBtn.removeEventListener('click', handleNo);
            };

            this.yesBtn.addEventListener('click', handleYes);
            this.noBtn.addEventListener('click', handleNo);
        });
    }
}