document.addEventListener('DOMContentLoaded', () => {
  const PRICE_QUICK = 350,
        PRICE_CUSTOM = 1000,
        PRICE_HOSTING = 0,
        PRICE_EMAIL_MS365 = 480,
        PRICE_EMAIL_MS365_EMAIL_ONLY = 320,
        PRICE_EMAIL_AWS = 320;
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
    primaryColorPicker: document.getElementById('primaryColor'),
    extraNotes: document.getElementById('extraNotes')
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
    invPrimaryColor: document.getElementById('invPrimaryColor'),
    invExtraNotes: document.getElementById('invExtraNotes'),
    invExtraNoteLine: document.getElementById('invExtraNoteLine')
  };
  function validateStep(stepNumber) {
    const step = document.getElementById(`step${stepNumber}`);
    let valid = true;
  
    // 1. Validate required inputs
    step.querySelectorAll('input[required]').forEach(input => {
      const isEmpty = input.type === 'file'
        ? input.files.length === 0
        : input.value.trim() === '';
      input.style.border = isEmpty ? '2px solid red' : '';
      if (isEmpty) valid = false;
    });
  
    // 2. Validate radio groups
    const radios = step.querySelectorAll('input[type="radio"]');
    if (radios.length) {
      const groupNames = new Set([...radios].map(r => r.name));
      groupNames.forEach(name => {
        const selected = step.querySelector(`input[name="${name}"]:checked`);
        if (!selected) valid = false;
      });
    }
  
    // 3. Step 1: Email and Phone validations
    if (stepNumber === 1) {
      const emailFields = [refs.companyEmail, refs.userEmail];
      const phoneFields = [refs.companyPhone, refs.userPhone];
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^\d{8}$/;
  
      let allValid = true;
  
      emailFields.forEach(field => {
        const isValid = emailRegex.test(field.value.trim());
        field.style.borderColor = isValid ? '#ccc' : 'red';
        if (!isValid) allValid = false;
      });
  
      phoneFields.forEach(field => {
        const numbersOnly = field.value.replace(/\D/g, '');
        const isValid = phoneRegex.test(numbersOnly);
        field.style.borderColor = isValid ? '#ccc' : 'red';
        if (!isValid) allValid = false;
      });
  
      if (!allValid) {
        alert('يرجى إدخال عناوين إيميل صحيحة وأرقام تلفون مكونة من 8 أرقام.');
        return false;
      }
    }
  
    // 4. Step 3: Feature selection
    if (stepNumber === 3) {
      const selectedFeatures = step.querySelectorAll('.feature-option.selected');
      const other = document.getElementById('featureOtherText');
      if (selectedFeatures.length === 0 && other.value.trim() === '') {
        other.style.border = '2px solid red';
        valid = false;
      } else {
        other.style.border = '';
      }
    }
  
    // 5. Step 4: Template selection (only if Quick selected)
    if (stepNumber === 4) {
      const siteType = document.querySelector('input[name="siteType"]:checked').value;
      if (siteType === 'quick') {
        const selectedTemplate = step.querySelector('.template-option.selected');
        if (!selectedTemplate) {
          alert("يرجى اختيار قالب قبل المتابعة.");
          valid = false;
        }
      }
    }
  
    return valid;
  }
  
  // Feature selection grid logic
  const featureEls = document.querySelectorAll('.feature-option');
  featureEls.forEach(el => {
    el.addEventListener('click', () => {
      el.classList.toggle('selected');
      refreshFeatures();
    });
  });
  function refreshFeatures() {
    const selected = [];
  
    document.querySelectorAll('.feature-option.selected').forEach(el => {
      const keywords = el.dataset.value.split(',').map(k => k.trim());
      selected.push(...keywords);
    });
  
    const others = refs.featureOtherText.value.split(',').map(f => f.trim()).filter(Boolean);
    selected.push(...others);
  
    preview.invFeatures.innerText = selected.length ? selected.join('، ') : 'بدون';
    preview.invFeaturesLine.style.display = selected.length ? 'block' : 'none';
  }
  
  function showStep(n) {
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    document.getElementById('step' + n).classList.add('active');
  }
  function updateDate() {
    preview.invoiceDate.innerText = 'التاريخ: ' + new Date().toLocaleDateString();
  }
  function updateTotal() {
    let emailCost = 0;
    if (selectedEmail === 'ms365') {
      emailCost = PRICE_EMAIL_MS365;
    } else if (selectedEmail === 'ms365-email') {
      emailCost = PRICE_EMAIL_MS365_EMAIL_ONLY;
    } else if (selectedEmail === 'aws') {
      emailCost = PRICE_EMAIL_AWS;
    }
    let total = siteTypeCost + (hostingSelected ? PRICE_HOSTING : 0) + emailCost;
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
  refs.featureOtherText.addEventListener('input', () => {
    refreshFeatures();
    filterTemplates();
  });
  
  // Templates
  document.querySelectorAll('.preview-template').forEach(btn => {
    let zoomed = false;
    btn.addEventListener('click', e => {
      const template = e.target.closest('.template-option');
      const image = template.querySelector('.template-thumb');
      if (!zoomed) {
        image.classList.add('zoomed');
        zoomed = true;
        // Automatically reset zoom after 4 seconds (optional)
        setTimeout(() => {
          image.classList.remove('zoomed');
          zoomed = false;
        }, 4000);
      } else {
        const url = template.dataset.previewUrl;
        if (url) window.open(url, '_blank').focus();
      }
    });
  });
  
  document.querySelectorAll('.select-template').forEach(btn => btn.addEventListener('click', e => {
    document.querySelectorAll('.template-option').forEach(div => div.classList.remove('selected'));
    const opt = e.target.closest('.template-option');
    opt.classList.add('selected');
    selectedTemplate = opt.dataset.templateId;
    preview.invTemplate.innerHTML = `<img src="${opt.querySelector('.template-thumb').src}" style="max-width:100px">`;
    preview.invTemplateLine.style.display = 'block';
  }));
  // Filter templates based on selection
  function filterTemplates() {
    const siteType = document.querySelector('input[name="siteType"]:checked').value;
    const templateGrid = document.querySelector('.template-grid');
    const templates = Array.from(document.querySelectorAll('.template-option'));
    let selectedFeatures = [];
    document.querySelectorAll('.feature-option.selected').forEach(el => {
      const keywords = el.dataset.value.split(',').map(k => k.trim());
      selectedFeatures.push(...keywords);
    });
    const others = refs.featureOtherText.value.split(',').map(f => f.trim()).filter(Boolean);
    selectedFeatures.push(...others);
  
    let message = '';
    if (siteType === 'custom') {
      templates.forEach(t => t.style.display = 'none');
      message = 'اختيار القالب غير متاح للمواقع ذات التصميم المخصص. يرجى الانتقال إلى الخطوة التالية.';
      document.getElementById('clearFilters').style.display = 'none';
      document.getElementById('adjustFilters').style.display = 'none';
    } else {
      templates.sort((a, b) => parseInt(a.dataset.templateId) - parseInt(b.dataset.templateId));
      templates.forEach(t => templateGrid.appendChild(t));
      if (selectedFeatures.length === 0) {
        templates.forEach(t => t.style.display = '');
        message = 'عرض جميع القوالب.';
        document.getElementById('clearFilters').style.display = 'none';
        document.getElementById('adjustFilters').style.display = '';
      } else {
        const templateMatches = templates.map(t => {
          const features = (t.dataset.features || '').split(',').map(f => f.trim());
          const count = selectedFeatures.filter(f =>
            features.some(t => t.toLowerCase().includes(f.toLowerCase()))
          ).length;
          return { element: t, count: count };
        });
        const partialTemplates = templateMatches.filter(obj => obj.count > 0);
        const fullTemplates = partialTemplates.filter(obj => obj.count === selectedFeatures.length);
        if (fullTemplates.length > 0) {
          templates.forEach(t => {
            if (fullTemplates.some(obj => obj.element === t)) {
              t.style.display = '';
            } else {
              t.style.display = 'none';
            }
          });
          message = 'عرض القوالب التي تطابق جميع المميزات المختارة.';
        } else {
          partialTemplates.sort((a, b) => b.count - a.count);
          partialTemplates.forEach(obj => templateGrid.appendChild(obj.element));
          templates.forEach(t => {
            if (partialTemplates.some(obj => obj.element === t)) {
              t.style.display = '';
            } else {
              t.style.display = 'none';
            }
          });
          message = 'ما في قالب يحتوي على كل المميزات المختارة. نعرض أقرب القوالب المطابقة.';
        }
        document.getElementById('clearFilters').style.display = '';
        document.getElementById('adjustFilters').style.display = '';
      }
    }
    document.getElementById('filterMessage').innerText = message;
  }
  document.getElementById('clearFilters').addEventListener('click', () => {
    document.querySelectorAll('.template-option').forEach(t => t.style.display = '');
    document.getElementById('filterMessage').innerText = 'عرض جميع القوالب (تم مسح الفلاتر).';
    document.getElementById('clearFilters').style.display = 'none';
  });
  document.getElementById('adjustFilters').addEventListener('click', e => {
    e.preventDefault();
    showStep(3);
  });
  
  //extra notes by the end of the form
  refs.extraNotes.addEventListener('input', () => {
    const value = refs.extraNotes.value.trim();
    preview.invExtraNotes.innerText = value || '-';
    preview.invExtraNoteLine.style.display = value ? 'block' : 'none';
  });
  
  // Hosting & Email
  refs.hostingRadios.forEach(r => r.addEventListener('change', () => {
    hostingSelected = r.value === 'yes';
    preview.invHostingSummary.innerText = r.nextSibling.textContent.trim();
    updateTotal();
  }));
  
  refs.emailServiceRadios.forEach(r => r.addEventListener('change', () => {
    selectedEmail = r.value;
    let label = r.nextSibling.textContent.trim();
    let price = 0;
    if (selectedEmail === 'ms365') price = PRICE_EMAIL_MS365;
    else if (selectedEmail === 'ms365-email') price = PRICE_EMAIL_MS365_EMAIL_ONLY;
    else if (selectedEmail === 'aws') price = PRICE_EMAIL_AWS;
    preview.invEmailSummary.innerText = label + (price ? ` – ${price} د.ك` : '');
    updateTotal();
  }));
  
  document.getElementById('next1').addEventListener('click', () => {
    if (validateStep(1)) showStep(2);
  });
  document.getElementById('next2').addEventListener('click', () => {
    if (validateStep(2)) showStep(3);
  });
  document.getElementById('next3').addEventListener('click', () => {
    if (validateStep(3)) {
      filterTemplates();
      showStep(4);
    }
  });
  document.getElementById('next4').addEventListener('click', () => {
    if (validateStep(4)) showStep(5);
  });
  document.getElementById('next5').addEventListener('click', () => {
    if (validateStep(5)) showStep(6);
  });
  document.getElementById('next6').addEventListener('click', () => {
    if (!validateStep(6)) return;
    updateDate();
    // (continue with your Web3Forms submission logic)
  });
  document.getElementById('prev2').addEventListener('click', () => showStep(1));
  document.getElementById('prev3').addEventListener('click', () => showStep(2));
  document.getElementById('prev4').addEventListener('click', () => showStep(3));
  document.getElementById('prev5').addEventListener('click', () => showStep(4));
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
        subject: `فاتورة ${refs.companyName.value}`,
        to: refs.companyEmail.value,
        html: invoiceHtml
      })
    })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        html2canvas(document.getElementById('previewInvoice')).then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const imgProps = doc.getImageProperties(imgData);
          const pdfWidth = doc.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          doc.save(`invoice_${new Date().toISOString().split('T')[0]}.pdf`);
          alert('تم إرسال الفاتورة وتم تنزيل ملف PDF!');
        });
      } else {
        alert('فشل الإرسال: ' + data.message);
      }
    })
    .catch(err => {
      console.error('Submission error:', err);
      alert('خطأ في الشبكة أو في الإرسال: ' + err.message);
    });
  });
  // Initialize
  refs.siteTypeRadios[0].dispatchEvent(new Event('change'));
  refs.hostingRadios[1].dispatchEvent(new Event('change'));
  refs.emailServiceRadios[0].dispatchEvent(new Event('change'));
  refreshFeatures();
});
