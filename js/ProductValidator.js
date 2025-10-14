export class ProductValidator {
    static validateField(field) {
        const urlPattern = /^(https?|ftp):\/\/\S+$/;
        const errorEl = field.parentElement.querySelector(".error");

        if (!errorEl) return;
        errorEl.textContent = "";
        field.setCustomValidity("");

        if (field.name === "productTitle") {
            const v = field.value.trim();
            if (v.length < 2) {
                field.setCustomValidity("Назва має містити щонайменше 2 символи");
                errorEl.textContent = "Назва має містити щонайменше 2 символи";
            }
        }

        if (field.name === "productDescription") {
            const v = field.value.trim();
            if (v.length < 1) {
                field.setCustomValidity("Опис має містити щонайменше 1 символ");
                errorEl.textContent = "Опис має містити щонайменше 1 символ";
            }
        }

        if (field.name === "productCategory") {
            const v = field.value.trim();
            if (v === "") {
                field.setCustomValidity("Оберіть категорію товару");
                errorEl.textContent = "Оберіть категорію товару";
            }
        }

        if (field.name === "productPrice") {
            const raw = field.value.trim();
            if (raw === "") {
                field.setCustomValidity("Вкажіть ціну товару");
                errorEl.textContent = "Вкажіть ціну товару";
            } else {
                const v = parseFloat(raw);
                if (Number.isNaN(v) || v < 0.1) {
                    field.setCustomValidity("Ціна має бути більше 0");
                    errorEl.textContent = "Ціна має бути більше 0";
                }
            }
        }

        if (field.name === "productDiscount") {
            const raw = field.value.trim();
            if (raw === "") {
                field.setCustomValidity("Вкажіть розмір знижки");
                errorEl.textContent = "Вкажіть розмір знижки";
            } else {
                const v = parseFloat(raw);
                if (Number.isNaN(v) || v < 0.1 || v > 100) { 
                    field.setCustomValidity("Знижка має бути в межах 0.1–100%");
                    errorEl.textContent = "Знижка має бути в межах 0.1–100%";
                }
            }
        }

        if (field.name === "productImgLink") {
            const v = field.value.trim();
            if (!urlPattern.test(v)) {
                field.setCustomValidity("Невірний формат URL (https://example.com)");
                errorEl.textContent = "Невірний формат URL (https://example.com)";
            }
        }

        errorEl.style.display = errorEl.textContent ? "block" : "none";
    }
}