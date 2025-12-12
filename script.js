document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------
    Helpers
    ------------------------------ */
  const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeMwW3ummNim_Uo_ja2LhZyM0RU9GuecekGtfjAH5-R9lmzFw/formResponse";

    function buildFormData(form) {
    const fd = new FormData();

    // Step 1 fields
    fd.append("entry.542115974", form.querySelector("[name='dateIncident']")?.value || "");
    fd.append("entry.1967796353", form.querySelector("[name='fault']")?.value || "");
    fd.append("entry.1194857749", form.querySelector("[name='injured']")?.value || "");
    fd.append("entry.1758807391", form.querySelector("[name='ambulance']")?.value || "");
    fd.append("entry.1708161178", form.querySelector("[name='emergencyRoom']")?.value || "");

    // injuries[] checkboxes
    form.querySelectorAll("input[name='injuries[]']:checked").forEach(cb => {
      if (cb.value) fd.append("entry.568188935", cb.value);
    });

    // include Other text if present
    const otherField = form.querySelector("[name='injuriesOther']");
    if (otherField && otherField.value.trim()) {
        fd.append("entry.568188935", otherField.value.trim());
    }

    fd.append("entry.1285187423", form.querySelector("[name='attorneyHelp']")?.value || "");
    fd.append("entry.1774776280", form.querySelector("[name='caseDescription']")?.value || "");
    fd.append("entry.1829424868", form.querySelector("[name='vehicleType']")?.value || "");
    fd.append("entry.1456507434", form.querySelector("[name='state']")?.value || "");
    fd.append("entry.2083390486", form.querySelector("[name='city']")?.value || "");

    // Step 2 fields
    fd.append("entry.223127181", form.querySelector("[name='firstName']")?.value || "");
    fd.append("entry.889533505", form.querySelector("[name='lastName']")?.value || "");
    fd.append("entry.1238482112", form.querySelector("[name='phone']")?.value || "");
    fd.append("entry.942245524", form.querySelector("[name='email']")?.value || "");

    return fd;
  }

    function showSuccessAnimationFor(form) {
    const success = document.getElementById("successAnimation");
    if (!success) return;
    // Hide form & show animation
    form.classList.add("d-none");
    success.classList.remove("d-none");

    // restore after delay
    setTimeout(() => {
        success.classList.add("d-none");
    form.classList.remove("d-none");
    // reset to step1 if multi-step
    if (form.id === "claimFormMain") showStepMain(1);
    if (form.id === "claimFormModal") showModalStep(1);
    form.reset();
    }, 3200);
  }

    async function postToGoogle(form, submitBtn) {
    try {
      const fd = buildFormData(form);
    // disable submit button
    if (submitBtn) {submitBtn.disabled = true; submitBtn.classList.add('disabled'); }

    await fetch(GOOGLE_FORM_URL, {method: "POST", body: fd, mode: "no-cors" });

    // success UI
    showSuccessAnimationFor(form);

    // If modal form, close modal after small delay
    if (form.id === "claimFormModal") {
        setTimeout(() => {
            const modalEl = document.getElementById('claimModal');
            if (modalEl) {
                const bsModal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                bsModal.hide();
            }
        }, 800);
      }

    } catch (err) {
        console.error("Submission error:", err);
    alert("Something went wrong. Please try again.");
    } finally {
      if (submitBtn) {submitBtn.disabled = false; submitBtn.classList.remove('disabled'); }
    }
  }

    /* ------------------------------
       Other injury toggles
    ------------------------------ */
    function setupOtherToggle(checkboxId, inputId) {
    const cb = document.getElementById(checkboxId);
    const input = document.getElementById(inputId);
    if (!cb || !input) return;
    cb.addEventListener('change', () => {
      if (cb.checked) {
        input.classList.remove('d-none');
    input.required = true;
      } else {
        input.classList.add('d-none');
    input.required = false;
    input.value = '';
      }
    });
  }
    setupOtherToggle('injOther', 'injOtherText');
    setupOtherToggle('injOtherModal', 'injOtherTextModal');

    /* ------------------------------
       Multi-step: MAIN form
    ------------------------------ */
    function showStepMain(step) {
        document.querySelectorAll('#claimFormMain .step').forEach(s => s.classList.add('d-none'));
    const el = document.getElementById('step' + step);
    if (el) el.classList.remove('d-none');
    const wrapper = document.querySelector('.form-wrapper');
    if (wrapper) window.scrollTo({top: wrapper.offsetTop - 60, behavior: 'smooth' });
  }
    window.showStepMain = showStepMain;

    // attach Continue button inside main step1 if exists
    const mainContinue = document.querySelector('#claimFormMain [onclick="showStep(2)"], #claimFormMain .btn-continue-main');
    if (mainContinue) {
        mainContinue.addEventListener('click', (e) => { e.preventDefault(); showStepMain(2); });
  }

    /* ------------------------------
       Multi-step: MODAL form
    ------------------------------ */
    function showModalStep(step) {
        document.querySelectorAll('#claimModal .step').forEach(s => s.classList.add('d-none'));
    const el = document.getElementById('modalStep' + step);
    if (el) el.classList.remove('d-none');
    // keep modal scrolled to top of modal body
    const modalBody = document.querySelector('#claimModal .modal-body');
    if (modalBody) modalBody.scrollTop = 0;
  }
    window.showModalStep = showModalStep;

    // attach Continue button inside modal step1
    const modalContinue = document.querySelector('#claimFormModal [onclick="showModalStep(2)"], #claimFormModal .btn-continue-modal');
    if (modalContinue) {
        modalContinue.addEventListener('click', (e) => { e.preventDefault(); showModalStep(2); });
  }

    /* ------------------------------
       Attach submission handlers
    ------------------------------ */
    function attachFormHandler(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
    // find submit button inside this form (last button of type submit)
    const submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('.btn-submit');
    postToGoogle(form, submitBtn);
    });
  }

    attachFormHandler('claimFormMain');
    attachFormHandler('claimFormModal');

    /* ------------------------------
       Small extras: tel links and smooth anchors already loaded earlier,
       but ensure bootstrap modal resets to step1 when opened
    ------------------------------ */
    const claimModalEl = document.getElementById('claimModal');
    if (claimModalEl) {
        claimModalEl.addEventListener('shown.bs.modal', () => {
            // reset modal to step1
            showModalStep(1);
        });
  }

});