(() => {
  // Public accommodation referrals, not verified booking identities.
  const hostCode=new URLSearchParams(location.search).get('host');
  const hosts={
    'charming-family-friendly-villa':{name:'Charming Family-Friendly Villa',address:'De Geersgatan 41, 682 60 Lesjöfors, Sweden'},
    'lilla-alva':{name:'Lilla Älva',address:'Svartå 10, Filipstad, Värmland, Sweden'}
  };
  const diningHost=Object.prototype.hasOwnProperty.call(hosts,hostCode)?hosts[hostCode]:null;
  const diningPage=!!document.querySelector('.guest-dining-topbar');
  const hostCopy={
    nl:{stay:'Private dining tijdens uw verblijf bij',known:'Uw accommodatie is al ingevuld. Een advertentielink is niet nodig.',optional:'(optioneel)',guests:'Aantal gasten'},
    en:{stay:'Private dining during your stay at',known:'Your accommodation is already filled in. A listing link is not needed.',optional:'(optional)',guests:'Number of guests'},
    sv:{stay:'Privat middag under din vistelse på',known:'Ditt boende är redan ifyllt. Ingen annonslänk behövs.',optional:'(valfritt)',guests:'Antal gäster'}
  }[document.documentElement.lang];
  if(diningPage&&diningHost&&hostCopy){
    document.querySelectorAll('.languages a, a[href*="private-dining-request.html"], a[data-dining-link]').forEach(link=>{
      const target=new URL(link.getAttribute('href'),location.href);
      if(target.origin!==location.origin)return;
      target.searchParams.set('host',hostCode);
      link.href=target.href;
    });
    const intro=document.querySelector('.subhero-content');
    if(intro){
      const note=document.createElement('p');
      note.textContent=`${hostCopy.stay} ${diningHost.name}${diningHost.address?` · ${diningHost.address}`:''}`;
      intro.append(note);
    }
  }

  const btn=document.querySelector('.menu-button');
  const menu=document.querySelector('#site-menu');
  if(btn&&menu){
    const close=()=>{btn.setAttribute('aria-expanded','false');menu.classList.remove('open')};
    btn.addEventListener('click',()=>{const open=btn.getAttribute('aria-expanded')==='true';btn.setAttribute('aria-expanded',String(!open));menu.classList.toggle('open',!open)});
    menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  }

  // Web3Forms: stay on our own confirmation page rather than their default success screen.
  const form=document.getElementById('contact-form')||document.getElementById('dining-form');
  if(form){
    const service=form.querySelector('select[name="service"]');
    const propertyLink=form.querySelector('input[name="property_link"]');
    const propertyLinkRequired=form.querySelector('[data-property-link-required]');
    const syncPropertyLink=()=>{
      const required=service?.selectedOptions[0]?.dataset.service==='private-dining';
      if(propertyLink)propertyLink.required=required;
      if(propertyLinkRequired)propertyLinkRequired.hidden=!required;
    };
    service?.addEventListener('change',syncPropertyLink);
    form.addEventListener('reset',()=>setTimeout(syncPropertyLink,0));
    window.addEventListener('pageshow',syncPropertyLink);
    syncPropertyLink();
    const selectService=(key)=>{
      const option=service&&Array.from(service.options).find(item=>item.dataset.service===key);
      if(!option)return false;
      service.value=option.value;
      service.dispatchEvent(new Event('change',{bubbles:true}));
      return true;
    };
    selectService(new URLSearchParams(location.search).get('service'));
    if(form.id==='dining-form'){
      const date=form.querySelector('[name="preferred_date"]');
      const earliest=new Date();
      earliest.setDate(earliest.getDate()+5);
      date.min=`${earliest.getFullYear()}-${String(earliest.getMonth()+1).padStart(2,'0')}-${String(earliest.getDate()).padStart(2,'0')}`;
      if(diningHost){
        const accommodation=form.querySelector('[name="accommodation"]');
        const address=form.querySelector('[name="location"]');
        accommodation.value=accommodation.defaultValue=diningHost.name;accommodation.readOnly=true;
        address.value=address.defaultValue=diningHost.address;address.readOnly=!!diningHost.address;
        const code=form.querySelector('[name="accommodation_code"]');
        code.value=code.defaultValue=hostCode;
        const subject=form.querySelector('[name="subject"]');
        subject.value=subject.defaultValue=`Private Dining request - ${diningHost.name} (${document.documentElement.lang.toUpperCase()})`;
      }else if(hostCode){
        form.querySelector('[data-dining-host-status]').hidden=false;
      }
    }

    document.querySelectorAll('[data-contact-service]').forEach(link=>{
      link.addEventListener('click',event=>{
        if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
        if(!selectService(link.dataset.contactService))return;
        event.preventDefault();
        form.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
        service.focus({preventScroll:true});
      });
    });

    const submit=document.getElementById('submit-button');
    const status=document.getElementById('form-status');
    form.addEventListener('submit',async(e)=>{
      e.preventDefault();
      syncPropertyLink();
      if(!form.reportValidity())return;
      const original=submit?.textContent||'';
      if(submit){submit.disabled=true;submit.textContent=document.documentElement.lang==='sv'?'Skickar…':document.documentElement.lang==='nl'?'Verzenden…':'Sending…'}
      if(status)status.textContent=document.documentElement.lang==='sv'?'Ditt meddelande skickas…':document.documentElement.lang==='nl'?'Uw bericht wordt verzonden…':'Sending your message…';
      try{
        const response=await fetch('https://api.web3forms.com/submit',{method:'POST',body:new FormData(form)});
        const result=await response.json();
        if(response.ok&&result.success){
          const thanks=new URL(form.dataset.thanks||'thanks.html',location.href);
          if(form.id==='dining-form'&&diningHost)thanks.searchParams.set('host',hostCode);
          location.href=thanks.href;return;
        }
        throw new Error(result.message||'submit failed');
      }catch(err){
        console.error(err);
        if(status)status.textContent=document.documentElement.lang==='sv'?'Något gick fel. Försök igen eller kontakta mig via e-post eller WhatsApp.':document.documentElement.lang==='nl'?'Er ging iets mis. Probeer het opnieuw of neem contact op via e-mail of WhatsApp.':'Something went wrong. Please try again, or contact me by email or WhatsApp.';
        if(submit){submit.disabled=false;submit.textContent=original}
      }
    });
  }

  // Google Maps connects only after an explicit choice on this page.
  document.querySelectorAll('[data-map-choice]').forEach(choice=>{
    const wrap=choice.parentElement;
    const container=wrap.querySelector('[data-map-container]');
    const show=choice.querySelector('[data-load-map]');
    const hide=wrap.querySelector('[data-hide-map]');
    if(!container||!show||!hide)return;
    show.addEventListener('click',()=>{
      const frame=document.createElement('iframe');
      frame.src=choice.dataset.mapSrc;
      frame.title=choice.dataset.mapTitle;
      frame.referrerPolicy='no-referrer';
      container.replaceChildren(frame);
      container.hidden=false;
      choice.hidden=true;
      hide.hidden=false;
      hide.focus();
    });
    hide.addEventListener('click',()=>{
      container.replaceChildren();
      container.hidden=true;
      choice.hidden=false;
      hide.hidden=true;
      show.focus();
    });
  });

  // Thank-you countdown.
  const counter=document.getElementById('countdown');
  if(counter){let n=7;const t=setInterval(()=>{n--;counter.textContent=n;if(n<=0){clearInterval(t);location.href=counter.dataset.home||'index.html'}},1000)}

  // Optional analytics: Google Analytics is loaded only after explicit acceptance.
  const key='nop_analytics_consent';
  const lang=(document.documentElement.lang||'en').slice(0,2);
  const copy={
    en:{label:'Analytics choice',text:'We use optional Google Analytics to understand how the site is used. The site works without analytics.',accept:'Allow analytics',reject:'Essential only'},
    sv:{label:'Val av webbanalys',text:'Vi använder Google Analytics om du tillåter det, för att förstå hur webbplatsen används. Webbplatsen fungerar utan webbanalys.',accept:'Tillåt webbanalys',reject:'Endast nödvändiga'},
    nl:{label:'Keuze voor webanalyse',text:'Met uw toestemming gebruiken we Google Analytics om te begrijpen hoe de website wordt gebruikt. De site werkt ook zonder webanalyse.',accept:'Webanalyse toestaan',reject:'Alleen noodzakelijk'}
  }[lang]||null;
  const loadAnalytics=()=>{if(window.__nopGA)return;window.__nopGA=true;const s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=G-1LT3BX7VW7';document.head.appendChild(s);window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','G-1LT3BX7VW7',{anonymize_ip:true})};
  document.querySelectorAll('[data-reset-analytics]').forEach(button=>{
    button.addEventListener('click',()=>{
      window['ga-disable-G-1LT3BX7VW7']=true;
      localStorage.setItem(key,'no');
      document.cookie.split(';').forEach(entry=>{
        const name=entry.split('=')[0].trim();
        if(name==='_ga'||name.startsWith('_ga_')){
          document.cookie=name+'=; Max-Age=0; path=/';
          document.cookie=name+'=; Max-Age=0; path=/; domain='+location.hostname;
          document.cookie=name+'=; Max-Age=0; path=/; domain=.nico-on-point-services.com';
        }
      });
      localStorage.removeItem(key);
      location.reload();
    });
  });
  const consent=localStorage.getItem(key);
  if(consent==='yes')loadAnalytics();
  if(!consent&&copy){
    const box=document.createElement('aside');box.className='cookie-banner';box.setAttribute('aria-label',copy.label);box.innerHTML=`<p>${copy.text} <a href="${({en:"/en/privacy.html",sv:"/sv/integritet.html",nl:"/nl/privacy.html"})[lang]}">${({en:"Read our privacy policy",sv:"Läs vår integritetspolicy",nl:"Lees ons privacybeleid"})[lang]}</a>.</p><div class="cookie-actions"><button class="button primary" type="button" data-analytics-yes>${copy.accept}</button><button class="button ghost" type="button" data-analytics-no>${copy.reject}</button></div>`;document.body.appendChild(box);
    box.querySelector('[data-analytics-yes]').onclick=()=>{localStorage.setItem(key,'yes');loadAnalytics();box.remove()};
    box.querySelector('[data-analytics-no]').onclick=()=>{localStorage.setItem(key,'no');box.remove()};
  }
})();


