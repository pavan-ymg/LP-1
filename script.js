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


/* -----------------------------------------
   5. GOOGLE FORM SUBMISSION HANDLER (UPDATED)
----------------------------------------- */
function setupFormSubmission(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Validate form
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Get submit button and save original state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        const originalHTML = submitBtn.innerHTML;
        
        // Set loading state
        submitBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Submitting...
        `;
        submitBtn.disabled = true;

        const data = new FormData();

        // Map fields to Google Form entry IDs
        data.append("entry.471263482", form.dateIncident.value);
        data.append("entry.2147185536", form.fault.value);
        data.append("entry.735364438", form.injured.value);
        data.append("entry.1555922417", form.ambulance.value);
        data.append("entry.1275153243", form.emergencyRoom.value);

        // Injuries[] (checkboxes) - handle both forms
        const injuryCheckboxes = form.querySelectorAll("input[name='injuries[]']:checked");
        if (injuryCheckboxes.length > 0) {
            injuryCheckboxes.forEach(cb => {
                data.append("entry.2067095679", cb.value);
            });
        } else {
            // If no injuries checked, send empty value
            data.append("entry.2067095679", "");
        }

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

        // Consent checkbox
        // const consentCheckbox = form.querySelector('#consent');
        // if (consentCheckbox) {
        //     data.append("entry.000000001", consentCheckbox.checked ? "Yes" : "No");
        // }

        const googleURL = "https://docs.google.com/forms/d/e/1FAIpQLScLGGD6vA1gy17t_Nue4vJUkhisJnmRpvfl3JL-vdxjegsjeQ/formResponse";

        try {
            // Send to server-side relay which will forward to Google Forms (avoids CORS and framing issues)
            const relayUrl = '/submit.php';

            // Build a plain object representation of the FormData so we can log exactly
            // what will be posted to the relay (group duplicate keys into arrays).
            const payload = {};
            for (const pair of data.entries()) {
                const key = pair[0];
                const val = pair[1];
                if (Object.prototype.hasOwnProperty.call(payload, key)) {
                    if (Array.isArray(payload[key])) payload[key].push(val);
                    else payload[key] = [payload[key], val];
                } else {
                    payload[key] = val;
                }
            }

            console.log(`Posting to relay ${relayUrl} — formId=${formId}`);
            console.log('Payload:', payload);
            try { console.table(payload); } catch (err) { /* ignore */ }

            const response = await fetch(relayUrl, {
                method: 'POST',
                body: data,
                credentials: 'same-origin'
            });

            let json = null;
            try { json = await response.json(); } catch (err) { /* ignore */ }

            if (response.ok && json && json.success) {
                showSuccessAnimation(form);
                console.log(`Form ${formId} relayed successfully`, json);
            } else {
                console.error('Relay submission failed', response.status, json);
                alert("We're having trouble submitting your form. Please try again in a moment, or call us directly at (424) 447-1147.");
                submitBtn.innerHTML = originalHTML;
                submitBtn.disabled = false;
                return;
            }

        } catch (error) {
            console.error("Relay Submission Error:", error);
            alert("We're having trouble submitting your form. Please try again in a moment, or call us directly at (424) 447-1147.");
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
            return;
        }

        // Restore button after success (with delay)
        setTimeout(() => {
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
        }, 2500);
    });
}

// Initialize both forms
document.addEventListener('DOMContentLoaded', () => {
    setupFormSubmission("claimForm");
    setupFormSubmission("modalClaimForm");
});


/* -----------------------------------------
   6. Injuries — Show/Hide "Other" Field
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


/* -----------------------------------------
   7. FORM VALIDATION HELPERS
----------------------------------------- */
function validateForm(form) {
    // Check all required fields
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
        }
    });
    
    return isValid;
}

// Add validation styling
document.addEventListener('DOMContentLoaded', () => {
    // Add validation listeners to all forms
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('input', (e) => {
            if (e.target.hasAttribute('required')) {
                if (e.target.value.trim()) {
                    e.target.classList.remove('is-invalid');
                }
            }
        });
        
        form.addEventListener('change', (e) => {
            if (e.target.hasAttribute('required')) {
                if (e.target.value.trim()) {
                    e.target.classList.remove('is-invalid');
                }
            }
        });
    });
});


/* -----------------------------------------
   8. DEBUG MODE (Optional - enable for testing)
----------------------------------------- */
const DEBUG_MODE = false; // Set to true to enable debugging

if (DEBUG_MODE) {
    // Test Google Form connection
    async function testGoogleFormConnection() {
        console.log("Testing Google Form connection...");
        
        const testData = new FormData();
        testData.append("entry.376735095", "Test First");
        testData.append("entry.1038562843", "Test Last");
        testData.append("entry.100931319", "555-555-5555");
        testData.append("entry.1965612719", "test@example.com");
        testData.append("entry.471263482", "2024-01-01");
        testData.append("entry.2147185536", "no");
        testData.append("entry.735364438", "yes");
        testData.append("entry.1555922417", "yes");
        testData.append("entry.1275153243", "yes");
        testData.append("entry.2067095679", "Whiplash");
        testData.append("entry.1513166168", "no");
        testData.append("entry.706026317", "minor");
        testData.append("entry.508102148", "CA");
        testData.append("entry.1429171366", "Los Angeles");
        testData.append("entry.682378800", "personal");
        testData.append("entry.770407118", "Test description");
        
        try {
            const response = await fetch("https://docs.google.com/forms/d/e/1FAIpQLScLGGD6vA1gy17t_Nue4vJUkhisJnmRpvfl3JL-vdxjegsjeQ/formResponse", {
                method: "POST",
                body: testData,
                mode: "no-cors"
            });
            console.log("✓ Test submission sent successfully");
            console.log("Note: With 'no-cors' mode, we can't see the response");
            console.log("Check your Google Form responses to verify receipt");
        } catch (error) {
            console.error("✗ Test failed:", error);
        }
    }
    
    // Run test when page loads
    window.addEventListener('load', () => {
        setTimeout(testGoogleFormConnection, 1000);
    });
}