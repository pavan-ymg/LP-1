/* -----------------------------------------
   1. TEL LINKS (Fix click delay on mobile)
----------------------------------------- */
document.querySelectorAll('a[href^="tel:"]').forEach(a => {
    a.addEventListener('click', function () {
        setTimeout(() => {
            window.location.href = this.getAttribute('href');
        }, 120);
    });
});


/* -----------------------------------------
   2. Smooth Scroll (safe for modal triggers)
----------------------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", function (e) {
        const target = document.querySelector(this.getAttribute("href"));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
    });
});


/* -----------------------------------------
   3. Counter Animation
----------------------------------------- */
const counters = document.querySelectorAll('.counter');
const speed = 80;

const runCounter = () => {
    counters.forEach(counter => {
        const update = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            const increment = target / speed;

            if (count < target) {
                counter.innerText = Math.ceil(count + increment);
                setTimeout(update, 20);
            } else {
                counter.innerText = target;
            }
        };
        update();
    });
};

let started = false;

window.addEventListener('scroll', () => {
    const stats = document.querySelector('#stats');
    if (stats && !started && window.scrollY > stats.offsetTop - window.innerHeight + 200) {
        runCounter();
        started = true;
    }
});


/* -----------------------------------------
   4. Success Animation Modal
----------------------------------------- */
function showSuccessAnimation(form) {
    if (form.id === "modalClaimForm") {
        const modal = bootstrap.Modal.getInstance(document.getElementById("claimModal"));
        if (modal) modal.hide();

        setTimeout(() => {
            document.getElementById("successAnimation").classList.add("active");
        }, 400);

        setTimeout(() => {
            document.getElementById("successAnimation").classList.remove("active");
        }, 2400);

        form.reset();
        return;
    }

    document.getElementById("successAnimation").classList.add("active");
    setTimeout(() => {
        document.getElementById("successAnimation").classList.remove("active");
    }, 2400);

    form.reset();
}


/* -----------------------------------------
   5. LOCAL PHP SUBMISSION HANDLER (NEW)
----------------------------------------- */
function setupPhpFormSubmission(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalHTML = submitBtn.innerHTML;

        submitBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm"></span> Submitting...
        `;
        submitBtn.disabled = true;

        const formData = new FormData(form);

        try {
            await fetch("submit.php", {
                method: "POST",
                body: formData
            });

            showSuccessAnimation(form);

        } catch (error) {
            alert("Error sending form. Please try again.");
        }

        setTimeout(() => {
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
        }, 2500);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupPhpFormSubmission("claimForm");
    setupPhpFormSubmission("modalClaimForm");
});


/* -----------------------------------------
   6. Injuries — Show/Hide "Other" Field
----------------------------------------- */
const injOther = document.getElementById("injOther");
const injOtherText = document.getElementById("injOtherText");

if (injOther && injOtherText) {
    injOther.addEventListener("change", () => {
        injOtherText.classList.toggle("d-none", !injOther.checked);
        injOtherText.required = injOther.checked;
        if (!injOther.checked) injOtherText.value = "";
    });
}


/* -----------------------------------------
   7. FORM VALIDATION HELPERS
----------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('input', e => {
            if (e.target.required && e.target.value.trim()) {
                e.target.classList.remove('is-invalid');
            }
        });
    });
});