// Gentle photo parallax; content and layout remain stationary.
(() => {
  if (!('IntersectionObserver' in window) || !window.matchMedia) return;
  const enabled = window.matchMedia('(min-width: 901px) and (prefers-reduced-motion: no-preference)');
  const entries = [];
  document.querySelectorAll('.hero, .subhero, .contact-page-hero').forEach(host => {
    const style = getComputedStyle(host);
    if (style.backgroundImage === 'none') return;
    const layer = document.createElement('div');
    layer.className = 'parallax-background';
    layer.setAttribute('aria-hidden', 'true');
    layer.style.backgroundImage = style.backgroundImage;
    layer.style.backgroundPosition = style.backgroundPosition;
    layer.style.backgroundSize = style.backgroundSize;
    host.prepend(layer);
    if (host.classList.contains('allround-hero')) layer.classList.add('header-static-background');
    else entries.push({host, layer, distance: 32});
  });
  document.querySelectorAll('.about-hero-image > img, .dining-showcase-media > img, .craft-media > img, .service-card .media-wrap > img, .project-grid .media-wrap > img').forEach(layer => {
    entries.push({host: layer.parentElement, layer, distance: 16});
  });
  if (!entries.length) return;
  let frame = 0;
  const visible = new Set();
  const update = () => {
    frame = 0;
    if (!enabled.matches || document.hidden) return;
    const height = window.innerHeight;
    const measurements = entries.filter(entry => visible.has(entry.host)).map(entry => {
      const rect = entry.host.getBoundingClientRect();
      const range = entry.report ? Math.max(140, rect.height * 0.75) : (height + rect.height) / 2;
      const progress = Math.max(-1, Math.min(1, (height / 2 - rect.top - rect.height / 2) / range));
      return {entry, offset: progress * entry.distance};
    });
    measurements.forEach(({entry, offset}) => entry.layer.style.setProperty('--parallax-y', offset.toFixed(2) + 'px'));
  };
  const schedule = () => {
    if (enabled.matches && !frame) frame = requestAnimationFrame(update);
  };
  const observer = new IntersectionObserver(records => {
    records.forEach(record => record.isIntersecting ? visible.add(record.target) : visible.delete(record.target));
    schedule();
  });
  entries.forEach(entry => observer.observe(entry.host));
  const sync = () => {
    entries.forEach(({host, layer}) => {
      host.classList.toggle('parallax-host', enabled.matches);
      layer.classList.toggle('parallax-photo', enabled.matches && !layer.classList.contains('parallax-background'));
      layer.style.removeProperty('--parallax-y');
    });
    schedule();
  };
  window.addEventListener('scroll', schedule, {passive: true});
  window.addEventListener('resize', schedule, {passive: true});
  window.addEventListener('pageshow', schedule);
  document.addEventListener('visibilitychange', schedule);
  enabled.addEventListener('change', sync);
  sync();
})();


