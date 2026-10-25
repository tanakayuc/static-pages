(() => {
  const input = document.getElementById('email');
  if (!input) return;
  const blocked = new Set([
    'yahoo.co.jp', 'yahoo.com', 'yahoo.ne.jp', 'ymail.ne.jp',
    'hotmail.com', 'hotmail.co.jp', 'hotmail.jp',
    'icloud.com', 'me.com', 'mac.com',
    'outlook.com', 'outlook.jp', 'outlook.co.jp',
    'docomo.ne.jp', 'ezweb.ne.jp', 'au.com', 'softbank.ne.jp', 'i.softbank.jp',
    'ymobile.ne.jp', 'willcom.com', 'pdx.ne.jp', 'emnet.ne.jp', 'rakumail.jp',
  ]);
  const check = () => {
    const domain = input.value.trim().toLowerCase().split('@')[1] || '';
    const invalid = blocked.has(domain) || domain.endsWith('.vodafone.ne.jp');
    input.setCustomValidity(invalid ? 'このメールアドレスでは登録できません。Gmailなど別のアドレスをご利用ください。' : '');
  };
  input.addEventListener('input', check);
  input.addEventListener('change', check);
  input.form?.addEventListener('submit', check);
})();
