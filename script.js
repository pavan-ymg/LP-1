  /* ------------------------------
     TEL LINKS (Fix click delay)
  ------------------------------ */
  document.querySelectorAll('a[href^="tel:"]').forEach(a => {
    a.addEventListener('click', function (e) {
      setTimeout(() => { window.location.href = this.getAttribute('href'); }, 200);
    });
  });

  /* ------------------------------
     Smooth Scroll
  ------------------------------ */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));

      // Prevent breaking modal triggers
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
        const target = +counter.getAttribute('data-target');
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

  // Trigger counters when #stats enters viewport
  let started = false;
  window.addEventListener('scroll', () => {
    const statsSection = document.querySelector('#stats');
    if (statsSection && !started && window.scrollY > statsSection.offsetTop - window.innerHeight + 200) {
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
     GOOGLE FORM SUBMISSION
  ------------------------------ */
  const claimForm = document.getElementById("claimForm");

  if (claimForm) {
    claimForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const form = e.target;
      const data = new FormData();

      // Step 1 fields
      data.append("entry.542115974", form.dateIncident.value);
      data.append("entry.1967796353", form.fault.value);
      data.append("entry.1194857749", form.injured.value);
      data.append("entry.1758807391", form.ambulance.value);
      data.append("entry.1708161178", form.emergencyRoom.value);

      document.querySelectorAll("input[name='injuries[]']:checked").forEach(cb => {
        data.append("entry.568188935", cb.value);
      });

      data.append("entry.1285187423", form.attorneyHelp.value);
      data.append("entry.1774776280", form.caseDescription.value);
      data.append("entry.1829424868", form.vehicleType.value);

      data.append("entry.1456507434", form.state.value);
      data.append("entry.2083390486", form.city.value);

      // Step 2 fields
      data.append("entry.223127181", form.firstName.value);
      data.append("entry.889533505", form.lastName.value);
      data.append("entry.1238482112", form.phone.value);
      data.append("entry.942245524", form.email.value);

      // Google Forms POST endpoint
      const googleFormURL =
        "https://docs.google.com/forms/d/e/1FAIpQLScLGGD6vA1gy17t_Nue4vJUkhisJnmRpvfl3JL-vdxjegsjeQ/formResponse";

      fetch(googleFormURL, {
        method: "POST",
        body: data,
        mode: "no-cors"
      })
        .then(() => {
          alert("Your claim has been submitted successfully!");
          form.reset();
          showStep(1);
        })
        .catch(err => {
          console.error("Submission Error:", err);
          alert("Something went wrong. Please try again.");
        });
    });
  }