// Project viewer, one-time section reveals and a contextual contact shortcut.
(() => {
  const lang = (document.documentElement.lang || 'en').slice(0, 2);
  const copy = {
    nl: {open: 'Vergroot projectfoto', close: 'Sluiten', contact: 'Bespreek uw klus', title: 'Projectfoto'},
    sv: {open: 'Förstora projektbild', close: 'Stäng', contact: 'Berätta om ditt projekt', title: 'Projektbild'},
    en: {open: 'Enlarge project photo', close: 'Close', contact: 'Discuss your project', title: 'Project photo'}
  }[lang] || {open: 'Enlarge project photo', close: 'Close', contact: 'Discuss your project', title: 'Project photo'};
  const photos = document.querySelectorAll('.project-grid figure img, .portfolio-grid figure img, .technician-project-grid figure img, .craft-media > img, .home-check-report-media img, .dining-showcase-media > img');
  if (photos.length && typeof HTMLDialogElement !== 'undefined' && HTMLDialogElement.prototype.showModal) {
    const dialog = document.createElement('dialog');
    dialog.className = 'project-viewer';
    dialog.setAttribute('aria-labelledby', 'project-viewer-title');
    dialog.innerHTML = '<button class="project-viewer-close" type="button"></button><img class="project-viewer-image" alt=""><div class="project-viewer-caption"><h2 id="project-viewer-title"></h2><p></p></div>';
    document.body.appendChild(dialog);
    const close = dialog.querySelector('button');
    close.textContent = copy.close + ' ×';
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    let opener;
    dialog.addEventListener('close', () => opener?.focus({preventScroll: true}));
    photos.forEach(photo => {
      if (photo.matches('.home-check-report-media > img')) {
        const frame = document.createElement('div');
        frame.className = 'home-check-photo-frame';
        photo.before(frame);
        frame.appendChild(photo);
      }
      photo.tabIndex = 0;
      photo.setAttribute('role', 'button');
      photo.setAttribute('aria-haspopup', 'dialog');
      photo.setAttribute('aria-label', copy.open + ': ' + photo.alt);
      photo.classList.add('project-photo-trigger');
      const open = () => {
        opener = photo;
        const caption = photo.closest('figure')?.querySelector('figcaption');
        const craft = photo.closest('.craft-feature')?.querySelector('.craft-copy');
        const report = photo.closest('.home-check-report')?.querySelector('.home-check-report-copy');
        const dining = photo.closest('.dining-showcase')?.querySelector('.dining-showcase-copy');
        const image = dialog.querySelector('img');
        image.src = photo.src;
        image.alt = photo.alt;
        dialog.querySelector('h2').textContent = caption?.querySelector('strong')?.textContent || craft?.querySelector('h2')?.textContent || dining?.querySelector('h2')?.textContent || photo.alt || copy.title;
        const description = caption?.querySelector('p')?.textContent || caption?.querySelector('span')?.textContent || craft?.querySelector('p:last-child')?.textContent || report?.querySelector('p:not(.eyebrow)')?.textContent || dining?.querySelector('p')?.textContent || '';
        const paragraph = dialog.querySelector('p');
        paragraph.textContent = description;
        paragraph.hidden = !description;
        dialog.showModal();
      };
      photo.addEventListener('click', open);
      photo.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {event.preventDefault(); open();}
      });
    });
  }
  if (!('IntersectionObserver' in window)) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sections = [...document.querySelectorAll('main > .section, main > .about-band')];
  const reveal = new IntersectionObserver(records => {
    records.forEach(record => {
      if (record.isIntersecting) {
        record.target.classList.remove('section-awaiting');
        reveal.unobserve(record.target);
      }
    });
  }, {rootMargin: '0px 0px -24px 0px', threshold: 0});
  if (!motion.matches) sections.forEach(section => {
    if (section.getBoundingClientRect().top < window.innerHeight) return;
    section.classList.add('section-reveal', 'section-awaiting');
    reveal.observe(section);
  });
  sections.forEach(section => section.addEventListener("focusin", () => {
    section.classList.remove("section-awaiting");
    reveal.unobserve(section);
  }));
  motion.addEventListener('change', () => {
    if (motion.matches) {
      reveal.disconnect();
      sections.forEach(section => section.classList.remove('section-awaiting'));
    }
  });

})();
