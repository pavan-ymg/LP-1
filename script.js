/* ------------------------------
   TEL LINKS (Fix click delay)
------------------------------ */
document.querySelectorAll('a[href^="tel:"]').forEach(a => {
    a.addEventListener('click', function () {
        setTimeout(() => { window.location.href = this.getAttribute('href'); }, 200);
    });
});

/* ------------------------------
   Smooth Scroll
------------------------------ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", function (e) {
        const target = document.querySelector(this.getAttribute("href"));
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
    });
});

/* ------------------------------
   Counter Animation
------------------------------ */
const counters = document.querySelectorAll('.counter');
const speed = 80;

const runCounter = () => {
    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.dataset.target;
            const count = +counter.innerText;
            const inc = target / speed;

            if (count < target) {
                counter.innerText = Math.ceil(count + inc);
                setTimeout(updateCount, 20);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    });
};

let started = false;
window.addEventListener('scroll', () => {
    const statsSection = document.querySelector('#stats');
    if (statsSection && !started &&
        window.scrollY > statsSection.offsetTop - window.innerHeight + 200) {
        runCounter();
        started = true;
    }
});

/* ------------------------------
   Multi-Step Form Logic
------------------------------ */
function showStep(step) {
    document.querySelectorAll('.step').forEach(s => s.classList.add('d-none'));
    document.getElementById('step' + step).classList.remove('d-none');

    const wrapper = document.querySelector('.form-wrapper');
    if (wrapper) {
        window.scrollTo({
            top: wrapper.offsetTop - 60,
            behavior: "smooth"
        });
    }
}
window.showStep = showStep;

/* ------------------------------
   Other Injury Toggle
------------------------------ */
const injOtherCheckbox = document.getElementById("injOther");
const injOtherText = document.getElementById("injOtherText");

if (injOtherCheckbox) {
    injOtherCheckbox.addEventListener("change", function () {
        if (this.checked) {
            injOtherText.classList.remove("d-none");
            injOtherText.required = true;
        } else {
            injOtherText.classList.add("d-none");
            injOtherText.required = false;
            injOtherText.value = "";
        }
    });
}

/* ------------------------------
   GOOGLE FORM SUBMISSION
------------------------------ */
const claimForm = document.getElementById("claimForm");
const successBox = document.getElementById("successAnimation");

if (claimForm) {
    claimForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const form = e.target;
        const data = new FormData();

        // Step 1
        data.append("entry.542115974", form.dateIncident.value);
        data.append("entry.1967796353", form.fault.value);
        data.append("entry.1194857749", form.injured.value);
        data.append("entry.1758807391", form.ambulance.value);
        data.append("entry.1708161178", form.emergencyRoom.value);

        document.querySelectorAll("input[name='injuries[]']:checked").forEach(cb => {
            data.append("entry.568188935", cb.value);
        });

        if (injOtherCheckbox?.checked && injOtherText.value.trim() !== "") {
            data.append("entry.568188935", injOtherText.value.trim());
        }

        data.append("entry.1285187423", form.attorneyHelp.value);
        data.append("entry.1774776280", form.caseDescription.value);
        data.append("entry.1829424868", form.vehicleType.value);
        data.append("entry.1456507434", form.state.value);
        data.append("entry.2083390486", form.city.value);

        // Step 2
        data.append("entry.223127181", form.firstName.value);
        data.append("entry.889533505", form.lastName.value);
        data.append("entry.1238482112", form.phone.value);
        data.append("entry.942245524", form.email.value);

        // Correct Google Form endpoint
        const googleFormURL =
            "https://docs.google.com/forms/d/e/1FAIpQLSeMwW3ummNim_Uo_ja2LhZyM0RU9GuecekGtfjAH5-R9lmzFw/formResponse";

        fetch(googleFormURL, {
            method: "POST",
            body: data,
            mode: "no-cors"
        }).then(() => {
            // Hide form, show animation
            claimForm.classList.add("d-none");
            if (successBox) successBox.classList.remove("d-none");

            setTimeout(() => {
                if (successBox) successBox.classList.add("d-none");
                claimForm.classList.remove("d-none");

                form.reset();
                showStep(1);
            }, 3000);
        })
        .catch(err => {
            console.error("Submission Error:", err);
            alert("Something went wrong. Please try again.");
        });
    });
}

/* ------------------------------
   Modal Step Logic
------------------------------ */
function showModalStep(step) {
    document.querySelectorAll('#claimModal .step').forEach(s => s.classList.add('d-none'));
    document.getElementById('modalStep' + step).classList.remove('d-none');
}
