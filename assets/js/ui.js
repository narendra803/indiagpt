document.addEventListener("DOMContentLoaded", () => {

    /* ================= CONTACT MODAL ================= */
    const overlay = document.getElementById("contact-overlay");
    const form = overlay.querySelector("form");

    window.openContact = function () {
        overlay.style.display = "block";
    };

    window.closeContact = function () {
        overlay.style.display = "none";
        form.reset();
    };

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeContact();
    });

    /* ================= VALIDATION HELPERS ================= */

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidIndianMobile(phone) {
        return /^[6-9]\d{9}$/.test(phone);
    }

    /* ================= FORM SUBMIT ================= */

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = form.querySelector('input[type="text"]').value.trim();
        const email = form.querySelector('input[type="email"]').value.trim();
        const phone = form.querySelector('input[type="tel"]').value.trim();
        const message = form.querySelector("textarea").value.trim();

        if (!name || !email || !phone || !message) {
            alert("All fields are required.");
            return;
        }

        if (!isValidEmail(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        if (!isValidIndianMobile(phone)) {
            alert("Please enter a valid 10-digit Indian mobile number.");
            return;
        }

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, phone, message })
            });

            const result = await res.json();

            if (result.success) {
                alert("Thank you! We’ll contact you soon.");
                closeContact();
            } else {
                alert(result.error || "Submission failed.");
            }
        } catch {
            alert("Server error. Please try again.");
        }
    });
});
