
document.addEventListener('DOMContentLoaded', () => {
  const PRICE_QUICK = 350,
        PRICE_CUSTOM = 1000,
        PRICE_HOSTING = 0,
        PRICE_EMAIL_MS365 = 600,
        PRICE_EMAIL_AWS = 120;

  let siteTypeCost = 0, hostingSelected = false, selectedEmail = 'none', selectedTemplate = null;

  const refs = {
    companyName: document.getElementById('companyName'),
    companyEmail: document.getElementById('companyEmail'),
    companyPhone: document.getElementById('companyPhone'),
    salesperson: document.getElementById('salesperson'),
    companyLogo: document.getElementById('companyLogo'),
    userName: document.getElementById('userName'),
    userEmail: document.getElementById('userEmail'),
    userPhone: document.getElementById('userPhone'),
    featureOtherText: document.getElementById('featureOtherText'),
    siteTypeRadios: [...document.getElementsByName('siteType')],
    hostingRadios: [...document.getElementsByName('hosting')],
    emailServiceRadios: [...document.getElementsByName('emailService')],
    primaryColorPicker: document.getElementById('primaryColor')
  };

  const preview = {
    invCompanyName: document.getElementById('invCompanyName'),
    invCompanyContact: document.getElementById('invCompanyContact'),
    invType: document.getElementById('invType'),
    invTemplate: document.getElementById('invTemplate'),
    invTemplateLine: document.getElementById('invTemplateLine'),
    invFeatures: document.getElementById('invFeatures'),
    invFeaturesLine: document.getElementById('invFeaturesLine'),
    invHostingSummary: document.getElementById('invHostingSummary'),
    invEmailSummary: document.getElementById('invEmailSummary'),
    invTotal: document.getElementById('invTotal'),
    invSalesperson: document.getElementById('invSalesperson'),
    invLogo: document.getElementById('invLogo'),
    invoiceDate: document.getElementById('invoiceDatePreview'),
    invUserName: document.getElementById('invUserName'),
    invUserContact: document.getElementById('invUserContact'),
    invPrimaryColor: document.getElementById('invPrimaryColor')
  };

  // Feature selection grid logic
  const featureEls = document.querySelectorAll('.feature-option');
  featureEls.forEach(el => {
    el.addEventListener('click', () => {
      el.classList.toggle('selected');
      refreshFeatures();
    });
  });

  function refreshFeatures() {
    const selected = [...document.querySelectorAll('.feature-option.selected')]
      .map(el => el.dataset.value);
    if (refs.featureOtherText.value.trim()) {
      selected.push(refs.featureOtherText.value.trim());
    }
    preview.invFeatures.innerText = selected.length ? selected.join(', ') : 'None';
    preview.invFeaturesLine.style.display = selected.length ? 'block' : 'none';
  }

  function showStep(n) {
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    document.getElementById('step' + n).classList.add('active');
  }

  function updateDate() {
    preview.invoiceDate.innerText = 'Date: ' + new Date().toLocaleDateString();
  }

  function updateTotal() {
    let total = siteTypeCost +
      (hostingSelected ? PRICE_HOSTING : 0) +
      (selectedEmail === 'ms365' ? PRICE_EMAIL_MS365 : selectedEmail === 'aws' ? PRICE_EMAIL_AWS : 0);
    preview.invTotal.innerText = total;
  }

  // Inputs → preview
  refs.companyName.addEventListener('input', () => preview.invCompanyName.innerText = refs.companyName.value);
  function updateCompanyContact() {
    let c = refs.companyEmail.value;
    if (refs.companyPhone.value) c += ' | ' + refs.companyPhone.value;
    preview.invCompanyContact.innerText = c;
  }
  refs.companyEmail.addEventListener('input', updateCompanyContact);
  refs.companyPhone.addEventListener('input', updateCompanyContact);

  refs.userName.addEventListener('input', () => preview.invUserName.innerText = refs.userName.value);
  function updateUserContact() {
    preview.invUserContact.innerText = refs.userEmail.value +
      (refs.userPhone.value ? ' | ' + refs.userPhone.value : '');
  }
  refs.userEmail.addEventListener('input', updateUserContact);
  refs.userPhone.addEventListener('input', updateUserContact);

  refs.salesperson.addEventListener('input', () => {
    preview.invSalesperson.innerText = refs.salesperson.value;
    document.querySelector('.salesperson-line').style.display = refs.salesperson.value.trim() ? 'block' : 'none';
  });

  refs.companyLogo.addEventListener('change', () => {
    const f = refs.companyLogo.files[0];
    if (f) {
      const r = new FileReader();
      r.onload = e => {
        preview.invLogo.src = e.target.result;
        preview.invLogo.style.display = 'block';
      };
      r.readAsDataURL(f);
    }
  });

  refs.primaryColorPicker.addEventListener('input', () => {
    const hex = refs.primaryColorPicker.value;
    preview.invPrimaryColor.innerText = hex;
  });

  // Site type
  refs.siteTypeRadios.forEach(r => r.addEventListener('change', () => {
    siteTypeCost = r.value === 'quick' ? PRICE_QUICK : PRICE_CUSTOM;
    preview.invType.innerText = r.nextSibling.textContent.trim();
    updateTotal();
  }));

  // Features
  document.querySelectorAll('input[name="features"]').forEach(chk => chk.addEventListener('change', refreshFeatures));
  refs.featureOtherText.addEventListener('input', refreshFeatures);

  // Templates
  document.querySelectorAll('.preview-template').forEach(btn => btn.addEventListener('click', e => {
    window.open(e.target.closest('.template-option').dataset.previewUrl, '_blank').focus();
  }));
  document.querySelectorAll('.select-template').forEach(btn => btn.addEventListener('click', e => {
    document.querySelectorAll('.template-option').forEach(div => div.classList.remove('selected'));
    const opt = e.target.closest('.template-option');
    opt.classList.add('selected');
    selectedTemplate = opt.dataset.templateId;
    preview.invTemplate.innerHTML = `<img src="${opt.querySelector('.template-thumb').src}" style="max-width:100px">`;
    preview.invTemplateLine.style.display = 'block';
  }));

  // Hosting & Email
  refs.hostingRadios.forEach(r => r.addEventListener('change', () => {
    hostingSelected = r.value === 'yes';
    preview.invHostingSummary.innerText = r.nextSibling.textContent.trim();
    updateTotal();
  }));
  refs.emailServiceRadios.forEach(r => r.addEventListener('change', () => {
    selectedEmail = r.value;
    preview.invEmailSummary.innerText = r.nextSibling.textContent.trim();
    updateTotal();
  }));

  // Navigation
  document.getElementById('next1').addEventListener('click', () => showStep(2));
  document.getElementById('prev2').addEventListener('click', () => showStep(1));
  document.getElementById('next2').addEventListener('click', () => showStep(3));
  document.getElementById('prev3').addEventListener('click', () => showStep(2));
  document.getElementById('next3').addEventListener('click', () => showStep(4));
  document.getElementById('prev4').addEventListener('click', () => showStep(3));
  document.getElementById('next4').addEventListener('click', () => showStep(5));
  document.getElementById('prev5').addEventListener('click', () => showStep(4));
  document.getElementById('next5').addEventListener('click', () => showStep(6));
  document.getElementById('prev6').addEventListener('click', () => showStep(5));

  // Submit: Print + Email
  document.getElementById('next6').addEventListener('click', () => {
    updateDate();
    const invoiceHtml = document.getElementById('previewInvoice').outerHTML;

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: '3bb04c21-ecd5-4271-b35a-fdec1b99f389',
        subject: `Invoice ${refs.companyName.value}`,
        to: refs.companyEmail.value,
        html: invoiceHtml
      })
    })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        const win = window.open('', '_blank');
        win.document.write(`
          <html>
            <head>
              <title>Invoice Print</title>
              <style>body{font-family:sans-serif;padding:30px;} img{max-width:200px;}</style>
            </head>
            <body onload="window.print();">
              ${invoiceHtml}
            </body>
          </html>
        `);
        win.document.close();
        alert('Invoice sent and print window opened!');
      } else {
        alert('Submission failed: ' + data.message);
      }
    })
    .catch(err => {
      console.error('Submission error:', err);
      alert('Network or submission error: ' + err.message);
    });
  });

  // Initialize
  refs.siteTypeRadios[0].dispatchEvent(new Event('change'));
  refs.hostingRadios[1].dispatchEvent(new Event('change'));
  refs.emailServiceRadios[0].dispatchEvent(new Event('change'));
  refreshFeatures();
});

