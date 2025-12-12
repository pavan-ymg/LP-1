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
function showSuccessAnimation(form) {
    const modalHTML = `
    <div class="success-popup">
      <div class="success-check">
        <svg viewBox="0 0 52 52">
          <circle cx="26" cy="26" r="25"></circle>
          <path d="M14 27 l7 7 l17 -17"></path>
        </svg>
      </div>
      <h3 class="mt-3">Submitted Successfully!</h3>
      <p>Our team will reach out to you shortly.</p>
    </div>
  `;

    const wrapper = document.createElement("div");
    wrapper.innerHTML = modalHTML;
    wrapper.classList.add("success-container");

    form.innerHTML = "";
    form.appendChild(wrapper);
}


/* -----------------------------------------
   5. Generic Form Submission Handler
----------------------------------------- */

function setupFormSubmission(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const data = new FormData();

        /* -------------------------
           MAP FIELDS TO GOOGLE FORM
        ------------------------- */

        data.append("entry.542115974", form.dateIncident.value);
        data.append("entry.1967796353", form.fault.value);
        data.append("entry.1194857749", form.injured.value);
        data.append("entry.1758807391", form.ambulance.value);
        data.append("entry.1708161178", form.emergencyRoom.value);

        // Injuries (checkboxes)
        document.querySelectorAll(`#${formId} input[name='injuries[]']:checked`)
            .forEach(cb => data.append("entry.568188935", cb.value));

        data.append("entry.1285187423", form.attorneyHelp.value);
        data.append("entry.1774776280", form.caseDescription.value);
        data.append("entry.1829424868", form.vehicleType.value);

        data.append("entry.1456507434", form.state.value);
        data.append("entry.2083390486", form.city.value);

        // Contact info
        data.append("entry.223127181", form.firstName.value);
        data.append("entry.889533505", form.lastName.value);
        data.append("entry.1238482112", form.phone.value);
        data.append("entry.942245524", form.email.value);

        // Consent Checkbox
        data.append("entry.1410461071", form.consent.checked ? "Yes" : "No");

        /* -------------------------
           GOOGLE FORM ENDPOINT
        ------------------------- */

        const googleURL =
            "https://docs.google.com/forms/d/e/1FAIpQLSeMwW3ummNim_Uo_ja2LhZyM0RU9GuecekGtfjAH5-R9lmzFw/formResponse";

        try {
            await fetch(googleURL, {
                method: "POST",
                body: data,
                mode: "no-cors"
            });

            showSuccessAnimation(form);

        } catch (err) {
            console.error("FORM ERROR:", err);
            alert("Something went wrong. Please try again.");
        }
    });
}

/* Apply submission logic to BOTH forms */
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
