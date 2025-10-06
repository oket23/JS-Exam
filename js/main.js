const products = []; 

const createBtn = document.getElementById("createBtn");
const modalOverlay = document.getElementsByClassName('modal-overlay')[0];
const form = document.getElementById("productForm");
const submitBtn = document.getElementById("submitBtn");

function openModal() {
    modalOverlay.style.display = "grid";
}

function closeModal() {
    modalOverlay.style.display = "none";
    form.reset();
}

createBtn.addEventListener("click", openModal);

modalOverlay.addEventListener("click", (e) => {
    if (e.target.dataset.close || e.target === modalOverlay) {
        closeModal();
    }
});


form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());
    
    
    products.push(data);
    console.log(data);

    closeModal();
});

submitBtn.addEventListener("click", () =>{
    
})
