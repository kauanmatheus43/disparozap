(() => {
  "use strict";
  const KEY = "disparozap_mvp_v1";
  const $ = (id) => document.getElementById(id);
  const today = () => new Date().toISOString().slice(0,10);
  const uid = () => (crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
  const escapeHTML = (s="") => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  let state = loadState();
  function blankState(){ return {contacts:[],products:[],campaigns:[],history:[]}; }
  function loadState(){ try { const v=JSON.parse(localStorage.getItem(KEY)); return v && typeof v==="object" ? {...blankState(),...v} : blankState(); } catch { return blankState(); } }
  function save(){ localStorage.setItem(KEY, JSON.stringify(state)); renderAll(); }
  function log(title, detail){ state.history.unshift({id:uid(),title,detail,time:new Date().toISOString()}); state.history=state.history.slice(0,150); }
  function toast(msg){ const el=$("toast"); el.textContent=msg; el.classList.add("show"); clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove("show"),2600); }
  function showDialog(id){ const d=$(id); if(d.showModal) d.showModal(); else d.setAttribute("open",""); }
  function closeDialog(id){ const d=$(id); if(d.close) d.close(); else d.removeAttribute("open"); }
  function normalizePhone(v){ return String(v||"").trim().replace(/[^\d+]/g,""); }
  function validUrl(v){ try { const u=new URL(v); return u.protocol==="https:" || u.protocol==="http:"; } catch { return false; } }
  function fmtDate(v){ if(!v) return "—"; const d=new Date(v.length===10?v+"T12:00:00":v); return isNaN(d)? "—":d.toLocaleDateString("pt-BR"); }
  function fmtTime(v){ const d=new Date(v); return isNaN(d)?"":d.toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}); }
  function money(v){ if(v===null||v===undefined||v==="") return ""; const n=Number(String(v).replace(/\./g,"").replace(",",".")); return Number.isFinite(n)?n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"}):String(v); }
  function eligibleContacts(){ return state.contacts.filter(c=>c.consent && !c.optedOut); }
  function activePage(name){ document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id==="page-"+name)); document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===name)); const names={dashboard:"Dashboard",contacts:"Contatos",products:"Produtos",campaigns:"Campanhas",history:"Histórico"}; const eyebrows={dashboard:"VISÃO GERAL",contacts:"SUA AUDIÊNCIA",products:"CATÁLOGO DE OFERTAS",campaigns:"COMUNICAÇÃO",history:"REGISTRO DE ATIVIDADES"}; $("pageTitle").textContent=names[name]||"Dashboard"; $("eyebrow").textContent=eyebrows[name]||"DISPAROZAP"; document.querySelector(".sidebar").classList.remove("open"); window.scrollTo({top:0,behavior:"smooth"}); }
  function renderStats(){ $("statContacts").textContent=state.contacts.length; $("statConsented").textContent=eligibleContacts().length+" com consentimento ativo"; $("statProducts").textContent=state.products.length; $("statCampaigns").textContent=state.campaigns.length; $("statOptouts").textContent=state.contacts.filter(c=>c.optedOut).length; $("eligibleCount").textContent=eligibleContacts().length; }
  function renderContacts(){
    const q=$("contactSearch").value.toLowerCase().trim(), filter=$("contactFilter").value;
    const items=state.contacts.filter(c=>(!q||(c.name+" "+c.phone).toLowerCase().includes(q))&&(filter==="all"||(filter==="active"&&c.consent&&!c.optedOut)||(filter==="optout"&&c.optedOut)||(filter==="pending"&&!c.consent&&!c.optedOut)));
    $("contactsTable").innerHTML=items.map(c=>{let status=c.optedOut?'<span class="tag tag-red">Descadastrado</span>':c.consent?'<span class="tag tag-green">Ativo</span>':'<span class="tag tag-amber">Pendente</span>'; let actions=`<button class="table-action" data-edit-contact="${c.id}">Editar</button>`; if(!c.optedOut) actions+=`<button class="table-action danger" data-optout="${c.id}">Descadastrar</button>`; else actions+=`<button class="table-action" data-reactivate="${c.id}">Reativar*</button>`; return `<tr><td><span class="contact-name">${escapeHTML(c.name)}</span><span class="subline">${escapeHTML(c.source||"")}</span></td><td>${escapeHTML(c.phone)}</td><td>${status}</td><td>${fmtDate(c.consentDate)}</td><td>${actions}</td></tr>`;}).join("");
    $("contactsEmpty").style.display=items.length?"none":"flex";
  }
  function renderProducts(){
    const q=$("productSearch").value.toLowerCase().trim(), f=$("productFilter").value;
    const items=state.products.filter(p=>(!q||(p.name+" "+p.category).toLowerCase().includes(q))&&(f==="all"||p.platform===f));
    $("productsGrid").innerHTML=items.map(p=>`<article class="product-card"><div class="product-image">${p.image&&validUrl(p.image)?`<img src="${escapeHTML(p.image)}" alt="" loading="lazy" onerror="this.parentElement.textContent='◇'">`:"◇"}</div><div class="product-body"><span class="tag ${p.platform==="Shopee"?"tag-amber":"tag-green"}">${escapeHTML(p.platform)}</span><h3>${escapeHTML(p.name)}</h3>${p.category?`<p>${escapeHTML(p.category)}</p>`:""}<div class="product-price">${escapeHTML(money(p.price)||"Preço não informado")}</div><p>${escapeHTML(p.description||"")}</p><div class="product-meta"><small class="muted">Link cadastrado</small><a class="table-action" href="${escapeHTML(p.link)}" target="_blank" rel="noopener noreferrer">Abrir ↗</a></div><div class="product-actions"><button class="secondary" data-edit-product="${p.id}">Editar</button><button class="secondary" data-delete-product="${p.id}">Excluir</button></div></div></article>`).join("");
    $("productsEmpty").style.display=items.length?"none":"flex";
    $("campaignProduct").innerHTML='<option value="">Sem produto vinculado</option>'+state.products.map(p=>`<option value="${p.id}">${escapeHTML(p.name)} · ${escapeHTML(p.platform)}</option>`).join("");
  }
  function renderCampaigns(){
    $("campaignList").innerHTML=state.campaigns.map(c=>`<div class="campaign-row"><div class="campaign-row-main"><b>${escapeHTML(c.name)}</b><small>${fmtTime(c.createdAt)} · ${c.audienceCount} contatos elegíveis na criação · Rascunho local</small></div><span class="tag tag-muted">RASCUNHO</span><button class="secondary" data-load-campaign="${c.id}">Abrir</button><button class="table-action danger" data-delete-campaign="${c.id}">Excluir</button></div>`).join("");
    $("campaignsEmpty").style.display=state.campaigns.length?"none":"flex";
  }
  function renderHistory(){
    $("historyList").innerHTML=state.history.map(h=>`<div class="history-item"><div class="history-icon">◷</div><div class="history-content"><b>${escapeHTML(h.title)}</b><p>${escapeHTML(h.detail||"")}</p></div><div class="history-time">${fmtTime(h.time)}</div></div>`).join("");
    $("historyEmpty").style.display=state.history.length?"none":"flex";
    $("recentActivity").innerHTML=state.history.slice(0,4).map(h=>`<div class="history-item"><div class="history-icon">✓</div><div class="history-content"><b>${escapeHTML(h.title)}</b><p>${escapeHTML(h.detail||"")}</p></div></div>`).join("")||'<div class="empty-state compact"><span class="empty-icon">◷</span><b>Nenhuma atividade ainda</b><small>Suas ações aparecerão aqui.</small></div>';
  }
  function renderAll(){ renderStats(); renderContacts(); renderProducts(); renderCampaigns(); renderHistory(); updateCampaignPreview(); }
  function updateCampaignPreview(){
    const msg=$("campaignMessage").value||"Sua mensagem aparecerá aqui.";
    const p=state.products.find(x=>x.id===$("campaignProduct").value);
    const rendered=msg.replaceAll("{{nome}}","Maria").replaceAll("{{link}}",p?p.link:"https://seu-link-aqui.example");
    $("campaignPreview").textContent=rendered; $("charCount").textContent=$("campaignMessage").value.length+"/2000";
    $("eligibleCount").textContent=$("campaignAudience").value==="manual"?"A revisar":eligibleContacts().length;
  }
  function resetContactForm(){ $("contactForm").reset(); $("contactId").value=""; $("contactConsentDate").value=today(); $("contactDialogTitle").textContent="Novo contato"; }
  function editContact(id){ const c=state.contacts.find(x=>x.id===id); if(!c)return; resetContactForm(); $("contactDialogTitle").textContent="Editar contato"; $("contactId").value=c.id; $("contactName").value=c.name; $("contactPhone").value=c.phone; $("contactSource").value=c.source||"Outro"; $("contactConsent").checked=!!c.consent; $("contactConsentDate").value=c.consentDate||""; $("contactNotes").value=c.notes||""; showDialog("contactDialog"); }
  function resetProductForm(){ $("productForm").reset(); $("productId").value=""; $("productDialogTitle").textContent="Novo produto"; }
  function editProduct(id){ const p=state.products.find(x=>x.id===id); if(!p)return; resetProductForm(); $("productDialogTitle").textContent="Editar produto"; $("productId").value=p.id; $("productName").value=p.name; $("productPlatform").value=p.platform; $("productPrice").value=p.price||""; $("productCategory").value=p.category||""; $("productLink").value=p.link; $("productImage").value=p.image||""; $("productDescription").value=p.description||""; showDialog("productDialog"); }
  function csvCell(s){ return '"'+String(s??"").replace(/"/g,'""')+'"'; }
  function download(name, content, type="text/csv;charset=utf-8;"){ const blob=new Blob(["\ufeff",content],{type}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000); }
  function exportContacts(){ const rows=[["nome","telefone","consentimento","descadastrado","data_consentimento","origem","observacoes"],...state.contacts.map(c=>[c.name,c.phone,c.consent?"sim":"não",c.optedOut?"sim":"não",c.consentDate,c.source,c.notes])]; download("disparozap-contatos.csv",rows.map(r=>r.map(csvCell).join(";")).join("\n")); toast("CSV de contatos exportado."); }
  function parseCSVLine(line, delimiter){
    const out=[]; let value="", quoted=false;
    for(let i=0;i<line.length;i++){ const ch=line[i]; if(ch==='"' && quoted && line[i+1]==='"'){value+='"';i++;} else if(ch==='"'){quoted=!quoted;} else if(ch===delimiter && !quoted){out.push(value.trim());value="";} else {value+=ch;} }
    out.push(value.trim()); return out;
  }
  function importContactsFile(file){
    const reader=new FileReader();
    reader.onload=()=>{
      try{
        const raw=String(reader.result||"").replace(/^\uFEFF/,"");
        const lines=raw.split(/\r?\n/).filter(line=>line.trim());
        if(lines.length<2){toast("O CSV não tem linhas de contatos.");return;}
        const delimiter=(lines[0].split(";").length>=lines[0].split(",").length)?";":",";
        const headers=parseCSVLine(lines[0],delimiter).map(x=>x.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,""));
        const col=(...names)=>headers.findIndex(h=>names.includes(h));
        const nameI=col("nome","name"), phoneI=col("telefone","phone","numero","numero de telefone");
        const consentI=col("consentimento","consent","autorizacao","autorizacao confirmada");
        const optoutI=col("descadastrado","optedout","opt_out","bloqueado");
        const dateI=col("data_consentimento","consentdate","data da autorizacao");
        const sourceI=col("origem","source"), notesI=col("observacoes","notas","notes");
        if(nameI<0||phoneI<0){toast("CSV precisa ter colunas nome e telefone.");return;}
        let added=0, skipped=0;
        for(const line of lines.slice(1)){
          const cells=parseCSVLine(line,delimiter), name=(cells[nameI]||"").trim(), phone=normalizePhone(cells[phoneI]||"");
          if(!name||phone.replace(/\D/g,"").length<8||state.contacts.some(c=>c.phone===phone)){skipped++;continue;}
          const yes=v=>["sim","s","yes","true","1","autorizado","ativa","ativo"].includes(String(v||"").trim().toLowerCase());
          const consent=consentI>=0&&yes(cells[consentI]);
          const optedOut=optoutI>=0&&yes(cells[optoutI]);
          state.contacts.push({id:uid(),name,phone,consent:consent&&!optedOut,consentDate:consent&&!optedOut?(dateI>=0?cells[dateI]||today():today()):"",optedOut,source:sourceI>=0?cells[sourceI]||"Importação CSV":"Importação CSV",notes:notesI>=0?cells[notesI]||"": "",createdAt:new Date().toISOString()});
          added++;
        }
        log("Contatos importados",added+" adicionados; "+skipped+" ignorados por dados inválidos ou duplicados"); save(); toast("Importação concluída: "+added+" adicionados, "+skipped+" ignorados.");
      }catch(err){toast("Não foi possível ler esse CSV.");}
    };
    reader.readAsText(file,"UTF-8");
  }
  function fillCampaign(c){ $("campaignName").value=c.name; $("campaignProduct").value=c.productId||""; $("campaignAudience").value=c.audience||"all"; $("campaignMessage").value=c.message; updateCampaignPreview(); activePage("campaigns"); toast("Rascunho carregado para revisão."); }
  document.querySelectorAll("[data-page]").forEach(b=>b.addEventListener("click",()=>activePage(b.dataset.page)));
  document.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>activePage(b.dataset.goto)));
  $("mobileMenu").addEventListener("click",()=>document.querySelector(".sidebar").classList.toggle("open"));
  $("addContactBtn").addEventListener("click",()=>{resetContactForm();showDialog("contactDialog")});
  $("emptyAddContact").addEventListener("click",()=>{resetContactForm();showDialog("contactDialog")});
  $("contactForm").addEventListener("submit",e=>{
    e.preventDefault(); const id=$("contactId").value, phone=normalizePhone($("contactPhone").value);
    if(phone.replace(/\D/g,"").length<8){toast("Confira o número de telefone.");return;}
    const duplicate=state.contacts.find(c=>c.phone===phone&&c.id!==id); if(duplicate){toast("Este telefone já está cadastrado.");return;}
    const previous=state.contacts.find(c=>c.id===id);
    const consent=$("contactConsent").checked;
    const contact={id:id||uid(),name:$("contactName").value.trim(),phone,source:$("contactSource").value,consent:consent,consentDate:consent?($("contactConsentDate").value||today()):"",notes:$("contactNotes").value.trim(),optedOut:previous?!!previous.optedOut:false,createdAt:previous?.createdAt||new Date().toISOString()};
    if(previous){state.contacts=state.contacts.map(c=>c.id===id?contact:c);log("Contato atualizado",contact.name+" · "+contact.phone);}else{state.contacts.push(contact);log("Contato cadastrado",contact.name+" · "+(consent?"consentimento registrado":"aguardando consentimento"));}
    save();closeDialog("contactDialog");toast("Contato salvo.");
  });
  $("contactSearch").addEventListener("input",renderContacts); $("contactFilter").addEventListener("change",renderContacts);
  $("exportContactsBtn").addEventListener("click",exportContacts);
  $("importContactsBtn").addEventListener("click",()=>$("importContactsFile").click());
  $("importContactsFile").addEventListener("change",e=>{const file=e.target.files&&e.target.files[0];if(file)importContactsFile(file);e.target.value="";});
  $("addProductBtn").addEventListener("click",()=>{resetProductForm();showDialog("productDialog")});
  $("emptyAddProduct").addEventListener("click",()=>{resetProductForm();showDialog("productDialog")});
  $("productForm").addEventListener("submit",e=>{
    e.preventDefault();const id=$("productId").value,link=$("productLink").value.trim(),image=$("productImage").value.trim();
    if(!validUrl(link)|| (image&&!validUrl(image))){toast("Use links válidos começando com http:// ou https://.");return;}
    const previous=state.products.find(p=>p.id===id);
    const price=$("productPrice").value.trim();
    const product={id:id||uid(),name:$("productName").value.trim(),platform:$("productPlatform").value,price,category:$("productCategory").value.trim(),link,image,description:$("productDescription").value.trim(),createdAt:previous?.createdAt||new Date().toISOString()};
    if(previous){state.products=state.products.map(p=>p.id===id?product:p);log("Produto atualizado",product.name);}else{state.products.push(product);log("Produto cadastrado",product.name+" · "+product.platform);}
    save();closeDialog("productDialog");toast("Produto salvo.");
  });
  $("productSearch").addEventListener("input",renderProducts); $("productFilter").addEventListener("change",renderProducts);
  $("campaignMessage").addEventListener("input",updateCampaignPreview); $("campaignProduct").addEventListener("change",updateCampaignPreview); $("campaignAudience").addEventListener("change",updateCampaignPreview);
  $("previewCampaignBtn").addEventListener("click",()=>{const msg=$("campaignMessage").value||"Escreva uma mensagem para visualizar.";const p=state.products.find(x=>x.id===$("campaignProduct").value);$("fullPreview").textContent=msg.replaceAll("{{nome}}","Maria").replaceAll("{{link}}",p?p.link:"https://seu-link-aqui.example");showDialog("previewDialog");});
  $("campaignForm").addEventListener("submit",e=>{
    e.preventDefault();const name=$("campaignName").value.trim(),message=$("campaignMessage").value.trim();if(!name||!message){toast("Preencha o nome e a mensagem.");return;}
    const p=state.products.find(x=>x.id===$("campaignProduct").value);
    const campaign={id:uid(),name,productId:p?.id||"",audience:$("campaignAudience").value,message,createdAt:new Date().toISOString(),audienceCount:eligibleContacts().length,status:"Rascunho local"};
    state.campaigns.unshift(campaign);log("Campanha salva como rascunho",name+" · nenhum envio realizado");save();$("campaignForm").reset();updateCampaignPreview();toast("Rascunho salvo. Nenhuma mensagem foi enviada.");
  });
  $("clearHistoryBtn").addEventListener("click",()=>{if(confirm("Limpar todo o histórico local?")){state.history=[];save();toast("Histórico limpo.");}});
  document.addEventListener("click",e=>{
    const t=e.target.closest("button");if(!t)return;
    if(t.dataset.close){closeDialog(t.dataset.close);return;}
    if(t.dataset.editContact){editContact(t.dataset.editContact);return;}
    if(t.dataset.optout){const c=state.contacts.find(x=>x.id===t.dataset.optout);if(c&&confirm("Descadastrar "+c.name+"? O contato será bloqueado para futuras campanhas neste painel.")){c.optedOut=true;c.consent=false;log("Contato descadastrado",c.name+" · bloqueado para campanhas");save();toast("Contato descadastrado.");}return;}
    if(t.dataset.reactivate){const c=state.contacts.find(x=>x.id===t.dataset.reactivate);if(c&&confirm("Só reative se a pessoa der uma nova autorização explícita. Continuar?")){c.optedOut=false;c.consent=false;c.consentDate="";log("Bloqueio removido; consentimento pendente",c.name+" · nova autorização ainda necessária");save();toast("Contato pendente de nova autorização.");}return;}
    if(t.dataset.editProduct){editProduct(t.dataset.editProduct);return;}
    if(t.dataset.deleteProduct){const p=state.products.find(x=>x.id===t.dataset.deleteProduct);if(p&&confirm("Excluir o produto "+p.name+"?")){state.products=state.products.filter(x=>x.id!==p.id);log("Produto excluído",p.name);save();toast("Produto excluído.");}return;}
    if(t.dataset.loadCampaign){const c=state.campaigns.find(x=>x.id===t.dataset.loadCampaign);if(c)fillCampaign(c);return;}
    if(t.dataset.deleteCampaign){const c=state.campaigns.find(x=>x.id===t.dataset.deleteCampaign);if(c&&confirm("Excluir o rascunho "+c.name+"?")){state.campaigns=state.campaigns.filter(x=>x.id!==c.id);log("Rascunho excluído",c.name);save();toast("Rascunho excluído.");}return;}
  });
  // Optional CSV import, available from keyboard shortcut/button added in UI later if desired.
  // Data is stored in localStorage only; do not store API tokens in this client-side app.
  renderAll();
})();