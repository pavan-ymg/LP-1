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

        // If it's a modal trigger — DO NOT smooth scroll
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
// function showSuccessAnimation() {
//     const el = document.getElementById("successAnimation");
//     el.classList.add("active");

//     setTimeout(() => {
//         el.classList.remove("active");
//     }, 2200);
// }


function showSuccessAnimation(form) {

    // If this is the modal form → close modal BEFORE animation
    if (form.id === "modalClaimForm") {
        const modal = bootstrap.Modal.getInstance(document.getElementById("claimModal"));
        if (modal) modal.hide();

        // Delay so modal backdrop disappears, then show animation
        setTimeout(() => {
            document.getElementById("successAnimation").classList.add("active");
        }, 400);

        setTimeout(() => {
            document.getElementById("successAnimation").classList.remove("active");
        }, 2400);

        form.reset();
        return;
    }

    // MAIN FORM (normal)
    document.getElementById("successAnimation").classList.add("active");

    setTimeout(() => {
        document.getElementById("successAnimation").classList.remove("active");
    }, 2400);

    form.reset();
}


/* GOOGLE FORM SUBMISSION HANDLER */
function setupFormSubmission(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = new FormData();

        // Map fields to Google Form entry IDs
        data.append("entry.471263482", form.dateIncident.value);
        data.append("entry.2147185536", form.fault.value);
        data.append("entry.735364438", form.injured.value);
        data.append("entry.1555922417", form.ambulance.value);
        data.append("entry.1275153243", form.emergencyRoom.value);

        // Injuries[] (checkboxes)
        form.querySelectorAll("input[name='injuries[]']:checked").forEach(cb => {
            data.append("entry.2067095679", cb.value);
        });

        data.append("entry.1513166168", form.attorneyHelp.value);
        data.append("entry.706026317", form.propertyDamage.value);
        data.append("entry.508102148", form.state.value);
        data.append("entry.1429171366", form.city.value);
        data.append("entry.682378800", form.vehicleType.value);
        data.append("entry.770407118", form.caseDescription.value);

        // Contact info
        data.append("entry.376735095", form.firstName.value);
        data.append("entry.1038562843", form.lastName.value);
        data.append("entry.100931319", form.phone.value);
        data.append("entry.1965612719", form.email.value);

        const googleURL =
            "https://docs.google.com/forms/d/e/1FAIpQLScLGGD6vA1gy17t_Nue4vJUkhisJnmRpvfl3JL-vdxjegsjeQ/formResponse";

        try {
            await fetch(googleURL, {
                method: "POST",
                body: data,
                mode: "no-cors",
            });

            showSuccessAnimation(); // your animation

            form.reset();

        } catch (error) {
            console.error("Google Form Submission Error:", error);
            alert("Something went wrong. Please try again.");
        }
    });
}

setupFormSubmission("claimForm");
setupFormSubmission("modalClaimForm");

/* -----------------------------------------
   6. Injuries — Show/Hide “Other” Field
----------------------------------------- */
const injOther = document.getElementById("injOther");
const injOtherText = document.getElementById("injOtherText");

if (injOther && injOtherText) {
    injOther.addEventListener("change", () => {
        if (injOther.checked) {
            injOtherText.classList.remove("d-none");
            injOtherText.required = true;
        } else {
            injOtherText.classList.add("d-none");
            injOtherText.required = false;
            injOtherText.value = "";
        }
    });
}
